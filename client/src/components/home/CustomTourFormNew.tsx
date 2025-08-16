import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const customTourSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  countryCode: z.string().min(1, "Country code required"),
  phoneNumber: z.string().min(8, "Phone number required"),
  message: z.string().min(10, "Please tell us about your ideal journey (minimum 10 characters)"),
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
      countryCode: "FR +33",
      phoneNumber: "",
      message: "",
    },
  });

  const onSubmit = async (data: CustomTourFormData) => {
    setIsSubmitting(true);
    try {
      const requestData = {
        fullName: data.name,
        email: data.email,
        phoneNumber: `${data.countryCode.replace(/[^+\d]/g, '')} ${data.phoneNumber}`,
        numberOfAdults: "2",
        numberOfKids: "0",
        tripDates: "",
        duration: "1 week",
        tripTypes: ["adventure"],
        destinations: ["krabi"],
        message: data.message
      };

      await apiRequest("POST", "/api/custom-tour", requestData);
      
      toast({
        title: "Request sent successfully",
        description: "Your custom tour request has been received. We will contact you within 24-48 hours to discuss your travel project.",
        variant: "default",
      });
      
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "There was a problem submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <h3 className="font-heading font-bold text-3xl mb-3">Create Your Custom Trip</h3>
                <p className="max-w-xs">Your travel story starts with your dreams – let us write the rest.</p>
              </div>
            </div>
            
            {/* Tour Ninja Widget */}
            <div className="w-full">
              <iframe 
                src="https://www.tourninja.io/amon-tour-styled"
                width="100%" 
                height="600"
                style={{ border: 0, borderRadius: '24px' }}
                title="Tour Ninja Booking Widget"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}