import { filterLeads, mockLeads } from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const query = searchParams.get("q") || "";
  const industry = searchParams.get("industry") || "All";
  const location = searchParams.get("location") || "All";
  const seniority = searchParams.get("seniority") || "All";
  const companySize = searchParams.get("companySize") || "All";
  const connectionDegree = searchParams.get("connectionDegree") || "All";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");

  // Simulate network delay (like real scraping)
  await new Promise((resolve) => setTimeout(resolve, 300));

  const filtered = filterLeads(mockLeads, {
    query,
    industry,
    location,
    seniority,
    companySize,
    connectionDegree,
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const leads = filtered.slice(start, start + limit);

  return NextResponse.json({
    leads,
    total,
    page,
    totalPages,
    query,
  });
}
