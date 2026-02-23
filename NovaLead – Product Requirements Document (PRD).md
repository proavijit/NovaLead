# NovaLead – PRD (Next.js Only, No Backend)

**Stack:** Next.js 14 (App Router) · Tailwind CSS · shadcn/ui · localStorage (data storage)  
**No database. No backend. No server.** All API calls are Next.js Route Handlers (server-side only to hide API keys).

---

## What It Does

User writes a prompt → OpenRouter AI finds companies & people with LinkedIn URLs → ZenRows scrapes those LinkedIn pages → cleaned data saved in **localStorage** → displayed in an Apollo-style dashboard → save, filter, delete, export CSV.

---

## Environment Variables (`.env.local`)

```env
OPENROUTER_API_KEY=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
ZENROWS_API_KEY=96781f2df0457a26ec32bd6ddd574e72365a93f9
```
Then scrap LinkedIn data from url
// npm install axios
const axios = require('axios');

const url = 'https://www.linkedin.com/company/flowaris';
const apikey = '96781f2df0457a26ec32bd6ddd574e72365a93f9';
axios({
	url: 'https://api.zenrows.com/v1/',
	method: 'GET',
	params: {
		'url': url,
		'apikey': apikey,
		'mode': 'auto',
		'response_type': 'markdown',
	},
})
    .then(response => console.log(response.data))
    .catch(error => console.log(error));
> These are used only inside Next.js Route Handlers (server-side). Never exposed to the browser.

---

## Folder Structure

```
/app
  /api
    /generate-leads/route.ts   ← POST: prompt → OpenRouter → ZenRows → return cleaned leads
    /export/route.ts           ← POST: receives lead data → returns CSV file
  /page.tsx                    ← Main dashboard (Leads table)
  /saved/page.tsx              ← Saved leads page
  /layout.tsx

/components
  /ui/                         ← shadcn/ui auto-generated components
  GenerateBar.tsx              ← Prompt input + Generate button + credit counter
  LeadTable.tsx                ← Table with sort, search, pagination
  LeadDetailDrawer.tsx         ← Right-side sheet on row click
  FilterBar.tsx                ← Industry, country, search, saved toggle
  Sidebar.tsx                  ← Navigation links

/lib
  openrouter.ts                ← AI call (server-side)
  zenrows.ts                   ← Scrape call (server-side)
  storage.ts                   ← localStorage read/write helpers (client-side)
  types.ts                     ← Lead TypeScript interface
```

---

## Data Storage — `localStorage`

No database. All leads stored in the browser:

```ts
// lib/storage.ts
const STORAGE_KEY = "novalead_leads";

export function getLeads(): Lead[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

export function saveLeads(leads: Lead[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

export function addLeads(newLeads: Lead[]): void {
  const existing = getLeads();
  const merged = [...newLeads, ...existing];
  saveLeads(merged);
}

export function deleteLead(id: string): void {
  saveLeads(getLeads().filter((l) => l.id !== id));
}

export function toggleSave(id: string): void {
  saveLeads(getLeads().map((l) => l.id === id ? { ...l, saved: !l.saved } : l));
}
```

---

## Lead TypeScript Interface

```ts
// lib/types.ts
export interface Lead {
  id: string;                  // crypto.randomUUID()
  company_name: string;
  company_linkedin: string;
  company_location: string;
  industry: string;
  company_size: string;
  person_name: string;
  person_title: string;
  person_linkedin: string;
  email: string;
  scraped_about: string;
  status: "complete" | "partial" | "error";
  saved: boolean;
  created_at: string;          // ISO date string
}
```

---

## API Route Handlers

### `POST /api/generate-leads`

**No database write here.** This route only calls external APIs and returns clean JSON to the client. The client saves to localStorage.

**Request body:**
```json
{ "prompt": "Find fintech startups in UK and their founders" }
```

**Pipeline inside route handler:**
1. Build system prompt → call OpenRouter → get structured lead JSON
2. For each lead, call ZenRows on `company_linkedin` URL
3. Call OpenRouter (pass 2) on scraped markdown → extract `about`, `industry`, `location`
4. Assign `id: crypto.randomUUID()` and `created_at` to each lead
5. Return enriched leads array to client

**Response:**
```json
{ "leads": [...] }
```

**Client receives → calls `addLeads(leads)` → saves to localStorage → re-renders table**

---

### `POST /api/export`

**Request body:** `{ "leads": [...] }` (client sends its localStorage leads)

**Returns:** CSV file download

```ts
// Columns: Company, Person, Title, Email, LinkedIn, Location, Industry, Date
```

---

## OpenRouter System Prompt (Pass 1 — Lead Generation)

