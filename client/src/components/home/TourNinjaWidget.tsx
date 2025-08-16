import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const tourNinjaFormSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  countryCode: z.string().min(1, "Country code required"),
  phoneNumber: z.string().min(8, "Phone number required"),
  numberOfAdults: z.string().min(1, "Number of adults required"),
  numberOfKids: z.string().optional(),
  tripDates: z.string().optional(),
  duration: z.string().optional(),
  tripTypes: z.array(z.string()).optional(),
  message: z.string().min(10, "Please tell us about your ideal journey (minimum 10 characters)"),
});

type TourNinjaFormData = z.infer<typeof tourNinjaFormSchema>;

interface TourNinjaWidgetProps {
  className?: string;
}

export default function TourNinjaWidget({ className = "" }: TourNinjaWidgetProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTripTypes, setSelectedTripTypes] = useState<string[]>([]);

  const form = useForm<TourNinjaFormData>({
    resolver: zodResolver(tourNinjaFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      countryCode: "FR +33",
      phoneNumber: "",
      numberOfAdults: "",
      numberOfKids: "",
      tripDates: "",
      duration: "",
      tripTypes: [],
      message: "",
    },
  });

  const tripTypeOptions = [
    { id: "culture", label: "Culture & Heritage" },
    { id: "nature", label: "Nature & Wildlife" },
    { id: "beaches", label: "Beaches & Islands" },
    { id: "adventure", label: "Adventure & Sports" },
    { id: "food", label: "Food & Culinary" },
    { id: "wellness", label: "Wellness & Spa" }
  ];

  const handleTripTypeChange = (typeId: string, checked: boolean) => {
    let newTypes = [...selectedTripTypes];
    if (checked) {
      newTypes.push(typeId);
    } else {
      newTypes = newTypes.filter(t => t !== typeId);
    }
    setSelectedTripTypes(newTypes);
    form.setValue("tripTypes", newTypes);
  };

  const onSubmit = async (data: TourNinjaFormData) => {
    setIsSubmitting(true);
    try {
      const requestData = {
        fullName: data.fullName,
        email: data.email,
        phoneNumber: `${data.countryCode.replace(/[^+\d]/g, '')} ${data.phoneNumber}`,
        numberOfAdults: parseInt(data.numberOfAdults),
        numberOfKids: data.numberOfKids ? parseInt(data.numberOfKids) : 0,
        tripDates: data.tripDates || "",
        duration: data.duration || "",
        tripTypes: selectedTripTypes,
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
      setSelectedTripTypes([]);
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
    <div className={`tour-ninja-container ${className}`}>
      <div className="bg-black text-white p-6 rounded-lg">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name and Email Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                placeholder="Your name"
                {...form.register("fullName")}
                className="bg-white text-black placeholder-gray-500 border-0 rounded-lg h-12 px-4"
              />
              {form.formState.errors.fullName && (
                <p className="text-red-400 text-sm mt-1">{form.formState.errors.fullName.message}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="md:col-span-2">
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

          {/* Adults and Kids Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Select value={form.watch("numberOfAdults")} onValueChange={(value) => form.setValue("numberOfAdults", value)}>
                <SelectTrigger className="bg-white text-black border-0 rounded-lg h-12 px-4">
                  <SelectValue placeholder="Select number of adults" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="1">1 Adult</SelectItem>
                  <SelectItem value="2">2 Adults</SelectItem>
                  <SelectItem value="3">3 Adults</SelectItem>
                  <SelectItem value="4">4 Adults</SelectItem>
                  <SelectItem value="5">5+ Adults</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.numberOfAdults && (
                <p className="text-red-400 text-sm mt-1">{form.formState.errors.numberOfAdults.message}</p>
              )}
            </div>
            <div>
              <Select value={form.watch("numberOfKids")} onValueChange={(value) => form.setValue("numberOfKids", value)}>
                <SelectTrigger className="bg-white text-black border-0 rounded-lg h-12 px-4">
                  <SelectValue placeholder="Select number of kids" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="0">No kids</SelectItem>
                  <SelectItem value="1">1 Kid</SelectItem>
                  <SelectItem value="2">2 Kids</SelectItem>
                  <SelectItem value="3">3 Kids</SelectItem>
                  <SelectItem value="4">4+ Kids</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Trip Dates */}
          <div>
            <Input
              placeholder="Select trip dates"
              {...form.register("tripDates")}
              className="bg-white text-black placeholder-gray-500 border-0 rounded-lg h-12 px-4"
            />
          </div>

          {/* Duration */}
          <div>
            <Select value={form.watch("duration")} onValueChange={(value) => form.setValue("duration", value)}>
              <SelectTrigger className="bg-white text-black border-0 rounded-lg h-12 px-4">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="3 days">3 Days</SelectItem>
                <SelectItem value="5 days">5 Days</SelectItem>
                <SelectItem value="7 days">1 Week</SelectItem>
                <SelectItem value="10 days">10 Days</SelectItem>
                <SelectItem value="14 days">2 Weeks</SelectItem>
                <SelectItem value="21 days">3 Weeks</SelectItem>
                <SelectItem value="30 days">1 Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Trip Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {tripTypeOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-3">
                <Checkbox
                  id={option.id}
                  checked={selectedTripTypes.includes(option.id)}
                  onCheckedChange={(checked) => handleTripTypeChange(option.id, checked as boolean)}
                  className="border-blue-400 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 w-4 h-4"
                />
                <label
                  htmlFor={option.id}
                  className="text-sm text-white cursor-pointer select-none"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>

          {/* Message */}
          <div>
            <Textarea
              placeholder="Tell us what you would like to see and do during your journey..."
              {...form.register("message")}
              className="bg-white text-black placeholder-gray-500 border-0 rounded-lg min-h-[120px] resize-none p-4"
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
      
      {/* Info Message */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Your request will be processed immediately.</strong> Our local experts will contact you within 24-48 hours to discuss your personalized Thailand adventure.
        </p>
      </div>
    </div>
  );
}