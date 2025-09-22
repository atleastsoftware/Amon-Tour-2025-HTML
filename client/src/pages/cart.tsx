import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
export default function Cart() {
  const { t } = useTranslation();

  const {
    toast
  } = useToast();
  const handleCheckout = () => {
    toast({
      title: t('common.merci'),
      description: t('common.cettefonctionnalitxe')
    });
  };
  return <div className="container mx-auto py-12 px-4 md:px-6">
      <h1 className="text-4xl font-bold mb-8">{t('common.votrepanier')}</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">{t('common.votrepanierestvide')}</h2>
          <p className="text-gray-500 mb-6">{t('common.exploreznostoursetsx')}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/tours">
              <Button className="min-w-[200px]">{t('common.discoverourtours')}</Button>
            </Link>
            <Link href="/experiences">
              <Button variant="outline" className="min-w-[200px]">{t('common.exploreourstays')}</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>;
}