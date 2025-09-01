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
import { Edit, Plus, Trash2, Move, Eye, EyeOff, ChevronUp, ChevronDown, Settings, Palette, Layout, Image, Type, FileText, MapPin, Mail, Users, Download, Star, Camera, ArrowLeft, Search, Video, Bell, MousePointer, Globe, Menu } from 'lucide-react';
import RealBlockPreview from '@/components/admin/RealBlockPreview';
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
      return <a href={`mailto:${value.replace(/^[^:]*:\s*/, '')}`} className="text-blue-600 underline">{value}</a>;
    case 'phone_with_title':
      return <a href={`tel:${value.replace(/^[^:]*:\s*/, '').replace(/\s/g, '')}`} className="text-blue-600">{value}</a>;
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
    const setting = siteSettings.find((s: any) => s.section === 'footer' && s.key === 'contact_info');
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
          Contact Information
        </CardTitle>
        <CardDescription>Manage footer contact details</CardDescription>
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
          <h5 className="font-medium text-gray-700">Add New Contact Information</h5>
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
            <div className="bg-gray-50 p-3 rounded border-l-4 border-blue-500">
              <Label className="text-xs text-gray-500 block mb-1">Preview on website:</Label>
              <div className="text-sm">
                {newItem.style === 'phone_with_title' ? (
                  <span>{newItem.label}: {newItem.value}</span>
                ) : newItem.style === 'whatsapp' ? (
                  <span>💬 {newItem.value}</span>
                ) : newItem.style === 'line' ? (
                  <span>💬 {newItem.value}</span>
                ) : newItem.style === 'email' ? (
                  <a href={`mailto:${newItem.value}`} className="text-blue-600">{newItem.value}</a>
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
            Add Contact Information
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function UsefulLinksManager({ siteSettings, updateSiteSetting, updateSiteSettingMutation, availablePages }: any) {
  const getUsefulLinks = () => {
    const setting = siteSettings.find((s: any) => s.section === 'footer' && s.key === 'useful_links');
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
          Useful Links
        </CardTitle>
        <CardDescription>Manage footer navigation links</CardDescription>
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
            <div className="bg-gray-50 p-3 rounded border-l-4 border-blue-500">
              <Label className="text-xs text-gray-500 block mb-1">Preview on website:</Label>
              <div className="text-sm">
                <a 
                  href={newLink.url}
                  className="text-blue-600 hover:text-blue-800 font-medium"
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
    const setting = siteSettings.find((s: any) => s.section === 'footer' && s.key === 'social_media');
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
          Social Media
        </CardTitle>
        <CardDescription>Manage social media links</CardDescription>
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
        
        {/* Add New Social Media */}
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
            <div className="bg-gray-50 p-3 rounded border-l-4 border-blue-500">
              <Label className="text-xs text-gray-500 block mb-1">Preview on website:</Label>
              <div className="text-sm">
                <a 
                  href={newSocial.url}
                  className="text-blue-600 hover:text-blue-800"
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
            Add Social Media
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NewsletterManager({ siteSettings, updateSiteSetting, updateSiteSettingMutation }: any) {
  const getNewsletterConfig = () => {
    const setting = siteSettings.find((s: any) => s.section === 'footer' && s.key === 'newsletter_config');
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
        <CardDescription>Configure newsletter section</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Enable Newsletter</Label>
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
    const setting = siteSettings.find((s: any) => s.section === 'footer' && s.key === 'copyright_config');
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
        <CardDescription>Configure copyright text</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Enable Copyright</Label>
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
      const block = pageBlocks.find(b => b.id === data.blockId);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appearance settings...</p>
        </div>
      </div>
    );
  }

  const pageCategories = {
    'Pages principales': [
      { slug: 'home', name: 'Home Page' },
      { slug: 'experiences', name: 'Experiences' },
      { slug: 'custom-tour', name: 'Custom Tour' },
      { slug: 'contact', name: 'Contact Us' },
      { slug: 'blog', name: 'Blog' }
    ],
    'Pages secondaires': [
      { slug: 'tours', name: 'Tours' },
      { slug: 'stays', name: 'Stays' },
      { slug: 'external-stays', name: 'External Stays' },
      { slug: 'villas-krabi', name: 'Villas Krabi' },
      { slug: 'krabi-celebration', name: 'Krabi Celebration' },
      { slug: 'become-partner', name: 'Become Partner' },
      { slug: 'group-corporate', name: 'Group Corporate' },
      { slug: 'brochure', name: 'Brochure' },
      { slug: 'tour-cards', name: 'Tour Cards' }
    ],
    'Mentions légales': [
      { slug: 'legal-notice', name: 'Legal Notice' },
      { slug: 'privacy-policy', name: 'Privacy Policy' },
      { slug: 'terms-conditions', name: 'Terms & Conditions' }
    ]
  };

  // Group theme sections by category
  const themeCategories = {
    'Design': [
      { key: 'colors', name: 'Colors', icon: 'Palette' },
      { key: 'typography', name: 'Typography', icon: 'Type' }
    ],
    'Elements': [
      { key: 'button-styles', name: 'Button Styles', icon: 'MousePointer' },
      { key: 'announcements', name: 'Announcement Bar', icon: 'Bell' },
      { key: 'backgrounds', name: 'Pop-up Announcement', icon: 'Bell' }
    ],
    'Branding': [
      { key: 'logo-favicon', name: 'Logo & Favicon', icon: 'Image' },
      { key: 'seo-metadata', name: 'SEO & Metadata', icon: 'Globe' }
    ]
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
          configuration: { style: 'banner', backgroundColor: '#1e73be' }
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
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:justify-between">
            <div className="w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2 sm:gap-3">
                <Palette className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 flex-shrink-0" />
                <span className="truncate">Site Appearance</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600">Customize your website theme, pages, and footer</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setLocation('/admin')}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Admin</span>
            </Button>
          </div>
        </div>

        {/* Main Navigation */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="theme" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-base sm:text-lg font-semibold">
              <Palette className="w-4 h-4 flex-shrink-0" />
              <span>Theme</span>
            </TabsTrigger>
            <TabsTrigger value="pages" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-base sm:text-lg font-semibold">
              <Layout className="w-4 h-4 flex-shrink-0" />
              <span>Pages</span>
            </TabsTrigger>
            <TabsTrigger value="footer" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-base sm:text-lg font-semibold">
              <Settings className="w-4 h-4 flex-shrink-0" />
              <span>Footer</span>
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
                    Page Settings
                  </CardTitle>
                  <CardDescription>Choose theme section to edit</CardDescription>
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
                        Colors
                      </CardTitle>
                      <CardDescription>Customize your site's primary and extended color scheme</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="primary-color">Primary Color</Label>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mt-2">
                          <Input
                            id="primary-color"
                            type="color"
                            value={tempColors?.primary_color || getSiteSetting('theme', 'primary_color') || '#1e73be'}
                            onChange={(e) => setTempColors((prev: any) => ({ ...prev, primary_color: e.target.value }))}
                            className="w-20 h-10"
                          />
                          <Input
                            value={tempColors?.primary_color || getSiteSetting('theme', 'primary_color') || '#1e73be'}
                            onChange={(e) => setTempColors((prev: any) => ({ ...prev, primary_color: e.target.value }))}
                            placeholder="#1e73be"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="secondary-color">Secondary Color</Label>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mt-2">
                          <Input
                            id="secondary-color"
                            type="color"
                            value={tempColors?.secondary_color || getSiteSetting('theme', 'secondary_color') || '#E6B64C'}
                            onChange={(e) => setTempColors((prev: any) => ({ ...prev, secondary_color: e.target.value }))}
                            className="w-20 h-10"
                          />
                          <Input
                            value={tempColors?.secondary_color || getSiteSetting('theme', 'secondary_color') || '#E6B64C'}
                            onChange={(e) => setTempColors((prev: any) => ({ ...prev, secondary_color: e.target.value }))}
                            placeholder="#E6B64C"
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
                            <Label>Background Color</Label>
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
                          className="bg-green-600 hover:bg-green-700"
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
                                style={{ backgroundColor: tempColors?.primary_color || getSiteSetting('theme', 'primary_color') || '#1e73be' }}
                              ></div>
                              <p className="text-xs font-medium">Primary</p>
                            </div>
                            <div className="text-center">
                              <div 
                                className="w-12 h-12 rounded-lg mx-auto mb-2 border-2 border-gray-300"
                                style={{ backgroundColor: tempColors?.secondary_color || getSiteSetting('theme', 'secondary_color') || '#E6B64C' }}
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
                          Announcement Bar
                        </CardTitle>
                        <CardDescription>Top notification bar (barre jaune actuelle)</CardDescription>
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
                          <Label htmlFor="notification-enabled">Enable Notification Bar</Label>
                        </div>
                        <div>
                          <Label>Notification Text</Label>
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
                            <Label>Background Color</Label>
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
                            className="bg-green-600 hover:bg-green-700"
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
                        Typography
                      </CardTitle>
                      <CardDescription>Font families and text styles</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Heading Font</Label>
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
                        <Label>Body Font</Label>
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
                          className="bg-green-600 hover:bg-green-700"
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
                        Button Styles
                      </CardTitle>
                      <CardDescription>Customize button appearance and behavior</CardDescription>
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
                          className="bg-green-600 hover:bg-green-700"
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
                                backgroundColor: tempColors?.primary_color || getSiteSetting('theme', 'primary_color') || '#1e73be',
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
                                borderColor: getSiteSetting('theme', 'primary_color') || '#1e73be',
                                color: getSiteSetting('theme', 'primary_color') || '#1e73be',
                                borderRadius: JSON.parse(getSiteSetting('theme', 'button_styles') || '{"border_radius": "8px"}').border_radius
                              }}
                            >
                              Outline Button
                            </button>
                            <button 
                              className="px-4 py-2 text-white transition-all"
                              style={{
                                backgroundColor: getSiteSetting('theme', 'secondary_color') || '#E6B64C',
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
                        SEO & Metadata
                      </CardTitle>
                      <CardDescription>Global SEO settings and social media metadata</CardDescription>
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
                      <CardDescription>Manage individual logos with upload/link and size controls</CardDescription>
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
                          className="bg-green-600 hover:bg-green-700"
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
                          className="bg-green-600 hover:bg-green-700"
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
                                  style={{ backgroundColor: getSiteSetting('theme', 'primary_color') || '#1e73be' }}
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
                    Select Page
                  </CardTitle>
                  <CardDescription>Choose page to edit</CardDescription>
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
                  </div>
                </CardContent>
              </Card>

              {/* Page Content Blocks */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base sm:text-lg">
                        {selectedPage === 'navigation-menu' ? 'Menu Navigation' : `Content Blocks for ${selectedPage}`}
                      </CardTitle>
                      <CardDescription>
                        {selectedPage === 'navigation-menu' 
                          ? 'Manage your website navigation menu items. Drag and drop to reorder.'
                          : 'Drag and drop to reorder blocks. Each block represents a section of your page.'
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
                            Preview Page
                          </Button>
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
                              {/* Hero Sections */}
                              <SelectItem value="hero_video">Hero with Video Background</SelectItem>
                              <SelectItem value="hero_banner">Hero Banner with Image</SelectItem>
                              <SelectItem value="hero">Simple Hero Section</SelectItem>
                              
                              {/* Content Sections */}
                              <SelectItem value="text_section">Text Section (Centered)</SelectItem>
                              <SelectItem value="text_image">Text & Image (2 Columns)</SelectItem>
                              <SelectItem value="about_2col">About Company (2 Columns)</SelectItem>
                              
                              {/* Interactive Sections */}
                              <SelectItem value="tour_grid">Tour Ninja Grid</SelectItem>
                              <SelectItem value="cards_grid">Cards Grid</SelectItem>
                              <SelectItem value="search_bar">Search Bar</SelectItem>
                              
                              {/* Features & Layout */}
                              <SelectItem value="features_3col">Features (3 Columns)</SelectItem>
                              <SelectItem value="testimonials">Testimonials Carousel</SelectItem>
                              
                              {/* Contact & Forms */}
                              <SelectItem value="contact_cards">Contact Cards</SelectItem>
                              <SelectItem value="contact_info">Contact Information</SelectItem>
                              <SelectItem value="custom_form">Custom Form</SelectItem>
                              
                              {/* Call to Actions */}
                              <SelectItem value="cta_section">Call to Action</SelectItem>
                              <SelectItem value="cta_banner">CTA Banner</SelectItem>
                              
                              {/* Media & Maps */}
                              <SelectItem value="map_section">Map Section</SelectItem>
                              <SelectItem value="gallery">Image Gallery</SelectItem>
                              <SelectItem value="video_section">Video Section</SelectItem>
                              
                              {/* Utility & Social */}
                              <SelectItem value="newsletter">Newsletter Signup</SelectItem>
                              <SelectItem value="social_media">Social Media Links</SelectItem>
                              <SelectItem value="pdf_download">PDF Download</SelectItem>
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
                              <Label htmlFor="block-bg">Background Color</Label>
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
                      <NavigationMenuManager />
                    ) : loadingBlocks ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading blocks...</p>
                      </div>
                    ) : (
                      <RealBlocksEditor pageSlug={selectedPage} pageBlocks={pageBlocks} />
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
                      Footer Settings
                    </CardTitle>
                    <CardDescription>Manage footer content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        { id: 'contact-info', label: 'Contact Information', icon: MapPin },
                        { id: 'useful-links', label: 'Useful Links', icon: Menu },
                        { id: 'social-media', label: 'Social Media', icon: Users },
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
    </div>
  );
}

// Navigation Menu Manager Component
function NavigationMenuManager() {
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<NavigationMenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch navigation menu items
  const { data: menuItems = [], isLoading } = useQuery<NavigationMenuItem[]>({
    queryKey: ['/api/admin/navigation-menu'],
  });

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
    const itemData = {
      name: formData.get('name') as string,
      url: formData.get('url') as string,
      description: formData.get('description') as string,
      iconName: formData.get('iconName') as string,
      target: formData.get('target') as string || '_self',
      isActive: formData.get('isActive') === 'on',
      parentId: formData.get('parentId') ? parseInt(formData.get('parentId') as string) : undefined,
      displayOrder: parseInt(formData.get('displayOrder') as string) || 0,
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
      const correction = corrections.find(c => c.from === item.name);
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
          <div className="text-sm text-gray-500 truncate">{item.url}</div>
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
            onClick={() => onAddChild(item.id)}
            className="flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Sous-menu
          </Button>
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
  isLoading
}: {
  isOpen: boolean;
  onClose: () => void;
  editingItem: NavigationMenuItem | null;
  parentItems: NavigationMenuItem[];
  onSave: (formData: FormData) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    iconName: '',
    target: '_self',
    isActive: true,
    parentId: '',
    displayOrder: '0'
  });

  // Update form data when editing item changes
  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name || '',
        url: editingItem.url || '',
        description: editingItem.description || '',
        iconName: editingItem.iconName || '',
        target: editingItem.target || '_self',
        isActive: editingItem.isActive ?? true,
        parentId: editingItem.parentId?.toString() || '',
        displayOrder: editingItem.displayOrder?.toString() || '0'
      });
    } else {
      setFormData({
        name: '',
        url: '',
        description: '',
        iconName: '',
        target: '_self',
        isActive: true,
        parentId: '',
        displayOrder: '0'
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Select 
                  value={formData.url} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, url: value, name: value === '/' ? 'Home' : value === '/tours' ? 'Experiences' : value === '/custom-tour' ? 'Custom Trip' : value === '/blog' ? 'Blog' : value === '/contact' ? 'Contact' : prev.name }))}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Page du site" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="/">🏠 Home</SelectItem>
                    <SelectItem value="/tours">🌴 Experiences</SelectItem>
                    <SelectItem value="/custom-tour">✈️ Custom Trip</SelectItem>
                    <SelectItem value="/blog">📝 Blog</SelectItem>
                    <SelectItem value="/contact">📞 Contact</SelectItem>
                    <SelectItem value="/about">ℹ️ About</SelectItem>
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

            {/* Parent Menu */}
            <div className="space-y-2">
              <Label htmlFor="parentId">Menu parent (optionnel)</Label>
              <Select name="parentId" value={formData.parentId} onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un menu parent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucun (menu principal)</SelectItem>
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

            {/* Icon Name */}
            <div className="space-y-2">
              <Label htmlFor="iconName">Icône (optionnel)</Label>
              <Input
                id="iconName"
                name="iconName"
                value={formData.iconName}
                onChange={(e) => setFormData(prev => ({ ...prev, iconName: e.target.value }))}
                placeholder="ex: Home, Search, Mail..."
              />
            </div>

            {/* Display Order */}
            <div className="space-y-2">
              <Label htmlFor="displayOrder">Ordre d'affichage</Label>
              <Input
                id="displayOrder"
                name="displayOrder"
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: e.target.value }))}
                placeholder="0"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description interne pour l'administration"
              rows={2}
            />
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
function RealBlocksEditor({ pageSlug, pageBlocks }: { pageSlug: string; pageBlocks: PageBlock[] }) {
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
    const block = pageBlocks.find(b => b.id === id);
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
        <RealBlockPreview
          key={block.id}
          block={block}
          onUpdate={handleUpdateBlock}
          onDelete={handleDeleteBlock}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onToggleVisibility={handleToggleVisibility}
        />
      ))}
      
      {/* Bouton pour ajouter un nouveau bloc */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
        <Plus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-gray-600 font-medium">Ajouter un nouveau bloc</p>
        <p className="text-sm text-gray-500">Cliquez pour choisir un type de bloc</p>
      </div>
    </div>
  );
}

