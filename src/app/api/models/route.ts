import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { listModels } from '../../../lib/ollama';

export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    const models = await listModels();
    return NextResponse.json({ models });
  } catch {
    return NextResponse.json({ models: [] }, { status: 200 });
  }
}

export function POST(): NextResponse {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export function PUT(): NextResponse {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export function PATCH(): NextResponse {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export function DELETE(): NextResponse {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
