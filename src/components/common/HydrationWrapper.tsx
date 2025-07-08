"use client";
import { useEffect, useState } from "react";
import { ReactNode } from "react";

interface HydrationWrapperProps {
  children: ReactNode;
}

export default function HydrationWrapper({ children }: HydrationWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a minimal loading state that matches the eventual layout
    // This prevents layout shift while styles are loading
    return (
      <div 
        style={{ 
          minHeight: '100vh',
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)',
          fontFamily: 'inherit'
        }}
      >
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
