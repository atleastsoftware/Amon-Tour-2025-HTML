import { useTranslation } from 'react-i18next';
import { useEffect } from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
export default function TermsConditions() {
  const { t } = useTranslation();

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return <>
      <Helmet>
        <title>{t('common.termsconditionsamont')}</title>
        <meta name="description" content="Terms and conditions for booking and using services offered by Amon Tour." />
      </Helmet>
      
      <Header />
      
      <main className="pt-8 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-6 text-center">{t('terms.title')}</h1>
          
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t('common.1generalterms')}</h2>
              <p className="mb-4">{t('common.thesetermsandconditi')}</p>
              <p className="mb-4">{t('common.byaccessingourwebsit')}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t('common.2bookingandreservati')}</h2>
              <p className="mb-4">{t('common.21allbookingsaresubj')}</p>
              <p className="mb-4">{t('common.22abookingisconfirme')}</p>
              <p className="mb-4">{t('common.23thepersonmakingthe')}</p>
              <p className="mb-4">{t('common.24allinformationprov')}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t('common.3payment')}</h2>
              <p className="mb-4">{t('common.31tosecureabookingad')}</p>
              <p className="mb-4">{t('common.32fullpaymentmustber')}</p>
              <p className="mb-4">{t('common.33paymentscanbemadev')}</p>
              <p className="mb-4">{t('common.34allpricesarequoted')}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t('common.4cancellationandrefu')}</h2>
              <p className="mb-4">{t('common.41cancellationbycust')}</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>{t('common.morethan30daysbefore')}</li>
                <li>15-30 days before the tour date: 70% refund</li>
                <li>7-14 days before the tour date: 50% refund</li>
                <li>{t('common.lessthan7daysbeforet')}</li>
              </ul>
              <p className="mb-4">{t('common.42cancellationbyamon')}</p>
              <p className="mb-4">{t('common.ifweneedtocancelatou')}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t('common.5tourmodifications')}</h2>
              <p className="mb-4">{t('common.51wereservetherightt')}</p>
              <p className="mb-4">{t('common.52insuchcaseswewillm')}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t('6. Traveler\'s Responsibilities', {
                defaultValue: '6. Traveler\'s Responsibilities'
              })}</h2>
              <p className="mb-4">{t('common.61youareresponsiblef')}</p>
              <p className="mb-4">{t('common.62youmustinformusofa')}</p>
              <p className="mb-4">{t('common.63travelinsuranceiss')}</p>
              <p className="mb-4">{t('common.64youmustcomplywitha')}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t('common.7limitationofliabili')}</h2>
              <p className="mb-4">{t('common.71whilewetakeallreas')}</p>
              <p className="mb-4">{t('common.72wearenotliablefora')}</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>{t('common.theactsoromissionsof')}</li>
                <li>{t('common.theactsoromissionsof')}</li>
                <li>{t('common.unusualorunforeseeab')}</li>
                <li>{t('common.aneventwhichweorours')}</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t('common.8copyrightandintelle')}</h2>
              <p className="mb-4">{t('common.81allcontentonourweb')}</p>
              <p className="mb-4">{t('common.82youmaynotreproduce')}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t('common.9websiteuse')}</h2>
              <p className="mb-4">{t('common.91youmayuseourwebsit')}</p>
              <p className="mb-4">{t('common.92youmustnotuseourwe')}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t('common.10governinglaw')}</h2>
              <p className="mb-4">{t('common.thesetermsandconditi')}</p>
            </section>
            
            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">{t('common.11contactinformation')}</h2>
              <p className="mb-4">{t('common.ifyouhaveanyquestion')}</p>
              <address className="not-italic mb-4">{t('common.flamebbcoltd')}<br />{t('common.2421moo1u2013nathaiu')}<br />{t('common.81000krabiu2013thail')}<br />{t('common.emailinfoamontourcom')}</address>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </>;
}