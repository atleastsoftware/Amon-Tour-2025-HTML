import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

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
  const { data: response, isLoading, error, refetch } = useQuery<TourNinjaApiResponse>({
    queryKey: ['/api/proxy/tours'],
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Fetch image overrides
  const { data: imageOverrides, isLoading: overridesLoading } = useQuery({
    queryKey: ['/api/tour-ninja-image-overrides'],
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
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
      
      return {
        ...tour,
        customImage: override?.customImageUrl,
        primaryImage: override?.customImageUrl || tour.primaryImage
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
  const { data: response, isLoading, error, refetch } = useQuery<TourNinjaApiResponse>({
    queryKey: ['/api/proxy/tours'],
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Use public endpoint to get only active overrides
  const { data: imageOverrides, isLoading: overridesLoading } = useQuery({
    queryKey: ["/api/tour-ninja-image-overrides"],
    retry: false,
  });

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
      
      return {
        ...tour,
        customImage: override?.customImageUrl,
        primaryImage: override?.customImageUrl || tour.primaryImage,
        originalImage: tour.primaryImage
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
    count: toursWithOverrides?.length || 0,
    imageOverrides
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