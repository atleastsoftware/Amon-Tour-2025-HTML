import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Save, Undo2, Eye, EyeOff, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

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

interface RealBlockPreviewProps {
  block: PageBlock;
  onUpdate: (id: number, data: Partial<PageBlock>) => void;
  onDelete: (id: number) => void;
  onMoveUp: (id: number) => void;
  onMoveDown: (id: number) => void;
  onToggleVisibility: (id: number) => void;
  isEditing?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
}

// Simple preview component
function SimplePreview({ block }: { block: PageBlock }) {
  const getPreviewContent = () => {
    switch (block.blockType) {
      case 'hero':
      case 'hero_main':
      case 'video_hero':
        return (
          <div className="h-full bg-gradient-to-r from-blue-600 to-blue-800 p-4 flex items-center justify-center text-white">
            <div className="text-center">
              <div className="text-lg font-bold mb-2">Hero Section</div>
              <div className="text-sm opacity-90">{block.title || 'Hero Preview'}</div>
            </div>
          </div>
        );
      
      case 'features':
      case 'why_choose_us':
        return (
          <div className="h-full bg-gray-50 p-4">
            <div className="text-center mb-2">
              <div className="text-sm font-bold">{block.title || "Features"}</div>
              <div className="w-8 h-0.5 bg-yellow-500 mx-auto mt-1"></div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded p-2 text-center shadow-sm">
                  <div className="w-4 h-4 bg-blue-600 rounded-full mx-auto mb-1"></div>
                  <div className="text-xs">Feature {i}</div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'about':
        return (
          <div className="h-full bg-white p-4 flex items-center">
            <div className="flex gap-4">
              <div className="w-20 h-16 bg-gray-300 rounded"></div>
              <div className="flex-1">
                <div className="text-sm font-bold mb-2">{block.title || "About Us"}</div>
                <div className="text-xs text-gray-600">About section content...</div>
              </div>
            </div>
          </div>
        );
      
      case 'contact':
      case 'contact_form':
        return (
          <div className="h-full bg-white p-4">
            <div className="text-sm font-bold mb-3 text-center">{block.title || "Contact"}</div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-100 rounded"></div>
              <div className="h-3 bg-gray-100 rounded"></div>
              <div className="h-8 bg-gray-100 rounded"></div>
              <div className="h-4 bg-blue-600 rounded text-center">
                <div className="text-xs text-white pt-1">Send</div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="h-full bg-gray-100 p-4 flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm font-semibold mb-2">{block.blockType}</div>
              <div className="text-xs text-gray-600">{block.title || 'Block preview'}</div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg border bg-white" style={{ height: '200px' }}>
      {getPreviewContent()}
    </div>
  );
}

export default function RealBlockPreview({ 
  block, 
  onUpdate, 
  onDelete, 
  onMoveUp, 
  onMoveDown, 
  onToggleVisibility 
}: RealBlockPreviewProps) {
  const [showEditForm, setShowEditForm] = useState(false);

  const getBlockDisplayName = (blockType: string) => {
    const displayNames: Record<string, string> = {
      'hero': 'Hero Section',
      'video_hero': 'Hero with Video',
      'hero_main': 'Main Hero',
      'features': 'Features Section',
      'why_choose_us': 'Why Choose Us',
      'about': 'About Section',
      'featured_tours': 'Featured Tours',
      'custom_tour_cta': 'Custom Tour CTA',
      'cta_section': 'Call to Action',
      'testimonials': 'Testimonials',
      'customer_reviews': 'Customer Reviews',
      'contact_hero': 'Contact Hero',
      'contact_methods': 'Contact Methods',
      'contact_form': 'Contact Form',
      'text_image': 'Text & Image',
      'card_grid': 'Card Grid'
    };
    return displayNames[blockType] || blockType.replace('_', ' ');
  };

  return (
    <motion.div 
      layout
      className="group relative border border-gray-200 rounded-xl overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all duration-300 bg-white"
    >
      {/* Header with title and action buttons */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 via-black/60 to-transparent p-3">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <div className="text-sm font-semibold">{getBlockDisplayName(block.blockType)}</div>
            <div className="text-xs opacity-75">{block.title || 'No title'}</div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={block.isActive ? "secondary" : "default"}
              onClick={() => onToggleVisibility(block.id)}
              title={block.isActive ? "Hide from website" : "Show on website"}
              className="h-7 w-7 p-0 bg-white/90 hover:bg-white text-gray-700 border-0"
            >
              {block.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onMoveUp(block.id)}
              title="Move up"
              className="h-7 w-7 p-0 bg-white/90 hover:bg-white text-gray-700 border-0"
            >
              <ArrowUp className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onMoveDown(block.id)}
              title="Move down"
              className="h-7 w-7 p-0 bg-white/90 hover:bg-white text-gray-700 border-0"
            >
              <ArrowDown className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowEditForm(!showEditForm)}
              title="Edit block"
              className="h-7 w-7 p-0 bg-blue-500 hover:bg-blue-600 text-white border-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this block?')) {
                  onDelete(block.id);
                }
              }}
              title="Delete block"
              className="h-7 w-7 p-0 bg-red-500 hover:bg-red-600 text-white border-0"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Preview area */}
      <div className="relative overflow-hidden bg-white" style={{ height: '300px' }}>
        <SimplePreview block={block} />
      </div>

      {/* Edit form (simplified placeholder) */}
      {showEditForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t bg-gray-50 p-4"
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 mb-4">
                Edit functionality for {getBlockDisplayName(block.blockType)} will be implemented here.
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => {
                  toast({ title: "Changes saved successfully!" });
                  setShowEditForm(false);
                }}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowEditForm(false)}>
                  <Undo2 className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}