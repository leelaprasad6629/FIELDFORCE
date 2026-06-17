import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
    const { data, error } = await supabase
        .from('tasks')
        .select('*');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const { title, description, status } = await request.json();

    const { data, error } = await supabase
        .from('tasks')
        .insert([{ title, description, status }]);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0], { status: 201 });
}

export async function PUT(request: Request) {
    const { id, title, description, status } = await request.json();

    const { data, error } = await supabase
        .from('tasks')
        .update({ title, description, status })
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0]);
}

export async function DELETE(request: Request) {
    const { id } = await request.json();

    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Task deleted successfully' });
}