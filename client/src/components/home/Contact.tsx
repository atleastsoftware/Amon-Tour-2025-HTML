import { useTranslation } from 'react-i18next';
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
const contactSchema = z.object({
  name: z.string().min(2, {
    message: "Name is required"
  }),
  email: z.string().email({
    message: "Invalid email"
  }),
  subject: z.string().min(2, {
    message: "Subject is required"
  }),
  message: z.string().min(10, {
    message: "Message must contain at least 10 characters"
  })
});
type ContactFormData = z.infer<typeof contactSchema>;
export default function Contact() {
  const {
    t
  } = useTranslation();
  const {
    toast
  } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: ""
    }
  });
  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/contact-messages", data);
      toast({
        title: t("Message sent", {
          defaultValue: "Message sent"
        }),
        description: t("We will respond to your inquiry as soon as possible.", {
          defaultValue: "We will respond to your inquiry as soon as possible."
        }),
        variant: "default"
      });
      form.reset();
    } catch (error) {
      toast({
        title: t("Error", {
          defaultValue: "Error"
        }),
        description: t("There was a problem sending your request. Please try again.", {
          defaultValue: "There was a problem sending your request. Please try again."
        }),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <></>;
}