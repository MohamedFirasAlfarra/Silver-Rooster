import React, { useCallback, useEffect, useState } from 'react';
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
    color: 'from-blue-600/70',
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
    color: 'from-green-600/70',
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
    color: 'from-orange-600/70',
  },
];

export const HeroSlider: React.FC = () => {
  const { language } = useAppStore();
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      direction: language === 'ar' ? 'rtl' : 'ltr' // إضافة دعم RTL/LTR
    }, 
    [
      Autoplay({ delay: 5000, stopOnInteraction: false }),
    ]
  );
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  // تحديث السلايدر عند تغيير اللغة
  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit({ direction: language === 'ar' ? 'rtl' : 'ltr' });
      console.log('🔄 تم تحديث السلايدر للغة:', language);
    }
  }, [language, emblaApi]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // إضافة CSS للتدريج والحركة
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes fadeInRight {
        from {
          opacity: 0;
          transform: translateX(${language === 'ar' ? '-30px' : '30px'});
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      .animate-fade-in {
        animation: fadeInUp 0.8s ease-out forwards;
      }
      
      .animate-fade-in-delay {
        animation: fadeInUp 0.8s ease-out 0.3s forwards;
        opacity: 0;
      }
      
      .animate-fade-in-btn {
        animation: fadeInUp 0.8s ease-out 0.6s forwards;
        opacity: 0;
      }
      
      .slide-fade-in {
        animation: fadeInRight 0.8s ease-out forwards;
      }
      
      /* تحسينات للغة العربية */
      .rtl-slide {
        direction: rtl;
        text-align: right;
      }
      
      .ltr-slide {
        direction: ltr;
        text-align: left;
      }
      
      .embla__slide {
        position: relative;
        min-width: 100%;
      }
      
      .embla__slide img {
        transition: transform 0.8s ease;
      }
      
      .embla__slide:hover img {
        transform: scale(1.05);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [language]);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl mx-4 my-8 md:mx-auto md:my-12 max-w-7xl shadow-2xl">
      {/* تأثيرات خلفية */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 z-0" />
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
      
      <div className="relative z-10">
        <div className="embla overflow-hidden rounded-2xl" ref={emblaRef}>
          <div className="embla__container flex">
            {slides.map((slide, index) => (
              <div 
                key={slide.id} 
                className={`embla__slide flex-[0_0_100%] min-w-0 relative ${language === 'ar' ? 'rtl-slide' : 'ltr-slide'}`}
              >
                <div className="relative h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
                  {/* صورة الخلفية */}
                  <div className="absolute inset-0">
                    <img
                      src={slide.image}
                      alt={language === 'ar' ? slide.titleAr : slide.titleEn}
                      className="w-full h-full object-cover"
                      loading="eager"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://via.placeholder.com/1920x700/667eea/ffffff?text=${encodeURIComponent(slide.titleEn)}`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
                    <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} opacity-30`} />
                  </div>
                  
                  {/* محتوى السلايد */}
                  <div className="absolute inset-0 flex items-center">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                      <div className={`max-w-2xl ${language === 'ar' ? 'text-right ml-auto' : 'text-left'}`}>
                        {/* شريط العلامة */}
                        <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6 slide-fade-in">
                          <span className="text-white text-sm font-semibold">
                            {language === 'ar' ? ' أفضل جودة' : ' Best Quality'}
                          </span>
                        </div>
                        
                        {/* العنوان */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-white mb-6 animate-fade-in leading-tight">
                          {language === 'ar' ? slide.titleAr : slide.titleEn}
                        </h1>
                        
                        {/* الوصف */}
                        <p className="text-xl md:text-2xl text-white/90 mb-10 animate-fade-in-delay leading-relaxed max-w-xl">
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

        {/* أزرار التنقل */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-4">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === selectedIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* أزرار السابق/التالي */}
        <button
          onClick={scrollPrev}
          className={`absolute top-1/2 z-20 w-14 h-14 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center text-white hover:bg-white/30 hover:scale-110 active:scale-95 transition-all duration-300 shadow-2xl ${
            language === 'ar' ? 'right-8' : 'left-8'
          }`}
          aria-label="Previous slide"
        >
          {language === 'ar' ? (
            <ChevronRightIcon className="w-7 h-7" strokeWidth={2.5} />
          ) : (
            <ChevronLeftIcon className="w-7 h-7" strokeWidth={2.5} />
          )}
        </button>
        <button
          onClick={scrollNext}
          className={`absolute top-1/2 z-20 w-14 h-14 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 flex items-center justify-center text-white hover:bg-white/30 hover:scale-110 active:scale-95 transition-all duration-300 shadow-2xl ${
            language === 'ar' ? 'left-8' : 'right-8'
          }`}
          aria-label="Next slide"
        >
          {language === 'ar' ? (
            <ChevronLeftIcon className="w-7 h-7" strokeWidth={2.5} />
          ) : (
            <ChevronRightIcon className="w-7 h-7" strokeWidth={2.5} />
          )}
        </button>
      </div>
     
    </div>
  );
};