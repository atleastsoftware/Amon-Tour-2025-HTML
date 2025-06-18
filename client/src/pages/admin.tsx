import { useEffect } from "react";
import { useLocation } from "wouter";
import { useIsAuthenticated, useLogout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ImagePlus, FileText, BookOpen, Mail, Users } from "lucide-react";

export default function AdminPage() {
  const { isAuthenticated, isLoading: authLoading } = useIsAuthenticated();
  const [, setLocation] = useLocation();
  const logout = useLogout();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/admin-login');
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const handleLogout = () => {
    logout.mutate();
    setLocation('/');
  };

  if (authLoading) return <div className="container mx-auto p-8 text-center">Loading...</div>;

  return (
    <>
      <Header />
      <div className="container mx-auto p-4 pt-20 pb-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-heading font-bold">Administration</h1>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>
        
        <div className="grid gap-6">
          <div className="text-center">
            <h2 className="text-2xl font-heading font-semibold mb-2">Admin Management</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Manage your tour cards and blog content from this central admin panel.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="overflow-hidden">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <ImagePlus className="h-5 w-5" />
                  Create Tour Cards
                </CardTitle>
                <CardDescription>
                  Add new tour cards with images and details
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="mb-4 text-sm text-muted-foreground">
                  Create custom tour cards with title, description, price, and up to 3 images per card. 
                  Cards will automatically appear on the website.
                </p>
                <Button 
                  className="w-full" 
                  onClick={() => setLocation('/tour-card-builder')}
                >
                  Access Card Builder
                </Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Blog Management
                </CardTitle>
                <CardDescription>
                  Manage blog posts, categories and tags
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="mb-4 text-sm text-muted-foreground">
                  Create and manage blog posts, organize content with categories and tags.
                  Published posts will appear on the blog section.
                </p>
                <Button 
                  className="w-full" 
                  onClick={() => setLocation('/admin-blog')}
                >
                  Manage Blog
                </Button>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Newsletter Management
                </CardTitle>
                <CardDescription>
                  Manage newsletter subscriptions and exports
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="mb-4 text-sm text-muted-foreground">
                  View all newsletter subscribers, manage confirmations, filter by status, and export subscriber lists to CSV.
                </p>
                <Button 
                  className="w-full" 
                  onClick={() => setLocation('/admin-newsletter')}
                >
                  Manage Newsletter
                </Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Custom Tour Requests
                </CardTitle>
                <CardDescription>
                  Manage custom tour inquiries and requests
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="mb-4 text-sm text-muted-foreground">
                  View and manage custom tour requests from customers. Track status, respond to inquiries, and export data.
                </p>
                <Button 
                  className="w-full" 
                  onClick={() => setLocation('/admin-custom-tours')}
                >
                  Manage Requests
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}