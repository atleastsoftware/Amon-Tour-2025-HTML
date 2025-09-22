import { useTranslation } from 'react-i18next';
import { useEffect } from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
export default function LegalNotice() {
  const {
    t
  } = useTranslation();

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return <>
      <Helmet>
        <title>{t("Legalnoticeamontour", {
          defaultValue: "Legalnoticeamontour"
        })}</title>
        <meta name="description" content="Mentions légales et conditions d'utilisation du site Amon Tour." />
      </Helmet>
      
      <Header />
      
      <main className="pt-8 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-6 text-center">{t('legal.title')}</h1>
          
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t("Publisher", {
                defaultValue: "Publisher"
              })}</h2>
              <p className="mb-4">{t("Thewebsiteamontourco", {
                defaultValue: "Thewebsiteamontourco"
              })}</p>
              <p className="mb-4">
                <strong>{t("Publicationdirector", {
                  defaultValue: "Publicationdirector"
                })}</strong>{t("Ericmosnierthoumasin", {
                defaultValue: "Ericmosnierthoumasin"
              })}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t("Disclaimer", {
                defaultValue: "Disclaimer"
              })}</h2>
              <p className="mb-4">{t("Flamebbstrivestoensu", {
                defaultValue: "Flamebbstrivestoensu"
              })}</p>
              <p className="mb-4">{t("Consequentlyflamebbd", {
                defaultValue: "Consequentlyflamebbd"
              })}</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>for any interruption of the site</li>
                <li>for the occurrence of bugs</li>
                <li>for any inaccuracy or omission concerning information available on the site</li>
                <li>for any damage resulting from a fraudulent intrusion by a third party having led to a modification of the information made available on the site</li>
                <li>and more generally for any direct or indirect damage, whatever its causes, nature or consequences, including notably the costs that may arise from the acquisition of goods proposed on the site, loss of profits, customers, data, or any other loss of intangible assets that may occur due to anyone's access to the site or the impossibility of accessing it or the credit given to any information coming directly or indirectly from it.</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t("Protectionofpersonal", {
                defaultValue: "Protectionofpersonal"
              })}</h2>
              <p className="mb-4">{t("Flamebbiscommittedto", {
                defaultValue: "Flamebbiscommittedto"
              })}</p>
              <p className="mb-4">{t("Anypersonalinformati", {
                defaultValue: "Anypersonalinformati"
              })}</p>
              <address className="not-italic mb-4">{t("Flamebb", {
                defaultValue: "Flamebb"
              })}<br />{t("2421moo1u2013nathaiu", {
                defaultValue: "2421moo1u2013nathaiu"
              })}<br />{t("81000krabiu2013thail", {
                defaultValue: "81000krabiu2013thail"
              })}</address>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t("Links", {
                defaultValue: "Links"
              })}</h2>
              <p className="mb-4">{t("Thesitemayincludelin", {
                defaultValue: "Thesitemayincludelin"
              })}</p>
            </section>
            
            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">{t("Intellectualproperty", {
                defaultValue: "Intellectualproperty"
              })}</h2>
              <p className="mb-4">{t("Thesiteaswellasanyso", {
                defaultValue: "Thesiteaswellasanyso"
              })}</p>
            </section>
            
            <section className="mt-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t("Rightsandproperties", {
                defaultValue: "Rightsandproperties"
              })}</h2>
              <p className="mb-4">{t("Unlessotherwisestate", {
                defaultValue: "Unlessotherwisestate"
              })}<br />{t("Strictprohibitionofc", {
                defaultValue: "Strictprohibitionofc"
              })}<br />{t("Anyuseoutsideofthism", {
                defaultValue: "Anyuseoutsideofthism"
              })}</p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </>;
}