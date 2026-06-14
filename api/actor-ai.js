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

  const { step, content = '', type, source, compress, notes = '', titre = '', aim = '', dataUrl = '', mimeType = '', settings = {} } = req.body || {};
  const hasImage = /^data:image\//i.test(dataUrl);
  if (!step || (!content && !hasImage)) return res.status(400).json({ error: 'Champs manquants : step, content' });

  // Une capture « lien/vidéo » a pour `content` une URL : on NE navigue pas. Une
  // capture « image/croquis » a pour `content` un nom de fichier et l'image dans
  // `dataUrl` → on joint l'image au Test (Sonnet multimodal). On assemble d'abord le
  // texte réellement disponible (titre riche en hashtags, notes), l'URL en appoint.
  // Le Aim (intention) est tenu À PART : appoint de contexte pour le Compress, et
  // surtout pivot de la question socratique du Test.
  const isUrl = /^https?:\/\//i.test(content.trim());
  const parts = [];
  if (titre && titre.trim() && titre.trim() !== content.trim()) parts.push(`Titre / accroche : ${titre.trim()}`);
  if (notes && notes.trim()) parts.push(`Notes : ${notes.trim()}`);
  if (isUrl) parts.push(`Lien source : ${content.trim()}`);
  else if (!hasImage && content.trim()) parts.push(content.trim());
  const captured = parts.join('\n') || (hasImage ? '(voir image jointe)' : content);
  const aimBlock = aim && aim.trim() ? aim.trim() : '';
  // Vrai « rien d'exploitable » = URL nue, sans titre/notes/contexte ni image.
  const thinSignal = isUrl && !titre.trim() && !notes.trim() && !aimBlock && !hasImage;
  const urlContext = thinSignal
    ? `\n(Le seul signal est l'URL : déduis le thème probable du domaine et de la forme de l'URL, propose une synthèse prudente et invite à ajouter une note. Ne dis jamais « contenu inaccessible ».)`
    : '';

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
Ta tâche : extraire l'essentiel du texte capturé fourni.

RÈGLES IMPORTANTES :
- Tu ne navigues PAS : tu ne peux pas ouvrir d'URL. Travaille UNIQUEMENT avec le texte fourni (titre, accroche, hashtags, auteur, notes, contexte utilisateur).
- Ne réponds JAMAIS que le contenu est « inaccessible » ou « impossible à synthétiser ». Un titre riche en hashtags suffit largement à dégager un thème : sers-t'en.
- Si le signal est mince, produis quand même une synthèse prudente au mieux à partir des indices (thème via les hashtags, posture de l'auteur, type de source).

Produis :
1. Un titre court (5–8 mots max) qui capture la thèse ou l'idée centrale
2. Un résumé en 2–3 phrases qui distille ce qu'il faut retenir

Réponds UNIQUEMENT en JSON valide, sans texte autour, sans markdown :
{"titre":"...","compress":"..."}

Langue : français. Ton : neutre, précis, sans jargon inutile.`,
      user: `Type de capture : ${type || 'note'}
Source : ${source || 'non renseigné'}${urlContext}${aimBlock ? `\nContexte / intention de l'utilisateur : ${aimBlock}` : ''}

Contenu :
${captured.slice(0, 2000)}`,
    },

    test: {
      model: testModel,
      max_tokens: 700,
      temperature: testTemp,
      system: `Tu es un partenaire d'analyse critique pour la méthode ACTOR — étape T (Test).
On te donne une capture qui pointe vers un SUJET : un titre, des hashtags, parfois une image, une synthèse (Compress) et l'intention de l'utilisateur (son « Aim »). Ta mission : produire un FICV utile SUR CE SUJET, pour aiguiser la pensée de l'utilisateur et l'aider à prendre position.

RÈGLES — lis-les, elles sont le cœur du travail :
- Analyse le FOND (le sujet désigné), pas la forme de l'entrée. Mobilise ce que ces concepts/hashtags désignent réellement dans le monde (ex. ce qu'est la permacomptabilité, la RSE…) pour nourrir l'analyse.
- N'écris JAMAIS de méta-commentaire sur l'input : interdit de dire « il n'y a qu'un titre », « pas de contenu », « lien non ouvert », « données indisponibles ». On le sait déjà ; ce n'est pas une analyse.
- Ne critique PAS la synthèse (Compress) de l'utilisateur ni son intention : c'est son matériau de travail, engage-toi avec l'IDÉE, ne l'audite pas.
- N'invente pas de propos précis attribués à un post que tu n'as pas lu : reste au niveau du concept/sujet, pas du contenu exact de la source.

