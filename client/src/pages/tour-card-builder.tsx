import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useIsAuthenticated, useLogout } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import TourCardForm from "@/components/admin/TourCardForm";
import TourCardDisplay from "@/components/admin/TourCardDisplay";
import QuickTourCardCreator from "@/components/admin/QuickTourCardCreator";
import { useTranslation } from "@/contexts/TranslationContext";

interface TourCardData {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  customLink: string;
  type: "tour" | "experience";
  images: string[];
  tags?: string[];
}

export default function TourCardBuilder() {
  const { isAuthenticated, isLoading: authLoading } = useIsAuthenticated();
  const [, setLocation] = useLocation();
  const logout = useLogout();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { translations } = useTranslation();
  const t = translations?.admin?.tourCardBuilder || {};
  const common = translations?.admin?.common || {};
  
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
        title: common?.success || "Success",
        description: t?.deleteSuccess || "Card deleted successfully"
      });
    },
    onError: () => {
      toast({
        title: common?.error || "Error",
        description: t?.deleteFailed || "An error occurred while deleting the card",
        variant: "destructive"
      });
    }
  });
  
  // Update tour card mutation
  const updateMutation = useMutation({
    mutationFn: async (card: TourCardData) => {
      return fetch('/api/tour-cards/' + card.id, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(card)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tour-cards'] });
      toast({
        title: common?.success || "Success",
        description: t?.updateSuccess || "Card updated successfully"
      });
    },
    onError: () => {
      toast({
        title: common?.error || "Error",
        description: t?.updateFailed || "An error occurred while updating the card",
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
  
  const handleUpdateTourCard = (updatedCard: TourCardData) => {
    updateMutation.mutate(updatedCard);
  };

  if (authLoading) return <div className="container mx-auto p-8 text-center">{common?.loading || "Loading..."}</div>;

  // Force TypeScript to treat tourCards as TourCardData[]
  const safeCards = Array.isArray(tourCards) ? tourCards as TourCardData[] : [];
  
  return (
    <>
      <Header />
      <div className="container mx-auto p-4 pt-20 pb-16">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Link href="/admin">
              <Button variant="outline" size="sm" className="w-fit">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {common?.backToAdmin || "Back to Admin"}
              </Button>
            </Link>
            <div>
              <h1 className="text-xl sm:text-3xl font-heading font-bold">{t?.title || "Tour Card Builder"}</h1>
              <p className="text-sm sm:text-base text-gray-600">{t?.description || "Easily create cards for your tours and stays"}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">{common?.logout || "Logout"}</Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <QuickTourCardCreator onSuccess={handleNewTourCard} />
            <TourCardForm onSuccess={handleNewTourCard} />
          </div>
          
          <div className="lg:col-span-2">
            <h2 className="text-xl font-heading font-semibold mb-4">{t?.yourCards || "Your Cards"} ({safeCards.length})</h2>
            
            {cardsLoading ? (
              <div className="text-center py-8">{t?.loadingCards || "Loading cards..."}</div>
            ) : safeCards.length === 0 ? (
              <div className="bg-gray-50 border border-dashed rounded-lg p-8 text-center">
                <p className="text-gray-500">{t?.noCards || "No cards yet. Create your first card!"}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {safeCards.map((card: TourCardData) => (
                  <TourCardDisplay 
                    key={card.id} 
                    tourCard={card} 
                    onDelete={handleDeleteTourCard}
                    onUpdate={handleUpdateTourCard}
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