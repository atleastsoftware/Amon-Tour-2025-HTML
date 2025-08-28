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
  ChevronRight,
  Home
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
    { id: 1, name: "Home", url: "/", hasSubmenu: false, children: [] },
    { id: 2, name: "Experiences", url: "/experiences", hasSubmenu: false, children: [] },
    { id: 3, name: "Custom Trip", url: "/custom-tour", hasSubmenu: false, children: [] },
    { id: 4, name: "Blog", url: "/blog", hasSubmenu: false, children: [] },
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
                        <TabsTrigger value="header-footer" className="justify-start gap-2 py-3">
                          <Layout className="h-4 w-4" />
                          Header & Footer
                        </TabsTrigger>
                        <TabsTrigger value="pages-content" className="justify-start gap-2 py-3">
                          <FileText className="h-4 w-4" />
                          Pages & Contenu
                        </TabsTrigger>
                        <TabsTrigger value="legal" className="justify-start gap-2 py-3">
                          <Settings className="h-4 w-4" />
                          Mentions légales
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
                                  <div className="flex items-center gap-2">
                                    <img 
                                      src="/attached_assets/logo.png" 
                                      alt="Logo actuel Amon Tour" 
                                      className="h-8 w-auto"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iIzFlNzNiZSIvPgo8dGV4dCB4PSIxNiIgeT0iMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BPC90ZXh0Pgo8L3N2Zz4K";
                                        target.className = "h-8 w-8";
                                      }}
                                    />
                                    <span className="text-xl font-bold text-[#1e73be]">Amon Tour</span>
                                  </div>
                                  <div>
                                    <p className="font-medium">Logo actuel</p>
                                    <p className="text-sm text-gray-600">Logo + texte Amon Tour</p>
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

                  {/* Header & Footer */}
                  <TabsContent value="header-footer" className="space-y-6">
                    {/* 1. Barre d'annonce */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Navigation className="h-5 w-5" />
                          Barre d'annonce
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <Label>Activer la barre d'annonce</Label>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <Label>Texte de l'annonce</Label>
                            <Input
                              defaultValue="📢 L'ancien site Amon Tour est toujours en ligne sur www.Amon-Tour.fr"
                              className="mt-1"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Couleur de fond</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Input type="color" defaultValue="#fbbf24" className="w-16 h-10 p-1" />
                                <Input defaultValue="#fbbf24" className="flex-1" />
                              </div>
                            </div>
                            <div>
                              <Label>Couleur du texte</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Input type="color" defaultValue="#000000" className="w-16 h-10 p-1" />
                                <Input defaultValue="#000000" className="flex-1" />
                              </div>
                            </div>
                          </div>

                          {/* Aperçu instantané */}
                          <div>
                            <Label>Aperçu</Label>
                            <div 
                              className="mt-2 p-3 text-center text-sm font-medium rounded border"
                              style={{ 
                                backgroundColor: "#fbbf24",
                                color: "#000000"
                              }}
                            >
                              📢 L'ancien site Amon Tour est toujours en ligne sur www.Amon-Tour.fr
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button onClick={() => toast({ title: "Barre d'annonce sauvegardée" })}>
                            <Save className="h-4 w-4 mr-2" />
                            Sauvegarder
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 2. Menu de navigation */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Layout className="h-5 w-5" />
                          Menu de navigation
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
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
                                <div>
                                  <span className="font-medium">{item.name}</span>
                                  <div className="text-sm text-gray-500">{item.url}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Edit className="h-4 w-4 mr-2" />
                                      Modifier
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Modifier {item.name}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label>Nom du menu</Label>
                                        <Input defaultValue={item.name} />
                                      </div>
                                      <div>
                                        <Label>Lien de redirection</Label>
                                        <Input defaultValue={item.url} />
                                      </div>
                                      <div>
                                        <Label>Catégorie parent (optionnel)</Label>
                                        <select className="w-full px-3 py-2 border rounded-md">
                                          <option value="">Aucune (menu principal)</option>
                                          <option value="home">Home</option>
                                          <option value="experiences">Experiences</option>
                                          <option value="custom-trip">Custom Trip</option>
                                          <option value="blog">Blog</option>
                                          <option value="contact">Contact</option>
                                        </select>
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
                        
                        <div className="grid grid-cols-2 gap-3">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="w-full">
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter un lien
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Ajouter un lien de navigation</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Nom du menu</Label>
                                  <Input placeholder="Ex: Nos services" />
                                </div>
                                <div>
                                  <Label>Lien de redirection</Label>
                                  <Input placeholder="Ex: /services" />
                                </div>
                                <div>
                                  <Label>Catégorie parent (optionnel)</Label>
                                  <select className="w-full px-3 py-2 border rounded-md">
                                    <option value="">Aucune (menu principal)</option>
                                    <option value="home">Home</option>
                                    <option value="experiences">Experiences</option>
                                    <option value="custom-trip">Custom Trip</option>
                                    <option value="blog">Blog</option>
                                    <option value="contact">Contact</option>
                                  </select>
                                </div>
                                <Button className="w-full">Créer le lien</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="w-full">
                                <Plus className="h-4 w-4 mr-2" />
                                Créer sous-catégorie
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Créer une sous-catégorie</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Nom de la catégorie</Label>
                                  <Input placeholder="Ex: Services premium" />
                                </div>
                                <div>
                                  <Label>Catégorie parent</Label>
                                  <select className="w-full px-3 py-2 border rounded-md">
                                    <option value="home">Home</option>
                                    <option value="experiences">Experiences</option>
                                    <option value="custom-trip">Custom Trip</option>
                                    <option value="blog">Blog</option>
                                    <option value="contact">Contact</option>
                                  </select>
                                </div>
                                <Button className="w-full">Créer la catégorie</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>

                        <div className="flex justify-end">
                          <Button onClick={() => toast({ title: "Menu sauvegardé avec succès" })}>
                            <Save className="h-4 w-4 mr-2" />
                            Sauvegarder le menu
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 3. Header principal */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Home className="h-5 w-5" />
                          Header principal
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div>
                            <Label>Titre principal</Label>
                            <div className="mt-2 space-y-2">
                              <Input defaultValue="Your exclusive experiences in Krabi – THAILAND" />
                              <div className="flex items-center gap-3">
                                <Label className="text-sm">Couleur pour "in Krabi"</Label>
                                <Input type="color" defaultValue="#3b82f6" className="w-16 h-8 p-1" />
                                <span className="text-sm text-gray-600">Prévisualisation avec couleur en direct</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <Label>Sous-titre</Label>
                            <Textarea 
                              defaultValue="Discover amazing places away from mass tourism in Krabi. And also Khao Sok, Koh Mook and many more destinations."
                              rows={3}
                            />
                          </div>

                          <Separator />

                          <div>
                            <h4 className="font-semibold mb-4">Boutons d'action</h4>
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 border rounded-lg">
                                <div>
                                  <Label>Bouton principal</Label>
                                  <Input placeholder="Texte du bouton" defaultValue="See our offers" />
                                </div>
                                <div>
                                  <Label>Lien de redirection</Label>
                                  <select className="w-full px-3 py-2 border rounded-md" defaultValue="/experiences">
                                    <option value="/">Accueil</option>
                                    <option value="/experiences">Experiences</option>
                                    <option value="/custom-tour">Custom Trip</option>
                                    <option value="/blog">Blog</option>
                                    <option value="/contact">Contact</option>
                                  </select>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 border rounded-lg">
                                <div>
                                  <Label>Bouton secondaire</Label>
                                  <Input placeholder="Texte du bouton" defaultValue="Custom your trip" />
                                </div>
                                <div>
                                  <Label>Lien de redirection</Label>
                                  <select className="w-full px-3 py-2 border rounded-md" defaultValue="/custom-tour">
                                    <option value="/">Accueil</option>
                                    <option value="/experiences">Experiences</option>
                                    <option value="/custom-tour">Custom Trip</option>
                                    <option value="/blog">Blog</option>
                                    <option value="/contact">Contact</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button onClick={() => toast({ title: "Header sauvegardé avec succès" })}>
                            <Save className="h-4 w-4 mr-2" />
                            Sauvegarder le header
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 4. Footer */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Layout className="h-5 w-5" />
                          Footer
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Contact */}
                          <div>
                            <div className="space-y-3">
                              <div>
                                <Label>Titre de la section</Label>
                                <Input defaultValue="Contact" />
                              </div>
                              <div>
                                <Label>Description</Label>
                                <Textarea 
                                  defaultValue="Amon Tour is a brand of:&#10;Flame BB Co., Ltd.&#10;242 Moo1 Tombol Ao Nang&#10;81180 Krabi, Thailand"
                                  rows={4}
                                />
                              </div>
                              <div>
                                <Label>TAT License</Label>
                                <Input defaultValue="TAT License: 34/01995" />
                              </div>
                              <div>
                                <Label>Email</Label>
                                <Input defaultValue="info@amon-tour.com" />
                              </div>
                              <div>
                                <Label>Téléphone (Opérations)</Label>
                                <Input defaultValue="Operations manager: +66 (0)6 2574 8788" />
                              </div>
                              <div>
                                <Label>Téléphone (Travel Advisor)</Label>
                                <Input defaultValue="Travel Advisor Manager: +66 (0)8 0463 4691" />
                              </div>
                              <div>
                                <Label>WhatsApp</Label>
                                <Input defaultValue="WhatsApp: +66 65 349 6445" />
                              </div>
                              <div>
                                <Label>Line ID</Label>
                                <Input defaultValue="Line ID: amontour" />
                              </div>
                              <div>
                                <Label>Réseaux sociaux</Label>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm w-20">Facebook:</span>
                                    <Input placeholder="Lien Facebook" defaultValue="https://facebook.com/amontour" />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm w-20">Instagram:</span>
                                    <Input placeholder="Lien Instagram" defaultValue="https://instagram.com/amon_tour" />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm w-20">YouTube:</span>
                                    <Input placeholder="Lien YouTube" defaultValue="https://youtube.com/amontour" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Useful Links */}
                          <div>
                            <div className="mb-4">
                              <Label>Titre de la section</Label>
                              <Input defaultValue="Useful Links" />
                            </div>
                            <div className="space-y-2">
                              {[
                                "Our brochure",
                                "Krabi Celebration", 
                                "Fun Garden",
                                "Villas in Krabi",
                                "Become Partner",
                                "Group & Corporate"
                              ].map((link, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <Input defaultValue={link} className="flex-1" />
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button variant="outline" size="sm" className="w-full mt-2">
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter un lien
                              </Button>
                            </div>
                          </div>

                          {/* Newsletter */}
                          <div>
                            <div className="mb-4">
                              <Label>Titre de la section</Label>
                              <Input defaultValue="Newsletter" />
                            </div>
                            <div className="space-y-3">
                              <div>
                                <Label>Description</Label>
                                <Textarea 
                                  defaultValue="Subscribe to receive our special offers and travel tips."
                                  rows={3}
                                />
                              </div>
                              <div>
                                <Label>Placeholder email</Label>
                                <Input defaultValue="Your email" />
                              </div>
                              <div>
                                <Label>Texte de confidentialité</Label>
                                <Input defaultValue="We respect your privacy. Unsubscribe at any time." />
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Copyright & Mentions */}
                        <div>
                          <h4 className="font-semibold mb-4">Copyright & Mentions</h4>
                          <div className="space-y-3">
                            <div>
                              <Label>Texte de copyright</Label>
                              <Input defaultValue="© 2024 Amon Tour. All rights reserved." />
                            </div>
                            <div>
                              <Label>Liens légaux</Label>
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <Label className="text-sm">Legal Notice</Label>
                                  <Input defaultValue="/legal-notice" />
                                </div>
                                <div>
                                  <Label className="text-sm">Privacy Policy</Label>
                                  <Input defaultValue="/privacy-policy" />
                                </div>
                                <div>
                                  <Label className="text-sm">Terms & Conditions</Label>
                                  <Input defaultValue="/terms-conditions" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button onClick={() => toast({ title: "Footer sauvegardé avec succès" })}>
                            <Save className="h-4 w-4 mr-2" />
                            Sauvegarder le footer
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Pages & Contenu */}
                  <TabsContent value="pages-content" className="space-y-6">
                    {/* Page d'accueil - Blocs complexes */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Home className="h-5 w-5" />
                          Page d'accueil - Sections et blocs
                        </CardTitle>
                        <p className="text-sm text-gray-600">Gérez les différents blocs de contenu de votre page d'accueil</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {(contentBlocks as any[])?.filter((block: any) => block.pageLocation === 'home').length > 0 ? 
                            (contentBlocks as any[]).filter((block: any) => block.pageLocation === 'home').map((block: any) => (
                              <div key={block.id} className="border rounded-lg p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-semibold">{block.title}</h4>
                                    <p className="text-sm text-gray-600">{block.subtitle}</p>
                                    <Badge variant="outline" className="mt-2">{block.identifier}</Badge>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Switch defaultChecked={block.isActive} />
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                          <Edit className="h-4 w-4 mr-2" />
                                          Modifier
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-3xl">
                                        <DialogHeader>
                                          <DialogTitle>Modifier le bloc : {block.title}</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          <div className="space-y-4">
                                            <div>
                                              <Label>Titre principal</Label>
                                              <Input defaultValue={block.title} />
                                            </div>
                                            <div>
                                              <Label>Sous-titre</Label>
                                              <Input defaultValue={block.subtitle} />
                                            </div>
                                            <div>
                                              <Label>Description</Label>
                                              <Textarea defaultValue={block.content} rows={4} />
                                            </div>
                                            <div>
                                              <Label>Texte du bouton (optionnel)</Label>
                                              <Input defaultValue={block.ctaText} />
                                            </div>
                                            <div>
                                              <Label>Lien du bouton (optionnel)</Label>
                                              <Input defaultValue={block.ctaUrl} />
                                            </div>
                                          </div>
                                          <div className="space-y-4">
                                            <div>
                                              <Label>Image du bloc</Label>
                                              <div className="mt-2">
                                                {block.imageUrl && (
                                                  <img 
                                                    src={block.imageUrl} 
                                                    alt={block.title} 
                                                    className="w-full h-32 object-cover rounded border mb-2"
                                                  />
                                                )}
                                                <Button variant="outline" size="sm" className="w-full">
                                                  <Upload className="h-4 w-4 mr-2" />
                                                  {block.imageUrl ? "Changer l'image" : "Ajouter une image"}
                                                </Button>
                                              </div>
                                            </div>
                                            <div>
                                              <Label>Ordre d'affichage</Label>
                                              <Input type="number" defaultValue={block.displayOrder} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Switch defaultChecked={block.isActive} />
                                              <Label>Bloc actif</Label>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex justify-end pt-4">
                                          <Button>Sauvegarder les modifications</Button>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                </div>
                                
                                {/* Preview du bloc */}
                                <div className="bg-gray-50 rounded p-4 border-l-4 border-blue-500">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium">Contenu:</span>
                                      <p className="text-gray-600 mt-1 line-clamp-2">{block.content}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium">Image:</span>
                                      <p className="text-gray-600 mt-1">{block.imageUrl ? "✅ Image définie" : "❌ Aucune image"}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium">Action:</span>
                                      <p className="text-gray-600 mt-1">{block.ctaText ? `"${block.ctaText}"` : "Aucun bouton"}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )) : (
                              <div className="text-center py-8 text-gray-500">
                                <Layout className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>Aucun bloc de contenu trouvé pour la page d'accueil</p>
                              </div>
                            )
                          }
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="w-full">
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter un nouveau bloc à la page d'accueil
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>Créer un nouveau bloc pour la page d'accueil</DialogTitle>
                              </DialogHeader>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div>
                                    <Label>Titre principal</Label>
                                    <Input placeholder="Titre de votre bloc" />
                                  </div>
                                  <div>
                                    <Label>Sous-titre</Label>
                                    <Input placeholder="Sous-titre du bloc" />
                                  </div>
                                  <div>
                                    <Label>Description</Label>
                                    <Textarea placeholder="Description du contenu..." rows={4} />
                                  </div>
                                  <div>
                                    <Label>Texte du bouton (optionnel)</Label>
                                    <Input placeholder="Ex: En savoir plus" />
                                  </div>
                                  <div>
                                    <Label>Lien du bouton (optionnel)</Label>
                                    <Input placeholder="Ex: /about" />
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Identifiant du bloc</Label>
                                    <Input placeholder="Ex: hero_section" />
                                  </div>
                                  <div>
                                    <Label>Ordre d'affichage</Label>
                                    <Input type="number" defaultValue="1" />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Switch defaultChecked />
                                    <Label>Activer le bloc</Label>
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-end pt-4">
                                <Button>Créer le bloc</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Autres pages - Contenu simple */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Autres pages - Contenu simple
                        </CardTitle>
                        <p className="text-sm text-gray-600">Modifiez le titre, l'image et la description des autres pages</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Page Contact */}
                          <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="font-semibold">Page Contact</h4>
                                <p className="text-sm text-gray-600">Personnalisez l'en-tête de la page contact</p>
                              </div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Modifier
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Modifier la page Contact</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label>Titre principal</Label>
                                      <Input defaultValue="Contactez-nous" />
                                    </div>
                                    <div>
                                      <Label>Sous-titre</Label>
                                      <Input defaultValue="Prêt à vivre l'aventure thaïlandaise ?" />
                                    </div>
                                    <div>
                                      <Label>Description</Label>
                                      <Textarea 
                                        defaultValue="Notre équipe est là pour répondre à toutes vos questions et vous aider à planifier le voyage parfait en Thaïlande."
                                        rows={3}
                                      />
                                    </div>
                                    <div>
                                      <Label>Image d'en-tête</Label>
                                      <Button variant="outline" className="w-full">
                                        <Upload className="h-4 w-4 mr-2" />
                                        Choisir une image
                                      </Button>
                                    </div>
                                    <Button className="w-full">Sauvegarder</Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>

                          {/* Page Blog */}
                          <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="font-semibold">Page Blog</h4>
                                <p className="text-sm text-gray-600">Personnalisez l'en-tête de votre blog</p>
                              </div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Modifier
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Modifier la page Blog</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label>Titre principal</Label>
                                      <Input defaultValue="Blog - Découvertes en Thaïlande" />
                                    </div>
                                    <div>
                                      <Label>Sous-titre</Label>
                                      <Input defaultValue="Inspiration, conseils et connaissances d'initiés" />
                                    </div>
                                    <div>
                                      <Label>Description</Label>
                                      <Textarea 
                                        defaultValue="Découvrez les joyaux cachés de la Thaïlande à travers nos articles de voyage."
                                        rows={3}
                                      />
                                    </div>
                                    <Button className="w-full">Sauvegarder</Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>

                          {/* Page Expériences */}
                          <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="font-semibold">Page Expériences</h4>
                                <p className="text-sm text-gray-600">Personnalisez la présentation de vos tours</p>
                              </div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Modifier
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Modifier la page Expériences</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label>Titre principal</Label>
                                      <Input defaultValue="Nos Expériences" />
                                    </div>
                                    <div>
                                      <Label>Sous-titre</Label>
                                      <Input defaultValue="Aventures authentiques en Thaïlande" />
                                    </div>
                                    <div>
                                      <Label>Description</Label>
                                      <Textarea 
                                        defaultValue="Explorez notre sélection d'expériences uniques pour découvrir la vraie Thaïlande."
                                        rows={3}
                                      />
                                    </div>
                                    <Button className="w-full">Sauvegarder</Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Mentions légales */}
                  <TabsContent value="legal" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="h-5 w-5" />
                          Mentions légales et pages juridiques
                        </CardTitle>
                        <p className="text-sm text-gray-600">Gérez vos pages légales, convictions et obligations légales</p>
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