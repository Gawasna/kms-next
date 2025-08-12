import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';

export function useHeartbeat() {
  const { data: session } = useSession();
  
  useEffect(() => {
    // Tạo hoặc lấy guestId từ localStorage nếu chưa đăng nhập
    let guestId = localStorage.getItem('guestId');
    if (!session && !guestId) {
      guestId = uuidv4();
      localStorage.setItem('guestId', guestId);
    }
    
    // Gửi heartbeat định kỳ (30 giây một lần)
    const sendHeartbeat = async () => {
      try {
        await fetch('/api/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guestId: session ? null : guestId }),
        });
      } catch (error) {
        console.error('Failed to send heartbeat:', error);
      }
    };
    
    // Gửi heartbeat ngay lập tức
    sendHeartbeat();
    
    // Thiết lập interval
    const intervalId = setInterval(sendHeartbeat, 30000);
    
    // Cleanup khi component unmount
    return () => clearInterval(intervalId);
  }, [session]);
}