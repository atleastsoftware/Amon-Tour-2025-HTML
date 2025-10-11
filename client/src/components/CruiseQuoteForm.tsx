import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const cruiseQuoteSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(5, 'Phone number is required'),
  dates: z.string().optional(),
  guests: z.string().optional(),
  specialRequests: z.string().optional()
});

type CruiseQuoteFormData = z.infer<typeof cruiseQuoteSchema>;

interface CruiseQuoteFormProps {
  title?: string;
  subtitle?: string;
  titleColor?: string;
  subtitleColor?: string;
}

export default function CruiseQuoteForm({ 
  title = "Custom Quote Request",
  subtitle = "Share your preferences and we will create the perfect catamaran experience for you",
  titleColor = "#333333",
  subtitleColor = "#666666"
}: CruiseQuoteFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CruiseQuoteFormData>({
    resolver: zodResolver(cruiseQuoteSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      dates: '',
      guests: '',
      specialRequests: ''
    }
  });

  const onSubmit = async (data: CruiseQuoteFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.fullName,
          email: data.email,
          phone: data.phone,
          message: `
Cruise Quote Request

Preferred Dates: ${data.dates || 'Not specified'}
Number of Guests: ${data.guests || 'Not specified'}

Special Requests:
${data.specialRequests || 'None'}
          `.trim(),
          subject: 'Cruise Quote Request'
        }),
      });

      if (!response.ok) throw new Error('Failed to send request');

      toast({
        title: "Request Sent!",
        description: "We'll contact you soon with a personalized quote.",
      });

      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-white w-full">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <h2 
            className="text-3xl font-bold mb-4"
            style={{ color: titleColor }}
          >
            {title}
          </h2>
          <p 
            className="text-lg"
            style={{ color: subtitleColor }}
          >
            {subtitle}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone / WhatsApp</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+66 123 456 789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="dates"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Dates</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Dec 20-22, 2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Guests</FormLabel>
                    <FormControl>
                      <Input placeholder="Max 8 adults" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="specialRequests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Requests (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Dietary requirements, birthday celebration, etc."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Quote Request
            </Button>
          </form>
        </Form>
      </div>
    </section>
  );
}
