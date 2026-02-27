export function validatePassword(password: unknown): string | null {
  if (typeof password !== "string" || password.length === 0) {
    return "Password is required";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters";
  }

  if (!/[!#$%&'()*+-.\/:;=?@[\]^_]/.test(password)) {
    return "Password must contain a special character";
  }

  if (!/[0-9]/.test(password)) {
    return "Password must contain a number";
  }

  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
    return "Password must have both uppercase and lowercase letters";
  }

  return null;
}
