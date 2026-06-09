// Vercel serverless function — Filtre IA pour ACTOR
// Deux étapes : compress (Haiku) et test/FICV (Sonnet)
// Lit ANTHROPIC_API_KEY depuis les variables d'env Vercel (jamais exposée au client)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ error: 'ANTHROPIC_API_KEY non configurée — ajoute-la dans Vercel > Settings > Environment Variables' });

  const { step, content, type, source, compress, settings = {} } = req.body || {};
  if (!step || !content) return res.status(400).json({ error: 'Champs manquants : step, content' });

  const compressModel = settings.compressModel || 'claude-haiku-4-5-20251001';
  const testModel     = settings.testModel     || 'claude-sonnet-4-6';
  const compressTemp  = parseFloat(settings.compressTemp ?? 0.3);
  const testTemp      = parseFloat(settings.testTemp ?? 0.3);

  const CALLS = {
    compress: {
      model: compressModel,
      max_tokens: 300,
      temperature: compressTemp,
      system: `Tu es un assistant de synthèse pour un second cerveau (méthode ACTOR — étape C : Compress).
Ta tâche : extraire l'essentiel d'un contenu capturé.

Produis :
1. Un titre court (5–8 mots max) qui capture la thèse ou l'idée centrale
2. Un résumé en 2–3 phrases qui distille ce qu'il faut retenir

Réponds UNIQUEMENT en JSON valide, sans texte autour, sans markdown :
{"titre":"...","compress":"..."}

Langue : français. Ton : neutre, précis, sans jargon inutile.`,
      user: `Type de capture : ${type || 'note'}
Source : ${source || 'non renseigné'}

Contenu :
${content.slice(0, 2000)}`,
    },

    test: {
      model: testModel,
      max_tokens: 500,
      temperature: testTemp,
      system: `Tu es un assistant d'analyse critique pour la méthode ACTOR — étape T (Think / Test).
Cadre : FICV (Faits / Interprétations / Croyances / Valeurs) + question socratique.

Réponds UNIQUEMENT en JSON valide, sans texte autour, sans markdown :
{
  "faits":"Ce qui est objectivement observable dans ce contenu (1–2 phrases courtes)",
  "interp":"Comment interpréter ces faits — ce que ça suggère (1–2 phrases)",
  "croyances":"Quelle croyance sous-jacente est activée ou challengée (1 phrase)",
  "valeurs":"Quelle(s) valeur(s) est en jeu ici (1 phrase)",
  "question":"La question socratique la plus déstabilisante pour tester cette thèse — sans réponse évidente (1 phrase interrogative)"
}

Langue : français. Sois direct. La question doit vraiment challenger, pas conforter.`,
      user: `Contenu original :
${content.slice(0, 2000)}
${compress ? `\nSynthèse (Compress) :\n${compress}` : ''}`,
    },
  };

  const call = CALLS[step];
  if (!call) return res.status(400).json({ error: `Step inconnu : ${step}. Attendu : compress | test` });

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: call.model,
        max_tokens: call.max_tokens,
        temperature: call.temperature,
        system: call.system,
        messages: [{ role: 'user', content: call.user }],
      }),
    });

    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      return res.status(r.status).json({ error: err.error?.message || `Anthropic HTTP ${r.status}` });
    }

    const data = await r.json();
    const text = data.content?.[0]?.text?.trim() || '';

    // Extrait le JSON — gère JSON brut et JSON enveloppé dans ```json ... ```
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return res.status(500).json({ error: 'Réponse non parseable', raw: text.slice(0, 200) });

    return res.status(200).json(JSON.parse(match[0]));
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
