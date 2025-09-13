import { useState, useEffect } from 'react';
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
import { Edit, Plus, Trash2, Move, Eye, EyeOff, ChevronUp, ChevronDown, Settings, Palette, Layout, Image, Type, FileText, MapPin, Mail, Users, Download, Star, Camera, ArrowLeft, Search, Video, Bell, MousePointer, Globe, Menu, Clock, Link, CheckCircle, AlertCircle, Database, Trash } from 'lucide-react';
import RealBlockPreview from '@/components/admin/RealBlockPreview';
import { AddPageModal } from '@/components/AddPageModal';

// Composant EditableField pour l'édition inline
interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (value: string) => void;
  type?: 'text' | 'textarea';
  prefix?: string;
  placeholder?: string;
  className?: string;
  rows?: number;
}

function EditableField({ 
  label, 
  value, 
  onSave, 
  type = 'text', 
  prefix = '', 
  placeholder = '',
  className = '',
  rows = 3
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
      toast({ title: "Sauvegardé avec succès!" });
    } catch (error) {
      toast({ title: "Erreur lors de la sauvegarde", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type === 'text') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-2 block">{label}</label>
      
      {isEditing ? (
        <div className="space-y-2">
          {type === 'textarea' ? (
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={rows}
              className="w-full"
              autoFocus
            />
          ) : (
            <div className="flex items-center">
              {prefix && (
                <span className="text-sm text-gray-500 mr-1">{prefix}</span>
              )}
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={`w-full ${className}`}
                autoFocus
              />
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="h-8"
            >
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="h-8"
            >
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => setIsEditing(true)}
          className="min-h-[40px] p-2 bg-gray-50 border rounded cursor-pointer hover:bg-gray-100 transition-colors flex items-center"
        >
          {prefix && (
            <span className="text-sm text-gray-500 mr-1">{prefix}</span>
          )}
          <span className={`text-sm text-gray-900 ${className}`}>
            {value || placeholder || 'Cliquez pour modifier...'}
          </span>
          <Edit className="w-3 h-3 ml-auto text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
    </div>
  );
}

// Interface pour les données d'édition du Hero
interface HeroEditData {
  title: string;
  titleColorPart: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  button1Text: string;
  button1Url: string;
  button2Text: string;
  button2Url: string;
}
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import logoAmon from "@/assets/logo-amon.png";

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
  ctaText?: string;
  ctaUrl?: string;
  iconName?: string;
  backgroundColor?: string;
  configuration: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface SiteSetting {
  id: number;
  section: string;
  key: string;
  value: string;
  type: string;
  isActive: boolean;
}

interface NavigationMenuItem {
  id: number;
  name: string;
  url: string;
  displayOrder: number;
  parentId?: number;
  isActive: boolean;
  iconName?: string;
  description?: string;
  target: string;
  createdAt: Date;
  updatedAt: Date;
}

// Helper functions for footer management
function getPlaceholderForStyle(style: string): string {
  switch (style) {
    case 'title': return 'e.g., Amon Tour is a brand of:';
    case 'text': return 'e.g., Flame BB Co., Ltd.';
    case 'address': return 'e.g., 242 Moo1 Tombol Ao Nang\n81180 Krabi, Thailand';
    case 'license_badge': return 'e.g., TAT License: 34/01995';
    case 'email': return 'e.g., info@amon-tour.com';
    case 'phone_with_title': return 'e.g., Operations manager: +66 (0)6 2574 8788';
    case 'whatsapp': return 'e.g., WhatsApp: +66 65 349 6445';
    case 'line': return 'e.g., Line ID: amontour';
    default: return 'Enter value';
  }
}

function getStyleDisplayName(style: string): string {
  switch (style) {
    case 'title': return 'Title';
    case 'text': return 'Text';
    case 'address': return 'Address';
    case 'license_badge': return 'Badge';
    case 'email': return 'Email';
    case 'phone_with_title': return 'Phone';
    case 'whatsapp': return 'WhatsApp';
    case 'line': return 'LINE';
    default: return style;
  }
}

function getStyleBadgeVariant(style: string): "default" | "secondary" | "destructive" | "outline" {
  switch (style) {
    case 'title': return 'default';
    case 'license_badge': return 'secondary';
    case 'email': return 'outline';
    case 'phone_with_title': return 'outline';
    case 'whatsapp': return 'secondary';
    case 'line': return 'secondary';
    default: return 'outline';
  }
}

function renderStylePreview(style: string, value: string): any {
  if (!value) return <span className="text-gray-400">No content</span>;
  
  switch (style) {
    case 'title':
      return <strong>{value}</strong>;
    case 'text':
      return <span>{value}</span>;
    case 'address':
      return <div className="whitespace-pre-line">{value}</div>;
    case 'license_badge':
      return <span className="bg-secondary/20 text-white px-2 py-1 rounded-full text-xs">{value}</span>;
    case 'email':
      return <a href={`mailto:${value.replace(/^[^:]*:\s*/, '')}`} className="text-primary underline">{value}</a>;
    case 'phone_with_title':
      return <a href={`tel:${value.replace(/^[^:]*:\s*/, '').replace(/\s/g, '')}`} className="text-primary">{value}</a>;
    case 'whatsapp':
      return <span><i className="fab fa-whatsapp"></i> {value}</span>;
    case 'line':
      return <span><i className="fab fa-line"></i> {value}</span>;
    default:
      return <span>{value}</span>;
  }
}

// Dynamic Footer Management Components
function ContactInfoManager({ siteSettings, updateSiteSetting, updateSiteSettingMutation }: any) {
  const getContactInfo = () => {
    const setting = siteSettings && Array.isArray(siteSettings) ? siteSettings.find((s: any) => s.section === 'footer' && s.key === 'contact_info') : null;
    if (setting?.value) {
      try {
        return JSON.parse(setting.value);
      } catch (e) {
        return [];
      }
    }
    return [
      { label: 'Brand Introduction', value: 'Amon Tour is a brand of:', style: 'title' },
      { label: 'Company Name', value: 'Flame BB Co., Ltd.', style: 'text' },
      { label: 'Address', value: '242 Moo1 Tombol Ao Nang\n81180 Krabi, Thailand', style: 'address' },
      { label: 'TAT License', value: 'TAT License: 34/01995', style: 'license_badge' },
      { label: 'Email', value: 'info@amon-tour.com', style: 'email' },
      { label: 'Operations Manager', value: 'Operations manager: +66 (0)6 2574 8788', style: 'phone_with_title' },
      { label: 'Travel Advisor', value: 'Travel Advisor Manager: +66 (0)8 0463 4691', style: 'phone_with_title' },
      { label: 'WhatsApp', value: 'WhatsApp: +66 65 349 6445', style: 'whatsapp' },
      { label: 'LINE ID', value: 'Line ID: amontour', style: 'line' }
    ];
  };

  const [contactInfo, setContactInfo] = useState(getContactInfo());
  const [newItem, setNewItem] = useState({ label: '', value: '', style: 'text' });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const saveContactInfo = (newData: any[]) => {
    setContactInfo(newData);
    updateSiteSetting('footer', 'contact_info', JSON.stringify(newData));
  };

  const addContactInfo = () => {
    if (newItem.label && newItem.value) {
      const updated = [...contactInfo, newItem];
      saveContactInfo(updated);
      setNewItem({ label: '', value: '', style: 'text' });
    }
  };

  const updateContactInfo = (index: number, field: string, value: string) => {
    const updated = contactInfo.map((item: any, i: number) => 
      i === index ? { ...item, [field]: value } : item
    );
    saveContactInfo(updated);
  };

  const deleteContactInfo = (index: number) => {
    const updated = contactInfo.filter((_: any, i: number) => i !== index);
    saveContactInfo(updated);
  };

  const moveContactInfo = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < contactInfo.length) {
      const updated = [...contactInfo];
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      saveContactInfo(updated);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <MapPin className="w-4 h-4" />
          Informations de contact
        </CardTitle>
        <CardDescription>Gérer les détails de contact du pied de page</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {contactInfo.map((item: any, index: number) => (
          <div key={index} className="border p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={item.label}
                  onChange={(e) => updateContactInfo(index, 'label', e.target.value)}
                  placeholder="Label (for admin reference only)"
                  className="font-medium flex-1"
                />
              </div>
              <div className="flex gap-1 ml-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => moveContactInfo(index, 'up')}
                  disabled={index === 0}
                  title="Move up"
                >
                  ↑
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => moveContactInfo(index, 'down')}
                  disabled={index === contactInfo.length - 1}
                  title="Move down"
                >
                  ↓
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600"
                  onClick={() => deleteContactInfo(index)}
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-32">
                  <Label className="text-xs text-gray-500">Display Style</Label>
                  <Select
                    value={item.style}
                    onValueChange={(value) => updateContactInfo(index, 'style', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="title">Title (Bold)</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="address">Address</SelectItem>
                      <SelectItem value="license_badge">License Badge</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone_with_title">Phone w/ Title</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="line">LINE ID</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-gray-500">Content (appears on website)</Label>
                  {item.style === 'address' ? (
                    <Textarea
                      value={item.value}
                      onChange={(e) => updateContactInfo(index, 'value', e.target.value)}
                      placeholder={getPlaceholderForStyle(item.style)}
                      className="min-h-[60px]"
                    />
                  ) : (
                    <Input
                      value={item.value}
                      onChange={(e) => updateContactInfo(index, 'value', e.target.value)}
                      placeholder={getPlaceholderForStyle(item.style)}
                    />
                  )}
                </div>
              </div>
              
            </div>
          </div>
        ))}
        
        {/* Add New Contact Info */}
        <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg space-y-3">
          <h5 className="font-medium text-gray-700">Ajouter une nouvelle information de contact</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500">Admin Label (for reference)</Label>
              <Input
                value={newItem.label}
                onChange={(e) => setNewItem(prev => ({ ...prev, label: e.target.value }))}
                placeholder="e.g., Fax Number"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Display Style</Label>
              <Select
                value={newItem.style}
                onValueChange={(value) => setNewItem(prev => ({ ...prev, style: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Title (Bold)</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="address">Address</SelectItem>
                  <SelectItem value="license_badge">License Badge</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone_with_title">Phone w/ Title</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="line">LINE ID</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Content (appears on website)</Label>
            {newItem.style === 'address' ? (
              <Textarea
                value={newItem.value}
                onChange={(e) => setNewItem(prev => ({ ...prev, value: e.target.value }))}
                placeholder={getPlaceholderForStyle(newItem.style)}
                className="min-h-[60px]"
              />
            ) : (
              <Input
                value={newItem.value}
                onChange={(e) => setNewItem(prev => ({ ...prev, value: e.target.value }))}
                placeholder={getPlaceholderForStyle(newItem.style)}
              />
            )}
          </div>
          {/* Preview */}
          {newItem.label && newItem.value && (
            <div className="bg-gray-50 p-3 rounded border-l-4 border-primary">
              <Label className="text-xs text-gray-500 block mb-1">Preview on website:</Label>
              <div className="text-sm">
                {newItem.style === 'phone_with_title' ? (
                  <span>{newItem.label}: {newItem.value}</span>
                ) : newItem.style === 'whatsapp' ? (
                  <span>💬 {newItem.value}</span>
                ) : newItem.style === 'line' ? (
                  <span>💬 {newItem.value}</span>
                ) : newItem.style === 'email' ? (
                  <a href={`mailto:${newItem.value}`} className="text-primary">{newItem.value}</a>
                ) : newItem.style === 'license_badge' ? (
                  <div className="inline-block bg-white px-3 py-1 rounded-full border text-xs">
                    {newItem.value}
                  </div>
                ) : newItem.style === 'title' ? (
                  <div className="font-bold">{newItem.value}</div>
                ) : newItem.style === 'address' ? (
                  <div className="text-gray-700">{newItem.value}</div>
                ) : (
                  <span>{newItem.value}</span>
                )}
              </div>
            </div>
          )}
          
          <Button onClick={addContactInfo} disabled={!newItem.label || !newItem.value} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une information de contact
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function UsefulLinksManager({ siteSettings, updateSiteSetting, updateSiteSettingMutation, availablePages }: any) {
  const getUsefulLinks = () => {
    const setting = siteSettings && Array.isArray(siteSettings) ? siteSettings.find((s: any) => s.section === 'footer' && s.key === 'useful_links') : null;
    if (setting?.value) {
      try {
        return JSON.parse(setting.value);
      } catch (e) {
        return [];
      }
    }
    return [
      { text: 'Our brochure', url: '/brochure', type: 'page' },
      { text: 'Krabi Celebration', url: '/krabi-celebration', type: 'page' },
      { text: 'Fun Garden', url: 'https://www.facebook.com/thefungardenkrabi/', type: 'custom' },
      { text: 'Villas in Krabi', url: '/villas-krabi', type: 'page' },
      { text: 'Become Partner', url: '/become-partner', type: 'page' },
      { text: 'Group & Corporate', url: '/group-corporate', type: 'page' }
    ];
  };

  const [usefulLinks, setUsefulLinks] = useState(getUsefulLinks());
  const [newLink, setNewLink] = useState({ text: '', url: '', type: 'page' });
  
  const availablePagesInternal = [
    { label: 'Our brochure', value: '/brochure' },
    { label: 'Krabi Celebration', value: '/krabi-celebration' },
    { label: 'Villas in Krabi', value: '/villas-krabi' },
    { label: 'Become Partner', value: '/become-partner' },
    { label: 'Group & Corporate', value: '/group-corporate' },
    { label: 'Privacy Policy', value: '/privacy-policy' },
    { label: 'Legal Notice', value: '/legal-notice' },
    { label: 'Terms & Conditions', value: '/terms-conditions' }
  ];

  const saveUsefulLinks = (newData: any[]) => {
    setUsefulLinks(newData);
    updateSiteSetting('footer', 'useful_links', JSON.stringify(newData));
  };

  const addUsefulLink = () => {
    if (newLink.text && newLink.url) {
      const updated = [...usefulLinks, newLink];
      saveUsefulLinks(updated);
      setNewLink({ text: '', url: '', type: 'page' });
    }
  };

  const updateUsefulLink = (index: number, field: string, value: string) => {
    const updated = usefulLinks.map((item: any, i: number) => 
      i === index ? { ...item, [field]: value } : item
    );
    saveUsefulLinks(updated);
  };

  const deleteUsefulLink = (index: number) => {
    const updated = usefulLinks.filter((_: any, i: number) => i !== index);
    saveUsefulLinks(updated);
  };

  const moveUsefulLink = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < usefulLinks.length) {
      const updated = [...usefulLinks];
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      saveUsefulLinks(updated);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <FileText className="w-4 h-4" />
          Liens utiles
        </CardTitle>
        <CardDescription>Gérer les liens de navigation du pied de page</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {usefulLinks.map((link: any, index: number) => (
          <div key={index} className="border p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label className="text-xs text-gray-500">Content (appears on website)</Label>
                <Input
                  value={link.text}
                  onChange={(e) => updateUsefulLink(index, 'text', e.target.value)}
                  placeholder="e.g., Our brochure"
                  className="font-medium"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => moveUsefulLink(index, 'up')}
                  disabled={index === 0}
                >
                  ↑
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => moveUsefulLink(index, 'down')}
                  disabled={index === usefulLinks.length - 1}
                >
                  ↓
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600"
                  onClick={() => deleteUsefulLink(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-3">
              <Select
                value={link.type}
                onValueChange={(value) => updateUsefulLink(index, 'type', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="page">Page</SelectItem>
                  <SelectItem value="custom">Custom URL</SelectItem>
                </SelectContent>
              </Select>
              {link.type === 'page' ? (
                <Select
                  value={link.url}
                  onValueChange={(value) => updateUsefulLink(index, 'url', value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select page" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePages.map((page: any) => (
                      <SelectItem key={page.slug} value={`/${page.slug}`}>
                        {page.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="/brochure">Download Brochure</SelectItem>
                    <SelectItem value="/krabi-celebration">Krabi Celebration</SelectItem>
                    <SelectItem value="/become-partner">Become Partner</SelectItem>
                    <SelectItem value="/group-corporate">Group & Corporate</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={link.url}
                  onChange={(e) => updateUsefulLink(index, 'url', e.target.value)}
                  placeholder="URL"
                  className="flex-1"
                />
              )}
            </div>
          </div>
        ))}
        
        {/* Add New Link */}
        <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg space-y-3">
          <div>
            <Label className="text-xs text-gray-500">Content (appears on website)</Label>
            <Input
              value={newLink.text}
              onChange={(e) => setNewLink(prev => ({ ...prev, text: e.target.value }))}
              placeholder="e.g., Our brochure"
            />
          </div>
          <div className="flex gap-3">
            <Select
              value={newLink.type}
              onValueChange={(value) => setNewLink(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="page">Page</SelectItem>
                <SelectItem value="custom">Custom URL</SelectItem>
              </SelectContent>
            </Select>
            {newLink.type === 'page' ? (
              <Select
                value={newLink.url}
                onValueChange={(value) => setNewLink(prev => ({ ...prev, url: value }))}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select page" />
                </SelectTrigger>
                <SelectContent>
                  {availablePages.map((page: any) => (
                    <SelectItem key={page.slug} value={`/${page.slug}`}>
                      {page.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="/brochure">Download Brochure</SelectItem>
                  <SelectItem value="/krabi-celebration">Krabi Celebration</SelectItem>
                  <SelectItem value="/become-partner">Become Partner</SelectItem>
                  <SelectItem value="/group-corporate">Group & Corporate</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={newLink.url}
                onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                placeholder="URL"
                className="flex-1"
              />
            )}
          </div>
          {/* Preview */}
          {newLink.text && newLink.url && (
            <div className="bg-gray-50 p-3 rounded border-l-4 border-primary">
              <Label className="text-xs text-gray-500 block mb-1">Preview on website:</Label>
              <div className="text-sm">
                <a 
                  href={newLink.url}
                  className="text-primary hover:text-primary/80 font-medium"
                  {...(newLink.url.startsWith('http') ? {
                    target: "_blank",
                    rel: "noopener noreferrer"
                  } : {})}
                >
                  {newLink.text}
                </a>
              </div>
            </div>
          )}
          
          <Button onClick={addUsefulLink} disabled={!newLink.text || !newLink.url} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Link
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SocialMediaManager({ siteSettings, updateSiteSetting, updateSiteSettingMutation }: any) {
  const getSocialMedia = () => {
    const setting = siteSettings && Array.isArray(siteSettings) ? siteSettings.find((s: any) => s.section === 'footer' && s.key === 'social_media') : null;
    if (setting?.value) {
      try {
        return JSON.parse(setting.value);
      } catch (e) {
        return [];
      }
    }
    return [
      { name: 'Facebook', url: 'https://web.facebook.com/amontourthailand', icon: 'facebook' },
      { name: 'Instagram', url: 'https://www.instagram.com/amontourthailand/', icon: 'instagram' },
      { name: 'YouTube', url: 'https://www.youtube.com/@amontour4949', icon: 'youtube' }
    ];
  };

  const [socialMedia, setSocialMedia] = useState(getSocialMedia());
  const [newSocial, setNewSocial] = useState({ url: '', icon: 'facebook' });
  
  const socialPlatforms = [
    { name: 'Facebook', icon: 'facebook', label: 'Facebook' },
    { name: 'Instagram', icon: 'instagram', label: 'Instagram' },
    { name: 'YouTube', icon: 'youtube', label: 'YouTube' },
    { name: 'Twitter', icon: 'twitter', label: 'Twitter' },
    { name: 'LinkedIn', icon: 'linkedin', label: 'LinkedIn' },
    { name: 'TikTok', icon: 'tiktok', label: 'TikTok' },
    { name: 'WhatsApp', icon: 'whatsapp', label: 'WhatsApp' },
    { name: 'Telegram', icon: 'telegram', label: 'Telegram' }
  ];

  const saveSocialMedia = (newData: any[]) => {
    setSocialMedia(newData);
    updateSiteSetting('footer', 'social_media', JSON.stringify(newData));
  };

  const addSocialMedia = () => {
    if (newSocial.url && newSocial.icon) {
      const platformData = socialPlatforms.find(p => p.icon === newSocial.icon);
      const updated = [...socialMedia, {
        name: platformData?.name || 'Social',
        url: newSocial.url,
        icon: newSocial.icon
      }];
      saveSocialMedia(updated);
      setNewSocial({ url: '', icon: 'facebook' });
    }
  };

  const updateSocialMedia = (index: number, field: string, value: string) => {
    const updated = socialMedia.map((item: any, i: number) => 
      i === index ? { ...item, [field]: value } : item
    );
    saveSocialMedia(updated);
  };

  const deleteSocialMedia = (index: number) => {
    const updated = socialMedia.filter((_: any, i: number) => i !== index);
    saveSocialMedia(updated);
  };

  const moveSocialMedia = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < socialMedia.length) {
      const updated = [...socialMedia];
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      saveSocialMedia(updated);
    }
  };

  const getSocialIcon = (iconName: string) => {
    const icons: any = {
      facebook: '📘',
      instagram: '📷',
      youtube: '🎥',
      twitter: '🐦',
      linkedin: '💼',
      tiktok: '🎵',
      whatsapp: '💬',
      telegram: '✈️',
      globe: '🌐'
    };
    return icons[iconName] || '🌐';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Users className="w-4 h-4" />
          Réseaux sociaux
        </CardTitle>
        <CardDescription>Gérer les liens des réseaux sociaux</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {socialMedia.map((social: any, index: number) => (
          <div key={index} className="border p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <span className="font-medium">{social.name}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => moveSocialMedia(index, 'up')}
                  disabled={index === 0}
                >
                  ↑
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => moveSocialMedia(index, 'down')}
                  disabled={index === socialMedia.length - 1}
                >
                  ↓
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600"
                  onClick={() => deleteSocialMedia(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-3">
              <Select
                value={social.icon}
                onValueChange={(value) => updateSocialMedia(index, 'icon', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {socialPlatforms.map((platform) => (
                    <SelectItem key={platform.icon} value={platform.icon}>
                      {platform.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={social.url}
                onChange={(e) => updateSocialMedia(index, 'url', e.target.value)}
                placeholder="URL"
                className="flex-1"
              />
            </div>
          </div>
        ))}
        
        {/* Ajouter un nouveau réseau social */}
        <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg space-y-3">
          <div>
            <Label className="text-xs text-gray-500">Social Platform</Label>
            <Select
              value={newSocial.icon}
              onValueChange={(value) => setNewSocial(prev => ({ ...prev, icon: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {socialPlatforms.map((platform) => (
                  <SelectItem key={platform.icon} value={platform.icon}>
                    {platform.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-gray-500">URL</Label>
            <Input
              value={newSocial.url}
              onChange={(e) => setNewSocial(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://..."
            />
          </div>
          
          {/* Preview */}
          {newSocial.url && newSocial.icon && (
            <div className="bg-gray-50 p-3 rounded border-l-4 border-primary">
              <Label className="text-xs text-gray-500 block mb-1">Preview on website:</Label>
              <div className="text-sm">
                <a 
                  href={newSocial.url}
                  className="text-primary hover:text-primary/80"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className={`fab fa-${newSocial.icon}`}></i>
                </a>
              </div>
            </div>
          )}
          
          <Button onClick={addSocialMedia} disabled={!newSocial.url || !newSocial.icon} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un réseau social
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NewsletterManager({ siteSettings, updateSiteSetting, updateSiteSettingMutation }: any) {
  const getNewsletterConfig = () => {
    const setting = siteSettings && Array.isArray(siteSettings) ? siteSettings.find((s: any) => s.section === 'footer' && s.key === 'newsletter_config') : null;
    if (setting?.value) {
      try {
        return JSON.parse(setting.value);
      } catch (e) {
        return {};
      }
    }
    return {
      title: 'Newsletter',
      description: 'Subscribe to receive our special offers and travel tips.',
      privacy: 'We respect your privacy. Unsubscribe at any time.',
      buttonText: 'Subscribe',
      placeholderText: 'Enter your email',
      enabled: true
    };
  };

  const [newsletterConfig, setNewsletterConfig] = useState(getNewsletterConfig());

  const saveNewsletterConfig = (newData: any) => {
    setNewsletterConfig(newData);
    updateSiteSetting('footer', 'newsletter_config', JSON.stringify(newData));
  };

  const updateNewsletterConfig = (field: string, value: any) => {
    const updated = { ...newsletterConfig, [field]: value };
    saveNewsletterConfig(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Mail className="w-4 h-4" />
          Newsletter
        </CardTitle>
        <CardDescription>Configurer la section newsletter</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Activer la newsletter</Label>
          <Switch
            checked={newsletterConfig.enabled}
            onCheckedChange={(checked) => updateNewsletterConfig('enabled', checked)}
          />
        </div>
        
        <div>
          <Label htmlFor="newsletter-title">Title</Label>
          <Input
            id="newsletter-title"
            value={newsletterConfig.title}
            onChange={(e) => updateNewsletterConfig('title', e.target.value)}
            placeholder="Newsletter"
          />
        </div>
        
        <div>
          <Label htmlFor="newsletter-description">Description</Label>
          <Textarea
            id="newsletter-description"
            value={newsletterConfig.description}
            onChange={(e) => updateNewsletterConfig('description', e.target.value)}
            placeholder="Subscribe to receive..."
          />
        </div>
        
        <div>
          <Label htmlFor="newsletter-placeholder">Email Placeholder</Label>
          <Input
            id="newsletter-placeholder"
            value={newsletterConfig.placeholderText}
            onChange={(e) => updateNewsletterConfig('placeholderText', e.target.value)}
            placeholder="Enter your email"
          />
        </div>
        
        <div>
          <Label htmlFor="newsletter-button">Button Text</Label>
          <Input
            id="newsletter-button"
            value={newsletterConfig.buttonText}
            onChange={(e) => updateNewsletterConfig('buttonText', e.target.value)}
            placeholder="Subscribe"
          />
        </div>
        
        <div>
          <Label htmlFor="newsletter-privacy">Privacy Text</Label>
          <Input
            id="newsletter-privacy"
            value={newsletterConfig.privacy}
            onChange={(e) => updateNewsletterConfig('privacy', e.target.value)}
            placeholder="We respect your privacy..."
          />
        </div>
      </CardContent>
    </Card>
  );
}

function CopyrightManager({ siteSettings, updateSiteSetting, updateSiteSettingMutation }: any) {
  const getCopyrightConfig = () => {
    const setting = siteSettings && Array.isArray(siteSettings) ? siteSettings.find((s: any) => s.section === 'footer' && s.key === 'copyright_config') : null;
    if (setting?.value) {
      try {
        return JSON.parse(setting.value);
      } catch (e) {
        return {};
      }
    }
    return {
      text: '© 2025 Flame BB Co., Ltd. (Amon Tour). All rights reserved.',
      enabled: true
    };
  };

  const [copyrightConfig, setCopyrightConfig] = useState(getCopyrightConfig());

  const saveCopyrightConfig = (newData: any) => {
    setCopyrightConfig(newData);
    updateSiteSetting('footer', 'copyright_config', JSON.stringify(newData));
  };

  const updateCopyrightConfig = (field: string, value: any) => {
    const updated = { ...copyrightConfig, [field]: value };
    saveCopyrightConfig(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <FileText className="w-4 h-4" />
          Copyright
        </CardTitle>
        <CardDescription>Configurer le texte de copyright</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Activer le copyright</Label>
          <Switch
            checked={copyrightConfig.enabled}
            onCheckedChange={(checked) => updateCopyrightConfig('enabled', checked)}
          />
        </div>
        
        <div>
          <Label htmlFor="copyright-text">Copyright Text</Label>
          <Textarea
            id="copyright-text"
            value={copyrightConfig.text}
            onChange={(e) => updateCopyrightConfig('text', e.target.value)}
            placeholder="© 2025 Flame BB Co., Ltd. (Amon Tour). All rights reserved."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Page Management Interface Component - Page Information Dashboard
function PageManagementInterface({ selectedPage, pageBlocks, pageConfigs, updatePageConfigMutation }: {
  selectedPage: string;
  pageBlocks: PageBlock[];
  pageConfigs: PageConfiguration[];
  updatePageConfigMutation: any;
}) {
  const currentPageConfig = pageConfigs.find(p => p.pageSlug === selectedPage);
  
  if (!currentPageConfig) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Configuration de page introuvable</div>
      </div>
    );
  }

  // Calculate statistics
  const totalBlocks = pageBlocks?.length || 0;
  const activeBlocks = pageBlocks?.filter(block => block.isActive).length || 0;
  const inactiveBlocks = totalBlocks - activeBlocks;
  
  // Get last modification date
  const lastModified = pageBlocks?.length > 0 
    ? new Date(Math.max(...pageBlocks.map(block => new Date(block.updatedAt || block.createdAt).getTime())))
    : new Date(currentPageConfig.updatedAt || currentPageConfig.createdAt);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleEditPage = () => {
    // Redirect to page editor route
    window.location.href = `/admin-editor`;
  };

  // Check where the page is linked/referenced
  const getPageReferences = () => {
    const references = [];
    
    // Check if it's in main navigation
    if (['home', 'tours', 'experiences', 'stays', 'contact', 'blog'].includes(selectedPage)) {
      references.push('Menu principal de navigation');
    }
    
    // Check if it's a landing page
    if (selectedPage === 'home') {
      references.push('Page d\'accueil du site');
    }
    
    // Check if it's linked in footer
    if (['contact', 'legal-notice', 'privacy-policy', 'terms-conditions'].includes(selectedPage)) {
      references.push('Liens du footer');
    }
    
    // Check for form redirections
    if (['krabi-celebration', 'become-partner', 'group-corporate'].includes(selectedPage)) {
      references.push('Pages de formulaires spéciaux');
    }
    
    return references;
  };

  const pageReferences = getPageReferences();

  return (
    <div className="space-y-6">
      {/* Page Metadata Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Informations générales
          </CardTitle>
          <CardDescription>
            Métadonnées et configuration de la page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Ligne 1: Nom de la page + Slug/URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditableField
              label="Nom de la page"
              value={currentPageConfig.pageName}
              onSave={(value) => updatePageConfigMutation.mutate({ id: currentPageConfig.id, field: 'pageName', value })}
              type="text"
            />
            <EditableField
              label="Slug/URL"
              value={currentPageConfig.pageSlug}
              onSave={(value) => updatePageConfigMutation.mutate({ id: currentPageConfig.id, field: 'pageSlug', value })}
              type="text"
              prefix="/"
              className="font-mono"
            />
          </div>

          {/* Ligne 2: Type de page + État */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Type de page</label>
              <Select
                value={currentPageConfig.pageType}
                onValueChange={(value) => updatePageConfigMutation.mutate({ id: currentPageConfig.id, field: 'pageType', value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Pages principales</SelectItem>
                  <SelectItem value="secondary">Pages secondaires</SelectItem>
                  <SelectItem value="legal">Mentions légales</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">État</label>
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded border h-10">
                <div className={`w-2 h-2 rounded-full ${currentPageConfig.isActive ? 'bg-secondary' : 'bg-gray-500'}`}></div>
                <span className={`text-sm font-medium ${currentPageConfig.isActive ? 'text-secondary' : 'text-gray-700'}`}>
                  {currentPageConfig.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Ligne 3: Titre SEO + Mots-clés SEO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditableField
              label="Titre SEO"
              value={currentPageConfig.seoTitle || ''}
              onSave={(value) => updatePageConfigMutation.mutate({ id: currentPageConfig.id, field: 'seoTitle', value })}
              type="text"
              placeholder="Non défini"
            />
            <EditableField
              label="Mots-clés SEO"
              value={currentPageConfig.seoKeywords || ''}
              onSave={(value) => updatePageConfigMutation.mutate({ id: currentPageConfig.id, field: 'seoKeywords', value })}
              type="text"
              placeholder="Non défini"
            />
          </div>

          {/* Ligne 4: Description SEO */}
          <div>
            <EditableField
              label="Description SEO"
              value={currentPageConfig.seoDescription || ''}
              onSave={(value) => updatePageConfigMutation.mutate({ id: currentPageConfig.id, field: 'seoDescription', value })}
              type="textarea"
              placeholder="Non définie"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>


      {/* Page References */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            Où cette page est rattachée
          </CardTitle>
          <CardDescription>
            Emplacements où cette page est référencée dans le site
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pageReferences.length > 0 ? (
            <div className="space-y-2">
              {pageReferences.map((reference, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <CheckCircle className="w-4 h-4 text-secondary" />
                  <span className="text-sm text-gray-700">{reference}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Cette page n'est pas encore rattachée à d'autres sections du site</p>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Technical Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Informations techniques
          </CardTitle>
          <CardDescription>
            Détails techniques et métadonnées système
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ligne 1: ID Page */}
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="font-medium text-gray-700">ID Page:</span>
            <code className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-sm">{currentPageConfig.id}</code>
          </div>
          
          {/* Ligne 2: URL publique */}
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="font-medium text-gray-700">URL publique:</span>
            <a 
              href={selectedPage === 'home' ? '/' : `/${selectedPage}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary hover:underline text-sm max-w-xs truncate"
              title={`${window.location.origin}${selectedPage === 'home' ? '/' : `/${selectedPage}`}`}
            >
              {window.location.origin}{selectedPage === 'home' ? '/' : `/${selectedPage}`}
            </a>
          </div>
          
          {/* Ligne 3: Créée le */}
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="font-medium text-gray-700">Créée le:</span>
            <span className="text-gray-600 text-sm">{formatDate(new Date(currentPageConfig.createdAt))}</span>
          </div>
          
          {/* Ligne 4: Modifiée le */}
          <div className="flex justify-between items-center py-3">
            <span className="font-medium text-gray-700">Modifiée le:</span>
            <span className="text-gray-600 text-sm">{formatDate(new Date(currentPageConfig.updatedAt || currentPageConfig.createdAt))}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminAppearance() {
  const [, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState<string>('theme');
  const [selectedPage, setSelectedPage] = useState<string>('navigation-menu');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Menu principal']);
  const [expandedThemeCategories, setExpandedThemeCategories] = useState<string[]>(['Design']);
  const [selectedThemeSection, setSelectedThemeSection] = useState<string>('colors');
  const [selectedFooterSection, setSelectedFooterSection] = useState<string>('contact-info');

  // Temporary states for preview system with save buttons
  const [tempTypography, setTempTypography] = useState<any>(null);
  const [tempColors, setTempColors] = useState<any>(null);
  const [tempButtonStyles, setTempButtonStyles] = useState<any>(null);
  const [tempLogoSettings, setTempLogoSettings] = useState<any>(null);
  const [tempNotificationBar, setTempNotificationBar] = useState<any>(null);
  const [tempPopupSettings, setTempPopupSettings] = useState<any>(null);

  // States for page creation modal
  const [isCreatePageDialogOpen, setIsCreatePageDialogOpen] = useState(false);
  const [isAddPageModalOpen, setIsAddPageModalOpen] = useState(false);
  const [newPageData, setNewPageData] = useState({
    pageName: '',
    pageSlug: '',
    pageType: 'main' as 'main' | 'secondary',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  });

  // Helper functions for temp settings with fallbacks
  const getTempSetting = (section: string, key: string, tempState: any) => {
    if (tempState) return tempState;
    return JSON.parse(getSiteSetting(section, key) || '{}');
  };

  // Save functions for each section
  const saveTypography = () => {
    if (tempTypography) {
      if (tempTypography.heading_font) updateSiteSetting('theme', 'heading_font', tempTypography.heading_font);
      if (tempTypography.body_font) updateSiteSetting('theme', 'body_font', tempTypography.body_font);
      setTempTypography(null);
      toast({ title: "Typography sauvegardée !", description: "Les polices ont été appliquées au site." });
    }
  };

  const saveColors = () => {
    if (tempColors) {
      if (tempColors.primary_color) updateSiteSetting('theme', 'primary_color', tempColors.primary_color);
      if (tempColors.secondary_color) updateSiteSetting('theme', 'secondary_color', tempColors.secondary_color);
      if (tempColors.color_palette) updateSiteSetting('theme', 'color_palette', JSON.stringify(tempColors.color_palette));
      setTempColors(null);
      toast({ title: "Couleurs sauvegardées !", description: "La palette de couleurs a été appliquée au site." });
    }
  };

  const saveButtonStyles = () => {
    if (tempButtonStyles) {
      updateSiteSetting('theme', 'button_styles', JSON.stringify(tempButtonStyles));
      setTempButtonStyles(null);
      toast({ title: "Styles de boutons sauvegardés !", description: "Les nouveaux styles ont été appliqués." });
    }
  };

  const saveLogoSettings = () => {
    if (tempLogoSettings) {
      updateSiteSetting('theme', 'logo_settings', JSON.stringify(tempLogoSettings));
      setTempLogoSettings(null);
      toast({ title: "Logos sauvegardés !", description: "Les nouveaux logos ont été appliqués au site." });
    }
  };

  const saveNotificationBar = () => {
    if (tempNotificationBar) {
      updateSiteSetting('theme', 'notification_bar', JSON.stringify(tempNotificationBar));
      setTempNotificationBar(null);
      toast({ title: "Barre d'annonce sauvegardée !", description: "Les paramètres ont été appliqués." });
    }
  };

  const savePopupSettings = () => {
    if (tempPopupSettings) {
      updateSiteSetting('theme', 'popup_settings', JSON.stringify(tempPopupSettings));
      setTempPopupSettings(null);
      toast({ title: "Pop-up sauvegardée !", description: "Les paramètres de pop-up ont été appliqués." });
    }
  };

  // Fonction pour démarrer l'édition d'un bloc
  const handleEditBlock = (block: PageBlock) => {
    if (block.identifier === 'hero_main_v2') {
      // Préremplir avec les données actuelles
      const config = block.configuration || {};
      setHeroEditData({
        title: block.title || "Your exclusive experiences\nin Krabi – THAILAND",
        titleColorPart: config.titleColorPart || "in Krabi –",
        description: block.description || "Discover amazing places away from mass tourism in Krabi.\nAnd also Khao Sok, Koh Mook and many more destinations.",
        imageUrl: block.imageUrl || "/attached_assets/hero-background.jpg",
        videoUrl: config.videoUrl || "",
        button1Text: block.ctaText || "See our offers",
        button1Url: block.ctaUrl || "/tours",
        button2Text: config.button2Text || "Custom your trip",
        button2Url: config.button2Url || "/custom-tour"
      });
      setEditingHeroBlockId(block.id);
      return;
    }
    
    // Pour les autres types de blocs (futur)
    console.log('Édition de bloc:', block);
  };

  // Fonctions pour RealBlockPreview (stubs pour éviter les erreurs)
  const handleUpdateBlock = (blockId: number, updates: any) => {
    console.log('Update block:', blockId, updates);
  };

  const handleDeleteBlock = (blockId: number) => {
    console.log('Delete block:', blockId);
  };

  const handleMoveUp = (blockId: number) => {
    console.log('Move up block:', blockId);
  };

  const handleMoveDown = (blockId: number) => {
    console.log('Move down block:', blockId);
  };

  const handleToggleVisibility = (blockId: number) => {
    console.log('Toggle visibility block:', blockId);
  };

  // Fonction pour charger les données du bloc Hero
  const loadHeroData = (block: PageBlock) => {
    const config = block.configuration || {};
    setHeroEditData({
      title: block.title || "Your exclusive experiences\nin Krabi – THAILAND",
      titleColorPart: config.titleColorPart || "in Krabi –",
      description: block.description || "Discover amazing places away from mass tourism in Krabi.\nAnd also Khao Sok, Koh Mook and many more destinations.",
      imageUrl: block.imageUrl || "/attached_assets/DJI_20241115104455_0160_D-min.jpeg",
      videoUrl: config.videoUrl || "/attached_assets/hero-video-optimized.mp4",
      button1Text: block.ctaText || "See our offers",
      button1Url: block.ctaUrl || "/tours",
      button2Text: config.button2Text || "Custom your trip",
      button2Url: config.button2Url || "/custom-tour"
    });
  };

  // Fonction pour gérer l'édition Hero
  const handleEditHero = (blockId: number) => {
    const block = pageBlocks && Array.isArray(pageBlocks) ? pageBlocks.find(b => b.id === blockId) : null;
    if (block) {
      loadHeroData(block);
      setEditingHeroBlockId(blockId);
    }
  };

  // Fonction pour sauvegarder les modifications Hero
  const saveHeroChanges = async () => {
    if (!editingHeroBlockId) return;
    
    try {
      const updateData = {
        title: heroEditData.title,
        description: heroEditData.description,
        imageUrl: heroEditData.imageUrl,
        ctaText: heroEditData.button1Text,
        ctaUrl: heroEditData.button1Url,
        configuration: {
          titleColorPart: heroEditData.titleColorPart,
          videoUrl: heroEditData.videoUrl,
          button2Text: heroEditData.button2Text,
          button2Url: heroEditData.button2Url
        }
      };
      
      const response = await fetch(`/api/admin/page-blocks/${editingHeroBlockId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) throw new Error('Erreur de sauvegarde');
      
      setEditingHeroBlockId(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-blocks', selectedPage] });
      toast({ title: "Hero mis à jour avec succès!" });
      
    } catch (error) {
      console.error('Erreur sauvegarde Hero:', error);
      toast({ title: "Erreur lors de la sauvegarde", variant: "destructive" });
    }
  };

  // Fonctions helper pour renderBlockContent
  const getPageTitle = (slug: string) => {
    const titles: Record<string, string> = {
      'home': 'Page d\'Accueil',
      'experiences': 'Page Expériences',
      'contact': 'Page Contact',
      'custom-tour': 'Page Voyage Sur Mesure',
      'blog': 'Page Blog',
      'stays': 'Page Hébergements'
    };
    return titles[slug] || slug;
  };

  const getBlockDisplayName = (blockType: string) => {
    const displayNames: Record<string, string> = {
      'video_hero': 'Hero avec Image',
      'hero': 'Hero Simple',
      'text_image': 'Texte + Images',
      'card_grid': 'Grille de Cartes',
      'advantages': 'Icônes + Avantages',
      'form': 'Formulaire',
      'gallery': 'Témoignages',
      'contact_info': 'Infos Contact',
      'search_module': 'Module Recherche',
      'popular_experiences': 'Card Grid Date',
      'tour_ninja_section': 'Card Grid Price'
    };
    return displayNames[blockType] || blockType.replace('_', ' ');
  };

  // Toggle category expansion
  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(cat => cat !== categoryName)
        : [...prev, categoryName]
    );
  };

  // Toggle theme category expansion
  const toggleThemeCategory = (categoryName: string) => {
    setExpandedThemeCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(cat => cat !== categoryName)
        : [...prev, categoryName]
    );
  };
  const [selectedBlock, setSelectedBlock] = useState<PageBlock | null>(null);
  const [isEditingBlock, setIsEditingBlock] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<number | null>(null);
  const [newBlockType, setNewBlockType] = useState<string>('');
  
  // État pour l'édition Hero séparée
  const [editingHeroBlockId, setEditingHeroBlockId] = useState<number | null>(null);
  const [heroEditData, setHeroEditData] = useState<HeroEditData>({
    title: "Your exclusive experiences\nin Krabi – THAILAND",
    titleColorPart: "in Krabi –",
    description: "Discover amazing places away from mass tourism in Krabi.\nAnd also Khao Sok, Koh Mook and many more destinations.",
    imageUrl: "/attached_assets/DJI_20241115104455_0160_D-min.jpeg",
    videoUrl: "/attached_assets/hero-video-optimized.mp4",
    button1Text: "See our offers",
    button1Url: "/tours",
    button2Text: "Custom your trip",
    button2Url: "/custom-tour"
  });

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

  // Fetch blocks for selected page (only for Pages category)
  const { data: pageBlocks = [], isLoading: loadingBlocks } = useQuery({
    queryKey: ['/api/admin/page-blocks', selectedPage],
    queryFn: () => fetch(`/api/admin/page-blocks/${selectedPage}`).then(res => {
      if (!res.ok) throw new Error('Authentication required');
      return res.json();
    }) as Promise<PageBlock[]>,
    enabled: activeCategory === 'pages' && !!selectedPage,
    retry: false
  });

  // Fetch site settings for theme and footer management
  const { data: siteSettings = [], isLoading: loadingSettings } = useQuery({
    queryKey: ['/api/admin/site-settings'],
    queryFn: () => fetch('/api/admin/site-settings').then(res => {
      if (!res.ok) throw new Error('Authentication required');
      return res.json();
    }) as Promise<SiteSetting[]>,
    enabled: activeCategory === 'theme' || activeCategory === 'footer',
    retry: false
  });

  // Note: L'ancienne logique automatique de catégorisation via navigationMenuItems a été supprimée
  // Maintenant nous utilisons simplement le champ pageType de chaque page

  // Update page configuration mutation - MOVED HERE to be defined before usage
  const updatePageConfigMutation = useMutation({
    mutationFn: (data: { id: number; field: string; value: string }) =>
      fetch(`/api/admin/page-configurations/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ [data.field]: data.value })
      }).then(res => {
        if (!res.ok) throw new Error('Failed to update page configuration');
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-configurations'] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erreur lors de la sauvegarde', 
        description: error.message || 'Veuillez réessayer',
        variant: 'destructive' 
      });
      throw error; // Re-throw pour que EditableField puisse gérer l'erreur
    }
  });

  // Create block mutation
  const createBlockMutation = useMutation({
    mutationFn: (blockData: Partial<PageBlock>) =>
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
    onError: () => {
      toast({ title: 'Error creating block', variant: 'destructive' });
    }
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
      setEditingBlockId(null);
      setSelectedBlock(null);
    },
    onError: () => {
      toast({ title: 'Error updating block', variant: 'destructive' });
    }
  });

  // Delete block mutation
  const deleteBlockMutation = useMutation({
    mutationFn: (blockId: number) =>
      fetch(`/api/admin/page-blocks/${blockId}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-blocks', selectedPage] });
      toast({ title: 'Block deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error deleting block', variant: 'destructive' });
    }
  });

  // Move block mutation
  const moveBlockMutation = useMutation({
    mutationFn: (data: { blockId: number; direction: 'up' | 'down' }) => {
      const block = pageBlocks && Array.isArray(pageBlocks) ? pageBlocks.find(b => b.id === data.blockId) : null;
      if (!block) throw new Error('Block not found');
      
      const newOrder = data.direction === 'up' ? block.blockOrder - 1 : block.blockOrder + 1;
      return fetch(`/api/admin/page-blocks/${data.blockId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockOrder: newOrder })
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-blocks', selectedPage] });
      toast({ title: 'Block moved successfully' });
    },
    onError: () => {
      toast({ title: 'Error moving block', variant: 'destructive' });
    }
  });

  // Toggle block visibility mutation
  const toggleBlockVisibilityMutation = useMutation({
    mutationFn: (data: { blockId: number; isActive: boolean }) =>
      fetch(`/api/admin/page-blocks/${data.blockId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: data.isActive })
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-blocks', selectedPage] });
      toast({ title: 'Block visibility updated' });
    },
    onError: () => {
      toast({ title: 'Error updating block visibility', variant: 'destructive' });
    }
  });

  // Create page mutation
  const createPageMutation = useMutation({
    mutationFn: (pageData: typeof newPageData) =>
      fetch('/api/admin/page-configurations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(pageData)
      }).then(res => {
        if (!res.ok) throw new Error('Failed to create page');
        return res.json();
      }),
    onSuccess: (createdPage) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-configurations'] });
      setIsCreatePageDialogOpen(false);
      setNewPageData({
        pageName: '',
        pageSlug: '',
        pageType: 'main',
        seoTitle: '',
        seoDescription: '',
        seoKeywords: ''
      });
      setSelectedPage(createdPage.pageSlug);
      toast({ title: 'Page created successfully!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error creating page', 
        description: error.message || 'Please try again',
        variant: 'destructive' 
      });
    }
  });


  // Update site setting mutation
  const updateSiteSettingMutation = useMutation({
    mutationFn: (data: { section: string; key: string; value: string }) =>
      fetch(`/api/admin/site-settings/${data.section}/${data.key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: data.value })
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/site-settings'] });
      toast({ title: 'Setting updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error updating setting', variant: 'destructive' });
    }
  });

  // Check for authentication errors
  const hasAuthError = pageConfigError?.message?.includes('Authentication');

  if (hasAuthError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Settings className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-xl">Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access the site appearance management system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setLocation('/admin')}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Admin Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingPages || loadingSettings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appearance settings...</p>
        </div>
      </div>
    );
  }

  // Nouvelle logique simplifiée basée sur le champ pageType
  const getDynamicPageCategories = () => {
    if (!pageConfigs || !Array.isArray(pageConfigs)) {
      // Fallback si les données ne sont pas encore chargées
      return {
        'Pages principales': [],
        'Pages secondaires': [],
        'Mentions légales': []
      };
    }
    
    const categories: Record<string, Array<{ slug: string; name: string; id: number }>> = {
      'Pages principales': [],
      'Pages secondaires': [],
      'Mentions légales': []
    };

    // Organiser les pages selon leur pageType
    pageConfigs.forEach((page: PageConfiguration) => {
      const pageInfo = { 
        slug: page.pageSlug, 
        name: page.pageName === 'Accueil' ? 'Home' : page.pageName, 
        id: page.id 
      };
      
      switch (page.pageType) {
        case 'main':
          categories['Pages principales'].push(pageInfo);
          break;
        case 'legal':
          categories['Mentions légales'].push(pageInfo);
          break;
        case 'secondary':
        default:
          categories['Pages secondaires'].push(pageInfo);
          break;
      }
    });

    // Trier toutes les catégories par ordre alphabétique
    // mais garder Home en premier dans Pages principales
    const homePage = categories['Pages principales'].find(p => p.slug === 'home');
    
    // Trier Pages principales (sauf Home)
    const otherMainPages = categories['Pages principales']
      .filter(p => p.slug !== 'home')
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    
    categories['Pages principales'] = homePage 
      ? [homePage, ...otherMainPages]
      : otherMainPages;
    
    // Trier Pages secondaires
    categories['Pages secondaires'].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    
    // Trier Mentions légales
    categories['Mentions légales'].sort((a, b) => a.name.localeCompare(b.name, 'fr'));

    return categories;
  };

  const pageCategories = getDynamicPageCategories();

  // Helper functions for page creation
  const generateSlugFromName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleCreatePage = () => {
    if (!newPageData.pageName) {
      toast({ title: 'Please enter a page name', variant: 'destructive' });
      return;
    }

    if (!newPageData.pageSlug) {
      setNewPageData(prev => ({ ...prev, pageSlug: generateSlugFromName(prev.pageName) }));
    }

    createPageMutation.mutate(newPageData);
  };

  // Group theme sections by category
  const themeCategories = {
    'Design': [
      { key: 'colors', name: 'Couleurs', icon: 'Palette' },
      { key: 'typography', name: 'Typographie', icon: 'Type' }
    ],
    'Éléments': [
      { key: 'button-styles', name: 'Styles de boutons', icon: 'MousePointer' },
      { key: 'announcements', name: 'Barre d\'annonces', icon: 'Bell' },
      { key: 'backgrounds', name: 'Annonce pop-up', icon: 'Bell' }
    ],
    'Image de marque': [
      { key: 'logo-favicon', name: 'Logo & Favicon', icon: 'Image' },
      { key: 'seo-metadata', name: 'SEO & Métadonnées', icon: 'Globe' }
    ]
  };

  const handleCreateBlock = (blockType: string) => {
    if (!Array.isArray(pageConfigs)) {
      toast({ title: 'Please log in to manage page content', variant: 'destructive' });
      return;
    }
    
    const selectedPageConfig = pageConfigs && Array.isArray(pageConfigs) ? pageConfigs.find(p => p.pageSlug === selectedPage) : null;
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
      ctaText: defaultData.ctaText,
      ctaUrl: defaultData.ctaUrl,
      iconName: defaultData.iconName || '',
      backgroundColor: defaultData.backgroundColor || 'white',
      configuration: defaultData.configuration || {},
      isActive: true
    });
  };

  const getDefaultContentForBlockType = (blockType: string) => {
    switch (blockType) {
      // Hero Sections
      case 'hero_video':
        return {
          title: 'Discover the Hidden Gems of Krabi',
          subtitle: 'With Expert Local Guides',
          ctaText: 'Explore Tours',
          ctaUrl: '/experiences',
          imageUrl: '/attached_assets/hero-video-optimized.mp4',
          configuration: { hasVideo: true, hasButton: true, overlay: 0.4 }
        };
      case 'hero_banner':
        return {
          title: 'Discover Thailand Experiences',
          subtitle: 'Immerse yourself in authentic Thai culture with our unique experiences',
          imageUrl: 'https://images.unsplash.com/photo-1604159129533-9d35777a0b07?q=80&w=1000&auto=format&fit=crop',
          configuration: { height: '50vh', overlay: 0.5 }
        };
      case 'hero_simple':
        return {
          title: 'Create Your Custom Tour',
          subtitle: "Tell us what you'd like to discover, and we'll create your personalized itinerary.",
          imageUrl: '/uploads/tours/tour-1745996624172-231261635.jpeg',
          configuration: { height: '40vh', overlay: 0.4 }
        };
        
      // Content Sections  
      case 'text_section':
        return {
          title: 'When expats welcome you in their host country',
          content: 'This is a family-run travel agency that combines the organization of exclusive activities with the creation of tailor-made trips throughout the country. Our goal is to offer an immersive experience, far from mass tourism, with personalized service for every traveler — as if we were welcoming our own family or friends.',
          configuration: { centered: true, maxWidth: '4xl' }
        };
      case 'text_image':
        return {
          title: 'Who We Are',
          content: 'We are Éric, Margaux, Gabriel, and Raphaël, a French family living in Krabi, southern Thailand, since 2013. From our life here, we created Amon Tour — a small, independent travel agency built on a simple idea: personally welcome our travelers to Krabi and offer them a different way to experience Thailand.',
          imageUrl: '/family-photo.png',
          configuration: { alignment: 'left', imagePosition: 'right' }
        };
      case 'about_company':
        return {
          title: 'Who We Are',
          content: 'We are Éric, Margaux, Gabriel, and Raphaël, a French family living in Krabi, southern Thailand, since 2013.',
          imageUrl: '/family-photo.png',
          configuration: { showStats: true, layout: '2col' }
        };
        
      // Interactive Sections
      case 'tour_grid':
        return {
          title: 'Our Popular Experiences',
          description: 'Step off the beaten path into carefully curated experiences beyond the tourist trail.',
          configuration: { columns: 3, showFilters: false, limit: 6 }
        };
      case 'cards_grid':
        return {
          title: 'Featured Experiences',
          configuration: { columns: 3, cardType: 'experience' }
        };
      case 'search_bar':
        return {
          title: 'Find Your Perfect Experience',
          description: 'Search through our curated collection of authentic Thai experiences',
          configuration: { placeholder: 'Search experiences...', showFilters: true }
        };
        
      // Features & Layout
      case 'features_3col':
        return {
          title: 'Why Choose Us',
          description: 'Experience an exclusive private day trip with our English or French-speaking and certified guides.',
          configuration: { 
            columns: 3,
            features: [
              { title: 'Private Tours', description: 'Experience an exclusive day trip with our professional guides and private vehicles.', icon: 'users' },
              { title: 'Local Expertise', description: 'Born and raised locals who know every hidden gem and authentic experience.', icon: 'compass' },
              { title: 'Personalized Service', description: 'Tailored experiences designed just for you, away from mass tourism.', icon: 'sparkles' }
            ]
          }
        };
      case 'features_grid':
        return {
          title: 'Why Choose a Custom Tour?',
          configuration: { 
            columns: 3,
            features: [
              { title: 'Flexible Itinerary', description: 'Choose the destinations that interest you and set your own travel pace.', icon: 'map-pin' },
              { title: 'Tailored Accommodations', description: 'Select accommodations that match your preferences and budget.', icon: 'building' },
              { title: 'Personalized Support', description: 'Benefit from expert advice and an English-speaking guide for an authentic experience.', icon: 'headphones' }
            ]
          }
        };
      case 'testimonials':
        return {
          title: 'What Our Travelers Say',
          configuration: { 
            autoplay: true,
            testimonials: [
              { author: 'Sarah M.', text: 'Incredible authentic experience! Amon Tour showed us the real Thailand.', rating: 5 },
              { author: 'Marc L.', text: 'Professional service and amazing local insights. Highly recommended!', rating: 5 }
            ]
          }
        };
        
      // Contact & Forms
      case 'contact_form':
        return {
          title: 'Get in Touch',
          description: 'Ready to start your Thailand adventure? Contact us today.',
          configuration: {
            formType: 'contact',
            fields: [
              { name: 'name', label: 'Full Name', type: 'text', required: true },
              { name: 'email', label: 'Email Address', type: 'email', required: true },
              { name: 'phone', label: 'Phone Number', type: 'tel', required: false },
              { name: 'whatsapp', label: 'WhatsApp Number', type: 'tel', required: false },
              { name: 'line', label: 'LINE ID', type: 'text', required: false },
              { name: 'message', label: 'Message', type: 'textarea', required: true }
            ],
            submitText: 'Send Message'
          }
        };
      case 'contact_cards':
        return {
          title: 'Get In Touch',
          description: "Ready to explore Krabi? Contact us through any of the methods below. Our friendly team is here to answer your questions and help you plan an unforgettable experience.",
          configuration: {
            contacts: [
              { type: 'email', value: 'info@amon-tour.com', icon: 'mail' },
              { type: 'phone', value: '+66 (0)96 216 6559', icon: 'phone' },
              { type: 'whatsapp', value: '+66 65 349 6445', icon: 'message-circle' },
              { type: 'line', value: '@amontour', icon: 'message-circle' }
            ]
          }
        };
      case 'custom_form':
        return {
          title: 'Plan Your Custom Experience',
          description: 'Tell us about your dream Thailand adventure and we will create a personalized itinerary just for you.',
          configuration: { formType: 'custom_tour' }
        };
        
      // Call to Actions
      case 'cta_section':
        return {
          title: 'Ready to Start Your Adventure?',
          description: 'Join thousands of satisfied travelers who discovered Thailand with us.',
          ctaText: 'Book Your Tour Now',
          ctaUrl: '/experiences',
          configuration: { style: 'primary' }
        };
      case 'cta_banner':
        return {
          title: 'Create Your Perfect Custom Tour',
          description: 'Ready for a personalized adventure?',
          ctaText: 'Start Planning',
          ctaUrl: '/custom-tour',
          configuration: { style: 'banner', backgroundColor: '#084F6E' }
        };
        
      // Media & Maps
      case 'map_section':
        return {
          title: 'Find Us in Krabi',
          description: 'Visit our office in Ao Nang or contact us for directions.',
          configuration: { 
            location: { lat: 8.0373, lng: 98.8278 },
            showAddress: true,
            address: 'Ao Nang, Mueang Krabi District, Krabi, Thailand'
          }
        };
      case 'gallery':
        return {
          title: 'Experience Gallery',
          description: 'See the beauty of Thailand through our tours',
          configuration: { columns: 4, showLightbox: true }
        };
      case 'video_section':
        return {
          title: 'Experience Thailand Like Never Before',
          description: 'Watch our latest adventure videos',
          configuration: { autoplay: false, showControls: true }
        };
        
      // Social & Newsletter
      case 'newsletter':
        return {
          title: 'Stay Updated',
          description: 'Get the latest travel tips and exclusive offers from Amon Tour',
          configuration: {
            placeholder: 'Enter your email',
            buttonText: 'Subscribe',
            privacy: 'We respect your privacy and never share your information.'
          }
        };
      case 'social_media':
        return {
          title: 'Follow Our Adventures',
          configuration: {
            platforms: [
              { name: 'facebook', url: 'https://www.facebook.com/amontour' },
              { name: 'instagram', url: 'https://www.instagram.com/amontour' },
              { name: 'youtube', url: 'https://www.youtube.com/amontour' }
            ]
          }
        };
        
      default:
        return {
          title: 'New Block',
          iconName: '',
          backgroundColor: 'white',
          configuration: {}
        };
    }
  };

  const getSiteSetting = (section: string, key: string) => {
    if (!siteSettings || !Array.isArray(siteSettings)) {
      return '';
    }
    return siteSettings.find(s => s.section === section && s.key === key)?.value || '';
  };

  const updateSiteSetting = (section: string, key: string, value: string) => {
    updateSiteSettingMutation.mutate({ section, key, value });
  };

  const getBlockIcon = (blockType: string) => {
    switch (blockType) {
      // Hero Sections
      case 'hero_video': return <Video className="w-4 h-4" />;
      case 'hero_banner': return <Image className="w-4 h-4" />;
      case 'hero_simple': return <Star className="w-4 h-4" />;
      
      // Content Sections
      case 'text_section': return <Type className="w-4 h-4" />;
      case 'text_image': return <FileText className="w-4 h-4" />;
      case 'about_company': return <Users className="w-4 h-4" />;
      
      // Interactive Sections
      case 'tour_grid': return <Layout className="w-4 h-4" />;
      case 'cards_grid': return <Layout className="w-4 h-4" />;
      case 'search_bar': return <Search className="w-4 h-4" />;
      
      // Features & Layout
      case 'features_3col': return <Settings className="w-4 h-4" />;
      case 'features_grid': return <Settings className="w-4 h-4" />;
      case 'testimonials': return <Users className="w-4 h-4" />;
      
      // Contact & Forms
      case 'contact_form': return <Mail className="w-4 h-4" />;
      case 'contact_cards': return <Mail className="w-4 h-4" />;
      case 'custom_form': return <FileText className="w-4 h-4" />;
      
      // Call to Actions
      case 'cta_section': return <Download className="w-4 h-4" />;
      case 'cta_banner': return <Bell className="w-4 h-4" />;
      
      // Media & Maps
      case 'map_section': return <MapPin className="w-4 h-4" />;
      case 'gallery': return <Camera className="w-4 h-4" />;
      case 'video_section': return <Video className="w-4 h-4" />;
      
      // Social & Newsletter
      case 'newsletter': return <Mail className="w-4 h-4" />;
      case 'social_media': return <Globe className="w-4 h-4" />;
      
      // Legacy support
      case 'hero': return <Star className="w-4 h-4" />;
      
      default: return <Layout className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-2 pb-4 sm:px-4 sm:pb-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:justify-between">
            <div className="w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2 sm:gap-3">
                <Palette className="h-6 w-6 sm:h-7 sm:w-7 text-primary flex-shrink-0" />
                <span className="truncate">Apparence du Site</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600">Personnalisez le thème, les pages et le pied de page de votre site</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setLocation('/admin')}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à l'Admin</span>
            </Button>
          </div>
        </div>

        {/* Main Navigation */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="theme" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-base sm:text-lg font-semibold">
              <Palette className="w-4 h-4 flex-shrink-0" />
              <span>Thème</span>
            </TabsTrigger>
            <TabsTrigger value="pages" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-base sm:text-lg font-semibold">
              <Layout className="w-4 h-4 flex-shrink-0" />
              <span>Pages</span>
            </TabsTrigger>
            <TabsTrigger value="footer" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-base sm:text-lg font-semibold">
              <Settings className="w-4 h-4 flex-shrink-0" />
              <span>Pied de page</span>
            </TabsTrigger>
          </TabsList>

          {/* Theme Management */}
          <TabsContent value="theme">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Theme Section Selector */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Palette className="w-4 h-4" />
                    Thème
                  </CardTitle>
                  <CardDescription>Personnalisez le style du site</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Theme Categories with Dropdown */}
                    {Object.entries(themeCategories).map(([categoryName, sections]) => (
                      <div key={categoryName} className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full justify-start text-sm h-8"
                          onClick={() => toggleThemeCategory(categoryName)}
                        >
                          <Palette className="w-4 h-4 mr-2" />
                          <span className="flex-1 text-left">{categoryName}</span>
                          <ChevronDown 
                            className={`w-4 h-4 transition-transform ${
                              expandedThemeCategories.includes(categoryName) ? 'rotate-180' : ''
                            }`}
                          />
                        </Button>
                        {expandedThemeCategories.includes(categoryName) && (
                          <div className="space-y-2 ml-2">
                            {sections.map((section) => (
                              <Button
                                key={section.key}
                                variant={selectedThemeSection === section.key ? 'default' : 'outline'}
                                className="w-full justify-start text-sm h-8"
                                onClick={() => setSelectedThemeSection(section.key)}
                              >
                                {section.icon === 'Palette' && <Palette className="w-4 h-4 mr-2" />}
                                {section.icon === 'Type' && <Type className="w-4 h-4 mr-2" />}
                                {section.icon === 'MousePointer' && <MousePointer className="w-4 h-4 mr-2" />}
                                {section.icon === 'Bell' && <Bell className="w-4 h-4 mr-2" />}
                                {section.icon === 'Image' && <Image className="w-4 h-4 mr-2" />}
                                {section.icon === 'Globe' && <Globe className="w-4 h-4 mr-2" />}
                                {section.name}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Theme Section Content */}
              <div className="lg:col-span-3">
                {selectedThemeSection === 'colors' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Palette className="w-4 h-4" />
                        Couleurs
                      </CardTitle>
                      <CardDescription>Personnalisez les couleurs principales et étendues de votre site</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="primary-color">Couleur primaire</Label>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mt-2">
                          <Input
                            id="primary-color"
                            type="color"
                            value={tempColors?.primary_color || getSiteSetting('theme', 'primary_color') || '#084F6E'}
                            onChange={(e) => setTempColors((prev: any) => ({ ...prev, primary_color: e.target.value }))}
                            className="w-20 h-10"
                          />
                          <Input
                            value={tempColors?.primary_color || getSiteSetting('theme', 'primary_color') || '#084F6E'}
                            onChange={(e) => setTempColors((prev: any) => ({ ...prev, primary_color: e.target.value }))}
                            placeholder="#084F6E"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="secondary-color">Couleur secondaire</Label>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mt-2">
                          <Input
                            id="secondary-color"
                            type="color"
                            value={tempColors?.secondary_color || getSiteSetting('theme', 'secondary_color') || '#3BA8AF'}
                            onChange={(e) => setTempColors((prev: any) => ({ ...prev, secondary_color: e.target.value }))}
                            className="w-20 h-10"
                          />
                          <Input
                            value={tempColors?.secondary_color || getSiteSetting('theme', 'secondary_color') || '#3BA8AF'}
                            onChange={(e) => setTempColors((prev: any) => ({ ...prev, secondary_color: e.target.value }))}
                            placeholder="#3BA8AF"
                          />
                        </div>
                      </div>
                      
                      {/* Extended Color Palette */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg mb-4">
                          <Palette className="w-4 h-4" />
                          Extended Color Palette
                        </CardTitle>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Text Color</Label>
                            <Input
                              type="color"
                              value={(tempColors?.color_palette || JSON.parse(getSiteSetting('theme', 'color_palette') || '{"text": "#374151"}')).text}
                              onChange={(e) => {
                                const currentPalette = tempColors?.color_palette || JSON.parse(getSiteSetting('theme', 'color_palette') || '{"text": "#374151"}');
                                setTempColors((prev: any) => ({ ...prev, color_palette: {...currentPalette, text: e.target.value} }));
                              }}
                            />
                          </div>
                          <div>
                            <Label>Couleur de fond</Label>
                            <Input
                              type="color"
                              value={(tempColors?.color_palette || JSON.parse(getSiteSetting('theme', 'color_palette') || '{"background": "#ffffff"}')).background}
                              onChange={(e) => {
                                const currentPalette = tempColors?.color_palette || JSON.parse(getSiteSetting('theme', 'color_palette') || '{"background": "#ffffff"}');
                                setTempColors((prev: any) => ({ ...prev, color_palette: {...currentPalette, background: e.target.value} }));
                              }}
                            />
                          </div>
                          <div>
                            <Label>Text Menu</Label>
                            <Input
                              type="color"
                              value={(tempColors?.color_palette || JSON.parse(getSiteSetting('theme', 'color_palette') || '{"textMenu": "#374151"}')).textMenu || '#374151'}
                              onChange={(e) => {
                                const currentPalette = tempColors?.color_palette || JSON.parse(getSiteSetting('theme', 'color_palette') || '{"textFooter": "#ffffff", "backgroundFooter": "#000000", "textMenu": "#374151", "backgroundMenu": "#ffffff"}');
                                setTempColors((prev: any) => ({ ...prev, color_palette: {...currentPalette, textMenu: e.target.value} }));
                              }}
                            />
                          </div>
                          <div>
                            <Label>Background Menu</Label>
                            <Input
                              type="color"
                              value={(tempColors?.color_palette || JSON.parse(getSiteSetting('theme', 'color_palette') || '{"backgroundMenu": "#ffffff"}')).backgroundMenu || '#ffffff'}
                              onChange={(e) => {
                                const currentPalette = tempColors?.color_palette || JSON.parse(getSiteSetting('theme', 'color_palette') || '{"textFooter": "#ffffff", "backgroundFooter": "#000000", "textMenu": "#374151", "backgroundMenu": "#ffffff"}');
                                setTempColors((prev: any) => ({ ...prev, color_palette: {...currentPalette, backgroundMenu: e.target.value} }));
                              }}
                            />
                          </div>
                          <div>
                            <Label>Text Footer</Label>
                            <Input
                              type="color"
                              value={(tempColors?.color_palette || JSON.parse(getSiteSetting('theme', 'color_palette') || '{"textFooter": "#ffffff"}')).textFooter || '#ffffff'}
                              onChange={(e) => {
                                const currentPalette = tempColors?.color_palette || JSON.parse(getSiteSetting('theme', 'color_palette') || '{"textFooter": "#ffffff", "backgroundFooter": "#000000", "textMenu": "#374151", "backgroundMenu": "#ffffff"}');
                                setTempColors((prev: any) => ({ ...prev, color_palette: {...currentPalette, textFooter: e.target.value} }));
                              }}
                            />
                          </div>
                          <div>
                            <Label>Background Footer</Label>
                            <Input
                              type="color"
                              value={(tempColors?.color_palette || JSON.parse(getSiteSetting('theme', 'color_palette') || '{"backgroundFooter": "#000000"}')).backgroundFooter || '#000000'}
                              onChange={(e) => {
                                const currentPalette = tempColors?.color_palette || JSON.parse(getSiteSetting('theme', 'color_palette') || '{"textFooter": "#ffffff", "backgroundFooter": "#000000", "textMenu": "#374151", "backgroundMenu": "#ffffff"}');
                                setTempColors((prev: any) => ({ ...prev, color_palette: {...currentPalette, backgroundFooter: e.target.value} }));
                              }}
                            />
                          </div>
                          <div>
                            <Label>Error Color</Label>
                            <Input
                              type="color"
                              value={(tempColors?.color_palette || JSON.parse(getSiteSetting('theme', 'color_palette') || '{"error": "#ef4444"}')).error}
                              onChange={(e) => {
                                const currentPalette = tempColors?.color_palette || JSON.parse(getSiteSetting('theme', 'color_palette') || '{"error": "#ef4444"}');
                                setTempColors((prev: any) => ({ ...prev, color_palette: {...currentPalette, error: e.target.value} }));
                              }}
                            />
                          </div>
                          <div>
                            <Label>Success Color</Label>
                            <Input
                              type="color"
                              value={(tempColors?.color_palette || JSON.parse(getSiteSetting('theme', 'color_palette') || '{"success": "#10b981"}')).success}
                              onChange={(e) => {
                                const currentPalette = tempColors?.color_palette || JSON.parse(getSiteSetting('theme', 'color_palette') || '{"success": "#10b981"}');
                                setTempColors((prev: any) => ({ ...prev, color_palette: {...currentPalette, success: e.target.value} }));
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Save Button */}
                      <div className="flex justify-end pt-4">
                        <Button 
                          onClick={saveColors} 
                          disabled={!tempColors}
                          className="bg-secondary hover:bg-secondary/90"
                        >
                          💾 Sauvegarder Couleurs
                        </Button>
                      </div>

                      {/* Colors Preview */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-4">
                          <Palette className="w-4 h-4" />
                          <h3 className="text-base font-semibold">Color Preview</h3>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="grid grid-cols-4 gap-3">
                            <div className="text-center">
                              <div 
                                className="w-12 h-12 rounded-lg mx-auto mb-2 border-2 border-gray-300"
                                style={{ backgroundColor: tempColors?.primary_color || getSiteSetting('theme', 'primary_color') || '#084F6E' }}
                              ></div>
                              <p className="text-xs font-medium">Primary</p>
                            </div>
                            <div className="text-center">
                              <div 
                                className="w-12 h-12 rounded-lg mx-auto mb-2 border-2 border-gray-300"
                                style={{ backgroundColor: tempColors?.secondary_color || getSiteSetting('theme', 'secondary_color') || '#3BA8AF' }}
                              ></div>
                              <p className="text-xs font-medium">Secondary</p>
                            </div>
                            <div className="text-center">
                              <div 
                                className="w-12 h-12 rounded-lg mx-auto mb-2 border-2 border-gray-300"
                                style={{ backgroundColor: (tempColors?.color_palette || JSON.parse(getSiteSetting('theme', 'color_palette') || '{"textFooter": "#ffffff", "backgroundFooter": "#000000"}')).backgroundFooter }}
                              ></div>
                              <p className="text-xs font-medium">Footer BG</p>
                            </div>
                            <div className="text-center">
                              <div 
                                className="w-12 h-12 rounded-lg mx-auto mb-2 border-2 border-gray-300"
                                style={{ backgroundColor: (tempColors?.color_palette || JSON.parse(getSiteSetting('theme', 'color_palette') || '{"textMenu": "#374151", "backgroundMenu": "#ffffff"}')).backgroundMenu }}
                              ></div>
                              <p className="text-xs font-medium">Menu BG</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedThemeSection === 'announcements' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                          <Bell className="w-4 h-4" />
                          Barre d'annonces
                        </CardTitle>
                        <CardDescription>Barre de notification en haut (barre jaune actuelle)</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="notification-enabled"
                            checked={tempNotificationBar?.enabled ?? JSON.parse(getSiteSetting('theme', 'notification_bar') || '{"enabled": true}').enabled}
                            onCheckedChange={(checked) => {
                              setTempNotificationBar((prev: any) => ({ ...prev, enabled: checked }));
                            }}
                          />
                          <Label htmlFor="notification-enabled">Activer la barre de notification</Label>
                        </div>
                        <div>
                          <Label>Texte de notification</Label>
                          <Input
                            placeholder="📢 L'ancien site Amon Tour est toujours en ligne sur www.Amon-Tour.fr"
                            value={tempNotificationBar?.text || JSON.parse(getSiteSetting('theme', 'notification_bar') || '{"text": "📢 L\'ancien site Amon Tour est toujours en ligne sur www.Amon-Tour.fr"}').text}
                            onChange={(e) => {
                              setTempNotificationBar((prev: any) => ({ ...prev, text: e.target.value }));
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Couleur de fond</Label>
                            <div className="flex items-center gap-3">
                              <Input
                                type="color"
                                value={tempNotificationBar?.background_color || JSON.parse(getSiteSetting('theme', 'notification_bar') || '{"background_color": "#f5c400"}').background_color}
                                onChange={(e) => {
                                  setTempNotificationBar((prev: any) => ({ ...prev, background_color: e.target.value }));
                                }}
                                className="w-20"
                              />
                              <Input
                                value={tempNotificationBar?.background_color || JSON.parse(getSiteSetting('theme', 'notification_bar') || '{"background_color": "#f5c400"}').background_color}
                                onChange={(e) => {
                                  setTempNotificationBar((prev: any) => ({ ...prev, background_color: e.target.value }));
                                }}
                                placeholder="#f5c400"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Text Color</Label>
                            <div className="flex items-center gap-3">
                              <Input
                                type="color"
                                value={tempNotificationBar?.text_color || JSON.parse(getSiteSetting('theme', 'notification_bar') || '{"text_color": "#000000"}').text_color}
                                onChange={(e) => {
                                  setTempNotificationBar((prev: any) => ({ ...prev, text_color: e.target.value }));
                                }}
                                className="w-20"
                              />
                              <Input
                                value={tempNotificationBar?.text_color || JSON.parse(getSiteSetting('theme', 'notification_bar') || '{"text_color": "#000000"}').text_color}
                                onChange={(e) => {
                                  setTempNotificationBar((prev: any) => ({ ...prev, text_color: e.target.value }));
                                }}
                                placeholder="#000000"
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Save Button */}
                        <div className="flex justify-end pt-4">
                          <Button 
                            onClick={saveNotificationBar} 
                            disabled={!tempNotificationBar}
                            className="bg-secondary hover:bg-secondary/90"
                          >
                            💾 Sauvegarder Announcement Bar
                          </Button>
                        </div>
                        
                        {/* Announcement Bar Preview */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <div className="flex items-center gap-2 mb-4">
                            <Bell className="w-4 h-4" />
                            <h3 className="text-base font-semibold">Announcement Bar Preview</h3>
                          </div>
                          <div className="bg-gray-100 p-4 rounded-lg">
                            {JSON.parse(getSiteSetting('theme', 'notification_bar') || '{"enabled": true}').enabled ? (
                              <div 
                                className="py-2 px-4 text-center text-sm font-medium rounded"
                                style={{
                                  backgroundColor: JSON.parse(getSiteSetting('theme', 'notification_bar') || '{"background_color": "#f5c400"}').background_color,
                                  color: JSON.parse(getSiteSetting('theme', 'notification_bar') || '{"text_color": "#000000"}').text_color
                                }}
                              >
                                {JSON.parse(getSiteSetting('theme', 'notification_bar') || '{"text": "📢 L\'ancien site Amon Tour est toujours en ligne sur www.Amon-Tour.fr"}').text || "Votre message d'annonce apparaîtra ici"}
                              </div>
                            ) : (
                              <div className="text-center text-gray-500 py-4">
                                Barre d'annonce désactivée
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {selectedThemeSection === 'typography' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Type className="w-4 h-4" />
                        Typographie
                      </CardTitle>
                      <CardDescription>Familles de polices et styles de texte</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Police des titres</Label>
                        <Select 
                          value={tempTypography?.heading_font || JSON.parse(getSiteSetting('theme', 'typography') || '{"heading_font": "Poppins"}').heading_font}
                          onValueChange={(value) => {
                            setTempTypography((prev: any) => ({ ...prev, heading_font: value }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select heading font" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Poppins">Poppins</SelectItem>
                            <SelectItem value="Inter">Inter</SelectItem>
                            <SelectItem value="Roboto">Roboto</SelectItem>
                            <SelectItem value="Open Sans">Open Sans</SelectItem>
                            <SelectItem value="Montserrat">Montserrat</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Police du texte</Label>
                        <Select 
                          value={tempTypography?.body_font || JSON.parse(getSiteSetting('theme', 'typography') || '{"body_font": "Inter"}').body_font}
                          onValueChange={(value) => {
                            setTempTypography((prev: any) => ({ ...prev, body_font: value }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select body font" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Inter">Inter</SelectItem>
                            <SelectItem value="Poppins">Poppins</SelectItem>
                            <SelectItem value="Roboto">Roboto</SelectItem>
                            <SelectItem value="Open Sans">Open Sans</SelectItem>
                            <SelectItem value="Lato">Lato</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Heading Weight</Label>
                          <Select 
                            value={tempTypography?.heading_weight || JSON.parse(getSiteSetting('theme', 'typography') || '{"heading_weight": "600"}').heading_weight}
                            onValueChange={(value) => {
                              setTempTypography((prev: any) => ({ ...prev, heading_weight: value }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="400">Normal (400)</SelectItem>
                              <SelectItem value="500">Medium (500)</SelectItem>
                              <SelectItem value="600">Semi-bold (600)</SelectItem>
                              <SelectItem value="700">Bold (700)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Body Weight</Label>
                          <Select 
                            value={tempTypography?.body_weight || JSON.parse(getSiteSetting('theme', 'typography') || '{"body_weight": "400"}').body_weight}
                            onValueChange={(value) => {
                              setTempTypography((prev: any) => ({ ...prev, body_weight: value }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="300">Light (300)</SelectItem>
                              <SelectItem value="400">Normal (400)</SelectItem>
                              <SelectItem value="500">Medium (500)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Base Size</Label>
                          <Select 
                            value={tempTypography?.base_size || JSON.parse(getSiteSetting('theme', 'typography') || '{"base_size": "16px"}').base_size}
                            onValueChange={(value) => {
                              setTempTypography((prev: any) => ({ ...prev, base_size: value }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="14px">14px</SelectItem>
                              <SelectItem value="16px">16px</SelectItem>
                              <SelectItem value="18px">18px</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {/* Save Button */}
                      <div className="flex justify-end pt-4">
                        <Button 
                          onClick={saveTypography} 
                          disabled={!tempTypography}
                          className="bg-secondary hover:bg-secondary/90"
                        >
                          💾 Sauvegarder Typography
                        </Button>
                      </div>
                      
                      {/* Typography Preview */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-4">
                          <Type className="w-4 h-4" />
                          <h3 className="text-base font-semibold">Preview</h3>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                          <div 
                            style={{ 
                              fontFamily: tempTypography?.heading_font || JSON.parse(getSiteSetting('theme', 'typography') || '{"heading_font": "Poppins"}').heading_font,
                              fontWeight: tempTypography?.heading_weight || JSON.parse(getSiteSetting('theme', 'typography') || '{"heading_weight": "600"}').heading_weight,
                              fontSize: '24px'
                            }}
                          >
                            Bienvenue chez Amon Tour
                          </div>
                          <div 
                            style={{ 
                              fontFamily: tempTypography?.body_font || JSON.parse(getSiteSetting('theme', 'typography') || '{"body_font": "Inter"}').body_font,
                              fontWeight: tempTypography?.body_weight || JSON.parse(getSiteSetting('theme', 'typography') || '{"body_weight": "400"}').body_weight,
                              fontSize: tempTypography?.base_size || JSON.parse(getSiteSetting('theme', 'typography') || '{"base_size": "16px"}').base_size
                            }}
                          >
                            Découvrez les trésors cachés de Krabi et du sud de la Thaïlande avec nos expériences authentiques et personnalisées.
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedThemeSection === 'button-styles' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <MousePointer className="w-4 h-4" />
                        Styles de boutons
                      </CardTitle>
                      <CardDescription>Personnalisez l'apparence et le comportement des boutons</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Border Radius</Label>
                        <Select 
                          value={tempButtonStyles?.border_radius || JSON.parse(getSiteSetting('theme', 'button_styles') || '{"border_radius": "8px"}').border_radius}
                          onValueChange={(value) => {
                            setTempButtonStyles((prev: any) => ({ ...prev, border_radius: value }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0px">None (0px)</SelectItem>
                            <SelectItem value="4px">Small (4px)</SelectItem>
                            <SelectItem value="8px">Medium (8px)</SelectItem>
                            <SelectItem value="12px">Large (12px)</SelectItem>
                            <SelectItem value="50px">Pill (50px)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Shadow Style</Label>
                        <Select 
                          value={tempButtonStyles?.shadow || JSON.parse(getSiteSetting('theme', 'button_styles') || '{"shadow": "medium"}').shadow}
                          onValueChange={(value) => {
                            setTempButtonStyles((prev: any) => ({ ...prev, shadow: value }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Shadow</SelectItem>
                            <SelectItem value="small">Small Shadow</SelectItem>
                            <SelectItem value="medium">Medium Shadow</SelectItem>
                            <SelectItem value="large">Large Shadow</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Hover Effect</Label>
                        <Select 
                          value={tempButtonStyles?.hover_effect || JSON.parse(getSiteSetting('theme', 'button_styles') || '{"hover_effect": "scale"}').hover_effect}
                          onValueChange={(value) => {
                            setTempButtonStyles((prev: any) => ({ ...prev, hover_effect: value }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="scale">Scale Up</SelectItem>
                            <SelectItem value="fade">Fade</SelectItem>
                            <SelectItem value="shadow">Shadow Grow</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Save Button */}
                      <div className="flex justify-end pt-4">
                        <Button 
                          onClick={saveButtonStyles} 
                          disabled={!tempButtonStyles}
                          className="bg-secondary hover:bg-secondary/90"
                        >
                          💾 Sauvegarder Button Styles
                        </Button>
                      </div>
                      
                      {/* Button Styles Preview */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-4">
                          <MousePointer className="w-4 h-4" />
                          <h3 className="text-base font-semibold">Button Preview</h3>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                          <div className="flex flex-wrap gap-3">
                            <button 
                              className="px-4 py-2 text-white transition-all"
                              style={{
                                backgroundColor: tempColors?.primary_color || getSiteSetting('theme', 'primary_color') || '#084F6E',
                                borderRadius: tempButtonStyles?.border_radius || JSON.parse(getSiteSetting('theme', 'button_styles') || '{"border_radius": "8px"}').border_radius,
                                boxShadow: (() => {
                                  const shadowStyle = tempButtonStyles?.shadow || JSON.parse(getSiteSetting('theme', 'button_styles') || '{"shadow": "medium"}').shadow;
                                  const shadows = {
                                    'none': 'none',
                                    'small': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                                    'medium': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    'large': '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                  };
                                  return shadows[shadowStyle as keyof typeof shadows] || '0 4px 6px -1px rgb(0 0 0 / 0.1)';
                                })()
                              }}
                            >
                              Primary Button
                            </button>
                            <button 
                              className="px-4 py-2 border-2 transition-all"
                              style={{
                                borderColor: getSiteSetting('theme', 'primary_color') || '#084F6E',
                                color: getSiteSetting('theme', 'primary_color') || '#084F6E',
                                borderRadius: JSON.parse(getSiteSetting('theme', 'button_styles') || '{"border_radius": "8px"}').border_radius
                              }}
                            >
                              Outline Button
                            </button>
                            <button 
                              className="px-4 py-2 text-white transition-all"
                              style={{
                                backgroundColor: getSiteSetting('theme', 'secondary_color') || '#3BA8AF',
                                borderRadius: JSON.parse(getSiteSetting('theme', 'button_styles') || '{"border_radius": "8px"}').border_radius
                              }}
                            >
                              Secondary Button
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedThemeSection === 'seo-metadata' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Globe className="w-4 h-4" />
                        SEO & Métadonnées
                      </CardTitle>
                      <CardDescription>Paramètres SEO globaux et métadonnées des réseaux sociaux</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Site Title</Label>
                        <Input
                          placeholder="Amon Tour - Authentic Thailand Travel Experience"
                          value={JSON.parse(getSiteSetting('theme', 'seo_meta') || '{"site_title": ""}').site_title}
                          onChange={(e) => {
                            const current = JSON.parse(getSiteSetting('theme', 'seo_meta') || '{"site_title": ""}');
                            updateSiteSetting('theme', 'seo_meta', JSON.stringify({...current, site_title: e.target.value}));
                          }}
                        />
                      </div>
                      <div>
                        <Label>Tagline</Label>
                        <Input
                          placeholder="Discover the hidden gems of Krabi and southern Thailand"
                          value={JSON.parse(getSiteSetting('theme', 'seo_meta') || '{"tagline": ""}').tagline}
                          onChange={(e) => {
                            const current = JSON.parse(getSiteSetting('theme', 'seo_meta') || '{"tagline": ""}');
                            updateSiteSetting('theme', 'seo_meta', JSON.stringify({...current, tagline: e.target.value}));
                          }}
                        />
                      </div>
                      <div>
                        <Label>Meta Description</Label>
                        <Textarea
                          placeholder="Experience authentic Thailand with Amon Tour. Discover Krabi's hidden islands, local culture, and unforgettable adventures."
                          value={JSON.parse(getSiteSetting('theme', 'seo_meta') || '{"meta_description": ""}').meta_description}
                          onChange={(e) => {
                            const current = JSON.parse(getSiteSetting('theme', 'seo_meta') || '{"meta_description": ""}');
                            updateSiteSetting('theme', 'seo_meta', JSON.stringify({...current, meta_description: e.target.value}));
                          }}
                        />
                      </div>
                      <div>
                        <Label>Keywords (comma-separated)</Label>
                        <Input
                          placeholder="Thailand travel, Krabi tours, authentic Thailand, island hopping"
                          value={JSON.parse(getSiteSetting('theme', 'seo_meta') || '{"meta_keywords": ""}').meta_keywords}
                          onChange={(e) => {
                            const current = JSON.parse(getSiteSetting('theme', 'seo_meta') || '{"meta_keywords": ""}');
                            updateSiteSetting('theme', 'seo_meta', JSON.stringify({...current, meta_keywords: e.target.value}));
                          }}
                        />
                      </div>
                      <div>
                        <Label>Open Graph Image URL</Label>
                        <Input
                          placeholder="/src/assets/hero-image.jpg"
                          value={JSON.parse(getSiteSetting('theme', 'seo_meta') || '{"og_image": ""}').og_image}
                          onChange={(e) => {
                            const current = JSON.parse(getSiteSetting('theme', 'seo_meta') || '{"og_image": ""}');
                            updateSiteSetting('theme', 'seo_meta', JSON.stringify({...current, og_image: e.target.value}));
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedThemeSection === 'logo-favicon' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Image className="w-4 h-4" />
                        Logo & Favicon
                      </CardTitle>
                      <CardDescription>Gérez les logos individuels avec téléchargement/lien et contrôles de taille</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Header Logo */}
                      <div className="border rounded-lg p-4">
                        <Label className="text-base font-semibold mb-3 block">Header Logo</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Image URL/Path</Label>
                            <Input
                              placeholder="/src/assets/logo-amon.png"
                              value={tempLogoSettings?.header_logo || JSON.parse(getSiteSetting('theme', 'logo_settings') || '{"header_logo": "/src/assets/logo-amon.png"}').header_logo}
                              onChange={(e) => {
                                setTempLogoSettings((prev: any) => ({ ...prev, header_logo: e.target.value }));
                              }}
                            />
                          </div>
                          <div>
                            <Label>Size</Label>
                            <Select 
                              value={tempLogoSettings?.header_logo_height || JSON.parse(getSiteSetting('theme', 'logo_settings') || '{"header_logo_height": "96px"}').header_logo_height}
                              onValueChange={(value) => {
                                setTempLogoSettings((prev: any) => ({ ...prev, header_logo_height: value }));
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="32px">Small (32px)</SelectItem>
                                <SelectItem value="48px">Medium (48px)</SelectItem>
                                <SelectItem value="64px">Large (64px)</SelectItem>
                                <SelectItem value="96px">X-Large (96px)</SelectItem>
                                <SelectItem value="128px">XX-Large (128px)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Footer Logo */}
                      <div className="border rounded-lg p-4">
                        <Label className="text-base font-semibold mb-3 block">Footer Logo</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Image URL/Path</Label>
                            <Input
                              placeholder="/src/assets/logo-amon.png"
                              value={tempLogoSettings?.footer_logo || JSON.parse(getSiteSetting('theme', 'logo_settings') || '{"footer_logo": "/src/assets/logo-amon.png"}').footer_logo}
                              onChange={(e) => {
                                setTempLogoSettings((prev: any) => ({ ...prev, footer_logo: e.target.value }));
                              }}
                            />
                          </div>
                          <div>
                            <Label>Size</Label>
                            <Select 
                              value={tempLogoSettings?.footer_logo_height || JSON.parse(getSiteSetting('theme', 'logo_settings') || '{"footer_logo_height": "64px"}').footer_logo_height}
                              onValueChange={(value) => {
                                setTempLogoSettings((prev: any) => ({ ...prev, footer_logo_height: value }));
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="24px">Small (24px)</SelectItem>
                                <SelectItem value="32px">Medium (32px)</SelectItem>
                                <SelectItem value="48px">Large (48px)</SelectItem>
                                <SelectItem value="64px">X-Large (64px)</SelectItem>
                                <SelectItem value="96px">XX-Large (96px)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Favicon Logo */}
                      <div className="border rounded-lg p-4">
                        <Label className="text-base font-semibold mb-3 block">Favicon Logo</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Image URL/Path</Label>
                            <Input
                              placeholder="/favicon.ico"
                              value={tempLogoSettings?.favicon || JSON.parse(getSiteSetting('theme', 'logo_settings') || '{"favicon": "/favicon.ico"}').favicon}
                              onChange={(e) => {
                                setTempLogoSettings((prev: any) => ({ ...prev, favicon: e.target.value }));
                              }}
                            />
                          </div>
                          <div>
                            <Label>Size</Label>
                            <Select 
                              value={tempLogoSettings?.favicon_size || JSON.parse(getSiteSetting('theme', 'logo_settings') || '{"favicon_size": "32px"}').favicon_size}
                              onValueChange={(value) => {
                                setTempLogoSettings((prev: any) => ({ ...prev, favicon_size: value }));
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="16px">16x16px</SelectItem>
                                <SelectItem value="24px">24x24px</SelectItem>
                                <SelectItem value="32px">32x32px</SelectItem>
                                <SelectItem value="48px">48x48px</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      
                      {/* Save Button */}
                      <div className="flex justify-end pt-4">
                        <Button 
                          onClick={saveLogoSettings} 
                          disabled={!tempLogoSettings}
                          className="bg-secondary hover:bg-secondary/90"
                        >
                          💾 Sauvegarder Logo Settings
                        </Button>
                      </div>
                      
                      {/* Enhanced Logo Preview */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-4">
                          <Image className="w-4 h-4" />
                          <h3 className="text-base font-semibold">Logo Preview</h3>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-6">
                          {/* Header Logo Preview */}
                          <div className="bg-white p-4 rounded border">
                            <p className="text-sm font-medium mb-2">Header Logo</p>
                            <div className="flex items-center justify-center min-h-[100px] bg-gray-50 rounded">
                              {JSON.parse(getSiteSetting('theme', 'logo_settings') || '{"header_logo": "/src/assets/logo-amon.png"}').header_logo ? (
                                <img 
                                  src={JSON.parse(getSiteSetting('theme', 'logo_settings') || '{"header_logo": "/src/assets/logo-amon.png"}').header_logo.startsWith('/src/') ? logoAmon : JSON.parse(getSiteSetting('theme', 'logo_settings') || '{"header_logo": "/src/assets/logo-amon.png"}').header_logo}
                                  alt="Header Logo" 
                                  style={{ 
                                    height: JSON.parse(getSiteSetting('theme', 'logo_settings') || '{"header_logo_height": "96px"}').header_logo_height,
                                    width: 'auto'
                                  }}
                                />
                              ) : (
                                <div className="text-gray-400 text-sm">Aucun logo header défini</div>
                              )}
                            </div>
                          </div>

                          {/* Footer Logo Preview */}
                          <div className="bg-black p-4 rounded border">
                            <p className="text-sm font-medium mb-2 text-white">Footer Logo</p>
                            <div className="flex items-center justify-center min-h-[80px] bg-gray-800 rounded">
                              {JSON.parse(getSiteSetting('theme', 'logo_settings') || '{"footer_logo": "/src/assets/logo-amon.png"}').footer_logo ? (
                                <img 
                                  src={JSON.parse(getSiteSetting('theme', 'logo_settings') || '{"footer_logo": "/src/assets/logo-amon.png"}').footer_logo.startsWith('/src/') ? logoAmon : JSON.parse(getSiteSetting('theme', 'logo_settings') || '{"footer_logo": "/src/assets/logo-amon.png"}').footer_logo}
                                  alt="Footer Logo" 
                                  style={{ 
                                    height: JSON.parse(getSiteSetting('theme', 'logo_settings') || '{"footer_logo_height": "64px"}').footer_logo_height,
                                    width: 'auto'
                                  }}
                                />
                              ) : (
                                <div className="text-gray-400 text-sm">Aucun logo footer défini</div>
                              )}
                            </div>
                          </div>

                          {/* Favicon Logo Preview */}
                          <div className="bg-white p-4 rounded border">
                            <p className="text-sm font-medium mb-2">Favicon Logo</p>
                            <div className="flex items-center justify-center min-h-[60px] bg-gray-100 rounded">
                              {(tempLogoSettings?.favicon || JSON.parse(getSiteSetting('theme', 'logo_settings') || '{"favicon": "/favicon.ico"}').favicon) ? (
                                <img 
                                  src={(tempLogoSettings?.favicon || JSON.parse(getSiteSetting('theme', 'logo_settings') || '{"favicon": "/favicon.ico"}').favicon).startsWith('/src/') ? logoAmon : (tempLogoSettings?.favicon || JSON.parse(getSiteSetting('theme', 'logo_settings') || '{"favicon": "/favicon.ico"}').favicon)}
                                  alt="Favicon" 
                                  style={{ 
                                    height: tempLogoSettings?.favicon_size || JSON.parse(getSiteSetting('theme', 'logo_settings') || '{"favicon_size": "32px"}').favicon_size,
                                    width: tempLogoSettings?.favicon_size || JSON.parse(getSiteSetting('theme', 'logo_settings') || '{"favicon_size": "32px"}').favicon_size
                                  }}
                                />
                              ) : (
                                <div className="text-gray-400 text-sm">Aucun favicon défini</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedThemeSection === 'backgrounds' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Bell className="w-4 h-4" />
                        Pop-up Announcements
                      </CardTitle>
                      <CardDescription>Promotional pop-ups and announcements</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="popup-enabled"
                          checked={JSON.parse(getSiteSetting('theme', 'popup_settings') || '{"enabled": false}').enabled}
                          onCheckedChange={(checked) => {
                            const current = JSON.parse(getSiteSetting('theme', 'popup_settings') || '{"enabled": false}');
                            updateSiteSetting('theme', 'popup_settings', JSON.stringify({...current, enabled: checked}));
                          }}
                        />
                        <Label htmlFor="popup-enabled">Enable Pop-ups</Label>
                      </div>
                      <div>
                        <Label>Pop-up Type</Label>
                        <Select 
                          value={tempPopupSettings?.type || JSON.parse(getSiteSetting('theme', 'popup_settings') || '{"type": "newsletter"}').type}
                          onValueChange={(value) => {
                            setTempPopupSettings((prev: any) => ({ ...prev, type: value }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newsletter">Newsletter Signup</SelectItem>
                            <SelectItem value="promotion">Special Promotion</SelectItem>
                            <SelectItem value="announcement">General Announcement</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Title</Label>
                        <Input
                          placeholder="Special Offer!"
                          value={tempPopupSettings?.title || JSON.parse(getSiteSetting('theme', 'popup_settings') || '{"title": ""}').title}
                          onChange={(e) => {
                            setTempPopupSettings((prev: any) => ({ ...prev, title: e.target.value }));
                          }}
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Subscribe to our newsletter for exclusive travel tips and special offers."
                          value={tempPopupSettings?.description || JSON.parse(getSiteSetting('theme', 'popup_settings') || '{"description": ""}').description}
                          onChange={(e) => {
                            setTempPopupSettings((prev: any) => ({ ...prev, description: e.target.value }));
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Button Text</Label>
                          <Input
                            placeholder="Subscribe"
                            value={tempPopupSettings?.button_text || JSON.parse(getSiteSetting('theme', 'popup_settings') || '{"button_text": "Subscribe"}').button_text}
                            onChange={(e) => {
                              setTempPopupSettings((prev: any) => ({ ...prev, button_text: e.target.value }));
                            }}
                          />
                        </div>
                        <div>
                          <Label>Delay (seconds)</Label>
                          <Input
                            type="number"
                            placeholder="5"
                            value={JSON.parse(getSiteSetting('theme', 'popup_settings') || '{"delay": 5000}').delay / 1000}
                            onChange={(e) => {
                              const current = JSON.parse(getSiteSetting('theme', 'popup_settings') || '{"delay": 5000}');
                              updateSiteSetting('theme', 'popup_settings', JSON.stringify({...current, delay: parseInt(e.target.value) * 1000}));
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Save Button */}
                      <div className="flex justify-end pt-4">
                        <Button 
                          onClick={savePopupSettings} 
                          disabled={!tempPopupSettings}
                          className="bg-secondary hover:bg-secondary/90"
                        >
                          💾 Sauvegarder Pop-up Settings
                        </Button>
                      </div>
                      
                      {/* Pop-up Preview */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-4">
                          <Bell className="w-4 h-4" />
                          <h3 className="text-base font-semibold">Pop-up Preview</h3>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-lg">
                          {JSON.parse(getSiteSetting('theme', 'popup_settings') || '{"enabled": false}').enabled ? (
                            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 border">
                              <div className="text-center space-y-4">
                                <h3 className="text-lg font-semibold">
                                  {JSON.parse(getSiteSetting('theme', 'popup_settings') || '{"title": "Special Offer!"}').title || "Special Offer!"}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                  {JSON.parse(getSiteSetting('theme', 'popup_settings') || '{"description": "Subscribe to our newsletter for exclusive travel tips."}').description || "Subscribe to our newsletter for exclusive travel tips."}
                                </p>
                                <button 
                                  className="px-6 py-2 text-white rounded font-medium"
                                  style={{ backgroundColor: getSiteSetting('theme', 'primary_color') || '#084F6E' }}
                                >
                                  {JSON.parse(getSiteSetting('theme', 'popup_settings') || '{"button_text": "Subscribe"}').button_text || "Subscribe"}
                                </button>
                                <p className="text-xs text-gray-400">
                                  Apparaît après {(JSON.parse(getSiteSetting('theme', 'popup_settings') || '{"delay": 5000}').delay / 1000) || 5} secondes
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center text-gray-500 py-8">
                              Pop-up désactivée
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Pages Management */}
          <TabsContent value="pages">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Page Selector */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Layout className="w-4 h-4" />
                    Pages
                  </CardTitle>
                  <CardDescription>Choisissez la page à modifier</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Menu Principal - Direct Access */}
                    <div className="space-y-2">
                      <Button
                        variant={selectedPage === 'navigation-menu' ? 'default' : 'outline'}
                        className="w-full justify-start text-sm h-8"
                        onClick={() => setSelectedPage('navigation-menu')}
                      >
                        <Layout className="w-4 h-4 mr-2" />
                        Menu principal
                      </Button>
                    </div>
                    
                    {/* Other Categories with Dropdowns */}
                    {Object.entries(pageCategories).map(([categoryName, pages]) => (
                      <div key={categoryName} className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full justify-start text-sm h-8"
                          onClick={() => toggleCategory(categoryName)}
                        >
                          <Layout className="w-4 h-4 mr-2" />
                          <span className="flex-1 text-left">{categoryName}</span>
                          <ChevronDown 
                            className={`w-4 h-4 transition-transform ${
                              expandedCategories.includes(categoryName) ? 'rotate-180' : ''
                            }`}
                          />
                        </Button>
                        {expandedCategories.includes(categoryName) && (
                          <div className="space-y-2 ml-2">
                            {pages.map((page) => (
                              <Button
                                key={page.slug}
                                variant={selectedPage === page.slug ? 'default' : 'outline'}
                                className="w-full justify-start text-sm h-8"
                                onClick={() => setSelectedPage(page.slug)}
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                {page.name}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Page Editor Button - Placed after all categories */}
                    <div className="border-t pt-4">
                      <Button
                        variant="outline"
                        className="w-full justify-start text-sm h-8 mb-4 text-primary border-primary hover:bg-primary/10"
                        onClick={() => {
                          window.location.href = '/admin-editor';
                        }}
                      >
                        <Layout className="w-4 h-4 mr-2" />
                        Éditeur de page
                      </Button>
                      
                      {/* Add New Page Button */}
                      <Button
                        variant="outline"
                        className="w-full justify-start text-sm h-8 border-dashed border-primary/30 text-primary hover:bg-primary/10"
                        onClick={() => setIsAddPageModalOpen(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter une page
                      </Button>
                    </div>
                    
                  </div>
                </CardContent>
              </Card>

              {/* Page Content Blocks */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base sm:text-lg">
                        {selectedPage === 'navigation-menu' 
                          ? 'Menu Navigation' 
                          : (() => {
                              const currentPageConfig = pageConfigs.find(p => p.pageSlug === selectedPage);
                              return currentPageConfig?.pageName || selectedPage;
                            })()
                        }
                      </CardTitle>
                      <CardDescription>
                        {selectedPage === 'navigation-menu' 
                          ? 'Gérez les éléments du menu de navigation de votre site. Glissez-déposez pour réorganiser.'
                          : (() => {
                              const currentPageConfig = pageConfigs.find(p => p.pageSlug === selectedPage);
                              const pageType = currentPageConfig?.pageType === 'main' ? 'principale' : 'secondaire';
                              return `Page ${pageType} • /${selectedPage}`;
                            })()
                        }
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {selectedPage !== 'navigation-menu' && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => {
                              const pageUrl = selectedPage === 'home' ? '/' : `/${selectedPage}`;
                              window.open(pageUrl, '_blank');
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Voir la page
                          </Button>
                          <Button
                            onClick={() => {
                              // Rediriger directement vers l'édition de la page sélectionnée
                              if (selectedPage === 'home') {
                                window.location.href = '/admin-page-editor';
                              } else {
                                window.location.href = `/admin-page-editor?page=${selectedPage}`;
                              }
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Éditer la page
                          </Button>
                          {selectedPage !== 'home' && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  className="bg-red-600 hover:bg-red-700 text-white px-3"
                                  title="Supprimer la page"
                                >
                                  <Trash className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir supprimer la page "{
                                      pageConfigs.find(p => p.pageSlug === selectedPage)?.pageName || selectedPage
                                    }" ? Cette action est irréversible et supprimera également tous les contenus associés.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={async () => {
                                      const page = pageConfigs.find(p => p.pageSlug === selectedPage);
                                      if (!page) return;
                                      
                                      try {
                                        const response = await fetch(`/api/admin/page-configurations/${page.id}`, {
                                          method: 'DELETE',
                                          credentials: 'include',
                                        });
                                        
                                        if (!response.ok) {
                                          const error = await response.json();
                                          throw new Error(error.message || 'Erreur lors de la suppression');
                                        }
                                        
                                        toast({
                                          title: "Page supprimée",
                                          description: "La page a été supprimée avec succès.",
                                        });
                                        
                                        // Rafraîchir la page
                                        window.location.reload();
                                      } catch (error) {
                                        console.error('Error deleting page:', error);
                                        toast({
                                          title: "Erreur",
                                          description: "Impossible de supprimer la page.",
                                          variant: "destructive",
                                        });
                                      }
                                    }}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </>
                      )}
                    </div>
                  </CardHeader>
                  
                  {/* Edit Block Modal */}
                  <Dialog open={isEditingBlock} onOpenChange={setIsEditingBlock}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Block: {selectedBlock?.blockType}</DialogTitle>
                        <DialogDescription>
                          Modify the content and settings for this block
                        </DialogDescription>
                      </DialogHeader>
                      {selectedBlock && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="block-title">Title</Label>
                              <Input
                                id="block-title"
                                value={selectedBlock.title || ''}
                                onChange={(e) => setSelectedBlock({...selectedBlock, title: e.target.value})}
                                placeholder="Block title"
                              />
                            </div>
                            <div>
                              <Label htmlFor="block-subtitle">Subtitle</Label>
                              <Input
                                id="block-subtitle"
                                value={selectedBlock.subtitle || ''}
                                onChange={(e) => setSelectedBlock({...selectedBlock, subtitle: e.target.value})}
                                placeholder="Block subtitle"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="block-description">Description</Label>
                            <Textarea
                              id="block-description"
                              value={selectedBlock.description || ''}
                              onChange={(e) => setSelectedBlock({...selectedBlock, description: e.target.value})}
                              placeholder="Block description"
                              rows={3}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="block-content">Content</Label>
                            <Textarea
                              id="block-content"
                              value={selectedBlock.content || ''}
                              onChange={(e) => setSelectedBlock({...selectedBlock, content: e.target.value})}
                              placeholder="Block content"
                              rows={4}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="block-image">Image URL</Label>
                              <Input
                                id="block-image"
                                value={selectedBlock.imageUrl || ''}
                                onChange={(e) => setSelectedBlock({...selectedBlock, imageUrl: e.target.value})}
                                placeholder="https://example.com/image.jpg"
                              />
                            </div>
                            <div>
                              <Label htmlFor="block-bg">Couleur de fond</Label>
                              <Input
                                id="block-bg"
                                type="color"
                                value={selectedBlock.backgroundColor || '#ffffff'}
                                onChange={(e) => setSelectedBlock({...selectedBlock, backgroundColor: e.target.value})}
                              />
                            </div>
                          </div>
                          
                          {(selectedBlock.blockType.includes('cta') || selectedBlock.blockType.includes('hero')) && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="block-cta-text">Button Text</Label>
                                <Input
                                  id="block-cta-text"
                                  value={selectedBlock.ctaText || ''}
                                  onChange={(e) => setSelectedBlock({...selectedBlock, ctaText: e.target.value})}
                                  placeholder="Call to action text"
                                />
                              </div>
                              <div>
                                <Label htmlFor="block-cta-url">Button URL</Label>
                                <Input
                                  id="block-cta-url"
                                  value={selectedBlock.ctaUrl || ''}
                                  onChange={(e) => setSelectedBlock({...selectedBlock, ctaUrl: e.target.value})}
                                  placeholder="/link-destination"
                                />
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="block-active"
                              checked={selectedBlock.isActive}
                              onCheckedChange={(checked) => setSelectedBlock({...selectedBlock, isActive: checked})}
                            />
                            <Label htmlFor="block-active">Block is active</Label>
                          </div>
                          
                          <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setIsEditingBlock(false)}>
                              Cancel
                            </Button>
                            <div className="flex space-x-2">
                              <Button
                                variant="secondary"
                                onClick={() => {
                                  const pageUrl = selectedPage === 'home' ? '/' : `/${selectedPage}`;
                                  window.open(`${pageUrl}?preview=true`, '_blank');
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Preview Page
                              </Button>
                              <Button 
                                onClick={() => {
                                  if (selectedBlock) {
                                    updateBlockMutation.mutate({
                                      id: selectedBlock.id,
                                      updates: {
                                        title: selectedBlock.title,
                                        subtitle: selectedBlock.subtitle,
                                        description: selectedBlock.description,
                                        content: selectedBlock.content,
                                        imageUrl: selectedBlock.imageUrl,
                                        ctaText: selectedBlock.ctaText,
                                        ctaUrl: selectedBlock.ctaUrl,
                                        backgroundColor: selectedBlock.backgroundColor,
                                        isActive: selectedBlock.isActive
                                      }
                                    });
                                  }
                                }}
                                disabled={updateBlockMutation.isPending}
                              >
                                {updateBlockMutation.isPending ? 'Saving...' : 'Save Changes'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  <CardContent>
                    {selectedPage === 'navigation-menu' ? (
                      <NavigationMenuManager pageConfigs={pageConfigs} navigationMenuItems={[]} />
                    ) : loadingBlocks ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading blocks...</p>
                      </div>
                    ) : (
                      <PageManagementInterface 
                        selectedPage={selectedPage}
                        pageBlocks={pageBlocks}
                        pageConfigs={pageConfigs}
                        updatePageConfigMutation={updatePageConfigMutation}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>


          {/* Footer Management */}
          <TabsContent value="footer">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Footer Navigation Menu */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Settings className="w-4 h-4" />
                      Pied de page
                    </CardTitle>
                    <CardDescription>Gérer le contenu du pied de page</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        { id: 'contact-info', label: 'Informations de contact', icon: MapPin },
                        { id: 'useful-links', label: 'Liens utiles', icon: Menu },
                        { id: 'social-media', label: 'Réseaux sociaux', icon: Users },
                        { id: 'newsletter', label: 'Newsletter', icon: Mail },
                        { id: 'copyright', label: 'Copyright', icon: FileText }
                      ].map(({ id, label, icon: Icon }) => (
                        <Button
                          key={id}
                          variant={selectedFooterSection === id ? "default" : "outline"}
                          className="w-full justify-start text-sm h-8"
                          onClick={() => setSelectedFooterSection(id)}
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {label}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Footer Section Content */}
              <div className="lg:col-span-3">
                {selectedFooterSection === 'contact-info' && (
                  <ContactInfoManager
                    siteSettings={siteSettings}
                    updateSiteSetting={updateSiteSetting}
                    updateSiteSettingMutation={updateSiteSettingMutation}
                  />
                )}

                {selectedFooterSection === 'useful-links' && (
                  <UsefulLinksManager
                    siteSettings={siteSettings}
                    updateSiteSetting={updateSiteSetting}
                    updateSiteSettingMutation={updateSiteSettingMutation}
                    availablePages={Object.values(pageCategories).flat()}
                  />
                )}

                {selectedFooterSection === 'social-media' && (
                  <SocialMediaManager
                    siteSettings={siteSettings}
                    updateSiteSetting={updateSiteSetting}
                    updateSiteSettingMutation={updateSiteSettingMutation}
                  />
                )}

                {selectedFooterSection === 'newsletter' && (
                  <NewsletterManager
                    siteSettings={siteSettings}
                    updateSiteSetting={updateSiteSetting}
                    updateSiteSettingMutation={updateSiteSettingMutation}
                  />
                )}

                {selectedFooterSection === 'copyright' && (
                  <CopyrightManager
                    siteSettings={siteSettings}
                    updateSiteSetting={updateSiteSetting}
                    updateSiteSettingMutation={updateSiteSettingMutation}
                  />
                )}
              </div>
            </div>
          </TabsContent>

        </Tabs>
      </div>
      
      {/* Modal d'ajout de page */}
      <AddPageModal
        isOpen={isAddPageModalOpen}
        onClose={() => setIsAddPageModalOpen(false)}
        onSuccess={async (pageSlug) => {
          // Forcer le rechargement des données
          await queryClient.invalidateQueries({ queryKey: ['/api/admin/page-configurations'] });
          await queryClient.refetchQueries({ queryKey: ['/api/admin/page-configurations'] });
          
          // Vérifier que la page existe avant de la sélectionner
          const checkPageExists = async (retries = 10) => {
            const pages = queryClient.getQueryData<PageConfiguration[]>(['/api/admin/page-configurations']);
            if (pages && pages.some(p => p.pageSlug === pageSlug)) {
              // La page existe, on peut la sélectionner
              setSelectedPage(pageSlug);
              setExpandedCategories(['Pages secondaires']);
            } else if (retries > 0) {
              // Réessayer après un court délai
              await queryClient.refetchQueries({ queryKey: ['/api/admin/page-configurations'] });
              setTimeout(() => checkPageExists(retries - 1), 500);
            } else {
              // Après toutes les tentatives, forcer un rechargement complet
              window.location.reload();
            }
          };
          
          checkPageExists();
        }}
      />
    </div>
  );
}

// Navigation Menu Manager Component
function NavigationMenuManager({ pageConfigs, navigationMenuItems }: { pageConfigs?: PageConfiguration[]; navigationMenuItems?: NavigationMenuItem[] }) {
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<NavigationMenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch navigation menu items
  const { data: menuItems = [], isLoading } = useQuery<NavigationMenuItem[]>({
    queryKey: ['/api/admin/navigation-menu'],
  });

  // Dynamic page categories based on database and navigation menu
  const getDynamicPageCategories = () => {
    const categories: Record<string, Array<{ slug: string; name: string; id: number }>> = {
      'Pages principales': [],
      'Pages secondaires': [],
      'Mentions légales': []
    };

    // Static pages that should always be available
    const staticPages = [
      { slug: 'brochure', name: 'Our brochure', id: 999 },
      { slug: 'krabi-celebration', name: 'Krabi Celebration', id: 998 },
      { slug: 'fun-garden', name: 'Fun Garden', id: 997 },
      { slug: 'villas-krabi', name: 'Villas in Krabi', id: 996 },
      { slug: 'become-partner', name: 'Become Partner', id: 995 },
      { slug: 'group-corporate', name: 'Group & Corporate', id: 994 },
      { slug: 'privacy-policy', name: 'Privacy Policy', id: 993 },
      { slug: 'legal-notice', name: 'Legal Notice', id: 992 },
      { slug: 'terms-conditions', name: 'Terms & Conditions', id: 991 }
    ];

    // Get pages that are in the main navigation menu (no parent)
    const menuPages = menuItems ? menuItems
      .filter((item: NavigationMenuItem) => !item.parentId && item.url && item.url.startsWith('/'))
      .map((item: NavigationMenuItem) => item.url.substring(1)) // Remove leading slash
      : [];

    // Process database pages first
    if (pageConfigs && Array.isArray(pageConfigs)) {
      pageConfigs.forEach((page: PageConfiguration) => {
        const pageInfo = { slug: page.pageSlug, name: page.pageName, id: page.id };
        
        // Mentions légales: pages containing legal, privacy, or terms in their slug
        if (page.pageSlug.includes('legal') || page.pageSlug.includes('privacy') || page.pageSlug.includes('terms')) {
          categories['Mentions légales'].push(pageInfo);
        }
        // Pages principales: pages that are in the main navigation menu
        else if (menuPages.includes(page.pageSlug)) {
          categories['Pages principales'].push(pageInfo);
        }
        // Pages secondaires: all other existing pages
        else {
          categories['Pages secondaires'].push(pageInfo);
        }
      });
    }

    // Add static pages that are not already in database
    const existingSlugs = pageConfigs ? pageConfigs.map(p => p.pageSlug) : [];
    staticPages.forEach(staticPage => {
      if (!existingSlugs.includes(staticPage.slug)) {
        // Mentions légales
        if (staticPage.slug.includes('legal') || staticPage.slug.includes('privacy') || staticPage.slug.includes('terms')) {
          categories['Mentions légales'].push(staticPage);
        }
        // Pages principales: pages in navigation menu
        else if (menuPages.includes(staticPage.slug)) {
          categories['Pages principales'].push(staticPage);
        }
        // Pages secondaires: all others
        else {
          categories['Pages secondaires'].push(staticPage);
        }
      }
    });

    // ALWAYS put Home first in Pages principales (even if not in menu)
    const homePageFromDB = pageConfigs && Array.isArray(pageConfigs) ? pageConfigs.find(p => p.pageSlug === 'home') : null;
    const homePageStatic = staticPages.find(p => p.slug === 'home');
    const homePage = homePageFromDB 
      ? { slug: homePageFromDB.pageSlug, name: homePageFromDB.pageName === 'Accueil' ? 'Home' : homePageFromDB.pageName, id: homePageFromDB.id }
      : homePageStatic;
    
    if (homePage) {
      // Remove home from other categories if it exists
      categories['Pages principales'] = categories['Pages principales'].filter(p => p.slug !== 'home');
      categories['Pages secondaires'] = categories['Pages secondaires'].filter(p => p.slug !== 'home');
      
      // Add Home as first item in Pages principales
      categories['Pages principales'].unshift(homePage);
    }
    
    // Trier toutes les catégories par ordre alphabétique
    // mais garder Home en premier dans Pages principales
    const otherMainPages = categories['Pages principales']
      .filter(p => p.slug !== 'home')
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    
    categories['Pages principales'] = homePage 
      ? [homePage, ...otherMainPages]
      : otherMainPages;
    
    // Trier Pages secondaires
    categories['Pages secondaires'].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    
    // Trier Mentions légales
    categories['Mentions légales'].sort((a, b) => a.name.localeCompare(b.name, 'fr'));

    return categories;
  };

  const pageCategories = getDynamicPageCategories();

  // Create navigation menu item
  const createMenuItemMutation = useMutation({
    mutationFn: async (itemData: Partial<NavigationMenuItem>) => {
      const response = await fetch('/api/admin/navigation-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(itemData),
      });
      if (!response.ok) throw new Error('Failed to create menu item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/navigation-menu'] });
      setIsDialogOpen(false);
      setEditingItem(null);
      toast({ title: "Success", description: "Menu item created successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to create menu item",
        variant: "destructive" 
      });
    },
  });

  // Update navigation menu item
  const updateMenuItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<NavigationMenuItem> }) => {
      const response = await fetch(`/api/admin/navigation-menu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update menu item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/navigation-menu'] });
      setIsDialogOpen(false);
      setEditingItem(null);
      toast({ title: "Success", description: "Menu item updated successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to update menu item",
        variant: "destructive" 
      });
    },
  });

  // Delete navigation menu item
  const deleteMenuItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/navigation-menu/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete menu item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/navigation-menu'] });
      toast({ title: "Success", description: "Menu item deleted successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to delete menu item",
        variant: "destructive" 
      });
    },
  });

  // Reorder navigation menu item
  const reorderMenuItemMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: number; direction: 'up' | 'down' }) => {
      const response = await fetch(`/api/admin/navigation-menu/${id}/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ direction }),
      });
      if (!response.ok) throw new Error('Failed to reorder menu item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/navigation-menu'] });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to reorder menu item",
        variant: "destructive" 
      });
    },
  });

  // Handle save menu item
  const handleSaveMenuItem = (formData: FormData) => {
    const parentIdValue = formData.get('parentId') as string;
    
    const itemData = {
      name: formData.get('name') as string,
      url: formData.get('url') as string,
      target: formData.get('target') as string || '_self',
      isActive: formData.get('isActive') === 'on',
      parentId: (parentIdValue && parentIdValue !== 'none') ? parseInt(parentIdValue) : undefined,
      displayOrder: 0
    };

    if (editingItem?.id) {
      updateMenuItemMutation.mutate({ id: editingItem.id, data: itemData });
    } else {
      createMenuItemMutation.mutate(itemData);
    }
  };


  // Function to correct French menu items to English
  const correctFrenchToEnglish = async () => {
    const corrections = [
      { from: 'Accueil', to: 'Home' },
      { from: 'Expériences', to: 'Experiences' },
      { from: 'Voyage sur mesure', to: 'Custom Trip' },
      { from: 'Blog', to: 'Blog' },
      { from: 'Contact', to: 'Contact' }
    ];
    
    for (const item of menuItems) {
      const correction = corrections && Array.isArray(corrections) ? corrections.find(c => c.from === item.name) : null;
      if (correction) {
        try {
          await updateMenuItemMutation.mutateAsync({
            id: item.id,
            data: { name: correction.to }
          });
        } catch (error) {
          console.error('Error correcting menu item:', error);
        }
      }
    }
    queryClient.invalidateQueries({ queryKey: ['/api/admin/navigation-menu'] });
    toast({ title: "Succès", description: "Éléments de menu corrigés en anglais" });
  };

  // Auto-correct French items on load
  useEffect(() => {
    if (menuItems.length > 0) {
      const hasFrenchItems = menuItems.some(item => 
        ['Accueil', 'Expériences', 'Voyage sur mesure'].includes(item.name)
      );
      if (hasFrenchItems) {
        correctFrenchToEnglish();
      }
    }
  }, [menuItems]);

  // Organize menu items by parent/child relationships
  const organizeMenuItems = (items: NavigationMenuItem[]) => {
    if (!items || items.length === 0) return [];
    
    const parentItems = items.filter(item => !item.parentId);
    const childItems = items.filter(item => item.parentId);

    return parentItems.map(parent => ({
      ...parent,
      children: childItems.filter(child => child.parentId === parent.id)
    }));
  };

  const organizedItems = organizeMenuItems(menuItems);

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-2 justify-between">
        <div className="flex gap-2">
          {hasUnsavedChanges && (
            <Button
              variant="default"
              onClick={async () => {
                // Save functionality would go here
                setHasUnsavedChanges(false);
                toast({ title: "Succès", description: "Modifications sauvegardées" });
              }}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Sauvegarder les modifications
            </Button>
          )}
        </div>
        
        <Button
          type="button"
          onClick={() => {
            setEditingItem(null);
            setIsDialogOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter élément
        </Button>
      </div>


      {/* Menu Items List */}
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Menu className="w-5 h-5" />
          Éléments du menu ({menuItems.length})
        </h3>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : organizedItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucun élément de menu. Cliquez sur "Ajouter élément" pour commencer.
          </div>
        ) : (
          <div className="space-y-2">
            {organizedItems.map((item, index) => (
              <MenuItemRow
                key={item.id}
                item={item}
                isFirst={index === 0}
                isLast={index === organizedItems.length - 1}
                onEdit={(item) => {
                  setEditingItem(item);
                  setIsDialogOpen(true);
                }}
                onDelete={(id) => deleteMenuItemMutation.mutate(id)}
                onReorder={(id, direction) => reorderMenuItemMutation.mutate({ id, direction })}
                onAddChild={(parentId) => {
                  setEditingItem({ parentId } as NavigationMenuItem);
                  setIsDialogOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <MenuItemDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingItem(null);
        }}
        editingItem={editingItem}
        parentItems={organizedItems}
        onSave={handleSaveMenuItem}
        isLoading={createMenuItemMutation.isPending || updateMenuItemMutation.isPending}
        pageConfigs={pageConfigs}
      />
    </div>
  );
}

// Menu Item Row Component
function MenuItemRow({
  item,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onReorder,
  onAddChild
}: {
  item: NavigationMenuItem & { children?: NavigationMenuItem[] };
  isFirst: boolean;
  isLast: boolean;
  onEdit: (item: NavigationMenuItem) => void;
  onDelete: (id: number) => void;
  onReorder: (id: number, direction: 'up' | 'down') => void;
  onAddChild: (parentId: number) => void;
}) {
  return (
    <div className="space-y-1">
      {/* Parent Item */}
      <div className="flex items-center gap-3 p-3 border rounded-lg bg-white hover:bg-gray-50">
        {/* Reorder Controls */}
        <div className="flex flex-col">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReorder(item.id, 'up')}
            disabled={isFirst}
            className="p-1 h-5"
          >
            <ChevronUp className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReorder(item.id, 'down')}
            disabled={isLast}
            className="p-1 h-5"
          >
            <ChevronDown className="w-3 h-3" />
          </Button>
        </div>

        {/* Item Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {item.iconName && <Globe className="w-4 h-4 text-gray-500" />}
            <span className="font-medium">{item.name}</span>
            {item.target === '_blank' && (
              <Badge variant="outline">Nouvel onglet</Badge>
            )}
          </div>
          {item.description && (
            <div className="text-xs text-gray-400">{item.description}</div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onEdit(item)}
          >
            <Edit className="w-3 h-3" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                <Trash2 className="w-3 h-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer l'élément</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir supprimer "{item.name}" ? 
                  Cette action supprimera également tous les sous-éléments.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(item.id)}>
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Child Items */}
      {item.children && item.children.length > 0 && (
        <div className="ml-8 space-y-1">
          {item.children.map((child, childIndex) => (
            <div 
              key={child.id} 
              className="flex items-center gap-3 p-2 border rounded bg-gray-50 hover:bg-gray-100"
            >
              {/* Child Reorder Controls */}
              <div className="flex flex-col">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReorder(child.id, 'up')}
                  disabled={childIndex === 0}
                  className="p-1 h-4"
                >
                  <ChevronUp className="w-2 h-2" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReorder(child.id, 'down')}
                  disabled={childIndex === item.children!.length - 1}
                  className="p-1 h-4"
                >
                  <ChevronDown className="w-2 h-2" />
                </Button>
              </div>

              {/* Child Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {child.iconName && <Globe className="w-3 h-3 text-gray-500" />}
                  <span className="text-sm font-medium">{child.name}</span>
                </div>
                <div className="text-xs text-gray-500 truncate">{child.url}</div>
              </div>

              {/* Child Actions */}
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(child)}
                >
                  <Edit className="w-2 h-2" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      <Trash2 className="w-2 h-2" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer le sous-élément</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir supprimer "{child.name}" ?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(child.id)}>
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Menu Item Dialog Component
function MenuItemDialog({
  isOpen,
  onClose,
  editingItem,
  parentItems,
  onSave,
  isLoading,
  pageConfigs
}: {
  isOpen: boolean;
  onClose: () => void;
  editingItem: NavigationMenuItem | null;
  parentItems: NavigationMenuItem[];
  onSave: (formData: FormData) => void;
  isLoading: boolean;
  pageConfigs?: PageConfiguration[];
}) {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    target: '_self',
    isActive: true,
    parentId: 'none'
  });

  // Update form data when editing item changes
  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name || '',
        url: editingItem.url || '',
        target: editingItem.target || '_self',
        isActive: editingItem.isActive ?? true,
        parentId: editingItem.parentId?.toString() || 'none'
      });
    } else {
      setFormData({
        name: '',
        url: '',
        target: '_self',
        isActive: true,
        parentId: 'none'
      });
    }
  }, [editingItem]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    onSave(form);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingItem?.id ? 'Modifier' : 'Ajouter'} un élément de menu
          </DialogTitle>
          <DialogDescription>
            Configurez les détails de l'élément de navigation
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom du menu *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="ex: Accueil, Expériences..."
              required
            />
          </div>

          {/* URL with Page Selector */}
          <div className="space-y-2">
            <Label htmlFor="url">Lien URL *</Label>
            <div className="flex gap-2">
              <Select value={formData.url} onValueChange={(value) => setFormData(prev => ({ ...prev, url: value }))}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Choisir page" />
                </SelectTrigger>
                <SelectContent>
                  {pageConfigs && Array.isArray(pageConfigs) ? pageConfigs.map((page) => (
                    <SelectItem key={page.id} value={`/${page.pageSlug}`}>
                      {page.pageName}
                    </SelectItem>
                  )) : null}
                </SelectContent>
              </Select>
              <Input
                id="url"
                name="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="ou saisir URL personnalisée"
                className="flex-1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Parent Menu */}
            <div className="space-y-2">
              <Label htmlFor="parentId">Menu parent (optionnel)</Label>
              <Select name="parentId" value={formData.parentId} onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un menu parent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun (menu principal)</SelectItem>
                  {parentItems.map((parent) => (
                    <SelectItem key={parent.id} value={parent.id.toString()}>
                      {parent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target */}
            <div className="space-y-2">
              <Label htmlFor="target">Ouvrir dans</Label>
              <Select name="target" value={formData.target} onValueChange={(value) => setFormData(prev => ({ ...prev, target: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_self">Même onglet</SelectItem>
                  <SelectItem value="_blank">Nouvel onglet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Switch */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="isActive">Élément visible</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Nouveau composant avec prévisualisations réelles et édition in-line
function RealBlocksEditor({ 
  pageSlug, 
  pageBlocks, 
  editingHeroBlockId, 
  setEditingHeroBlockId, 
  heroEditData, 
  setHeroEditData, 
  saveHeroChanges,
  handleEditHero
}: { 
  pageSlug: string; 
  pageBlocks: PageBlock[];
  editingHeroBlockId: number | null;
  setEditingHeroBlockId: (id: number | null) => void;
  heroEditData: HeroEditData;
  setHeroEditData: React.Dispatch<React.SetStateAction<HeroEditData>>;
  saveHeroChanges: () => Promise<void>;
  handleEditHero: (blockId: number) => void;
}) {
  const queryClient = useQueryClient();

  // Mutations pour les opérations sur les blocs
  const updateBlockMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PageBlock> }) => {
      const response = await fetch(`/api/admin/page-blocks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update block');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-blocks', pageSlug] });
      toast({
        title: "Bloc sauvegardé",
        description: "Les modifications ont été appliquées avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications.",
        variant: "destructive",
      });
    },
  });

  const deleteBlockMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/page-blocks/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete block');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-blocks', pageSlug] });
      toast({
        title: "Bloc supprimé",
        description: "Le bloc a été supprimé avec succès.",
      });
    },
  });

  const reorderBlocksMutation = useMutation({
    mutationFn: async (blocks: { id: number; blockOrder: number }[]) => {
      const response = await fetch('/api/admin/page-blocks/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks }),
      });
      if (!response.ok) throw new Error('Failed to reorder blocks');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/page-blocks', pageSlug] });
    },
  });

  const handleUpdateBlock = (id: number, data: Partial<PageBlock>) => {
    updateBlockMutation.mutate({ id, data });
  };

  const handleDeleteBlock = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bloc ?')) {
      deleteBlockMutation.mutate(id);
    }
  };

  const handleMoveUp = (id: number) => {
    const currentIndex = pageBlocks.findIndex(block => block.id === id);
    if (currentIndex > 0) {
      const updates = [
        { id: pageBlocks[currentIndex].id, blockOrder: pageBlocks[currentIndex - 1].blockOrder },
        { id: pageBlocks[currentIndex - 1].id, blockOrder: pageBlocks[currentIndex].blockOrder }
      ];
      reorderBlocksMutation.mutate(updates);
    }
  };

  const handleMoveDown = (id: number) => {
    const currentIndex = pageBlocks.findIndex(block => block.id === id);
    if (currentIndex < pageBlocks.length - 1) {
      const updates = [
        { id: pageBlocks[currentIndex].id, blockOrder: pageBlocks[currentIndex + 1].blockOrder },
        { id: pageBlocks[currentIndex + 1].id, blockOrder: pageBlocks[currentIndex].blockOrder }
      ];
      reorderBlocksMutation.mutate(updates);
    }
  };

  const handleToggleVisibility = (id: number) => {
    const block = pageBlocks && Array.isArray(pageBlocks) ? pageBlocks.find(b => b.id === id) : null;
    if (block) {
      handleUpdateBlock(id, { isActive: !block.isActive });
    }
  };

  if (!pageBlocks.length) {
    return (
      <div className="text-center py-12">
        <Layout className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun bloc trouvé</h3>
        <p className="text-gray-500 mb-4">Cette page n'a pas encore de blocs de contenu.</p>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un bloc
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pageBlocks.map((block) => (
        <div key={block.id}>
          <RealBlockPreview
            block={block}
            onUpdate={handleUpdateBlock}
            onDelete={handleDeleteBlock}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onToggleVisibility={handleToggleVisibility}
            onEditHero={block.blockType === 'video_hero' ? handleEditHero : undefined}
          />
          
          {/* Formulaire d'édition Hero Section */}
          {editingHeroBlockId === block.id && block.blockType === 'video_hero' && (
            <div className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Édition Hero Section
                  </CardTitle>
                  <CardDescription>
                    Modifier le contenu de la section Hero avec prévisualisation en temps réel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    {/* Formulaire d'édition */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="hero-title">Titre Principal</Label>
                        <Textarea
                          id="hero-title"
                          value={heroEditData.title}
                          onChange={(e) => setHeroEditData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Titre de la section Hero"
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label htmlFor="hero-colored-part">Partie du titre à colorer</Label>
                        <Input
                          id="hero-colored-part"
                          value={heroEditData.titleColorPart}
                          onChange={(e) => setHeroEditData(prev => ({ ...prev, titleColorPart: e.target.value }))}
                          placeholder="Partie du titre en couleur"
                        />
                      </div>

                      <div>
                        <Label htmlFor="hero-description">Description</Label>
                        <Textarea
                          id="hero-description"
                          value={heroEditData.description}
                          onChange={(e) => setHeroEditData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Description de la section Hero"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="hero-image">URL de l'image de fond</Label>
                        <Input
                          id="hero-image"
                          type="url"
                          value={heroEditData.imageUrl}
                          onChange={(e) => setHeroEditData(prev => ({ ...prev, imageUrl: e.target.value }))}
                          placeholder="https://example.com/image.jpg ou /attached_assets/image.jpg"
                        />
                      </div>

                      <div>
                        <Label htmlFor="hero-video">URL de la vidéo de fond (optionnel)</Label>
                        <Input
                          id="hero-video"
                          type="url"
                          value={heroEditData.videoUrl}
                          onChange={(e) => setHeroEditData(prev => ({ ...prev, videoUrl: e.target.value }))}
                          placeholder="https://example.com/video.mp4 ou /attached_assets/video.mp4"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="hero-button1-text">Bouton 1 - Texte</Label>
                          <Input
                            id="hero-button1-text"
                            value={heroEditData.button1Text}
                            onChange={(e) => setHeroEditData(prev => ({ ...prev, button1Text: e.target.value }))}
                            placeholder="Texte du premier bouton"
                          />
                        </div>
                        <div>
                          <Label htmlFor="hero-button1-url">Bouton 1 - Lien</Label>
                          <Input
                            id="hero-button1-url"
                            value={heroEditData.button1Url}
                            onChange={(e) => setHeroEditData(prev => ({ ...prev, button1Url: e.target.value }))}
                            placeholder="/lien-du-bouton"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="hero-button2-text">Bouton 2 - Texte</Label>
                          <Input
                            id="hero-button2-text"
                            value={heroEditData.button2Text}
                            onChange={(e) => setHeroEditData(prev => ({ ...prev, button2Text: e.target.value }))}
                            placeholder="Texte du deuxième bouton"
                          />
                        </div>
                        <div>
                          <Label htmlFor="hero-button2-url">Bouton 2 - Lien</Label>
                          <Input
                            id="hero-button2-url"
                            value={heroEditData.button2Url}
                            onChange={(e) => setHeroEditData(prev => ({ ...prev, button2Url: e.target.value }))}
                            placeholder="/lien-du-bouton-2"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Prévisualisation en temps réel */}
                    <div>
                      <Label>Prévisualisation en temps réel</Label>
                      <div className="border rounded-lg p-4 bg-gray-50 overflow-hidden">
                        <div 
                          className="relative min-h-[300px] flex items-center justify-center text-white"
                          style={{
                            backgroundImage: heroEditData.imageUrl ? `url(${heroEditData.imageUrl})` : 'linear-gradient(135deg, #084F6E 0%, #0066cc 100%)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            borderRadius: '8px'
                          }}
                        >
                          {/* Overlay sombre */}
                          <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg"></div>
                          
                          {/* Contenu de prévisualisation */}
                          <div className="relative z-10 text-center max-w-2xl px-6">
                            <h1 className="text-2xl font-bold mb-4">
                              {heroEditData.title.split(heroEditData.titleColorPart).map((part, index) => (
                                <span key={index}>
                                  {index === 1 && heroEditData.titleColorPart ? (
                                    <>
                                      <span className="text-secondary">{heroEditData.titleColorPart}</span>
                                      {part}
                                    </>
                                  ) : part}
                                </span>
                              ))}
                            </h1>
                            
                            <p className="text-lg mb-6 opacity-90">
                              {heroEditData.description}
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                              <button 
                                className="px-6 py-3 bg-secondary text-black font-semibold rounded-lg hover:bg-secondary/90 transition-colors"
                              >
                                {heroEditData.button1Text}
                              </button>
                              <button 
                                className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-black transition-colors"
                              >
                                {heroEditData.button2Text}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions du formulaire */}
                  <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setEditingHeroBlockId(null)}
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={saveHeroChanges}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Sauvegarder les modifications
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      ))}
      
      {/* Bouton pour ajouter un nouveau bloc */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary/40 hover:bg-primary/10 transition-colors">
        <Plus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-gray-600 font-medium">Ajouter un nouveau bloc</p>
        <p className="text-sm text-gray-500">Les boutons de création rapide sont disponibles ci-dessous</p>
      </div>
    </div>
  );
}
