import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json([], { status: 200 });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, role, email } = body;
        return NextResponse.json({ id: 1, name, role, email }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, name, role, email } = body;
        return NextResponse.json({ id, name, role, email }, { status: 200 });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}

export async function DELETE(request: Request) {
    try {
        await request.json();
        return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}