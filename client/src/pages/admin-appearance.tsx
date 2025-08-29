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
  Home,
  Bold,
  Italic
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
                            <div className="flex items-center gap-2 mt-2">
                              <input type="checkbox" id="bold-announcement" defaultChecked />
                              <Label htmlFor="bold-announcement" className="text-sm">Texte en gras</Label>
                            </div>
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
                                color: "#000000",
                                fontWeight: "bold"
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
                                        <select className="w-full px-3 py-2 border rounded-md" defaultValue={item.url}>
                                          <option value="/">Accueil</option>
                                          <option value="/experiences">Experiences</option>
                                          <option value="/custom-tour">Custom Trip</option>
                                          <option value="/blog">Blog</option>
                                          <option value="/contact">Contact</option>
                                          <option value="/our-brochure">Our brochure</option>
                                          <option value="/krabi-celebration">Krabi Celebration</option>
                                          <option value="/fun-garden">Fun Garden</option>
                                          <option value="/villas-in-krabi">Villas in Krabi</option>
                                          <option value="/become-partner">Become Partner</option>
                                          <option value="/group-corporate">Group & Corporate</option>
                                          <option value="/legal-notice">Legal Notice</option>
                                          <option value="/privacy-policy">Privacy Policy</option>
                                          <option value="/terms-conditions">Terms & Conditions</option>
                                        </select>
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
                                  <select className="w-full px-3 py-2 border rounded-md">
                                    <option value="/">Accueil</option>
                                    <option value="/experiences">Experiences</option>
                                    <option value="/custom-tour">Custom Trip</option>
                                    <option value="/blog">Blog</option>
                                    <option value="/contact">Contact</option>
                                    <option value="/our-brochure">Our brochure</option>
                                    <option value="/krabi-celebration">Krabi Celebration</option>
                                    <option value="/fun-garden">Fun Garden</option>
                                    <option value="/villas-in-krabi">Villas in Krabi</option>
                                    <option value="/become-partner">Become Partner</option>
                                    <option value="/group-corporate">Group & Corporate</option>
                                    <option value="/legal-notice">Legal Notice</option>
                                    <option value="/privacy-policy">Privacy Policy</option>
                                    <option value="/terms-conditions">Terms & Conditions</option>
                                  </select>
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
                            <div className="mt-2 space-y-4">
                              <div className="border rounded-lg p-4 bg-gray-50">
                                <div 
                                  contentEditable
                                  suppressContentEditableWarning={true}
                                  className="font-medium text-lg min-h-[60px] p-2 bg-white border rounded outline-none focus:ring-2 focus:ring-blue-500"
                                  style={{ lineHeight: '1.5' }}
                                  dangerouslySetInnerHTML={{
                                    __html: 'Your exclusive experiences <span style="color: #1e73be;">in Krabi –</span> <span style="color: #000000;">THAILAND</span>'
                                  }}
                                />
                                <div className="flex items-center gap-3 mt-3 pt-3 border-t">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">Couleur du texte :</span>
                                    <Input 
                                      type="color" 
                                      defaultValue="#1e73be" 
                                      className="w-12 h-8 p-1 cursor-pointer"
                                      onChange={(e) => {
                                        const selection = window.getSelection();
                                        if (selection && selection.rangeCount > 0) {
                                          document.execCommand('foreColor', false, e.target.value);
                                        }
                                      }}
                                    />
                                    <span className="text-xs px-2 py-1 bg-gray-200 rounded font-mono">#1e73be</span>
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      const editable = document.querySelector('[contentEditable="true"]');
                                      if (editable) {
                                        editable.innerHTML = 'Your exclusive experiences in Krabi – THAILAND';
                                      }
                                    }}
                                  >
                                    Réinitialiser
                                  </Button>
                                </div>
                                <div className="text-sm text-gray-600 mt-2">
                                  💡 <strong>Instructions :</strong> Sélectionnez une partie du texte avec votre souris, puis choisissez une couleur pour l'appliquer
                                </div>
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
                                    <option value="/our-brochure">Our brochure</option>
                                    <option value="/krabi-celebration">Krabi Celebration</option>
                                    <option value="/fun-garden">Fun Garden</option>
                                    <option value="/villas-in-krabi">Villas in Krabi</option>
                                    <option value="/become-partner">Become Partner</option>
                                    <option value="/group-corporate">Group & Corporate</option>
                                    <option value="/legal-notice">Legal Notice</option>
                                    <option value="/privacy-policy">Privacy Policy</option>
                                    <option value="/terms-conditions">Terms & Conditions</option>
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
                                    <option value="/our-brochure">Our brochure</option>
                                    <option value="/krabi-celebration">Krabi Celebration</option>
                                    <option value="/fun-garden">Fun Garden</option>
                                    <option value="/villas-in-krabi">Villas in Krabi</option>
                                    <option value="/become-partner">Become Partner</option>
                                    <option value="/group-corporate">Group & Corporate</option>
                                    <option value="/legal-notice">Legal Notice</option>
                                    <option value="/privacy-policy">Privacy Policy</option>
                                    <option value="/terms-conditions">Terms & Conditions</option>
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
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Modifier le lien</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div>
                                          <Label>Texte du lien</Label>
                                          <Input defaultValue={link} />
                                        </div>
                                        <div>
                                          <Label>Lien de redirection</Label>
                                          <select className="w-full px-3 py-2 border rounded-md">
                                            <option value="/">Accueil</option>
                                            <option value="/experiences">Experiences</option>
                                            <option value="/custom-tour">Custom Trip</option>
                                            <option value="/blog">Blog</option>
                                            <option value="/contact">Contact</option>
                                            <option value="/our-brochure">Our brochure</option>
                                            <option value="/krabi-celebration">Krabi Celebration</option>
                                            <option value="/fun-garden">Fun Garden</option>
                                            <option value="/villas-in-krabi">Villas in Krabi</option>
                                            <option value="/become-partner">Become Partner</option>
                                            <option value="/group-corporate">Group & Corporate</option>
                                            <option value="/legal-notice">Legal Notice</option>
                                            <option value="/privacy-policy">Privacy Policy</option>
                                            <option value="/terms-conditions">Terms & Conditions</option>
                                          </select>
                                        </div>
                                        <Button className="w-full">Sauvegarder les modifications</Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              ))}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="w-full mt-2">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Ajouter un lien
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Ajouter un nouveau lien</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label>Texte du lien</Label>
                                      <Input placeholder="Ex: Nos services" />
                                    </div>
                                    <div>
                                      <Label>Lien de redirection</Label>
                                      <select className="w-full px-3 py-2 border rounded-md">
                                        <option value="/">Accueil</option>
                                        <option value="/experiences">Experiences</option>
                                        <option value="/custom-tour">Custom Trip</option>
                                        <option value="/blog">Blog</option>
                                        <option value="/contact">Contact</option>
                                        <option value="/our-brochure">Our brochure</option>
                                        <option value="/krabi-celebration">Krabi Celebration</option>
                                        <option value="/fun-garden">Fun Garden</option>
                                        <option value="/villas-in-krabi">Villas in Krabi</option>
                                        <option value="/become-partner">Become Partner</option>
                                        <option value="/group-corporate">Group & Corporate</option>
                                        <option value="/legal-notice">Legal Notice</option>
                                        <option value="/privacy-policy">Privacy Policy</option>
                                        <option value="/terms-conditions">Terms & Conditions</option>
                                      </select>
                                    </div>
                                    <Button className="w-full">Créer le lien</Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
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

                        {/* Copyright */}
                        <div>
                          <h4 className="font-semibold mb-4">Copyright</h4>
                          <div className="space-y-3">
                            <div>
                              <Label>Texte de copyright</Label>
                              <Input defaultValue="© 2024 Amon Tour. All rights reserved." />
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
                    
                    {/* Pages principales - Accueil + Menu */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Home className="h-5 w-5" />
                          Pages principales - Accueil + Menu
                        </CardTitle>
                        <p className="text-sm text-gray-600">Pages visibles dans l'accueil et le menu principal</p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        
                        {/* Page d'accueil avec sections spécifiques */}
                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-4 text-lg">🏠 Page d'Accueil - Sections</h4>
                          
                          {/* Section: Experts welcome you */}
                          <div className="space-y-4 mb-6 p-4 bg-blue-50 rounded">
                            <h5 className="font-medium">Experts welcome you in the host country</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Titre de la section</Label>
                                <Input defaultValue="Experts welcome you in the host country" />
                              </div>
                              <div>
                                <Label>Sous-titre</Label>
                                <Input defaultValue="Découvrez la Thaïlande avec nos experts locaux" />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <Label>Annonces à mettre en avant</Label>
                                <select className="w-full px-3 py-2 border rounded-md">
                                  <option>Sélectionner les tours</option>
                                  <option>Krabi Adventures</option>
                                  <option>Phi Phi Experience</option>
                                  <option>Jungle Trekking</option>
                                </select>
                              </div>
                              <div>
                                <Label>Nombre d'annonces visibles</Label>
                                <Input type="number" defaultValue="3" />
                              </div>
                              <div>
                                <Label>Description courte</Label>
                                <Input defaultValue="Nos meilleurs guides vous accompagnent" />
                              </div>
                            </div>
                          </div>

                          {/* Section: Our popular experiences */}
                          <div className="space-y-4 mb-6 p-4 bg-green-50 rounded">
                            <h5 className="font-medium">Our popular experiences</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Titre de la section</Label>
                                <Input defaultValue="Our popular experiences" />
                              </div>
                              <div>
                                <Label>Sous-titre</Label>
                                <Input defaultValue="Les expériences les plus demandées" />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Annonces à mettre en avant</Label>
                                <select className="w-full px-3 py-2 border rounded-md">
                                  <option>Sélectionner les tours populaires</option>
                                  <option>Island Hopping</option>
                                  <option>Temple Visits</option>
                                  <option>Cooking Classes</option>
                                </select>
                              </div>
                              <div>
                                <Label>Description</Label>
                                <Input defaultValue="Découvrez nos expériences les plus appréciées" />
                              </div>
                            </div>
                          </div>

                          {/* Section: Create your custom trip */}
                          <div className="space-y-4 mb-6 p-4 bg-yellow-50 rounded">
                            <h5 className="font-medium">Create your custom trip</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Titre du formulaire</Label>
                                <Input defaultValue="Create your custom trip" />
                              </div>
                              <div>
                                <Label>Description d'introduction</Label>
                                <Input defaultValue="Créez votre voyage sur mesure" />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <Label>Options de destination</Label>
                                <Textarea defaultValue="Krabi, Phi Phi Islands, Phuket, Bangkok" rows={2} />
                              </div>
                              <div>
                                <Label>Types d'activités</Label>
                                <Textarea defaultValue="Adventure, Culture, Relaxation, Food" rows={2} />
                              </div>
                              <div>
                                <Label>Durées proposées</Label>
                                <Textarea defaultValue="3 jours, 5 jours, 7 jours, 10 jours" rows={2} />
                              </div>
                            </div>
                          </div>

                          {/* Section: Some ideas for your next trip */}
                          <div className="space-y-4 mb-6 p-4 bg-purple-50 rounded">
                            <h5 className="font-medium">Some ideas for your next trip</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Titre de la section</Label>
                                <Input defaultValue="Some ideas for your next trip" />
                              </div>
                              <div>
                                <Label>Sous-titre</Label>
                                <Input defaultValue="Inspirations pour vos prochaines aventures" />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <Label>Idées à mettre en avant</Label>
                                <select className="w-full px-3 py-2 border rounded-md">
                                  <option>Sélectionner les suggestions</option>
                                  <option>Romantic Getaways</option>
                                  <option>Adventure Tours</option>
                                  <option>Cultural Immersion</option>
                                </select>
                              </div>
                              <div>
                                <Label>Nombre d'idées visibles</Label>
                                <Input type="number" defaultValue="4" />
                              </div>
                              <div>
                                <Label>Description</Label>
                                <Input defaultValue="Laissez-vous inspirer par nos suggestions" />
                              </div>
                            </div>
                          </div>

                          {/* Section: Why choose us */}
                          <div className="space-y-4 mb-6 p-4 bg-orange-50 rounded">
                            <h5 className="font-medium">Why choose us</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Titre de la section</Label>
                                <Input defaultValue="Why choose us" />
                              </div>
                              <div>
                                <Label>Sous-titre</Label>
                                <Input defaultValue="Pourquoi choisir Amon Tour" />
                              </div>
                            </div>
                            <div>
                              <Label>Contenu principal</Label>
                              <Textarea 
                                defaultValue="Experts locaux, expériences authentiques, service personnalisé, guides expérimentés, prix transparents, support 24/7"
                                rows={3}
                              />
                            </div>
                          </div>

                          {/* Section: Who we are */}
                          <div className="space-y-4 mb-4 p-4 bg-gray-50 rounded">
                            <h5 className="font-medium">Who we are</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Titre de la section</Label>
                                <Input defaultValue="Who we are" />
                              </div>
                              <div>
                                <Label>Sous-titre</Label>
                                <Input defaultValue="Qui nous sommes" />
                              </div>
                            </div>
                            <div>
                              <Label>Notre présentation</Label>
                              <Textarea 
                                defaultValue="Amon Tour est une agence de voyage spécialisée dans la découverte authentique de la Thaïlande. Depuis plus de 10 ans, nous créons des expériences uniques dans le sud de la Thaïlande."
                                rows={3}
                              />
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Pages du menu principal */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-lg">📱 Pages du Menu Principal</h4>
                          
                          {/* Page Experiences */}
                          <div className="border rounded-lg p-4">
                            <h5 className="font-medium mb-3">🌊 Page Expériences</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <Label>Photo d'en-tête</Label>
                                <Button variant="outline" className="w-full">
                                  <Upload className="h-4 w-4 mr-2" />
                                  Choisir une image
                                </Button>
                              </div>
                              <div>
                                <Label>Titre principal</Label>
                                <Input defaultValue="Nos Expériences" />
                              </div>
                              <div>
                                <Label>Description</Label>
                                <Input defaultValue="Aventures authentiques en Thaïlande" />
                              </div>
                            </div>
                          </div>

                          {/* Page Custom Trip */}
                          <div className="border rounded-lg p-4">
                            <h5 className="font-medium mb-3">🎯 Page Custom Trip</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <Label>Photo d'en-tête</Label>
                                <Button variant="outline" className="w-full">
                                  <Upload className="h-4 w-4 mr-2" />
                                  Choisir une image
                                </Button>
                              </div>
                              <div>
                                <Label>Titre principal</Label>
                                <Input defaultValue="Voyage sur mesure" />
                              </div>
                              <div>
                                <Label>Description</Label>
                                <Input defaultValue="Créez votre voyage personnalisé" />
                              </div>
                            </div>
                          </div>

                          {/* Page Blog */}
                          <div className="border rounded-lg p-4">
                            <h5 className="font-medium mb-3">📝 Page Blog</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <Label>Photo d'en-tête</Label>
                                <Button variant="outline" className="w-full">
                                  <Upload className="h-4 w-4 mr-2" />
                                  Choisir une image
                                </Button>
                              </div>
                              <div>
                                <Label>Titre principal</Label>
                                <Input defaultValue="Blog - Découvertes en Thaïlande" />
                              </div>
                              <div>
                                <Label>Description</Label>
                                <Input defaultValue="Inspiration, conseils et connaissances d'initiés" />
                              </div>
                            </div>
                          </div>

                          {/* Page Contact */}
                          <div className="border rounded-lg p-4">
                            <h5 className="font-medium mb-3">📞 Page Contact</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <Label>Photo d'en-tête</Label>
                                <Button variant="outline" className="w-full">
                                  <Upload className="h-4 w-4 mr-2" />
                                  Choisir une image
                                </Button>
                              </div>
                              <div>
                                <Label>Titre principal</Label>
                                <Input defaultValue="Contactez-nous" />
                              </div>
                              <div>
                                <Label>Description</Label>
                                <Input defaultValue="Prêt à vivre l'aventure thaïlandaise ?" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button onClick={() => toast({ title: "Pages principales sauvegardées" })}>
                            <Save className="h-4 w-4 mr-2" />
                            Sauvegarder les pages principales
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Pages secondaires - Footer */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Pages secondaires - Footer
                        </CardTitle>
                        <p className="text-sm text-gray-600">Pages accessibles depuis le footer du site</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        
                        {/* Our brochure */}
                        <div className="border rounded-lg p-4">
                          <h5 className="font-medium mb-3">📋 Our brochure</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label>Photo d'en-tête</Label>
                              <Button variant="outline" className="w-full">
                                <Upload className="h-4 w-4 mr-2" />
                                Choisir une image
                              </Button>
                            </div>
                            <div>
                              <Label>Titre principal</Label>
                              <Input defaultValue="Notre brochure" />
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Input defaultValue="Découvrez toutes nos offres" />
                            </div>
                          </div>
                        </div>

                        {/* Krabi Celebration */}
                        <div className="border rounded-lg p-4">
                          <h5 className="font-medium mb-3">🎉 Krabi Celebration</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label>Photo d'en-tête</Label>
                              <Button variant="outline" className="w-full">
                                <Upload className="h-4 w-4 mr-2" />
                                Choisir une image
                              </Button>
                            </div>
                            <div>
                              <Label>Titre principal</Label>
                              <Input defaultValue="Krabi Celebration" />
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Input defaultValue="Célébrez vos événements spéciaux" />
                            </div>
                          </div>
                        </div>

                        {/* Fun Garden */}
                        <div className="border rounded-lg p-4">
                          <h5 className="font-medium mb-3">🌺 Fun Garden</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label>Photo d'en-tête</Label>
                              <Button variant="outline" className="w-full">
                                <Upload className="h-4 w-4 mr-2" />
                                Choisir une image
                              </Button>
                            </div>
                            <div>
                              <Label>Titre principal</Label>
                              <Input defaultValue="Fun Garden" />
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Input defaultValue="Jardin tropical et activités familiales" />
                            </div>
                          </div>
                        </div>

                        {/* Villas in Krabi */}
                        <div className="border rounded-lg p-4">
                          <h5 className="font-medium mb-3">🏨 Villas in Krabi</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label>Photo d'en-tête</Label>
                              <Button variant="outline" className="w-full">
                                <Upload className="h-4 w-4 mr-2" />
                                Choisir une image
                              </Button>
                            </div>
                            <div>
                              <Label>Titre principal</Label>
                              <Input defaultValue="Villas in Krabi" />
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Input defaultValue="Hébergements de luxe à Krabi" />
                            </div>
                          </div>
                        </div>

                        {/* Become Partner */}
                        <div className="border rounded-lg p-4">
                          <h5 className="font-medium mb-3">🤝 Become Partner</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label>Photo d'en-tête</Label>
                              <Button variant="outline" className="w-full">
                                <Upload className="h-4 w-4 mr-2" />
                                Choisir une image
                              </Button>
                            </div>
                            <div>
                              <Label>Titre principal</Label>
                              <Input defaultValue="Become Partner" />
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Input defaultValue="Rejoignez notre réseau de partenaires" />
                            </div>
                          </div>
                        </div>

                        {/* Group & Corporate */}
                        <div className="border rounded-lg p-4">
                          <h5 className="font-medium mb-3">👥 Group & Corporate</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label>Photo d'en-tête</Label>
                              <Button variant="outline" className="w-full">
                                <Upload className="h-4 w-4 mr-2" />
                                Choisir une image
                              </Button>
                            </div>
                            <div>
                              <Label>Titre principal</Label>
                              <Input defaultValue="Group & Corporate" />
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Input defaultValue="Voyages de groupe et événements d'entreprise" />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button onClick={() => toast({ title: "Pages secondaires sauvegardées" })}>
                            <Save className="h-4 w-4 mr-2" />
                            Sauvegarder les pages secondaires
                          </Button>
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
                      <CardContent className="space-y-6">
                        
                        {/* Legal Notice */}
                        <Card className="border-2">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                              ⚖️ Legal Notice
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Titre de la page</Label>
                                <Input defaultValue="Legal Notice" />
                              </div>
                              <div>
                                <Label>Sous-titre</Label>
                                <Input defaultValue="Mentions légales et informations juridiques" />
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-base font-medium">Contenu de la page</Label>
                              <div className="mt-2 border rounded-lg">
                                {/* Barre d'outils d'édition améliorée */}
                                <div className="flex items-center gap-2 p-3 border-b bg-gray-50 flex-wrap">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      document.execCommand('bold', false);
                                    }}
                                  >
                                    <Bold className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      document.execCommand('italic', false);
                                    }}
                                  >
                                    <Italic className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      document.execCommand('underline', false);
                                    }}
                                  >
                                    U
                                  </Button>
                                  <div className="h-6 w-px bg-gray-300 mx-1"></div>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      document.execCommand('justifyLeft', false);
                                    }}
                                  >
                                    ←
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      document.execCommand('justifyCenter', false);
                                    }}
                                  >
                                    ═
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      document.execCommand('justifyRight', false);
                                    }}
                                  >
                                    →
                                  </Button>
                                  <div className="h-6 w-px bg-gray-300 mx-1"></div>
                                  <select 
                                    className="px-2 py-1 border rounded text-sm"
                                    onChange={(e) => {
                                      document.execCommand('formatBlock', false, e.target.value);
                                    }}
                                  >
                                    <option value="p">Paragraphe</option>
                                    <option value="h1">Titre 1</option>
                                    <option value="h2">Titre 2</option>
                                    <option value="h3">Titre 3</option>
                                  </select>
                                  <select 
                                    className="px-2 py-1 border rounded text-sm"
                                    onChange={(e) => {
                                      document.execCommand('fontSize', false, e.target.value);
                                    }}
                                  >
                                    <option value="3">12px</option>
                                    <option value="4" selected>14px</option>
                                    <option value="5">16px</option>
                                    <option value="6">18px</option>
                                    <option value="7">24px</option>
                                  </select>
                                  <Input 
                                    type="color" 
                                    defaultValue="#000000" 
                                    className="w-12 h-8 p-1" 
                                    onChange={(e) => {
                                      document.execCommand('foreColor', false, e.target.value);
                                    }}
                                  />
                                </div>
                                
                                {/* Zone d'édition */}
                                <div 
                                  contentEditable
                                  suppressContentEditableWarning={true}
                                  className="p-4 min-h-[300px] outline-none focus:ring-2 focus:ring-blue-500"
                                  style={{ lineHeight: '1.6' }}
                                  dangerouslySetInnerHTML={{
                                    __html: `
                                      <h2><strong>Publisher</strong></h2>
                                      <p>The website amon-tour.com is produced by <strong>Flame BB Co., Ltd.</strong>, with a capital of 4,000,000 Thai Baht, registered with the Thai Ministry of Commerce (DBD) in Krabi under the number <strong>0815558001588</strong>, with its headquarters located at <strong>242 Moo1 – Na Thai – Ao Nang – 81000 Krabi – Thailand</strong>. The company holds a tourism license issued by the Thai Minister of Tourism (TAT) under the number <strong>34/01995</strong>.</p>
                                      <p><strong>Publication Director:</strong> Eric Mosnier-Thoumas in his capacity as Chief Executive Officer and website administrator.</p>
                                      
                                      <h3><strong>Disclaimer</strong></h3>
                                      <p>Flame BB strives to ensure, to the best of its ability, the accuracy and updating of information distributed on this site, for which it reserves the right to correct, at any time and without notice, the content. However, Flame BB cannot guarantee the accuracy, precision or completeness of the information made available on this site.</p>
                                      <p>Consequently, Flame BB disclaims all responsibility:</p>
                                      <ul>
                                        <li>for any interruption of the site</li>
                                        <li>for the occurrence of bugs</li>
                                        <li>for any inaccuracy or omission concerning information available on the site</li>
                                        <li>for any damage resulting from a fraudulent intrusion by a third party</li>
                                      </ul>
                                      
                                      <h3><strong>Protection of Personal Data</strong></h3>
                                      <p>Flame BB is committed to preserving the confidentiality of information that may be provided online by the internet user.</p>
                                      
                                      <h3><strong>Contact Information</strong></h3>
                                      <p><strong>Flame BB</strong><br>
                                      242/1 Moo1 – Na Thai – Ao Nang<br>
                                      81000 Krabi – Thailand<br>
                                      Email: info@amon-tour.com</p>
                                    `
                                  }}
                                />
                              </div>
                            </div>
                            
                            <div className="flex justify-end">
                              <Button onClick={() => toast({ title: "Legal Notice sauvegardé" })}>
                                <Save className="h-4 w-4 mr-2" />
                                Sauvegarder Legal Notice
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Privacy Policy */}
                        <Card className="border-2">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                              🔒 Privacy Policy
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Titre de la page</Label>
                                <Input defaultValue="Privacy Policy" />
                              </div>
                              <div>
                                <Label>Sous-titre</Label>
                                <Input defaultValue="Protection et gestion de vos données personnelles" />
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-base font-medium">Contenu de la page</Label>
                              <div className="mt-2 border rounded-lg">
                                {/* Barre d'outils d'édition améliorée */}
                                <div className="flex items-center gap-2 p-3 border-b bg-gray-50 flex-wrap">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      document.execCommand('bold', false);
                                    }}
                                  >
                                    <Bold className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      document.execCommand('italic', false);
                                    }}
                                  >
                                    <Italic className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      document.execCommand('underline', false);
                                    }}
                                  >
                                    U
                                  </Button>
                                  <div className="h-6 w-px bg-gray-300 mx-1"></div>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      document.execCommand('justifyLeft', false);
                                    }}
                                  >
                                    ←
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      document.execCommand('justifyCenter', false);
                                    }}
                                  >
                                    ═
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      document.execCommand('justifyRight', false);
                                    }}
                                  >
                                    →
                                  </Button>
                                  <div className="h-6 w-px bg-gray-300 mx-1"></div>
                                  <select 
                                    className="px-2 py-1 border rounded text-sm"
                                    onChange={(e) => {
                                      document.execCommand('formatBlock', false, e.target.value);
                                    }}
                                  >
                                    <option value="p">Paragraphe</option>
                                    <option value="h1">Titre 1</option>
                                    <option value="h2">Titre 2</option>
                                    <option value="h3">Titre 3</option>
                                  </select>
                                  <select 
                                    className="px-2 py-1 border rounded text-sm"
                                    onChange={(e) => {
                                      document.execCommand('fontSize', false, e.target.value);
                                    }}
                                  >
                                    <option value="3">12px</option>
                                    <option value="4" selected>14px</option>
                                    <option value="5">16px</option>
                                    <option value="6">18px</option>
                                    <option value="7">24px</option>
                                  </select>
                                  <Input 
                                    type="color" 
                                    defaultValue="#000000" 
                                    className="w-12 h-8 p-1" 
                                    onChange={(e) => {
                                      document.execCommand('foreColor', false, e.target.value);
                                    }}
                                  />
                                </div>
                                
                                {/* Zone d'édition */}
                                <div 
                                  contentEditable
                                  suppressContentEditableWarning={true}
                                  className="p-4 min-h-[300px] outline-none focus:ring-2 focus:ring-blue-500"
                                  style={{ lineHeight: '1.6' }}
                                  dangerouslySetInnerHTML={{
                                    __html: `
                                      <h2><strong>Data Protection</strong></h2>
                                      <p><strong>Flame BB Co., Ltd.</strong> is committed to preserving the confidentiality of information that may be provided online by our website visitors and customers. This privacy policy explains how we collect, use, and protect your personal information.</p>
                                      
                                      <h3><strong>Information Collection</strong></h3>
                                      <p>We may collect personal information such as:</p>
                                      <ul>
                                        <li>Name and contact details</li>
                                        <li>Email address</li>
                                        <li>Phone number</li>
                                        <li>Travel preferences</li>
                                        <li>Booking information</li>
                                        <li>Payment details</li>
                                      </ul>
                                      
                                      <h3><strong>Use of Information</strong></h3>
                                      <p>The information we collect is used for:</p>
                                      <ul>
                                        <li>Processing your tour bookings and requests</li>
                                        <li>Communicating with you about your travel arrangements</li>
                                        <li>Providing customer support</li>
                                        <li>Sending you promotional offers and newsletters (if you have opted in)</li>
                                        <li>Improving our website and services</li>
                                        <li>Complying with legal requirements</li>
                                      </ul>
                                      
                                      <h3><strong>Your Rights</strong></h3>
                                      <p>Under applicable data protection laws, you have rights regarding your personal data, including:</p>
                                      <ul>
                                        <li>The right to access your personal information</li>
                                        <li>The right to correct inaccurate information</li>
                                        <li>The right to request deletion of your information</li>
                                        <li>The right to restrict or object to processing</li>
                                        <li>The right to data portability</li>
                                      </ul>
                                      
                                      <h3><strong>Contact Information</strong></h3>
                                      <p><strong>Flame BB Co., Ltd.</strong><br>
                                      242/1 Moo1 – Na Thai – Ao Nang<br>
                                      81000 Krabi – Thailand<br>
                                      Email: info@amon-tour.com</p>
                                    `
                                  }}
                                />
                              </div>
                            </div>
                            
                            <div className="flex justify-end">
                              <Button onClick={() => toast({ title: "Privacy Policy sauvegardé" })}>
                                <Save className="h-4 w-4 mr-2" />
                                Sauvegarder Privacy Policy
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Terms & Conditions */}
                        <Card className="border-2">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                              📜 Terms & Conditions
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Titre de la page</Label>
                                <Input defaultValue="Terms & Conditions" />
                              </div>
                              <div>
                                <Label>Sous-titre</Label>
                                <Input defaultValue="Conditions générales d'utilisation et de vente" />
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-base font-medium">Contenu de la page</Label>
                              <div className="mt-2 border rounded-lg">
                                {/* Barre d'outils d'édition améliorée */}
                                <div className="flex items-center gap-2 p-3 border-b bg-gray-50 flex-wrap">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      document.execCommand('bold', false);
                                    }}
                                  >
                                    <Bold className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      document.execCommand('italic', false);
                                    }}
                                  >
                                    <Italic className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      document.execCommand('underline', false);
                                    }}
                                  >
                                    U
                                  </Button>
                                  <div className="h-6 w-px bg-gray-300 mx-1"></div>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      document.execCommand('justifyLeft', false);
                                    }}
                                  >
                                    ←
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      document.execCommand('justifyCenter', false);
                                    }}
                                  >
                                    ═
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      document.execCommand('justifyRight', false);
                                    }}
                                  >
                                    →
                                  </Button>
                                  <div className="h-6 w-px bg-gray-300 mx-1"></div>
                                  <select 
                                    className="px-2 py-1 border rounded text-sm"
                                    onChange={(e) => {
                                      document.execCommand('formatBlock', false, e.target.value);
                                    }}
                                  >
                                    <option value="p">Paragraphe</option>
                                    <option value="h1">Titre 1</option>
                                    <option value="h2">Titre 2</option>
                                    <option value="h3">Titre 3</option>
                                  </select>
                                  <select 
                                    className="px-2 py-1 border rounded text-sm"
                                    onChange={(e) => {
                                      document.execCommand('fontSize', false, e.target.value);
                                    }}
                                  >
                                    <option value="3">12px</option>
                                    <option value="4" selected>14px</option>
                                    <option value="5">16px</option>
                                    <option value="6">18px</option>
                                    <option value="7">24px</option>
                                  </select>
                                  <Input 
                                    type="color" 
                                    defaultValue="#000000" 
                                    className="w-12 h-8 p-1" 
                                    onChange={(e) => {
                                      document.execCommand('foreColor', false, e.target.value);
                                    }}
                                  />
                                </div>
                                
                                {/* Zone d'édition */}
                                <div 
                                  contentEditable
                                  suppressContentEditableWarning={true}
                                  className="p-4 min-h-[300px] outline-none focus:ring-2 focus:ring-blue-500"
                                  style={{ lineHeight: '1.6' }}
                                  dangerouslySetInnerHTML={{
                                    __html: `
                                      <h2><strong>1. General Terms</strong></h2>
                                      <p>These Terms and Conditions govern your use of the Amon Tour website and services provided by <strong>Flame BB Co., Ltd.</strong>, a company registered in Thailand with TAT license number <strong>34/01995</strong>.</p>
                                      <p>By accessing our website or using our services, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, please do not use our website or services.</p>
                                      
                                      <h3><strong>2. Booking and Reservation</strong></h3>
                                      <p>2.1 All bookings are subject to availability and confirmation.</p>
                                      <p>2.2 A booking is confirmed once we have received the required deposit or full payment, and you have received a confirmation email from us.</p>
                                      <p>2.3 The person making the booking accepts these Terms and Conditions on behalf of all members of the party and is responsible for all payments due.</p>
                                      
                                      <h3><strong>3. Payment</strong></h3>
                                      <p>3.1 To secure a booking, a deposit of 30% of the total tour price is required, unless otherwise specified.</p>
                                      <p>3.2 Full payment must be received at least 7 days before the tour date, unless otherwise agreed.</p>
                                      <p>3.3 All prices are quoted in Thai Baht (THB) unless otherwise specified.</p>
                                      
                                      <h3><strong>4. Cancellation and Refund Policy</strong></h3>
                                      <p>4.1 Cancellation by Customer:</p>
                                      <ul>
                                        <li>More than 30 days before the tour date: Full refund minus administrative fees</li>
                                        <li>15-30 days before the tour date: 70% refund</li>
                                        <li>7-14 days before the tour date: 50% refund</li>
                                        <li>Less than 7 days before the tour date: No refund</li>
                                      </ul>
                                      
                                      <h3><strong>5. Contact Information</strong></h3>
                                      <p><strong>Flame BB Co., Ltd.</strong><br>
                                      242/1 Moo1 – Na Thai – Ao Nang<br>
                                      81000 Krabi – Thailand<br>
                                      Email: info@amon-tour.com</p>
                                    `
                                  }}
                                />
                              </div>
                            </div>
                            
                            <div className="flex justify-end">
                              <Button onClick={() => toast({ title: "Terms & Conditions sauvegardé" })}>
                                <Save className="h-4 w-4 mr-2" />
                                Sauvegarder Terms & Conditions
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        <div className="flex justify-end mt-6">
                          <Button onClick={() => toast({ title: "Toutes les pages légales sauvegardées" })}>
                            <Save className="h-4 w-4 mr-2" />
                            Sauvegarder toutes les pages légales
                          </Button>
                        </div>
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