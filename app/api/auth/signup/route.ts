import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/api/server/serverClient";
import { validatePassword } from "@/app/api/utils/password-validator";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const trimmedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!trimmedEmail || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }
    const pwError = validatePassword(password);
    if (pwError) {
      return NextResponse.json({ error: pwError }, { status: 400 });
    }
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        message:
          "Signup successful. Please confirm your email before logging in.",
      },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
