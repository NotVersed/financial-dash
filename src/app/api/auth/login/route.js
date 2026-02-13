import client from "@/api/client";

export async function POST(req) {
  const { email, password } = await req.json();

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 401,
    });
  }

  return new Response(
    JSON.stringify({ id: data.user.id, email: data.user.email }),
    { status: 200 },
  );
}
