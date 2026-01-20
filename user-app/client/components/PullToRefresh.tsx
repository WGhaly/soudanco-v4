import { useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh?: () => Promise<void>;
}

export default function PullToRefresh({ children, onRefresh }: PullToRefreshProps) {
  const queryClient = useQueryClient();
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const THRESHOLD = 80; // Distance to trigger refresh
  const MAX_PULL = 120;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    
    try {
      // Invalidate all queries to refetch fresh data
      await queryClient.invalidateQueries();
      
      // Call custom refresh handler if provided
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Refresh failed:', error);
    }
    
    setRefreshing(false);
    setPullDistance(0);
    setPulling(false);
  }, [queryClient, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Check if at top of page
      const atTop = window.scrollY <= 0;
      if (atTop && !refreshing) {
        startY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current || refreshing) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;

      // Check if at top of page and pulling down
      if (diff > 0 && window.scrollY <= 0) {
        // Prevent default scrolling behavior
        e.preventDefault();
        const distance = Math.min(diff * 0.5, MAX_PULL);
        setPullDistance(distance);
        setPulling(true);
      } else {
        // Reset if scrolling up or not at top
        isPulling.current = false;
        setPullDistance(0);
        setPulling(false);
      }
    };

    const handleTouchEnd = () => {
      if (!isPulling.current) return;
      isPulling.current = false;

      if (pullDistance >= THRESHOLD && !refreshing) {
        handleRefresh();
      } else {
        setPullDistance(0);
        setPulling(false);
      }
    };

    // Add touch event listeners with passive: false to allow preventDefault
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [refreshing, pullDistance, handleRefresh]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen"
      style={{ touchAction: pulling ? 'none' : 'auto' }}
    >
      {/* Pull indicator */}
      <div
        className="fixed left-0 right-0 flex justify-center items-center z-[100] transition-all duration-200 pointer-events-none"
        style={{
          top: 0,
          transform: `translateY(${Math.min(pullDistance - 40, MAX_PULL - 40)}px)`,
          opacity: pullDistance > 20 ? 1 : 0,
        }}
      >
        <div className={`w-8 h-8 rounded-full bg-[#FD7E14] flex items-center justify-center ${refreshing ? 'animate-spin' : ''}`}>
          {refreshing ? (
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" style={{ transform: `rotate(${Math.min(pullDistance / THRESHOLD * 180, 180)}deg)` }} viewBox="0 0 24 24" fill="none">
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      </div>

      {/* Content - just render children directly */}
      {children}
    </div>
  );
}
