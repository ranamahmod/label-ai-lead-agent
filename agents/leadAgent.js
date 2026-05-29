const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Classifies a lead and generates a personalized first reply.
 * @param {Object} lead - { name, email, source, message }
 * @returns {Object} - { classification, reply }
 */
async function processLead(lead) {
  const { name, email, source, message } = lead;

  const prompt = `You are a lead qualification specialist for "The Label - AI Studios", a Philippine-based AI creative studio offering AI-powered branding, content, and automation services.

A new lead has come in:
- Name: ${name}
- Email: ${email}
- Source: ${source}
- Message: "${message}"

Your tasks:
1. Classify this lead as exactly one of: hot, warm, or cold
   - hot: clear intent to buy, mentions budget, urgent need, or ready to start
   - warm: interested but exploring, asks questions, no clear timeline
   - cold: vague, just browsing, no real intent

2. Write a short, friendly, personalized first-reply email (3-5 sentences) in a warm Filipino-professional tone. Sign off as "The Label - AI Studios Team".

Respond in this exact JSON format:
{
  "classification": "hot" | "warm" | "cold",
  "reply": "your personalized reply here"
}`;

  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 512,
  });

  const text = response.choices[0].message.content.trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Groq did not return valid JSON");

  return JSON.parse(jsonMatch[0]);
}

module.exports = { processLead };
