import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
    const { data, error } = await supabase
        .from('opportunities')
        .select('*');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const body = await request.json();
    const { title, description, client_id, status } = body;

    const { data, error } = await supabase
        .from('opportunities')
        .insert([{ title, description, client_id, status }]);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0], { status: 201 });
}

export async function PUT(request: Request) {
    const body = await request.json();
    const { id, title, description, client_id, status } = body;

    const { data, error } = await supabase
        .from('opportunities')
        .update({ title, description, client_id, status })
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0]);
}

export async function DELETE(request: Request) {
    const { id } = await request.json();

    const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Opportunity deleted successfully' });
}