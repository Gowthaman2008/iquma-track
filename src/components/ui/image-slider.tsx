"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ImageSliderProps extends React.HTMLAttributes<HTMLDivElement> {
  images: string[];
  interval?: number;
}

const ImageSlider = React.forwardRef<HTMLDivElement, ImageSliderProps>(
  ({ images, interval = 5000, className, ...props }, ref) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);

    // Preload images into memory so slides never flash or show broken icons
    React.useEffect(() => {
      if (typeof window === "undefined" || !images || images.length === 0) return;
      images.forEach((src) => {
        if (src) {
          const img = new window.Image();
          img.src = src;
        }
      });
    }, [images]);

    // Effect to handle the interval-based image transition
    React.useEffect(() => {
      if (!images || images.length <= 1) return;
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
      }, interval);

      // Cleanup the interval on component unmount
      return () => clearInterval(timer);
    }, [images, interval]);

    // Fallback handler if any image fails to load
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
      const fallback = "/hero/arabic-hero.jpg";
      if (e.currentTarget && !e.currentTarget.src.endsWith(fallback)) {
        e.currentTarget.src = fallback;
      }
    };

    const currentImage = images[currentIndex] || "/hero/arabic-hero.jpg";

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full h-full overflow-hidden bg-muted",
          className
        )}
        {...props}
      >
        <AnimatePresence initial={false}>
          <motion.img
            key={currentIndex}
            src={currentImage}
            alt={`Slide ${currentIndex + 1}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            onError={handleImageError}
            loading="eager"
            draggable={false}
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300 cursor-pointer",
                currentIndex === index 
                  ? "bg-white w-5" 
                  : "bg-white/50 hover:bg-white"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    );
  }
);

ImageSlider.displayName = "ImageSlider";

export { ImageSlider };
