import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Save,
  X,
  Upload,
  Loader,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Heading1,
  Heading2,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import { useTranslation } from "@/contexts/TranslationContext";

// Simple schemas
const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  coverImage: z.string().optional().or(z.literal("")),
  authorName: z.string().min(1, "Author name is required"),
  status: z.enum(["draft", "published"]),
  categoryId: z.number().optional(),
});

type BlogPostForm = z.infer<typeof blogPostSchema>;

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  status: "draft" | "published";
  authorName: string;
  createdAt: string;
  updatedAt: string;
  categoryId?: number;
  category?: { id: number; name: string; };
}

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
}

// WYSIWYG Editor Component
interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

function RichTextEditor({ value, onChange, placeholder, minHeight = "200px" }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastValueRef = useRef<string>(value || '');
  const isUserEditingRef = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isUserEditingRef.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
        lastValueRef.current = value || '';
      }
    }
  }, [value]);

  const formatText = (command: string, val?: string) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertHeading = (level: number) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const heading = document.createElement(`h${level}`);
    heading.innerHTML = range.toString() || 'Heading';
    range.deleteContents();
    range.insertNode(heading);
    
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    isUserEditingRef.current = true;
    const newValue = e.currentTarget.innerHTML;
    lastValueRef.current = newValue;
    onChange(newValue);
    setTimeout(() => {
      isUserEditingRef.current = false;
    }, 100);
  };

  return (
    <div className="space-y-2">
      <div className="border rounded-lg p-2 bg-muted/50 flex flex-wrap gap-1">
        <Button type="button" variant="ghost" size="sm" onClick={() => insertHeading(2)} title="Heading 1">
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => insertHeading(3)} title="Heading 2">
          <Heading2 className="w-4 h-4" />
        </Button>
        <div className="w-px bg-border mx-1" />
        <Button type="button" variant="ghost" size="sm" onClick={() => formatText('bold')} title="Bold">
          <Bold className="w-4 h-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => formatText('italic')} title="Italic">
          <Italic className="w-4 h-4" />
        </Button>
        <div className="w-px bg-border mx-1" />
        <Button type="button" variant="ghost" size="sm" onClick={() => formatText('justifyLeft')} title="Align left">
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => formatText('justifyCenter')} title="Center">
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => formatText('justifyRight')} title="Align right">
          <AlignRight className="w-4 h-4" />
        </Button>
        <div className="w-px bg-border mx-1" />
        <Button type="button" variant="ghost" size="sm" onClick={() => formatText('insertUnorderedList')} title="Bullet list">
          <List className="w-4 h-4" />
        </Button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleContentChange}
        className="border rounded-lg p-4 bg-white prose prose-sm max-w-none focus:outline-none focus:ring-2 focus:ring-primary overflow-y-auto"
        style={{ minHeight }}
        suppressContentEditableWarning
        data-placeholder={placeholder}
      />
    </div>
  );
}

// Image Upload Component for Blog
interface BlogImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  translations?: any;
}

