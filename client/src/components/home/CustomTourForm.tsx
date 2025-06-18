import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";

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
  name: z.string().min(2, { message: "Full Name is required" }),
  email: z.string().email({ message: "Invalid email" }),
  phoneNumber: z.string().min(8, { message: "Phone number is required" }),
  adults: z.string().min(1, { message: "Please enter number of adults" }),
  kids: z.string().optional(),
  dateRange: z.string().optional(),
  duration: z.string().min(1, { message: "Please select the duration" }),
  interests: z.array(z.string()).min(1, { message: "Select at least one interest" }),
  message: z.string().min(10, { message: "Please describe your ideal trip (minimum 10 characters)" }),
});

type CustomTourFormData = z.infer<typeof customTourSchema>;

export default function CustomTourForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const datePickerRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<CustomTourFormData>({
    resolver: zodResolver(customTourSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      adults: "",
      kids: "",
      dateRange: "",
      duration: "",
      interests: [],
      message: "",
    },
  });

  const onSubmit = async (data: CustomTourFormData) => {
    setIsSubmitting(true);
    try {
      const requestData = {
        fullName: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        numberOfAdults: parseInt(data.adults) || 1,
        numberOfKids: parseInt(data.kids || "0") || 0,
        tripDates: data.dateRange,
        duration: data.duration,
        interests: data.interests,
        message: data.message
      };
      await apiRequest("POST", "/api/custom-tour", requestData);
      
      toast({
        title: "Request sent",
        description: "We will contact you very soon to discuss your travel project.",
        variant: "default",
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem sending your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const interestOptions = [
    { id: "culture", label: "Culture & History" },
    { id: "nature", label: "Nature & Adventure" },
    { id: "beaches", label: "Beaches & Islands" },
    { id: "food", label: "Gastronomy" },
    { id: "wellness", label: "Wellness & Spa" },
    { id: "shopping", label: "Shopping" },
  ];

  // Initialize flatpickr
  useEffect(() => {
    if (datePickerRef.current) {
      const fp = flatpickr(datePickerRef.current, {
        mode: "range" as const,
        dateFormat: "d/m/Y",
        allowInput: false,
        clickOpens: true,
        onChange: (selectedDates: Date[]) => {
          if (selectedDates.length === 2) {
            const startDate = selectedDates[0];
            const endDate = selectedDates[1];
            const formattedRange = `${startDate.toLocaleDateString('en-GB')} - ${endDate.toLocaleDateString('en-GB')}`;
            form.setValue('dateRange', formattedRange);
          } else if (selectedDates.length === 1) {
            const startDate = selectedDates[0];
            form.setValue('dateRange', startDate.toLocaleDateString('en-GB'));
          } else {
            form.setValue('dateRange', '');
          }
        }
      } as any);

      return () => {
        fp.destroy();
      };
    }
  }, [form]);

  return (
    <section id="custom" className="py-16">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image Side */}
            <div className="h-64 md:h-auto relative">
              <img 
                src="/catamaran-cruise.png" 
                alt="Catamaran cruise in Thailand" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/70 to-transparent flex flex-col justify-center p-8 text-white">
                <h3 className="font-heading font-bold text-3xl mb-3">Create Your Custom Journey</h3>
                <p className="max-w-xs">Tell us about your wishes and we'll design a tour tailored to your preferences.</p>
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
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
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
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input placeholder="Your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="Your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="adults"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of adults</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select number of adults" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">1 adult</SelectItem>
                              <SelectItem value="2">2 adults</SelectItem>
                              <SelectItem value="3">3 adults</SelectItem>
                              <SelectItem value="4">4 adults</SelectItem>
                              <SelectItem value="5">5 adults</SelectItem>
                              <SelectItem value="6+">6+ adults</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="kids"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of kids (under 12 years old)</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select number of kids" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">No kids</SelectItem>
                              <SelectItem value="1">1 kid</SelectItem>
                              <SelectItem value="2">2 kids</SelectItem>
                              <SelectItem value="3">3 kids</SelectItem>
                              <SelectItem value="4">4 kids</SelectItem>
                              <SelectItem value="5+">5+ kids</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="dateRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of trip</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Select trip dates"
                            value={field.value}
                            onChange={field.onChange}
                            ref={(el) => {
                              datePickerRef.current = el;
                              if (field.ref) field.ref(el);
                            }}
                            readOnly
                            className="cursor-pointer"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Approximate duration</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1-3">1-3 days</SelectItem>
                            <SelectItem value="4-7">4-7 days</SelectItem>
                            <SelectItem value="8-14">8-14 days</SelectItem>
                            <SelectItem value="15+">15+ days</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="interests"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Interests</FormLabel>
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
                        <FormLabel>Describe your ideal trip</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us what you would like to see and do during your journey..."
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
                    {isSubmitting ? "Sending..." : "Send my request"}
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
