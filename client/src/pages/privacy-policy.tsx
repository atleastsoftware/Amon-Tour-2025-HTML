import { useTranslation } from 'react-i18next';
import { useEffect } from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
export default function PrivacyPolicy() {
  const { t } = useTranslation();

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return <>
      <Helmet>
        <title>{t('Privacy Policy | Amon Tour', {
          defaultValue: 'Privacy Policy | Amon Tour'
        })}</title>
        <meta name="description" content="Privacy policy and data protection information for Amon Tour website and services." />
      </Helmet>
      
      <Header />
      
      <main className="pt-8 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-6 text-center">{t('Privacy Policy', {
            defaultValue: 'Privacy Policy'
          })}</h1>
          
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t('Data Protection', {
                defaultValue: 'Data Protection'
              })}</h2>
              <p className="mb-4">{t('Flame BB Co., Ltd. is committed to preserving the confidentiality of information that may be provided \n                online by our website visitors and customers. This privacy policy explains how we collect, use, \n                and protect your personal information.', {
                defaultValue: 'Flame BB Co., Ltd. is committed to preserving the confidentiality of information that may be provided \n                online by our website visitors and customers. This privacy policy explains how we collect, use, \n                and protect your personal information.'
              })}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t('Information Collection', {
                defaultValue: 'Information Collection'
              })}</h2>
              <p className="mb-4">{t('We may collect personal information such as:', {
                defaultValue: 'We may collect personal information such as:'
              })}</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>{t('Name and contact details', {
                  defaultValue: 'Name and contact details'
                })}</li>
                <li>{t('Email address', {
                  defaultValue: 'Email address'
                })}</li>
                <li>{t('Phone number', {
                  defaultValue: 'Phone number'
                })}</li>
                <li>{t('Travel preferences', {
                  defaultValue: 'Travel preferences'
                })}</li>
                <li>{t('Booking information', {
                  defaultValue: 'Booking information'
                })}</li>
                <li>{t('Payment details', {
                  defaultValue: 'Payment details'
                })}</li>
              </ul>
              <p className="mb-4">{t('This information is collected when you:', {
                defaultValue: 'This information is collected when you:'
              })}</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>{t('Make a reservation or booking', {
                  defaultValue: 'Make a reservation or booking'
                })}</li>
                <li>{t('Request a custom tour', {
                  defaultValue: 'Request a custom tour'
                })}</li>
                <li>{t('Subscribe to our newsletter', {
                  defaultValue: 'Subscribe to our newsletter'
                })}</li>
                <li>{t('Contact us via our contact form or WhatsApp', {
                  defaultValue: 'Contact us via our contact form or WhatsApp'
                })}</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t('Use of Information', {
                defaultValue: 'Use of Information'
              })}</h2>
              <p className="mb-4">{t('The information we collect is used for:', {
                defaultValue: 'The information we collect is used for:'
              })}</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>{t('Processing your tour bookings and requests', {
                  defaultValue: 'Processing your tour bookings and requests'
                })}</li>
                <li>{t('Communicating with you about your travel arrangements', {
                  defaultValue: 'Communicating with you about your travel arrangements'
                })}</li>
                <li>{t('Providing customer support', {
                  defaultValue: 'Providing customer support'
                })}</li>
                <li>{t('Sending you promotional offers and newsletters (if you have opted in)', {
                  defaultValue: 'Sending you promotional offers and newsletters (if you have opted in)'
                })}</li>
                <li>{t('Improving our website and services', {
                  defaultValue: 'Improving our website and services'
                })}</li>
                <li>{t('Complying with legal requirements', {
                  defaultValue: 'Complying with legal requirements'
                })}</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t('Data Security', {
                defaultValue: 'Data Security'
              })}</h2>
              <p className="mb-4">{t('We implement appropriate security measures to protect your personal information against unauthorized \n                access, alteration, disclosure, or destruction. However, no method of transmission over the Internet \n                or electronic storage is 100% secure, and we cannot guarantee absolute security.', {
                defaultValue: 'We implement appropriate security measures to protect your personal information against unauthorized \n                access, alteration, disclosure, or destruction. However, no method of transmission over the Internet \n                or electronic storage is 100% secure, and we cannot guarantee absolute security.'
              })}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t('Data Retention', {
                defaultValue: 'Data Retention'
              })}</h2>
              <p className="mb-4">{t('We retain your personal information for as long as necessary to fulfill the purposes for which we \n                collected it, including for the purposes of satisfying any legal, accounting, or reporting requirements.', {
                defaultValue: 'We retain your personal information for as long as necessary to fulfill the purposes for which we \n                collected it, including for the purposes of satisfying any legal, accounting, or reporting requirements.'
              })}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t('Your Rights', {
                defaultValue: 'Your Rights'
              })}</h2>
              <p className="mb-4">{t('Under applicable data protection laws, you have rights regarding your personal data, including:', {
                defaultValue: 'Under applicable data protection laws, you have rights regarding your personal data, including:'
              })}</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>{t('The right to access your personal information', {
                  defaultValue: 'The right to access your personal information'
                })}</li>
                <li>{t('The right to correct inaccurate information', {
                  defaultValue: 'The right to correct inaccurate information'
                })}</li>
                <li>{t('The right to request deletion of your information', {
                  defaultValue: 'The right to request deletion of your information'
                })}</li>
                <li>{t('The right to restrict or object to processing', {
                  defaultValue: 'The right to restrict or object to processing'
                })}</li>
                <li>{t('The right to data portability', {
                  defaultValue: 'The right to data portability'
                })}</li>
              </ul>
              <p className="mb-4">{t('To exercise these rights, please contact us at the address below.', {
                defaultValue: 'To exercise these rights, please contact us at the address below.'
              })}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t('Cookies', {
                defaultValue: 'Cookies'
              })}</h2>
              <p className="mb-4">{t('Our website uses cookies to enhance your browsing experience. You can set your browser to refuse \n                all or some browser cookies, but this may prevent some parts of our website from functioning properly.', {
                defaultValue: 'Our website uses cookies to enhance your browsing experience. You can set your browser to refuse \n                all or some browser cookies, but this may prevent some parts of our website from functioning properly.'
              })}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t('Third-Party Links', {
                defaultValue: 'Third-Party Links'
              })}</h2>
              <p className="mb-4">{t('Our website may contain links to third-party websites. We are not responsible for the privacy \n                practices or content of these websites. We encourage you to read the privacy policies of these websites.', {
                defaultValue: 'Our website may contain links to third-party websites. We are not responsible for the privacy \n                practices or content of these websites. We encourage you to read the privacy policies of these websites.'
              })}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t('Changes to This Policy', {
                defaultValue: 'Changes to This Policy'
              })}</h2>
              <p className="mb-4">{t('We may update this privacy policy from time to time. We will notify you of any significant changes \n                by posting the new policy on this page.', {
                defaultValue: 'We may update this privacy policy from time to time. We will notify you of any significant changes \n                by posting the new policy on this page.'
              })}</p>
            </section>
            
            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">{t('Contact Information', {
                defaultValue: 'Contact Information'
              })}</h2>
              <p className="mb-4">{t('If you have any questions about this privacy policy or our data practices, please contact us at:', {
                defaultValue: 'If you have any questions about this privacy policy or our data practices, please contact us at:'
              })}</p>
              <address className="not-italic mb-4">{t('Flame BB Co., Ltd.', {
                defaultValue: 'Flame BB Co., Ltd.'
              })}<br />{t('242/1 Moo1 \u2013 Na Thai \u2013 Ao Nang', {
                defaultValue: '242/1 Moo1 \u2013 Na Thai \u2013 Ao Nang'
              })}<br />{t('81000 Krabi \u2013 Thailand', {
                defaultValue: '81000 Krabi \u2013 Thailand'
              })}<br />{t('Email: info@amon-tour.com', {
                defaultValue: 'Email: info@amon-tour.com'
              })}</address>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </>;
}