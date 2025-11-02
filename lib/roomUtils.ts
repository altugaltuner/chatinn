/**
 * Room ID utility fonksiyonları
 * Bu fonksiyonlar hem frontend hem backend tarafında kullanılabilir
 */

export interface RoomInfo {
    type: 'dm';
    userId1: number;
    userId2: number;
}

/**
 * İki kullanıcı ID'sinden roomId oluşturur
 * Küçük ID her zaman önce gelir (tutarlılık için)
 * 
 * @example
 * createDMRoomId(5, 3) // "dm_3_5"
 * createDMRoomId(1, 8) // "dm_1_8"
 */
export function createDMRoomId(userId1: number, userId2: number): string {
    const minId = Math.min(userId1, userId2);
    const maxId = Math.max(userId1, userId2);
    return `dm_${minId}_${maxId}`;
}

/**
 * RoomID'den mesaj tipini ve ilgili ID'leri çıkarır
 * 
 * @example
 * parseRoomId("dm_1_5") // { type: 'dm', userId1: 1, userId2: 5 }
 * parseRoomId("invalid") // null
 */
export function parseRoomId(roomId: string): RoomInfo | null {
    if (roomId.startsWith('dm_')) {
        const parts = roomId.replace('dm_', '').split('_');
        return {
            type: 'dm',
            userId1: parseInt(parts[0]),
            userId2: parseInt(parts[1])
        };
    }
    return null;
}

/**
 * RoomId'den diğer kullanıcının ID'sini alır
 * 
 * @param roomId - Oda ID'si (örn: "dm_1_8")
 * @param currentUserId - Mevcut kullanıcının ID'si
 * @returns Diğer kullanıcının ID'si veya null
 */
export function getOtherUserId(roomId: string, currentUserId: number): number | null {
    const roomInfo = parseRoomId(roomId);
    if (!roomInfo) return null;

    return roomInfo.userId1 === currentUserId ? roomInfo.userId2 : roomInfo.userId1;
}

