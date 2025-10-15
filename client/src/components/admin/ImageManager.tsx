import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { GripVertical, Trash2, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ImageManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageManager({ images, onChange }: ImageManagerProps) {
  const [imageUrls, setImageUrls] = useState<string[]>(images || []);

  const handleAddImage = () => {
    const newUrls = [...imageUrls, ''];
    setImageUrls(newUrls);
    onChange(newUrls);
  };

  const handleRemoveImage = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
    onChange(newUrls);
  };

  const handleUpdateImage = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
    onChange(newUrls);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(imageUrls);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setImageUrls(items);
    onChange(items);
  };

  const handleUpload = (index: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // TODO: Implement image upload to server
        console.log('Upload file:', file);
        // For now, create a local URL
        const url = URL.createObjectURL(file);
        handleUpdateImage(index, url);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="images">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
              {imageUrls.map((url, index) => (
                <Draggable key={`image-${index}`} draggableId={`image-${index}`} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-center gap-2 p-3 rounded-lg border ${
                        snapshot.isDragging ? 'bg-accent border-primary' : 'bg-background'
                      }`}
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                      >
                        <GripVertical className="w-5 h-5" />
                      </div>

                      <Input
                        value={url}
                        onChange={(e) => handleUpdateImage(index, e.target.value)}
                        className="flex-1"
                      />

                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleUpload(index)}
                        className="border-2 border-dashed border-gray-400 hover:border-primary hover:bg-accent"
                        title="Upload une image"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveImage(index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Button
        type="button"
        variant="outline"
        onClick={handleAddImage}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Ajouter une image
      </Button>
    </div>
  );
}
