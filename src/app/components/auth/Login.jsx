import React from "react"; 
import {
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle
} from "@/components/ui/card"; 
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {toast} from "sonner"; 
import client from "@/api/client";
import Link from "next/link";


const Login = () => {
    const handleLogin = async (e) => {
        e.preventDefault(); 
        const email = e.target[0]?.value; 
        const password = e.target[1]?.value; 

        /* Check if info belongs to an existing user */
        const {data, error} = await client.auth.signInWithPassword({
            email, 
            password
        })

        if (error) {
            toast.error("Invalid credentials. Please check your credentials and try again.");
        } else {
            console.log("User successfully logged in!"); 
        } 
    }
    // the html object to return 
    return (
    // neutral grey background that accounts for nav bar
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-slate-100 via-gray-50 to-zinc-100 p-4">
        <Card className="w-full max-w-md shadow-2xl border-slate-200">
            <CardHeader className="space-y-1 text-center pb-6">
                <CardTitle className="text-3xl font-bold text-slate-800">
                    Welcome Back
                </CardTitle>
                <CardDescription className="text-base text-slate-600">
                    Client Financial Progress Tracking System
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={(handleLogin)} className="space-y-5">
                    <div className="space-y-10">

                        <div className="grid gap-2">
                            <Label>Email</Label>
                            <Input id="email" 
                            type="email" 
                            placeholder="example@gmail.com"
                            className="h-11 border-slate-300 focus:border-slate-500 focus:ring-slate-500"/>
                        </div>

                        <div className="grid gap-2">
                            <Label>Password</Label>
                            <Input id="password" type="password" placeholder="Password"/>
                        </div>

                        <Button type="submit" className="w-full">
                            Login
                        </Button>

                    </div>
                </form>
            </CardContent>
        </Card>
    </div>
    )
}; 

export default Login; 