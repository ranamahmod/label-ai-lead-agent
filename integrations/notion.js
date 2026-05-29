const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

/**
 * Saves a lead to the Notion CRM database.
 * @param {Object} lead - { name, email, source, message }
 * @param {string} classification - hot | warm | cold
 * @param {string} reply - Claude's generated reply
 */
async function saveLead(lead, classification, reply) {
  const { name, email, source, message } = lead;

  await notion.pages.create({
    parent: { database_id: DATABASE_ID },
    properties: {
      Name: {
        title: [{ text: { content: name } }],
      },
      Email: {
        email: email,
      },
      Source: {
        rich_text: [{ text: { content: source } }],
      },
      Message: {
        rich_text: [{ text: { content: message } }],
      },
      Classification: {
        select: { name: classification },
      },
      Reply: {
        rich_text: [{ text: { content: reply } }],
      },
      "Date Added": {
        date: { start: new Date().toISOString() },
      },
    },
  });
}

module.exports = { saveLead };
