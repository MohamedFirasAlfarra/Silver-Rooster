import { Order, Product } from '../types';
const TELEGRAM_BOT_TOKEN = "8297015172:AAH4SVFKqYieIeR0so7_U7LShGBlx6W8g7s";
export const ADMIN_CHAT_ID = "1117780634";

export const sendTelegramMessage = async (chatId: string, message: string) => {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    if (!data.ok) {
      console.error('Telegram API Error:', data);
      throw new Error(data.description);
    }
    return data;
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    return null;
  }
};

export const formatOrderMessage = (order: Order, items: { product: Product; quantity: number; price: number }[]) => {
  const date = new Date(order.created_at).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const itemsList = items
    .map(
      (item) =>
        `- ${item.product.name} (${item.quantity} × ${item.price} SAR)`
    )
    .join('\n');

  return `
🧾 <b>New Order</b>
-------------------------
<b>Order ID:</b> ${order.id.slice(0, 8)}
<b>Customer:</b> ${order.customer_name}
<b>Phone:</b> ${order.customer_phone}

<b>Items:</b>
${itemsList}

<b>Total:</b> ${order.total_amount} SAR
<b>Payment:</b> Cash on delivery
<b>Address:</b> ${order.governorate} – ${order.delivery_address}
<b>Date:</b> ${date}
-------------------------
Thank you for your purchase!
`;
};
