import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json([], { status: 200 });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, hoursWorked, projectId, date } = body;
        return NextResponse.json({ id: 1, userId, hoursWorked, projectId, date }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}