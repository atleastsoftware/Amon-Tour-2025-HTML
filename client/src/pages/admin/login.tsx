import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin, useIsAuthenticated } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const loginSchema = z.object({
  username: z.string().min(1, { message: "Le nom d'utilisateur est requis" }),
  password: z.string().min(1, { message: "Le mot de passe est requis" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useIsAuthenticated();
  const login = useLogin();
  const { toast } = useToast();
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/admin/dashboard");
    }
  }, [isAuthenticated, setLocation]);
  
  const onSubmit = async (data: LoginFormData) => {
    try {
      await login.mutateAsync(data);
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté à l'espace administrateur.",
        variant: "default",
      });
      setLocation("/admin/dashboard");
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: "Nom d'utilisateur ou mot de passe incorrect.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-neutral-light flex flex-col items-center justify-center p-4">
      <Link href="/">
        <a className="mb-8 flex items-center">
          <span className="text-primary font-heading font-bold text-2xl">Senthang</span>
          <span className="text-secondary font-accent text-2xl ml-1">Siam</span>
          <span className="text-primary font-heading font-bold text-2xl ml-1">Tour</span>
        </a>
      </Link>
      
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-heading text-center">Espace Administrateur</CardTitle>
          <CardDescription className="text-center">
            Connectez-vous pour gérer votre site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom d'utilisateur</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom d'utilisateur" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Mot de passe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary-dark"
                disabled={login.isPending}
              >
                {login.isPending ? "Connexion en cours..." : "Se connecter"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" asChild>
            <Link href="/">Retour au site</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
