import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json([], { status: 200 });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, client_id, status } = body;
        return NextResponse.json({ id: 1, title, description, client_id, status }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, title, description, client_id, status } = body;
        return NextResponse.json({ id, title, description, client_id, status }, { status: 200 });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}

export async function DELETE(request: Request) {
    try {
        await request.json();
        return NextResponse.json({ message: 'Opportunity deleted successfully' }, { status: 200 });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}