import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface BlogSearchBlockProps {
  block: {
    id: number;
    configuration?: {
      backgroundColor?: string;
      searchPlaceholder?: string;
      tagsTitle?: string;
      categoriesTitle?: string;
      allTagsText?: string;
      allCategoriesText?: string;
      tagButtonColor?: string;
      tagButtonTextColor?: string;
      categoryButtonColor?: string;
      categoryButtonTextColor?: string;
    };
  };
}

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
}

interface BlogTag {
  id: number;
  name: string;
  slug: string;
}

export default function BlogSearchBlock({ block }: BlogSearchBlockProps) {
  const config = block.configuration || {};
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  const { data: categories = [] } = useQuery<BlogCategory[]>({
    queryKey: ["/api/blog/categories"],
  });

  const { data: tags = [] } = useQuery<BlogTag[]>({
    queryKey: ["/api/blog/tags"],
  });

  return (
    <section className="py-8 border-b" style={{ backgroundColor: config.backgroundColor || '#ffffff' }}>
      <div className="container mx-auto px-4">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder={config.searchPlaceholder || "Search articles..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filters - Tags and Categories */}
        <div className="space-y-4">
          {/* Tags Row */}
          {tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                {config.tagsTitle || "Tags"}
              </h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedTag === "" ? "secondary" : "outline"}
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={() => setSelectedTag("")}
                  style={{
                    backgroundColor: selectedTag === "" ? (config.tagButtonColor || '#3BA8AF') : 'transparent',
                    color: selectedTag === "" ? (config.tagButtonTextColor || '#ffffff') : (config.tagButtonColor || '#3BA8AF'),
                    borderColor: config.tagButtonColor || '#3BA8AF'
                  }}
                >
                  {config.allTagsText || "All Tags"}
                </Button>
                {tags.slice(0, 8).map((tag) => (
                  <Button
                    key={tag.id}
                    variant={selectedTag === tag.slug ? "secondary" : "outline"}
                    size="sm"
                    className="whitespace-nowrap"
                    onClick={() => setSelectedTag(tag.slug)}
                    style={{
                      backgroundColor: selectedTag === tag.slug ? (config.tagButtonColor || '#3BA8AF') : 'transparent',
                      color: selectedTag === tag.slug ? (config.tagButtonTextColor || '#ffffff') : (config.tagButtonColor || '#3BA8AF'),
                      borderColor: config.tagButtonColor || '#3BA8AF'
                    }}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Categories Row */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              {config.categoriesTitle || "Categories"}
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === "" ? "default" : "outline"}
                size="sm"
                className="whitespace-nowrap"
                onClick={() => setSelectedCategory("")}
                style={{
                  backgroundColor: selectedCategory === "" ? (config.categoryButtonColor || '#084F6E') : 'transparent',
                  color: selectedCategory === "" ? (config.categoryButtonTextColor || '#ffffff') : (config.categoryButtonColor || '#084F6E'),
                  borderColor: config.categoryButtonColor || '#084F6E'
                }}
              >
                {config.allCategoriesText || "All Categories"}
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.slug ? "default" : "outline"}
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={() => setSelectedCategory(category.slug)}
                  style={{
                    backgroundColor: selectedCategory === category.slug ? (config.categoryButtonColor || '#084F6E') : 'transparent',
                    color: selectedCategory === category.slug ? (config.categoryButtonTextColor || '#ffffff') : (config.categoryButtonColor || '#084F6E'),
                    borderColor: config.categoryButtonColor || '#084F6E'
                  }}
                >
                  🏝️ {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
