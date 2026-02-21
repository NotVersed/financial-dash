'use client'
import {createContext, useState, useEffect} from "react"; 
import client from "@/api/client"; 

const AuthContext = createContext(null); 

// checks whether user is logged in or not
const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null); 
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        client.auth.getSession().then(({data}) => {
            setUser(data?.session?.user || null); 
            setLoading(false); 
        }); 

        // every time user logs in
        const {data: listener} = client.auth.onAuthStateChange((e, session) => {
            setUser(session?.user || null)
        });

        // says to stop listening to auth events when app gets closed
        return () => {
            listener.subscription.unsubscribe(); 
        };
    }, []); 

    return (
        <AuthContext.Provider value={{user, loading}}>
            {children}
        </AuthContext.Provider>
    ); 
}

export { AuthContext, AuthProvider}