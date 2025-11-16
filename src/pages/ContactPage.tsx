import React, { useEffect, useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { useTranslation } from '../lib/translations';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Toast } from '../components/Toast';
import { MapPinIcon, PhoneIcon, MailIcon, ClockIcon, SendIcon } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { language } = useAppStore();
  const t = useTranslation(language);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; title: string; variant: 'success' | 'error' }>({
    open: false,
    title: '',
    variant: 'success',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate sending message
    setTimeout(() => {
      setToast({
        open: true,
        title: t('messageSent'),
        variant: 'success',
      });
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="transition-page min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-1 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            {t('contactTitle')}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            {t('contactSubtitle')}
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="p-6 bg-card text-card-foreground border-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <PhoneIcon className="w-6 h-6 text-primary" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {t('phone')}
                    </h3>
                    <p className="text-muted-foreground" dir="ltr">+966 50 123 4567</p>
                    <p className="text-muted-foreground" dir="ltr">+966 50 765 4321</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card text-card-foreground border-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-tertiary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MailIcon className="w-6 h-6 text-tertiary" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                    </h3>
                    <p className="text-muted-foreground">info@silverrooster.com</p>
                    <p className="text-muted-foreground">support@silverrooster.com</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card text-card-foreground border-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPinIcon className="w-6 h-6 text-secondary" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {t('address')}
                    </h3>
                    <p className="text-muted-foreground">
                      {language === 'ar' 
                        ? 'الرياض، حي الملقا، شارع الأمير سلطان'
                        : 'Riyadh, Al Malqa District, Prince Sultan Street'}
                    </p>
                    <p className="text-muted-foreground">
                      {language === 'ar' ? 'المملكة العربية السعودية' : 'Saudi Arabia'}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card text-card-foreground border-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <ClockIcon className="w-6 h-6 text-primary" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {t('workingHours')}
                    </h3>
                    <p className="text-muted-foreground">
                      {language === 'ar' ? 'السبت - الخميس' : 'Saturday - Thursday'}
                    </p>
                    <p className="text-muted-foreground" dir="ltr">8:00 AM - 10:00 PM</p>
                    <p className="text-muted-foreground mt-2">
                      {language === 'ar' ? 'الجمعة' : 'Friday'}
                    </p>
                    <p className="text-muted-foreground" dir="ltr">2:00 PM - 10:00 PM</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="p-8 bg-card text-card-foreground border-border">
                <h2 className="text-2xl font-serif font-bold text-foreground mb-6">
                  {language === 'ar' ? 'أرسل لنا رسالة' : 'Send Us a Message'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-foreground mb-2 block">
                        {t('yourName')}
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="bg-background text-foreground border-border"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-foreground mb-2 block">
                        {t('yourEmail')}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="bg-background text-foreground border-border"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject" className="text-foreground mb-2 block">
                      {t('subject')}
                    </Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      className="bg-background text-foreground border-border"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-foreground mb-2 block">
                      {t('message')}
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={6}
                      className="bg-background text-foreground border-border"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-normal"
                    size="lg"
                  >
                    <SendIcon className="w-4 h-4 me-2" strokeWidth={2} />
                    {loading ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...') : t('sendMessage')}
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3623.9876543210!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMzEuMSJF!5e0!3m2!1sen!2ssa!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <Toast
        open={toast.open}
        onOpenChange={(open) => setToast({ ...toast, open })}
        title={toast.title}
        variant={toast.variant}
      />
    </div>
  );
};
