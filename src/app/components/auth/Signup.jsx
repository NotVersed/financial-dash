import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Signup = () => {
  const handleSignup = async (e) => {
    e.preventDefault();
    const email = e.target[0]?.value;
    const password = e.target[1]?.value;
    const confirmPassword = e.target[2]?.value;

    /* password validation STARTS here */
    console.log("user clicked sign up");
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    const specials = /[!#$%&'()*+\-./:;=?@[\]^_]/;
    const nums = /[0-9]/;
    const hasUpper = /[A-Z]/;
    const hasLower = /[a-z]/;

    if (!specials.test(password)) {
      toast.error("Password must contain at least 1 special character");
      return;
    }

    if (!nums.test(password)) {
      toast.error("Password must contain at least 1 number");
      return;
    }

    if (!hasUpper.test(password) || !hasLower.test(password)) {
      toast.error("Password must have both uppercase and lowercase letters");
      return;
    }

    /* password validation ENDS here */
    // server side signup
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Signup failed");
        return;
      }

      toast.success(data.message);
    } catch (err) {
      console.error(err);
      toast.error("Server error, please try again later");
    }
  };
  // return the html
  return (
    // neutral grey background that accounts for nav bar
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-slate-100 via-gray-50 to-zinc-100 p-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-200">
        <CardHeader className="space-y-1 text-center pb-6">
          <CardTitle className="text-3xl font-bold text-slate-800">
            Create An Account
          </CardTitle>
          <CardDescription className="text-base text-slate-600">
            Client Financial Progress Tracking System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-10">
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@gmail.com"
                  className="h-11 border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                />
              </div>

              <div className="grid gap-2">
                <Label>Password</Label>
                <Input id="password" type="password" placeholder="Password" />
              </div>

              <div className="grid gap-2">
                <Label>Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Password"
                />
              </div>

              <Button type="submit" className="w-full">
                Sign Up
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
