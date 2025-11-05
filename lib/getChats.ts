interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
  picture?: string;
}

/**
 * Mevcut kullanıcının tüm konuşmalarını getirir
 * @param userId - Kullanıcının ID'si
 * @returns Konuşmalar dizisi
 */
export async function getChats(userId: number): Promise<Chat[]> {
  try {
    if (!userId) {
      console.error('Kullanıcı ID bulunamadı');
      return [];
    }

    const response = await fetch(`http://localhost:3001/api/messages/conversations/${userId}`);
    const data = await response.json();

    if (data.success) {
      // Zamanı formatla
      const formattedChats = data.conversations.map((conv: any) => {
        const messageDate = new Date(conv.time);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let timeString: string;

        if (messageDate.toDateString() === today.toDateString()) {
          // Bugünse saat:dakika göster
          timeString = messageDate.toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
          });
        } else if (messageDate.toDateString() === yesterday.toDateString()) {
          timeString = "Dün";
        } else {
          // Daha eskiyse tarih göster
          timeString = messageDate.toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "short",
          });
        }

        return {
          ...conv,
          time: timeString,
        };
      });

      return formattedChats;
    }

    return [];
  } catch (err) {
    console.error('Konuşmalar yüklenirken hata:', err);
    return [];
  }
}

/**
 * localStorage'dan mevcut kullanıcının ID'sini alır
 * @returns Kullanıcı ID'si veya 0
 */
export function getCurrentUserId(): number {
  if (typeof window === 'undefined') return 0;
  const userStr = localStorage.getItem("user");
  if (userStr) {
    const user = JSON.parse(userStr);
    return user.id || 0;
  }
  return 0;
}

