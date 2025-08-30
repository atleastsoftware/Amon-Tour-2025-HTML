import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Edit, Plus, Trash2, Move, Eye, Settings, Palette, Layout, Image, Type, FileText, MapPin, Mail, Users, Download, Star, Camera, ArrowLeft, Search, Video } from 'lucide-react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';

interface PageConfiguration {
  id: number;
  pageName: string;
  pageSlug: string;
  pageType: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PageBlock {
  id: number;
  pageId: number;
  blockType: string;
  blockOrder: number;
  identifier: string;
  title?: string;
  subtitle?: string;
  description?: string;
  content?: string;
  imageUrl?: string;
  imageAlt?: string;
  ctaText?: string;
  ctaUrl?: string;
  ctaStyle?: string;
  iconName?: string;
  backgroundColor?: string;
  configuration: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface BlockTemplate {
  id: number;
  templateName: string;
  blockType: string;
  defaultConfiguration: Record<string, any>;
  previewImage?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
}

export default function AdminAppearance() {
  const [, setLocation] = useLocation();
  const [selectedPage, setSelectedPage] = useState<string>('home');
  const [selectedBlock, setSelectedBlock] = useState<PageBlock | null>(null);
  const [isEditingBlock, setIsEditingBlock] = useState(false);
  const [newBlockType, setNewBlockType] = useState<string>('');

  const queryClient = useQueryClient();

  // Fetch page configurations
  const { data: pageConfigs = [], isLoading: loadingPages, error: pageConfigError } = useQuery({
    queryKey: ['/api/admin/page-configurations'],
    queryFn: () => fetch('/api/admin/page-configurations').then(res => {
      if (!res.ok) throw new Error('Authentication required');
      return res.json();
    }) as Promise<PageConfiguration[]>,
    retry: false
  });

  // Fetch blocks for selected page
  const { data: pageBlocks = [], isLoading: loadingBlocks, error: pageBlocksError } = useQuery({
    queryKey: ['/api/admin/page-blocks', selectedPage],
    queryFn: () => fetch(`/api/admin/page-blocks/${selectedPage}`).then(res => {
      if (!res.ok) throw new Error('Authentication required');
      return res.json();
    }) as Promise<PageBlock[]>,
    enabled: !!selectedPage,
    retry: false
  });

  // Fetch block templates
  const { data: blockTemplates = [], error: templatesError } = useQuery({
    queryKey: ['/api/admin/block-templates'],
    queryFn: () => fetch('/api/admin/block-templates').then(res => {
      if (!res.ok) throw new Error('Authentication required');
      return res.json();
    }) as Promise<BlockTemplate[]>,
    retry: false
  });

  // Update block mutation
  const updateBlockMutation = useMutation({
    mutationFn: (data: { id: number; updates: Partial<PageBlock> }) =>
      fetch(`/api/admin/page-blocks/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.updates)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-blocks', selectedPage] });
      toast({ title: 'Block updated successfully' });
      setIsEditingBlock(false);
      setSelectedBlock(null);
    },
    onError: (error) => {
      toast({ title: 'Error updating block', variant: 'destructive' });
      console.error('Update block error:', error);
    }
  });

  // Create block mutation
  const createBlockMutation = useMutation({
    mutationFn: (blockData: any) =>
      fetch('/api/admin/page-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blockData)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-blocks', selectedPage] });
      toast({ title: 'Block created successfully' });
      setNewBlockType('');
    },
    onError: (error) => {
      toast({ title: 'Error creating block', variant: 'destructive' });
      console.error('Create block error:', error);
    }
  });

  // Delete block mutation
  const deleteBlockMutation = useMutation({
    mutationFn: (blockId: number) =>
      fetch(`/api/admin/page-blocks/${blockId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-blocks', selectedPage] });
      toast({ title: 'Block deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting block', variant: 'destructive' });
      console.error('Delete block error:', error);
    }
  });

  const getBlockIcon = (blockType: string) => {
    switch (blockType) {
      case 'hero': return <Layout className="w-4 h-4" />;
      case 'text_image': return <Type className="w-4 h-4" />;
      case 'advantages': return <Star className="w-4 h-4" />;
      case 'card_grid': return <MapPin className="w-4 h-4" />;
      case 'form': return <FileText className="w-4 h-4" />;
      case 'pdf_download': return <Download className="w-4 h-4" />;
      case 'search_module': return <Search className="w-4 h-4" />;
      case 'gallery': return <Camera className="w-4 h-4" />;
      case 'contact_info': return <Mail className="w-4 h-4" />;
      case 'interests': return <Users className="w-4 h-4" />;
      case 'video_hero': return <Video className="w-4 h-4" />;
      default: return <Layout className="w-4 h-4" />;
    }
  };

  const handleBlockEdit = (block: PageBlock) => {
    setSelectedBlock(block);
    setIsEditingBlock(true);
  };

  const handleBlockSave = (updates: any) => {
    if (selectedBlock) {
      updateBlockMutation.mutate({
        id: selectedBlock.id,
        updates: { ...updates, updatedAt: new Date() }
      });
    }
  };

  const handleCreateBlock = (blockType: string) => {
    if (!Array.isArray(pageConfigs)) {
      toast({ title: 'Please log in to manage page content', variant: 'destructive' });
      return;
    }
    
    const selectedPageConfig = pageConfigs.find(p => p.pageSlug === selectedPage);
    if (!selectedPageConfig) {
      toast({ title: 'Page configuration not found', variant: 'destructive' });
      return;
    }

    const newOrder = Array.isArray(pageBlocks) && pageBlocks.length > 0 
      ? Math.max(...pageBlocks.map(b => b.blockOrder)) + 1 
      : 1;
    const identifier = `${blockType}_${Date.now()}`;
    
    const defaultData = getDefaultContentForBlockType(blockType);
    
    createBlockMutation.mutate({
      pageId: selectedPageConfig.id,
      blockType,
      blockOrder: newOrder,
      identifier,
      title: defaultData.title,
      subtitle: defaultData.subtitle,
      description: defaultData.description,
      content: defaultData.content,
      imageUrl: defaultData.imageUrl,
      imageAlt: defaultData.imageAlt,
      ctaText: defaultData.ctaText,
      ctaUrl: defaultData.ctaUrl,
      ctaStyle: defaultData.ctaStyle || 'primary',
      iconName: defaultData.iconName,
      backgroundColor: defaultData.backgroundColor || 'white',
      configuration: defaultData.configuration || {},
      isActive: true
    });
  };

  const getDefaultContentForBlockType = (blockType: string) => {
    switch (blockType) {
      case 'hero':
        return {
          title: 'Welcome to Thailand',
          subtitle: 'Discover authentic experiences with Amon Tour',
          ctaText: 'Explore Tours',
          ctaUrl: '/experiences',
          imageUrl: '/attached_assets/krabi-hero.jpg',
          iconName: 'map-pin',
          backgroundColor: 'white',
          configuration: { hasButton: true }
        };
      case 'text_image':
        return {
          title: 'About Our Tours',
          content: 'Experience the best of Thailand with our carefully curated tours and adventures.',
          iconName: 'compass',
          configuration: { alignment: 'left', imagePosition: 'right' }
        };
      case 'advantages':
        return {
          title: 'Why Choose Amon Tour',
          subtitle: 'Authentic local experiences',
          configuration: {
            advantages: [
              { title: 'Local Expertise', description: 'Born and raised in Krabi', iconName: 'compass' },
              { title: 'Authentic Experiences', description: 'Real Thailand, not tourist traps', iconName: 'heart' },
              { title: 'Small Groups', description: 'Personalized attention', iconName: 'users' }
            ]
          }
        };
      case 'card_grid':
        return {
          title: 'Featured Tours',
          subtitle: 'Discover our most popular experiences',
          configuration: { 
            displayCount: 6, 
            showFilters: true, 
            gridType: 'tours',
            columns: 3
          }
        };
      case 'gallery':
        return {
          title: 'Tour Gallery',
          configuration: {
            images: [
              { url: '/attached_assets/krabi-hero.jpg', alt: 'Krabi scenery', caption: 'Beautiful Krabi' }
            ],
            columns: 3,
            spacing: 'medium'
          }
        };
      case 'form':
        return {
          title: 'Get in Touch',
          description: 'Contact us for your dream Thailand adventure',
          configuration: {
            formType: 'contact',
            fields: ['name', 'email', 'message'],
            submitText: 'Send Message'
          }
        };
      case 'pdf_download':
        return {
          title: 'Download Our Brochure',
          description: 'Get detailed information about all our tours',
          ctaText: 'Download PDF',
          iconName: 'download',
          configuration: { 
            pdfUrl: '/attached_assets/brochure-amon-tour.pdf',
            fileSize: '2MB'
          }
        };
      case 'search_module':
        return {
          title: 'Find Your Perfect Tour',
          subtitle: 'Search through our experiences',
          configuration: {
            searchFields: ['destination', 'duration', 'price'],
            placeholder: 'Search tours...'
          }
        };
      case 'contact_info':
        return {
          title: 'Contact Information',
          configuration: {
            address: '242/1 Moo1 – Na Thai – Ao Nang, 81000 Krabi – Thailand',
            phone: '+66 (0) 75 695 678',
            email: 'info@amon-tour.com',
            hours: 'Mon-Sun: 8AM-7PM (Thai time)'
          }
        };
      case 'interests':
        return {
          title: 'What Interests You?',
          subtitle: 'Choose your adventure style',
          configuration: {
            interests: [
              { name: 'Island Hopping', iconName: 'ship' },
              { name: 'Cultural Tours', iconName: 'landmark' },
              { name: 'Adventure Sports', iconName: 'mountain' },
              { name: 'Food & Cooking', iconName: 'chef-hat' }
            ]
          }
        };
      case 'video_hero':
        return {
          title: 'Experience Thailand',
          subtitle: 'Watch our adventures come to life',
          ctaText: 'Start Your Journey',
          ctaUrl: '/custom-tour',
          configuration: {
            videoUrl: '/attached_assets/hero-video.mp4',
            autoplay: true,
            muted: true,
            loop: true
          }
        };
      default:
        return {
          title: 'New Block',
          configuration: {}
        };
    }
  };

  const currentPageConfig = Array.isArray(pageConfigs) 
    ? pageConfigs.find(p => p.pageSlug === selectedPage)
    : null;
  const availablePages = [
    { slug: 'home', name: 'Home Page', type: 'main' },
    { slug: 'experiences', name: 'Experiences', type: 'main' },
    { slug: 'custom-tour', name: 'Custom Tour', type: 'main' },
    { slug: 'blog', name: 'Blog', type: 'main' },
    { slug: 'contact', name: 'Contact', type: 'main' },
    { slug: 'stays', name: 'Stays', type: 'secondary' },
    { slug: 'external-stays', name: 'External Stays', type: 'secondary' },
    { slug: 'tours', name: 'All Tours', type: 'secondary' },
    { slug: 'privacy-policy', name: 'Privacy Policy', type: 'secondary' },
    { slug: 'terms-conditions', name: 'Terms & Conditions', type: 'secondary' }
  ];

  if (loadingPages) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="container mx-auto px-4 text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page configurations...</p>
        </div>
      </div>
    );
  }

  // Show authentication error if needed
  if (pageConfigError || !Array.isArray(pageConfigs)) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Authentication Required
              </CardTitle>
              <CardDescription>
                Please log in to the admin dashboard to access the site appearance manager.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setLocation('/admin-login')} className="w-full">
                Go to Admin Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
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
                Back to Admin
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Palette className="h-8 w-8 text-blue-600" />
                  Site Appearance Manager
                </h1>
                <p className="text-gray-600 mt-2">
                  Customize your website pages using modular content blocks. 
                  Each page is built from reusable blocks that you can edit, reorder, and customize.
                </p>
              </div>
            </div>
          </div>

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Page Selector Sidebar */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Select Page
                </CardTitle>
                <CardDescription>Choose which page to customize</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {availablePages.map((page) => (
                    <Button
                      key={page.slug}
                      variant={selectedPage === page.slug ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => setSelectedPage(page.slug)}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{page.name}</span>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {page.type}
                        </Badge>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Page Builder Main Area */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="blocks" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="blocks" className="flex items-center gap-2">
                    <Layout className="w-4 h-4" />
                    Content Blocks
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Page Settings
                  </TabsTrigger>
                  <TabsTrigger value="templates" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Block Templates
                  </TabsTrigger>
                </TabsList>

                {/* Content Blocks Tab */}
                <TabsContent value="blocks" className="space-y-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Content Blocks for {currentPageConfig?.pageName || selectedPage}</CardTitle>
                        <CardDescription>
                          Manage the content blocks that make up this page. You can reorder, edit, and customize each block.
                        </CardDescription>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Block
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Content Block</DialogTitle>
                            <DialogDescription>
                              Choose a block type to add to this page
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Label htmlFor="blockType">Block Type</Label>
                            <Select value={newBlockType} onValueChange={setNewBlockType}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select block type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hero">Hero/Header Section</SelectItem>
                                <SelectItem value="text_image">Text & Image</SelectItem>
                                <SelectItem value="advantages">Advantages Grid</SelectItem>
                                <SelectItem value="card_grid">Card Grid</SelectItem>
                                <SelectItem value="form">Form Section</SelectItem>
                                <SelectItem value="pdf_download">PDF Download</SelectItem>
                                <SelectItem value="search_module">Search Module</SelectItem>
                                <SelectItem value="gallery">Image Gallery</SelectItem>
                                <SelectItem value="contact_info">Contact Information</SelectItem>
                                <SelectItem value="interests">Interests Section</SelectItem>
                                <SelectItem value="video_hero">Video Hero</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button 
                              onClick={() => newBlockType && handleCreateBlock(newBlockType)}
                              disabled={!newBlockType || createBlockMutation.isPending}
                              className="w-full"
                            >
                              {createBlockMutation.isPending ? 'Creating...' : 'Create Block'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardHeader>
                    <CardContent>
                      {loadingBlocks ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <span className="ml-3 text-gray-600">Loading blocks...</span>
                        </div>
                      ) : pageBlocks.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <Layout className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <h3 className="text-lg font-medium mb-2">No blocks found</h3>
                          <p className="mb-4">This page doesn't have any content blocks yet. Add your first block to get started.</p>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Add First Block
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Your First Content Block</DialogTitle>
                                <DialogDescription>
                                  Start building this page by adding a content block
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Label htmlFor="firstBlockType">Block Type</Label>
                                <Select value={newBlockType} onValueChange={setNewBlockType}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select block type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="hero">Hero/Header Section</SelectItem>
                                    <SelectItem value="text_image">Text & Image</SelectItem>
                                    <SelectItem value="card_grid">Card Grid</SelectItem>
                                    <SelectItem value="form">Form Section</SelectItem>
                                    <SelectItem value="gallery">Image Gallery</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button 
                                  onClick={() => newBlockType && handleCreateBlock(newBlockType)}
                                  disabled={!newBlockType || createBlockMutation.isPending}
                                  className="w-full"
                                >
                                  {createBlockMutation.isPending ? 'Creating...' : 'Create Block'}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {Array.isArray(pageBlocks) ? pageBlocks.map((block, index) => (
                            <motion.div 
                              key={block.id} 
                              className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-blue-50 rounded-lg">
                                    {getBlockIcon(block.blockType)}
                                  </div>
                                  <div>
                                    <h4 className="font-medium capitalize">
                                      {block.blockType.replace('_', ' ')} Block
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                      Order: {block.blockOrder} • 
                                      {block.title ? ` "${block.title}"` : ' No title'}
                                    </p>
                                  </div>
                                  <Badge variant={block.isActive ? 'default' : 'secondary'}>
                                    {block.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button size="sm" variant="ghost" onClick={() => handleBlockEdit(block)}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="cursor-move">
                                    <Move className="w-4 h-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Content Block</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this {block.blockType} block? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction 
                                          onClick={() => deleteBlockMutation.mutate(block.id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                              
                              {/* Block Preview */}
                              <div className="bg-gray-50 p-4 rounded border">
                                <BlockPreview block={block} />
                              </div>
                            </motion.div>
                          )) : null}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Page Settings Tab */}
                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>Page Settings</CardTitle>
                      <CardDescription>
                        Configure SEO and general settings for {currentPageConfig?.pageName || selectedPage}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {currentPageConfig ? (
                        <PageSettingsForm config={currentPageConfig} />
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <h3 className="text-lg font-medium mb-2">No Configuration Found</h3>
                          <p className="mb-4">This page doesn't have a configuration yet. It will be created automatically when you add content blocks.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Block Templates Tab */}
                <TabsContent value="templates">
                  <Card>
                    <CardHeader>
                      <CardTitle>Block Templates</CardTitle>
                      <CardDescription>
                        Pre-configured block templates for quick content creation
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {blockTemplates.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <h3 className="text-lg font-medium mb-2">No Templates Available</h3>
                          <p>Block templates will appear here when created.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {blockTemplates.map((template) => (
                            <motion.div 
                              key={template.id} 
                              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                              whileHover={{ scale: 1.02 }}
                            >
                              <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 bg-blue-50 rounded">
                                  {getBlockIcon(template.blockType)}
                                </div>
                                <div>
                                  <h4 className="font-medium">{template.templateName}</h4>
                                  <p className="text-sm text-gray-500 capitalize">
                                    {template.blockType.replace('-', ' ')} template
                                  </p>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="w-full"
                                onClick={() => handleCreateBlock(template.blockType)}
                                disabled={createBlockMutation.isPending}
                              >
                                Use Template
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Block Editor Dialog */}
          <Dialog open={isEditingBlock} onOpenChange={setIsEditingBlock}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedBlock && getBlockIcon(selectedBlock.blockType)}
                  Edit {selectedBlock?.blockType.replace('-', ' ')} Block
                </DialogTitle>
                <DialogDescription>
                  Customize the content and appearance of this block
                </DialogDescription>
              </DialogHeader>
              {selectedBlock && (
                <BlockEditor 
                  block={selectedBlock} 
                  onSave={handleBlockSave}
                  onCancel={() => setIsEditingBlock(false)}
                />
              )}
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </div>
  );
}

// Block Preview Component
function BlockPreview({ block }: { block: PageBlock }) {
  
  switch (block.blockType) {
    case 'hero':
      return (
        <div className="text-center space-y-3">
          <h3 className="font-bold text-lg">{block.title || 'Hero Title'}</h3>
          <p className="text-gray-600">{block.subtitle || 'Hero subtitle'}</p>
          {block.configuration?.hasButton && block.ctaText && (
            <Button size="sm" className="mt-2">{block.ctaText}</Button>
          )}
          {block.imageUrl && (
            <p className="text-xs text-blue-600">Background: {block.imageUrl.split('/').pop()}</p>
          )}
          {block.iconName && (
            <Badge variant="outline" className="text-xs">Icon: {block.iconName}</Badge>
          )}
        </div>
      );
      
    case 'text_image':
      return (
        <div className={`text-${block.configuration?.alignment || 'left'}`}>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            {block.iconName && <Type className="w-4 h-4" />}
            {block.title || 'Text Title'}
          </h4>
          <p className="text-sm text-gray-600 line-clamp-3">
            {block.content || 'Text content preview...'}
          </p>
          {block.imageUrl && (
            <div className="mt-2 bg-gray-200 rounded h-16 flex items-center justify-center">
              <Image className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>
      );

    case 'advantages':
      return (
        <div>
          <h4 className="font-medium mb-2">{block.title || 'Advantages'}</h4>
          <p className="text-sm text-gray-600 mb-3">{block.subtitle || 'Our key advantages'}</p>
          <div className="grid grid-cols-3 gap-2">
            {(block.configuration?.advantages || []).slice(0, 3).map((advantage: any, i: number) => (
              <div key={i} className="text-center p-2 bg-gray-50 rounded">
                <Star className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
                <p className="text-xs font-medium">{advantage.title}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {block.configuration?.advantages?.length || 0} advantages
          </p>
        </div>
      );
      
    case 'card_grid':
      return (
        <div>
          <h4 className="font-medium mb-2">{block.title || 'Card Grid'}</h4>
          <p className="text-sm text-gray-600 mb-3">{block.subtitle || 'Grid subtitle'}</p>
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded aspect-video flex items-center justify-center">
                <MapPin className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {block.configuration?.gridType || 'Generic'} grid • 
            {block.configuration?.displayCount || 6} items
          </p>
        </div>
      );
      
    case 'gallery':
      return (
        <div>
          <h4 className="font-medium mb-2">{block.title || 'Gallery'}</h4>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded aspect-square flex items-center justify-center">
                <Camera className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {block.configuration?.images?.length || 0} images • {block.configuration?.columns || 3} columns
          </p>
        </div>
      );
      
    case 'form':
      return (
        <div>
          <h4 className="font-medium mb-2">{block.title || 'Form Title'}</h4>
          <p className="text-sm text-gray-600 mb-2">{block.description || 'Form description'}</p>
          <div className="space-y-2">
            <div className="bg-gray-100 h-8 rounded"></div>
            <div className="bg-gray-100 h-8 rounded"></div>
            <div className="bg-gray-100 h-16 rounded"></div>
          </div>
          <p className="text-xs text-gray-500 mt-2 capitalize">
            {block.configuration?.formType || 'contact'} form
          </p>
        </div>
      );
      
    case 'pdf_download':
      return (
        <div className="text-center">
          <Download className="w-8 h-8 mx-auto mb-2 text-blue-600" />
          <h4 className="font-medium mb-1">{block.title || 'Download'}</h4>
          <p className="text-sm text-gray-600 mb-2">{block.description || 'Download description'}</p>
          <Button size="sm" variant="outline">{block.ctaText || 'Download PDF'}</Button>
          {block.configuration?.pdfUrl && (
            <p className="text-xs text-blue-600 mt-1">
              File: {block.configuration.pdfUrl.split('/').pop()}
            </p>
          )}
        </div>
      );

    case 'search_module':
      return (
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Search className="w-4 h-4" />
            {block.title || 'Search Module'}
          </h4>
          <p className="text-sm text-gray-600 mb-2">{block.subtitle || 'Search subtitle'}</p>
          <div className="bg-gray-100 h-10 rounded flex items-center px-3">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-400">
              {block.configuration?.placeholder || 'Search...'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Fields: {block.configuration?.searchFields?.join(', ') || 'none'}
          </p>
        </div>
      );
      
    case 'contact_info':
      return (
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            {block.title || 'Contact Information'}
          </h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p>{block.configuration?.address || 'Address information'}</p>
            <p>{block.configuration?.phone || 'Phone number'}</p>
            <p>{block.configuration?.email || 'Email address'}</p>
            <p>{block.configuration?.hours || 'Business hours'}</p>
          </div>
        </div>
      );

    case 'interests':
      return (
        <div>
          <h4 className="font-medium mb-2">{block.title || 'Interests'}</h4>
          <p className="text-sm text-gray-600 mb-3">{block.subtitle || 'Choose your interests'}</p>
          <div className="grid grid-cols-2 gap-2">
            {(block.configuration?.interests || []).slice(0, 4).map((interest: any, i: number) => (
              <div key={i} className="text-center p-2 bg-gray-50 rounded">
                <Users className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                <p className="text-xs font-medium">{interest.name}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {block.configuration?.interests?.length || 0} interests
          </p>
        </div>
      );

    case 'video_hero':
      return (
        <div className="text-center space-y-3">
          <h3 className="font-bold text-lg">{block.title || 'Video Hero'}</h3>
          <p className="text-gray-600">{block.subtitle || 'Video subtitle'}</p>
          <div className="bg-gray-200 rounded h-20 flex items-center justify-center mb-2">
            <Video className="w-8 h-8 text-gray-400" />
          </div>
          {block.ctaText && (
            <Button size="sm" className="mt-2">{block.ctaText}</Button>
          )}
          {block.configuration?.videoUrl && (
            <p className="text-xs text-blue-600">Video: {block.configuration.videoUrl.split('/').pop()}</p>
          )}
        </div>
      );
      
    default:
      return (
        <div className="text-center text-gray-500">
          <Layout className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm capitalize">{block.blockType.replace('_', ' ')} block</p>
          <p className="text-xs text-gray-400">
            ID: {block.identifier || block.id}
          </p>
        </div>
      );
  }
}

// Block Editor Component
function BlockEditor({ 
  block, 
  onSave, 
  onCancel 
}: { 
  block: PageBlock; 
  onSave: (updates: any) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    title: block.title || '',
    subtitle: block.subtitle || '',
    description: block.description || '',
    content: block.content || '',
    imageUrl: block.imageUrl || '',
    imageAlt: block.imageAlt || '',
    ctaText: block.ctaText || '',
    ctaUrl: block.ctaUrl || '',
    ctaStyle: block.ctaStyle || 'primary',
    iconName: block.iconName || '',
    backgroundColor: block.backgroundColor || 'white',
    configuration: block.configuration || {}
  });
  const [isActive, setIsActive] = useState(block.isActive);

  const handleSave = () => {
    onSave({
      ...formData,
      isActive
    });
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const updateConfiguration = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      configuration: { ...prev.configuration, [field]: value }
    }));
  };

  const renderEditor = () => {
    switch (block.blockType) {
      case 'hero':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Main title"
                />
              </div>
              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => updateField('subtitle', e.target.value)}
                  placeholder="Subtitle text"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="imageUrl">Background Image</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => updateField('imageUrl', e.target.value)}
                placeholder="/attached_assets/image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: {formData.imageUrl || 'No image selected'}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="hasButton"
                checked={formData.configuration?.hasButton !== false}
                onCheckedChange={(checked) => updateConfiguration('hasButton', checked)}
              />
              <Label htmlFor="hasButton">Show Call-to-Action Button</Label>
            </div>

            {formData.configuration?.hasButton !== false && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ctaText">Button Text</Label>
                  <Input
                    id="ctaText"
                    value={formData.ctaText}
                    onChange={(e) => updateField('ctaText', e.target.value)}
                    placeholder="Call to action"
                  />
                </div>
                <div>
                  <Label htmlFor="ctaUrl">Button Link</Label>
                  <Input
                    id="ctaUrl"
                    value={formData.ctaUrl}
                    onChange={(e) => updateField('ctaUrl', e.target.value)}
                    placeholder="/experiences"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="iconName">Icon (Lucide React name)</Label>
                <Input
                  id="iconName"
                  value={formData.iconName}
                  onChange={(e) => updateField('iconName', e.target.value)}
                  placeholder="map-pin"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use Lucide React icon names (e.g., map-pin, camera, compass)
                </p>
              </div>
              <div>
                <Label htmlFor="backgroundColor">Background Color</Label>
                <Input
                  id="backgroundColor"
                  type="color"
                  value={formData.backgroundColor}
                  onChange={(e) => updateField('backgroundColor', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 'text_image':
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="title">Section Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Section title"
              />
            </div>
            
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                rows={8}
                value={formData.content}
                onChange={(e) => updateField('content', e.target.value)}
                placeholder="Enter your content here..."
              />
            </div>

            <div>
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => updateField('imageUrl', e.target.value)}
                placeholder="/attached_assets/image.jpg"
              />
              {formData.imageUrl && (
                <div className="mt-2">
                  <Label htmlFor="imageAlt">Image Alt Text</Label>
                  <Input
                    id="imageAlt"
                    value={formData.imageAlt}
                    onChange={(e) => updateField('imageAlt', e.target.value)}
                    placeholder="Describe the image"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="alignment">Text Alignment</Label>
                <Select 
                  value={formData.configuration?.alignment || 'left'} 
                  onValueChange={(value) => updateConfiguration('alignment', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="iconName">Section Icon</Label>
                <Input
                  id="iconName"
                  value={formData.iconName}
                  onChange={(e) => updateField('iconName', e.target.value)}
                  placeholder="compass"
                />
              </div>
            </div>

            {formData.imageUrl && (
              <div>
                <Label htmlFor="imagePosition">Image Position</Label>
                <Select 
                  value={formData.configuration?.imagePosition || 'right'} 
                  onValueChange={(value) => updateConfiguration('imagePosition', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        );

      case 'card_grid':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Section Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Featured Tours"
                />
              </div>
              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => updateField('subtitle', e.target.value)}
                  placeholder="Section subtitle"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="displayCount">Number to Show</Label>
                <Input
                  id="displayCount"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.configuration?.displayCount || 6}
                  onChange={(e) => updateConfiguration('displayCount', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="gridType">Grid Type</Label>
                <Select 
                  value={formData.configuration?.gridType || 'tours'} 
                  onValueChange={(value) => updateConfiguration('gridType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tours">Tours</SelectItem>
                    <SelectItem value="experiences">Experiences</SelectItem>
                    <SelectItem value="destinations">Destinations</SelectItem>
                    <SelectItem value="testimonials">Testimonials</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="showFilters"
                  checked={formData.configuration?.showFilters !== false}
                  onCheckedChange={(checked) => updateConfiguration('showFilters', checked)}
                />
                <Label htmlFor="showFilters">Show Filters</Label>
              </div>
            </div>
          </div>
        );

      case 'form':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Form Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Get in Touch"
                />
              </div>
              <div>
                <Label htmlFor="formType">Form Type</Label>
                <Select 
                  value={formData.configuration?.formType || 'contact'} 
                  onValueChange={(value) => updateConfiguration('formType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contact">Contact</SelectItem>
                    <SelectItem value="custom-tour">Custom Tour</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe the form purpose"
              />
            </div>
          </div>
        );

      case 'pdf_download':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Download Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Download Our Brochure"
                />
              </div>
              <div>
                <Label htmlFor="ctaText">Button Text</Label>
                <Input
                  id="ctaText"
                  value={formData.ctaText}
                  onChange={(e) => updateField('ctaText', e.target.value)}
                  placeholder="Download PDF"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe what the PDF contains"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pdfUrl">PDF File URL</Label>
                <Input
                  id="pdfUrl"
                  value={formData.configuration?.pdfUrl || ''}
                  onChange={(e) => updateConfiguration('pdfUrl', e.target.value)}
                  placeholder="/attached_assets/brochure.pdf"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Current file: {formData.configuration?.pdfUrl || 'No file selected'}
                </p>
              </div>
              <div>
                <Label htmlFor="iconName">Icon</Label>
                <Input
                  id="iconName"
                  value={formData.iconName}
                  onChange={(e) => updateField('iconName', e.target.value)}
                  placeholder="download"
                />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <p className="text-gray-600">
              Editor for "{block.blockType}" block type is being developed.
            </p>
            
            <div>
              <Label htmlFor="rawContent">Raw Content (JSON)</Label>
              <Textarea
                id="rawContent"
                rows={12}
                value={JSON.stringify(formData, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setFormData(parsed);
                  } catch {
                    // Invalid JSON, ignore
                  }
                }}
                placeholder="Edit JSON content directly..."
                className="font-mono text-sm"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderEditor()}
      
      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="isActive">Block Active</Label>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Page Settings Component
function PageSettingsForm({ config }: { config: PageConfiguration }) {
  const [formData, setFormData] = useState({
    seoTitle: config.seoTitle || '',
    seoDescription: config.seoDescription || '',
    seoKeywords: config.seoKeywords || '',
    isActive: config.isActive
  });

  const queryClient = useQueryClient();

  const updatePageMutation = useMutation({
    mutationFn: (updates: any) =>
      fetch(`/api/admin/page-configurations/${config.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-configurations'] });
      toast({ title: 'Page settings updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating page settings', variant: 'destructive' });
      console.error('Update page error:', error);
    }
  });

  const handleSave = () => {
    updatePageMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="seoTitle">SEO Title</Label>
        <Input
          id="seoTitle"
          value={formData.seoTitle}
          onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
          placeholder="Page title for search engines"
        />
        <p className="text-xs text-gray-500 mt-1">
          Recommended: 50-60 characters • Current: {formData.seoTitle.length} characters
        </p>
      </div>
      
      <div>
        <Label htmlFor="seoDescription">SEO Description</Label>
        <Textarea
          id="seoDescription"
          rows={4}
          value={formData.seoDescription}
          onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
          placeholder="Page description for search engines"
        />
        <p className="text-xs text-gray-500 mt-1">
          Recommended: 150-160 characters • Current: {formData.seoDescription.length} characters
        </p>
      </div>

      <div>
        <Label htmlFor="seoKeywords">SEO Keywords (optional)</Label>
        <Input
          id="seoKeywords"
          value={formData.seoKeywords}
          onChange={(e) => setFormData(prev => ({ ...prev, seoKeywords: e.target.value }))}
          placeholder="thailand tours, krabi, island hopping"
        />
        <p className="text-xs text-gray-500 mt-1">
          Separate keywords with commas
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
        />
        <Label htmlFor="isActive">Page Active</Label>
      </div>

      <Button 
        onClick={handleSave}
        disabled={updatePageMutation.isPending}
        className="w-full"
      >
        {updatePageMutation.isPending ? 'Saving...' : 'Save Page Settings'}
      </Button>
    </div>
  );
}