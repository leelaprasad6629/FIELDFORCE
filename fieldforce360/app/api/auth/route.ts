import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    const { email, password } = await request.json();

    const { user, error } = await supabase.auth.signIn({
        email,
        password,
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({ user });
}

export async function POST_SIGNUP(request: Request) {
    const { email, password } = await request.json();

    const { user, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ user });
}