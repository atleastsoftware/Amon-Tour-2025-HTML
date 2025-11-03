import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/contexts/TranslationContext';

export interface TourNinjaTour {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  images: string[];
  primaryImage?: string;
  customImage?: string; // Added for image overrides
  originalImage?: string; // Snapshot de l'image primaire d'origine (avant override)
  price: number;
  currency: string;
  duration: string;
  location: string;
  bookingUrl?: string;
  detailsUrl?: string;
  presentationUrl?: string;
  externalId: string;
  isActive: boolean;
  category?: string;
  tags?: string[];
  maxGuests?: number;
  minGuests?: number;
  createdAt: string;
  updatedAt: string;
}

interface TourNinjaApiResponse {
  success: boolean;
  data: TourNinjaTour[];
  cached?: boolean;
  fallback?: boolean;
  timestamp?: number;
  message?: string;
}

export function useTourNinja() {
  const { currentLanguage } = useTranslation();
  
  const { data: response, isLoading, error, refetch } = useQuery<TourNinjaApiResponse>({
    queryKey: ['/api/proxy/tours', currentLanguage], // Include language in cache key
    queryFn: async () => {
      const res = await fetch(`/api/proxy/tours?language=${currentLanguage}`);
      if (!res.ok) throw new Error('Failed to fetch tours');
      return res.json();
    },
    retry: 1,
    staleTime: 60 * 60 * 1000, // 1 hour - increased from 5 minutes for better performance
    gcTime: 2 * 60 * 60 * 1000, // 2 hours - keep in cache for longer
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount if data is still fresh
  });

  // Fetch image overrides
  const { data: imageOverrides, isLoading: overridesLoading } = useQuery({
    queryKey: ['/api/tour-ninja-image-overrides'],
    retry: false,
    staleTime: 60 * 60 * 1000, // 1 hour - increased for better performance
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    enabled: !!(response?.data && response.data.length > 0), // Only fetch overrides if we have tours
  });

  // Apply image overrides to tours using useMemo for performance
  const [toursWithOverrides, setToursWithOverrides] = useState<TourNinjaTour[]>([]);
  
  useEffect(() => {
    if (!response?.data) {
      setToursWithOverrides([]);
      return;
    }

    const processedTours = response.data.map(tour => {
      // Since we only get active overrides from the public endpoint, no need to check isActive
      const override = (imageOverrides as any[])?.find(
        (override: any) => override.tourNinjaId === tour.id
      );
      
      // Ensure we keep the original images if no override is provided
      const finalPrimaryImage = override?.customImageUrl || 
                               tour.primaryImage || 
                               (tour.images && tour.images[0]) || 
                               null;
      
      return {
        ...tour,
        customImage: override?.customImageUrl,
        primaryImage: finalPrimaryImage,
        images: tour.images || [] // Ensure images array is always present
      };
    });
    
    setToursWithOverrides(processedTours);
  }, [response?.data, imageOverrides]);

  return {
    tours: toursWithOverrides,
    isLoading: isLoading || overridesLoading,
    error,
    refetch,
    cached: response?.cached || false,
    fallback: response?.fallback || false,
    success: response?.success || false,
    message: response?.message,
    count: toursWithOverrides?.length || 0
  };
}

// Enhanced hook that includes custom image overrides (uses admin endpoint for comprehensive data)
export function useTourNinjaWithCustomImages() {
  const { currentLanguage } = useTranslation();
  
  const { data: response, isLoading, error, refetch } = useQuery<TourNinjaApiResponse>({
    queryKey: ['/api/proxy/tours', currentLanguage], // Include language in cache key
    queryFn: async () => {
      console.log('🌐 Fetching tours for language:', currentLanguage);
      const url = `/api/proxy/tours?language=${currentLanguage}`;
      console.log('📡 API URL:', url);
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch tours');
      const data = await res.json();
      console.log('📦 Received tour data:', { 
        success: data.success, 
        count: data.data?.length,
        cached: data.cached,
        firstTourName: data.data?.[0]?.name 
      });
      return data;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes - shorter for testing
    gcTime: 2 * 60 * 60 * 1000, // 2 hours - keep in cache for longer
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount if data is still fresh
  });

  // DISABLED: Not fetching image overrides anymore to use Tour Ninja API images directly
  // const { data: imageOverrides, isLoading: overridesLoading } = useQuery({
  //   queryKey: ["/api/tour-ninja-image-overrides"],
  //   retry: false,
  //   staleTime: 60 * 60 * 1000, // 1 hour - consistent caching
  //   gcTime: 2 * 60 * 60 * 1000, // 2 hours
  // });

  const [toursWithOverrides, setToursWithOverrides] = useState<TourNinjaTour[]>([]);

  useEffect(() => {
    if (!response?.data) {
      setToursWithOverrides([]);
      return;
    }

    // NO LONGER APPLYING IMAGE OVERRIDES - Using Tour Ninja API images directly
    const processedTours = response.data.map(tour => {
      // Use Tour Ninja API images directly without any overrides
      const finalPrimaryImage = tour.primaryImage || 
                               (tour.images && tour.images[0]) || 
                               undefined;
      
      return {
        ...tour,
        customImage: undefined, // No custom overrides
        primaryImage: finalPrimaryImage,
        originalImage: tour.primaryImage,
        images: tour.images || [] // Ensure images array is always present
      };
    });
    
    setToursWithOverrides(processedTours);
  }, [response?.data]);

  return {
    tours: toursWithOverrides,
    isLoading: isLoading, // No longer loading overrides
    error,
    refetch,
    cached: response?.cached || false,
    fallback: response?.fallback || false,
    success: response?.success || false,
    message: response?.message,
    count: toursWithOverrides?.length || 0,
    imageOverrides: null // No overrides being used
  };
}

// Hook alternatif pour appel direct (si vous préférez ne pas passer par le proxy)
export function useTourNinjaDirect(apiKey?: string, companyId?: string) {
  const [tours, setTours] = useState<TourNinjaTour[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTours = async () => {
    if (!apiKey || !companyId) {
      setError('API credentials not provided');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://tour-ninja-backend.replit.app/api/public/tours?apiKey=${apiKey}&companyId=${companyId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setTours(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tours');
      setTours([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (apiKey && companyId) {
      fetchTours();
    }
  }, [apiKey, companyId]);

  return {
    tours,
    isLoading,
    error,
    refetch: fetchTours
  };
}