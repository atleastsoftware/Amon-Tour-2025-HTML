import omise from 'omise';
import { log } from './vite';

// Vérifier si les clés Omise sont présentes
if (!process.env.OMISE_SECRET_KEY) {
  throw new Error('OMISE_SECRET_KEY est requis dans les variables d\'environnement');
}

// Initialiser Omise avec la clé secrète
const omiseClient = omise({
  secretKey: process.env.OMISE_SECRET_KEY,
  publicKey: process.env.OMISE_PUBLIC_KEY
});

export interface CreateChargeParams {
  amount: number; // Montant en centimes (ex: 1000 pour 10.00 THB)
  currency?: string; // THB par défaut
  cardToken?: string; // Token de carte généré côté client
  customerName: string;
  customerEmail: string;
  description?: string;
  metadata?: Record<string, string>;
}

/**
 * Crée une charge Omise avec commission de 5% envoyée à un compte séparé
 */
export async function createChargeWithCommission({
  amount,
  currency = 'thb',
  cardToken,
  customerName,
  customerEmail,
  description = '',
  metadata = {}
}: CreateChargeParams) {
  try {
    // Calcul du montant principal et de la commission (5%)
    const baseAmount = amount;
    const commissionAmount = Math.round(amount * 0.05);
    const totalAmount = baseAmount + commissionAmount;

    log(`Création d'une charge Omise : ${totalAmount} ${currency.toUpperCase()} (dont ${commissionAmount} de commission)`);

    // Configurer les destinataires
    const recipients = [];
    
    // Ajouter le destinataire de la commission si configuré
    if (process.env.OMISE_RECEIVER_ID) {
      recipients.push({
        recipient: process.env.OMISE_RECEIVER_ID,
        amount: commissionAmount,
        description: "Commission de 5%"
      });
    }

    // Créer une charge avec transfert multi-destinataires
    const charge = await omiseClient.charges.create({
      amount: totalAmount,
      currency,
      card: cardToken,
      capture: true,
      metadata: {
        customerName,
        customerEmail,
        baseAmount: baseAmount.toString(),
        commissionAmount: commissionAmount.toString(),
        ...metadata
      },
      description: description || `Réservation pour ${customerName}`,
      // Spécifier les destinataires si nous avons un ID de receveur configuré
      ...(recipients.length > 0 ? { recipients } : {})
    });

    return {
      id: charge.id,
      status: charge.status,
      amount: totalAmount,
      baseAmount,
      commissionAmount,
      currency: charge.currency,
      paid: charge.paid,
      authorized: charge.authorized,
      transaction: charge.transaction,
      card: charge.card
    };
  } catch (error: any) {
    log(`Erreur lors de la création de la charge Omise : ${error.message}`);
    throw new Error(`Erreur de paiement Omise : ${error.message}`);
  }
}

/**
 * Vérifie le statut d'une charge Omise
 */
export async function checkChargeStatus(chargeId: string) {
  try {
    const charge = await omiseClient.charges.retrieve(chargeId);
    return {
      id: charge.id,
      status: charge.status,
      paid: charge.paid,
      amount: charge.amount,
      currency: charge.currency
    };
  } catch (error: any) {
    throw new Error(`Erreur lors de la vérification de la charge : ${error.message}`);
  }
}

/**
 * Crée un client Omise ou récupère un client existant
 */
export async function createOrRetrieveCustomer(name: string, email: string, cardToken?: string) {
  try {
    // Rechercher un client existant par email
    const existingCustomers = await omiseClient.customers.list({ email });
    
    if (existingCustomers.data && existingCustomers.data.length > 0) {
      const customer = existingCustomers.data[0];
      
      // Si un nouveau token de carte est fourni, mettre à jour la carte
      if (cardToken) {
        await omiseClient.customers.update(customer.id, {
          card: cardToken
        });
      }
      
      return customer;
    }
    
    // Créer un nouveau client
    const customer = await omiseClient.customers.create({
      name,
      email,
      ...(cardToken ? { card: cardToken } : {})
    });
    
    return customer;
  } catch (error: any) {
    throw new Error(`Erreur lors de la création/récupération du client : ${error.message}`);
  }
}

/**
 * Annule une charge Omise
 */
export async function cancelCharge(chargeId: string) {
  try {
    const charge = await omiseClient.charges.retrieve(chargeId);
    
    if (charge.status === 'pending' || charge.status === 'authorized') {
      const updatedCharge = await omiseClient.charges.update(chargeId, {
        reverse: true
      });
      return {
        id: updatedCharge.id,
        status: updatedCharge.status,
        reversed: updatedCharge.reversed
      };
    } else {
      throw new Error(`La charge ${chargeId} ne peut pas être annulée (statut: ${charge.status})`);
    }
  } catch (error: any) {
    throw new Error(`Erreur lors de l'annulation de la charge : ${error.message}`);
  }
}