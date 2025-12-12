// components/SessionManager.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, checkSessionExpiry, validateUserSession } from '../stores/useAuthStore';

export const SessionManager: React.FC = () => {
  const navigate = useNavigate();
  const { user, isGuest } = useAuthStore();

  useEffect(() => {
    // تحديث النشاط عند تفاعل المستخدم
    const updateActivity = () => {
      useAuthStore.getState().updateLastActivity();
    };

    // إضافة مستمعات الأحداث
    const events = ['click', 'keydown', 'scroll', 'mousemove', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    // فحص انتهاء الجلسة كل دقيقة
    const interval = setInterval(() => {
      const expired = checkSessionExpiry();
      if (expired && (user || isGuest)) {
        console.log('⏰ انتهت جلسة المستخدم بسبب عدم النشاط');
        if (user) {
          navigate('/login');
        }
      }
    }, 60000); // كل دقيقة

    // فحص عند التركيز على النافذة
    const handleFocus = async () => {
      const { valid } = await validateUserSession();
      if (!valid && user) {
        console.log('⚠️ جلسة غير صالحة عند التركيز');
        navigate('/login');
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, isGuest, navigate]);

  return null; // لا يعرض أي شيء
};