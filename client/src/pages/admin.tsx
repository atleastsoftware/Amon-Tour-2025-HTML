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
import { ImagePlus, FileText, BookOpen, Mail, Users, Calendar, PartyPopper, Handshake, UsersIcon, Newspaper, Settings, LogOut, Image, Globe, Palette } from "lucide-react";
export default function Admin() {
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
  return <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
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
                <h1 className="text-3xl font-heading font-bold text-gray-900">{t("Administration", {
                  defaultValue: "Administration"
                })}</h1>
                <p className="text-gray-600 mt-2">{t("Panneau de gestion centralis\xE9", {
                  defaultValue: "Panneau de gestion centralis\xE9"
                })}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => setLocation('/admin-appearance')} className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />{t("Apparence du site", {
                  defaultValue: "Apparence du site"
                })}</Button>
                <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />{t("Dxe9connexion", {
                  defaultValue: "Dxe9connexion"
                })}</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Demandes personnalisées */}
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: 0
            }}>
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-r from-blue-500 to-blue-600 shadow-md hover:shadow-xl hover:scale-105 relative" onClick={() => setLocation('/admin-custom-tours')}>
                  {Array.isArray(customTourUnread) && customTourUnread.length > 0 && <Badge variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs z-10">
                      {Array.isArray(customTourUnread) ? customTourUnread.length : 0}
                    </Badge>}
                  <CardHeader className="text-white">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-heading">{t("Demandespersonnalisx", {
                          defaultValue: "Demandespersonnalisx"
                        })}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-white/90">
                    <CardDescription className="text-white/80">{t("Gxe9rerlesdemandesde", {
                      defaultValue: "Gxe9rerlesdemandesde"
                    })}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Krabi Celebration */}
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: 0.1
            }}>
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-r from-pink-500 to-pink-600 shadow-md hover:shadow-xl hover:scale-105 relative" onClick={() => setLocation('/admin/krabi-celebration')}>
                  {Array.isArray(krabiUnread) && krabiUnread.length > 0 && <Badge variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs z-10">
                      {Array.isArray(krabiUnread) ? krabiUnread.length : 0}
                    </Badge>}
                  <CardHeader className="text-white">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <PartyPopper className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-heading">{t('pages.krabiCelebration.title')}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-white/90">
                    <CardDescription className="text-white/80">{t('Demandes d\'\xE9v\xE9nements sp\xE9ciaux', {
                      defaultValue: 'Demandes d\'\xE9v\xE9nements sp\xE9ciaux'
                    })}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Partenariats */}
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: 0.2
            }}>
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-md hover:shadow-xl hover:scale-105 relative" onClick={() => setLocation('/admin/partnership-requests')}>
                  {Array.isArray(partnershipUnread) && partnershipUnread.length > 0 && <Badge variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs z-10">
                      {Array.isArray(partnershipUnread) ? partnershipUnread.length : 0}
                    </Badge>}
                  <CardHeader className="text-white">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Handshake className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-heading">{t("Partenariats", {
                          defaultValue: "Partenariats"
                        })}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-white/90">
                    <CardDescription className="text-white/80">{t("Propositions de collaboration", {
                      defaultValue: "Propositions de collaboration"
                    })}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Groupes & Entreprises */}
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: 0.3
            }}>
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-r from-amber-500 to-amber-600 shadow-md hover:shadow-xl hover:scale-105 relative" onClick={() => setLocation('/admin/group-requests')}>
                  {Array.isArray(groupUnread) && groupUnread.length > 0 && <Badge variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs z-10">
                      {Array.isArray(groupUnread) ? groupUnread.length : 0}
                    </Badge>}
                  <CardHeader className="text-white">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <UsersIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-heading">{t("Groupes & Entreprises", {
                          defaultValue: "Groupes & Entreprises"
                        })}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-white/90">
                    <CardDescription className="text-white/80">{t("Demandes de groupes et corporates", {
                      defaultValue: "Demandes de groupes et corporates"
                    })}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Blog */}
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: 0.4
            }}>
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-r from-purple-500 to-purple-600 shadow-md hover:shadow-xl hover:scale-105 relative" onClick={() => setLocation('/admin-blog')}>
                  <CardHeader className="text-white">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-heading">{t("Gestion du blog", {
                          defaultValue: "Gestion du blog"
                        })}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-white/90">
                    <CardDescription className="text-white/80">{t("Crxe9eretmodifierles", {
                      defaultValue: "Crxe9eretmodifierles"
                    })}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Newsletter */}
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: 0.5
            }}>
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-r from-orange-500 to-orange-600 shadow-md hover:shadow-xl hover:scale-105 relative" onClick={() => setLocation('/admin-newsletter')}>
                  {Array.isArray(newsletterUnconfirmed) && newsletterUnconfirmed.length > 0 && <Badge variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs z-10">
                      {Array.isArray(newsletterUnconfirmed) ? newsletterUnconfirmed.length : 0}
                    </Badge>}
                  <CardHeader className="text-white">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Newspaper className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-heading">{t("Newsletter", {
                          defaultValue: "Newsletter"
                        })}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-white/90">
                    <CardDescription className="text-white/80">{t("Gxe9rerlesabonnement", {
                      defaultValue: "Gxe9rerlesabonnement"
                    })}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Images Tour Ninja */}
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: 0.6
            }}>
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-md hover:shadow-xl hover:scale-105 relative" onClick={() => setLocation('/admin-tour-ninja-images')}>
                  <CardHeader className="text-white">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Image className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-heading">{t("Images Tour Ninja", {
                          defaultValue: "Images Tour Ninja"
                        })}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-white/90">
                    <CardDescription className="text-white/80">{t("Remplacer les images Tour Ninja par vos images", {
                      defaultValue: "Remplacer les images Tour Ninja par vos images"
                    })}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Traduction Automatique */}
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: 0.7
            }}>
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-md hover:shadow-xl hover:scale-105 relative" onClick={() => setLocation('/admin-translation')}>
                  <CardHeader className="text-white">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Globe className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-heading">{t("Traduction Auto", {
                          defaultValue: "Traduction Auto"
                        })}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-white/90">
                    <CardDescription className="text-white/80">{t("Gxe9rerlatraductiona", {
                      defaultValue: "Gxe9rerlatraductiona"
                    })}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Cartes de tours */}
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: 0.8
            }}>
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-r from-teal-500 to-teal-600 shadow-md hover:shadow-xl hover:scale-105 relative" onClick={() => setLocation('/tour-card-builder')}>
                  <CardHeader className="text-white">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <ImagePlus className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-heading">{t("Cartes de tours", {
                          defaultValue: "Cartes de tours"
                        })}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-white/90">
                    <CardDescription className="text-white/80">{t("Crxe9eretgxe9rerlesc", {
                      defaultValue: "Crxe9eretgxe9rerlesc"
                    })}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>

            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>;
}