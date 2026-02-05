'use client'; 

import useAuth from "@/hooks/useAuth"; 
import {useRouter} from "next/navigation"; 
import Auth from "./components/auth/Auth";

export default function Home() {
    const {user, loading} = useAuth(); 
    const router = useRouter(); 

    // if the user is already logged in, show their dashboard
    if (!loading && user) {
        // redirect to secure page
        router.push("/dashboard");
        return null; 
    }

    // otherwise direct to the login page
    return (
        // redirect to either the Loading page or the Login page
        <div className="bg-gradient-to-br from-slate-100 via-gray-50 to-zinc-100 p-4">

            {loading ? <h1>Loading...</h1> : <Auth/>}
        </div>
    )
}