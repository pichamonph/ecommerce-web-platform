'use client';

import { useEffect } from 'react';

export default function OmiseScript() {
  useEffect(() => {
    // Wait for Omise.js to load
    const checkOmiseLoaded = setInterval(() => {
      if (typeof window !== 'undefined' && (window as any).Omise) {
        clearInterval(checkOmiseLoaded);

        // Fetch public key from backend
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/omise/public-key`)
          .then(res => res.json())
          .then(data => {
            const publicKey = data.publicKey;
            console.log('🔑 Setting Omise public key:', publicKey);
            (window as any).Omise.setPublicKey(publicKey);
          })
          .catch(err => {
            console.error('❌ Failed to fetch Omise public key:', err);
          });
      }
    }, 100);

    // Cleanup after 10 seconds if not loaded
    const timeout = setTimeout(() => {
      clearInterval(checkOmiseLoaded);
    }, 10000);

    return () => {
      clearInterval(checkOmiseLoaded);
      clearTimeout(timeout);
    };
  }, []);

  return null;
}