Cadre FICV (distingue bien les niveaux, sans verser dans le méta) :
- faits : ce qui est solidement établi / reconnu SUR LE SUJET (définitions, mécanismes, données admises). Du concret sur le fond, pas sur l'entrée.
- interp : ce que ça suggère, les lectures plausibles, les implications — formulées comme hypothèses.
- croyances : le présupposé sous-jacent qui porte la thèse — celui qui, s'il tombe, la fait tomber.
- valeurs : la ou les valeurs en jeu, le jugement de valeur porté.

Puis UNE question socratique vraiment déstabilisante, sans réponse évidente :
- Si un Aim est fourni : la question RELIE le sujet à cette intention — ce qui devrait être vrai (ou faux) pour que ça serve réellement ce que l'utilisateur cherche.
- Sinon : une question qui challenge la thèse elle-même.

Réponds UNIQUEMENT en JSON valide, sans texte autour, sans markdown :
{"faits":"…","interp":"…","croyances":"…","valeurs":"…","question":"…(phrase interrogative)"}

Langue : français. Direct, précis, 1–2 phrases courtes par champ. La question doit challenger, pas conforter.`,
      user: `${aimBlock ? `Intention de l'utilisateur (Aim) : ${aimBlock}\n\n` : ''}Sujet de la capture :
${captured.slice(0, 2500)}${compress ? `\n\nAngle de l'utilisateur (Compress, à prolonger — pas à critiquer) : ${compress}` : ''}${hasImage ? `\n\n(Une image est jointe ci-dessus — fonde ton analyse sur ce qu'elle montre.)` : ''}`,
    },
  };

  const call = CALLS[step];

  // Message envoyé. Pour le Test d'une capture image, on joint l'image (Sonnet
  // multimodal) pour un FICV fondé sur ce qui est réellement montré. Garde-fou
  // taille : au-delà de ~4,5 Mo de base64 on s'en tient au texte (évite les 413).
  let messages = call ? [{ role: 'user', content: call.user }] : null;
  if (step === 'test' && hasImage && call) {
    const m = dataUrl.match(/^data:(image\/[\w.+-]+);base64,(.+)$/);
    if (m && m[2].length < 6_000_000) {
      messages = [{ role: 'user', content: [
        { type: 'image', source: { type: 'base64', media_type: m[1], data: m[2] } },
        { type: 'text', text: call.user },
      ] }];
    }
  }

  // ── Étape connect : traitement séparé (structure d'entrée différente) ──
  if (step === 'connect') {
    const { current, others } = req.body;
    if (!current?.compress || !current?.own || !Array.isArray(others) || others.length === 0) {
      return res.status(400).json({ error: 'connect: current.{compress,own} et others[] requis' });
    }
    const othersText = others
      .map(o => `[ID:${o.id}] Compress: ${String(o.compress).slice(0, 100)} | Position: ${String(o.own).slice(0, 70)}`)
      .join('\n');
    const connectBody = {
      model: settings.compressModel || 'claude-haiku-4-5-20251001',
      max_tokens: 220,
      temperature: 0.2,
      system: `Tu es un assistant de connexion de connaissances pour un second cerveau (méthode ACTOR).
Parmi une liste de captures, trouve les 3 qui ont la connexion conceptuelle la plus forte avec la capture courante.

Connexion forte = thèmes communs, tension productive, prolongement d'idée, contradiction féconde, ou cadre conceptuel partagé.

Réponds UNIQUEMENT en JSON valide, sans texte autour :
{"connections":[{"id":42,"reason":"tension: autonomie vs contrainte"},{"id":17,"reason":"même cadre: friction calibrée"},{"id":31,"reason":"prolongement: systémique"}]}

3 connexions max, order = force décroissante. reason = 3-5 mots max, en français.`,
      messages: [{
        role: 'user',
        content: `Capture courante :
Compress : ${String(current.compress).slice(0, 200)}
Position : ${String(current.own).slice(0, 150)}

Autres captures :
${othersText}`,
      }],
    };
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify(connectBody),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        return res.status(r.status).json({ error: err.error?.message || `Anthropic HTTP ${r.status}` });
      }
      const data = await r.json();
      const text = data.content?.[0]?.text?.trim() || '';
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return res.status(500).json({ error: 'Parse error', raw: text.slice(0, 200) });
      return res.status(200).json(JSON.parse(match[0]));
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (!call) return res.status(400).json({ error: `Step inconnu : ${step}. Attendu : compress | test | connect` });

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
        messages,
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
