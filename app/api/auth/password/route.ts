import { NextResponse } from "next/server";
import { createClient } from "@/app/api/server/serverClient";
import { validatePassword } from "@/app/api/utils/password-validator";

// change password request type
type ChangeBody = {
  action: "change";
  currentPassword: string;
  newPassword: string;
};

// request password reset type
type RequestResetBody = {
  action: "request_reset";
  email: string;
  redirectTo: string;
};

// password reset type
type ResetBody = {
  action: "reset";
  newPassword: string;
};

type Body = ChangeBody | RequestResetBody | ResetBody;

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  let body: Body;

  try {
    body = (await req.json()) as Body;
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  if (!("action" in body)) return jsonError("Missing 'action' field.", 400);

  const supabase = await createClient();

  if (body.action === "request_reset") {
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email) return jsonError("Email is required.", 400);

    // default redirect user to login page
    const defaultRedirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/login`;

    // fallback on default redirect if redirectTo is invalid
    const redirectTo =
      typeof body.redirectTo === "string" && body.redirectTo.trim()
        ? body.redirectTo.trim()
        : defaultRedirectTo;

    // user will be redirected to login on email click (need to add a reset password page)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) return jsonError(error.message, 400);

    return NextResponse.json({
      ok: true,
      message:
        "If an account exists with the given email, a password reset link has been sent.",
    });
  }

  // change password
  if (body.action === "change") {
    const currentPassword =
      typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = body.newPassword;

    if (!currentPassword)
      return jsonError("Current password is required.", 400);

    const pwError = validatePassword(newPassword);
    if (pwError) return jsonError(pwError, 400);

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr) return jsonError(userErr.message, 401);
    if (!user?.email) return jsonError("Not authenticated.", 401);

    // check if they know current pass before changing
    const { error: reauthErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (reauthErr) return jsonError("Current password is incorrect.", 401);

    const { error: updateErr } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (updateErr) return jsonError(updateErr.message, 400);

    return NextResponse.json({ ok: true, message: "Password updated." });
  }

  // reset password
  if (body.action === "reset") {
    const newPassword = body.newPassword;

    const pwError = validatePassword(newPassword);
    if (pwError) return jsonError(pwError, 400);

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr) return jsonError(userErr.message, 401);
    if (!user)
      return jsonError(
        "Recovery session not found. Open the reset link again.",
        401,
      );

    const { error: updateErr } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (updateErr) return jsonError(updateErr.message, 400);

    return NextResponse.json({
      ok: true,
      message: "Password reset successfully.",
    });
  }

  return jsonError("Unknown action.", 400);
}
