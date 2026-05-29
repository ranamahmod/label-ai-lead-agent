const https = require("https");

/**
 * Adds a subscriber to MailerLite and assigns them to a group.
 * Only called for hot and warm leads.
 * @param {Object} lead - { name, email }
 * @param {string} classification - hot | warm
 */
async function addSubscriber(lead, classification) {
  const { name, email } = lead;
  const groupId = process.env.MAILERLITE_GROUP_ID;

  const payload = JSON.stringify({
    email,
    fields: {
      name,
      lead_classification: classification,
    },
    groups: [groupId],
    status: "active",
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "connect.mailerlite.com",
        path: "/api/subscribers",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MAILERLITE_API_KEY}`,
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`MailerLite error ${res.statusCode}: ${data}`));
          }
        });
      }
    );

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

module.exports = { addSubscriber };