function BlogImageUpload({ value, onChange, translations }: BlogImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const t = translations;

  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: t?.invalidFileType || "Invalid file type",
        description: t?.selectValidImage || "Please select a JPEG, PNG, GIF, or WebP image.",
        variant: "destructive"
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t?.fileTooLarge || "File too large",
        description: t?.selectSmaller || "Please select an image smaller than 5MB.",
        variant: "destructive"
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setIsUploading(true);
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to upload image: ${response.statusText}`);
      }
      
      const data = await response.json();
      onChange(data.file.url);
      
      toast({
        title: t?.uploadSuccess || "Upload successful",
        description: t?.imageUploaded || "Your image has been uploaded successfully.",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: t?.uploadFailed || "Upload failed",
        description: t?.tryAgain || "There was a problem uploading your image. Please try again.",
        variant: "destructive"
      });
      if (value) {
        setPreview(value);
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
    onChange('');
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileChange}
        ref={fileInputRef}
      />
      
      {preview ? (
        <div className="relative border rounded-md overflow-hidden h-[150px]">
          <img 
            src={preview} 
            alt="Cover preview" 
            className="w-full h-full object-cover"
          />
          <Button
            type="button"
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
          className="border border-dashed rounded-md p-4 flex items-center justify-center h-[100px] cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
          onClick={handleBrowseClick}
        >
          {isUploading ? (
            <Loader className="h-8 w-8 text-primary animate-spin" />
          ) : (
            <div className="flex items-center gap-2 text-gray-500">
              <Plus className="h-6 w-6" />
              <span className="text-sm">{t?.clickToUpload || "Click to upload image"}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Convert markdown-like formatting to HTML
function convertMarkdownToHtml(text: string): string {
  if (!text) return '';
  
  let html = text;
  
  // Convert headers: # Header -> <h2>Header</h2>, ## Header -> <h3>Header</h3>
  html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^# (.+)$/gm, '<h2>$1</h2>');
  
  // Convert bold: **text** or __text__ -> <strong>text</strong>
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  
  // Convert italic: *text* or _text_ -> <em>text</em>
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
  
  // Convert bullet points: - item or * item -> <li>item</li>
  const lines = html.split('\n');
  let inList = false;
  const processedLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const bulletMatch = line.match(/^[\-\*]\s+(.+)$/);
    
    if (bulletMatch) {
      if (!inList) {
        processedLines.push('<ul>');
        inList = true;
      }
      processedLines.push(`<li>${bulletMatch[1]}</li>`);
    } else {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      // Convert paragraphs
      if (line.trim() && !line.startsWith('<h') && !line.startsWith('<ul') && !line.startsWith('</')) {
        processedLines.push(`<p>${line}</p>`);
      } else if (line.trim()) {
        processedLines.push(line);
      }
    }
  }
  
  if (inList) {
    processedLines.push('</ul>');
  }
  
  return processedLines.join('\n');
}

export default function AdminBlogNew() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [pendingCloseAction, setPendingCloseAction] = useState<'create' | 'edit' | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { translations, currentLanguage } = useTranslation();
  const t = translations?.admin?.blog || {};
  const common = translations?.admin?.common || {};

  // Fetch posts
  const { data: posts = [], isLoading: postsLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog/posts"],
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<BlogCategory[]>({
    queryKey: ["/api/blog/categories"],
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: BlogPostForm) => {
      const response = await fetch("/api/blog/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create post");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts"] });
      setIsCreateDialogOpen(false);
      setHasUnsavedChanges(false);
      createForm.reset();
      toast({ title: common?.success || "Success", description: t?.createSuccess || "Post created successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: common?.error || "Error", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Update post mutation with translation trigger
  const updatePostMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: BlogPostForm }) => {
      const response = await fetch(`/api/blog/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update post");
      }
      
      return response.json();
    },
    onSuccess: async (_, variables) => {
      // Trigger blog translation after update
      try {
        await fetch('/api/translations/blog/regenerate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ postId: variables.id }),
        });
      } catch (e) {
        console.log('Translation regeneration attempted');
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts"] });
      setEditingPost(null);
      setHasUnsavedChanges(false);
      toast({ title: common?.success || "Success", description: t?.updateSuccess || "Post updated and translations refreshed" });
    },
    onError: (error: Error) => {
      toast({ 
        title: common?.error || "Error", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/blog/posts/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || t?.deleteFailed || "Failed to delete post");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts"] });
      toast({ title: common?.success || "Success", description: t?.deleteSuccess || "Post deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Create form
  const createForm = useForm<BlogPostForm>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      coverImage: "",
      authorName: "Admin",
      status: "draft",
    },
  });

  // Edit form
  const editForm = useForm<BlogPostForm>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      coverImage: "",
      authorName: "Admin",
      status: "draft",
    },
  });

  // Watch for form changes
  useEffect(() => {
    const subscription = createForm.watch(() => {
      setHasUnsavedChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [createForm.watch]);

  useEffect(() => {
    const subscription = editForm.watch(() => {
      setHasUnsavedChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [editForm.watch]);

  // Handle edit
  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setHasUnsavedChanges(false);
    
    // Convert markdown content to HTML for WYSIWYG editor
    const htmlContent = post.content.includes('<') ? post.content : convertMarkdownToHtml(post.content);
    
    editForm.reset({
      title: post.title,
      content: htmlContent,
      excerpt: post.excerpt || "",
      coverImage: post.coverImage || "",
      authorName: post.authorName,
      status: post.status,
      categoryId: post.categoryId,
    });
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (confirm(t?.confirmDelete || "Are you sure you want to delete this post?")) {
      deletePostMutation.mutate(id);
    }
  };

  // Handle dialog close with unsaved changes check
  const handleCreateDialogClose = (open: boolean) => {
    if (!open && hasUnsavedChanges) {
      setPendingCloseAction('create');
      setShowUnsavedChangesDialog(true);
    } else if (!open) {
      setIsCreateDialogOpen(false);
      createForm.reset();
      setHasUnsavedChanges(false);
    } else {
      setIsCreateDialogOpen(true);
    }
  };

  const handleEditDialogClose = (open: boolean) => {
    if (!open && hasUnsavedChanges) {
      setPendingCloseAction('edit');
      setShowUnsavedChangesDialog(true);
    } else if (!open) {
      setEditingPost(null);
      editForm.reset();
      setHasUnsavedChanges(false);
    }
  };

  const confirmClose = () => {
    if (pendingCloseAction === 'create') {
      setIsCreateDialogOpen(false);
      createForm.reset();
    } else if (pendingCloseAction === 'edit') {
      setEditingPost(null);
      editForm.reset();
    }
    setHasUnsavedChanges(false);
    setShowUnsavedChangesDialog(false);
    setPendingCloseAction(null);
  };

  const cancelClose = () => {
    setShowUnsavedChangesDialog(false);
    setPendingCloseAction(null);
  };

  // Submit handlers
  const onCreateSubmit = (data: BlogPostForm) => {
    createPostMutation.mutate(data);
  };

  const onEditSubmit = (data: BlogPostForm) => {
    if (editingPost) {
      updatePostMutation.mutate({ id: editingPost.id, data });
    }
  };

  return (
    <>
      <SEO 
        title="Blog Management - Admin" 
        description="Manage blog posts and content"
      />
      <Header />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <Link href="/admin">
                <Button variant="outline" size="sm" className="w-fit">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {common?.backToAdmin || "Back to Admin"}
                </Button>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t?.title || "Blog Management"}</h1>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              {t?.createPost || "Create Post"}
            </Button>
          </div>

          {/* Posts Table */}
          <Card>
            <CardHeader>
              <CardTitle>{t?.blogPosts || "Blog Posts"}</CardTitle>
            </CardHeader>
            <CardContent>
              {postsLoading ? (
                <div className="text-center py-8">{common?.loading || "Loading posts..."}</div>
              ) : posts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {t?.noPosts || "No posts found. Create your first post!"}
                </div>
              ) : (
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">{t?.postTitle || "Title"}</TableHead>
                      <TableHead className="min-w-[80px]">{common?.status || "Status"}</TableHead>
                      <TableHead className="min-w-[100px] hidden sm:table-cell">{t?.author || "Author"}</TableHead>
                      <TableHead className="min-w-[120px] hidden md:table-cell">{t?.category || "Category"}</TableHead>
                      <TableHead className="min-w-[100px] hidden lg:table-cell">{t?.created || "Created"}</TableHead>
                      <TableHead className="min-w-[80px]">{common?.actions || "Actions"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post: BlogPost) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                            post.status === 'published' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {post.status === 'published' ? (t?.published || 'Published') : (t?.draft || 'Draft')}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{post.authorName}</TableCell>
                        <TableCell className="hidden md:table-cell">{post.category?.name || (t?.noCategory || "No category")}</TableCell>
                        <TableCell className="hidden lg:table-cell">{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(post)}
                              data-testid={`button-edit-post-${post.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(post.id)}
                              disabled={deletePostMutation.isPending}
                              data-testid={`button-delete-post-${post.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={handleCreateDialogClose}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t?.createNewPost || "Create New Post"}</DialogTitle>
          </DialogHeader>
          
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t?.postTitle || "Title"}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t?.enterTitle || "Enter post title"} data-testid="input-create-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t?.excerpt || "Excerpt"}</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder={t?.briefDescription || "Brief description"} rows={2} data-testid="input-create-excerpt" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t?.coverImage || "Cover Image"}</FormLabel>
                    <FormControl>
                      <BlogImageUpload 
                        value={field.value || ''} 
                        onChange={field.onChange}
                        translations={t}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t?.content || "Content"}</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t?.writeContent || "Write your content here"}
                        minHeight="200px"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{common?.status || "Status"}</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-create-status">
                            <SelectValue placeholder={t?.selectStatus || "Select status"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">{t?.draft || "Draft"}</SelectItem>
                          <SelectItem value="published">{t?.published || "Published"}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t?.category || "Category"}</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} 
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-create-category">
                            <SelectValue placeholder={t?.selectCategory || "Select category"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category: BlogCategory) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleCreateDialogClose(false)}
                  data-testid="button-cancel-create"
                >
                  {common?.cancel || "Cancel"}
                </Button>
                <Button type="submit" disabled={createPostMutation.isPending} data-testid="button-submit-create">
                  {createPostMutation.isPending ? (common?.creating || "Creating...") : (t?.createPost || "Create Post")}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingPost} onOpenChange={handleEditDialogClose}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t?.editPost || "Edit Post"}</DialogTitle>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t?.postTitle || "Title"}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t?.enterTitle || "Enter post title"} data-testid="input-edit-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t?.excerpt || "Excerpt"}</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder={t?.briefDescription || "Brief description"} rows={2} data-testid="input-edit-excerpt" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t?.coverImage || "Cover Image"}</FormLabel>
                    <FormControl>
                      <BlogImageUpload 
                        value={field.value || ''} 
                        onChange={field.onChange}
                        translations={t}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t?.content || "Content"}</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t?.writeContent || "Write your content here"}
                        minHeight="250px"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{common?.status || "Status"}</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-status">
                            <SelectValue placeholder={t?.selectStatus || "Select status"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">{t?.draft || "Draft"}</SelectItem>
                          <SelectItem value="published">{t?.published || "Published"}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t?.category || "Category"}</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} 
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-category">
                            <SelectValue placeholder={t?.selectCategory || "Select category"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category: BlogCategory) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleEditDialogClose(false)}
                  data-testid="button-cancel-edit"
                >
                  {common?.cancel || "Cancel"}
                </Button>
                <Button type="submit" disabled={updatePostMutation.isPending} data-testid="button-submit-edit">
                  {updatePostMutation.isPending ? (common?.updating || "Updating...") : (t?.updatePost || "Update Post")}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Unsaved Changes Confirmation Dialog */}
      <AlertDialog open={showUnsavedChangesDialog} onOpenChange={setShowUnsavedChangesDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t?.unsavedChanges || "Unsaved Changes"}</AlertDialogTitle>
            <AlertDialogDescription>
              {t?.unsavedChangesMessage || "You have unsaved changes. Are you sure you want to close? Your changes will be lost."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelClose}>
              {t?.continueEditing || "Continue Editing"}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmClose} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t?.discardChanges || "Discard Changes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </>
  );
}
