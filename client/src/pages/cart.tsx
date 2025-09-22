import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
export default function Cart() {
  const { t } = useTranslation();
  const {
    t: t
  } = useTranslation();
  const {
    toast
  } = useToast();
  const handleCheckout = () => {
    toast({
      title: t('Merci!', {
        defaultValue: 'Merci!'
      }),
      description: t('Cette fonctionnalit\xE9 est en cours de d\xE9veloppement.', {
        defaultValue: 'Cette fonctionnalit\xE9 est en cours de d\xE9veloppement.'
      })
    });
  };
  return <div className="container mx-auto py-12 px-4 md:px-6">
      <h1 className="text-4xl font-bold mb-8">{t('Votre Panier', {
        defaultValue: 'Votre Panier'
      })}</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">{t('Votre panier est vide', {
            defaultValue: 'Votre panier est vide'
          })}</h2>
          <p className="text-gray-500 mb-6">{t('Explorez nos Tours et S\xE9jours pour trouver votre prochaine aventure en Tha\xEFlande!', {
            defaultValue: 'Explorez nos Tours et S\xE9jours pour trouver votre prochaine aventure en Tha\xEFlande!'
          })}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/tours">
              <Button className="min-w-[200px]">{t('Discover our Tours', {
                defaultValue: 'Discover our Tours'
              })}</Button>
            </Link>
            <Link href="/experiences">
              <Button variant="outline" className="min-w-[200px]">{t('Explore our Stays', {
                defaultValue: 'Explore our Stays'
              })}</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>;
}