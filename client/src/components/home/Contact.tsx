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
import { Button } from "@/components/ui/button";

const contactSchema = z.object({
  name: z.string().min(2, { message: "Le nom est requis" }),
  email: z.string().email({ message: "Email invalide" }),
  subject: z.string().min(2, { message: "Le sujet est requis" }),
  message: z.string().min(10, { message: "Le message doit contenir au moins 10 caractères" }),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/contact-messages", data);
      
      toast({
        title: "Message envoyé",
        description: "Nous vous répondrons dans les plus brefs délais.",
        variant: "default",
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Un problème est survenu lors de l'envoi de votre message. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 bg-neutral-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">Contactez-nous</h2>
          <div className="w-20 h-1 bg-secondary mx-auto mb-4"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">Notre équipe est à votre disposition pour répondre à toutes vos questions et vous aider à organiser votre prochain voyage en Thaïlande.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-heading font-bold text-xl mb-4">Nos coordonnées</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt text-primary mt-1 mr-3 w-5 text-center"></i>
                <div>
                  <span className="block">Senthang Siam Tour</span>
                  <span className="text-gray-600">123 Sukhumvit Road, Bangkok, Thaïlande</span>
                </div>
              </li>
              <li className="flex items-center">
                <i className="fas fa-phone text-primary mr-3 w-5 text-center"></i>
                <span>+66 (0)2 123 4567</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-envelope text-primary mr-3 w-5 text-center"></i>
                <span>contact@senthangsiamtour.com</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-clock text-primary mr-3 w-5 text-center"></i>
                <span>Du lundi au samedi, 9h à 18h (GMT+7)</span>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="font-heading font-semibold mb-2">Suivez-nous</h4>
              <div className="flex space-x-3">
                <a href="#" className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary-dark transition-colors" aria-label="Facebook">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary-dark transition-colors" aria-label="Instagram">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary-dark transition-colors" aria-label="YouTube">
                  <i className="fab fa-youtube"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary-dark transition-colors" aria-label="WhatsApp">
                  <i className="fab fa-whatsapp"></i>
                </a>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
            <h3 className="font-heading font-bold text-xl mb-4">Envoyez-nous un message</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Votre nom</FormLabel>
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
                        <FormLabel>Votre email</FormLabel>
                        <FormControl>
                          <Input placeholder="Votre email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sujet</FormLabel>
                      <FormControl>
                        <Input placeholder="Sujet de votre message" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Votre message"
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
                  className="bg-primary text-white px-6 py-3 rounded-md font-heading font-semibold hover:bg-primary-dark transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
}
