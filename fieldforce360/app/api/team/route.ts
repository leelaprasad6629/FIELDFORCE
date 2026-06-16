import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
    const { data, error } = await supabase
        .from('team')
        .select('*');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const body = await request.json();
    const { name, role, email } = body;

    const { data, error } = await supabase
        .from('team')
        .insert([{ name, role, email }]);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}

export async function PUT(request: Request) {
    const body = await request.json();
    const { id, name, role, email } = body;

    const { data, error } = await supabase
        .from('team')
        .update({ name, role, email })
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function DELETE(request: Request) {
    const { id } = await request.json();

    const { data, error } = await supabase
        .from('team')
        .delete()
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}