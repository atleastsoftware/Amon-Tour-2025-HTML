import { useTranslation } from 'react-i18next';
import { useEffect } from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
export default function TermsConditions() {
  const {
    t
  } = useTranslation();

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return <>
      <Helmet>
        <title>{t("Terms & Conditions - Amon Tour", {
          defaultValue: "Terms & Conditions - Amon Tour"
        })}</title>
        <meta name="description" content="Terms and conditions for booking and using services offered by Amon Tour." />
      </Helmet>
      
      <Header />
      
      <main className="pt-8 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-6 text-center">{t('terms.title')}</h1>
          
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t("1generalterms", {
                defaultValue: "1generalterms"
              })}</h2>
              <p className="mb-4">{t("These Terms and Conditions govern your use of the Amon Tour website and services provided by \n                Flame BB Co., Ltd., a company registered in Thailand with TAT license number 34/01995.", {
                defaultValue: "These Terms and Conditions govern your use of the Amon Tour website and services provided by \n                Flame BB Co., Ltd., a company registered in Thailand with TAT license number 34/01995."
              })}</p>
              <p className="mb-4">{t("By accessing our website or using our services, you agree to be bound by these Terms and Conditions. \n                If you disagree with any part of these terms, please do not use our website or services.", {
                defaultValue: "By accessing our website or using our services, you agree to be bound by these Terms and Conditions. \n                If you disagree with any part of these terms, please do not use our website or services."
              })}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t("2bookingandreservati", {
                defaultValue: "2bookingandreservati"
              })}</h2>
              <p className="mb-4">{t("21allbookingsaresubj", {
                defaultValue: "21allbookingsaresubj"
              })}</p>
              <p className="mb-4">{t("22abookingisconfirme", {
                defaultValue: "22abookingisconfirme"
              })}</p>
              <p className="mb-4">{t("23thepersonmakingthe", {
                defaultValue: "23thepersonmakingthe"
              })}</p>
              <p className="mb-4">{t("24allinformationprov", {
                defaultValue: "24allinformationprov"
              })}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t("3payment", {
                defaultValue: "3payment"
              })}</h2>
              <p className="mb-4">{t("31tosecureabookingad", {
                defaultValue: "31tosecureabookingad"
              })}</p>
              <p className="mb-4">{t("32fullpaymentmustber", {
                defaultValue: "32fullpaymentmustber"
              })}</p>
              <p className="mb-4">{t("33paymentscanbemadev", {
                defaultValue: "33paymentscanbemadev"
              })}</p>
              <p className="mb-4">{t("34allpricesarequoted", {
                defaultValue: "34allpricesarequoted"
              })}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t("4cancellationandrefu", {
                defaultValue: "4cancellationandrefu"
              })}</h2>
              <p className="mb-4">{t("41cancellationbycust", {
                defaultValue: "41cancellationbycust"
              })}</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>{t("More than 30 days before the tour date: Full refund minus administrative fees", {
                  defaultValue: "More than 30 days before the tour date: Full refund minus administrative fees"
                })}</li>
                <li>15-30 days before the tour date: 70% refund</li>
                <li>7-14 days before the tour date: 50% refund</li>
                <li>{t("Less than 7 days before the tour date: No refund", {
                  defaultValue: "Less than 7 days before the tour date: No refund"
                })}</li>
              </ul>
              <p className="mb-4">{t("42cancellationbyamon", {
                defaultValue: "42cancellationbyamon"
              })}</p>
              <p className="mb-4">{t("If we need to cancel a tour due to unforeseen circumstances, adverse weather conditions, or \n                insufficient participants, we will offer you an alternative date or a full refund.", {
                defaultValue: "If we need to cancel a tour due to unforeseen circumstances, adverse weather conditions, or \n                insufficient participants, we will offer you an alternative date or a full refund."
              })}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t("5tourmodifications", {
                defaultValue: "5tourmodifications"
              })}</h2>
              <p className="mb-4">{t("51wereservetherightt", {
                defaultValue: "51wereservetherightt"
              })}</p>
              <p className="mb-4">{t("52insuchcaseswewillm", {
                defaultValue: "52insuchcaseswewillm"
              })}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t('6. Traveler\'s Responsibilities', {
                defaultValue: '6. Traveler\'s Responsibilities'
              })}</h2>
              <p className="mb-4">{t("61youareresponsiblef", {
                defaultValue: "61youareresponsiblef"
              })}</p>
              <p className="mb-4">{t("62youmustinformusofa", {
                defaultValue: "62youmustinformusofa"
              })}</p>
              <p className="mb-4">{t("63travelinsuranceiss", {
                defaultValue: "63travelinsuranceiss"
              })}</p>
              <p className="mb-4">{t("64youmustcomplywitha", {
                defaultValue: "64youmustcomplywitha"
              })}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t("7limitationofliabili", {
                defaultValue: "7limitationofliabili"
              })}</h2>
              <p className="mb-4">{t("71whilewetakeallreas", {
                defaultValue: "71whilewetakeallreas"
              })}</p>
              <p className="mb-4">{t("72wearenotliablefora", {
                defaultValue: "72wearenotliablefora"
              })}</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>{t("The acts or omissions of the person affected or any member of their party", {
                  defaultValue: "The acts or omissions of the person affected or any member of their party"
                })}</li>
                <li>{t("The acts or omissions of the person affected or any member of their party", {
                  defaultValue: "The acts or omissions of the person affected or any member of their party"
                })}</li>
                <li>{t("Unusual or unforeseeable circumstances beyond our control", {
                  defaultValue: "Unusual or unforeseeable circumstances beyond our control"
                })}</li>
                <li>{t("An event which we or our suppliers could not have foreseen or forestalled even with all due care", {
                  defaultValue: "An event which we or our suppliers could not have foreseen or forestalled even with all due care"
                })}</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t("8copyrightandintelle", {
                defaultValue: "8copyrightandintelle"
              })}</h2>
              <p className="mb-4">{t("81allcontentonourweb", {
                defaultValue: "81allcontentonourweb"
              })}</p>
              <p className="mb-4">{t("82youmaynotreproduce", {
                defaultValue: "82youmaynotreproduce"
              })}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t("9websiteuse", {
                defaultValue: "9websiteuse"
              })}</h2>
              <p className="mb-4">{t("91youmayuseourwebsit", {
                defaultValue: "91youmayuseourwebsit"
              })}</p>
              <p className="mb-4">{t("92youmustnotuseourwe", {
                defaultValue: "92youmustnotuseourwe"
              })}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t("10governinglaw", {
                defaultValue: "10governinglaw"
              })}</h2>
              <p className="mb-4">{t("These Terms and Conditions govern your use of the Amon Tour website and services provided by \n                Flame BB Co., Ltd., a company registered in Thailand with TAT license number 34/01995.", {
                defaultValue: "These Terms and Conditions govern your use of the Amon Tour website and services provided by \n                Flame BB Co., Ltd., a company registered in Thailand with TAT license number 34/01995."
              })}</p>
            </section>
            
            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">{t("11contactinformation", {
                defaultValue: "11contactinformation"
              })}</h2>
              <p className="mb-4">{t("If you have any questions about this privacy policy or our data practices, please contact us at:", {
                defaultValue: "If you have any questions about this privacy policy or our data practices, please contact us at:"
              })}</p>
              <address className="not-italic mb-4">{t("Flame BB Co., Ltd.", {
                defaultValue: "Flame BB Co., Ltd."
              })}<br />{t("2421moo1u2013nathaiu", {
                defaultValue: "2421moo1u2013nathaiu"
              })}<br />{t("81000krabiu2013thail", {
                defaultValue: "81000krabiu2013thail"
              })}<br />{t("Email: info@amon-tour.com", {
                defaultValue: "Email: info@amon-tour.com"
              })}</address>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </>;
}