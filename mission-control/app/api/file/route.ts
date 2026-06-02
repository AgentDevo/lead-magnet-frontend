import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

/**
 * API endpoint to read/write files on the OpenClaw host.
 * GET  ?path=<absolute-path>   → returns raw text (or 404)
 * POST {path, content}          → writes content to file (creates dirs)
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const filePath = url.searchParams.get('path');
  if (!filePath) return NextResponse.json({ error: 'Missing path' }, { status: 400 });
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return new NextResponse(data, { status: 200, headers: { 'Content-Type': 'text/plain' } });
  } catch (e) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}

export async function POST(request: Request) {
  try {
    const { path: filePath, content } = await request.json();
    if (!filePath || typeof content !== 'string') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, 'utf8');
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'Write failed' }, { status: 500 });
  }
}
