import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { useTranslation } from 'react-i18next';
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});
export default function NewsletterSubscription() {
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const {
    toast
  } = useToast();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isSuccess) return;
    try {
      // Validate email
      emailSchema.parse({
        email
      });
      setIsSubmitting(true);
      await apiRequest("POST", "/api/newsletter/subscribe", {
        email
      });
      setIsSuccess(true);
      setEmail("");
      toast({
        title: t('messages.subscriptionSuccess'),
        description: t('messages.subscriptionSuccessDesc'),
        variant: "default"
      });

      // Reset success state after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error: any) {
      let errorMessage = "Please try again later.";
      if (error.message.includes("already registered")) {
        errorMessage = t('forms.emailAlreadyRegistered');
      } else if (error.message.includes("valid email")) {
        errorMessage = t('forms.emailInvalid');
      } else if (error.message.includes("Too many")) {
        errorMessage = t('forms.tooManyAttempts');
      }
      toast({
        title: t('messages.subscriptionFailed'),
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (isSuccess) {
    return <motion.div className="mb-4 text-center" initial={{
      opacity: 0,
      y: 10
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.3
    }}>
        <div className="bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))] px-4 py-2 rounded-md border border-[hsl(var(--success)/0.2)]">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{t('messages.subscriptionSuccess')}</span>
          </div>
          <p className="text-sm mt-1">{t('messages.emailConfirmationRequested')}</p>
        </div>
      </motion.div>;
  }
  return <form className="mb-4" onSubmit={handleSubmit}>
      <div className="flex justify-center">
        <input type="email" placeholder={t('forms.placeholders.yourEmail')} value={email} onChange={e => setEmail(e.target.value)} disabled={isSubmitting} className="px-4 py-2 rounded-l-md w-full max-w-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed" required />
        <motion.button type="submit" disabled={isSubmitting || !email.trim()} className="px-4 py-2 rounded-r-md text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50" style={{
        backgroundColor: '#3BA8AF'
      }} onMouseEnter={e => !isSubmitting && (e.currentTarget.style.backgroundColor = '#2d8a94')} onMouseLeave={e => !isSubmitting && (e.currentTarget.style.backgroundColor = '#3BA8AF')} aria-label={t('Subscribe to newsletter', {
        defaultValue: 'Subscribe to newsletter'
      })} whileHover={!isSubmitting ? {
        scale: 1.05
      } : {}} whileTap={!isSubmitting ? {
        scale: 0.95
      } : {}}>
          {isSubmitting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <i className="fas fa-paper-plane"></i>}
        </motion.button>
      </div>
    </form>;
}