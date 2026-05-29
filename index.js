require("dotenv").config();

const express = require("express");
const { processLead } = require("./agents/leadAgent");
const { saveLead } = require("./integrations/notion");
const { addSubscriber } = require("./integrations/mailerlite");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "The Label AI Lead Agent is running" });
});

// Make.com webhook entry point
app.post("/webhook/lead", async (req, res) => {
  const { name, email, source, message } = req.body;

  // Validate required fields
  if (!name || !email || !source || !message) {
    return res.status(400).json({
      error: "Missing required fields: name, email, source, message",
    });
  }

  try {
    const lead = { name, email, source, message };

    // Step 1: Claude classifies the lead and writes a reply
    console.log(`Processing lead from ${email}...`);
    const { classification, reply } = await processLead(lead);
    console.log(`Classification: ${classification}`);

    // Step 2: Save everything to Notion CRM
    await saveLead(lead, classification, reply);
    console.log(`Saved to Notion`);

    // Step 3: Add hot/warm leads to MailerLite nurture sequence
    if (classification === "hot" || classification === "warm") {
      await addSubscriber(lead, classification);
      console.log(`Added to MailerLite`);
    }

    // Step 4: Return result to Make.com
    return res.status(200).json({ classification, reply });
  } catch (err) {
    console.error("Lead processing error:", err.message);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Lead agent running on http://localhost:${PORT}`);
});
