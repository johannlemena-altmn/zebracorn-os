// Proxy d'extraction de titre — l'URL reste la donnée (analyse), le titre
// devient l'affichage. Réponse {title: string|null}, jamais d'erreur bloquante.
export default async function handler(req, res) {
  const { url } = req.query;
  if (!url || !/^https?:\/\//i.test(url)) {
    return res.status(400).json({ error: 'URL invalide' });
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600');
  // Titres de pages de blocage anti-bot / erreur : à ne JAMAIS stocker comme titre.
  // (gallimard.fr → 403 « Request Rejected », Cloudflare → « Just a moment… », etc.)
  const BLOC = /^(request rejected|access denied|attention required|just a moment|pardon our interruption|bot verification|are you (a )?human|please verify you are a human|error \d|forbidden|403 forbidden|404|not found|503 service|verification required|security check|un instant|veuillez patienter)\b/i;
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 6000);
    const r = await fetch(url, {
      redirect: 'follow',
      signal: ctl.signal,
      // UA navigateur réaliste : réduit (sans l'éliminer) les blocages anti-bot.
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      },
    });
    clearTimeout(timer);
    // Page bloquée / en erreur (403, 429, 5xx…) → pas de titre, l'app garde l'URL brute.
    if (!r.ok) return res.status(200).json({ title: null });
    const html = (await r.text()).slice(0, 150000);
    const m = html.match(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:title["']/i)
      || html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const decode = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&nbsp;/g, ' ');
    let title = m ? decode(m[1]).replace(/\s+/g, ' ').trim().slice(0, 140) : null;
    // Certains anti-bots renvoient 200 + une page-blocage : filtrer par le titre.
    if (title && BLOC.test(title)) title = null;
    return res.status(200).json({ title: title || null });
  } catch (e) {
    return res.status(200).json({ title: null });
  }
}
