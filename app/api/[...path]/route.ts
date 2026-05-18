// app/api/[...path]/route.ts
import { NextRequest } from "next/server";

const allowedOrigins = [
  "https://bgg-what-to-play.vercel.app",
  "http://localhost:3000",
];

function corsHeaders(origin: string | null) {
  if (origin && allowedOrigins.includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
  }
  return;
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}


export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin");
  const { pathname, searchParams } = new URL(req.url);
  const path = pathname.replace(/^\/api\//, "");
  const targetUrl = new URL(`https://boardgamegeek.com//${path}?${searchParams.toString()}`);

  const response = await fetch(targetUrl.toString(), {
     headers: { Authorization: `Bearer ${process.env.TOKEN}` } 
  });

  return new Response(response.body, {
    status: response.status,
    headers: { "Content-Type": "application/xml", ...corsHeaders(origin) },
  });

}