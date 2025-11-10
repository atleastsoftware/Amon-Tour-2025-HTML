import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { useTranslation } from "@/contexts/TranslationContext";

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
  countryCode: z.string().min(1, { message: "Country code is required" }),
  phoneNumber: z.string().min(8, { message: "Phone number is required" }),
  adults: z.string().min(1, { message: "Please enter number of adults" }),
  kids: z.string().optional(),
  dateRange: z.string().optional(),
  duration: z.string().optional(),
  tripTypes: z.array(z.string()).optional(),
  destinations: z.array(z.string()).optional(),
  message: z.string().min(10, { message: "Please describe your ideal trip (minimum 10 characters)" }),
}).refine(
  (data) => {
    // At least one of dateRange or duration must be provided
    return (data.dateRange && data.dateRange.trim() !== "") || 
           (data.duration && data.duration.trim() !== "");
  },
  {
    message: "Please provide either your trip dates or an approximate duration.",
    path: ["dateRange"], // This will show the error on the dateRange field
  }
).refine(
  (data) => {
    // At least one trip type or destination must be selected
    return (data.tripTypes && data.tripTypes.length > 0) || 
           (data.destinations && data.destinations.length > 0);
  },
  {
    message: "Please select at least one trip type or destination.",
    path: ["tripTypes"],
  }
);

type CustomTourFormData = z.infer<typeof customTourSchema>;

interface CustomTourFormProps {
  title?: string;
  subtitle?: string;
}

