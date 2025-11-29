import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const TelegramConnect = ({ user }) => {
  const [chatId, setChatId] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('telegram_chat_id, full_name')
      .eq('id', user.id)
      .single();
    setUserProfile(data);
  };

  const connectTelegram = async () => {
    if (!chatId.trim()) return;

    const { error } = await supabase
      .from('profiles')
      .update({ telegram_chat_id: chatId.trim() })
      .eq('id', user.id);

    if (error) {
      setMessage('❌ حدث خطأ: ' + error.message);
    } else {
      setMessage('✅ تم ربط حساب التلجرام بنجاح!');
      setChatId('');
      loadUserProfile();
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '10px', margin: '20px 0' }}>
      <h3>🔗 ربط حساب التلجرام</h3>
      
      {userProfile?.telegram_chat_id ? (
        <div>
          <p>✅ حسابك مرتبط مع التلجرام</p>
          <p>Chat ID: {userProfile.telegram_chat_id}</p>
        </div>
      ) : (
        <div>
          <input
            type="text"
            placeholder="أدخل Chat ID"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            style={{ marginRight: '10px', padding: '8px' }}
          />
          <button onClick={connectTelegram} style={{ padding: '8px 15px' }}>
            ربط الحساب
          </button>
        </div>
      )}
      
      {message && <p style={{ color: message.includes('✅') ? 'green' : 'red' }}>{message}</p>}
      
      <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
        <p>كيفية الحصول على Chat ID:</p>
        <ol>
          <li>اذهب إلى @userinfobot في التلجرام</li>
          <li>أرسل /start</li>
          <li>انسخ الرقم الذي يظهر</li>
        </ol>
      </div>
    </div>
  );
};

export default TelegramConnect;