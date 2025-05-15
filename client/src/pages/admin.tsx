import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useIsAuthenticated, useLogout } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tour } from "@shared/schema";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminPage() {
  const { isAuthenticated, isLoading: authLoading } = useIsAuthenticated();
  const [, setLocation] = useLocation();
  const logout = useLogout();
  const { toast } = useToast();
  
  // Fetch tours data
  const { data: tours = [], isLoading: toursLoading } = useQuery<Tour[]>({
    queryKey: ['/api/tours'],
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

  if (authLoading) return <div className="container mx-auto p-8 text-center">Chargement...</div>;

  return (
    <>
      <Header />
      <div className="container mx-auto p-4 pt-20 pb-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-heading font-bold">Administration</h1>
          <Button variant="outline" onClick={handleLogout}>Déconnexion</Button>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Tours</CardTitle>
          </CardHeader>
          <CardContent>
            {toursLoading ? (
              <div className="text-center py-4">Chargement des tours...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Titre</TableHead>
                      <TableHead>Durée</TableHead>
                      <TableHead>Prix</TableHead>
                      <TableHead>Mis en avant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tours.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          Aucun tour trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      tours.map((tour) => (
                        <TableRow key={tour.id}>
                          <TableCell>{tour.id}</TableCell>
                          <TableCell className="font-medium">{tour.title}</TableCell>
                          <TableCell>{tour.duration}</TableCell>
                          <TableCell>{tour.price}€</TableCell>
                          <TableCell>{tour.featured ? 'Oui' : 'Non'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="text-center text-gray-500 text-sm">
          Pour les opérations avancées (création, modification, suppression), contactez le développeur.
        </div>
      </div>
      
      <Footer />
    </>
  );
}