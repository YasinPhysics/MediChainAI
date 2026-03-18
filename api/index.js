// api/index.js
// AI Doctor Advice API Handler

export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const { records, currentReading, currentDisease, userMessage } = req.body;

  // Basic validation
  if (!records || !Array.isArray(records)) {
    return res.status(400).json({ error: 'Missing or invalid records array' });
  }

  try {
    // Build the prompt for Groq
    const prompt = `
You are a helpful AI Doctor assistant. Analyze the patient's health records below and give simple, practical, and cautious advice.

Important Rules:
- Always remind: "This is general advice only. Please consult a real doctor."
- Do NOT suggest any specific medicine or treatment.
- Keep the response in simple, friendly Bengali language.
- Answer in 4 to 6 lines maximum.

Records:
${records.map(r => 
  `- ${r.encryptedData} (${new Date(Number(r.timestamp) * 1000).toLocaleString()})`
).join('\n')}

${currentReading ? `Current Reading: ${currentReading}` : ''}
${currentDisease ? `Current Disease: ${currentDisease}` : ''}

User's request: ${userMessage || "Give me general advice based on these records."}
`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 350
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API Error:", errorText);
      throw new Error(`Groq API failed with status ${response.status}`);
    }

    const data = await response.json();
    const advice = data.choices[0]?.message?.content?.trim();

    if (!advice) {
      throw new Error("No advice received from AI");
    }

    return res.status(200).json({ advice });

  } catch (error) {
    console.error("AI Advice API Error:", error.message);
    
    return res.status(500).json({ 
      error: 'Failed to get AI advice. Please try again later.',
      details: error.message 
    });
  }
}
