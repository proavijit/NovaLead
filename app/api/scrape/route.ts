import { filterLeads, mockLeads } from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { query, filters = {} } = body;

  // Simulate scrape job
  const jobId = `job_${Date.now()}`;

  // Return immediately with job info; progress is simulated client-side
  const matchingLeads = filterLeads(mockLeads, { query, ...filters });

  return NextResponse.json({
    jobId,
    status: "completed",
    totalFound: matchingLeads.length,
    leads: matchingLeads,
    message: `Scraped ${matchingLeads.length} leads for query: "${query}"`,
  });
}
