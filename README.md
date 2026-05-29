# The Label - AI Studios | Lead Generation Agent

A Node.js Express server that receives leads from Make.com, classifies them using Claude AI, saves them to Notion, and nurtures hot/warm leads via MailerLite.

## Architecture

```
Make.com Webhook
      ↓
Express Server (index.js)
      ↓
Claude Haiku (classify + write reply)
      ↓
Notion CRM (save all leads)
      ↓
MailerLite (hot + warm leads only)
      ↓
JSON response back to Make.com
```

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env
```
Fill in your keys in `.env`:

| Variable | Where to get it |
|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `NOTION_API_KEY` | notion.so/my-integrations |
| `NOTION_DATABASE_ID` | From your Notion database URL |
| `MAILERLITE_API_KEY` | app.mailerlite.com → Integrations → API |
| `MAILERLITE_GROUP_ID` | app.mailerlite.com → Subscribers → Groups |

### 3. Set up Notion Database
Create a Notion database with these exact properties:
- **Name** (Title)
- **Email** (Email)
- **Source** (Text)
- **Message** (Text)
- **Classification** (Select: hot, warm, cold)
- **Reply** (Text)
- **Date Added** (Date)

Then connect your Notion integration to the database (Share → Invite → your integration).

### 4. Run the server
```bash
# Development
npm run dev

# Production
npm start
```

### 5. Configure Make.com
1. Create a new Make.com scenario
2. Add a **Webhook** module as the trigger
3. Copy the webhook URL
4. Add an **HTTP → Make a request** module pointing to:
   `POST https://your-server.com/webhook/lead`
5. Map fields: `name`, `email`, `source`, `message`

## API

### POST /webhook/lead

**Request body:**
```json
{
  "name": "Maria Santos",
  "email": "maria@example.com",
  "source": "Instagram",
  "message": "Hi! I need AI-powered branding for my startup. Budget is ready."
}
```

**Response:**
```json
{
  "classification": "hot",
  "reply": "Hi Maria! Thank you for reaching out to The Label - AI Studios..."
}
```

## Lead Classification

| Classification | Criteria |
|---|---|
| **hot** | Clear intent, mentions budget, urgent, ready to start |
| **warm** | Interested but exploring, no clear timeline |
| **cold** | Vague, just browsing, no real intent |

Only **hot** and **warm** leads are added to MailerLite.
