export default async function handler(req, res) {
  const { url } = req.query;
  if (!url || !url.startsWith('https://calendar.google.com/calendar/ical/')) {
    return res.status(400).json({ error: 'URL iCal invalide — doit commencer par https://calendar.google.com/calendar/ical/' });
  }
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const text = await r.text();
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    res.status(200).send(text);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
