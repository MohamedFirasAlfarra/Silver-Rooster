import React, { useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { useTranslation } from '../lib/translations';
import { Card } from '../components/ui/card';
import { CheckCircleIcon, TargetIcon, EyeIcon, UsersIcon } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { language } = useAppStore();
  const t = useTranslation(language);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="transition-page min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-1 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            {t('aboutTitle')}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            {t('aboutSubtitle')}
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <UsersIcon className="w-6 h-6 text-primary" strokeWidth={2} />
                </div>
                <h2 className="text-3xl font-serif font-bold text-foreground">
                  {t('ourStory')}
                </h2>
              </div>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  {language === 'ar' 
                    ? 'بدأت رحلتنا من شغف بسيط بتقديم أفضل منتجات الدجاج الطازجة والصحية لعملائنا. نحن نؤمن بأن الجودة تبدأ من المصدر، لذلك نعمل مع أفضل المزارع المحلية التي تلتزم بأعلى معايير الجودة والنظافة.'
                    : 'Our journey began with a simple passion for providing the best fresh and healthy chicken products to our customers. We believe that quality starts from the source, so we work with the best local farms that adhere to the highest standards of quality and cleanliness.'}
                </p>
                <p>
                  {language === 'ar' 
                    ? 'على مر السنين، نمت علامتنا التجارية لتصبح واحدة من أكثر الأسماء الموثوقة في مجال توريد الدجاج الطازج. نحن نفخر بتقديم منتجات عالية الجودة، مع خدمة عملاء استثنائية.'
                    : 'Over the years, our brand has grown to become one of the most trusted names in fresh chicken supply. We pride ourselves on delivering high-quality products at competitive prices, with exceptional customer service.'}
                </p>
              </div>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://static.hiamag.com/styles/autox754/public/article/06/10/2020/9792556-816302673.jpg"
                alt="Our Story"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission */}
            <Card className="p-8 bg-card text-card-foreground border-border hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <TargetIcon className="w-8 h-8 text-primary" strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-foreground mb-4">
                {t('ourMission')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {language === 'ar' 
                  ? 'مهمتنا هي توفير أفضل منتجات الدجاج الطازجة والصحية لعملائنا، مع الحفاظ على أعلى معايير الجودة والنظافة. نسعى لبناء علاقات طويلة الأمد مع عملائنا من خلال تقديم خدمة استثنائية ومنتجات موثوقة.'
                  : 'Our mission is to provide the best fresh and healthy chicken products to our customers, while maintaining the highest standards of quality and cleanliness. We strive to build long-term relationships with our customers by delivering exceptional service and reliable products.'}
              </p>
            </Card>

            {/* Vision */}
            <Card className="p-8 bg-card text-card-foreground border-border hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-tertiary/10 rounded-2xl flex items-center justify-center mb-6">
                <EyeIcon className="w-8 h-8 text-tertiary" strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-foreground mb-4">
                {t('ourVision')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {language === 'ar' 
                  ? 'رؤيتنا هي أن نصبح الخيار الأول لمنتجات الدجاج الطازجة  من خلال الابتكار المستمر وتحسين خدماتنا. نطمح لتوسيع نطاق عملنا لنصل إلى المزيد من العملاء.'
                  : 'Our vision is to become the first choice for fresh chicken products in the Kingdom, through continuous innovation and improvement of our services. We aspire to expand our reach to serve more customers throughout the Kingdom.'}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              {language === 'ar' ? 'قيمنا' : 'Our Values'}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {language === 'ar' 
                ? 'القيم التي نؤمن بها وتوجه عملنا اليومي'
                : 'The values we believe in and guide our daily work'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 bg-card text-card-foreground border-border text-center hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="w-8 h-8 text-primary" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {language === 'ar' ? 'الجودة' : 'Quality'}
              </h3>
              <p className="text-muted-foreground">
                {language === 'ar' 
                  ? 'نلتزم بأعلى معايير الجودة في جميع منتجاتنا'
                  : 'We commit to the highest quality standards in all our products'}
              </p>
            </Card>

            <Card className="p-6 bg-card text-card-foreground border-border text-center hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-tertiary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="w-8 h-8 text-tertiary" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {language === 'ar' ? 'الأمانة' : 'Honesty'}
              </h3>
              <p className="text-muted-foreground">
                {language === 'ar' 
                  ? 'نتعامل بشفافية وأمانة مع جميع عملائنا'
                  : 'We deal with transparency and honesty with all our customers'}
              </p>
            </Card>

            <Card className="p-6 bg-card text-card-foreground border-border text-center hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="w-8 h-8 text-secondary" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {language === 'ar' ? 'الابتكار' : 'Innovation'}
              </h3>
              <p className="text-muted-foreground">
                {language === 'ar' 
                  ? 'نسعى دائماً للتطوير والابتكار في خدماتنا'
                  : 'We always strive for development and innovation in our services'}
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};
