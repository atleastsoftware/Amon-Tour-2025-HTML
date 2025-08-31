import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Palette, Layout, Settings } from 'lucide-react';
import { useLocation } from 'wouter';

interface SiteSetting {
  id: number;
  section: string;
  key: string;
  value: string;
  type: string;
  isActive: boolean;
}

export default function AdminAppearancePage() {
  const [, setLocation] = useLocation();
  
  // Fetch site settings
  const { data: siteSettings = [] } = useQuery<SiteSetting[]>({
    queryKey: ['/api/admin/site-settings'],
  });

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:justify-between">
            <div className="w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2 sm:gap-3">
                <Palette className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 flex-shrink-0" />
                <span className="truncate">Site Appearance</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600">Customize your website theme, pages, and footer</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setLocation('/admin')}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Admin</span>
            </Button>
          </div>
        </div>

        {/* Temporary placeholder content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Theme
              </CardTitle>
              <CardDescription>Customize colors and typography</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Theme customization coming soon...</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5" />
                Pages
              </CardTitle>
              <CardDescription>Manage page content and blocks</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Page management coming soon...</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Footer
              </CardTitle>
              <CardDescription>Configure footer content</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Footer configuration coming soon...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}