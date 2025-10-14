import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { useState } from "react";

interface TextVideoBlockProps {
  block: {
    id: number;
    configuration?: {
      title?: string;
      subtitle?: string;
      titleColor?: string;
      subtitleColor?: string;
      dividerColor?: string;
      backgroundColor?: string;
      videoUrl?: string;
      videoType?: 'youtube' | 'vimeo' | 'direct';
    };
  };
}

export default function TextVideoBlock({ block }: TextVideoBlockProps) {
  const config = block.configuration || {};
  
  const title = config.title ?? "Titre de la vidéo";
  const subtitle = config.subtitle ?? "Description pour votre section vidéo";
  const titleColor = config.titleColor ?? "#333333";
  const subtitleColor = config.subtitleColor ?? "#666666";
  const dividerColor = config.dividerColor ?? "#084F6E";
  const backgroundColor = config.backgroundColor ?? "#ffffff";
  const videoUrl = config.videoUrl ?? "";
  const videoType = config.videoType ?? 'youtube';

  const [isPlaying, setIsPlaying] = useState(false);

  // Extract video ID from YouTube URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Extract video ID from Vimeo URL
  const getVimeoId = (url: string) => {
    const regExp = /vimeo\.com\/(?:video\/)?(\d+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  const renderVideo = () => {
    if (!videoUrl) {
      return (
        <div className="flex items-center justify-center h-full bg-muted text-muted-foreground">
          <p>Aucune vidéo configurée</p>
        </div>
      );
    }

    if (videoType === 'youtube') {
      const videoId = getYouTubeId(videoUrl);
      if (!videoId) {
        return <div className="text-center text-destructive">URL YouTube invalide</div>;
      }
      return (
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}${isPlaying ? '?autoplay=1' : ''}`}
          title="YouTube video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    if (videoType === 'vimeo') {
      const videoId = getVimeoId(videoUrl);
      if (!videoId) {
        return <div className="text-center text-destructive">URL Vimeo invalide</div>;
      }
      return (
        <iframe
          className="w-full h-full"
          src={`https://player.vimeo.com/video/${videoId}${isPlaying ? '?autoplay=1' : ''}`}
          title="Vimeo video"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      );
    }

    // Direct video (MP4, WebM, etc.)
    return (
      <video
        className="w-full h-full object-cover"
        controls
        autoPlay={isPlaying}
        src={videoUrl}
      >
        Votre navigateur ne supporte pas la lecture de vidéos.
      </video>
    );
  };

  return (
    <section className="py-20" style={{ backgroundColor }}>
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        {(title || subtitle) && (
          <div className="mb-12 text-center">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {title && (
                <>
                  <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3" style={{ color: titleColor }}>
                    {title}
                  </h2>
                  <div className="w-20 h-1 mx-auto mb-8" style={{ backgroundColor: dividerColor }}></div>
                </>
              )}
              {subtitle && (
                <p className="text-lg leading-relaxed max-w-3xl mx-auto whitespace-pre-line" style={{ color: subtitleColor }}>
                  {subtitle}
                </p>
              )}
            </motion.div>
          </div>
        )}

        {/* Video Player */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-xl bg-black">
            {!isPlaying && videoUrl && videoType !== 'direct' && (
              <div 
                className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 cursor-pointer group"
                onClick={() => setIsPlaying(true)}
              >
                <motion.div
                  className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:bg-white transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-10 h-10 text-primary ml-1" />
                </motion.div>
              </div>
            )}
            {renderVideo()}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
