import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Calendar, User, Tag, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
  const slug = params?.slug;

  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: [`/api/blog/posts/slug/${slug}`],
    enabled: !!slug,
  });

  const { data: relatedPosts = [] } = useQuery({
    queryKey: [`/api/blog/posts/${post?.id}/related`],
    enabled: !!post?.id,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
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
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Article non trouvé</h1>
          <p className="text-gray-600 mb-8">L'article que vous recherchez n'existe pas ou a été supprimé.</p>
          <Link href="/blog">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Link href="/blog">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au blog
            </Button>
          </Link>
        </div>
      </div>

      <article className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Cover Image */}
          {post.coverImage && (
            <div className="aspect-video mb-8 rounded-lg overflow-hidden shadow-lg">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(post.createdAt)}
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {post.authorName}
              </div>
              {post.category && (
                <Badge variant="secondary">{post.category.name}</Badge>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-gray-600 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {post.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </header>

          {/* Article Content */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
            <div 
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Articles similaires</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost: any) => (
                  <Card key={relatedPost.id} className="hover:shadow-lg transition-shadow">
                    {relatedPost.coverImage && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={relatedPost.coverImage}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <h3 className="font-semibold line-clamp-2 text-sm">
                        {relatedPost.title}
                      </h3>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center text-xs text-gray-500 mb-3">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(relatedPost.createdAt)}
                        {relatedPost.category && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{relatedPost.category.name}</span>
                          </>
                        )}
                      </div>
                      <Link href={`/blog/${relatedPost.slug}`}>
                        <Button size="sm" variant="outline" className="w-full group">
                          Lire l'article
                          <ChevronRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Back to Blog */}
          <div className="mt-16 text-center">
            <Link href="/blog">
              <Button variant="outline" size="lg">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voir tous les articles
              </Button>
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}