import { useEffect } from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function TermsConditions() {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Terms & Conditions | Amon Tour</title>
        <meta name="description" content="Terms and conditions for booking and using services offered by Amon Tour." />
      </Helmet>
      
      <Header />
      
      <main className="pt-8 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-6 text-center">Terms & Conditions</h1>
          
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">1. General Terms</h2>
              <p className="mb-4">
                These Terms and Conditions govern your use of the Amon Tour website and services provided by 
                Flame BB Co., Ltd., a company registered in Thailand with TAT license number 34/01995.
              </p>
              <p className="mb-4">
                By accessing our website or using our services, you agree to be bound by these Terms and Conditions. 
                If you disagree with any part of these terms, please do not use our website or services.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">2. Booking and Reservation</h2>
              <p className="mb-4">
                2.1 All bookings are subject to availability and confirmation.
              </p>
              <p className="mb-4">
                2.2 A booking is confirmed once we have received the required deposit or full payment, and 
                you have received a confirmation email from us.
              </p>
              <p className="mb-4">
                2.3 The person making the booking accepts these Terms and Conditions on behalf of all 
                members of the party and is responsible for all payments due.
              </p>
              <p className="mb-4">
                2.4 All information provided during the booking process must be accurate and complete.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">3. Payment</h2>
              <p className="mb-4">
                3.1 To secure a booking, a deposit of 30% of the total tour price is required, unless otherwise specified.
              </p>
              <p className="mb-4">
                3.2 Full payment must be received at least 7 days before the tour date, unless otherwise agreed.
              </p>
              <p className="mb-4">
                3.3 Payments can be made via the payment methods specified on our website or as communicated during the booking process.
              </p>
              <p className="mb-4">
                3.4 All prices are quoted in Thai Baht (THB) unless otherwise specified.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">4. Cancellation and Refund Policy</h2>
              <p className="mb-4">
                4.1 Cancellation by Customer:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>More than 30 days before the tour date: Full refund minus administrative fees</li>
                <li>15-30 days before the tour date: 70% refund</li>
                <li>7-14 days before the tour date: 50% refund</li>
                <li>Less than 7 days before the tour date: No refund</li>
              </ul>
              <p className="mb-4">
                4.2 Cancellation by Amon Tour:
              </p>
              <p className="mb-4">
                If we need to cancel a tour due to unforeseen circumstances, adverse weather conditions, or 
                insufficient participants, we will offer you an alternative date or a full refund.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">5. Tour Modifications</h2>
              <p className="mb-4">
                5.1 We reserve the right to modify tour itineraries, departure times, or duration due to 
                weather conditions, safety concerns, or other circumstances beyond our control.
              </p>
              <p className="mb-4">
                5.2 In such cases, we will make reasonable efforts to inform you as soon as possible.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">6. Traveler's Responsibilities</h2>
              <p className="mb-4">
                6.1 You are responsible for ensuring that you have valid documentation (passport, visa, etc.) 
                required for your travel.
              </p>
              <p className="mb-4">
                6.2 You must inform us of any medical conditions, dietary restrictions, or special requirements 
                at the time of booking.
              </p>
              <p className="mb-4">
                6.3 Travel insurance is strongly recommended for all participants.
              </p>
              <p className="mb-4">
                6.4 You must comply with all instructions given by our tour guides and staff for safety purposes.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
              <p className="mb-4">
                7.1 While we take all reasonable steps to ensure your safety, participation in tours and activities 
                involves some inherent risk.
              </p>
              <p className="mb-4">
                7.2 We are not liable for any injury, illness, death, loss, damage, expense, cost, or other claim 
                of any description which results from:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>The acts or omissions of the person affected or any member of their party</li>
                <li>The acts or omissions of a third party not connected with the provision of your tour</li>
                <li>Unusual or unforeseeable circumstances beyond our control</li>
                <li>An event which we or our suppliers could not have foreseen or forestalled even with all due care</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">8. Copyright and Intellectual Property</h2>
              <p className="mb-4">
                8.1 All content on our website, including text, graphics, logos, images, and software, is the 
                property of Flame BB Co., Ltd. and is protected by copyright and intellectual property laws.
              </p>
              <p className="mb-4">
                8.2 You may not reproduce, modify, distribute, or use any materials from our website without 
                our prior written consent.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">9. Website Use</h2>
              <p className="mb-4">
                9.1 You may use our website for lawful purposes only.
              </p>
              <p className="mb-4">
                9.2 You must not use our website in any way that causes, or may cause, damage to the website 
                or impairment of the availability or accessibility of the website.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">10. Governing Law</h2>
              <p className="mb-4">
                These Terms and Conditions are governed by and construed in accordance with the laws of Thailand. 
                Any disputes arising under these Terms and Conditions shall be subject to the exclusive jurisdiction 
                of the courts of Thailand.
              </p>
            </section>
            
            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">11. Contact Information</h2>
              <p className="mb-4">
                If you have any questions about these Terms and Conditions, please contact us at:
              </p>
              <address className="not-italic mb-4">
                Flame BB Co., Ltd.<br />
                242/1 Moo1 – Na Thai – Ao Nang<br />
                81000 Krabi – Thailand<br />
                Email: info@amon-tour.com
              </address>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}