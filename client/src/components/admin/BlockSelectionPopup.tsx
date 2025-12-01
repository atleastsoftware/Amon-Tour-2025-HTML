import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Home, FileText, Grid3x3, FormInput, CheckCircle, Calendar, DollarSign, Sparkles, Image, Search, Mail, Images, Video, List } from 'lucide-react';
import { useTranslationSection } from '@/hooks/useTranslationSection';

export interface BlockType {
  type: string;
  label: string;
  description: string;
  icon: any;
  preview: JSX.Element;
}

// Export block type labels for use across the app (translation editor, etc.)
export const BLOCK_TYPE_LABELS: Record<string, string> = {
  hero: 'Hero Section',
  header_page: 'Header Page',
  text: 'Text + Buttons',
  popular_experiences: 'Card Grid Date',
  custom_tour_form: 'Form',
  tour_ninja_section: 'Card Grid Price',
  why_choose_us: 'Text + Icones',
  who_we_are: 'Text + Images',
  search_bar_tours: 'Search Bar: Tours',
  contact: 'Contact',
  blog_search: 'Search Bar: Blog',
  text_gallery: 'Text + Gallery',
  text_video: 'Text + Video',
  text_listing: 'Text + Listing',
  text_pricing: 'Text + Pricing',
};

export const blockTypes: BlockType[] = [
  {
    type: 'hero',
    label: BLOCK_TYPE_LABELS.hero,
    description: 'Welcome banner with title, subtitle and CTA buttons',
    icon: Home,
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border">
        <div className="relative h-48 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF]">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
            <h1 className="text-lg font-bold mb-1 text-center">Main Title</h1>
            <p className="text-xs opacity-90 mb-2 text-center">Subtitle</p>
            <div className="flex gap-2">
              <div className="px-3 py-1 bg-white text-[#084F6E] rounded text-xs font-semibold">
                Button 1
              </div>
              <div className="px-3 py-1 border border-white rounded text-xs font-semibold">
                Button 2
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    type: 'header_page',
    label: BLOCK_TYPE_LABELS.header_page,
    description: 'Page header with title, subtitle and background image',
    icon: Home,
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border">
        <div className="relative h-32 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF]">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-3">
            <h1 className="text-base font-bold mb-0.5 text-center">Page Title</h1>
            <p className="text-xs opacity-90 text-center">Subtitle</p>
          </div>
        </div>
      </div>
    )
  },
  {
    type: 'text',
    label: BLOCK_TYPE_LABELS.text,
    description: 'Text section with title, content and action buttons',
    icon: FileText,
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-6">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="font-bold text-lg mb-2" style={{ color: '#333333' }}>
            Section Title
          </h2>
          <div className="w-16 h-0.5 mx-auto mb-3" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-sm leading-relaxed mb-3" style={{ color: '#666666' }}>
            Add your text section content here. You can describe your services, share your story, or present important information.
          </p>
          <div className="flex gap-2 justify-center">
            <div className="px-3 py-1 bg-[#084F6E] text-white rounded text-xs">Button 1</div>
            <div className="px-3 py-1 border border-[#084F6E] text-[#084F6E] rounded text-xs">Button 2</div>
          </div>
        </div>
      </div>
    )
  },
  {
    type: 'popular_experiences',
    label: BLOCK_TYPE_LABELS.popular_experiences,
    description: 'Card grid with duration badges',
    icon: Calendar,
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-6">
        <div className="text-center mb-4">
          <h2 className="font-bold text-lg mb-2" style={{ color: '#333333' }}>
            Section Title
          </h2>
          <div className="w-16 h-0.5 mx-auto mb-3" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description for your card grid with duration badges.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border rounded-lg overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF] relative">
                <div className="absolute top-1 right-1 bg-white px-1.5 py-0.5 rounded text-xs">1 jour</div>
              </div>
              <div className="p-2 bg-white">
                <div className="text-xs font-semibold">Tour Name</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    type: 'custom_tour_form',
    label: BLOCK_TYPE_LABELS.custom_tour_form,
    description: 'Form with image and customizable fields',
    icon: FormInput,
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-6">
        <div className="text-center mb-4">
          <h2 className="font-bold text-lg mb-2" style={{ color: '#333333' }}>
            Form Title
          </h2>
          <div className="w-16 h-0.5 mx-auto mb-3" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description for your customizable form.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-r from-[#084F6E] to-[#3BA8AF] rounded h-20"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-100 rounded"></div>
            <div className="h-6 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    )
  },
  {
    type: 'tour_ninja_section',
    label: BLOCK_TYPE_LABELS.tour_ninja_section,
    description: 'Card grid with price badges',
    icon: DollarSign,
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-6">
        <div className="text-center mb-4">
          <h2 className="font-bold text-lg mb-2" style={{ color: '#333333' }}>
            Section Title
          </h2>
          <div className="w-16 h-0.5 mx-auto mb-3" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description for your card grid with prices.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border rounded-lg overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF] relative">
                <div className="absolute top-1 right-1 bg-white px-1.5 py-0.5 rounded text-xs">Prix</div>
              </div>
              <div className="p-2 bg-white">
                <div className="text-xs font-semibold">Tour Name</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    type: 'why_choose_us',
    label: BLOCK_TYPE_LABELS.why_choose_us,
    description: 'Section with icons, titles and descriptions',
    icon: Sparkles,
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-6">
        <div className="text-center mb-4">
          <h2 className="font-bold text-lg mb-2" style={{ color: '#333333' }}>
            Section Title
          </h2>
          <div className="w-16 h-0.5 mx-auto mb-3" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description for your icon section.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: 'fas fa-user-friends', color: '#084F6E' },
            { icon: 'fas fa-compass', color: '#3BA8AF' },
            { icon: 'fas fa-star', color: '#084F6E' }
          ].map((item, i) => (
            <div key={i} className="text-center border rounded-lg p-3 bg-white">
              <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: item.color }}>
                <i className={`${item.icon} text-white text-sm`}></i>
              </div>
              <div className="text-xs font-semibold mb-1">Title</div>
              <div className="text-xs text-gray-500">Description</div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    type: 'who_we_are',
    label: BLOCK_TYPE_LABELS.who_we_are,
    description: 'Section with text content and images',
    icon: Image,
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <h2 className="font-bold text-base mb-2" style={{ color: '#333333' }}>
              Main Title
            </h2>
            <div className="w-12 h-0.5 mb-3" style={{ backgroundColor: '#3BA8AF' }}></div>
            <p className="text-xs leading-relaxed mb-3" style={{ color: '#666666' }}>
              Add your main text content here.
            </p>
            <h3 className="font-bold text-sm mb-1" style={{ color: '#333333' }}>
              Subtitle
            </h3>
            <p className="text-xs leading-relaxed mb-3" style={{ color: '#666666' }}>
              Additional description for your section.
            </p>
            <div className="flex gap-2 mt-auto">
              <div className="px-3 py-1 rounded text-xs font-semibold" style={{ backgroundColor: '#084F6E', color: '#ffffff' }}>
                Button 1
              </div>
              <div className="px-3 py-1 rounded text-xs font-semibold border-2" style={{ borderColor: '#084F6E', color: '#084F6E' }}>
                Button 2 →
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#084F6E] to-[#3BA8AF] rounded h-full min-h-[180px]"></div>
        </div>
      </div>
    )
  },
  {
    type: 'search_bar_tours',
    label: BLOCK_TYPE_LABELS.search_bar_tours,
    description: 'Search bar with filters and tour grid',
    icon: Search,
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-4">
        <div className="bg-white rounded-lg border p-3 mb-4">
          <div className="text-xs font-semibold mb-2">Filters</div>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-1 border rounded px-2 py-1">
              <Search className="h-3 w-3 text-gray-400" />
              <div className="text-xs text-gray-400">Search...</div>
            </div>
            <div className="border rounded px-2 py-1 text-xs text-gray-600">All prices</div>
            <div className="border rounded px-2 py-1 text-xs text-gray-600">All durations</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border rounded-lg overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF] relative">
                <div className="absolute top-1 right-1 bg-white px-1.5 py-0.5 rounded text-xs">1 day</div>
              </div>
              <div className="p-2 bg-white">
                <div className="text-xs font-semibold">Tour Name</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    type: 'contact',
    label: BLOCK_TYPE_LABELS.contact,
    description: 'Contact section with email, phone, WhatsApp and Line ID',
    icon: Mail,
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-6">
        <div className="text-center mb-4">
          <h2 className="font-bold text-lg mb-2" style={{ color: '#084F6E' }}>
            Main Title
          </h2>
          <div className="w-16 h-0.5 mx-auto mb-3" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed mb-4" style={{ color: '#666666' }}>
            Description for your contact section
          </p>
        </div>
        <div className="space-y-2">
          {[
            { icon: <Mail className="w-4 h-4" />, label: 'Email', value: 'contact@example.com', color: '#084F6E' },
            { icon: <Mail className="w-4 h-4" />, label: 'Phone', value: '+ 22 222 222 222', color: '#3BA8AF' },
            { icon: <Mail className="w-4 h-4" />, label: 'WhatsApp', value: '+ 22 222 222 222', color: '#25D366' },
            { icon: <Mail className="w-4 h-4" />, label: 'Line ID', value: 'myaccount', color: '#00B900' }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 p-2 border rounded-lg">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${item.color}15` }}>
                <div style={{ color: item.color }}>{item.icon}</div>
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold" style={{ color: '#084F6E' }}>{item.label}</div>
                <div className="text-xs" style={{ color: '#666666' }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 p-3 bg-gray-50 rounded-lg text-center">
          <div className="text-xs font-bold mb-1">About our company</div>
          <div className="text-xs text-gray-600 mb-1">
            <strong>Brand Name</strong>
          </div>
          <div className="text-xs text-gray-600 mb-1">
            Your Address
          </div>
          <div className="inline-block bg-secondary/20 text-primary px-2 py-0.5 rounded-full text-xs mt-1">
            TAT License: 00/00000
          </div>
        </div>
      </div>
    )
  },
  {
    type: 'blog_search',
    label: BLOCK_TYPE_LABELS.blog_search,
    description: 'Search bar with tag and category filters for blog',
    icon: Search,
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-6">
        <div className="mb-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
            <input 
              type="text" 
              placeholder="Search articles..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border rounded-lg"
              disabled
            />
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <div className="text-xs font-medium text-gray-700 mb-2">Tags</div>
            <div className="flex flex-wrap gap-1">
              <div className="px-2 py-1 bg-[#3BA8AF] text-white rounded text-xs">All tags</div>
              <div className="px-2 py-1 border border-[#3BA8AF] text-[#3BA8AF] rounded text-xs">Tag name</div>
              <div className="px-2 py-1 border border-[#3BA8AF] text-[#3BA8AF] rounded text-xs">Tag name</div>
              <div className="px-2 py-1 border border-[#3BA8AF] text-[#3BA8AF] rounded text-xs">Tag name</div>
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-700 mb-2">Categories</div>
            <div className="flex flex-wrap gap-1">
              <div className="px-2 py-1 bg-[#084F6E] text-white rounded text-xs">All categories</div>
              <div className="px-2 py-1 border border-[#084F6E] text-[#084F6E] rounded text-xs">Category name</div>
              <div className="px-2 py-1 border border-[#084F6E] text-[#084F6E] rounded text-xs">Category name</div>
              <div className="px-2 py-1 border border-[#084F6E] text-[#084F6E] rounded text-xs">Category name</div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    type: 'text_gallery',
    label: BLOCK_TYPE_LABELS.text_gallery,
    description: 'Section with title and image gallery (carousel)',
    icon: Images,
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-6">
        <div className="text-center mb-4">
          <h2 className="font-bold text-lg mb-2" style={{ color: '#333333' }}>
            Gallery Title
          </h2>
          <div className="w-16 h-0.5 mx-auto mb-3" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description for your image gallery
          </p>
        </div>
        <div className="flex gap-2 justify-center">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-24 h-20 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF] rounded-lg shadow-md flex items-center justify-center">
              <Images className="w-8 h-8 text-white opacity-60" />
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    type: 'text_video',
    label: BLOCK_TYPE_LABELS.text_video,
    description: 'Section with title and embedded video (YouTube/Vimeo)',
    icon: Video,
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-6">
        <div className="text-center mb-4">
          <h2 className="font-bold text-lg mb-2" style={{ color: '#333333' }}>
            Video Title
          </h2>
          <div className="w-16 h-0.5 mx-auto mb-3" style={{ backgroundColor: '#084F6E' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description for your video section
          </p>
        </div>
        <div className="relative aspect-video bg-black rounded-lg flex items-center justify-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Video className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    )
  },
  {
    type: 'text_listing',
    label: BLOCK_TYPE_LABELS.text_listing,
    description: 'Section with title and list of items (label + description)',
    icon: List,
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-6">
        <div className="text-center mb-3">
          <h2 className="font-bold text-sm mb-2" style={{ color: '#333333' }}>
            Section Title
          </h2>
          <div className="w-12 h-0.5 mx-auto mb-2" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs" style={{ color: '#666666' }}>
            Description of your listing
          </p>
        </div>
        <div className="space-y-2">
          {['1', '2', '3'].map((label, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-2 flex items-center gap-2">
              <span className="font-bold text-xs" style={{ color: '#084F6E', minWidth: '45px' }}>
                {label}
              </span>
              <span className="text-xs text-gray-600">Description of your element</span>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    type: 'text_pricing',
    label: BLOCK_TYPE_LABELS.text_pricing,
    description: 'Section with title and seasonal pricing cards',
    icon: DollarSign,
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-6">
        <div className="text-center mb-3">
          <h2 className="font-bold text-sm mb-2" style={{ color: '#333333' }}>
            Section Title
          </h2>
          <div className="w-12 h-0.5 mx-auto mb-2" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs" style={{ color: '#666666' }}>
            Description of your pricing
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { title: 'Title', subtitle: 'Subtitle', price: 'Price', currency: 'Currency', cycle: 'Cycle', label: 'Label', moreText: 'Text', color: '#084F6E' },
            { title: 'Title', subtitle: 'Subtitle', price: 'Price', currency: 'Currency', cycle: 'Cycle', label: 'Label', moreText: 'Text', color: '#084F6E' },
            { title: 'Title', subtitle: 'Subtitle', price: 'Price', currency: 'Currency', cycle: 'Cycle', label: 'Label', moreText: 'Text', color: '#084F6E' }
          ].map((card, i) => (
            <div key={i} className="rounded-lg overflow-hidden shadow-lg bg-white">
              <div className="text-white p-2.5 rounded-t-lg" style={{ backgroundColor: card.color }}>
                <div className="text-sm font-bold leading-tight">{card.title}</div>
                <div className="text-xs opacity-90 leading-tight">{card.subtitle}</div>
              </div>
              <div className="bg-white p-3">
                <div className="text-2xl font-bold text-gray-900 leading-none">
                  {card.price} <span className="text-base font-normal text-gray-900">{card.currency}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1 mb-3">{card.cycle}</div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="text-xs font-medium text-gray-600 mb-0.5">{card.label}</div>
                  <div className="text-xs text-gray-400">{card.moreText}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
];

interface BlockSelectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (blockType: string) => void;
}

export default function BlockSelectionPopup({ isOpen, onClose, onSelect }: BlockSelectionPopupProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const { translations: t } = useTranslationSection('editor');

  const handleAdd = () => {
    if (selectedType) {
      onSelect(selectedType);
      setSelectedType(null);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedType(null);
    onClose();
  };

  const getBlockLabel = (blockType: BlockType) => {
    const blockTypesTranslations = t?.blockTypes as Record<string, string> | undefined;
    const keyMap: Record<string, string> = {
      'popular_experiences': 'cardGridDate',
      'tour_ninja_section': 'cardGridPrice',
      'custom_tour_form': 'form',
      'who_we_are': 'textImage',
      'why_choose_us': 'iconGrid',
      'search_bar_tours': 'searchModule',
      'hero': 'hero',
      'header_page': 'header_page',
      'text': 'text',
      'contact': 'contact',
      'blog_search': 'blog_search',
      'text_gallery': 'text_gallery',
      'text_video': 'text_video',
      'text_listing': 'text_listing',
      'text_pricing': 'text_pricing'
    };
    const key = keyMap[blockType.type] || blockType.type;
    return blockTypesTranslations?.[key] || blockType.label;
  };

  const getBlockDescription = (blockType: BlockType) => {
    const blockTypesTranslations = t?.blockTypes as Record<string, string> | undefined;
    const keyMap: Record<string, string> = {
      'popular_experiences': 'cardGridDateDesc',
      'tour_ninja_section': 'cardGridPriceDesc',
      'custom_tour_form': 'formDesc',
      'who_we_are': 'textImageDesc',
      'why_choose_us': 'iconGridDesc',
      'search_bar_tours': 'searchModuleDesc',
      'hero': 'heroDesc',
      'header_page': 'header_pageDesc',
      'text': 'textDesc',
      'contact': 'contactDesc',
      'blog_search': 'blog_searchDesc',
      'text_gallery': 'text_galleryDesc',
      'text_video': 'text_videoDesc',
      'text_listing': 'text_listingDesc',
      'text_pricing': 'text_pricingDesc'
    };
    const key = keyMap[blockType.type] || (blockType.type + 'Desc');
    return blockTypesTranslations?.[key] || blockType.description;
  };

  const sortedBlockTypes = [...blockTypes].sort((a, b) => getBlockLabel(a).localeCompare(getBlockLabel(b)));
  
  const selectedBlock = sortedBlockTypes.find(b => b.type === selectedType);

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t?.blockSelection?.title || "Add block"}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 flex-1 min-h-0">
          {/* Block type list */}
          <ScrollArea className="w-56 border rounded-lg flex-shrink-0">
            <div className="p-2 space-y-1.5">
              {sortedBlockTypes.map((blockType) => {
                return (
                  <Card
                    key={blockType.type}
                    className={`p-3 cursor-pointer transition-all hover:border-[#084F6E] ${
                      selectedType === blockType.type ? 'border-[#084F6E] bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedType(blockType.type)}
                    data-testid={`block-type-${blockType.type}`}
                  >
                    <div className="font-semibold text-sm mb-1">{getBlockLabel(blockType)}</div>
                    <div className="text-xs text-gray-600">{getBlockDescription(blockType)}</div>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>

          {/* Preview */}
          <div className="flex-1 border rounded-lg p-4 bg-gray-50 overflow-auto">
            <h3 className="text-sm font-semibold mb-3 text-gray-700">{t?.blockSelection?.preview || "Preview"}</h3>
            {selectedBlock ? (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                {selectedBlock.preview}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                {t?.blockSelection?.selectBlockToPreview || "Select a block type to preview"}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleCancel} data-testid="button-cancel-block">
            {t?.blockSelection?.cancel || "Cancel"}
          </Button>
          <Button 
            onClick={handleAdd} 
            disabled={!selectedType}
            data-testid="button-add-block"
          >
            {t?.blockSelection?.add || "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
