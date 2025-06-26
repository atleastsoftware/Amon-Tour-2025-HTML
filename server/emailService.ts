import sgMail from '@sendgrid/mail';

// Configuration SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Email de l'administrateur (vous pouvez le changer)
const ADMIN_EMAIL = 'arckoeln@gmail.com'; // Remplacez par votre email
const FROM_EMAIL = 'noreply@amontour.com'; // Email d'expédition

interface EmailNotificationData {
  type: 'krabi-celebration' | 'partnership' | 'group-corporate';
  data: any;
  requestId: number;
}

export async function sendNotificationEmail({ type, data, requestId }: EmailNotificationData): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SENDGRID_API_KEY not configured, skipping email notification');
    return false;
  }

  try {
    let subject = '';
    let htmlContent = '';

    switch (type) {
      case 'krabi-celebration':
        subject = `🎉 Nouvelle demande Krabi Celebration - ${data.name}`;
        htmlContent = `
          <h2>Nouvelle demande Krabi Celebration</h2>
          <p><strong>ID de la demande:</strong> #${requestId}</p>
          <hr>
          <p><strong>Nom:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          ${data.whatsapp ? `<p><strong>WhatsApp:</strong> ${data.whatsapp}</p>` : ''}
          <p><strong>Type de célébration:</strong> ${data.celebrationType}</p>
          <p><strong>Nombre d'invités:</strong> ${data.guests}</p>
          <p><strong>Date souhaitée:</strong> ${data.date}</p>
          ${data.budget ? `<p><strong>Budget:</strong> ${data.budget}</p>` : ''}
          ${data.description ? `<p><strong>Description:</strong><br>${data.description}</p>` : ''}
          <hr>
          <p><em>Reçu le ${new Date().toLocaleString('fr-FR')}</em></p>
        `;
        break;

      case 'partnership':
        subject = `🤝 Nouvelle demande de partenariat - ${data.companyName}`;
        htmlContent = `
          <h2>Nouvelle demande de partenariat</h2>
          <p><strong>ID de la demande:</strong> #${requestId}</p>
          <hr>
          <p><strong>Contact:</strong> ${data.contactName}</p>
          <p><strong>Entreprise:</strong> ${data.companyName}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          ${data.phone ? `<p><strong>Téléphone:</strong> ${data.phone}</p>` : ''}
          ${data.website ? `<p><strong>Site web:</strong> ${data.website}</p>` : ''}
          <p><strong>Type de partenariat:</strong> ${data.partnershipType}</p>
          ${data.description ? `<p><strong>Description:</strong><br>${data.description}</p>` : ''}
          <hr>
          <p><em>Reçu le ${new Date().toLocaleString('fr-FR')}</em></p>
        `;
        break;

      case 'group-corporate':
        subject = `👥 Nouvelle demande de groupe - ${data.companyName}`;
        htmlContent = `
          <h2>Nouvelle demande de voyage de groupe</h2>
          <p><strong>ID de la demande:</strong> #${requestId}</p>
          <hr>
          <p><strong>Contact:</strong> ${data.contactName}</p>
          <p><strong>Entreprise/Organisation:</strong> ${data.companyName}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          ${data.phone ? `<p><strong>Téléphone:</strong> ${data.phone}</p>` : ''}
          <p><strong>Taille du groupe:</strong> ${data.groupSize} personnes</p>
          ${data.travelDates ? `<p><strong>Dates de voyage:</strong> ${data.travelDates}</p>` : ''}
          ${data.budget ? `<p><strong>Budget:</strong> ${data.budget}</p>` : ''}
          ${data.description ? `<p><strong>Description:</strong><br>${data.description}</p>` : ''}
          <hr>
          <p><em>Reçu le ${new Date().toLocaleString('fr-FR')}</em></p>
        `;
        break;
    }

    const msg = {
      to: ADMIN_EMAIL,
      from: FROM_EMAIL,
      subject: subject,
      html: htmlContent,
    };

    await sgMail.send(msg);
    console.log(`Email notification sent successfully for ${type} request #${requestId}`);
    return true;

  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
}

// Fonction pour envoyer une confirmation au client
export async function sendConfirmationEmail(clientEmail: string, type: string, data: any): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SENDGRID_API_KEY not configured, skipping confirmation email');
    return false;
  }

  try {
    let subject = '';
    let htmlContent = '';

    switch (type) {
      case 'krabi-celebration':
        subject = 'Confirmation de votre demande Krabi Celebration';
        htmlContent = `
          <h2>Merci pour votre demande Krabi Celebration</h2>
          <p>Bonjour ${data.name},</p>
          <p>Nous avons bien reçu votre demande pour ${data.celebrationType}.</p>
          <p>Notre équipe vous contactera dans les 24 heures pour discuter de votre projet.</p>
          <hr>
          <p><strong>Récapitulatif de votre demande:</strong></p>
          <ul>
            <li>Type: ${data.celebrationType}</li>
            <li>Nombre d'invités: ${data.guests}</li>
            <li>Date souhaitée: ${data.date}</li>
            ${data.budget ? `<li>Budget: ${data.budget}</li>` : ''}
          </ul>
          <hr>
          <p>À bientôt,<br><strong>L'équipe Amon Tour</strong></p>
        `;
        break;

      case 'partnership':
        subject = 'Confirmation de votre demande de partenariat';
        htmlContent = `
          <h2>Merci pour votre proposition de partenariat</h2>
          <p>Bonjour ${data.contactName},</p>
          <p>Nous avons bien reçu votre demande de partenariat pour ${data.companyName}.</p>
          <p>Notre équipe commercial vous contactera sous 48 heures.</p>
          <hr>
          <p>À bientôt,<br><strong>L'équipe Amon Tour</strong></p>
        `;
        break;

      case 'group-corporate':
        subject = 'Confirmation de votre demande de voyage de groupe';
        htmlContent = `
          <h2>Merci pour votre demande de voyage de groupe</h2>
          <p>Bonjour ${data.contactName},</p>
          <p>Nous avons bien reçu votre demande pour ${data.companyName}.</p>
          <p>Notre équipe vous contactera dans les 24 heures avec une proposition personnalisée.</p>
          <hr>
          <p><strong>Récapitulatif:</strong></p>
          <ul>
            <li>Groupe de ${data.groupSize} personnes</li>
            ${data.travelDates ? `<li>Dates: ${data.travelDates}</li>` : ''}
            ${data.budget ? `<li>Budget: ${data.budget}</li>` : ''}
          </ul>
          <hr>
          <p>À bientôt,<br><strong>L'équipe Amon Tour</strong></p>
        `;
        break;
    }

    const msg = {
      to: clientEmail,
      from: FROM_EMAIL,
      subject: subject,
      html: htmlContent,
    };

    await sgMail.send(msg);
    console.log(`Confirmation email sent to ${clientEmail}`);
    return true;

  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return false;
  }
}