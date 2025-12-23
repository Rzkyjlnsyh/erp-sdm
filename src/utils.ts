
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const escapeHTML = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

export const sendTelegramNotification = async (token: string, chatId: string, message: string) => {
  if (!token || !chatId) return;
  
  // Workaround for Telegram Topics: Allow format "CHATID_THREADID" (e.g. -100123456_1)
  let actualChatId = chatId;
  let messageThreadId: number | undefined = undefined;

  if (chatId.includes('_')) {
    const parts = chatId.split('_');
    if (parts.length === 2 && !isNaN(Number(parts[1]))) {
      actualChatId = parts[0];
      messageThreadId = parseInt(parts[1]);
    }
  }

  // Ensure supergroup prefix (-100) if missing (Common user mistake)
  // If user provides "2383546842", convert to "-1002383546842" for API
  if (!actualChatId.startsWith('-') && /^\d+$/.test(actualChatId)) {
      // Just a heuristic: most Topic-enabled groups are supergroups which need -100
      // But let's be careful. If user inputs raw positive integer, Telegram API usually needs -100 prefix for supergroups.
      actualChatId = `-100${actualChatId}`;
  }


  try {
    const body: any = {
      chat_id: actualChatId,
      text: message,
      parse_mode: 'HTML',
    };

    if (messageThreadId) {
      body.message_thread_id = messageThreadId;
    }

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Telegram API Error Response:", errorData);
      
      // Auto-Retry Logic: If Thread Not Found, try sending to General (no thread_id)
      if (errorData.description && errorData.description.includes('message thread not found') && messageThreadId) {
          console.warn("Topic not found. Retrying send to General/Default topic...");
          delete body.message_thread_id;
          
          const retryResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          
          if (!retryResponse.ok) {
              const retryError = await retryResponse.json().catch(() => ({}));
              throw new Error(retryError.description || `Retry API Error ${retryResponse.status}`);
          } else {
              console.log(`Fallback success: Message sent to ${actualChatId} (General/Default)`);
              return; // Success on retry
          }
      }

      throw new Error(errorData.description || `API Error ${response.status}`);
    } else {
        console.log(`Telegram sent to ${actualChatId} (Topic: ${messageThreadId || 'None'})`);
    }
  } catch (error: any) {
    console.error("Gagal mengirim Telegram:", error.message || error);
  }
};

export const sendTelegramDocument = async (token: string, chatId: string, pdfBlob: Blob, filename: string, caption: string) => {
  if (!token || !chatId) return;
  try {
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('document', pdfBlob, filename);
    formData.append('caption', caption);
    formData.append('parse_mode', 'HTML');

    const response = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.description || `API Error ${response.status}`);
    }
  } catch (error: any) {
    console.error("Gagal mengirim Dokumen Telegram:", error.message || error);
    throw error;
  }
};
