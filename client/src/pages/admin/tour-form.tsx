import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useIsAuthenticated } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Tour, insertTourSchema } from "@shared/schema";
import { z } from "zod";

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

// Extended schema with validation
const tourFormSchema = insertTourSchema
  .extend({
    price: z.coerce.number().min(1, { message: "Le prix doit être supérieur à 0" }),
  });

type TourFormData = z.infer<typeof tourFormSchema>;

export default function TourForm() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const tourId = params.get('id') ? parseInt(params.get('id')!) : null;
  
  const { isAuthenticated, isLoading: authLoading } = useIsAuthenticated();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: tour, isLoading: tourLoading } = useQuery<Tour>({
    queryKey: [`/api/tours/${tourId}`],
    enabled: !!tourId,
  });
  
  const form = useForm<TourFormData>({
    resolver: zodResolver(tourFormSchema),
    defaultValues: {
      title: "",
      description: "",
      shortDescription: "",
      duration: "",
      price: 0,
      imageUrl: "",
      tourNinjaUrl: "",
      featured: false,
    },
  });
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [isAuthenticated, authLoading, setLocation]);
  
  // Populate form with tour data when editing
  useEffect(() => {
    if (tour) {
      form.reset({
        title: tour.title,
        description: tour.description,
        shortDescription: tour.shortDescription,
        duration: tour.duration,
        price: tour.price,
        imageUrl: tour.imageUrl,
        tourNinjaUrl: tour.tourNinjaUrl,
        featured: tour.featured,
      });
    }
  }, [tour, form]);
  
  const onSubmit = async (data: TourFormData) => {
    setIsSubmitting(true);
    
    try {
      if (tourId) {
        // Update existing tour
        await apiRequest("PUT", `/api/tours/${tourId}`, data);
        toast({
          title: "Tour mis à jour",
          description: "Le tour a été mis à jour avec succès.",
          variant: "default",
        });
      } else {
        // Create new tour
        await apiRequest("POST", "/api/tours", data);
        toast({
          title: "Tour créé",
          description: "Le nouveau tour a été créé avec succès.",
          variant: "default",
        });
      }
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/tours'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tours/featured'] });
      
      // Redirect to dashboard
      setLocation("/admin/dashboard");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Un problème est survenu lors de l'enregistrement du tour.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (authLoading || (tourId && tourLoading)) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null; // Will redirect in the useEffect
  }
  
  return (
    <div className="min-h-screen bg-neutral-light py-8">
      <div className="container mx-auto px-4">
        <Link href="/admin/dashboard">
          <a className="inline-flex items-center text-primary hover:text-primary-dark mb-6">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Retour au tableau de bord
          </a>
        </Link>
        
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>{tourId ? "Modifier un tour" : "Ajouter un nouveau tour"}</CardTitle>
            <CardDescription>
              {tourId 
                ? "Modifiez les informations du tour existant."
                : "Créez un nouveau tour qui sera affiché sur le site."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Bangkok Essentiel" {...field} />
                      </FormControl>
                      <FormDescription>
                        Le titre principal du tour.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durée</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 3 jours" {...field} />
                        </FormControl>
                        <FormDescription>
                          Durée du tour (ex: 3 jours, 5 jours, etc.)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix (€)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" placeholder="Ex: 350" {...field} />
                        </FormControl>
                        <FormDescription>
                          Prix de départ en euros (sans le symbole €)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description courte</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brève description du tour (visible dans les cartes)"
                          rows={2}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Une courte description qui apparaîtra sur les cartes des tours (max. 150 caractères).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description complète</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Description détaillée du tour"
                          rows={6}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Description détaillée du tour qui apparaîtra sur la page de détails.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de l'image</FormLabel>
                      <FormControl>
                        <Input placeholder="https://exemple.com/image.jpg" {...field} />
                      </FormControl>
                      <FormDescription>
                        URL de l'image principale du tour (utilisez des services comme Unsplash ou similaires).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tourNinjaUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de TOUR NINJA</FormLabel>
                      <FormControl>
                        <Input placeholder="https://tourninja.com/tour/xyz" {...field} />
                      </FormControl>
                      <FormDescription>
                        Le lien externe vers la page de réservation sur TOUR NINJA.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Tour en vedette</FormLabel>
                        <FormDescription>
                          Cochez cette case pour mettre ce tour en avant sur la page d'accueil.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/admin/dashboard")}
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting 
                      ? "Enregistrement..." 
                      : tourId ? "Mettre à jour" : "Créer le tour"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
