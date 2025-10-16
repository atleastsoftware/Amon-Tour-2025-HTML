import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

function hexToHSL(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return `${h} ${s}% ${l}%`;
}

export default function ThemeLoader() {
  const { data: themeSettings } = useQuery({
    queryKey: ['/api/public/theme-settings'],
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  useEffect(() => {
    if (themeSettings && Array.isArray(themeSettings)) {
      const primaryColor = themeSettings.find((s: any) => s.key === 'primary_color')?.value;
      const secondaryColor = themeSettings.find((s: any) => s.key === 'secondary_color')?.value;
      const colorPaletteRaw = themeSettings.find((s: any) => s.key === 'color_palette')?.value;
      
      const root = document.documentElement;
      
      // Apply primary color
      if (primaryColor && primaryColor.startsWith('#')) {
        const hsl = hexToHSL(primaryColor);
        root.style.setProperty('--primary', hsl);
      }
      
      // Apply secondary color
      if (secondaryColor && secondaryColor.startsWith('#')) {
        const hsl = hexToHSL(secondaryColor);
        root.style.setProperty('--secondary', hsl);
      }
      
      // Apply color palette
      if (colorPaletteRaw) {
        try {
          const colorPalette = typeof colorPaletteRaw === 'string' ? JSON.parse(colorPaletteRaw) : colorPaletteRaw;
          
          if (colorPalette.text && colorPalette.text.startsWith('#')) {
            const hsl = hexToHSL(colorPalette.text);
            root.style.setProperty('--foreground', hsl);
          }
          
          if (colorPalette.background && colorPalette.background.startsWith('#')) {
            const hsl = hexToHSL(colorPalette.background);
            root.style.setProperty('--background', hsl);
          }
          
          if (colorPalette.textMenu && colorPalette.textMenu.startsWith('#')) {
            const hsl = hexToHSL(colorPalette.textMenu);
            root.style.setProperty('--menu-text', hsl);
          }
          
          if (colorPalette.backgroundMenu && colorPalette.backgroundMenu.startsWith('#')) {
            const hsl = hexToHSL(colorPalette.backgroundMenu);
            root.style.setProperty('--menu-background', hsl);
          }
          
          if (colorPalette.textFooter && colorPalette.textFooter.startsWith('#')) {
            const hsl = hexToHSL(colorPalette.textFooter);
            root.style.setProperty('--footer-text', hsl);
          }
          
          if (colorPalette.backgroundFooter && colorPalette.backgroundFooter.startsWith('#')) {
            const hsl = hexToHSL(colorPalette.backgroundFooter);
            root.style.setProperty('--footer-background', hsl);
          }
        } catch (e) {
          console.error('Error parsing color palette:', e);
        }
      }
    }
  }, [themeSettings]);

  return null;
}
