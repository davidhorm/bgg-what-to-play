// app/api/[...path]/route.ts
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { pathname, searchParams } = new URL(req.url);
  const path = pathname.replace(/^\/api\//, "");
  const targetUrl = new URL(`https://bgg.cc/${path}?${searchParams.toString()}`);

  const response = await fetch(targetUrl.toString(), {
     headers: { Authorization: `Bearer ${process.env.TOKEN}` } 
  });

  return new Response(response.body, {
    status: response.status,
    headers: { "Content-Type": "application/xml" },
  });

}