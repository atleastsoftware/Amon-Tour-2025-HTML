import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Loader2 } from "lucide-react";

export default function PrivacyPolicy() {
  const [fallbackToStatic, setFallbackToStatic] = useState(false);
  
  // Fetch legal page content from API
  const { data: pageContent, isLoading, error } = useQuery({
    queryKey: ['/api/public/legal-page/privacy-policy'],
    queryFn: async () => {
      const response = await fetch('/api/public/legal-page/privacy-policy');
      if (!response.ok) {
        if (response.status === 404) {
          setFallbackToStatic(true);
          return null;
        }
        throw new Error('Failed to fetch legal page');
      }
      return response.json();
    },
    retry: false
  });
  
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <>
        <Header />
        <main className="pt-8 pb-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // If API content is available, use it
  if (pageContent && !fallbackToStatic) {
    return (
      <>
        <Helmet>
          <title>{pageContent.seoTitle || pageContent.pageName} | Amon Tour</title>
          <meta name="description" content={pageContent.seoDescription || "Privacy policy and data protection information for Amon Tour website and services."} />
          {pageContent.seoKeywords && <meta name="keywords" content={pageContent.seoKeywords} />}
        </Helmet>
        
        <Header />
        
        <main className="pt-8 pb-16">
          <div className="container mx-auto px-4">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-6 text-center">
              {pageContent.title || pageContent.pageName}
            </h1>
            
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: pageContent.content }}
              />
            </div>
          </div>
        </main>
        
        <Footer />
      </>
    );
  }

  // Fallback to static content if API fails or page doesn't exist
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Amon Tour</title>
        <meta name="description" content="Privacy policy and data protection information for Amon Tour website and services." />
      </Helmet>
      
      <Header />
      
      <main className="pt-8 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-6 text-center">Privacy Policy</h1>
          
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">Data Protection</h2>
              <p className="mb-4">
                Flame BB Co., Ltd. is committed to preserving the confidentiality of information that may be provided 
                online by our website visitors and customers. This privacy policy explains how we collect, use, 
                and protect your personal information.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">Information Collection</h2>
              <p className="mb-4">
                We may collect personal information such as:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Name and contact details</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Travel preferences</li>
                <li>Booking information</li>
                <li>Payment details</li>
              </ul>
              <p className="mb-4">
                This information is collected when you:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Make a reservation or booking</li>
                <li>Request a custom tour</li>
                <li>Subscribe to our newsletter</li>
                <li>Contact us via our contact form or WhatsApp</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">Use of Information</h2>
              <p className="mb-4">
                The information we collect is used for:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Processing your tour bookings and requests</li>
                <li>Communicating with you about your travel arrangements</li>
                <li>Providing customer support</li>
                <li>Sending you promotional offers and newsletters (if you have opted in)</li>
                <li>Improving our website and services</li>
                <li>Complying with legal requirements</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">Data Security</h2>
              <p className="mb-4">
                We implement appropriate security measures to protect your personal information against unauthorized 
                access, alteration, disclosure, or destruction. However, no method of transmission over the Internet 
                or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">Data Retention</h2>
              <p className="mb-4">
                We retain your personal information for as long as necessary to fulfill the purposes for which we 
                collected it, including for the purposes of satisfying any legal, accounting, or reporting requirements.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">Your Rights</h2>
              <p className="mb-4">
                Under applicable data protection laws, you have rights regarding your personal data, including:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>The right to access your personal information</li>
                <li>The right to correct inaccurate information</li>
                <li>The right to request deletion of your information</li>
                <li>The right to restrict or object to processing</li>
                <li>The right to data portability</li>
              </ul>
              <p className="mb-4">
                To exercise these rights, please contact us at the address below.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">Cookies</h2>
              <p className="mb-4">
                Our website uses cookies to enhance your browsing experience. You can set your browser to refuse 
                all or some browser cookies, but this may prevent some parts of our website from functioning properly.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">Third-Party Links</h2>
              <p className="mb-4">
                Our website may contain links to third-party websites. We are not responsible for the privacy 
                practices or content of these websites. We encourage you to read the privacy policies of these websites.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">Changes to This Policy</h2>
              <p className="mb-4">
                We may update this privacy policy from time to time. We will notify you of any significant changes 
                by posting the new policy on this page.
              </p>
            </section>
            
            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">Contact Information</h2>
              <p className="mb-4">
                If you have any questions about this privacy policy or our data practices, please contact us at:
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