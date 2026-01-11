import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 🔐 Password check
  const appPassword = req.headers['x-app-password'];
  if (appPassword !== process.env.APP_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { imageBase64 } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'No image provided' });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
You are a nutrition assistant.
Identify visible foods and estimate calories.
Use ranges, not exact values.
Return JSON only.
`,
                },
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Gemini request failed' });
  }
}
