import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useTranslation } from '../lib/translations';
import { supabase } from '../lib/supabaseClient';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Toast } from '../components/Toast';
import { SendIcon, InfoIcon } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const { user, isGuest } = useAuthStore();
  const t = useTranslation(language);
  
  const [chatId, setChatId] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; title: string; variant: 'success' | 'error' }>({
    open: false,
    title: '',
    variant: 'success',
  });

  useEffect(() => {
    if (!user || isGuest) {
      navigate('/login');
      return;
    }

    // Fetch current chat_id
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('telegram_chat_id')
        .eq('id', user.id)
        .single();
      
      if (data?.telegram_chat_id) {
        setChatId(data.telegram_chat_id);
      }
    };

    fetchProfile();
  }, [user, isGuest, navigate]);

  const handleLinkTelegram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ telegram_chat_id: chatId })
        .eq('id', user.id);

      if (error) throw error;

      setToast({
        open: true,
        title: t('telegramLinked'),
        variant: 'success',
      });
    } catch (error) {
      setToast({
        open: true,
        title: t('error'),
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="transition-page min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-8">
          {t('linkTelegram')}
        </h1>

        <Card className="p-6 bg-card text-card-foreground border-border">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0">
              <SendIcon className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Telegram Notifications</h2>
              <p className="text-muted-foreground">
                {t('telegramLinkDesc')}
              </p>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <InfoIcon className="w-4 h-4" />
              {t('howToGetChatId')}
            </h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {t('chatIdInstructions')}
            </p>
          </div>

          <form onSubmit={handleLinkTelegram} className="space-y-4">
            <div>
              <Label htmlFor="chatId">{t('enterChatId')}</Label>
              <Input
                id="chatId"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="123456789"
                className="mt-1"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              {loading ? 'Saving...' : t('save')}
            </Button>
          </form>
        </Card>
      </div>

      <Toast
        open={toast.open}
        onOpenChange={(open) => setToast({ ...toast, open })}
        title={toast.title}
        variant={toast.variant}
      />
    </div>
  );
};
