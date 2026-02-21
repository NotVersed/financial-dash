import {Tabs, TabsContent, TabsTrigger, TabsList} from '@/components/ui/tabs'; 
import Login from './Login'; 
import Signup from './Signup'; 
import { AlignRight } from 'lucide-react';


const Auth = () => {
    return (

        <Tabs defaultValue="login">
            <div style={{display: "flex", justifyContent: "flex-end"}} className="bg-transparent">
            <TabsList className="bg-transparent">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Signup</TabsTrigger>
            </TabsList>
            </div>
            <TabsContent value="login">
                <Login />
            </TabsContent>
            <TabsContent value="signup"><Signup /></TabsContent>
        </Tabs>
  

    )

}

export default Auth; 
