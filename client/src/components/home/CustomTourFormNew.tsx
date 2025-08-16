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
        numberOfAdults: 2,
        numberOfKids: 0,
        tripDates: "",
        duration: "",
        tripTypes: [],
        destinations: [],
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
            
            {/* Form Side - New Design */}
            <div className="bg-black text-white p-6">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Name and Email Row */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Input
                      placeholder="Your name"
                      {...form.register("name")}
                      className="bg-white text-black placeholder-gray-500 border-0 rounded-lg h-12 px-4"
                    />
                    {form.formState.errors.name && (
                      <p className="text-red-400 text-sm mt-1">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <Input
                      placeholder="Your email"
                      type="email"
                      {...form.register("email")}
                      className="bg-white text-black placeholder-gray-500 border-0 rounded-lg h-12 px-4"
                    />
                    {form.formState.errors.email && (
                      <p className="text-red-400 text-sm mt-1">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                </div>
                
                {/* Phone Row */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Select value={form.watch("countryCode")} onValueChange={(value) => form.setValue("countryCode", value)}>
                      <SelectTrigger className="bg-white text-black border-0 rounded-lg h-12 px-4">
                        <SelectValue placeholder="FR +33" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="FR +33">FR +33</SelectItem>
                        <SelectItem value="US +1">US +1</SelectItem>
                        <SelectItem value="UK +44">UK +44</SelectItem>
                        <SelectItem value="TH +66">TH +66</SelectItem>
                        <SelectItem value="DE +49">DE +49</SelectItem>
                        <SelectItem value="ES +34">ES +34</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input
                      placeholder="Your WhatsApp number"
                      {...form.register("phoneNumber")}
                      className="bg-white text-black placeholder-gray-500 border-0 rounded-lg h-12 px-4"
                    />
                    {form.formState.errors.phoneNumber && (
                      <p className="text-red-400 text-sm mt-1">{form.formState.errors.phoneNumber.message}</p>
                    )}
                  </div>
                </div>
                
                {/* Message */}
                <div>
                  <Textarea
                    placeholder="Tell us what you would like to see and do during your journey..."
                    {...form.register("message")}
                    className="bg-white text-black placeholder-gray-500 border-0 rounded-lg min-h-[100px] resize-none p-4"
                  />
                  {form.formState.errors.message && (
                    <p className="text-red-400 text-sm mt-1">{form.formState.errors.message.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-4 rounded-lg font-medium text-base transition-colors"
                >
                  {isSubmitting ? "Sending your request..." : "Send my request"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}