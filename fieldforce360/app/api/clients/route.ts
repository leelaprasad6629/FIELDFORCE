import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json([], { status: 200 });
}

export async function POST(request: Request) {
    try {
        const { name, email } = await request.json();
        return NextResponse.json({ id: 1, name, email }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}

export async function PUT(request: Request) {
    try {
        const { id, name, email } = await request.json();
        return NextResponse.json({ id, name, email }, { status: 200 });
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