export default function CustomTourForm({ title, subtitle }: CustomTourFormProps = {}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const datePickerRef = useRef<HTMLInputElement | null>(null);
  const { translations } = useTranslation();
  const home = translations.home;

  const form = useForm<CustomTourFormData>({
    resolver: zodResolver(customTourSchema),
    defaultValues: {
      name: "",
      email: "",
      countryCode: "+33", // Default to France
      phoneNumber: "",
      adults: "",
      kids: "",
      dateRange: "",
      duration: "",
      tripTypes: [],
      destinations: [],
      message: "",
    },
  });

  const onSubmit = async (data: CustomTourFormData) => {
    setIsSubmitting(true);
    try {
      const requestData = {
        fullName: data.name,
        email: data.email,
        phoneNumber: `${data.countryCode} ${data.phoneNumber}`,
        numberOfAdults: parseInt(data.adults) || 1,
        numberOfKids: parseInt(data.kids || "0") || 0,
        tripDates: data.dateRange,
        duration: data.duration,
        tripTypes: data.tripTypes || [],
        destinations: data.destinations || [],
        message: data.message
      };
      await apiRequest("POST", "/api/custom-tour-requests", requestData);
      
      toast({
        title: translations.cruise.requestSent,
        description: translations.cruise.contactShortly,
        variant: "default",
      });
      
      form.reset();
      if (datePickerRef.current && (datePickerRef.current as any)._flatpickr) {
        (datePickerRef.current as any)._flatpickr.clear();
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: translations.common.error,
        description: translations.cruise.errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const tripTypeOptions = [
    { id: "culture", label: home.cultureHistory },
    { id: "nature", label: home.natureAdventure },
    { id: "beaches", label: home.beachesIslands },
    { id: "family", label: home.familyTrip },
    { id: "group", label: home.groupTrip },
    { id: "wedding", label: home.weddingHoneymoon },
  ];

  const destinationOptions = [
    { id: "khaosok", label: home.khaoSok },
    { id: "krabi", label: home.krabi },
    { id: "kohmook", label: home.kohMook },
    { id: "bangkok", label: home.bangkok },
    { id: "chiangmai", label: home.chiangMai },
    { id: "others", label: home.othersDestinations },
  ];

  const countryCodeOptions = [
    { code: "+33", country: "France", flag: "🇫🇷" },
    { code: "+66", country: "Thailand", flag: "🇹🇭" },
    { code: "+1", country: "USA/Canada", flag: "🇺🇸" },
    { code: "+44", country: "UK", flag: "🇬🇧" },
    { code: "+49", country: "Germany", flag: "🇩🇪" },
    { code: "+34", country: "Spain", flag: "🇪🇸" },
    { code: "+39", country: "Italy", flag: "🇮🇹" },
    { code: "+32", country: "Belgium", flag: "🇧🇪" },
    { code: "+31", country: "Netherlands", flag: "🇳🇱" },
    { code: "+41", country: "Switzerland", flag: "🇨🇭" },
    { code: "+43", country: "Austria", flag: "🇦🇹" },
    { code: "+351", country: "Portugal", flag: "🇵🇹" },
    { code: "+46", country: "Sweden", flag: "🇸🇪" },
    { code: "+47", country: "Norway", flag: "🇳🇴" },
    { code: "+45", country: "Denmark", flag: "🇩🇰" },
    { code: "+358", country: "Finland", flag: "🇫🇮" },
    { code: "+61", country: "Australia", flag: "🇦🇺" },
    { code: "+64", country: "New Zealand", flag: "🇳🇿" },
    { code: "+81", country: "Japan", flag: "🇯🇵" },
    { code: "+82", country: "South Korea", flag: "🇰🇷" },
    { code: "+86", country: "China", flag: "🇨🇳" },
    { code: "+91", country: "India", flag: "🇮🇳" },
  ];

  // Initialize flatpickr
  useEffect(() => {
    const timer = setTimeout(() => {
      if (datePickerRef.current && !(datePickerRef.current as any)._flatpickr) {
        console.log('Initializing flatpickr...');
        const fp = flatpickr(datePickerRef.current, {
          mode: "range" as const,
          dateFormat: "d/m/Y",
          minDate: "today",
          allowInput: false,
          clickOpens: true,
          static: false,
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

        console.log('Flatpickr initialized:', fp);
        
        return () => {
          if (fp) {
            fp.destroy();
          }
        };
      } else {
        console.log('Flatpickr not initialized:', { 
          hasRef: !!datePickerRef.current, 
          hasExisting: datePickerRef.current ? !!(datePickerRef.current as any)._flatpickr : false 
        });
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [form]);

  return (
    <section id="custom" className="py-16">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-gray-900 mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image Side */}
            <div className="h-64 md:h-auto relative">
              <img 
                src="/catamaran-cruise.png" 
                alt="Catamaran cruise in Thailand" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/70 to-transparent flex flex-col justify-center p-8 text-white">
                <h3 className="font-heading font-bold text-3xl mb-3">{home.customTripTitle}</h3>
                <p className="max-w-xs">{home.customTripSubtitle} {home.customTripDescription}</p>
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
                          <FormLabel>{home.fullName} *</FormLabel>
                          <FormControl>
                            <Input placeholder={translations.cruise.fullNamePlaceholder} {...field} />
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
                          <FormLabel>{home.email} *</FormLabel>
                          <FormControl>
                            <Input placeholder={translations.cruise.emailPlaceholder} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Phone Number with Country Code */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="countryCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{home.countryCode} *</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={home.countryCode} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {countryCodeOptions.map((option) => (
                                <SelectItem key={option.code} value={option.code}>
                                  {option.flag} {option.code}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{home.whatsappNumber} *</FormLabel>
                            <FormControl>
                              <Input placeholder={home.whatsappNumber} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="adults"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{home.numberOfAdults}</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={home.numberOfAdults} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                              <SelectItem value="4">4</SelectItem>
                              <SelectItem value="5">5</SelectItem>
                              <SelectItem value="6+">6+</SelectItem>
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
                          <FormLabel>{home.numberOfKids}</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={home.numberOfKidsLabel} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">0</SelectItem>
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                              <SelectItem value="4">4</SelectItem>
                              <SelectItem value="5+">5+</SelectItem>
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
                        <FormLabel>{home.datesOfTrip}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={translations.cruise.datesPlaceholder}
                            value={field.value || ''}
                            onChange={field.onChange}
                            ref={(el) => {
                              datePickerRef.current = el;
                            }}
                            onClick={() => {
                              if (datePickerRef.current && (datePickerRef.current as any)._flatpickr) {
                                (datePickerRef.current as any)._flatpickr.open();
                              }
                            }}
                            className="cursor-pointer"
                            data-testid="input-trip-dates"
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
                        <FormLabel>{home.approximateDuration}</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={translations.cruise.chooseDuration} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1-3">1-3 {translations.tours.duration}</SelectItem>
                            <SelectItem value="4-7">4-7 {translations.tours.duration}</SelectItem>
                            <SelectItem value="8-14">8-14 {translations.tours.duration}</SelectItem>
                            <SelectItem value="15+">15+ {translations.tours.duration}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Trip Types */}
                  <FormField
                    control={form.control}
                    name="tripTypes"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>{home.tripTypes}</FormLabel>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {tripTypeOptions.map((option) => (
                            <FormField
                              key={option.id}
                              control={form.control}
                              name="tripTypes"
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
                                            ? field.onChange([...(field.value || []), option.id])
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

                  {/* Destinations */}
                  <FormField
                    control={form.control}
                    name="destinations"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>{home.destinations}</FormLabel>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {destinationOptions.map((option) => (
                            <FormField
                              key={option.id}
                              control={form.control}
                              name="destinations"
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
                                            ? field.onChange([...(field.value || []), option.id])
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
                        <FormLabel>{home.describeIdealTrip}</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={home.describeIdealTrip}
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
                    data-testid="button-send-request"
                  >
                    {isSubmitting ? translations.cruise.sending : home.sendRequest}
                  </Button>
                  
                  {/* WhatsApp Contact Button */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-center text-sm text-gray-600 mb-3">
                      {home.orContactDirectly || "Or contact us directly via WhatsApp"}
                    </p>
                    <a
                      href="https://wa.me/66653496445?text=Hello%20Amon%20Tour,%20I%20would%20like%20to%20inquire%20about%20a%20custom%20tour."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-md font-heading font-semibold transition-colors duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <i className="fab fa-whatsapp text-xl" aria-hidden="true"></i>
                      {home.contactWhatsApp || "Contact via WhatsApp"}
                    </a>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
