import { useState, useEffect } from 'react';

// Lazy load image modules
const imageModules = import.meta.glob<{ default: string }>('../assets/nft_downloads/**/*.png');

// Create a map for quick lookup
const imagePathMap = new Map<string, () => Promise<{ default: string }>>();
Object.entries(imageModules).forEach(([path, loader]) => {
  const filename = path.split('/').pop()?.toLowerCase() || '';
  imagePathMap.set(filename, loader);
});

// Cache for loaded images
const loadedImagesCache = new Map<string, string>();

export function useGiftImage(filename: string): string {
  const [imageUrl, setImageUrl] = useState<string>(() => {
    // Return from cache if available
    return loadedImagesCache.get(filename.toLowerCase()) || '';
  });

  useEffect(() => {
    // Skip if already loaded
    if (imageUrl) return;

    const loadImage = async () => {
      const lowerFilename = filename.toLowerCase();
      
      // Check cache again
      if (loadedImagesCache.has(lowerFilename)) {
        setImageUrl(loadedImagesCache.get(lowerFilename)!);
        return;
      }

      const loader = imagePathMap.get(lowerFilename);
      if (!loader) {
        console.warn(`Image loader not found for: ${filename}`);
        return;
      }

      try {
        const module = await loader();
        loadedImagesCache.set(lowerFilename, module.default);
        setImageUrl(module.default);
      } catch (error) {
        console.error(`Failed to load image: ${filename}`, error);
      }
    };

    loadImage();
  }, [filename, imageUrl]);

  return imageUrl;
}
