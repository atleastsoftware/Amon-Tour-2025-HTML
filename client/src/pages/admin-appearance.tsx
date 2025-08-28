import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Palette, 
  Type, 
  ImageIcon, 
  Navigation, 
  Layout, 
  FileText, 
  FolderOpen,
  Eye,
  History,
  Settings,
  Save,
  Upload,
  Trash2,
  Edit,
  Monitor,
  Smartphone,
  Tablet
} from "lucide-react";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function AdminAppearance() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");

  // Navigation tabs state
  const [activeTab, setActiveTab] = useState("theme");

  // Fetch site settings
  const { data: siteSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/admin/site-settings"],
    retry: false,
  });

  // Fetch content blocks
  const { data: contentBlocks, isLoading: blocksLoading } = useQuery({
    queryKey: ["/api/admin/content-blocks"],
    retry: false,
  });

  // Fetch static pages
  const { data: staticPages, isLoading: pagesLoading } = useQuery({
    queryKey: ["/api/admin/static-pages"],
    retry: false,
  });

  // Fetch media library
  const { data: mediaLibrary, isLoading: mediaLoading } = useQuery({
    queryKey: ["/api/admin/media-library"],
    retry: false,
  });

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
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation('/admin')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour
                </Button>
                <div>
                  <h1 className="text-3xl font-heading font-bold text-gray-900 flex items-center gap-3">
                    <Palette className="h-8 w-8 text-blue-600" />
                    Apparence du site
                  </h1>
                  <p className="text-gray-600 mt-2">Personnalisez l'apparence et le contenu de votre site</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="flex items-center gap-2">
                  <Eye className="h-3 w-3" />
                  Mode Aperçu
                </Badge>
                <div className="flex items-center gap-1 bg-white rounded-lg p-1 border">
                  <Button
                    variant={previewMode === "desktop" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPreviewMode("desktop")}
                    className="p-2"
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={previewMode === "tablet" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPreviewMode("tablet")}
                    className="p-2"
                  >
                    <Tablet className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={previewMode === "mobile" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPreviewMode("mobile")}
                    className="p-2"
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar - Configuration */}
              <div className="lg:col-span-1">
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
                      <TabsList className="grid grid-cols-1 h-auto bg-gray-100 p-1">
                        <TabsTrigger value="theme" className="justify-start gap-2 py-3">
                          <Palette className="h-4 w-4" />
                          Thème & Design
                        </TabsTrigger>
                        <TabsTrigger value="navigation" className="justify-start gap-2 py-3">
                          <Navigation className="h-4 w-4" />
                          Navigation & Menus
                        </TabsTrigger>
                        <TabsTrigger value="pages" className="justify-start gap-2 py-3">
                          <FileText className="h-4 w-4" />
                          Pages statiques
                        </TabsTrigger>
                        <TabsTrigger value="blocks" className="justify-start gap-2 py-3">
                          <Layout className="h-4 w-4" />
                          Sections & Blocs
                        </TabsTrigger>
                        <TabsTrigger value="media" className="justify-start gap-2 py-3">
                          <FolderOpen className="h-4 w-4" />
                          Médiathèque
                        </TabsTrigger>
                        <TabsTrigger value="history" className="justify-start gap-2 py-3">
                          <History className="h-4 w-4" />
                          Historique
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Area */}
              <div className="lg:col-span-3">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  {/* Thème & Design */}
                  <TabsContent value="theme" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Palette className="h-5 w-5" />
                          Thème & Design
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Couleurs */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Couleurs du site</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="primary-color">Couleur principale</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Input
                                  type="color"
                                  id="primary-color"
                                  defaultValue="#1e73be"
                                  className="w-16 h-10 p-1 border rounded"
                                />
                                <Input
                                  placeholder="#1e73be"
                                  defaultValue="#1e73be"
                                  className="flex-1"
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="secondary-color">Couleur secondaire</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Input
                                  type="color"
                                  id="secondary-color"
                                  defaultValue="#E6B64C"
                                  className="w-16 h-10 p-1 border rounded"
                                />
                                <Input
                                  placeholder="#E6B64C"
                                  defaultValue="#E6B64C"
                                  className="flex-1"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Typographie */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Typographie</h3>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="font-heading">Police des titres</Label>
                              <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md">
                                <option>Inter</option>
                                <option>Roboto</option>
                                <option>Open Sans</option>
                                <option>Poppins</option>
                              </select>
                            </div>
                            <div>
                              <Label htmlFor="font-body">Police du texte</Label>
                              <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md">
                                <option>Inter</option>
                                <option>Roboto</option>
                                <option>Open Sans</option>
                                <option>Source Sans Pro</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Logo & Favicon */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Logo & Identité</h3>
                          <div className="space-y-4">
                            <div>
                              <Label>Logo principal</Label>
                              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600 mb-2">Glissez votre logo ici ou cliquez pour sélectionner</p>
                                <Button variant="outline" size="sm">
                                  <Upload className="h-4 w-4 mr-2" />
                                  Choisir un fichier
                                </Button>
                              </div>
                            </div>
                            <div>
                              <Label>Favicon</Label>
                              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                <p className="text-sm text-gray-600 mb-2">Icône du site (16x16px)</p>
                                <Button variant="outline" size="sm">
                                  <Upload className="h-4 w-4 mr-2" />
                                  Choisir une icône
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            Sauvegarder le thème
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Navigation & Menus */}
                  <TabsContent value="navigation" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Navigation className="h-5 w-5" />
                          Navigation & Menus
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Barre d'annonce */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Barre d'annonce</h3>
                            <Switch defaultChecked />
                          </div>
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="announcement-text">Texte de l'annonce</Label>
                              <Input
                                id="announcement-text"
                                defaultValue="⚠️ L'ancien site Amon Tour est toujours en ligne sur www.Amon-Tour.fr"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="announcement-color">Couleur de fond</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Input
                                  type="color"
                                  id="announcement-color"
                                  defaultValue="#fbbf24"
                                  className="w-16 h-10 p-1 border rounded"
                                />
                                <Input
                                  placeholder="#fbbf24"
                                  defaultValue="#fbbf24"
                                  className="flex-1"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Menu principal */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Menu principal</h3>
                          <div className="space-y-3">
                            {["Accueil", "Tours", "Expériences", "À propos", "Contact"].map((item, index) => (
                              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                                  <span>{item}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <Button variant="outline" className="w-full mt-3">
                            + Ajouter un élément de menu
                          </Button>
                        </div>

                        <div className="flex justify-end">
                          <Button className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            Sauvegarder la navigation
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Pages statiques */}
                  <TabsContent value="pages" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Pages statiques
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {["Accueil", "À propos", "Contact", "Mentions légales", "Politique de confidentialité"].map((page, index) => (
                            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <h4 className="font-medium">{page}</h4>
                                <p className="text-sm text-gray-600">Dernière modification : il y a 2 jours</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">Publié</Badge>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Modifier
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" className="w-full mt-4">
                          + Créer une nouvelle page
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Sections & Blocs */}
                  <TabsContent value="blocks" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Layout className="h-5 w-5" />
                          Sections & Blocs de contenu
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            { name: "Hero Section", page: "Accueil", status: "Actif" },
                            { name: "À propos", page: "Accueil", status: "Actif" },
                            { name: "Nos services", page: "Accueil", status: "Actif" },
                            { name: "Témoignages", page: "Accueil", status: "Inactif" },
                          ].map((block, index) => (
                            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <h4 className="font-medium">{block.name}</h4>
                                <p className="text-sm text-gray-600">Page : {block.page}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={block.status === "Actif" ? "default" : "secondary"}>
                                  {block.status}
                                </Badge>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Modifier
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" className="w-full mt-4">
                          + Ajouter un nouveau bloc
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Médiathèque */}
                  <TabsContent value="media" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FolderOpen className="h-5 w-5" />
                          Médiathèque
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
                          <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <p className="text-lg font-medium text-gray-700 mb-2">Glissez vos fichiers ici</p>
                          <p className="text-sm text-gray-600 mb-4">ou cliquez pour sélectionner des fichiers</p>
                          <Button>
                            <Upload className="h-4 w-4 mr-2" />
                            Choisir des fichiers
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {/* Placeholder images */}
                          {Array.from({ length: 12 }).map((_, index) => (
                            <div key={index} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Historique */}
                  <TabsContent value="history" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <History className="h-5 w-5" />
                          Historique des modifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            { action: "Modification du logo", user: "admin", date: "Il y a 2 heures" },
                            { action: "Mise à jour de la page À propos", user: "amonmanager", date: "Il y a 1 jour" },
                            { action: "Changement de couleur principale", user: "admin", date: "Il y a 3 jours" },
                            { action: "Ajout d'un nouveau bloc de contenu", user: "amonmanager", date: "Il y a 5 jours" },
                          ].map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <h4 className="font-medium">{item.action}</h4>
                                <p className="text-sm text-gray-600">Par {item.user} • {item.date}</p>
                              </div>
                              <Button variant="outline" size="sm">
                                Restaurer
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
}