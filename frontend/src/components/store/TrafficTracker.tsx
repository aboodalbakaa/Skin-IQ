'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function TrafficTracker() {
  const pathname = usePathname();
  const supabase = createClient();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Prevent double tracking in dev or on same path
    if (lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;

    const trackView = async () => {
      const ua = navigator.userAgent;
      
      // Simple device detection
      let deviceType = 'Desktop';
      if (/Mobi|Android/i.test(ua)) deviceType = 'Mobile';
      if (/Tablet|iPad/i.test(ua)) deviceType = 'Tablet';

      // Simple browser detection
      let browser = 'Other';
      if (ua.includes('Chrome')) browser = 'Chrome';
      else if (ua.includes('Firefox')) browser = 'Firefox';
      else if (ua.includes('Safari')) browser = 'Safari';
      else if (ua.includes('Edge')) browser = 'Edge';

      try {
        await supabase.from('page_views').insert({
          path: pathname,
          referrer: document.referrer || null,
          browser,
          device_type: deviceType,
        });
      } catch (err) {
        // Silently fail to not interrupt user experience
        console.error('Analytics error:', err);
      }
    };

    // Delay slightly to prioritize page load performance
    const timeout = setTimeout(trackView, 1000);
    return () => clearTimeout(timeout);
  }, [pathname, supabase]);

  return null;
}
