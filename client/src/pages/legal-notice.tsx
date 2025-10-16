import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Loader2 } from "lucide-react";

export default function LegalNotice() {
  const [fallbackToStatic, setFallbackToStatic] = useState(false);
  
  // Fetch legal page content from API
  const { data: pageContent, isLoading, error } = useQuery({
    queryKey: ['/api/public/legal-page/legal-notice'],
    queryFn: async () => {
      const response = await fetch('/api/public/legal-page/legal-notice');
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
          <meta name="description" content={pageContent.seoDescription || "Legal notice and terms of use for Amon Tour website."} />
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
        <title>Legal Notice | Amon Tour</title>
        <meta name="description" content="Mentions légales et conditions d'utilisation du site Amon Tour." />
      </Helmet>
      
      <Header />
      
      <main className="pt-8 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-6 text-center">Legal Notice</h1>
          
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">Publisher</h2>
              <p className="mb-4">
                The website amon-tour.com is produced by Flame BB Co., Ltd., with a capital of 4,000,000 Thai Baht, 
                registered with the Thai Ministry of Commerce (DBD) in Krabi under the number 0815558001588, 
                with its headquarters located at 242 Moo1 – Na Thai – Ao Nang – 81000 Krabi – Thailand. 
                The company holds a tourism license issued by the Thai Minister of Tourism (TAT) under the number 34/01995.
              </p>
              <p className="mb-4">
                <strong>Publication Director:</strong> Eric Mosnier-Thoumas in his capacity as Chief Executive Officer and website administrator.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">Disclaimer</h2>
              <p className="mb-4">
                Flame BB strives to ensure, to the best of its ability, the accuracy and updating of information 
                distributed on this site, for which it reserves the right to correct, at any time and without notice, 
                the content. However, Flame BB cannot guarantee the accuracy, precision or completeness of the 
                information made available on this site.
              </p>
              <p className="mb-4">
                Consequently, Flame BB disclaims all responsibility:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>for any interruption of the site</li>
                <li>for the occurrence of bugs</li>
                <li>for any inaccuracy or omission concerning information available on the site</li>
                <li>for any damage resulting from a fraudulent intrusion by a third party having led to a modification of the information made available on the site</li>
                <li>and more generally for any direct or indirect damage, whatever its causes, nature or consequences, including notably the costs that may arise from the acquisition of goods proposed on the site, loss of profits, customers, data, or any other loss of intangible assets that may occur due to anyone's access to the site or the impossibility of accessing it or the credit given to any information coming directly or indirectly from it.</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">Protection of Personal Data</h2>
              <p className="mb-4">
                Flame BB is committed to preserving the confidentiality of information that may be provided online by the internet user.
              </p>
              <p className="mb-4">
                Any personal information that the internet user may be led to transmit to Flame BB for the use of certain services 
                is subject to the provisions of Law No. 78-17 on Information Technology and Freedom of January 06, 1978. 
                In this respect, the internet user has the right to access, rectify and delete personal information 
                concerning him/her, which he/she can exercise at any time by sending a letter to:
              </p>
              <address className="not-italic mb-4">
                Flame BB<br />
                242/1 Moo1 – Na Thai – Ao Nang<br />
                81000 Krabi – Thailand
              </address>
            </section>
            
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">Links</h2>
              <p className="mb-4">
                The site may include links to other sites. To the extent that Flame BB cannot control these sites, 
                Flame BB cannot be held responsible for making these sites available, and cannot bear any responsibility 
                regarding the content, advertisements, products, services or any other material available on or from these 
                sites. Furthermore, Flame BB cannot be held responsible for any proven or alleged damage or losses 
                resulting from or in connection with the use of or reliance on the content, goods or services available 
                on these sites or external sources.
              </p>
            </section>
            
            <section>
              <h2 className="font-heading text-2xl font-semibold mb-4">Intellectual Property Rights of Flame BB</h2>
              <p className="mb-4">
                The site as well as any software necessarily used in relation to it may contain confidential information 
                protected by applicable intellectual property law or any other law. Thus, unless otherwise stated, 
                the intellectual property rights on the documents contained in the site and each of the elements created 
                for this site are the exclusive property of Flame BB, which does not grant any license or any other right 
                than that of consulting the site. In particular, the trademarks and other intellectual property rights 
                mentioned on the site are the property of the concerned entities of Flame BB. The reproduction of all 
                documents published on the site is only authorized for the exclusive purposes of information for personal 
                and private use, any reproduction and any use of copies made for other purposes being expressly forbidden. 
                It is also forbidden to copy, modify, create a derivative work, reverse engineer or assemble or in any 
                other way attempt to find the source code (except in cases provided for by law), sell, assign, 
                sub-license or transfer in any way any right relating to the software. Similarly, it is also forbidden 
                to modify the software or to use modified versions of the software, particularly (without this list being 
                limiting) to obtain unauthorized access to the service and to access the site by any means other than 
                through the interface provided by Flame BB.
              </p>
            </section>
            
            <section className="mt-8">
              <h2 className="font-heading text-2xl font-semibold mb-4">Rights and Properties</h2>
              <p className="mb-4">
                Unless otherwise stated, all texts, photographs and other visuals on this site are the exclusive property 
                of the author and are therefore protected by copyright.<br />
                Strict prohibition of copying, reproducing or redistributing this content in any form whatsoever.<br />
                Any use outside of this medium must be the subject of a written request.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}