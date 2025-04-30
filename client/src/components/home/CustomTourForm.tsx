import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const customTourSchema = z.object({
  name: z.string().min(2, { message: "Le nom est requis" }),
  email: z.string().email({ message: "Email invalide" }),
  travelers: z.string().min(1, { message: "Veuillez sélectionner le nombre de voyageurs" }),
  duration: z.string().min(1, { message: "Veuillez sélectionner la durée" }),
  interests: z.array(z.string()).min(1, { message: "Sélectionnez au moins un centre d'intérêt" }),
  message: z.string().min(10, { message: "Veuillez décrire votre voyage idéal (10 caractères minimum)" }),
});

type CustomTourFormData = z.infer<typeof customTourSchema>;

export default function CustomTourForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CustomTourFormData>({
    resolver: zodResolver(customTourSchema),
    defaultValues: {
      name: "",
      email: "",
      travelers: "",
      duration: "",
      interests: [],
      message: "",
    },
  });

  const onSubmit = async (data: CustomTourFormData) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/custom-tour-requests", data);
      
      toast({
        title: "Demande envoyée",
        description: "Nous vous contacterons très rapidement pour discuter de votre projet de voyage.",
        variant: "default",
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Un problème est survenu lors de l'envoi de votre demande. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const interestOptions = [
    { id: "culture", label: "Culture & Histoire" },
    { id: "nature", label: "Nature & Aventure" },
    { id: "beaches", label: "Plages & Îles" },
    { id: "food", label: "Gastronomie" },
    { id: "wellness", label: "Bien-être & Spa" },
    { id: "shopping", label: "Shopping" },
  ];

  return (
    <section id="custom" className="py-16">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image Side */}
            <div className="h-64 md:h-auto relative">
              <img 
                src="https://images.unsplash.com/photo-1504214208698-ea1916a2195a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                alt="Plage de Thaïlande" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/70 to-transparent flex flex-col justify-center p-8 text-white">
                <h3 className="font-heading font-bold text-3xl mb-3">Créez Votre Voyage Sur Mesure</h3>
                <p className="max-w-xs">Parlez-nous de vos envies et nous vous proposerons un circuit adapté à vos préférences.</p>
              </div>
            </div>
            
            {/* Form Side */}
            <div className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom complet</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre nom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="travelers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de voyageurs</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1-2">1-2 personnes</SelectItem>
                              <SelectItem value="3-5">3-5 personnes</SelectItem>
                              <SelectItem value="6-10">6-10 personnes</SelectItem>
                              <SelectItem value="11+">11+ personnes</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Durée approximative</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1-3">1-3 jours</SelectItem>
                              <SelectItem value="4-7">4-7 jours</SelectItem>
                              <SelectItem value="8-14">8-14 jours</SelectItem>
                              <SelectItem value="15+">15+ jours</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="interests"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Centres d'intérêt</FormLabel>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {interestOptions.map((option) => (
                            <FormField
                              key={option.id}
                              control={form.control}
                              name="interests"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={option.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(option.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, option.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== option.id
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      {option.label}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Décrivez votre voyage idéal</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Dites-nous ce que vous aimeriez voir et faire en Thaïlande..."
                            rows={4}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-white py-3 rounded-md font-heading font-semibold hover:bg-primary-dark transition-colors"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Envoi en cours..." : "Envoyer ma demande"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
