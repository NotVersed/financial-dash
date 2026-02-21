import { createClient } from "@/api/serverClient";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const supabase = await createClient();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 6 characters" }),
        { status: 400 },
      );
    }

    if (!/[!#$%&'()*+-.\/:;=?@[\]^_]/.test(password)) {
      return new Response(
        JSON.stringify({ error: "Password must contain a special character" }),
        { status: 400 },
      );
    }

    if (!/[0-9]/.test(password)) {
      return new Response(
        JSON.stringify({ error: "Password must contain a number" }),
        { status: 400 },
      );
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
      return new Response(
        JSON.stringify({
          error: "Password must have both uppercase and lowercase letters",
        }),
        { status: 400 },
      );
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
      });
    }

    return new Response(
      JSON.stringify({
        message:
          "Signup successful. Please confirm your email before logging in.",
      }),
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
