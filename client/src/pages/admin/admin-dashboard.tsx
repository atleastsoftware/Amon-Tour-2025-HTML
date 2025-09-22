import { useTranslation } from 'react-i18next';
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
import { ImagePlus, FileText, BookOpen, Mail, Users, Calendar, PartyPopper, Handshake, UsersIcon, Newspaper, Settings, LogOut } from "lucide-react";
export default function AdminDashboard() {
  const {
    t
  } = useTranslation();
  const {
    isAuthenticated,
    isLoading: authLoading
  } = useIsAuthenticated();
  const [, setLocation] = useLocation();
  const logout = useLogout();

  // Fetch unread counts for notifications
  const {
    data: krabiUnread = []
  } = useQuery({
    queryKey: ["/api/krabi-celebration", {
      read: false
    }],
    enabled: isAuthenticated
  });
  const {
    data: partnershipUnread = []
  } = useQuery({
    queryKey: ["/api/partnership-requests", {
      read: false
    }],
    enabled: isAuthenticated
  });
  const {
    data: groupUnread = []
  } = useQuery({
    queryKey: ["/api/group-requests", {
      read: false
    }],
    enabled: isAuthenticated
  });
  const {
    data: customTourUnread = []
  } = useQuery({
    queryKey: ["/api/custom-tour-requests", {
      status: "new"
    }],
    enabled: isAuthenticated
  });
  const {
    data: newsletterUnconfirmed = []
  } = useQuery({
    queryKey: ["/api/admin/newsletter/subscriptions", {
      confirmed: false
    }],
    enabled: isAuthenticated
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
  if (authLoading) return <div className="container mx-auto p-8 text-center">{t("Loading", {
      defaultValue: "Loading"
    })}</div>;
  const adminSections = [{
    title: t("Demandespersonnalisx", {
      defaultValue: "Demandespersonnalisx"
    }),
    description: t("Gxe9rerlesdemandesde", {
      defaultValue: "Gxe9rerlesdemandesde"
    }),
    icon: <Calendar className="h-6 w-6" />,
    path: "/admin/custom-tours",
    color: "from-primary to-primary/80",
    unreadCount: customTourUnread?.length || 0
  }, {
    title: t('pages.krabiCelebration.title'),
    description: t('Demandes d\'\xE9v\xE9nements sp\xE9ciaux', {
      defaultValue: 'Demandes d\'\xE9v\xE9nements sp\xE9ciaux'
    }),
    icon: <PartyPopper className="h-6 w-6" />,
    path: "/admin/krabi-celebration",
    color: "from-secondary to-secondary/80",
    unreadCount: krabiUnread?.length || 0
  }, {
    title: t("Demandesdepartenaria", {
      defaultValue: "Demandesdepartenaria"
    }),
    description: t("Propositionsdecollab", {
      defaultValue: "Propositionsdecollab"
    }),
    icon: <Handshake className="h-6 w-6" />,
    path: "/admin/partnership-requests",
    color: "from-primary/70 to-primary",
    unreadCount: partnershipUnread?.length || 0
  }, {
    title: t("Groupesentreprises", {
      defaultValue: "Groupesentreprises"
    }),
    description: t("Demandesdegroupesetc", {
      defaultValue: "Demandesdegroupesetc"
    }),
    icon: <UsersIcon className="h-6 w-6" />,
    path: "/admin/group-requests",
    color: "from-warning to-warning/80",
    unreadCount: groupUnread?.length || 0
  }, {
    title: t("Gestiondublog", {
      defaultValue: "Gestiondublog"
    }),
    description: t("Crxe9eretmodifierles", {
      defaultValue: "Crxe9eretmodifierles"
    }),
    icon: <BookOpen className="h-6 w-6" />,
    path: "/admin/blog",
    color: "from-primary/60 to-primary/80"
  }, {
    title: t("Newsletter", {
      defaultValue: "Newsletter"
    }),
    description: t("Gxe9rerlesabonnement", {
      defaultValue: "Gxe9rerlesabonnement"
    }),
    icon: <Newspaper className="h-6 w-6" />,
    path: "/admin/newsletter",
    color: "from-[hsl(var(--warning))] to-[hsl(var(--warning)/0.8)]",
    unreadCount: newsletterUnconfirmed?.length || 0
  }, {
    title: t("Cartesdetours", {
      defaultValue: "Cartesdetours"
    }),
    description: t("Crxe9eretgxe9rerlesc", {
      defaultValue: "Crxe9eretgxe9rerlesc"
    }),
    icon: <ImagePlus className="h-6 w-6" />,
    path: "/tour-card-builder",
    color: "from-secondary/80 to-secondary"
  }, {
    title: t("Messagesdecontact", {
      defaultValue: "Messagesdecontact"
    }),
    description: t("Consulteretrxe9pondr", {
      defaultValue: "Consulteretrxe9pondr"
    }),
    icon: <Mail className="h-6 w-6" />,
    path: "/admin/messages",
    color: "from-[hsl(var(--success))] to-[hsl(var(--success)/0.8)]"
  }, {
    title: t("Paramxe8tres", {
      defaultValue: "Paramxe8tres"
    }),
    description: t("Configurationetprxe9", {
      defaultValue: "Configurationetprxe9"
    }),
    icon: <Settings className="h-6 w-6" />,
    path: "/admin/settings",
    color: "from-muted-foreground to-muted-foreground/80"
  }];
  return <>
      <Header />
      <div className="min-h-screen bg-muted/30 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5
        }}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-heading font-bold text-foreground">{t("Administration", {
                  defaultValue: "Administration"
                })}</h1>
                <p className="text-muted-foreground mt-2">{t("Panneaudegestioncent", {
                  defaultValue: "Panneaudegestioncent"
                })}</p>
              </div>
              <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />{t("Dxe9connexion", {
                defaultValue: "Dxe9connexion"
              })}</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminSections.map((section, index) => <motion.div key={section.title} initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: index * 0.1
            }}>
                  <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-r shadow-md hover:shadow-xl hover:scale-105 relative" style={{
                background: `linear-gradient(135deg, ${section.color.split(' ')[1]} 0%, ${section.color.split(' ')[3]} 100%)`
              }} onClick={() => setLocation(section.path)}>
                    {section.unreadCount > 0 && <Badge variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs z-10">
                        {section.unreadCount}
                      </Badge>}
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
                </motion.div>)}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>;
}