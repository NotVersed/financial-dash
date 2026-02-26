import client from "@/api/client";

export async function POST() {
  const { error } = await client.auth.signOut();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}