import { useEffect } from "react";
import { useLocation } from "wouter";
import { useIsAuthenticated, useLogout } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { 
  ImagePlus, 
  FileText, 
  BookOpen, 
  Mail, 
  Users, 
  Calendar,
  PartyPopper,
  Handshake,
  UsersIcon,
  Settings,
  LogOut,
  Palette
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

export default function AdminDashboard() {
  const { translations, currentLanguage } = useTranslation();
  const { isAuthenticated, isLoading: authLoading } = useIsAuthenticated();
  
  // Debug: log current translations state
  console.log('🎯 AdminDashboard - currentLanguage:', currentLanguage);
  console.log('🎯 AdminDashboard - translations.admin:', translations?.admin);
  console.log('🎯 AdminDashboard - dashboard title:', translations?.admin?.dashboard?.title);
  
  const adminT = translations?.admin || {};
  const dashboard = adminT?.dashboard || {};
  const sections = dashboard?.sections || {};
  const common = adminT?.common || {};
  
  const [, setLocation] = useLocation();
  const logout = useLogout();

  const { data: krabiUnread = [] } = useQuery<any[]>({
    queryKey: ["/api/krabi-celebration", { read: false }],
    enabled: isAuthenticated,
  });

  const { data: partnershipUnread = [] } = useQuery<any[]>({
    queryKey: ["/api/partnership-requests", { read: false }],
    enabled: isAuthenticated,
  });

  const { data: groupUnread = [] } = useQuery<any[]>({
    queryKey: ["/api/group-requests", { read: false }],
    enabled: isAuthenticated,
  });

  const { data: customTourUnread = [] } = useQuery<any[]>({
    queryKey: ["/api/custom-tour-requests", { status: "new" }],
    enabled: isAuthenticated,
  });

  const { data: newsletterUnconfirmed = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/newsletter/subscriptions", { confirmed: false }],
    enabled: isAuthenticated,
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

  if (authLoading) return <div className="container mx-auto p-8 text-center">{common?.loading || "Loading..."}</div>;

  const adminSections = [
    {
      title: sections?.customTours?.title || "Custom Tour Requests",
      description: sections?.customTours?.description || "Manage custom tour requests",
      icon: <Calendar className="h-6 w-6" />,
      path: "/admin/custom-tours",
      color: "from-primary to-primary/80",
      unreadCount: customTourUnread?.length || 0,
      testId: "card-custom-tours"
    },
    {
      title: sections?.krabiCelebration?.title || "Krabi Celebration",
      description: sections?.krabiCelebration?.description || "Special event requests",
      icon: <PartyPopper className="h-6 w-6" />,
      path: "/admin/krabi-celebration",
      color: "from-secondary to-secondary/80",
      unreadCount: krabiUnread?.length || 0,
      testId: "card-krabi-celebration"
    },
    {
      title: sections?.partnershipRequests?.title || sections?.partnership?.title || "Partnership Requests",
      description: sections?.partnershipRequests?.description || sections?.partnership?.description || "Collaboration proposals",
      icon: <Handshake className="h-6 w-6" />,
      path: "/admin/partnership-requests",
      color: "from-primary/70 to-primary",
      unreadCount: partnershipUnread?.length || 0,
      testId: "card-partnership-requests"
    },
    {
      title: sections?.groupRequests?.title || sections?.groups?.title || "Groups & Companies",
      description: sections?.groupRequests?.description || sections?.groups?.description || "Group and corporate requests",
      icon: <UsersIcon className="h-6 w-6" />,
      path: "/admin/group-requests",
      color: "from-warning to-warning/80",
      unreadCount: groupUnread?.length || 0,
      testId: "card-group-requests"
    },
    {
      title: sections?.blogManagement?.title || sections?.blog?.title || "Blog Management",
      description: sections?.blogManagement?.description || sections?.blog?.description || "Create and edit articles",
      icon: <BookOpen className="h-6 w-6" />,
      path: "/admin/blog",
      color: "from-primary/60 to-primary/80",
      testId: "card-blog-management"
    },
    {
      title: sections?.newsletter?.title || "Newsletter",
      description: sections?.newsletter?.description || "Manage newsletter subscriptions",
      icon: <Mail className="h-6 w-6" />,
      path: "/admin/newsletter", 
      color: "from-[hsl(var(--warning))] to-[hsl(var(--warning)/0.8)]",
      unreadCount: newsletterUnconfirmed?.length || 0,
      testId: "card-newsletter"
    },
    {
      title: sections?.tourCards?.title || "Tour Cards",
      description: sections?.tourCards?.description || "Create and manage tour cards",
      icon: <ImagePlus className="h-6 w-6" />,
      path: "/tour-card-builder",
      color: "from-secondary/80 to-secondary",
      testId: "card-tour-cards"
    },
    {
      title: sections?.contactMessages?.title || sections?.messages?.title || "Contact Messages",
      description: sections?.contactMessages?.description || sections?.messages?.description || "View and respond to messages",
      icon: <Mail className="h-6 w-6" />,
      path: "/admin/messages",
      color: "from-[hsl(var(--success))] to-[hsl(var(--success)/0.8)]",
      testId: "card-contact-messages"
    },
    {
      title: adminT?.appearance?.title || "Site Appearance",
      description: adminT?.appearance?.subtitle || "Customize site appearance",
      icon: <Palette className="h-6 w-6" />,
      path: "/admin-appearance",
      color: "from-purple-500 to-purple-600",
      testId: "card-appearance"
    },
    {
      title: sections?.settings?.title || "Settings",
      description: sections?.settings?.description || "Configuration and preferences",
      icon: <Settings className="h-6 w-6" />,
      path: "/admin/settings",
      color: "from-muted-foreground to-muted-foreground/80",
      testId: "card-settings"
    }
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-muted/30 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-heading font-bold text-foreground" data-testid="text-dashboard-title">
                  {dashboard?.title || "Administration"}
                </h1>
                <p className="text-muted-foreground mt-2" data-testid="text-dashboard-subtitle">
                  {dashboard?.subtitle || "Centralized management dashboard"}
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout} 
                className="flex items-center gap-2"
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
                {dashboard?.logout || "Logout"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminSections.map((section, index) => (
                <motion.div
                  key={section.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card 
                    className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-r shadow-md hover:shadow-xl hover:scale-105 relative"
                    style={{
                      background: `linear-gradient(135deg, ${section.color.split(' ')[1]} 0%, ${section.color.split(' ')[3]} 100%)`
                    }}
                    onClick={() => setLocation(section.path)}
                    data-testid={section.testId}
                  >
                    {section.unreadCount && section.unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs z-10"
                      >
                        {section.unreadCount}
                      </Badge>
                    )}
                    <CardHeader className="text-white">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                          {section.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg font-heading">{section.title}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="text-white/90">
                      <CardDescription className="text-white/80">
                        {section.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
}
