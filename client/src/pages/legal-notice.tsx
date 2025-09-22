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
        <title>{t("Legal Notice - Amon Tour", {
          defaultValue: "Legal Notice - Amon Tour"
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
              <p className="mb-4">{t("The website amon-tour.com is produced by Flame BB Co., Ltd., with a capital of 4,000,000 Thai Baht, \n                registered with the Thai Ministry of Commerce (DBD) in Krabi under the number 0815558001588, \n                with its headquarters located at 242 Moo1 \u2013 Na Thai \u2013 Ao Nang \u2013 81000 Krabi \u2013 Thailand. \n                The company holds a tourism license issued by the Thai Minister of Tourism (TAT) under the number 34/01995.", {
                defaultValue: "The website amon-tour.com is produced by Flame BB Co., Ltd., with a capital of 4,000,000 Thai Baht, \n                registered with the Thai Ministry of Commerce (DBD) in Krabi under the number 0815558001588, \n                with its headquarters located at 242 Moo1 \u2013 Na Thai \u2013 Ao Nang \u2013 81000 Krabi \u2013 Thailand. \n                The company holds a tourism license issued by the Thai Minister of Tourism (TAT) under the number 34/01995."
              })}</p>
              <p className="mb-4">
                <strong>{t("Publication Director:", {
                  defaultValue: "Publication Director:"
                })}</strong>{t("Eric Mosnier-Thoumas in his capacity as Chief Executive Officer and website administrator.", {
                defaultValue: "Eric Mosnier-Thoumas in his capacity as Chief Executive Officer and website administrator."
              })}</p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t("Disclaimer", {
                defaultValue: "Disclaimer"
              })}</h2>
              <p className="mb-4">{t("Flame BB strives to ensure, to the best of its ability, the accuracy and updating of information \n                distributed on this site, for which it reserves the right to correct, at any time and without notice, \n                the content. However, Flame BB cannot guarantee the accuracy, precision or completeness of the \n                information made available on this site.", {
                defaultValue: "Flame BB strives to ensure, to the best of its ability, the accuracy and updating of information \n                distributed on this site, for which it reserves the right to correct, at any time and without notice, \n                the content. However, Flame BB cannot guarantee the accuracy, precision or completeness of the \n                information made available on this site."
              })}</p>
              <p className="mb-4">{t("Consequently, Flame BB disclaims all responsibility:", {
                defaultValue: "Consequently, Flame BB disclaims all responsibility:"
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
              <h2 className="font-heading text-2xl font-semibold mb-4">{t("Protection of Personal Data", {
                defaultValue: "Protection of Personal Data"
              })}</h2>
              <p className="mb-4">{t("Flame BB is committed to preserving the confidentiality of information that may be provided online by the internet user.", {
                defaultValue: "Flame BB is committed to preserving the confidentiality of information that may be provided online by the internet user."
              })}</p>
              <p className="mb-4">{t("Any personal information that the internet user may be led to transmit to Flame BB for the use of certain services \n                is subject to the provisions of Law No. 78-17 on Information Technology and Freedom of January 06, 1978. \n                In this respect, the internet user has the right to access, rectify and delete personal information \n                concerning him/her, which he/she can exercise at any time by sending a letter to:", {
                defaultValue: "Any personal information that the internet user may be led to transmit to Flame BB for the use of certain services \n                is subject to the provisions of Law No. 78-17 on Information Technology and Freedom of January 06, 1978. \n                In this respect, the internet user has the right to access, rectify and delete personal information \n                concerning him/her, which he/she can exercise at any time by sending a letter to:"
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
              <p className="mb-4">{t("The site may include links to other sites. To the extent that Flame BB cannot control these sites, \n                Flame BB cannot be held responsible for making these sites available, and cannot bear any responsibility \n                regarding the content, advertisements, products, services or any other material available on or from these \n                sites. Furthermore, Flame BB cannot be held responsible for any proven or alleged damage or losses \n                resulting from or in connection with the use of or reliance on the content, goods or services available \n                on these sites or external sources.", {
                defaultValue: "The site may include links to other sites. To the extent that Flame BB cannot control these sites, \n                Flame BB cannot be held responsible for making these sites available, and cannot bear any responsibility \n                regarding the content, advertisements, products, services or any other material available on or from these \n                sites. Furthermore, Flame BB cannot be held responsible for any proven or alleged damage or losses \n                resulting from or in connection with the use of or reliance on the content, goods or services available \n                on these sites or external sources."
              })}</p>
            </section>
            
            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">{t("Intellectual Property Rights of Flame BB", {
                defaultValue: "Intellectual Property Rights of Flame BB"
              })}</h2>
              <p className="mb-4">{t("The site as well as any software necessarily used in relation to it may contain confidential information \n                protected by applicable intellectual property law or any other law. Thus, unless otherwise stated, \n                the intellectual property rights on the documents contained in the site and each of the elements created \n                for this site are the exclusive property of Flame BB, which does not grant any license or any other right \n                than that of consulting the site. In particular, the trademarks and other intellectual property rights \n                mentioned on the site are the property of the concerned entities of Flame BB. The reproduction of all \n                documents published on the site is only authorized for the exclusive purposes of information for personal \n                and private use, any reproduction and any use of copies made for other purposes being expressly forbidden. \n                It is also forbidden to copy, modify, create a derivative work, reverse engineer or assemble or in any \n                other way attempt to find the source code (except in cases provided for by law), sell, assign, \n                sub-license or transfer in any way any right relating to the software. Similarly, it is also forbidden \n                to modify the software or to use modified versions of the software, particularly (without this list being \n                limiting) to obtain unauthorized access to the service and to access the site by any means other than \n                through the interface provided by Flame BB.", {
                defaultValue: "The site as well as any software necessarily used in relation to it may contain confidential information \n                protected by applicable intellectual property law or any other law. Thus, unless otherwise stated, \n                the intellectual property rights on the documents contained in the site and each of the elements created \n                for this site are the exclusive property of Flame BB, which does not grant any license or any other right \n                than that of consulting the site. In particular, the trademarks and other intellectual property rights \n                mentioned on the site are the property of the concerned entities of Flame BB. The reproduction of all \n                documents published on the site is only authorized for the exclusive purposes of information for personal \n                and private use, any reproduction and any use of copies made for other purposes being expressly forbidden. \n                It is also forbidden to copy, modify, create a derivative work, reverse engineer or assemble or in any \n                other way attempt to find the source code (except in cases provided for by law), sell, assign, \n                sub-license or transfer in any way any right relating to the software. Similarly, it is also forbidden \n                to modify the software or to use modified versions of the software, particularly (without this list being \n                limiting) to obtain unauthorized access to the service and to access the site by any means other than \n                through the interface provided by Flame BB."
              })}</p>
            </section>
            
            <section className="mt-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">{t("Rights and Properties", {
                defaultValue: "Rights and Properties"
              })}</h2>
              <p className="mb-4">{t("Unless otherwise stated, all texts, photographs and other visuals on this site are the exclusive property \n                of the author and are therefore protected by copyright.", {
                defaultValue: "Unless otherwise stated, all texts, photographs and other visuals on this site are the exclusive property \n                of the author and are therefore protected by copyright."
              })}<br />{t("Strict prohibition of copying, reproducing or redistributing this content in any form whatsoever.", {
                defaultValue: "Strict prohibition of copying, reproducing or redistributing this content in any form whatsoever."
              })}<br />{t("Any use outside of this medium must be the subject of a written request.", {
                defaultValue: "Any use outside of this medium must be the subject of a written request."
              })}</p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </>;
}