import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
    const { data, error } = await supabase
        .from('projects')
        .select('*');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const { name, description, client_id } = await request.json();

    const { data, error } = await supabase
        .from('projects')
        .insert([{ name, description, client_id }]);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0], { status: 201 });
}

export async function PUT(request: Request) {
    const { id, name, description, client_id } = await request.json();

    const { data, error } = await supabase
        .from('projects')
        .update({ name, description, client_id })
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0]);
}

export async function DELETE(request: Request) {
    const { id } = await request.json();

    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Project deleted successfully' });
}