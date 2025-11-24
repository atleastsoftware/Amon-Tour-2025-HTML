import { useState } from "react";
import { useLogin } from "@/lib/auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useTranslationSection } from "@/contexts/TranslationContext";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const admin = useTranslationSection('admin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: admin.common?.error || "Error",
        description: admin.login?.errors?.required || "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await login.mutateAsync({ username, password });
      toast({
        title: admin.login?.success?.title || "Login successful",
        description: admin.login?.success?.description || "Redirecting to dashboard...",
      });
      setTimeout(() => {
        setLocation("/admin");
      }, 1000);
    } catch (error) {
      toast({
        title: admin.common?.error || "Error",
        description: admin.login?.errors?.invalid || "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-heading">
                  {admin.login?.title || "Administration Login"}
                </CardTitle>
                <CardDescription>
                  {admin.login?.subtitle || "Access the management dashboard"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">
                      {admin.login?.username || "Username"}
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin"
                      data-testid="input-username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      {admin.login?.password || "Password"}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      data-testid="input-password"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={login.isPending}
                    data-testid="button-login"
                  >
                    {login.isPending 
                      ? (admin.common?.loading || "Loading...") 
                      : (admin.login?.loginButton || "Log in")
                    }
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center text-sm text-muted-foreground">
                {admin.login?.footer || "Access reserved for administrators only"}
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
}