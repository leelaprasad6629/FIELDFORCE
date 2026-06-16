import { NextResponse } from 'next/server';
// Note: Auth is handled by Clerk middleware
// This route can be used for custom auth logic if needed

export async function POST(request: Request) {
    // Placeholder for custom auth logic
    return NextResponse.json({ error: 'Use Clerk for authentication' }, { status: 400 });
}