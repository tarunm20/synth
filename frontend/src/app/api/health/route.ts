import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      service: 'synth-frontend'
    },
    { status: 200 }
  );
}