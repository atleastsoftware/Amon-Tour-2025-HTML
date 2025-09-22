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
        <title>{t("Termsconditionsamont", {
          defaultValue: "Termsconditionsamont"
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
              <p className="mb-4">{t("Thesetermsandconditi", {
                defaultValue: "Thesetermsandconditi"
              })}</p>
              <p className="mb-4">{t("Byaccessingourwebsit", {
                defaultValue: "Byaccessingourwebsit"
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
                <li>{t("Morethan30daysbefore", {
                  defaultValue: "Morethan30daysbefore"
                })}</li>
                <li>15-30 days before the tour date: 70% refund</li>
                <li>7-14 days before the tour date: 50% refund</li>
                <li>{t("Lessthan7daysbeforet", {
                  defaultValue: "Lessthan7daysbeforet"
                })}</li>
              </ul>
              <p className="mb-4">{t("42cancellationbyamon", {
                defaultValue: "42cancellationbyamon"
              })}</p>
              <p className="mb-4">{t("Ifweneedtocancelatou", {
                defaultValue: "Ifweneedtocancelatou"
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
                <li>{t("Theactsoromissionsof", {
                  defaultValue: "Theactsoromissionsof"
                })}</li>
                <li>{t("Theactsoromissionsof", {
                  defaultValue: "Theactsoromissionsof"
                })}</li>
                <li>{t("Unusualorunforeseeab", {
                  defaultValue: "Unusualorunforeseeab"
                })}</li>
                <li>{t("Aneventwhichweorours", {
                  defaultValue: "Aneventwhichweorours"
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
              <p className="mb-4">{t("Thesetermsandconditi", {
                defaultValue: "Thesetermsandconditi"
              })}</p>
            </section>
            
            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">{t("11contactinformation", {
                defaultValue: "11contactinformation"
              })}</h2>
              <p className="mb-4">{t("Ifyouhaveanyquestion", {
                defaultValue: "Ifyouhaveanyquestion"
              })}</p>
              <address className="not-italic mb-4">{t("Flamebbcoltd", {
                defaultValue: "Flamebbcoltd"
              })}<br />{t("2421moo1u2013nathaiu", {
                defaultValue: "2421moo1u2013nathaiu"
              })}<br />{t("81000krabiu2013thail", {
                defaultValue: "81000krabiu2013thail"
              })}<br />{t("Emailinfoamontourcom", {
                defaultValue: "Emailinfoamontourcom"
              })}</address>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </>;
}