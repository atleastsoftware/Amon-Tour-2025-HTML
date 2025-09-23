import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Cart() {
  const { toast } = useToast();

  const handleCheckout = () => {
    toast({
      title: "Merci!",
      description: "Cette fonctionnalité est en cours de développement."
    });
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <h1 className="text-4xl font-bold mb-8">Votre Panier</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Votre panier est vide</h2>
          <p className="text-gray-500 mb-6">
            Explorez nos Tours et Séjours pour trouver votre prochaine aventure en Thaïlande!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/tours">
              <Button className="min-w-[200px]">
                Discover our Tours
              </Button>
            </Link>
            <Link href="/experiences">
              <Button variant="outline" className="min-w-[200px]">
                Explore our Stays
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}