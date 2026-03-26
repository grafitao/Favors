import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';
  return NextResponse.json({ apiKey });
}
