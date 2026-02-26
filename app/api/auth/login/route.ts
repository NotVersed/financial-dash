import { NextRequest } from "next/server";
import { NextResponse } from 'next/server'
import { createClient } from "@/app/api/server/serverClient";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const supabase = await createClient(); // server client

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }

  return NextResponse.json({ user: { id: data.user.id, email: data.user.email } })
}
