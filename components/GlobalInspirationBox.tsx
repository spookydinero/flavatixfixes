'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useInspirationBox } from '../hooks/useInspirationBox';

// Dynamically import to avoid SSR issues with viewport calculations
const InspirationBox = dynamic(() => import('./ui/inspiration-box'), {
  ssr: false,
  loading: () => null
});

interface GlobalInspirationBoxProps {
  children: React.ReactNode;
}

const GlobalInspirationBox: React.FC<GlobalInspirationBoxProps> = ({ children }) => {
  const [isClient, setIsClient] = useState(false);
  const { shouldShow, containerRef } = useInspirationBox();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <>{children}</>;
  }

  return (
    <div ref={containerRef} className="relative">
      {children}

      {/* Inspiration Box - only show if there's excessive whitespace */}
      {shouldShow && (
        <div className="mt-8 flex justify-center">
          <InspirationBox />
        </div>
      )}
    </div>
  );
};

export default GlobalInspirationBox;
