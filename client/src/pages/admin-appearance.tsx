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
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
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
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
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
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
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
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
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

export default function AdminAppearance() {
  const [, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState<string>('theme');
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

  const availablePages = [
    { slug: 'home', name: 'Home Page', type: 'main' },
    { slug: 'experiences', name: 'Experiences', type: 'main' },
    { slug: 'custom-tour', name: 'Custom Tour', type: 'main' },
    { slug: 'contact-us', name: 'Contact Us', type: 'main' },
    { slug: 'blog', name: 'Blog', type: 'main' }
  ];

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
          title: 'Discover the Hidden Gems of Krabi',
          subtitle: 'With Expert Local Guides',
          ctaText: 'Explore Tours',
          ctaUrl: '/experiences',
          imageUrl: '/attached_assets/hero-image.jpg',
          iconName: 'map-pin',
          backgroundColor: 'white',
          configuration: { hasButton: true }
        };
      case 'text_image':
        return {
          title: 'About Our Tours',
          content: 'Experience the authentic Thailand with our carefully curated tours and local expertise.',
          iconName: 'compass',
          configuration: { alignment: 'left', imagePosition: 'right' }
        };
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
      case 'about_company':
        return {
          title: 'About Amon Tour',
          content: 'Born and raised in Krabi, we are your local experts for authentic Thai experiences.',
          configuration: { showStats: true }
        };
      case 'cta_section':
        return {
          title: 'Ready to Start Your Adventure?',
          description: 'Join thousands of satisfied travelers who discovered Thailand with us.',
          ctaText: 'Book Your Tour Now',
          ctaUrl: '/experiences',
          configuration: { style: 'primary' }
        };
      default:
        return {
          title: 'New Block',
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
      case 'hero': return <Star className="w-4 h-4" />;
      case 'text_image': return <FileText className="w-4 h-4" />;
      case 'contact_form': return <Mail className="w-4 h-4" />;
      case 'about_company': return <Users className="w-4 h-4" />;
      case 'cta_section': return <Download className="w-4 h-4" />;
      default: return <Layout className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Palette className="h-7 w-7 text-blue-600" />
                Site Appearance Management
              </h1>
              <p className="text-gray-600">Customize your website theme, pages, and footer</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setLocation('/admin')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admin
            </Button>
          </div>
        </div>

        {/* Main Navigation */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="theme" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Theme
            </TabsTrigger>
            <TabsTrigger value="pages" className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              Pages
            </TabsTrigger>
            <TabsTrigger value="footer" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Footer
            </TabsTrigger>
          </TabsList>

          {/* Theme Management */}
          <TabsContent value="theme">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Colors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Colors
                  </CardTitle>
                  <CardDescription>Customize your site's color scheme</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <Input
                        id="primary-color"
                        type="color"
                        value={getSiteSetting('theme', 'primary_color') || '#1e73be'}
                        onChange={(e) => updateSiteSetting('theme', 'primary_color', e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={getSiteSetting('theme', 'primary_color') || '#1e73be'}
                        onChange={(e) => updateSiteSetting('theme', 'primary_color', e.target.value)}
                        placeholder="#1e73be"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <Input
                        id="secondary-color"
                        type="color"
                        value={getSiteSetting('theme', 'secondary_color') || '#E6B64C'}
                        onChange={(e) => updateSiteSetting('theme', 'secondary_color', e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={getSiteSetting('theme', 'secondary_color') || '#E6B64C'}
                        onChange={(e) => updateSiteSetting('theme', 'secondary_color', e.target.value)}
                        placeholder="#E6B64C"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Announcement Banner */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Announcement Banner
                  </CardTitle>
                  <CardDescription>Site-wide announcement banner</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="banner-enabled"
                      checked={JSON.parse(getSiteSetting('theme', 'announcement_banner') || '{"enabled": false}').enabled}
                      onCheckedChange={(checked) => {
                        const current = JSON.parse(getSiteSetting('theme', 'announcement_banner') || '{"enabled": false}');
                        updateSiteSetting('theme', 'announcement_banner', JSON.stringify({...current, enabled: checked}));
                      }}
                    />
                    <Label htmlFor="banner-enabled">Enable Banner</Label>
                  </div>
                  <div>
                    <Label>Banner Text</Label>
                    <Input
                      placeholder="e.g., Special offer: 20% off all tours this month!"
                      value={JSON.parse(getSiteSetting('theme', 'announcement_banner') || '{"text": ""}').text}
                      onChange={(e) => {
                        const current = JSON.parse(getSiteSetting('theme', 'announcement_banner') || '{"text": ""}');
                        updateSiteSetting('theme', 'announcement_banner', JSON.stringify({...current, text: e.target.value}));
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Background Color</Label>
                      <Input
                        type="color"
                        value={JSON.parse(getSiteSetting('theme', 'announcement_banner') || '{"background_color": "#1e73be"}').background_color}
                        onChange={(e) => {
                          const current = JSON.parse(getSiteSetting('theme', 'announcement_banner') || '{"background_color": "#1e73be"}');
                          updateSiteSetting('theme', 'announcement_banner', JSON.stringify({...current, background_color: e.target.value}));
                        }}
                      />
                    </div>
                    <div>
                      <Label>Text Color</Label>
                      <Input
                        type="color"
                        value={JSON.parse(getSiteSetting('theme', 'announcement_banner') || '{"text_color": "#ffffff"}').text_color}
                        onChange={(e) => {
                          const current = JSON.parse(getSiteSetting('theme', 'announcement_banner') || '{"text_color": "#ffffff"}');
                          updateSiteSetting('theme', 'announcement_banner', JSON.stringify({...current, text_color: e.target.value}));
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Typography */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="w-5 h-5" />
                    Typography
                  </CardTitle>
                  <CardDescription>Font families and text styles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Heading Font</Label>
                    <Select 
                      value={JSON.parse(getSiteSetting('theme', 'typography') || '{"heading_font": "Poppins"}').heading_font}
                      onValueChange={(value) => {
                        const current = JSON.parse(getSiteSetting('theme', 'typography') || '{"heading_font": "Poppins"}');
                        updateSiteSetting('theme', 'typography', JSON.stringify({...current, heading_font: value}));
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
                      value={JSON.parse(getSiteSetting('theme', 'typography') || '{"body_font": "Inter"}').body_font}
                      onValueChange={(value) => {
                        const current = JSON.parse(getSiteSetting('theme', 'typography') || '{"body_font": "Inter"}');
                        updateSiteSetting('theme', 'typography', JSON.stringify({...current, body_font: value}));
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
                        value={JSON.parse(getSiteSetting('theme', 'typography') || '{"heading_weight": "600"}').heading_weight}
                        onValueChange={(value) => {
                          const current = JSON.parse(getSiteSetting('theme', 'typography') || '{"heading_weight": "600"}');
                          updateSiteSetting('theme', 'typography', JSON.stringify({...current, heading_weight: value}));
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
                        value={JSON.parse(getSiteSetting('theme', 'typography') || '{"body_weight": "400"}').body_weight}
                        onValueChange={(value) => {
                          const current = JSON.parse(getSiteSetting('theme', 'typography') || '{"body_weight": "400"}');
                          updateSiteSetting('theme', 'typography', JSON.stringify({...current, body_weight: value}));
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
                        value={JSON.parse(getSiteSetting('theme', 'typography') || '{"base_size": "16px"}').base_size}
                        onValueChange={(value) => {
                          const current = JSON.parse(getSiteSetting('theme', 'typography') || '{"base_size": "16px"}');
                          updateSiteSetting('theme', 'typography', JSON.stringify({...current, base_size: value}));
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
                </CardContent>
              </Card>

              {/* Color Palette Extended */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Extended Color Palette
                  </CardTitle>
                  <CardDescription>Complete color scheme for your site</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Background Color</Label>
                      <Input
                        type="color"
                        value={JSON.parse(getSiteSetting('theme', 'color_palette') || '{"background": "#ffffff"}').background}
                        onChange={(e) => {
                          const current = JSON.parse(getSiteSetting('theme', 'color_palette') || '{"background": "#ffffff"}');
                          updateSiteSetting('theme', 'color_palette', JSON.stringify({...current, background: e.target.value}));
                        }}
                      />
                    </div>
                    <div>
                      <Label>Text Color</Label>
                      <Input
                        type="color"
                        value={JSON.parse(getSiteSetting('theme', 'color_palette') || '{"text": "#1a1a1a"}').text}
                        onChange={(e) => {
                          const current = JSON.parse(getSiteSetting('theme', 'color_palette') || '{"text": "#1a1a1a"}');
                          updateSiteSetting('theme', 'color_palette', JSON.stringify({...current, text: e.target.value}));
                        }}
                      />
                    </div>
                    <div>
                      <Label>Success Color</Label>
                      <Input
                        type="color"
                        value={JSON.parse(getSiteSetting('theme', 'color_palette') || '{"success": "#10b981"}').success}
                        onChange={(e) => {
                          const current = JSON.parse(getSiteSetting('theme', 'color_palette') || '{"success": "#10b981"}');
                          updateSiteSetting('theme', 'color_palette', JSON.stringify({...current, success: e.target.value}));
                        }}
                      />
                    </div>
                    <div>
                      <Label>Error Color</Label>
                      <Input
                        type="color"
                        value={JSON.parse(getSiteSetting('theme', 'color_palette') || '{"error": "#ef4444"}').error}
                        onChange={(e) => {
                          const current = JSON.parse(getSiteSetting('theme', 'color_palette') || '{"error": "#ef4444"}');
                          updateSiteSetting('theme', 'color_palette', JSON.stringify({...current, error: e.target.value}));
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Button Styles */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MousePointer className="w-5 h-5" />
                    Button Styles
                  </CardTitle>
                  <CardDescription>Customize button appearance and behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Border Radius</Label>
                    <Select 
                      value={JSON.parse(getSiteSetting('theme', 'button_styles') || '{"border_radius": "8px"}').border_radius}
                      onValueChange={(value) => {
                        const current = JSON.parse(getSiteSetting('theme', 'button_styles') || '{"border_radius": "8px"}');
                        updateSiteSetting('theme', 'button_styles', JSON.stringify({...current, border_radius: value}));
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
                      value={JSON.parse(getSiteSetting('theme', 'button_styles') || '{"shadow": "medium"}').shadow}
                      onValueChange={(value) => {
                        const current = JSON.parse(getSiteSetting('theme', 'button_styles') || '{"shadow": "medium"}');
                        updateSiteSetting('theme', 'button_styles', JSON.stringify({...current, shadow: value}));
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
                      value={JSON.parse(getSiteSetting('theme', 'button_styles') || '{"hover_effect": "scale"}').hover_effect}
                      onValueChange={(value) => {
                        const current = JSON.parse(getSiteSetting('theme', 'button_styles') || '{"hover_effect": "scale"}');
                        updateSiteSetting('theme', 'button_styles', JSON.stringify({...current, hover_effect: value}));
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
                </CardContent>
              </Card>

              {/* SEO Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
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

              {/* Logo & Favicon Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    Logo & Favicon
                  </CardTitle>
                  <CardDescription>Manage site logos and favicon</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Header Logo</Label>
                    <Input
                      placeholder="/src/assets/logo-a.png"
                      value={JSON.parse(getSiteSetting('theme', 'logo_settings') || '{"header_logo": ""}').header_logo}
                      onChange={(e) => {
                        const current = JSON.parse(getSiteSetting('theme', 'logo_settings') || '{"header_logo": ""}');
                        updateSiteSetting('theme', 'logo_settings', JSON.stringify({...current, header_logo: e.target.value}));
                      }}
                    />
                  </div>
                  <div>
                    <Label>Footer Logo</Label>
                    <Input
                      placeholder="/src/assets/logo-a.png"
                      value={JSON.parse(getSiteSetting('theme', 'logo_settings') || '{"footer_logo": ""}').footer_logo}
                      onChange={(e) => {
                        const current = JSON.parse(getSiteSetting('theme', 'logo_settings') || '{"footer_logo": ""}');
                        updateSiteSetting('theme', 'logo_settings', JSON.stringify({...current, footer_logo: e.target.value}));
                      }}
                    />
                  </div>
                  <div>
                    <Label>Favicon</Label>
                    <Input
                      placeholder="/favicon.ico"
                      value={JSON.parse(getSiteSetting('theme', 'logo_settings') || '{"favicon": ""}').favicon}
                      onChange={(e) => {
                        const current = JSON.parse(getSiteSetting('theme', 'logo_settings') || '{"favicon": ""}');
                        updateSiteSetting('theme', 'logo_settings', JSON.stringify({...current, favicon: e.target.value}));
                      }}
                    />
                  </div>
                  <div>
                    <Label>Logo Height</Label>
                    <Select 
                      value={JSON.parse(getSiteSetting('theme', 'logo_settings') || '{"logo_height": "48px"}').logo_height}
                      onValueChange={(value) => {
                        const current = JSON.parse(getSiteSetting('theme', 'logo_settings') || '{"logo_height": "48px"}');
                        updateSiteSetting('theme', 'logo_settings', JSON.stringify({...current, logo_height: value}));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="32px">Small (32px)</SelectItem>
                        <SelectItem value="40px">Medium (40px)</SelectItem>
                        <SelectItem value="48px">Large (48px)</SelectItem>
                        <SelectItem value="64px">X-Large (64px)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Pop-up Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
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
                      value={JSON.parse(getSiteSetting('theme', 'popup_settings') || '{"type": "newsletter"}').type}
                      onValueChange={(value) => {
                        const current = JSON.parse(getSiteSetting('theme', 'popup_settings') || '{"type": "newsletter"}');
                        updateSiteSetting('theme', 'popup_settings', JSON.stringify({...current, type: value}));
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
                      value={JSON.parse(getSiteSetting('theme', 'popup_settings') || '{"title": ""}').title}
                      onChange={(e) => {
                        const current = JSON.parse(getSiteSetting('theme', 'popup_settings') || '{"title": ""}');
                        updateSiteSetting('theme', 'popup_settings', JSON.stringify({...current, title: e.target.value}));
                      }}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Subscribe to our newsletter for exclusive travel tips and special offers."
                      value={JSON.parse(getSiteSetting('theme', 'popup_settings') || '{"description": ""}').description}
                      onChange={(e) => {
                        const current = JSON.parse(getSiteSetting('theme', 'popup_settings') || '{"description": ""}');
                        updateSiteSetting('theme', 'popup_settings', JSON.stringify({...current, description: e.target.value}));
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Button Text</Label>
                      <Input
                        placeholder="Subscribe"
                        value={JSON.parse(getSiteSetting('theme', 'popup_settings') || '{"button_text": "Subscribe"}').button_text}
                        onChange={(e) => {
                          const current = JSON.parse(getSiteSetting('theme', 'popup_settings') || '{"button_text": "Subscribe"}');
                          updateSiteSetting('theme', 'popup_settings', JSON.stringify({...current, button_text: e.target.value}));
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
                </CardContent>
              </Card>

              {/* Background Colors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Background Colors
                  </CardTitle>
                  <CardDescription>Section-specific background colors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Hero Section Background</Label>
                    <Input
                      placeholder="linear-gradient(135deg, #1e73be 0%, #0c4a6e 100%)"
                      value={JSON.parse(getSiteSetting('theme', 'background_colors') || '{"hero_bg": ""}').hero_bg}
                      onChange={(e) => {
                        const current = JSON.parse(getSiteSetting('theme', 'background_colors') || '{"hero_bg": ""}');
                        updateSiteSetting('theme', 'background_colors', JSON.stringify({...current, hero_bg: e.target.value}));
                      }}
                    />
                  </div>
                  <div>
                    <Label>Page Background</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="color"
                        value={JSON.parse(getSiteSetting('theme', 'background_colors') || '{"page_bg": "#ffffff"}').page_bg}
                        onChange={(e) => {
                          const current = JSON.parse(getSiteSetting('theme', 'background_colors') || '{"page_bg": "#ffffff"}');
                          updateSiteSetting('theme', 'background_colors', JSON.stringify({...current, page_bg: e.target.value}));
                        }}
                        className="w-20"
                      />
                      <Input
                        value={JSON.parse(getSiteSetting('theme', 'background_colors') || '{"page_bg": "#ffffff"}').page_bg}
                        onChange={(e) => {
                          const current = JSON.parse(getSiteSetting('theme', 'background_colors') || '{"page_bg": "#ffffff"}');
                          updateSiteSetting('theme', 'background_colors', JSON.stringify({...current, page_bg: e.target.value}));
                        }}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Footer Background</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="color"
                        value={JSON.parse(getSiteSetting('theme', 'background_colors') || '{"footer_bg": "#000000"}').footer_bg}
                        onChange={(e) => {
                          const current = JSON.parse(getSiteSetting('theme', 'background_colors') || '{"footer_bg": "#000000"}');
                          updateSiteSetting('theme', 'background_colors', JSON.stringify({...current, footer_bg: e.target.value}));
                        }}
                        className="w-20"
                      />
                      <Input
                        value={JSON.parse(getSiteSetting('theme', 'background_colors') || '{"footer_bg": "#000000"}').footer_bg}
                        onChange={(e) => {
                          const current = JSON.parse(getSiteSetting('theme', 'background_colors') || '{"footer_bg": "#000000"}');
                          updateSiteSetting('theme', 'background_colors', JSON.stringify({...current, footer_bg: e.target.value}));
                        }}
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Section Background</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="color"
                        value={JSON.parse(getSiteSetting('theme', 'background_colors') || '{"section_bg": "#f8fafc"}').section_bg}
                        onChange={(e) => {
                          const current = JSON.parse(getSiteSetting('theme', 'background_colors') || '{"section_bg": "#f8fafc"}');
                          updateSiteSetting('theme', 'background_colors', JSON.stringify({...current, section_bg: e.target.value}));
                        }}
                        className="w-20"
                      />
                      <Input
                        value={JSON.parse(getSiteSetting('theme', 'background_colors') || '{"section_bg": "#f8fafc"}').section_bg}
                        onChange={(e) => {
                          const current = JSON.parse(getSiteSetting('theme', 'background_colors') || '{"section_bg": "#f8fafc"}');
                          updateSiteSetting('theme', 'background_colors', JSON.stringify({...current, section_bg: e.target.value}));
                        }}
                        placeholder="#f8fafc"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pages Management */}
          <TabsContent value="pages">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Page Selector */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layout className="w-5 h-5" />
                    Select Page
                  </CardTitle>
                  <CardDescription>Choose page to edit</CardDescription>
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
                        {page.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Page Content Blocks */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Content Blocks for {selectedPage}</CardTitle>
                      <CardDescription>
                        Drag and drop to reorder blocks. Each block represents a section of your page.
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
                              <SelectItem value="contact_form">Contact Form</SelectItem>
                              <SelectItem value="about_company">About Company</SelectItem>
                              <SelectItem value="cta_section">Call to Action</SelectItem>
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
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading blocks...</p>
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
                                <Button size="sm" variant="ghost">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="cursor-move">
                                  <Move className="w-4 h-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="ghost" className="text-red-600">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Block</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this {block.blockType} block?
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
                              <div className="text-sm">
                                <strong>Title:</strong> {block.title || 'No title'}<br />
                                <strong>Type:</strong> {block.blockType}<br />
                                {block.description && <><strong>Description:</strong> {block.description}</>}
                              </div>
                            </div>
                          </motion.div>
                        )) : null}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Footer Management */}
          <TabsContent value="footer">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Information */}
              <ContactInfoManager
                siteSettings={siteSettings}
                updateSiteSetting={updateSiteSetting}
                updateSiteSettingMutation={updateSiteSettingMutation}
              />

              {/* Useful Links */}
              <UsefulLinksManager
                siteSettings={siteSettings}
                updateSiteSetting={updateSiteSetting}
                updateSiteSettingMutation={updateSiteSettingMutation}
                availablePages={availablePages}
              />

              {/* Social Media */}
              <SocialMediaManager
                siteSettings={siteSettings}
                updateSiteSetting={updateSiteSetting}
                updateSiteSettingMutation={updateSiteSettingMutation}
              />

              {/* Newsletter */}
              <NewsletterManager
                siteSettings={siteSettings}
                updateSiteSetting={updateSiteSetting}
                updateSiteSettingMutation={updateSiteSettingMutation}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}