import { useEffect, useState } from "react";
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
  Newspaper,
  Settings,
  LogOut,
  Image,
  Globe,
  Palette
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

export default function Admin() {
  const { translations, currentLanguage } = useTranslation();
  const { isAuthenticated, isLoading: authLoading } = useIsAuthenticated();
  
  // Get admin translations with fallbacks
  const adminT = translations?.admin || {};
  const dashboard = adminT?.dashboard || {};
  const sections = dashboard?.sections || {};
  const [, setLocation] = useLocation();
  const logout = useLogout();
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Fetch unread counts for notifications
  const { data: krabiUnreadData = [] } = useQuery<unknown[]>({
    queryKey: ["/api/krabi-celebration", { read: false }],
    enabled: isAuthenticated,
  });
  const krabiUnread = Array.isArray(krabiUnreadData) ? krabiUnreadData : [];

  const { data: partnershipUnreadData = [] } = useQuery<unknown[]>({
    queryKey: ["/api/partnership-requests", { read: false }],
    enabled: isAuthenticated,
  });
  const partnershipUnread = Array.isArray(partnershipUnreadData) ? partnershipUnreadData : [];

  const { data: groupUnreadData = [] } = useQuery<unknown[]>({
    queryKey: ["/api/group-requests", { read: false }],
    enabled: isAuthenticated,
  });
  const groupUnread = Array.isArray(groupUnreadData) ? groupUnreadData : [];

  const { data: customTourUnreadData = [] } = useQuery<unknown[]>({
    queryKey: ["/api/custom-tour-requests", { status: "new" }],
    enabled: isAuthenticated,
  });
  const customTourUnread = Array.isArray(customTourUnreadData) ? customTourUnreadData : [];

  const { data: newsletterUnconfirmedData = [] } = useQuery<unknown[]>({
    queryKey: ["/api/admin/newsletter/subscriptions", { confirmed: false }],
    enabled: isAuthenticated,
  });
  const newsletterUnconfirmed = Array.isArray(newsletterUnconfirmedData) ? newsletterUnconfirmedData : [];

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/admin-login');
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const handleLogout = () => {
    logout.mutate();
    setLocation('/');
  };

  const startTourNinjaDraftPreview = async () => {
    setPreviewError(null);
    try {
      const response = await fetch("/api/admin/tour-ninja/releases/preview", {
        credentials: "same-origin",
        cache: "no-store",
      });
      const snapshot = await response.json();
      if (!response.ok || snapshot.enabled !== true) {
        throw new Error("No valid Tour Ninja draft release is configured.");
      }
      // Session storage is intentionally tab-scoped: it cannot create a
      // shareable public preview URL and is cleared when the tab is closed.
      if (!snapshot.contentDigest) {
        throw new Error("Draft preview did not provide a content digest.");
      }
      sessionStorage.setItem("tour-ninja-release-preview", "true");
      sessionStorage.setItem("tour-ninja-release-preview-digest", snapshot.contentDigest);
      window.location.assign("/");
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : "Draft preview is unavailable.");
    }
  };

  if (authLoading) return <div className="container mx-auto p-8 text-center">{adminT?.common?.loading || "Loading..."}</div>;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900">{dashboard?.title || "Administration"}</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">{dashboard?.subtitle || "Centralized management dashboard"}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setLocation('/admin-appearance')} 
                  className="flex items-center gap-2 text-sm sm:text-base"
                >
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">{adminT?.appearance?.title || "Site Appearance"}</span>
                  <span className="sm:hidden">{adminT?.appearance?.shortTitle || "Apparence"}</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={startTourNinjaDraftPreview}
                  className="flex items-center gap-2 text-sm sm:text-base"
                  data-testid="button-tour-ninja-draft-preview"
                >
                  <Globe className="h-4 w-4" />
                  Preview Tour Ninja draft
                </Button>
                <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 text-sm sm:text-base">
                  <LogOut className="h-4 w-4" />
                  {dashboard?.logout || "Logout"}
                </Button>
              </div>
            </div>
            {previewError && (
              <p className="mb-4 text-sm text-destructive" role="alert">{previewError}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Custom Tour Requests */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0 }}
              >
                <Card 
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-r from-blue-500 to-blue-600 shadow-md hover:shadow-xl hover:scale-105 relative"
                  onClick={() => setLocation('/admin-custom-tours')}
                >
                  {(customTourUnread?.length || 0) > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs z-10"
                    >
                      {customTourUnread?.length}
                    </Badge>
                  )}
                  <CardHeader className="text-white">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-heading">{sections?.customTours?.title || "Custom Tour Requests"}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-white/90">
                    <CardDescription className="text-white/80">
                      {sections?.customTours?.description || "Manage custom tour requests"}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Krabi Celebration */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card 
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-r from-pink-500 to-pink-600 shadow-md hover:shadow-xl hover:scale-105 relative"
                  onClick={() => setLocation('/admin/krabi-celebration')}
                >
                  {(krabiUnread?.length || 0) > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs z-10"
                    >
                      {krabiUnread?.length}
                    </Badge>
                  )}
                  <CardHeader className="text-white">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <PartyPopper className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-heading">{sections?.krabiCelebration?.title || "Krabi Celebration"}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-white/90">
                    <CardDescription className="text-white/80">
                      {sections?.krabiCelebration?.description || "Special event requests"}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Partnership Requests */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card 
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-md hover:shadow-xl hover:scale-105 relative"
                  onClick={() => setLocation('/admin/partnership-requests')}
                >
                  {(partnershipUnread?.length || 0) > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs z-10"
                    >
                      {partnershipUnread?.length}
                    </Badge>
                  )}
                  <CardHeader className="text-white">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Handshake className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-heading">{sections?.partnershipRequests?.title || "Partnership Requests"}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-white/90">
                    <CardDescription className="text-white/80">
                      {sections?.partnershipRequests?.description || "Collaboration proposals"}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Groups & Companies */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card 
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-r from-amber-500 to-amber-600 shadow-md hover:shadow-xl hover:scale-105 relative"
                  onClick={() => setLocation('/admin/group-requests')}
                >
                  {(groupUnread?.length || 0) > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs z-10"
                    >
                      {groupUnread?.length}
                    </Badge>
                  )}
                  <CardHeader className="text-white">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <UsersIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-heading">{sections?.groupRequests?.title || "Groups & Companies"}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-white/90">
                    <CardDescription className="text-white/80">
                      {sections?.groupRequests?.description || "Group and corporate requests"}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Blog */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card 
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-r from-purple-500 to-purple-600 shadow-md hover:shadow-xl hover:scale-105 relative"
                  onClick={() => setLocation('/admin-blog')}
                >
                  <CardHeader className="text-white">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-heading">{sections?.blogManagement?.title || "Blog Management"}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-white/90">
                    <CardDescription className="text-white/80">
                      {sections?.blogManagement?.description || "Create and edit articles"}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Newsletter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card 
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-r from-orange-500 to-orange-600 shadow-md hover:shadow-xl hover:scale-105 relative"
                  onClick={() => setLocation('/admin-newsletter')}
                >
                  {(newsletterUnconfirmed?.length || 0) > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs z-10"
                    >
                      {newsletterUnconfirmed?.length}
                    </Badge>
                  )}
                  <CardHeader className="text-white">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Newspaper className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-heading">{sections?.newsletter?.title || "Newsletter"}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-white/90">
                    <CardDescription className="text-white/80">
                      {sections?.newsletter?.description || "Manage newsletter subscriptions"}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Tour Ninja Images */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Card 
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-md hover:shadow-xl hover:scale-105 relative"
                  onClick={() => setLocation('/admin-tour-ninja-images')}
                >
                  <CardHeader className="text-white">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Image className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-heading">{sections?.tourNinjaImages?.title || "Tour Ninja Images"}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-white/90">
                    <CardDescription className="text-white/80">
                      {sections?.tourNinjaImages?.description || "Replace Tour Ninja images with your own"}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Translation Management */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <Card 
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-md hover:shadow-xl hover:scale-105 relative"
                  onClick={() => setLocation('/admin-translation')}
                >
                  <CardHeader className="text-white">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Globe className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-heading">{sections?.translations?.title || "Translation Management"}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-white/90">
                    <CardDescription className="text-white/80">
                      {sections?.translations?.description || "Fix and customize translations"}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Tour Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <Card 
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-r from-teal-500 to-teal-600 shadow-md hover:shadow-xl hover:scale-105 relative"
                  onClick={() => setLocation('/tour-card-builder')}
                >
                  <CardHeader className="text-white">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <ImagePlus className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-heading">{sections?.tourCards?.title || "Tour Cards"}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-white/90">
                    <CardDescription className="text-white/80">
                      {sections?.tourCards?.description || "Create and manage presentation cards"}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>


            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
}