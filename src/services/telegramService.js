import { TELEGRAM_CONFIG } from './environment';

export class TelegramService {
  static async sendMessage(chatId, message) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: parseInt(chatId),
          text: message,
          parse_mode: 'HTML'
        })
      });
      
      const result = await response.json();
      
      if (!result.ok) {
        console.error('Telegram API error:', result);
        return { success: false, error: result.description };
      }
      
      return { success: true, result };
      
    } catch (error) {
      console.error('Telegram send error:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendOrderToAdmin(orderData, userData) {
    const message = this.formatAdminOrderMessage(orderData, userData);
    return await this.sendMessage(TELEGRAM_CONFIG.ADMIN_CHAT_ID, message);
  }

  static async sendOrderToUser(orderData, userData) {
    if (!userData.telegram_chat_id) {
      return { success: false, error: 'User has no telegram_chat_id' };
    }
    
    const message = this.formatUserOrderMessage(orderData, userData);
    return await this.sendMessage(userData.telegram_chat_id, message);
  }

  static formatAdminOrderMessage(order, user) {
    return `🛒 <b>طلب جديد #${order.id.slice(-8)}</b>

👤 <b>العميل:</b> ${user.full_name || 'غير محدد'}
📧 <b>البريد:</b> ${user.email}
📞 <b>الهاتف:</b> ${order.customer_phone}
📍 <b>العنوان:</b> ${order.delivery_address}
🗺️ <b>الموقع:</b> ${order.delivery_location}
🏙️ <b>المحافظة:</b> ${order.governorate}

💰 <b>المجموع:</b> ${order.total_amount} د.ع
🚚 <b>نوع التوصيل:</b> ${order.delivery_type}
🚚 <b>تكلفة التوصيل:</b> ${order.delivery_cost} د.ع
📝 <b>ملاحظات:</b> ${order.notes || 'لا يوجد'}

⏰ <b>الوقت:</b> ${new Date(order.created_at).toLocaleString('ar-IQ')}
✅ <b>حالة الطلب:</b> ${order.status}`;
  }

  static formatUserOrderMessage(order, user) {
    return `✅ <b>تم استلام طلبك بنجاح</b>

شكراً لك ${user.full_name || 'عزيزي العميل'} على ثقتك بنا

💰 <b>المجموع:</b> ${order.total_amount} د.ع
🚚 <b>نوع التوصيل:</b> ${order.delivery_type}
📍 <b>العنوان:</b> ${order.delivery_address}
🏙️ <b>المحافظة:</b> ${order.governorate}

🆔 <b>رقم طلبك:</b> #${order.id.slice(-8)}
⏰ <b>وقت الطلب:</b> ${new Date(order.created_at).toLocaleString('ar-IQ')}

📞 <b>للاستفسار:</b> ${order.customer_phone}

<i>سيتم تحديثك بحالة طلبك قريباً</i>`;
  }

  // دالة لاختبار البوت
  static async testBot() {
    try {
      const response = await this.sendMessage(
        TELEGRAM_CONFIG.ADMIN_CHAT_ID,
        '🔔 <b>اختبار النظام</b>\n\nالبوت يعمل بشكل مثالي! ✅'
      );
      return response;
    } catch (error) {
      return { success: false, error };
    }
  }
}