// Ancien composant de fallback pour compatibilité (peut être supprimé plus tard)
function VisualPageEditor({ pageSlug, pageBlocks }: { pageSlug: string; pageBlocks: PageBlock[] }) {
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
      'search_module': 'Module Recherche'
    };
    return displayNames[blockType] || blockType.replace('_', ' ');
  };

  const handleEditBlock = (block: PageBlock) => {
    // TODO: Ouvrir le modal d'édition pour ce bloc
    console.log('Edit block:', block);
  };

  const renderBlockContent = (block: PageBlock) => {
    const config = block.configuration as any || {};

    switch (block.blockType) {
      case 'video_hero':
        // Bloc 1 : Hero Principal - image de fond avec texte (proportions réduites)
        return (
          <div className="relative bg-cover bg-center text-white rounded-lg overflow-hidden h-80" 
               style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")' }}>
            
            {/* Contenu par-dessus l'image */}
            <div className="relative z-10 flex flex-col justify-center items-start p-6 h-full">
              <h1 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
                Your exclusive<br />
                experiences<br />
                <span className="text-blue-400">in Krabi</span> — THAILAND
              </h1>
              <p className="text-sm md:text-base mb-2 max-w-md">
                Discover amazing places away from mass tourism in Krabi.
              </p>
              <p className="text-sm md:text-base mb-6 max-w-md">
                And also Khao Sok, Koh Mook and many more destinations.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                  See our offers
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                  Custom your trip
                </button>
              </div>
            </div>
            
            {/* Indicateur de type de bloc */}
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              🏠 Hero avec Image
            </div>
          </div>
        );

      case 'hero':
        const bgColor = block.backgroundColor?.includes('gradient') ? block.backgroundColor : 'bg-gradient-to-r from-blue-500 to-purple-600';
        return (
          <div className={`text-center text-white p-8 rounded-lg ${bgColor}`}>
            <h1 className="text-3xl font-bold mb-4">{block.title}</h1>
            <p className="text-lg opacity-90 mb-6">{block.subtitle}</p>
            {block.description && <p className="mb-6 opacity-80">{block.description}</p>}
            {block.ctaText && (
              <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium">
                {block.ctaText}
              </button>
            )}
          </div>
        );

      case 'advantages':
        // Bloc 6 : "Why Choose Us" - 3 icônes horizontales avec sous-icônes
        const features = config.features || [
          { 
            title: 'Private Tours', 
            description: 'Experience an exclusive day trip with our professional guides and private vehicles.',
            icon: 'Car',
            subFeatures: [
              { label: 'Private Car', icon: 'Car' },
              { label: 'Guide', icon: 'User' },
              { label: 'Safety', icon: 'Shield' }
            ]
          },
          { 
            title: 'Customized Itineraries', 
            description: 'Create your own journey based on your desires, your pace, and your interests.',
            icon: 'Map',
            subFeatures: [
              { label: 'Custom Route', icon: 'Map' },
              { label: 'Your Pace', icon: 'Clock' },
              { label: 'Your Interests', icon: 'Heart' }
            ]
          },
          { 
            title: 'Authentic Experiences', 
            description: 'Discover hidden gems and local secrets away from mass tourism.',
            icon: 'Gem',
            subFeatures: [
              { label: 'Hidden Gems', icon: 'Search' },
              { label: 'Local Guides', icon: 'Users' },
              { label: 'Authentic', icon: 'Star' }
            ]
          }
        ];
        
        return (
          <div className="bg-white p-6 rounded-lg">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">Why Choose Us</h2>
              <div className="w-12 h-0.5 bg-yellow-400 mx-auto mb-3"></div>
              <p className="text-gray-600 max-w-xl mx-auto text-sm">
                Experience an exclusive private day trip with our English or French-speaking and certified guides.
              </p>
            </div>
            
            {/* 3 cartes horizontales côte à côte */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature: any, i: number) => (
                <div key={i} className="text-center">
                  {/* Icône principale */}
                  <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <div className="text-white">
                      {/* Simuler icône Lucide */}
                      <div className="w-8 h-8 bg-white rounded opacity-90"></div>
                    </div>
                  </div>
                  
                  {/* Titre et description */}
                  <h3 className="text-base font-bold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 mb-4 text-xs leading-relaxed">{feature.description}</p>
                  
                  {/* Sous-caractéristiques avec icônes en horizontal */}
                  {feature.subFeatures && (
                    <div className="flex justify-center gap-2">
                      {feature.subFeatures.map((sub: any, j: number) => (
                        <div key={j} className="text-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-1 flex items-center justify-center">
                            <div className="w-4 h-4 bg-blue-600 rounded opacity-80"></div>
                          </div>
                          <p className="text-xs font-medium text-gray-700">{sub.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'text_image':
        // Bloc 2 : "When expats welcome you" - Texte centré avec trait doré
        if (block.identifier === 'about_amon_tour') {
          return (
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
                  When expats welcome you<br />in their host country
                </h2>
                <div className="w-12 h-0.5 bg-yellow-400 mx-auto mb-6"></div>
                <p className="text-base text-gray-700 leading-relaxed max-w-2xl mx-auto">
                  This is a family-run travel agency that combines the organization of exclusive 
                  activities with the creation of tailor-made trips throughout the country. Our goal is to offer an 
                  immersive experience, far from mass tourism, with personalized service for every traveler — 
                  as if we were welcoming our own family or friends.
                </p>
              </div>
            </div>
          );
        }
        // Bloc 7 : "Who We Are" - Texte à gauche, images à droite
        return (
          <div className="bg-white p-6 rounded-lg">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 text-left">Who We Are</h2>
              <div className="w-12 h-0.5 bg-yellow-400 mb-6"></div>
              
              {/* Section avec image famille - Texte à gauche, image à droite */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center mb-8">
                <div>
                  <h3 className="text-base font-bold mb-3 text-gray-900 text-left">French Family in Thailand</h3>
                  <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                    We are Éric, Margaux, Gabriel, and Raphaël, a French family living in Krabi, southern Thailand, since 2013.
                  </p>
                  
                  <p className="text-sm text-gray-700 leading-relaxed">
                    From our life here, we created Amon Tour — a small, independent travel agency built on a simple idea: 
                    personally welcome our travelers to Krabi and offer them a different way to experience Thailand.
                  </p>
                </div>
                <div className="bg-blue-200 h-32 rounded-lg flex items-center justify-center">
                  <img src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="French Family" className="w-full h-full object-cover rounded-lg" />
                </div>
              </div>

              {/* Section Deep Local Roots - Texte à gauche, image à droite */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center mb-8">
                <div>
                  <h3 className="text-base font-bold mb-3 text-gray-900 text-left">Deep Local Roots</h3>
                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                    We live here year-round, in the heart of the region we love. This close connection to the destination 
                    allows us to offer exclusive experiences in Krabi, designed and guided by our team of professional 
                    local guides or trusted partners.
                  </p>

                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                    You're not booking a generic tour — you're being welcomed, guided, and cared for by people who live 
                    here, who know the tides, the seasons, the crowds to avoid, and the hidden gems worth discovering.
                  </p>
                </div>
                <div className="bg-blue-200 h-32 rounded-lg flex items-center justify-center">
                  <img src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Local Guides" className="w-full h-full object-cover rounded-lg" />
                </div>
              </div>

              {/* Section Our Concept centrée */}
              <div className="text-center max-w-2xl mx-auto">
                <h3 className="text-base font-bold mb-3 text-gray-900">Our Concept</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Combine the warmth and proximity of a local guide with professional organization.
                </p>
              </div>
            </div>
          </div>
        );

      case 'card_grid':
        const itemCount = config.displayCount || config.itemsPerPage || (block.identifier === 'trip_ideas' ? 20 : 6);
        
        // Bloc 3 : "Our Popular Experiences" - Grille de cartes avec bouton
        if (block.identifier === 'featured_tours') {
          return (
            <div className="bg-white p-6 rounded-lg">
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">Our Popular Experiences</h2>
                <div className="w-12 h-0.5 bg-yellow-400 mx-auto mb-3"></div>
                <p className="text-gray-600 max-w-xl mx-auto text-sm">
                  Step off the beaten path into carefully curated experiences beyond the tourist trail.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: Math.min(itemCount, 6) }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <div className="bg-blue-300 h-32 flex items-center justify-center">
                        <span className="text-white text-xs">Tour Image</span>
                      </div>
                      <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-medium">
                        1jour
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold mb-2 text-gray-900 text-sm">
                        Private day trip to Phang Nga Bay
                      </h3>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        Sail through the heart of Phang Nga Bay, a spectacular landscape reminiscent of Halong Bay...
                      </p>
                      <div className="flex justify-between items-center">
                        <button className="text-blue-600 text-xs font-medium border border-blue-600 px-3 py-1 rounded">Details ›</button>
                        <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium">Book ›</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Bouton View All Tours */}
              <div className="text-center mt-6">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                  View all our tours
                </button>
              </div>
            </div>
          );
        }
        
        // Bloc 5 : "Some Ideas For Your Next Trip" - Grille 20 tours
        if (block.identifier === 'trip_ideas' || block.title?.includes('Ideas') || block.title?.includes('Next Trip')) {
          return (
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">Some Ideas For Your Next Trip</h2>
                <div className="w-12 h-0.5 bg-yellow-400 mx-auto mb-3"></div>
                <p className="text-gray-600 max-w-xl mx-auto text-sm">
                  Get inspired by our custom-designed travel experiences.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: Math.min(itemCount, 20) }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <div className="bg-blue-400 h-40 flex flex-col items-center justify-center text-white p-4">
                        <div className="absolute top-2 right-2 bg-white text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                          ฿2,500
                        </div>
                        <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center mb-3">
                          <div className="w-4 h-4 bg-white rounded-full"></div>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-sm">Krabi, Thailand</p>
                          <p className="text-xs opacity-90">Presentation Image</p>
                        </div>
                        <div className="absolute bottom-2 right-2 text-xs opacity-75">
                          Custom
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold mb-2 text-gray-900 text-sm">
                        Private day trip to Phang Nga Bay
                      </h3>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        Sail through the heart of Phang Nga Bay...
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>📍 Krabi</span>
                        <span className="ml-3">⏱️ 1j</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // Grille générique
        return (
          <div className="bg-white p-8 rounded-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">{block.title}</h2>
              <p className="text-gray-600">{block.subtitle}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: Math.min(itemCount, 6) }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                  <div className="bg-gray-200 h-40 rounded mb-3 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Tour {i + 1}</span>
                  </div>
                  <h3 className="font-medium mb-2">Expérience {i + 1}</h3>
                  <p className="text-sm text-gray-600 mb-2">Description de l'expérience...</p>
                  <p className="text-blue-600 font-semibold">À partir de {2500 + (i * 500)} THB</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'gallery':
        // Bloc 8 : "Our Traveler's Reviews" - Titre/description sur fond bleu, contenu blanc séparé
        if (block.identifier === 'customer_reviews') {
          return (
            <div className="bg-blue-600 p-6 rounded-lg">
              {/* Titre et description sur fond bleu */}
              <div className="text-center mb-6 text-white">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">Our Travelers' Reviews</h2>
                <div className="w-12 h-0.5 bg-yellow-400 mx-auto mb-3"></div>
                <p className="max-w-xl mx-auto text-sm opacity-90">
                  Discover the authentic experiences of our clients during their journeys with Amon Tour in Thailand.
                </p>
              </div>
              
              {/* Contenu blanc à l'intérieur - seulement les avis */}
              <div className="bg-white rounded-lg p-6">
                {/* Note Google en haut */}
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-2 text-2xl">
                    ⭐⭐⭐⭐⭐
                  </div>
                  <div className="text-xl font-bold text-gray-900 mb-1">5.0 on Google</div>
                  <p className="text-gray-600 text-sm">Based on 80 reviews</p>
                </div>

                {/* 3 témoignages en bas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      name: "Sophie L.",
                      initial: "S",
                      review: "We spent 2 wonderful days with Eric and Margaux who showed us amazing places. A unique and authentic experience that we will never forget!"
                    },
                    {
                      name: "Marco T.",
                      initial: "M",
                      review: "Perfect organization, incredible landscapes, and guides who really know their region. Amon Tour exceeded all our expectations!"
                    },
                    {
                      name: "Claire D.",
                      initial: "C",
                      review: "An exceptional trip to Krabi with a local family. We discovered secret places that no other tourists know about. Highly recommended!"
                    }
                  ].map((testimonial, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex text-yellow-400 mb-3 text-sm">
                        ⭐⭐⭐⭐⭐
                      </div>
                      <p className="italic mb-3 text-gray-700 text-xs leading-relaxed">
                        "{testimonial.review}"
                      </p>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-2 text-sm">
                          {testimonial.initial}
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{testimonial.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        } else if (block.identifier === 'office_location') {
          return (
            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">{block.title}</h2>
                <p className="text-gray-600">{block.subtitle}</p>
              </div>
              <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">🗺️ Carte Interactive - Ao Nang, Krabi</span>
              </div>
            </div>
          );
        }
        break;

      case 'contact_info':
        const contactCards = config.cards || [
          { icon: 'Mail', title: 'Email Us', description: 'info@amon-tour.com' },
          { icon: 'Phone', title: 'Call Us', description: '+66 (0)6 2574 8788' },
          { icon: 'MessageCircle', title: 'WhatsApp', description: '+66 (0)6 2574 8788' },
          { icon: 'MapPin', title: 'Visit Us', description: 'Ao Nang, Krabi, Thailand' }
        ];
        return (
          <div>
            <h2 className="text-2xl font-bold text-center mb-8">{block.title || "Comment nous joindre"}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contactCards.map((card: any, i: number) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-blue-600 rounded"></div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{card.title}</h3>
                    <p className="text-gray-600">{card.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'form':
        // Bloc 4 : "Create Your Custom Trip" - Image gauche avec titre + formulaire complet droite
        if (block.title?.includes('Custom') || block.identifier?.includes('custom')) {
          const imageUrl = config.imageUrl || '/catamaran-cruise.png';
          const imageAlt = config.imageAlt || 'Catamaran cruise in Thailand';
          
          return (
            <div className="bg-white p-6 rounded-lg">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                
                {/* Section gauche - Image avec titre et description dedans */}
                <div className="relative bg-cover bg-center rounded-lg overflow-hidden h-64" 
                     style={{ backgroundImage: `linear-gradient(rgba(30, 115, 190, 0.7), rgba(30, 115, 190, 0.7)), url("${imageUrl}")` }}>
                  <div className="absolute inset-0 flex flex-col justify-center items-start p-6 text-white">
                    <h2 className="text-xl font-bold mb-2">
                      {block.title || 'Create Your Custom Trip'}
                    </h2>
                    <p className="text-sm leading-relaxed">
                      {block.subtitle || 'Your travel story starts with your dreams, let us write the rest.'}
                    </p>
                  </div>
                </div>
                
                {/* Section droite avec formulaire complet */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-base font-semibold mb-4 text-gray-900">
                    {block.description || 'Tell us about your dream trip'}
                  </h3>
                  
                  <div className="space-y-3">
                    {/* Full Name & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Full Name *</label>
                        <input 
                          type="text" 
                          placeholder="Your name" 
                          className="w-full p-2 border border-gray-300 rounded bg-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Email *</label>
                        <input 
                          type="email" 
                          placeholder="Your email" 
                          className="w-full p-2 border border-gray-300 rounded bg-white text-sm"
                        />
                      </div>
                    </div>
                    
                    {/* Country Code & WhatsApp */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Country Code *</label>
                        <select className="w-full p-2 border border-gray-300 rounded bg-white text-sm">
                          <option>🇫🇷 +33</option>
                          <option>🇹🇭 +66</option>
                          <option>🇺🇸 +1</option>
                          <option>🇬🇧 +44</option>
                          <option>🇩🇪 +49</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium mb-1 text-gray-700">WhatsApp Number *</label>
                        <input 
                          type="text" 
                          placeholder="Your WhatsApp number" 
                          className="w-full p-2 border border-gray-300 rounded bg-white text-sm"
                        />
                      </div>
                    </div>
                    
                    {/* Number of Adults & Kids */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Number of adults</label>
                        <select className="w-full p-2 border border-gray-300 rounded bg-white text-sm">
                          <option>Select number of adults</option>
                          <option>1 adult</option>
                          <option>2 adults</option>
                          <option>3 adults</option>
                          <option>4 adults</option>
                          <option>5 adults</option>
                          <option>6+ adults</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Number of kids (under 12 years old)</label>
                        <select className="w-full p-2 border border-gray-300 rounded bg-white text-sm">
                          <option>Select number of kids</option>
                          <option>No kids</option>
                          <option>1 kid</option>
                          <option>2 kids</option>
                          <option>3 kids</option>
                          <option>4 kids</option>
                          <option>5+ kids</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Dates & Duration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Dates of trip</label>
                        <input 
                          type="text" 
                          placeholder="Select trip dates" 
                          className="w-full p-2 border border-gray-300 rounded bg-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Or approximate duration</label>
                        <select className="w-full p-2 border border-gray-300 rounded bg-white text-sm">
                          <option>Select duration</option>
                          <option>1-3 days</option>
                          <option>4-7 days</option>
                          <option>8-14 days</option>
                          <option>15+ days</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Trip Types */}
                    <div>
                      <label className="block text-xs font-medium mb-2 text-gray-700">Trip Types</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        <label className="flex items-center text-xs">
                          <input type="checkbox" className="mr-2" />
                          Culture & History
                        </label>
                        <label className="flex items-center text-xs">
                          <input type="checkbox" className="mr-2" />
                          Nature & Adventure
                        </label>
                        <label className="flex items-center text-xs">
                          <input type="checkbox" className="mr-2" />
                          Beaches & Islands
                        </label>
                        <label className="flex items-center text-xs">
                          <input type="checkbox" className="mr-2" />
                          Family trip
                        </label>
                        <label className="flex items-center text-xs">
                          <input type="checkbox" className="mr-2" />
                          Group trip
                        </label>
                        <label className="flex items-center text-xs">
                          <input type="checkbox" className="mr-2" />
                          Wedding & Honeymoon
                        </label>
                      </div>
                    </div>
                    
                    {/* Destinations */}
                    <div>
                      <label className="block text-xs font-medium mb-2 text-gray-700">Destinations</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        <label className="flex items-center text-xs">
                          <input type="checkbox" className="mr-2" />
                          Khao Sok
                        </label>
                        <label className="flex items-center text-xs">
                          <input type="checkbox" className="mr-2" />
                          Krabi
                        </label>
                        <label className="flex items-center text-xs">
                          <input type="checkbox" className="mr-2" />
                          Koh Mook
                        </label>
                        <label className="flex items-center text-xs">
                          <input type="checkbox" className="mr-2" />
                          Bangkok
                        </label>
                        <label className="flex items-center text-xs">
                          <input type="checkbox" className="mr-2" />
                          Chiang Mai
                        </label>
                        <label className="flex items-center text-xs">
                          <input type="checkbox" className="mr-2" />
                          Others destinations
                        </label>
                      </div>
                    </div>
                    
                    {/* Message */}
                    <div>
                      <label className="block text-xs font-medium mb-1 text-gray-700">Describe your ideal trip</label>
                      <textarea 
                        rows={4}
                        placeholder="Tell us what you would like to see and do during your journey..." 
                        className="w-full p-2 border border-gray-300 rounded bg-white text-sm"
                      ></textarea>
                    </div>
                    
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium transition-colors">
                      {config.submitText || 'Send my request'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        
        // Formulaire de contact standard
        return (
          <div className="bg-gray-50 p-8 rounded-lg">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">{block.title}</h2>
                <p className="text-gray-600">{block.description}</p>
              </div>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded border">
                  <span className="text-gray-500">📧 Nom complet</span>
                </div>
                <div className="bg-white p-4 rounded border">
                  <span className="text-gray-500">✉️ Email</span>
                </div>
                <div className="bg-white p-4 rounded border">
                  <span className="text-gray-500">📝 Sujet</span>
                </div>
                <div className="bg-white p-4 rounded border h-24">
                  <span className="text-gray-500">💬 Message</span>
                </div>
                <button className="w-full bg-blue-600 text-white p-4 rounded font-medium">
                  Envoyer le message
                </button>
              </div>
            </div>
          </div>
        );

      case 'search_module':
        return (
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-bold text-center mb-6">{block.title}</h2>
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-4 mb-4">
                <div className="flex-1 bg-gray-100 p-3 rounded">
                  <span className="text-gray-500">🔍 {config.placeholder || 'Rechercher...'}</span>
                </div>
                <button className="bg-blue-600 text-white px-6 py-3 rounded">Rechercher</button>
              </div>
              {config.showFilters && (
                <div className="flex gap-2 justify-center">
                  {(config.filterOptions || ['Culture', 'Adventure', 'Food', 'Nature']).map((filter: string, i: number) => (
                    <span key={i} className="bg-gray-200 px-3 py-1 rounded text-sm">{filter}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-gray-100 p-8 rounded-lg text-center">
            <h3 className="font-semibold mb-2">{block.title || `Bloc ${block.blockType}`}</h3>
            <p className="text-gray-600 text-sm">{block.description || "Aperçu du contenu du bloc..."}</p>
            <span className="inline-block mt-2 bg-gray-200 px-3 py-1 rounded text-xs">
              Type: {block.blockType}
            </span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">
          🔧 Éditeur Visuel - {getPageTitle(pageSlug)}
        </h3>
        <p className="text-blue-700 text-sm">
          Blocs affichés avec leurs vraies données et contrôles d'édition visibles.
          Utilisez les boutons pour modifier, réorganiser ou gérer chaque section.
        </p>
      </div>

      {/* Blocks */}
      <div className="space-y-3">
        {pageBlocks.map((block, index) => (
          <div key={block.id} className="border-2 border-blue-200 rounded-lg bg-white overflow-hidden">
            {/* Block header with controls */}
            <div className="bg-blue-50 px-4 py-3 border-b border-blue-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-medium">
                  {block.blockOrder}
                </div>
                <span className="font-medium text-blue-800">
                  {block.title || getBlockDisplayName(block.blockType)}
                </span>
                <Badge variant="outline" className="text-xs">
                  {block.blockType}
                </Badge>
                {!block.isActive && (
                  <Badge variant="secondary" className="text-xs">
                    Masqué
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" title="Déplacer vers le haut" disabled={index === 0}>
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" title="Déplacer vers le bas" disabled={index === pageBlocks.length - 1}>
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" title="Modifier" onClick={() => handleEditBlock(block)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" title="Masquer" className="text-orange-600">
                  <EyeOff className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" title="Supprimer" className="text-red-600">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Block content preview */}
            <div className="p-6">
              {renderBlockContent(block)}
            </div>
          </div>
        ))}

        {/* Add new block button */}
        <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
          <Plus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600 font-medium">Ajouter un nouveau bloc</p>
          <p className="text-sm text-gray-500">Cliquez pour choisir un type de bloc</p>
        </button>
      </div>
    </div>
  );
}