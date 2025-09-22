import { useTranslation } from 'react-i18next';
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useStripe } from "@stripe/react-stripe-js";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
export default function PaymentComplete() {
  const {
    t
  } = useTranslation();
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'processing' | 'error' | 'loading'>('loading');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [, navigate] = useLocation();
  useEffect(() => {
    const fetchPaymentIntent = async () => {
      // Récupérer les paramètres de l'URL
      const url = new URL(window.location.href);
      const paymentIntentId = url.searchParams.get('payment_intent');
      const redirectStatus = url.searchParams.get('redirect_status');
      if (!paymentIntentId) {
        setPaymentStatus('error');
        setPaymentError("Impossible de trouver les informations de paiement");
        return;
      }
      if (redirectStatus === 'succeeded') {
        setPaymentStatus('success');
      } else if (redirectStatus === 'processing') {
        setPaymentStatus('processing');
      } else if (redirectStatus === 'requires_payment_method') {
        setPaymentStatus('error');
        setPaymentError("Le paiement a échoué. Veuillez réessayer avec une autre méthode de paiement.");
      } else {
        // Si aucun redirectStatus, vérifier directement avec Stripe
        try {
          const stripe = await stripePromise;
          if (!stripe) {
            throw new Error("Impossible de charger Stripe");
          }

          // Vérifier l'état du paiement
          // Note: Cette vérification est généralement faite côté serveur, mais nous simulons ici
          if (redirectStatus === 'succeeded') {
            setPaymentStatus('success');
          } else {
            // Par sécurité, marquer comme traitement en cours
            setPaymentStatus('processing');
          }
        } catch (error: any) {
          setPaymentStatus('error');
          setPaymentError(error.message || "Une erreur est survenue lors de la vérification du paiement");
        }
      }
    };
    fetchPaymentIntent();
  }, []);
  const renderContent = () => {
    switch (paymentStatus) {
      case 'loading':
        return <div className="flex flex-col items-center">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
            <h2 className="font-heading font-semibold text-2xl mb-2">{t("Vxe9rificationdupaie", {
              defaultValue: "Vxe9rificationdupaie"
            })}</h2>
            <p className="text-gray-600 text-center">{t('Merci de patienter pendant que nous v\xE9rifions l\'\xE9tat de votre paiement.', {
              defaultValue: 'Merci de patienter pendant que nous v\xE9rifions l\'\xE9tat de votre paiement.'
            })}</p>
          </div>;
      case 'success':
        return <div className="flex flex-col items-center">
            <CheckCircle className="h-16 w-16 text-secondary mb-4" />
            <h2 className="font-heading font-semibold text-2xl mb-2">{t("Paiementrxe9ussi", {
              defaultValue: "Paiementrxe9ussi"
            })}</h2>
            <p className="text-gray-600 text-center max-w-lg mb-6">{t('Merci pour votre r\xE9servation ! Vous allez recevoir un email de confirmation avec tous les d\xE9tails de votre tour. \n              N\'h\xE9sitez pas \xE0 nous contacter si vous avez des questions.', {
              defaultValue: 'Merci pour votre r\xE9servation ! Vous allez recevoir un email de confirmation avec tous les d\xE9tails de votre tour. \n              N\'h\xE9sitez pas \xE0 nous contacter si vous avez des questions.'
            })}</p>
            <div className="flex gap-4">
              <Button onClick={() => navigate("/")}>{t("Backtohome", {
                defaultValue: "Backtohome"
              })}</Button>
              <Button variant="outline" onClick={() => navigate("/tours")}>{t("Viewothertours", {
                defaultValue: "Viewothertours"
              })}</Button>
            </div>
          </div>;
      case 'processing':
        return <div className="flex flex-col items-center">
            <Clock className="h-16 w-16 text-secondary mb-4" />
            <h2 className="font-heading font-semibold text-2xl mb-2">{t("Paiementencoursdetra", {
              defaultValue: "Paiementencoursdetra"
            })}</h2>
            <p className="text-gray-600 text-center max-w-lg mb-6">{t("Votrepaiementestenco", {
              defaultValue: "Votrepaiementestenco"
            })}</p>
            <div className="flex gap-4">
              <Button onClick={() => navigate("/")}>{t("Backtohome", {
                defaultValue: "Backtohome"
              })}</Button>
            </div>
          </div>;
      case 'error':
        return <div className="flex flex-col items-center">
            <XCircle className="h-16 w-16 text-[hsl(var(--destructive))] mb-4" />
            <h2 className="font-heading font-semibold text-2xl mb-2">{t("Paiementxe9chouxe9", {
              defaultValue: "Paiementxe9chouxe9"
            })}</h2>
            <p className="text-gray-600 text-center max-w-lg mb-3">{t("Uneerreurestsurvenue", {
              defaultValue: "Uneerreurestsurvenue"
            })}</p>
            {paymentError && <p className="text-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.1)] p-3 rounded-md mb-6">
                {paymentError}
              </p>}
            <div className="flex gap-4">
              <Button onClick={() => navigate("/tours")}>{t("Backtotours", {
                defaultValue: "Backtotours"
              })}</Button>
              <Button variant="outline" onClick={() => window.history.back()}>{t("Tryagain", {
                defaultValue: "Tryagain"
              })}</Button>
            </div>
          </div>;
    }
  };
  return <>
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
          {renderContent()}
        </div>
      </main>
      
      <Footer />
    </>;
}