import Stripe from 'stripe';
import { Reservation, TourAvailability } from '@shared/schema';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

// Initialiser l'instance Stripe avec votre clé secrète API
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16' as any
});

export interface CreatePaymentIntentParams {
  amount: number;
  currency?: string;
  customerId?: string;
  description?: string;
  metadata?: Record<string, string>;
}

/**
 * Crée un PaymentIntent Stripe pour une réservation
 */
export async function createPaymentIntent({
  amount,
  currency = 'thb',
  customerId,
  description,
  metadata
}: CreatePaymentIntentParams) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Montant en centimes
      currency: currency,
      customer: customerId,
      description: description,
      metadata: metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    throw new Error(`Failed to create payment: ${error.message}`);
  }
}

/**
 * Crée ou récupère un client Stripe
 */
export async function createOrRetrieveCustomer(name: string, email: string, phone?: string) {
  // Recherche d'un client existant par email
  const customers = await stripe.customers.list({
    email: email,
    limit: 1
  });

  if (customers.data.length > 0) {
    return customers.data[0];
  }

  // Création d'un nouveau client
  const customer = await stripe.customers.create({
    name,
    email,
    phone
  });

  return customer;
}

/**
 * Vérifie le statut d'un paiement
 */
export async function checkPaymentStatus(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent.status;
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw new Error('Failed to check payment status');
  }
}

/**
 * Récupère le webhook Stripe pour traiter les événements
 */
export async function constructWebhookEvent(payload: string, signature: string, webhookSecret: string) {
  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error: any) {
    console.error('Error constructing webhook event:', error);
    throw new Error(`Webhook Error: ${error.message}`);
  }
}

/**
 * Annule un paiement Stripe
 */
export async function cancelPayment(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error cancelling payment:', error);
    throw new Error('Failed to cancel payment');
  }
}

/**
 * Crée un reçu ou facture pour une réservation confirmée
 */
export async function createInvoice(
  customerId: string, 
  description: string, 
  amount: number, 
  currency: string = 'thb',
  metadata?: Record<string, string>
) {
  try {
    // Créer un élément d'article pour l'invoice
    const invoiceItem = await stripe.invoiceItems.create({
      customer: customerId,
      amount: Math.round(amount * 100),
      currency: currency,
      description: description,
      metadata: metadata
    });
    
    // Créer et finaliser l'invoice
    const invoice = await stripe.invoices.create({
      customer: customerId,
      auto_advance: true,
      collection_method: 'send_invoice',
      days_until_due: 1,
      metadata: metadata
    });
    
    // Finaliser et envoyer l'invoice
    await stripe.invoices.finalizeInvoice(invoice.id);
    await stripe.invoices.sendInvoice(invoice.id);
    
    return invoice;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw new Error('Failed to create invoice');
  }
}

export default stripe;