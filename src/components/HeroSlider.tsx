import React, { useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useAppStore } from '../stores/useAppStore';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from './ui/button';

const slides = [
  {
    id: 1,
    titleEn: 'Premium Quality Chicken',
    titleAr: 'دجاج بجودة ممتازة',
    descriptionEn: 'Fresh, healthy, and delicious chicken products delivered to your door',
    descriptionAr: 'منتجات دجاج طازجة وصحية ولذيذة توصل إلى باب منزلك',
    image: 'https://static.hiamag.com/styles/autox754/public/article/06/10/2020/9792556-816302673.jpg',
    cta: 'Shop Now',
    ctaAr: 'تسوق الآن',
  },
  {
    id: 2,
    titleEn: 'Farm Fresh Daily',
    titleAr: 'طازج من المزرعة يومياً',
    descriptionEn: 'Sourced from trusted local farms for the best quality and taste',
    descriptionAr: 'من مزارع محلية موثوقة لأفضل جودة ومذاق',
    image: 'https://palsawa.com/uploads/images/2021/05/T2A9F.jpg',
    cta: 'Explore',
    ctaAr: 'استكشف',
  },
  {
    id: 3,
    titleEn: 'Special Offers',
    titleAr: 'عروض خاصة',
    descriptionEn: 'Get amazing deals on our premium chicken products',
    descriptionAr: 'احصل على عروض مذهلة على منتجات الدجاج الممتازة',
    image: 'https://magic-stores.com/wp-content/uploads/2021/05/%D8%AF%D8%AC%D8%A7%D8%AC-%D9%85%D9%82%D8%B7%D8%B9.png',
    cta: 'View Offers',
    ctaAr: 'عرض العروض',
  },
];

export const HeroSlider: React.FC = () => {
  const { language } = useAppStore();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="relative overflow-hidden">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container flex">
          {slides.map((slide) => (
            <div key={slide.id} className="embla__slide flex-[0_0_100%] min-w-0 relative">
              <div className="relative h-[500px] md:h-[600px] lg:h-[700px]">
                <img
                  src={slide.image}
                  alt={language === 'ar' ? slide.titleAr : slide.titleEn}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
                
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-2xl">
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-4 animate-fade-in">
                        {language === 'ar' ? slide.titleAr : slide.titleEn}
                      </h1>
                      <p className="text-lg md:text-xl text-white/90 mb-8 animate-fade-in-delay">
                        {language === 'ar' ? slide.descriptionAr : slide.descriptionEn}
                      </p>
                     
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={scrollPrev}
        className="absolute top-1/2 start-4 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all"
        aria-label="Previous slide"
      >
        {language === 'ar' ? (
          <ChevronRightIcon className="w-6 h-6" strokeWidth={2} />
        ) : (
          <ChevronLeftIcon className="w-6 h-6" strokeWidth={2} />
        )}
      </button>
      <button
        onClick={scrollNext}
        className="absolute top-1/2 end-4 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all"
        aria-label="Next slide"
      >
        {language === 'ar' ? (
          <ChevronLeftIcon className="w-6 h-6" strokeWidth={2} />
        ) : (
          <ChevronRightIcon className="w-6 h-6" strokeWidth={2} />
        )}
      </button>
    </div>
  );
};
