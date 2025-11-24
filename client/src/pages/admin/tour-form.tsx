import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useIsAuthenticated } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslationSection } from "@/contexts/TranslationContext";
import { apiRequest } from "@/lib/queryClient";
import { Tour, insertTourSchema } from "@shared/schema";
import { z } from "zod";
import { formatTHB } from "@/lib/utils";

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
import { ImageUpload } from "@/components/ui/image-upload";

// Extended schema with validation - note: validation messages will be translated in the component
const tourFormSchema = insertTourSchema
  .extend({
    price: z.coerce.number().min(1),
    childPrice: z.coerce.number().optional(),
  });

type TourFormData = z.infer<typeof tourFormSchema>;

export default function TourForm() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const tourId = params.get('id') ? parseInt(params.get('id')!) : null;
  
  const { isAuthenticated, isLoading: authLoading } = useIsAuthenticated();
  const { toast } = useToast();
  const admin = useTranslationSection('admin');
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
      childPrice: undefined,
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
        childPrice: tour.childPrice || undefined, // Convertir null en undefined si nécessaire
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
          title: admin.tourForm?.tourUpdated || "Tour Updated",
          description: admin.tourForm?.tourUpdatedDescription || "The tour has been successfully updated",
          variant: "default",
        });
      } else {
        // Create new tour
        await apiRequest("POST", "/api/tours", data);
        toast({
          title: admin.tourForm?.tourCreated || "Tour Created",
          description: admin.tourForm?.tourCreatedDescription || "The new tour has been successfully created",
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
        title: admin.tourForm?.error || "Error",
        description: admin.tourForm?.errorDescription || "Failed to save the tour. Please try again.",
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
          <span data-testid="link-back-to-dashboard" className="inline-flex items-center text-primary hover:text-primary-dark mb-6 cursor-pointer">
            <ArrowLeft className="mr-2 h-5 w-5" />
            {admin.tourForm?.backToDashboard || "Back to Dashboard"}
          </span>
        </Link>
        
        <Card className="max-w-4xl mx-auto" data-testid="card-tour-form">
          <CardHeader>
            <CardTitle data-testid="text-tour-form-title">{tourId ? admin.tourForm?.editTour || "Edit Tour" : admin.tourForm?.addNewTour || "Add New Tour"}</CardTitle>
            <CardDescription data-testid="text-tour-form-description">
              {tourId 
                ? admin.tourForm?.editDescription || "Update the information for this tour"
                : admin.tourForm?.addDescription || "Fill in the details to create a new tour"}
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
                      <FormLabel>{admin.tourForm?.fields?.title || "Tour Title"}</FormLabel>
                      <FormControl>
                        <Input data-testid="input-tour-title" placeholder={admin.tourForm?.fields?.titlePlaceholder || "e.g. Island Hopping Adventure"} {...field} />
                      </FormControl>
                      <FormDescription>
                        {admin.tourForm?.fields?.titleDescription || "The main title of the tour"}
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
                        <FormLabel>{admin.tourForm?.fields?.duration || "Duration"}</FormLabel>
                        <FormControl>
                          <Input data-testid="input-duration" placeholder={admin.tourForm?.fields?.durationPlaceholder || "e.g. Full day (8 hours)"} {...field} />
                        </FormControl>
                        <FormDescription>
                          {admin.tourForm?.fields?.durationDescription || "How long the tour lasts"}
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
                        <FormLabel>{admin.tourForm?.fields?.adultPrice || "Adult Price"}</FormLabel>
                        <FormControl>
                          <Input data-testid="input-adult-price" type="number" min="0" placeholder={admin.tourForm?.fields?.adultPricePlaceholder || "2500"} {...field} />
                        </FormControl>
                        <FormDescription>
                          {admin.tourForm?.fields?.adultPriceDescription || "Price per adult in THB"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="childPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{admin.tourForm?.fields?.childPrice || "Child Price (optional)"}</FormLabel>
                      <FormControl>
                        <Input 
                          data-testid="input-child-price"
                          type="number" 
                          min="0" 
                          placeholder={admin.tourForm?.fields?.childPricePlaceholder || "1500"}
                          value={field.value || ''}
                          onChange={(e) => {
                            const value = e.target.value ? parseInt(e.target.value) : undefined;
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        {admin.tourForm?.fields?.childPriceDescription || "Price per child in THB (leave empty if same as adult)"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{admin.tourForm?.fields?.shortDescription || "Short Description"}</FormLabel>
                      <FormControl>
                        <Textarea 
                          data-testid="textarea-short-description"
                          placeholder={admin.tourForm?.fields?.shortDescriptionPlaceholder || "A brief overview of the tour..."}
                          rows={2}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        {admin.tourForm?.fields?.shortDescriptionDescription || "Brief summary shown in tour cards"}
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
                      <FormLabel>{admin.tourForm?.fields?.fullDescription || "Full Description"}</FormLabel>
                      <FormControl>
                        <Textarea 
                          data-testid="textarea-full-description"
                          placeholder={admin.tourForm?.fields?.fullDescriptionPlaceholder || "Detailed description of the tour, including highlights and what's included..."}
                          rows={6}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        {admin.tourForm?.fields?.fullDescriptionDescription || "Detailed information about the tour"}
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
                      <FormLabel>{admin.tourForm?.fields?.tourImage || "Tour Image"}</FormLabel>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <FormControl>
                            <Input 
                              data-testid="input-image-url"
                              placeholder={admin.tourForm?.fields?.imageUrlPlaceholder || "https://example.com/image.jpg"}
                              {...field} 
                              className="mb-2"
                            />
                          </FormControl>
                          <FormDescription>
                            {admin.tourForm?.fields?.imageUrlDescription || "Direct URL to the tour image, or use the upload feature below"}
                          </FormDescription>
                        </div>
                        <div>
                          <div className="border rounded-md p-4 bg-gray-50">
                            <p className="text-sm font-medium mb-2">{admin.tourForm?.fields?.uploadImage || "Upload Image"}</p>
                            {isAuthenticated ? (
                              <ImageUpload 
                                currentImage={field.value}
                                onUploadComplete={(url) => field.onChange(url)}
                              />
                            ) : (
                              <div data-testid="text-auth-required" className="text-amber-600 p-4 text-sm">
                                {admin.tourForm?.fields?.authRequired || "Authentication required to upload images"}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tourNinjaUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{admin.tourForm?.fields?.tourNinjaUrl || "TourNinja URL (optional)"}</FormLabel>
                      <FormControl>
                        <Input data-testid="input-tour-ninja-url" placeholder={admin.tourForm?.fields?.tourNinjaUrlPlaceholder || "https://www.tourninja.io/details/..."} {...field} />
                      </FormControl>
                      <FormDescription>
                        {admin.tourForm?.fields?.tourNinjaUrlDescription || "Link to the TourNinja booking page"}
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
                          data-testid="checkbox-featured"
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{admin.tourForm?.fields?.featuredTour || "Featured Tour"}</FormLabel>
                        <FormDescription>
                          {admin.tourForm?.fields?.featuredTourDescription || "Display this tour prominently on the homepage"}
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2">
                  <Button
                    data-testid="button-cancel"
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/admin/dashboard")}
                  >
                    {admin.tourForm?.cancel || "Cancel"}
                  </Button>
                  <Button 
                    data-testid="button-submit"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting 
                      ? admin.tourForm?.saving || "Saving..."
                      : tourId ? admin.tourForm?.update || "Update Tour" : admin.tourForm?.createTour || "Create Tour"}
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
