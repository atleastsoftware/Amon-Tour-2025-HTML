import sgMail from "@sendgrid/mail";

export async function sendFormNotification(type: string, data: any, requestId: number) {
  if (!process.env.SENDGRID_API_KEY) {
    console.info("SENDGRID_API_KEY absent, notification email ignorée");
    return;
  }
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const labels: Record<string, string> = {
    "krabi-celebration": "Nouvelle demande Krabi Celebration",
    partnership: "Nouvelle demande de partenariat",
    "group-corporate": "Nouvelle demande de groupe",
  };
  const subject = `${labels[type] || "Nouvelle demande"} - ${data.name || data.contactName || data.fullName || ""}`;
  const fields = Object.entries(data)
    .map(([key, value]) => `<p><strong>${key} :</strong> ${String(value ?? "")}</p>`).join("");
  try {
    await sgMail.send({
      to: "arckoeln@gmail.com", from: "noreply@amontour.com", subject,
      html: `<h2>${labels[type] || "Nouvelle demande"}</h2><p><strong>ID :</strong> #${requestId}</p>${fields}`,
    });
  } catch (error) {
    console.error("Échec d'envoi de la notification email :", error);
  }
}