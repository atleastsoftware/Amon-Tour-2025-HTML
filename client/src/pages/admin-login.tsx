import { useTranslation } from 'react-i18next';
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
export default function AdminLogin() {
  const { t } = useTranslation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();
  const [, setLocation] = useLocation();
  const {
    toast
  } = useToast();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: t('Erreur', {
          defaultValue: 'Erreur'
        }),
        description: t('Veuillez remplir tous les champs', {
          defaultValue: 'Veuillez remplir tous les champs'
        }),
        variant: "destructive"
      });
      return;
    }
    try {
      await login.mutateAsync({
        username,
        password
      });
      toast({
        title: t('Succ\xE8s', {
          defaultValue: 'Succ\xE8s'
        }),
        description: t('Connexion r\xE9ussie', {
          defaultValue: 'Connexion r\xE9ussie'
        })
      });
      // Rediriger après un court délai pour permettre au toast de s'afficher
      setTimeout(() => {
        setLocation("/admin");
      }, 1000);
    } catch (error) {
      toast({
        title: t('Erreur', {
          defaultValue: 'Erreur'
        }),
        description: t('Identifiants incorrects', {
          defaultValue: 'Identifiants incorrects'
        }),
        variant: "destructive"
      });
    }
  };
  return <>
      <Header />
      <div className="min-h-screen bg-white pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5
        }} className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-heading">{t('Administration', {
                  defaultValue: 'Administration'
                })}</CardTitle>
                <CardDescription>{t('Connectez-vous pour acc\xE9der \xE0 l\'espace administrateur', {
                  defaultValue: 'Connectez-vous pour acc\xE9der \xE0 l\'espace administrateur'
                })}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">{t('Nom d\'utilisateur', {
                      defaultValue: 'Nom d\'utilisateur'
                    })}</Label>
                    <Input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('Mot de passe', {
                      defaultValue: 'Mot de passe'
                    })}</Label>
                    <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                  </div>
                  <Button type="submit" className="w-full" disabled={login.isPending}>
                    {login.isPending ? "Connexion en cours..." : "Se connecter"}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center text-sm text-muted-foreground">{t('Acc\xE8s r\xE9serv\xE9 aux administrateurs', {
                defaultValue: 'Acc\xE8s r\xE9serv\xE9 aux administrateurs'
              })}</CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>;
}