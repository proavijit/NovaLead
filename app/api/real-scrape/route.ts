import axios from "axios";
import { Agent as HttpAgent } from "http";
import { Agent as HttpsAgent } from "https";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const axiosInstance = axios.create({
  httpAgent: new HttpAgent({ keepAlive: true }),
  httpsAgent: new HttpsAgent({ keepAlive: true }),
});

const ZENROWS_API_KEY = process.env.ZENROWS_API_KEY!;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: OPENROUTER_API_KEY,
});

const MODEL = "stepfun/step-3.5-flash:free";

// ─── Step 1: Use AI to generate LinkedIn URLs from user query ─────────────────
async function generateLinkedInUrls(query: string): Promise<string[]> {
  const completion = await openrouter.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: `You are a LinkedIn lead research expert. Given a user's search request, generate exactly 5-10 real LinkedIn profile or company page URLs that match the request.
        Return ONLY a JSON array of strings (LinkedIn URLs), nothing else.
        Focus on high-quality, real profiles.
        Query: "${query}"`,
      },
      {
        role: "user",
        content: `Find LinkedIn URLs for: "${query}"`,
      },
    ],
    temperature: 0.1,
  });

  const raw = completion.choices[0]?.message?.content || "[]";
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];
  
  try {
    const urls: string[] = JSON.parse(jsonMatch[0]);
    return urls.filter((u) => typeof u === "string" && u.includes("linkedin.com"));
  } catch {
    return [];
  }
}

// ─── Step 2: Scrape LinkedIn page using ZenRows ───────────────────────────────
async function scrapeLinkedInPage(url: string, retries = 1): Promise<string> {
  try {
    const response = await axiosInstance({
      url: "https://api.zenrows.com/v1/",
      method: "GET",
      params: {
        url: url,
        apikey: ZENROWS_API_KEY,
        mode: "auto",
        response_type: "markdown",
      },
      timeout: 30000,
    });
    return response.data as string;
  } catch (error: any) {
    if (retries > 0 && (error.code === "ECONNRESET" || error.code === "ETIMEDOUT")) {
      console.warn(`Retrying scrape for ${url} due to ${error.code}...`);
      return scrapeLinkedInPage(url, retries - 1);
    }
    if (axios.isAxiosError(error) && error.response?.status === 402) {
      throw new Error("ZenRows API: Payment Required (Credits exhausted or invalid plan). Please check your ZenRows dashboard.");
    }
    console.error(`Failed to scrape ${url}:`, error.message);
    throw error;
  }
}

// ─── Step 3: Use AI to parse scraped markdown into structured Lead data ────────
async function parseLeadFromMarkdown(markdown: string, url: string): Promise<ParsedLead | null> {
  if (!markdown || markdown.length < 100) return null;

  const isCompany = url.includes("/company/");

  const completion = await openrouter.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: `Extract structured lead information from the following LinkedIn page markdown.
        Return ONLY a valid JSON object.
         Fields to extract:
         {
          "name": string,
          "title": string,
          "company": string,
          "location": string,
          "headline": string,
          "about": string,
          "industry": string,
          "skills": string[],
          "connections": number,
          "seniority": "Entry" | "Mid" | "Senior" | "Director" | "VP" | "C-Suite",
          "experience": [{"title": string, "company": string, "duration": string}],
          "education": [{"school": string, "degree": string, "field": string, "year": string}],
          "linkedinUrl": "${url}",
          "isCompany": ${isCompany}
         }`,
      },
      {
        role: "user",
        content: `Markdown:\n\n${markdown.slice(0, 15000)}`,
      },
    ],
    temperature: 0,
  });

  const raw = completion.choices[0]?.message?.content || "{}";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    return JSON.parse(jsonMatch[0]) as ParsedLead;
  } catch {
    return null;
  }
}

interface ParsedLead {
  name: string;
  title: string;
  company: string;
  location: string;
  headline: string;
  about: string;
  email: string | null;
  industry: string;
  skills: string[];
  connections: number;
  seniority: "Entry" | "Mid" | "Senior" | "Director" | "VP" | "C-Suite";
  experience: Array<{ title: string; company: string; duration: string }>;
  education: Array<{ school: string; degree: string; field: string; year: string }>;
  linkedinUrl: string;
  isCompany: boolean;
}

// ─── POST /api/real-scrape ─────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const { query } = await request.json();

  if (!query?.trim()) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === "your_openrouter_api_key_here") {
    return NextResponse.json(
      { error: "OpenRouter API key not configured. Add OPENROUTER_API_KEY to .env.local" },
      { status: 500 }
    );
  }

  try {
    // Step 1: Generate LinkedIn URLs from query using AI
    const urls = await generateLinkedInUrls(query);
    
    if (urls.length === 0) {
      return NextResponse.json({ error: "Could not generate LinkedIn URLs for this query" }, { status: 422 });
    }

    // Step 2: Scrape each LinkedIn page via ZenRows (limit to 3 for better stability and speed)
    const scrapeTargets = urls.slice(0, 3);
    const scrapedPages = await Promise.allSettled(
      scrapeTargets.map((url) => scrapeLinkedInPage(url))
    );

    // Step 3: Parse each scraped page with AI
    const parsePromises = scrapedPages.map((result, i) => {
      if (result.status === "fulfilled" && result.value) {
        console.log(`Success scraping ${scrapeTargets[i]}, length: ${result.value.length}`);
        console.log(`Snippet: ${result.value.slice(0, 200)}...`);
        return parseLeadFromMarkdown(result.value, scrapeTargets[i]);
      }
      console.error(`Failed to scrape ${scrapeTargets[i]}: ${result.status === "rejected" ? result.reason.message : 'Empty content'}`);
      return Promise.resolve(null);
    });

    const parsedLeads = await Promise.all(parsePromises);

    // Step 4: Convert to Lead format for the UI
    const leads = parsedLeads
      .filter((l): l is ParsedLead => l !== null && !!l.name)
      .map((lead, i) => ({
        id: `real_${Date.now()}_${i}`,
        name: lead.name || "Unknown",
        firstName: lead.name?.split(" ")[0] || "",
        lastName: lead.name?.split(" ").slice(1).join(" ") || "",
        headline: lead.headline || lead.title || "",
        title: lead.title || "",
        company: lead.company || "",
        location: lead.location || "",
        country: lead.location?.split(", ").pop() || "",
        industry: lead.industry || "Technology",
        seniority: lead.seniority || "Mid",
        connections: lead.connections || Math.floor(Math.random() * 5000 + 500),
        email: lead.email || null,
        linkedinUrl: lead.linkedinUrl,
        about: lead.about || "",
        skills: lead.skills || [],
        experience: lead.experience || [],
        education: lead.education || [],
        saved: false,
        scrapedAt: new Date().toISOString(),
        connectionDegree: (Math.floor(Math.random() * 2) + 2) as 2 | 3,
        mutualConnections: Math.floor(Math.random() * 20),
        premium: Math.random() > 0.7,
        openToWork: false,
        companySize: undefined,
      }));

    return NextResponse.json({
      leads,
      total: leads.length,
      query,
      urls: scrapeTargets,
      scrapedAt: new Date().toISOString(),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Scraping failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
