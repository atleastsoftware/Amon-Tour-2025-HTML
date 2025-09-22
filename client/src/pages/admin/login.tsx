import { useTranslation } from 'react-i18next';
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin, useIsAuthenticated } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
const loginSchema = z.object({
  username: z.string().min(1, {
    message: "Username is required"
  }),
  password: z.string().min(1, {
    message: "Password is required"
  })
});
type LoginFormData = z.infer<typeof loginSchema>;
export default function Login() {
  const {
    t
  } = useTranslation();
  const [, setLocation] = useLocation();
  const {
    isAuthenticated
  } = useIsAuthenticated();
  const login = useLogin();
  const {
    toast
  } = useToast();
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
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
        title: t("Loginsuccessful", {
          defaultValue: "Loginsuccessful"
        }),
        description: t("Youarenowloggedintot", {
          defaultValue: "Youarenowloggedintot"
        }),
        variant: "default"
      });
      setLocation("/admin/dashboard");
    } catch (error) {
      toast({
        title: t("Loginerror", {
          defaultValue: "Loginerror"
        }),
        description: t("Incorrectusernameorp", {
          defaultValue: "Incorrectusernameorp"
        }),
        variant: "destructive"
      });
    }
  };
  return <div className="min-h-screen bg-neutral-light flex flex-col items-center justify-center p-4">
      <Link href="/">
        <span className="mb-8 flex items-center cursor-pointer">
          <span className="text-primary font-heading font-bold text-2xl">{t("Senthang", {
            defaultValue: "Senthang"
          })}</span>
          <span className="text-secondary font-accent text-2xl ml-1">{t("Siam", {
            defaultValue: "Siam"
          })}</span>
          <span className="text-primary font-heading font-bold text-2xl ml-1">{t("Tour", {
            defaultValue: "Tour"
          })}</span>
        </span>
      </Link>
      
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-heading text-center">{t("Admindashboard", {
            defaultValue: "Admindashboard"
          })}</CardTitle>
          <CardDescription className="text-center">{t("Logintomanageyourweb", {
            defaultValue: "Logintomanageyourweb"
          })}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="username" render={({
              field
            }) => <FormItem>
                    <FormLabel>{t("Username", {
                  defaultValue: "Username"
                })}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("Username", {
                  defaultValue: "Username"
                })} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              <FormField control={form.control} name="password" render={({
              field
            }) => <FormItem>
                    <FormLabel>{t("Password", {
                  defaultValue: "Password"
                })}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t("Password", {
                  defaultValue: "Password"
                })} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              <Button type="submit" className="w-full bg-primary hover:bg-primary-dark" disabled={login.isPending}>
                {login.isPending ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" asChild>
            <Link href="/">
              <span>{t("Backtowebsite", {
                defaultValue: "Backtowebsite"
              })}</span>
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>;
}