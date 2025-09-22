import { useTranslation } from 'react-i18next';
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
import { formatTHB } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { ImageUpload } from "@/components/ui/image-upload";

// Extended schema with validation
const tourFormSchema = insertTourSchema.extend({
  price: z.coerce.number().min(1, {
    message: "Price must be greater than 0"
  }),
  childPrice: z.coerce.number().optional()
});
type TourFormData = z.infer<typeof tourFormSchema>;
export default function TourForm() {
  const { t } = useTranslation();

  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const tourId = params.get('id') ? parseInt(params.get('id')!) : null;
  const {
    isAuthenticated,
    isLoading: authLoading
  } = useIsAuthenticated();
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    data: tour,
    isLoading: tourLoading
  } = useQuery<Tour>({
    queryKey: [`/api/tours/${tourId}`],
    enabled: !!tourId
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
      featured: false
    }
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
        childPrice: tour.childPrice || undefined,
        // Convertir null en undefined si nécessaire
        imageUrl: tour.imageUrl,
        tourNinjaUrl: tour.tourNinjaUrl,
        featured: tour.featured
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
          title: t('Tour updated', {
            defaultValue: 'Tour updated'
          }),
          description: t('The tour has been successfully updated.', {
            defaultValue: 'The tour has been successfully updated.'
          }),
          variant: "default"
        });
      } else {
        // Create new tour
        await apiRequest("POST", "/api/tours", data);
        toast({
          title: t('Tour created', {
            defaultValue: 'Tour created'
          }),
          description: t('The new tour has been successfully created.', {
            defaultValue: 'The new tour has been successfully created.'
          }),
          variant: "default"
        });
      }

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: ['/api/tours']
      });
      queryClient.invalidateQueries({
        queryKey: ['/api/tours/featured']
      });

      // Redirect to dashboard
      setLocation("/admin/dashboard");
    } catch (error) {
      toast({
        title: t('Error', {
          defaultValue: 'Error'
        }),
        description: t('There was a problem saving the tour.', {
          defaultValue: 'There was a problem saving the tour.'
        }),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (authLoading || tourId && tourLoading) {
    return <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>;
  }
  if (!isAuthenticated) {
    return null; // Will redirect in the useEffect
  }
  return <div className="min-h-screen bg-neutral-light py-8">
      <div className="container mx-auto px-4">
        <Link href="/admin/dashboard">
          <span className="inline-flex items-center text-primary hover:text-primary-dark mb-6 cursor-pointer">
            <ArrowLeft className="mr-2 h-5 w-5" />{t('Back to dashboard', {
            defaultValue: 'Back to dashboard'
          })}</span>
        </Link>
        
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>{tourId ? "Edit tour" : "Add new tour"}</CardTitle>
            <CardDescription>
              {tourId ? "Modify information for the existing tour." : "Create a new tour to be displayed on the website."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="title" render={({
                field
              }) => <FormItem>
                      <FormLabel>{t('Title', {
                    defaultValue: 'Title'
                  })}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('Ex: Bangkok Essential', {
                    defaultValue: 'Ex: Bangkok Essential'
                  })} {...field} />
                      </FormControl>
                      <FormDescription>{t('The main title of the tour.', {
                    defaultValue: 'The main title of the tour.'
                  })}</FormDescription>
                      <FormMessage />
                    </FormItem>} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="duration" render={({
                  field
                }) => <FormItem>
                        <FormLabel>{t('Duration', {
                      defaultValue: 'Duration'
                    })}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('Ex: 3 days', {
                      defaultValue: 'Ex: 3 days'
                    })} {...field} />
                        </FormControl>
                        <FormDescription>{t('Duration of the tour (ex: 3 days, 5 days, etc.)', {
                      defaultValue: 'Duration of the tour (ex: 3 days, 5 days, etc.)'
                    })}</FormDescription>
                        <FormMessage />
                      </FormItem>} />
                  
                  <FormField control={form.control} name="price" render={({
                  field
                }) => <FormItem>
                        <FormLabel>{t('Adult Price (THB)', {
                      defaultValue: 'Adult Price (THB)'
                    })}</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" placeholder={t('Ex: 10000', {
                      defaultValue: 'Ex: 10000'
                    })} {...field} />
                        </FormControl>
                        <FormDescription>{t('Adult price in Thai Baht (without the \u0E3F symbol)', {
                      defaultValue: 'Adult price in Thai Baht (without the \u0E3F symbol)'
                    })}</FormDescription>
                        <FormMessage />
                      </FormItem>} />
                </div>
                
                <FormField control={form.control} name="childPrice" render={({
                field
              }) => <FormItem>
                      <FormLabel>{t('Child Price (THB) - Optional', {
                    defaultValue: 'Child Price (THB) - Optional'
                  })}</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" placeholder={t('Ex: 5000', {
                    defaultValue: 'Ex: 5000'
                  })} value={field.value || ''} onChange={e => {
                    const value = e.target.value ? parseInt(e.target.value) : undefined;
                    field.onChange(value);
                  }} />
                      </FormControl>
                      <FormDescription>{t('Special price for children in Thai Baht (leave empty if there is no special child price)', {
                    defaultValue: 'Special price for children in Thai Baht (leave empty if there is no special child price)'
                  })}</FormDescription>
                      <FormMessage />
                    </FormItem>} />
                
                <FormField control={form.control} name="shortDescription" render={({
                field
              }) => <FormItem>
                      <FormLabel>{t('Short Description', {
                    defaultValue: 'Short Description'
                  })}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t('Brief description of the tour (visible on cards)', {
                    defaultValue: 'Brief description of the tour (visible on cards)'
                  })} rows={2} {...field} />
                      </FormControl>
                      <FormDescription>{t('A short description that will appear on tour cards (max. 150 characters).', {
                    defaultValue: 'A short description that will appear on tour cards (max. 150 characters).'
                  })}</FormDescription>
                      <FormMessage />
                    </FormItem>} />
                
                <FormField control={form.control} name="description" render={({
                field
              }) => <FormItem>
                      <FormLabel>{t('Full Description', {
                    defaultValue: 'Full Description'
                  })}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t('Detailed description of the tour', {
                    defaultValue: 'Detailed description of the tour'
                  })} rows={6} {...field} />
                      </FormControl>
                      <FormDescription>{t('Detailed description of the tour that will appear on the details page.', {
                    defaultValue: 'Detailed description of the tour that will appear on the details page.'
                  })}</FormDescription>
                      <FormMessage />
                    </FormItem>} />
                
                <FormField control={form.control} name="imageUrl" render={({
                field
              }) => <FormItem>
                      <FormLabel>{t('Tour Image', {
                    defaultValue: 'Tour Image'
                  })}</FormLabel>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} className="mb-2" />
                          </FormControl>
                          <FormDescription>{t('Enter a URL for the main tour image, or use the uploader to the right.', {
                        defaultValue: 'Enter a URL for the main tour image, or use the uploader to the right.'
                      })}</FormDescription>
                        </div>
                        <div>
                          <div className="border rounded-md p-4 bg-gray-50">
                            <p className="text-sm font-medium mb-2">{t('Upload an image', {
                          defaultValue: 'Upload an image'
                        })}</p>
                            {isAuthenticated ? <ImageUpload currentImage={field.value} onUploadComplete={url => field.onChange(url)} /> : <div className="text-amber-600 p-4 text-sm">{t('Authentication required to upload images. Please use the URL field instead.', {
                          defaultValue: 'Authentication required to upload images. Please use the URL field instead.'
                        })}</div>}
                          </div>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>} />
                
                <FormField control={form.control} name="tourNinjaUrl" render={({
                field
              }) => <FormItem>
                      <FormLabel>{t('TOUR NINJA URL', {
                    defaultValue: 'TOUR NINJA URL'
                  })}</FormLabel>
                      <FormControl>
                        <Input placeholder="https://tourninja.com/tour/xyz" {...field} />
                      </FormControl>
                      <FormDescription>{t('The external link to the booking page on TOUR NINJA.', {
                    defaultValue: 'The external link to the booking page on TOUR NINJA.'
                  })}</FormDescription>
                      <FormMessage />
                    </FormItem>} />
                
                <FormField control={form.control} name="featured" render={({
                field
              }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{t('Featured Tour', {
                      defaultValue: 'Featured Tour'
                    })}</FormLabel>
                        <FormDescription>{t('Check this box to highlight this tour on the home page.', {
                      defaultValue: 'Check this box to highlight this tour on the home page.'
                    })}</FormDescription>
                      </div>
                    </FormItem>} />
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setLocation("/admin/dashboard")}>{t('Cancel', {
                    defaultValue: 'Cancel'
                  })}</Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : tourId ? "Update" : "Create tour"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>;
}