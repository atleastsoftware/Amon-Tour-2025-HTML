import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useIsAuthenticated, useLogout } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TourCardForm from "@/components/admin/TourCardForm";
import TourCardDisplay from "@/components/admin/TourCardDisplay";

interface TourCardData {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  customLink: string;
  images: string[];
}

export default function TourCardBuilder() {
  const { isAuthenticated, isLoading: authLoading } = useIsAuthenticated();
  const [, setLocation] = useLocation();
  const logout = useLogout();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch tour cards
  const { data: tourCards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ['/api/tour-cards']
  });
  
  // Delete tour card mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return fetch('/api/tour-cards/' + id, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tour-cards'] });
      toast({
        title: "Succès",
        description: "La fiche a été supprimée avec succès"
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de la fiche",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/admin-login');
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const handleLogout = () => {
    logout.mutate();
    setLocation('/');
  };

  const handleNewTourCard = (newCard: TourCardData) => {
    queryClient.invalidateQueries({ queryKey: ['/api/tour-cards'] });
  };
  
  const handleDeleteTourCard = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (authLoading) return <div className="container mx-auto p-8 text-center">Chargement...</div>;

  // Force TypeScript to treat tourCards as TourCardData[]
  const safeCards = Array.isArray(tourCards) ? tourCards as TourCardData[] : [];
  
  return (
    <>
      <Header />
      <div className="container mx-auto p-4 pt-20 pb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-heading font-bold">TourCard Builder</h1>
            <p className="text-gray-600">Créez facilement des fiches pour vos tours et séjours</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>Déconnexion</Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <TourCardForm onSuccess={handleNewTourCard} />
          </div>
          
          <div className="lg:col-span-2">
            <h2 className="text-xl font-heading font-semibold mb-4">Vos fiches ({safeCards.length})</h2>
            
            {cardsLoading ? (
              <div className="text-center py-8">Chargement des fiches...</div>
            ) : safeCards.length === 0 ? (
              <div className="bg-gray-50 border border-dashed rounded-lg p-8 text-center">
                <p className="text-gray-500">Aucune fiche pour le moment. Créez votre première fiche !</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {safeCards.map((card: TourCardData) => (
                  <TourCardDisplay 
                    key={card.id} 
                    tourCard={card} 
                    onDelete={handleDeleteTourCard}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}