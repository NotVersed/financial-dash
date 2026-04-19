import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/app/api/server/serverClient";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const supabase = await createClient(); // server client

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const userId = data.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Login failed" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("is_active")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      await supabase.auth.signOut();
      return NextResponse.json({ error: "Login failed" }, { status: 401 });
    }

    if (profile && profile.is_active === false) {
      await supabase.auth.signOut();
      return NextResponse.json(
        {
          error:
            "Account deactivated, please contact your administrator.",
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      user: { id: data.user.id, email: data.user.email },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
