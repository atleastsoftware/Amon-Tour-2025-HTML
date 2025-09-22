import { useTranslation } from 'react-i18next';
import { useEffect } from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
export default function PrivacyPolicy() {
  const {
    t
  } = useTranslation();

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return <>
      <Helmet>
        <title>{t("Privacypolicyamontou", {
          defaultValue: "Privacypolicyamontou"
        })}</title>
        <meta name="description" content="Privacy policy and data protection information for Amon Tour website and services." />
      </Helmet>
      
      <Header />
      
      <main className="pt-8 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-6 text-center">{t('privacy.title')}</h1>
          
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t("Dataprotection", {
                defaultValue: "Dataprotection"
              })}</h2>
              <p className="mb-4">{t("Flamebbcoltdiscommit", {
                defaultValue: "Flamebbcoltdiscommit"
              })}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t("Informationcollectio", {
                defaultValue: "Informationcollectio"
              })}</h2>
              <p className="mb-4">{t("Wemaycollectpersonal", {
                defaultValue: "Wemaycollectpersonal"
              })}</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>{t("Nameandcontactdetail", {
                  defaultValue: "Nameandcontactdetail"
                })}</li>
                <li>{t("Emailaddress", {
                  defaultValue: "Emailaddress"
                })}</li>
                <li>{t("Phonenumber", {
                  defaultValue: "Phonenumber"
                })}</li>
                <li>{t("Travelpreferences", {
                  defaultValue: "Travelpreferences"
                })}</li>
                <li>{t("Bookinginformation", {
                  defaultValue: "Bookinginformation"
                })}</li>
                <li>{t("Paymentdetails", {
                  defaultValue: "Paymentdetails"
                })}</li>
              </ul>
              <p className="mb-4">{t("Thisinformationiscol", {
                defaultValue: "Thisinformationiscol"
              })}</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>{t("Makeareservationorbo", {
                  defaultValue: "Makeareservationorbo"
                })}</li>
                <li>{t("Requestacustomtour", {
                  defaultValue: "Requestacustomtour"
                })}</li>
                <li>{t("Subscribetoournewsle", {
                  defaultValue: "Subscribetoournewsle"
                })}</li>
                <li>{t("Contactusviaourconta", {
                  defaultValue: "Contactusviaourconta"
                })}</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t("Useofinformation", {
                defaultValue: "Useofinformation"
              })}</h2>
              <p className="mb-4">{t("Theinformationwecoll", {
                defaultValue: "Theinformationwecoll"
              })}</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>{t("Processingyourtourbo", {
                  defaultValue: "Processingyourtourbo"
                })}</li>
                <li>{t("Communicatingwithyou", {
                  defaultValue: "Communicatingwithyou"
                })}</li>
                <li>{t("Providingcustomersup", {
                  defaultValue: "Providingcustomersup"
                })}</li>
                <li>{t("Sendingyoupromotiona", {
                  defaultValue: "Sendingyoupromotiona"
                })}</li>
                <li>{t("Improvingourwebsitea", {
                  defaultValue: "Improvingourwebsitea"
                })}</li>
                <li>{t("Complyingwithlegalre", {
                  defaultValue: "Complyingwithlegalre"
                })}</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t("Datasecurity", {
                defaultValue: "Datasecurity"
              })}</h2>
              <p className="mb-4">{t("Weimplementappropria", {
                defaultValue: "Weimplementappropria"
              })}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t("Dataretention", {
                defaultValue: "Dataretention"
              })}</h2>
              <p className="mb-4">{t("Weretainyourpersonal", {
                defaultValue: "Weretainyourpersonal"
              })}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t("Yourrights", {
                defaultValue: "Yourrights"
              })}</h2>
              <p className="mb-4">{t("Underapplicabledatap", {
                defaultValue: "Underapplicabledatap"
              })}</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>{t("Therighttoaccessyour", {
                  defaultValue: "Therighttoaccessyour"
                })}</li>
                <li>{t("Therighttocorrectina", {
                  defaultValue: "Therighttocorrectina"
                })}</li>
                <li>{t("Therighttorequestdel", {
                  defaultValue: "Therighttorequestdel"
                })}</li>
                <li>{t("Therighttorestrictor", {
                  defaultValue: "Therighttorestrictor"
                })}</li>
                <li>{t("Therighttodataportab", {
                  defaultValue: "Therighttodataportab"
                })}</li>
              </ul>
              <p className="mb-4">{t("Toexercisetheseright", {
                defaultValue: "Toexercisetheseright"
              })}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t("Cookies", {
                defaultValue: "Cookies"
              })}</h2>
              <p className="mb-4">{t("Ourwebsiteusescookie", {
                defaultValue: "Ourwebsiteusescookie"
              })}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t("Thirdpartylinks", {
                defaultValue: "Thirdpartylinks"
              })}</h2>
              <p className="mb-4">{t("Ourwebsitemaycontain", {
                defaultValue: "Ourwebsitemaycontain"
              })}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t("Changestothispolicy", {
                defaultValue: "Changestothispolicy"
              })}</h2>
              <p className="mb-4">{t("Wemayupdatethispriva", {
                defaultValue: "Wemayupdatethispriva"
              })}</p>
            </section>
            
            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">{t("Contactinformation", {
                defaultValue: "Contactinformation"
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