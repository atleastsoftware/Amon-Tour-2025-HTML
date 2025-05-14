import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface OmisePaymentFormProps {
  amount: number;
  customerName: string;
  customerEmail: string;
  onSuccess: (chargeId: string) => void;
  onError: (error: Error) => void;
}

// Déclaration externe pour les types Omise chargés par le script
declare global {
  interface Window {
    OmiseCard?: {
      configure: (options: {
        publicKey: string;
        amount: number;
        currency: string;
        defaultPaymentMethod?: string;
        otherPaymentMethods?: string[];
      }) => void;
      open: (options: {
        frameLabel?: string;
        frameDescription?: string;
        amount: number;
        onCreateTokenSuccess: (token: string) => void;
        onFormClosed: () => void;
      }) => void;
      createToken: (type: string, callback: (statusCode: number, response: any) => void) => void;
    };
  }
}

export default function OmisePaymentForm({
  amount,
  customerName,
  customerEmail,
  onSuccess,
  onError
}: OmisePaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [cardName, setCardName] = useState(customerName);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  
  const { toast } = useToast();

  // Charger le script Omise.js
  useEffect(() => {
    if (!scriptLoaded) {
      const script = document.createElement('script');
      script.src = 'https://cdn.omise.co/omise.js';
      script.async = true;
      script.onload = () => {
        setScriptLoaded(true);
        if (window.OmiseCard && import.meta.env.VITE_OMISE_PUBLIC_KEY) {
          window.OmiseCard.configure({
            publicKey: import.meta.env.VITE_OMISE_PUBLIC_KEY,
            amount: amount,
            currency: 'thb'
          });
        }
      };
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [amount, scriptLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scriptLoaded || !window.OmiseCard) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le service de paiement n'est pas encore chargé. Veuillez réessayer."
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Créer un token de carte avec Omise
      window.OmiseCard.createToken('card', async (statusCode, response) => {
        if (statusCode !== 200 || response.object === 'error') {
          setIsLoading(false);
          toast({
            variant: "destructive",
            title: "Erreur de paiement",
            description: response.message || "Une erreur est survenue lors du traitement de votre paiement."
          });
          onError(new Error(response.message || "Erreur de paiement"));
          return;
        }

        // Token de carte créé avec succès
        const cardToken = response.id;
        
        try {
          // Envoyer le token au serveur pour créer une charge
          const result = await fetch('/api/payments/omise/charge', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              cardToken,
              amount,
              customerName,
              customerEmail
            })
          });
          
          const data = await result.json();
          
          if (!result.ok) {
            throw new Error(data.message || "Erreur lors du paiement");
          }
          
          // Paiement réussi
          toast({
            title: "Paiement réussi",
            description: "Votre paiement a été traité avec succès."
          });
          
          onSuccess(data.id);
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Erreur de paiement",
            description: error.message || "Une erreur est survenue lors du traitement de votre paiement."
          });
          onError(error);
        } finally {
          setIsLoading(false);
        }
      });
    } catch (error: any) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue."
      });
      onError(error);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="font-heading text-2xl font-semibold mb-4">Paiement sécurisé</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cardName">Nom sur la carte</Label>
            <Input
              id="cardName"
              name="cardName"
              data-name="nameOnCard"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="cardNumber">Numéro de carte</Label>
            <Input
              id="cardNumber"
              name="cardNumber"
              data-name="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cardExpiry">Date d'expiration (MM/AA)</Label>
              <Input
                id="cardExpiry"
                name="cardExpiry"
                data-name="expiryDate"
                placeholder="MM/AA"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="cardCVC">Code de sécurité (CVC)</Label>
              <Input
                id="cardCVC"
                name="cardCVC"
                data-name="securityCode"
                placeholder="123"
                value={cardCVC}
                onChange={(e) => setCardCVC(e.target.value)}
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full mt-6" 
            disabled={isLoading || !scriptLoaded}
          >
            {isLoading ? "Traitement en cours..." : `Payer ${(amount / 100).toFixed(2)} THB`}
          </Button>
          
          <div className="text-center text-sm text-gray-500 mt-4">
            Paiement sécurisé via Omise. Vos informations de carte sont protégées.
          </div>
        </form>
      </CardContent>
    </Card>
  );
}