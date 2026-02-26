import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const resp = await fetch(`${BACKEND_URL}/api/candidate-ask`, {
      method: 'POST',
      body: form,
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ detail: `Backend returned status ${resp.status}` }));
      return NextResponse.json(err, { status: resp.status });
    }
    const data = await resp.json();
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg.includes('fetch') || msg.includes('ECONNREFUSED')) {
      return NextResponse.json({ detail: 'Backend service unavailable. Make sure the FastAPI server is running at ' + BACKEND_URL }, { status: 503 });
    }
    return NextResponse.json({ detail: `Error: ${msg}` }, { status: 500 });
  }
}
