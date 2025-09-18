import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { translationService } from "@/services/translationService";

const cruiseFormSchema = z.object({
  fullName: z.string().min(2, "Full name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  numberOfGuests: z.number().min(1, "Minimum 1 passenger").max(8, "Maximum 8 passengers"),
  duration: z.string().min(1, "Duration required"),
  preferredDates: z.string().optional(),
  itinerary: z.string().optional(),
  specialRequests: z.string().optional(),
});

type CruiseFormData = {
  fullName: string;
  email: string;
  phone?: string;
  numberOfGuests: number;
  duration: string;
  preferredDates?: string;
  itinerary?: string;
  specialRequests?: string;
};

export default function CruiseForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const cruise = translationService.getCruise();
  
  const form = useForm<CruiseFormData>({
    resolver: zodResolver(cruiseFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      numberOfGuests: 2,
      duration: "",
      preferredDates: "",
      itinerary: "",
      specialRequests: "",
    },
  });

  const onSubmit = async (data: CruiseFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/cruise-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error sending request");
      }

      toast({
        title: cruise.requestSent,
        description: cruise.contactShortly,
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: cruise.error,
        description: cruise.errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">{cruise.title}</h2>
        <div className="w-20 h-1 bg-secondary mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">{cruise.subtitle}</p>
      </div>
      <Card className="w-full">
        <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{cruise.fullName} *</FormLabel>
                    <FormControl>
                      <Input placeholder={cruise.fullNamePlaceholder} {...field} />
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
                    <FormLabel>{cruise.email} *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={cruise.emailPlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{cruise.phoneNumber}</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder={cruise.phonePlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="numberOfGuests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{cruise.numberOfPassengers}</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="8" {...field} />
                    </FormControl>
                    <FormDescription>{cruise.maximumPassengers}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{cruise.desiredDuration}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={cruise.chooseDuration} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1 day">{cruise.oneDay}</SelectItem>
                        <SelectItem value="2 days">{cruise.twoDays}</SelectItem>
                        <SelectItem value="3-4 days">{cruise.threeFourDays}</SelectItem>
                        <SelectItem value="5-6 days">{cruise.fiveSixDays}</SelectItem>
                        <SelectItem value="7+ days">{cruise.sevenPlusDays}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="preferredDates"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{cruise.preferredDates}</FormLabel>
                    <FormControl>
                      <Input placeholder={cruise.datesPlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>


            <FormField
              control={form.control}
              name="itinerary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{cruise.preferredDestinations}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={cruise.destinationsPlaceholder} 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialRequests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{cruise.specialRequests}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={cruise.specialRequestsPlaceholder} 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {cruise.sending}
                </>
              ) : (
                cruise.sendRequest
              )}
            </Button>
          </form>
        </Form>
        
        {/* WhatsApp contact section */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-600 text-sm mb-3">{cruise.orContactDirectly}</p>
          <a
            href="https://wa.me/+66949155969"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            data-testid="whatsapp-cruise-contact"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
            {cruise.contactWhatsApp}
          </a>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}