import { io, Socket } from 'socket.io-client';

// Socket.IO backend URL'i
const SOCKET_URL = 'http://localhost:3001';

// Socket instance'ı oluştur
let socket: Socket | null = null;

// Socket bağlantısını başlat
export const initSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('✅ Socket.IO bağlantısı kuruldu:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO bağlantısı kesildi:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('🔴 Socket.IO bağlantı hatası:', error);
    });
  }

  return socket;
};

// Socket'i al (varsa) - yoksa başlat
export const getSocket = (): Socket => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

// Bir odaya katıl
export const joinRoom = (roomId: string) => {
  const activeSocket = getSocket();
  activeSocket.emit('join_room', roomId);
  console.log(`📥 ${roomId} odasına katılındı`);
};

// Mesaj gönder
export const sendMessage = (data: {
  roomId: string;
  message: string;
  senderId: number;
  senderName: string;
}) => {
  const activeSocket = getSocket();
  activeSocket.emit('send_message', data);
  console.log('📤 Mesaj gönderildi:', data);
};

// Yazıyor bildirimi gönder
export const sendTyping = (data: { roomId: string; userName: string }) => {
  const activeSocket = getSocket();
  activeSocket.emit('typing', data);
};

// Mesaj dinle
export const onMessage = (callback: (data: any) => void) => {
  const activeSocket = getSocket();
  activeSocket.on('receive_message', callback);
};

// Yazıyor bildirimini dinle
export const onTyping = (callback: (data: any) => void) => {
  const activeSocket = getSocket();
  activeSocket.on('user_typing', callback);
};

// Socket bağlantısını kapat
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🔌 Socket bağlantısı kapatıldı');
  }
};

// Event listener'ı temizle
export const offMessage = () => {
  if (socket) {
    socket.off('receive_message');
  }
};

export const offTyping = () => {
  if (socket) {
    socket.off('user_typing');
  }
};