```
You are a B2B lead generation AI.

Return ONLY valid JSON — no explanation, no markdown fences:

{
  "leads": [
    {
      "company_name": "",
      "company_linkedin": "https://www.linkedin.com/company/...",
      "company_location": "",
      "industry": "",
      "company_size": "",
      "person_name": "",
      "person_title": "",
      "person_linkedin": "https://www.linkedin.com/in/...",
      "email": ""
    }
  ]
}

Rules:
- Maximum 20 leads
- LinkedIn URLs must be properly formatted
- If email is unknown, return ""
- Do not invent emails
- Return ONLY the JSON object, nothing else
```

---

## ZenRows Scraping (Server-side only)

```ts
// lib/zenrows.ts
export async function scrapeLinkedIn(url: string): Promise<string> {
  const params = new URLSearchParams({
    url,
    apikey: process.env.ZENROWS_API_KEY!,
    mode: "auto",
    response_type: "markdown",
  });
  const res = await fetch(`https://api.zenrows.com/v1/?${params}`);
  if (!res.ok) return "";
  return res.text();
}
```

---

## OpenRouter Data Cleaning (Pass 2 — per lead)

```
Extract company info from this LinkedIn page markdown.
Return ONLY JSON:
{
  "about": "",
  "industry": "",
  "company_size": "",
  "location": ""
}
```

---

## UI Pages

### `/` — Main Dashboard

- Sidebar + top Generate Bar
- FilterBar (industry, country, search text, saved toggle)
- LeadTable with pagination (20 per page)
- Credit counter in top bar (localStorage: starts 100, decreases per generation)

### `/saved` — Saved Leads

- Same LeadTable filtered to `saved: true`
- Export Selected button

---

## Lead Table Columns

| ☑ | Company | Person | Title | Email | Location | LinkedIn | ⭐ | Date |

**Row interactions:**
- ⭐ click → toggle saved (updates localStorage)
- 🗑 click → delete (updates localStorage)  
- Row click → open `LeadDetailDrawer` (shadcn `Sheet`)

---

## Lead Detail Drawer

shadcn `Sheet` from the right. Displays:
- Company name + LinkedIn link
- Person name + title + LinkedIn link
- About summary (from scraped data)
- Industry, size, location
- Email (with copy button)
- Status badge (complete / partial)
- Date added

---

## shadcn/ui Components Used

| Component | Usage |
|---|---|
| `Sheet` | Lead detail drawer |
| `Table` | Lead table |
| `Button` | Actions |
| `Input` | Search, prompt |
| `Select` | Industry/country filter |
| `Switch` | Saved-only toggle |
| `Badge` | Status labels |
| `Toaster` + `toast` | Success/error notifications |
| `Skeleton` | Loading states |
| `Dialog` | Confirm delete |
| `Separator` | Layout |

---

## UX States

| State | Behaviour |
|---|---|
| Generating | Button shows spinner, disabled |
| Success | Green toast: "X leads generated" |
| Error | Red toast with message |
| Partial lead | Yellow `Badge` on row |
| No results | Empty state illustration + text |
| No leads yet | Prompt to generate first leads |

---

## Credit Counter

```ts
// Stored in localStorage
const CREDIT_KEY = "novalead_credits";
const DEFAULT_CREDITS = 100;

export function getCredits(): number {
  return parseInt(localStorage.getItem(CREDIT_KEY) || String(DEFAULT_CREDITS));
}
export function deductCredits(count: number): void {
  localStorage.setItem(CREDIT_KEY, String(Math.max(0, getCredits() - count)));
}
```

---

## What's NOT in MVP

- ❌ Database (MongoDB, Supabase, etc.)
- ❌ Express.js or any separate backend
- ❌ Authentication
- ❌ Multi-user
- ❌ Payments
- ❌ Email automation
- ❌ CRM integration

---

## Done When

- [ ] Prompt → leads returned from `/api/generate-leads`
- [ ] Leads saved to localStorage and rendered in table
- [ ] LinkedIn scraped data shown in detail drawer
- [ ] Save / unsave toggles correctly
- [ ] Delete single lead works
- [ ] Filters narrow visible leads
- [ ] CSV export downloads via `/api/export`
- [ ] Credit counter decrements after each generation
- [ ] Errors shown as toasts, no crash


import { OpenRouter } from "@openrouter/sdk";

const openrouter = new OpenRouter({
  apiKey: "<OPENROUTER_API_KEY>"
});

// Stream the response to get reasoning tokens in usage
const stream = await openrouter.chat.send({
  model: "arcee-ai/trinity-large-preview:free",
  messages: [
    {
      role: "user",
      content: "How many r's are in the word 'strawberry'?"
    }
  ],
  stream: true
});

let response = "";
for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) {
    response += content;
    process.stdout.write(content);
  }

  // Usage information comes in the final chunk
  if (chunk.usage) {
    console.log("\nReasoning tokens:", chunk.usage.reasoningTokens);
  }
}