export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, model } = req.body;
  const apiKey = process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  if (!prompt || !model) {
    return res.status(400).json({ error: 'Missing prompt or model' });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 500 }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json(error);
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0].content.parts[0].text) {
      return res.status(200).json({
        text: data.candidates[0].content.parts[0].text
      });
    }

    return res.status(400).json({ error: 'Invalid response from Gemini' });
  } catch (error) {
    console.error('Gemini API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
