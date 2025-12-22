import { useState, useEffect } from 'react';

const DEVICE_ID_KEY = 'tetris-device-id';

/**
 * UUID v4 を生成
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * デバイスIDを管理するフック
 * localStorageに永続化されたUUIDを返す
 */
export function useDeviceId(): string | null {
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window === 'undefined') return;

    let id = localStorage.getItem(DEVICE_ID_KEY);

    if (!id) {
      id = generateUUID();
      localStorage.setItem(DEVICE_ID_KEY, id);
    }

    setDeviceId(id);
  }, []);

  return deviceId;
}

/**
 * デバイスIDを直接取得（非フック版、SSR非対応）
 */
export function getDeviceId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  let id = localStorage.getItem(DEVICE_ID_KEY);

  if (!id) {
    id = generateUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }

  return id;
}
