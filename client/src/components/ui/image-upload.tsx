import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Loader, X, Upload, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onUploadComplete: (imageUrl: string) => void;
  currentImage?: string;
  className?: string;
}

export function ImageUpload({ onUploadComplete, currentImage, className = "" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPEG, PNG, GIF, or WebP image.",
        variant: "destructive"
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive"
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setIsUploading(true);
      
      // Create a preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      
      // Create FormData
      const formData = new FormData();
      formData.append('image', file);
      
      // Upload file
      console.log('Uploading file to /api/upload/image...');
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      console.log('Upload response status:', response.status);
      
      if (!response.ok) {
        console.error('Upload failed with status:', response.status);
        // Handle 401 Unauthorized errors
        if (response.status === 401) {
          toast({
            title: "Authentication required",
            description: "You need to be logged in to upload images.",
            variant: "destructive"
          });
          throw new Error('Authentication required for image upload');
        }
        throw new Error(`Failed to upload image: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Pass the URL to parent component
      console.log('Upload successful, file URL:', data.file.url);
      onUploadComplete(data.file.url);
      
      toast({
        title: "Upload successful",
        description: "Your image has been uploaded successfully.",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your image. Please try again.",
        variant: "destructive"
      });
      // Revert preview if upload failed
      if (currentImage) {
        setPreview(currentImage);
      } else {
        setPreview(null);
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onUploadComplete(''); // Clear the image URL in parent component
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileChange}
        ref={fileInputRef}
      />
      
      {preview ? (
        <div className="relative border rounded-md overflow-hidden h-[200px]">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 rounded-full w-8 h-8"
            onClick={handleRemoveImage}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div 
          className="border border-dashed rounded-md p-8 flex flex-col items-center justify-center h-[200px] cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
          onClick={handleBrowseClick}
        >
          {isUploading ? (
            <Loader className="h-10 w-10 text-primary animate-spin mb-4" />
          ) : (
            <ImageIcon className="h-10 w-10 text-gray-400 mb-4" />
          )}
          <p className="text-sm text-gray-500 mb-2">Drag and drop or click to upload</p>
          <p className="text-xs text-gray-400">JPEG, PNG, GIF, or WebP (max 5MB)</p>
        </div>
      )}
      
      <div className="mt-4 flex justify-end">
        <Button 
          variant="outline" 
          onClick={handleBrowseClick}
          disabled={isUploading}
          className="text-sm"
        >
          {isUploading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" /> 
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" /> 
              Browse for image
            </>
          )}
        </Button>
      </div>
    </div>
  );
}