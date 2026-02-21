import { createClient } from "@/api/serverClient";

export async function POST(req) {
  const { email, password } = await req.json();

  const supabase = await createClient(); // server client

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 401,
    });
  }

  return new Response(
    JSON.stringify({ user: { id: data.user.id, email: data.user.email } }),
    { status: 200 },
  );
}
