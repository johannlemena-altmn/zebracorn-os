// Proxy d'extraction de titre — l'URL reste la donnée (analyse), le titre
// devient l'affichage. Réponse {title: string|null}, jamais d'erreur bloquante.
export default async function handler(req, res) {
  const { url } = req.query;
  if (!url || !/^https?:\/\//i.test(url)) {
    return res.status(400).json({ error: 'URL invalide' });
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600');
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 6000);
    const r = await fetch(url, {
      redirect: 'follow',
      signal: ctl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ZebracornOS/0.3)', 'Accept': 'text/html' },
    });
    clearTimeout(timer);
    const html = (await r.text()).slice(0, 150000);
    const m = html.match(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:title["']/i)
      || html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const decode = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&nbsp;/g, ' ');
    const title = m ? decode(m[1]).replace(/\s+/g, ' ').trim().slice(0, 140) : null;
    return res.status(200).json({ title: title || null });
  } catch (e) {
    return res.status(200).json({ title: null });
  }
}
