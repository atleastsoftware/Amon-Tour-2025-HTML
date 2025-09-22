import { useTranslation } from 'react-i18next';
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, ArrowLeft, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";

// Simple schemas
const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  coverImage: z.string().url("Please enter a valid image URL").optional().or(z.literal("")),
  authorName: z.string().min(1, "Author name is required"),
  status: z.enum(["draft", "published"]),
  categoryId: z.number().optional()
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
  category?: {
    id: number;
    name: string;
  };
}
interface BlogCategory {
  id: number;
  name: string;
  slug: string;
}
export default function AdminBlogNew() {
  const { t } = useTranslation();
  const {
    t: t
  } = useTranslation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();

  // Fetch posts
  const {
    data: posts = [],
    isLoading: postsLoading
  } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog/posts"]
  });

  // Fetch categories
  const {
    data: categories = []
  } = useQuery<BlogCategory[]>({
    queryKey: ["/api/blog/categories"]
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: BlogPostForm) => {
      const response = await fetch("/api/blog/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create post");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/blog/posts"]
      });
      setIsCreateDialogOpen(false);
      toast({
        title: t('Success', {
          defaultValue: 'Success'
        }),
        description: t('Post created successfully', {
          defaultValue: 'Post created successfully'
        })
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('Error', {
          defaultValue: 'Error'
        }),
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: async ({
      id,
      data
    }: {
      id: number;
      data: BlogPostForm;
    }) => {
      const response = await fetch(`/api/blog/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update post");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/blog/posts"]
      });
      setEditingPost(null);
      toast({
        title: t('Success', {
          defaultValue: 'Success'
        }),
        description: t('Post updated successfully', {
          defaultValue: 'Post updated successfully'
        })
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('Error', {
          defaultValue: 'Error'
        }),
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/blog/posts/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete post");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/blog/posts"]
      });
      toast({
        title: t('Success', {
          defaultValue: 'Success'
        }),
        description: t('Post deleted successfully', {
          defaultValue: 'Post deleted successfully'
        })
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('Error', {
          defaultValue: 'Error'
        }),
        description: error.message,
        variant: "destructive"
      });
    }
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
      status: "draft"
    }
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
      status: "draft"
    }
  });

  // Handle edit
  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    editForm.reset({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || "",
      coverImage: post.coverImage || "",
      authorName: post.authorName,
      status: post.status,
      categoryId: post.categoryId
    });
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate(id);
    }
  };

  // Submit handlers
  const onCreateSubmit = (data: BlogPostForm) => {
    createPostMutation.mutate(data);
  };
  const onEditSubmit = (data: BlogPostForm) => {
    if (editingPost) {
      updatePostMutation.mutate({
        id: editingPost.id,
        data
      });
    }
  };
  return <>
      <SEO title={t('Blog Management - Admin', {
      defaultValue: 'Blog Management - Admin'
    })} description="Manage blog posts and content" />
      <Header />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />{t('Back to Admin', {
                  defaultValue: 'Back to Admin'
                })}</Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{t('Blog Management', {
                defaultValue: 'Blog Management'
              })}</h1>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />{t('Create Post', {
              defaultValue: 'Create Post'
            })}</Button>
          </div>

          {/* Posts Table */}
          <Card>
            <CardHeader>
              <CardTitle>{t('Blog Posts', {
                defaultValue: 'Blog Posts'
              })}</CardTitle>
            </CardHeader>
            <CardContent>
              {postsLoading ? <div className="text-center py-8">{t('Loading posts...', {
                defaultValue: 'Loading posts...'
              })}</div> : posts.length === 0 ? <div className="text-center py-8 text-gray-500">{t('No posts found. Create your first post!', {
                defaultValue: 'No posts found. Create your first post!'
              })}</div> : <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('Title', {
                      defaultValue: 'Title'
                    })}</TableHead>
                      <TableHead>{t('Status', {
                      defaultValue: 'Status'
                    })}</TableHead>
                      <TableHead>{t('Author', {
                      defaultValue: 'Author'
                    })}</TableHead>
                      <TableHead>{t('Category', {
                      defaultValue: 'Category'
                    })}</TableHead>
                      <TableHead>{t('Created', {
                      defaultValue: 'Created'
                    })}</TableHead>
                      <TableHead>{t('Actions', {
                      defaultValue: 'Actions'
                    })}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post: BlogPost) => <TableRow key={post.id}>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {post.status}
                          </span>
                        </TableCell>
                        <TableCell>{post.authorName}</TableCell>
                        <TableCell>{post.category?.name || "No category"}</TableCell>
                        <TableCell>{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(post)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(post.id)} disabled={deletePostMutation.isPending}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('Create New Post', {
              defaultValue: 'Create New Post'
            })}</DialogTitle>
          </DialogHeader>
          
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField control={createForm.control} name="title" render={({
              field
            }) => <FormItem>
                    <FormLabel>{t('Title', {
                  defaultValue: 'Title'
                })}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('Enter post title', {
                  defaultValue: 'Enter post title'
                })} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={createForm.control} name="excerpt" render={({
              field
            }) => <FormItem>
                    <FormLabel>{t('Excerpt', {
                  defaultValue: 'Excerpt'
                })}</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder={t('Brief description', {
                  defaultValue: 'Brief description'
                })} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={createForm.control} name="coverImage" render={({
              field
            }) => <FormItem>
                    <FormLabel>{t('Cover Image URL', {
                  defaultValue: 'Cover Image URL'
                })}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://example.com/image.jpg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={createForm.control} name="content" render={({
              field
            }) => <FormItem>
                    <FormLabel>{t('Content', {
                  defaultValue: 'Content'
                })}</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder={t('Write your content here', {
                  defaultValue: 'Write your content here'
                })} rows={10} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={createForm.control} name="status" render={({
                field
              }) => <FormItem>
                      <FormLabel>{t('Status', {
                    defaultValue: 'Status'
                  })}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('Select status', {
                        defaultValue: 'Select status'
                      })} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">{t('Draft', {
                        defaultValue: 'Draft'
                      })}</SelectItem>
                          <SelectItem value="published">{t('Published', {
                        defaultValue: 'Published'
                      })}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={createForm.control} name="categoryId" render={({
                field
              }) => <FormItem>
                      <FormLabel>{t('Category', {
                    defaultValue: 'Category'
                  })}</FormLabel>
                      <Select onValueChange={value => field.onChange(value ? parseInt(value) : undefined)} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('Select category', {
                        defaultValue: 'Select category'
                      })} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category: BlogCategory) => <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>} />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>{t('Cancel', {
                  defaultValue: 'Cancel'
                })}</Button>
                <Button type="submit" disabled={createPostMutation.isPending}>
                  {createPostMutation.isPending ? "Creating..." : "Create Post"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('Edit Post', {
              defaultValue: 'Edit Post'
            })}</DialogTitle>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField control={editForm.control} name="title" render={({
              field
            }) => <FormItem>
                    <FormLabel>{t('Title', {
                  defaultValue: 'Title'
                })}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('Enter post title', {
                  defaultValue: 'Enter post title'
                })} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={editForm.control} name="excerpt" render={({
              field
            }) => <FormItem>
                    <FormLabel>{t('Excerpt', {
                  defaultValue: 'Excerpt'
                })}</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder={t('Brief description', {
                  defaultValue: 'Brief description'
                })} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={editForm.control} name="coverImage" render={({
              field
            }) => <FormItem>
                    <FormLabel>{t('Cover Image URL', {
                  defaultValue: 'Cover Image URL'
                })}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://example.com/image.jpg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={editForm.control} name="content" render={({
              field
            }) => <FormItem>
                    <FormLabel>{t('Content', {
                  defaultValue: 'Content'
                })}</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder={t('Write your content here', {
                  defaultValue: 'Write your content here'
                })} rows={10} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={editForm.control} name="status" render={({
                field
              }) => <FormItem>
                      <FormLabel>{t('Status', {
                    defaultValue: 'Status'
                  })}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('Select status', {
                        defaultValue: 'Select status'
                      })} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">{t('Draft', {
                        defaultValue: 'Draft'
                      })}</SelectItem>
                          <SelectItem value="published">{t('Published', {
                        defaultValue: 'Published'
                      })}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={editForm.control} name="categoryId" render={({
                field
              }) => <FormItem>
                      <FormLabel>{t('Category', {
                    defaultValue: 'Category'
                  })}</FormLabel>
                      <Select onValueChange={value => field.onChange(value ? parseInt(value) : undefined)} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('Select category', {
                        defaultValue: 'Select category'
                      })} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category: BlogCategory) => <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>} />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingPost(null)}>{t('Cancel', {
                  defaultValue: 'Cancel'
                })}</Button>
                <Button type="submit" disabled={updatePostMutation.isPending}>
                  {updatePostMutation.isPending ? "Updating..." : "Update Post"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Footer />
    </>;
}