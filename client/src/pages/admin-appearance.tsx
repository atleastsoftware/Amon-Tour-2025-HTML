import { useState, useRef } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Tablet,
  Plus,
  GripVertical,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function AdminAppearance() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  // Navigation tabs state
  const [activeTab, setActiveTab] = useState("theme");

  // Form states
  const [themeColors, setThemeColors] = useState({
    primary: "#1e73be",
    secondary: "#E6B64C"
  });
  const [menuItems, setMenuItems] = useState([
    { id: 1, name: "Accueil", url: "/", hasSubmenu: false, children: [] },
    { id: 2, name: "Tours", url: "/tours", hasSubmenu: false, children: [] },
    { id: 3, name: "Expériences", url: "/experiences", hasSubmenu: false, children: [] },
    { id: 4, name: "À propos", url: "/about", hasSubmenu: false, children: [] },
    { id: 5, name: "Contact", url: "/contact", hasSubmenu: false, children: [] }
  ]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

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

  // Mutations
  const updateSettingMutation = useMutation({
    mutationFn: async ({ section, key, value }: { section: string; key: string; value: string }) => {
      const response = await fetch(`/api/admin/site-settings/${section}/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value })
      });
      if (!response.ok) throw new Error('Update failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/site-settings"] });
      toast({ title: "Paramètre mis à jour avec succès" });
    },
    onError: () => {
      toast({ title: "Erreur lors de la mise à jour", variant: "destructive" });
    }
  });

  const uploadFileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/admin/media-library', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/media-library"] });
      toast({ title: "Fichier uploadé avec succès" });
    },
    onError: () => {
      toast({ title: "Erreur lors de l'upload", variant: "destructive" });
    }
  });

  // Handlers
  const handleColorChange = (colorType: 'primary' | 'secondary', value: string) => {
    setThemeColors(prev => ({ ...prev, [colorType]: value }));
    updateSettingMutation.mutate({
      section: 'theme',
      key: `${colorType}_color`,
      value
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', type);
    formData.append('altText', `${type} upload`);

    uploadFileMutation.mutate(formData);
  };

  const handleMenuDragStart = (id: number) => {
    setDraggedItem(id);
  };

  const handleMenuDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleMenuDrop = (event: React.DragEvent, targetId: number) => {
    event.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const newMenuItems = [...menuItems];
    const draggedIndex = newMenuItems.findIndex(item => item.id === draggedItem);
    const targetIndex = newMenuItems.findIndex(item => item.id === targetId);

    const [draggedMenu] = newMenuItems.splice(draggedIndex, 1);
    newMenuItems.splice(targetIndex, 0, draggedMenu);

    setMenuItems(newMenuItems);
    setDraggedItem(null);
  };

  const addMenuItem = () => {
    const newItem = {
      id: Date.now(),
      name: "Nouveau menu",
      url: "/nouveau",
      hasSubmenu: false,
      children: []
    };
    setMenuItems([...menuItems, newItem]);
  };

  const editMenuItem = (id: number, name: string, url: string) => {
    setMenuItems(prev => prev.map(item => 
      item.id === id ? { ...item, name, url } : item
    ));
  };

  const deleteMenuItem = (id: number) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
  };

  const togglePreview = () => {
    // Ouvrir une nouvelle fenêtre avec aperçu
    window.open('/', '_blank');
  };

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
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={togglePreview}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Aperçu du site
                  </Button>
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
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <Label htmlFor="primary-color">Couleur principale</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Input
                                  type="color"
                                  id="primary-color"
                                  value={themeColors.primary}
                                  onChange={(e) => handleColorChange('primary', e.target.value)}
                                  className="w-16 h-10 p-1 border rounded cursor-pointer"
                                />
                                <Input
                                  placeholder="#1e73be"
                                  value={themeColors.primary}
                                  onChange={(e) => handleColorChange('primary', e.target.value)}
                                  className="flex-1"
                                />
                              </div>
                              {/* Aperçu de la couleur */}
                              <div className="mt-3 p-4 rounded-lg border" style={{ backgroundColor: themeColors.primary }}>
                                <div className="text-white font-semibold">Aperçu bouton principal</div>
                                <div className="text-white/80 text-sm">Couleur utilisée pour les boutons et liens</div>
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="secondary-color">Couleur secondaire</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Input
                                  type="color"
                                  id="secondary-color"
                                  value={themeColors.secondary}
                                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                                  className="w-16 h-10 p-1 border rounded cursor-pointer"
                                />
                                <Input
                                  placeholder="#E6B64C"
                                  value={themeColors.secondary}
                                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                                  className="flex-1"
                                />
                              </div>
                              {/* Aperçu de la couleur */}
                              <div className="mt-3 p-4 rounded-lg border" style={{ backgroundColor: themeColors.secondary }}>
                                <div className="text-white font-semibold">Aperçu accent</div>
                                <div className="text-white/80 text-sm">Couleur pour les éléments décoratifs</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Typographie */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Typographie</h3>
                          <div className="space-y-6">
                            <div>
                              <Label htmlFor="font-heading">Police des titres</Label>
                              <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md">
                                <option>Inter</option>
                                <option>Roboto</option>
                                <option>Open Sans</option>
                                <option>Poppins</option>
                              </select>
                              {/* Aperçu de la police de titre */}
                              <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                                <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Inter' }}>
                                  Aperçu Titre Principal
                                </h1>
                                <h2 className="text-xl font-semibold mb-1" style={{ fontFamily: 'Inter' }}>
                                  Aperçu Sous-titre
                                </h2>
                                <h3 className="text-lg font-medium" style={{ fontFamily: 'Inter' }}>
                                  Aperçu Titre de Section
                                </h3>
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="font-body">Police du texte</Label>
                              <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md">
                                <option>Inter</option>
                                <option>Roboto</option>
                                <option>Open Sans</option>
                                <option>Source Sans Pro</option>
                              </select>
                              {/* Aperçu de la police de texte */}
                              <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                                <p className="text-base mb-2" style={{ fontFamily: 'Inter' }}>
                                  Ceci est un aperçu du texte principal de votre site. Cette police sera utilisée pour tous les paragraphes et contenus textuels.
                                </p>
                                <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter' }}>
                                  Texte plus petit pour les détails et informations complémentaires.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Logo & Favicon */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Logo & Identité</h3>
                          <div className="space-y-6">
                            <div>
                              <Label>Logo principal</Label>
                              {/* Logo actuel s'il existe */}
                              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-4 mb-4">
                                  <img 
                                    src="/attached_assets/amon-tour-logo.png" 
                                    alt="Logo actuel Amon Tour" 
                                    className="h-12 w-auto"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                  <div>
                                    <p className="font-medium">Logo actuel</p>
                                    <p className="text-sm text-gray-600">Amon Tour</p>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600 mb-2">Glissez votre nouveau logo ici ou cliquez pour sélectionner</p>
                                <input
                                  type="file"
                                  ref={logoInputRef}
                                  onChange={(e) => handleFileUpload(e, 'logo')}
                                  accept="image/*"
                                  style={{ display: 'none' }}
                                />
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => logoInputRef.current?.click()}
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Choisir un fichier
                                </Button>
                              </div>
                            </div>
                            <div>
                              <Label>Favicon</Label>
                              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                <p className="text-sm text-gray-600 mb-2">Icône du site (16x16px)</p>
                                <input
                                  type="file"
                                  ref={faviconInputRef}
                                  onChange={(e) => handleFileUpload(e, 'favicon')}
                                  accept="image/*"
                                  style={{ display: 'none' }}
                                />
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => faviconInputRef.current?.click()}
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Choisir une icône
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button 
                            className="flex items-center gap-2"
                            onClick={() => toast({ title: "Thème sauvegardé avec succès" })}
                          >
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
                            {menuItems.map((item) => (
                              <div 
                                key={item.id} 
                                className="flex items-center justify-between p-3 border rounded-lg bg-white"
                                draggable
                                onDragStart={() => handleMenuDragStart(item.id)}
                                onDragOver={handleMenuDragOver}
                                onDrop={(e) => handleMenuDrop(e, item.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                                  <div>
                                    <span className="font-medium">{item.name}</span>
                                    <div className="text-sm text-gray-500">{item.url}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Modifier l'élément de menu</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div>
                                          <Label htmlFor="menu-name">Nom du menu</Label>
                                          <Input
                                            id="menu-name"
                                            defaultValue={item.name}
                                            onBlur={(e) => editMenuItem(item.id, e.target.value, item.url)}
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor="menu-url">URL</Label>
                                          <Input
                                            id="menu-url"
                                            defaultValue={item.url}
                                            onBlur={(e) => editMenuItem(item.id, item.name, e.target.value)}
                                          />
                                        </div>
                                        <Button className="w-full">Sauvegarder</Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => deleteMenuItem(item.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <Button 
                            variant="outline" 
                            className="w-full mt-3"
                            onClick={addMenuItem}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter un élément de menu
                          </Button>
                        </div>

                        <div className="flex justify-end">
                          <Button 
                            className="flex items-center gap-2"
                            onClick={() => toast({ title: "Navigation sauvegardée avec succès" })}
                          >
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
                          {(staticPages as any[])?.length > 0 ? (staticPages as any[]).map((page: any) => (
                            <div key={page.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <h4 className="font-medium">{page.title}</h4>
                                <p className="text-sm text-gray-600">
                                  Slug: /{page.slug} • Dernière modification : {new Date(page.updatedAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={page.isPublished ? "default" : "secondary"}>
                                  {page.isPublished ? "Publié" : "Brouillon"}
                                </Badge>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Edit className="h-4 w-4 mr-2" />
                                      Modifier
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Modifier la page : {page.title}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label>Titre de la page</Label>
                                        <Input defaultValue={page.title} />
                                      </div>
                                      <div>
                                        <Label>Slug (URL)</Label>
                                        <Input defaultValue={page.slug} />
                                      </div>
                                      <div>
                                        <Label>Contenu</Label>
                                        <Textarea 
                                          defaultValue={page.content}
                                          rows={10}
                                          className="min-h-[200px]"
                                        />
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Switch defaultChecked={page.isPublished} />
                                        <Label>Publier cette page</Label>
                                      </div>
                                      <Button className="w-full">Sauvegarder les modifications</Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          )) : (
                            <div className="text-center py-8 text-gray-500">
                              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                              <p>Aucune page statique trouvée</p>
                            </div>
                          )}
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full mt-4">
                              <Plus className="h-4 w-4 mr-2" />
                              Créer une nouvelle page
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Créer une nouvelle page</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Titre de la page</Label>
                                <Input placeholder="Titre de votre page" />
                              </div>
                              <div>
                                <Label>Slug (URL)</Label>
                                <Input placeholder="url-de-votre-page" />
                              </div>
                              <div>
                                <Label>Contenu</Label>
                                <Textarea 
                                  placeholder="Contenu de votre page..."
                                  rows={10}
                                  className="min-h-[200px]"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch />
                                <Label>Publier immédiatement</Label>
                              </div>
                              <Button className="w-full">Créer la page</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
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
                          {(contentBlocks as any[])?.length > 0 ? (contentBlocks as any[]).map((block: any) => (
                            <div key={block.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <h4 className="font-medium">{block.title || block.identifier}</h4>
                                <p className="text-sm text-gray-600">
                                  Page : {block.pageLocation} • Ordre : {block.displayOrder}
                                </p>
                                {block.subtitle && (
                                  <p className="text-sm text-gray-500 mt-1">{block.subtitle}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={block.isActive ? "default" : "secondary"}>
                                  {block.isActive ? "Actif" : "Inactif"}
                                </Badge>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Edit className="h-4 w-4 mr-2" />
                                      Modifier
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Modifier le bloc : {block.title || block.identifier}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label>Titre du bloc</Label>
                                        <Input defaultValue={block.title} />
                                      </div>
                                      <div>
                                        <Label>Sous-titre</Label>
                                        <Input defaultValue={block.subtitle} />
                                      </div>
                                      <div>
                                        <Label>Contenu</Label>
                                        <Textarea 
                                          defaultValue={block.content}
                                          rows={6}
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label>Page</Label>
                                          <select className="w-full px-3 py-2 border rounded-md" defaultValue={block.pageLocation}>
                                            <option value="home">Accueil</option>
                                            <option value="tours">Tours</option>
                                            <option value="about">À propos</option>
                                            <option value="contact">Contact</option>
                                          </select>
                                        </div>
                                        <div>
                                          <Label>Ordre d'affichage</Label>
                                          <Input type="number" defaultValue={block.displayOrder} />
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Switch defaultChecked={block.isActive} />
                                        <Label>Bloc actif</Label>
                                      </div>
                                      <Button className="w-full">Sauvegarder les modifications</Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          )) : (
                            <div className="text-center py-8 text-gray-500">
                              <Layout className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                              <p>Aucun bloc de contenu trouvé</p>
                            </div>
                          )}
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full mt-4">
                              <Plus className="h-4 w-4 mr-2" />
                              Ajouter un nouveau bloc
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Créer un nouveau bloc de contenu</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Identifiant unique</Label>
                                <Input placeholder="hero_section_accueil" />
                              </div>
                              <div>
                                <Label>Titre du bloc</Label>
                                <Input placeholder="Titre de votre bloc" />
                              </div>
                              <div>
                                <Label>Sous-titre</Label>
                                <Input placeholder="Sous-titre optionnel" />
                              </div>
                              <div>
                                <Label>Contenu</Label>
                                <Textarea 
                                  placeholder="Contenu du bloc..."
                                  rows={6}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Page</Label>
                                  <select className="w-full px-3 py-2 border rounded-md">
                                    <option value="home">Accueil</option>
                                    <option value="tours">Tours</option>
                                    <option value="about">À propos</option>
                                    <option value="contact">Contact</option>
                                  </select>
                                </div>
                                <div>
                                  <Label>Ordre d'affichage</Label>
                                  <Input type="number" defaultValue={0} />
                                </div>
                              </div>
                              <Button className="w-full">Créer le bloc</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
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
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => handleFileUpload(e, 'general')}
                            accept="image/*,video/*"
                            multiple
                            style={{ display: 'none' }}
                          />
                          <Button onClick={() => fileInputRef.current?.click()}>
                            <Upload className="h-4 w-4 mr-2" />
                            Choisir des fichiers
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {(mediaLibrary as any[])?.length > 0 ? (mediaLibrary as any[]).map((item: any) => (
                            <div key={item.id} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                              {item.fileType === 'image' ? (
                                <img 
                                  src={item.fileUrl} 
                                  alt={item.altText || item.originalName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <FileText className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="flex gap-2">
                                  <Button size="sm" variant="secondary">
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="destructive">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                                <p className="text-white text-xs truncate">{item.originalName}</p>
                              </div>
                            </div>
                          )) : (
                            Array.from({ length: 6 }).map((_, index) => (
                              <div key={index} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            ))
                          )}
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