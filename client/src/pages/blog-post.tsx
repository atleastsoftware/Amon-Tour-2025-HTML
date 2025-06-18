import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Calendar, User, Tag, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  createdAt: string;
  authorName: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  tags?: {
    id: number;
    name: string;
    slug: string;
  }[];
}

export default function BlogPostPage() {
  const [, params] = useRoute("/blog/:slug");
  
  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: [`/api/blog/posts/slug/${params?.slug}`],
    enabled: !!params?.slug,
  });

  const { data: relatedPosts = [] } = useQuery({
    queryKey: [`/api/blog/posts/${post?.id}/related`],
    enabled: !!post?.id,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="bg-gray-50">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                <div className="h-64 bg-gray-200 rounded mb-8"></div>
                <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-8">The article you're looking for doesn't exist or has been removed.</p>
            <Link href="/blog">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Link href="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>

            {/* Article Header */}
            <article className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Cover Image */}
              {post.coverImage && (
                <div className="relative h-64 md:h-96">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {post.category && (
                    <Badge className="absolute top-4 left-4 bg-blue-600">
                      {post.category.name}
                    </Badge>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-6">
                  {post.title}
                </h1>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center text-gray-600 mb-8 space-x-6">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    {formatDate(post.createdAt)}
                  </div>
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    {post.authorName}
                  </div>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {post.tags.map((tag: any) => (
                      <Badge key={tag.id} variant="secondary">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Article Content */}
                <div className="prose prose-lg max-w-none">
                  {post.content.split('\n').map((paragraph, index) => {
                    if (paragraph.startsWith('# ')) {
                      return <h1 key={index} className="text-3xl font-bold mt-8 mb-4">{paragraph.slice(2)}</h1>;
                    }
                    if (paragraph.startsWith('## ')) {
                      return <h2 key={index} className="text-2xl font-bold mt-6 mb-3">{paragraph.slice(3)}</h2>;
                    }
                    if (paragraph.startsWith('### ')) {
                      return <h3 key={index} className="text-xl font-bold mt-4 mb-2">{paragraph.slice(4)}</h3>;
                    }
                    if (paragraph.startsWith('> ')) {
                      return <blockquote key={index} className="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-4">{paragraph.slice(2)}</blockquote>;
                    }
                    if (paragraph.startsWith('- ')) {
                      return <li key={index} className="ml-4">{paragraph.slice(2)}</li>;
                    }
                    if (paragraph.trim() === '') {
                      return <br key={index} />;
                    }
                    return <p key={index} className="mb-4 text-gray-700 leading-relaxed">{paragraph}</p>;
                  })}
                </div>
              </div>
            </article>

            {/* Related Posts */}
            {(relatedPosts as any[]).length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Articles</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {(relatedPosts as any[]).slice(0, 2).map((relatedPost: any) => (
                    <Card key={relatedPost.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      {relatedPost.coverImage && (
                        <div className="relative h-48">
                          <img
                            src={relatedPost.coverImage}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <CardHeader>
                        <h3 className="text-lg font-semibold line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <Link href={`/blog/${relatedPost.slug}`}>
                          <Button className="w-full">
                            Read More
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}