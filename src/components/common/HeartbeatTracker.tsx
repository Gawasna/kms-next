// src/components/common/HeartbeatTracker.tsx
'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';

const GUEST_ID_COOKIE_NAME = 'guest_id';
const HEARTBEAT_INTERVAL_MS = 30 * 1000; // 30 giây

export default function HeartbeatTracker() {
  const { data: session, status } = useSession();

  useEffect(() => {
    let guestId = Cookies.get(GUEST_ID_COOKIE_NAME);

    // Tạo guest ID nếu chưa có
    if (!guestId && status === 'unauthenticated') {
      guestId = uuidv4();
      Cookies.set(GUEST_ID_COOKIE_NAME, guestId, { expires: 7 }); // Hết hạn sau 7 ngày
    }

    const sendHeartbeat = async () => {
      let payload: { guestId?: string } = {};

      if (status === 'authenticated') {
        payload = {};
      } else if (status === 'unauthenticated' && guestId) {
        payload = { guestId };
      } else {
        return;
      }

      try {
        await fetch('/api/heartbeat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.error('Failed to send heartbeat:', error);
      }
    };

    sendHeartbeat();
    const intervalId = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [session, status]);

  return null;
}