'use client'

import { useHeartbeat } from '@/hooks/useHeartbeat';

export default function HeartbeatTracker() {
  useHeartbeat();
  return null; // Component này không render gì cả
}