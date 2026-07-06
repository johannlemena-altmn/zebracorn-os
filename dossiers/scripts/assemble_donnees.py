#!/usr/bin/env python3
"""Assemblage du panel « prix hédonique urbain ICU » (protocole 03, pilote 75/92/93/94).

Produit data/processed/panel.parquet : une ligne par mutation mono-bien, avec
attributs structurels (DVF, BDNB), exposition (LCZ, PPRI, RGA, bruit) et clés
d'effets fixes (section cadastrale x annee).

Usage :
    python3 assemble_donnees.py --stages dvf            # télécharge + filtre DVF
    python3 assemble_donnees.py --stages dvf,bdnb,expo,panel
    python3 assemble_donnees.py                          # tout

Dépendances : pandas, geopandas, shapely, pyarrow, requests.

Sources et préparation manuelle (une fois) :
  * DVF géolocalisé (Etalab)  : téléchargé automatiquement par le script.
      https://files.data.gouv.fr/geo-dvf/latest/csv/{annee}/departements/{dep}.csv.gz
  * BDNB (CSTB, licence ouverte) : déposer l'export départemental (GeoPackage)
      dans data/raw/bdnb/bdnb_{dep}.gpkg (téléchargement manuel : data.gouv.fr,
      jeu « Base de données nationale des bâtiments », export par département).
      Tables utilisées : batiment_groupe (+ champs DPE / période de construction)
      et la table de relation bâtiment <-> parcelle.
  * LCZ (Cerema, zones climatiques locales) : déposer le GeoPackage de
      l'agglomération parisienne dans data/raw/lcz/lcz_paris.gpkg
      (data.gouv.fr, jeu « Cartographie des zones climatiques locales »).
  * PPRI (Géorisques) : déposer les zonages réglementaires inondation
      (shapefile/gpkg export Géorisques) dans data/raw/ppri/.
  * RGA (Géorisques, aléa retrait-gonflement des argiles) : carte d'aléa
      nationale dans data/raw/rga/ (export Géorisques « AleaRG »).
  * Bruit (optionnel, cartes stratégiques Lden, ex. Bruitparif) :
      data/raw/bruit/lden.gpkg.

Le script vérifie la présence de chaque brique et dit exactement quoi déposer où
si elle manque : il ne plante pas en silence. Les filtres de la section 5 du
protocole sont implémentés ici et NE DOIVENT PAS être modifiés après ouverture
des données sans consigner l'écart (protocole, section 9).
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import pandas as pd

# ── Périmètre figé (protocole, section 2) ────────────────────────────────────
DEPS = ["75", "92", "93", "94"]
ANNEES = list(range(2018, 2026))          # millésimes DVF demandés
DVF_URL = "https://files.data.gouv.fr/geo-dvf/latest/csv/{annee}/departements/{dep}.csv.gz"

RACINE = Path(__file__).resolve().parent
RAW = RACINE / "data" / "raw"
OUT = RACINE / "data" / "processed"

# LCZ « minéral » vs « végétalisé » (protocole, section 4)
LCZ_MINERAL = {"1", "2", "3", "8", "10", "E"}
LCZ_VEGETAL = {"6", "9", "A", "B", "D", "G"}


def _manque(chemin: Path, message: str) -> bool:
    if chemin.exists():
        return False
    print(f"[MANQUANT] {chemin}\n           -> {message}")
    return True


# ── Étape 1 : DVF ────────────────────────────────────────────────────────────

def stage_dvf() -> pd.DataFrame:
    """Télécharge (avec cache) puis filtre DVF géolocalisé, et reconstitue les
    mutations mono-bien. Retourne un DataFrame une ligne = une mutation."""
    import requests

    cache = RAW / "dvf"
    cache.mkdir(parents=True, exist_ok=True)
    morceaux = []
    for annee in ANNEES:
        for dep in DEPS:
            f = cache / f"dvf_{annee}_{dep}.csv.gz"
            if not f.exists():
                url = DVF_URL.format(annee=annee, dep=dep)
                print(f"[DVF] télécharge {url}")
                r = requests.get(url, timeout=120)
                if r.status_code != 200:
                    # millésime pas encore publié : on le note et on continue
                    print(f"[DVF] {annee}/{dep} indisponible (HTTP {r.status_code}), ignoré")
                    continue
                f.write_bytes(r.content)
            morceaux.append(pd.read_csv(f, compression="gzip", low_memory=False,
                                        dtype={"code_commune": str, "id_parcelle": str}))
    if not morceaux:
        sys.exit("[DVF] aucune donnée : vérifier la connexion ou les millésimes.")
    dvf = pd.concat(morceaux, ignore_index=True)
    print(f"[DVF] {len(dvf):,} lignes brutes")

    # Filtres figés (protocole, section 5)
    dvf = dvf[dvf["nature_mutation"] == "Vente"]
    dvf = dvf[dvf["type_local"].isin(["Maison", "Appartement"])]

    # Reconstitution mutation : une mutation = id_mutation ; on garde les
    # mutations dont toutes les lignes « local » sont homogènes (mono-bien),
    # dépendances (garages, caves) tolérées car non typées Maison/Appartement.
    g = dvf.groupby("id_mutation")
    n_locaux = g["type_local"].transform("size")
    dvf = dvf[n_locaux == 1].copy()

    dvf["annee"] = pd.to_datetime(dvf["date_mutation"]).dt.year
    dvf["trimestre"] = pd.to_datetime(dvf["date_mutation"]).dt.to_period("Q").astype(str)
    dvf["section"] = dvf["id_parcelle"].str[:10]      # commune+prefixe+section

    dvf = dvf[(dvf["surface_reelle_bati"] >= 9) & (dvf["surface_reelle_bati"] <= 300)]
    dvf = dvf[dvf["valeur_fonciere"] > 0]
    dvf["prix_m2"] = dvf["valeur_fonciere"] / dvf["surface_reelle_bati"]

    # Ébarbage percentiles 0,5-99,5 du prix/m² par departement x annee
    dvf["dep"] = dvf["code_commune"].str[:2]
    def _ebarbe(bloc: pd.DataFrame) -> pd.DataFrame:
        lo, hi = bloc["prix_m2"].quantile([0.005, 0.995])
        return bloc[(bloc["prix_m2"] >= lo) & (bloc["prix_m2"] <= hi)]
    dvf = dvf.groupby(["dep", "annee"], group_keys=False).apply(_ebarbe)

    print(f"[DVF] {len(dvf):,} mutations après filtres figés")
    OUT.mkdir(parents=True, exist_ok=True)
    dvf.to_parquet(OUT / "dvf_filtre.parquet", index=False)
    return dvf


# ── Étape 2 : BDNB ───────────────────────────────────────────────────────────

def stage_bdnb() -> pd.DataFrame | None:
    """Jointure parcelle -> attributs bâtiment (DPE, période de construction).
    Retourne un DataFrame id_parcelle -> attributs, ou None si BDNB absente."""
    import geopandas as gpd

    dossier = RAW / "bdnb"
    if _manque(dossier, "déposer bdnb_{dep}.gpkg (export départemental data.gouv.fr)"):
        return None
    morceaux = []
    for dep in DEPS:
        f = dossier / f"bdnb_{dep}.gpkg"
        if _manque(f, f"export BDNB du département {dep}"):
            continue
        # Les noms de couches varient selon les millésimes BDNB : on liste et
        # on cherche la table bâtiment groupé + la relation parcelle.
        couches = gpd.list_layers(f)["name"].tolist()
        print(f"[BDNB] {f.name} couches : {couches[:8]}{'…' if len(couches) > 8 else ''}")
        nom_bat = next((c for c in couches if "batiment_groupe" in c and "rel" not in c), None)
        nom_rel = next((c for c in couches if "rel" in c and "parcelle" in c), None)
        if not nom_bat or not nom_rel:
            print(f"[BDNB] couches attendues introuvables dans {f.name} : adapter les noms ci-dessus")
            continue
        bat = gpd.read_file(f, layer=nom_bat, ignore_geometry=True)
        rel = gpd.read_file(f, layer=nom_rel, ignore_geometry=True)
        morceaux.append(rel.merge(bat, on="batiment_groupe_id", how="left"))
    if not morceaux:
        return None
    bdnb = pd.concat(morceaux, ignore_index=True)
    # Colonnes candidates (varient par millésime) : classe DPE représentative,
    # période/année de construction. On normalise vers dpe_classe / periode_constr.
    for cible, candidats in {
        "dpe_classe": ["classe_bilan_dpe", "classe_dpe", "etiquette_dpe"],
        "periode_constr": ["annee_construction", "periode_construction"],
        "id_parcelle": ["parcelle_id", "id_parcelle"],
    }.items():
        src = next((c for c in candidats if c in bdnb.columns), None)
        if src:
            bdnb[cible] = bdnb[src]
    garde = [c for c in ["id_parcelle", "dpe_classe", "periode_constr"] if c in bdnb.columns]
    bdnb = bdnb[garde].drop_duplicates("id_parcelle")
    bdnb.to_parquet(OUT / "bdnb_parcelles.parquet", index=False)
    print(f"[BDNB] {len(bdnb):,} parcelles avec attributs")
    return bdnb


# ── Étape 3 : couches d'exposition (LCZ, PPRI, RGA, bruit) ───────────────────

def stage_expo(dvf: pd.DataFrame) -> pd.DataFrame:
    """Enrichit chaque mutation géolocalisée par jointure spatiale point-dans-
    polygone : classe LCZ, zonage PPRI (+ distance signée), aléa RGA, bruit."""
    import geopandas as gpd

    pts = gpd.GeoDataFrame(
        dvf,
        geometry=gpd.points_from_xy(dvf["longitude"], dvf["latitude"]),
        crs="EPSG:4326",
    ).to_crs(2154)  # Lambert-93, distances en mètres

    def _sjoin(chemin: Path, colonnes: dict[str, str], message: str) -> None:
        nonlocal pts
        if _manque(chemin, message):
            for cible in colonnes.values():
                pts[cible] = pd.NA
            return
        couche = gpd.read_file(chemin).to_crs(2154)
        couche = couche[[c for c in colonnes] + ["geometry"]].rename(columns=colonnes)
        pts = gpd.sjoin(pts, couche, how="left", predicate="within").drop(columns="index_right")

    # LCZ : colonne 'lcz' attendue (adapter au champ réel du produit Cerema)
    _sjoin(RAW / "lcz" / "lcz_paris.gpkg", {"lcz": "lcz"},
           "GeoPackage LCZ Cerema de l'agglomération parisienne")
    pts["icu_mineral"] = pts["lcz"].astype("string").map(
        lambda v: 1 if v in LCZ_MINERAL else (0 if v in LCZ_VEGETAL else pd.NA)
    )

    # PPRI : zonage réglementaire + distance signée à la frontière (S3b)
    f_ppri = RAW / "ppri" / "zonage_ppri.gpkg"
    if not _manque(f_ppri, "zonages réglementaires PPRI (export Géorisques) fusionnés 75/92/93/94"):
        ppri = gpd.read_file(f_ppri).to_crs(2154)
        union = ppri.union_all()
        pts["en_zone_ppri"] = pts.geometry.within(union).astype(int)
        frontiere = union.boundary
        d = pts.geometry.distance(frontiere)
        pts["dist_frontiere_ppri"] = d.where(pts["en_zone_ppri"] == 1, -d)  # signée : + dedans
    else:
        pts["en_zone_ppri"] = pd.NA
        pts["dist_frontiere_ppri"] = pd.NA

    # RGA : aléa argiles (colonne 'alea' du produit Géorisques)
    _sjoin(RAW / "rga" / "alea_rga.gpkg", {"alea": "alea_rga"},
           "carte d'aléa retrait-gonflement des argiles (Géorisques)")

    # Bruit (optionnel) : classes Lden
    _sjoin(RAW / "bruit" / "lden.gpkg", {"lden": "bruit_lden"},
           "carte stratégique de bruit Lden (optionnel, ex. Bruitparif)")

    return pd.DataFrame(pts.drop(columns="geometry"))


# ── Étape 4 : panel final ────────────────────────────────────────────────────

def stage_panel(dvf: pd.DataFrame, bdnb: pd.DataFrame | None) -> None:
    if bdnb is not None:
        dvf = dvf.merge(bdnb, on="id_parcelle", how="left")
        dvf["apparie_bdnb"] = dvf["dpe_classe"].notna().astype(int)
    else:
        dvf["apparie_bdnb"] = 0

    OUT.mkdir(parents=True, exist_ok=True)
    dvf.to_parquet(OUT / "panel.parquet", index=False)

    # Rapport de qualité : à archiver avec le panel (audit du protocole §5)
    print("\n== RAPPORT DE QUALITÉ ==")
    print(f"mutations                : {len(dvf):,}")
    for col, libelle in [("apparie_bdnb", "appariées BDNB"),
                         ("icu_mineral", "avec classe ICU"),
                         ("en_zone_ppri", "avec zonage PPRI renseigné")]:
        if col in dvf.columns:
            n = dvf[col].notna().sum() if col != "apparie_bdnb" else int(dvf[col].sum())
            print(f"{libelle:<25}: {n:,} ({n / max(len(dvf), 1):.1%})")
    print(f"écrit -> {OUT / 'panel.parquet'}")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--stages", default="dvf,bdnb,expo,panel",
                    help="étapes à exécuter, ex. dvf,bdnb,expo,panel")
    stages = set(ap.parse_args().stages.split(","))

    dvf = stage_dvf() if "dvf" in stages else pd.read_parquet(OUT / "dvf_filtre.parquet")
    bdnb = stage_bdnb() if "bdnb" in stages else None
    if "expo" in stages:
        dvf = stage_expo(dvf)
    if "panel" in stages:
        stage_panel(dvf, bdnb)


if __name__ == "__main__":
    main()
