import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json([], { status: 200 });
}

export async function POST(request: Request) {
    try {
        const { title, description, status } = await request.json();
        return NextResponse.json({ id: 1, title, description, status }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}

export async function PUT(request: Request) {
    try {
        const { id, title, description, status } = await request.json();
        return NextResponse.json({ id, title, description, status }, { status: 200 });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}

export async function DELETE(request: Request) {
    try {
        await request.json();
        return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}