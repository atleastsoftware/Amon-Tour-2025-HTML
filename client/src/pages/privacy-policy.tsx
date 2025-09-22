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
        <title>{t('common.privacypolicyamontou')}</title>
        <meta name="description" content="Privacy policy and data protection information for Amon Tour website and services." />
      </Helmet>
      
      <Header />
      
      <main className="pt-8 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-6 text-center">{t('privacy.title')}</h1>
          
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t('common.dataprotection')}</h2>
              <p className="mb-4">{t('common.flamebbcoltdiscommit')}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t('common.informationcollectio')}</h2>
              <p className="mb-4">{t('common.wemaycollectpersonal')}</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>{t('common.nameandcontactdetail')}</li>
                <li>{t('common.emailaddress')}</li>
                <li>{t('common.phonenumber')}</li>
                <li>{t('common.travelpreferences')}</li>
                <li>{t('common.bookinginformation')}</li>
                <li>{t('common.paymentdetails')}</li>
              </ul>
              <p className="mb-4">{t('common.thisinformationiscol')}</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>{t('common.makeareservationorbo')}</li>
                <li>{t('common.requestacustomtour')}</li>
                <li>{t('common.subscribetoournewsle')}</li>
                <li>{t('common.contactusviaourconta')}</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t('common.useofinformation')}</h2>
              <p className="mb-4">{t('common.theinformationwecoll')}</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>{t('common.processingyourtourbo')}</li>
                <li>{t('common.communicatingwithyou')}</li>
                <li>{t('common.providingcustomersup')}</li>
                <li>{t('common.sendingyoupromotiona')}</li>
                <li>{t('common.improvingourwebsitea')}</li>
                <li>{t('common.complyingwithlegalre')}</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t('common.datasecurity')}</h2>
              <p className="mb-4">{t('common.weimplementappropria')}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t('common.dataretention')}</h2>
              <p className="mb-4">{t('common.weretainyourpersonal')}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t('common.yourrights')}</h2>
              <p className="mb-4">{t('common.underapplicabledatap')}</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>{t('common.therighttoaccessyour')}</li>
                <li>{t('common.therighttocorrectina')}</li>
                <li>{t('common.therighttorequestdel')}</li>
                <li>{t('common.therighttorestrictor')}</li>
                <li>{t('common.therighttodataportab')}</li>
              </ul>
              <p className="mb-4">{t('common.toexercisetheseright')}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t('common.cookies')}</h2>
              <p className="mb-4">{t('common.ourwebsiteusescookie')}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t('common.thirdpartylinks')}</h2>
              <p className="mb-4">{t('common.ourwebsitemaycontain')}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t('common.changestothispolicy')}</h2>
              <p className="mb-4">{t('common.wemayupdatethispriva')}</p>
            </section>
            
            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">{t('common.contactinformation')}</h2>
              <p className="mb-4">{t('common.ifyouhaveanyquestion')}</p>
              <address className="not-italic mb-4">{t('common.flamebbcoltd')}<br />{t('common.2421moo1u2013nathaiu')}<br />{t('common.81000krabiu2013thail')}<br />{t('common.emailinfoamontourcom')}</address>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </>;
}