import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useTranslation } from 'react-i18next';
const cruiseFormSchema = z.object({
  fullName: z.string().min(2, "Full name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  numberOfGuests: z.number().min(1, "Minimum 1 passenger").max(8, "Maximum 8 passengers"),
  duration: z.string().min(1, "Duration required"),
  preferredDates: z.string().optional(),
  itinerary: z.string().optional(),
  budget: z.string().optional(),
  specialRequests: z.string().optional()
});
type CruiseFormData = {
  fullName: string;
  email: string;
  phone?: string;
  numberOfGuests: number;
  duration: string;
  preferredDates?: string;
  itinerary?: string;
  budget?: string;
  specialRequests?: string;
};
export default function CruiseForm() {
  const {
    t
  } = useTranslation();
  const {
    toast
  } = useToast();
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
      budget: "",
      specialRequests: ""
    }
  });

  // Generate WhatsApp message from form data
  const generateWhatsAppMessage = (data: CruiseFormData) => {
    const lines = ["🛥️ *Cruise Request - Amon Tour*", "", `👤 *Name:* ${data.fullName}`, `📧 *Email:* ${data.email}`];
    if (data.phone) {
      lines.push(`📱 *Phone:* ${data.phone}`);
    }
    lines.push(`👥 *Number of Guests:* ${data.numberOfGuests}`, `⏰ *Duration:* ${data.duration}`);
    if (data.preferredDates) {
      lines.push(`📅 *Preferred Dates:* ${data.preferredDates}`);
    }
    if (data.budget) {
      lines.push(`💰 *Budget:* ${data.budget}`);
    }
    if (data.itinerary) {
      lines.push(`🗺️ *Preferred Destinations:* ${data.itinerary}`);
    }
    if (data.specialRequests) {
      lines.push(`📝 *Special Requests:* ${data.specialRequests}`);
    }
    lines.push("", "Looking forward to creating an amazing cruise experience for you! 🌊");
    return encodeURIComponent(lines.join('\n'));
  };
  const handleWhatsAppContact = () => {
    const formData = form.getValues();

    // Validate required fields
    if (!formData.fullName || !formData.email || !formData.duration) {
      toast({
        title: t("Missing Information", {
          defaultValue: "Missing Information"
        }),
        description: t("Please fill in your name, email and preferred duration before contacting us.", {
          defaultValue: "Please fill in your name, email and preferred duration before contacting us."
        }),
        variant: "destructive"
      });
      return;
    }
    const message = generateWhatsAppMessage(formData);
    const whatsappUrl = `https://wa.me/66653496445?text=${message}`;
    window.open(whatsappUrl, '_blank');
    toast({
      title: t("Redirecting to WhatsApp", {
        defaultValue: "Redirecting to WhatsApp"
      }),
      description: t('We\'ve prepared your cruise request message for you!', {
        defaultValue: 'We\'ve prepared your cruise request message for you!'
      })
    });
  };
  return <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">{t('cruise.formTitle')}</h2>
        <div className="w-20 h-1 bg-secondary mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">{t('cruise.formSubtitle')}</p>
      </div>
      <Card className="w-full">
        <CardContent className="pt-6">
        <Form {...form}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="fullName" render={({
                field
              }) => <FormItem>
                    <FormLabel>{t('cruise.fullName')} *</FormLabel>
                    <FormControl>
                      <Input placeholder={t('cruise.fullNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              <FormField control={form.control} name="email" render={({
                field
              }) => <FormItem>
                    <FormLabel>{t('cruise.email')} *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t('cruise.emailPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="phone" render={({
                field
              }) => <FormItem>
                    <FormLabel>{t('cruise.phoneNumber')}</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder={t('cruise.phonePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              <FormField control={form.control} name="numberOfGuests" render={({
                field
              }) => <FormItem>
                    <FormLabel>{t('cruise.numberOfPassengers')}</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="8" {...field} />
                    </FormControl>
                    <FormDescription>{t('cruise.maximumPassengers')}</FormDescription>
                    <FormMessage />
                  </FormItem>} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="duration" render={({
                field
              }) => <FormItem>
                    <FormLabel>{t('cruise.desiredDuration')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('cruise.chooseDuration')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1 day">{t('cruise.oneDay')}</SelectItem>
                        <SelectItem value="2 days">{t('cruise.twoDays')}</SelectItem>
                        <SelectItem value="3-4 days">{t('cruise.threeFourDays')}</SelectItem>
                        <SelectItem value="5-6 days">{t('cruise.fiveSixDays')}</SelectItem>
                        <SelectItem value="7+ days">{t('cruise.sevenPlusDays')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>} />
              
              <FormField control={form.control} name="preferredDates" render={({
                field
              }) => <FormItem>
                    <FormLabel>{t('cruise.preferredDates')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('cruise.datesPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
            </div>

            <FormField control={form.control} name="budget" render={({
              field
            }) => <FormItem>
                  <FormLabel>{t('cruise.approximateBudget')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('cruise.selectSeason')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">{t('cruise.lowSeasonOption')}</SelectItem>
                      <SelectItem value="high">{t('cruise.highSeasonOption')}</SelectItem>
                      <SelectItem value="very_high">{t('cruise.veryHighSeasonOption')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>} />

            <FormField control={form.control} name="itinerary" render={({
              field
            }) => <FormItem>
                  <FormLabel>{t('cruise.preferredDestinations')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('cruise.destinationsPlaceholder')} className="min-h-[80px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <FormField control={form.control} name="specialRequests" render={({
              field
            }) => <FormItem>
                  <FormLabel>{t('cruise.specialRequests')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('cruise.specialRequestsPlaceholder')} className="min-h-[80px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            {/* WhatsApp Contact Button */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600 mb-3">
                {t('cruise.orContactDirectly')}
              </p>
              <button onClick={handleWhatsAppContact} className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-md font-heading font-semibold transition-colors duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                <i className="fab fa-whatsapp text-xl" aria-hidden="true"></i>
                {t('cruise.contactWhatsApp')}
              </button>
            </div>
          </div>
        </Form>
      </CardContent>
    </Card>
    </div>;
}