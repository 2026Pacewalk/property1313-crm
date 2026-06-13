import { useState, useRef, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxHeight?: string;
}

// Shared lock counter so multiple sheets don't stomp each other's body scroll-lock.
let bodyLockCount = 0;
function lockBody() {
  bodyLockCount += 1;
  document.body.style.overflow = 'hidden';
}
function unlockBody() {
  bodyLockCount = Math.max(0, bodyLockCount - 1);
  if (bodyLockCount === 0) document.body.style.overflow = '';
}

export default function BottomSheet({ isOpen, onClose, title, children, maxHeight = '85vh' }: BottomSheetProps) {
  const [visible, setVisible] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startYRef = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Smooth open/close with CSS transitions instead of spring physics
  useEffect(() => {
    if (isOpen) {
      lockBody();
      setVisible(true);
      return () => unlockBody();
    }
    setDragY(0);
    const timer = setTimeout(() => setVisible(false), 250);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
    isDragging.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const delta = e.touches[0].clientY - startYRef.current;
    if (delta > 0) {
      // Apply resistance to make it feel natural
      setDragY(delta * 0.5);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    if (dragY > 80) {
      onClose();
    }
    setDragY(0);
  }, [dragY, onClose]);

  // Close on backdrop tap
  const handleBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!visible && !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={handleBackdropClick}
      />
      {/* Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-background text-foreground rounded-t-2xl shadow-2xl border-t border-border transition-transform duration-200 ease-out',
          isOpen ? 'translate-y-0' : 'translate-y-full'
        )}
        style={{
          maxHeight,
          transform: isOpen ? `translateY(${dragY}px)` : undefined,
          paddingBottom: 'env(safe-area-inset-bottom, 16px)',
          willChange: 'transform',
        }}
      >
        {/* Handle + Header (draggable area) */}
        <div
          className="flex items-center justify-between px-4 pt-3 pb-3"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex items-center gap-3 flex-1">
            {/* Handle bar */}
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full flex-shrink-0" />
          </div>
          <h2 className="absolute left-0 right-0 text-center text-base font-semibold pointer-events-none px-16 truncate">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors flex-shrink-0 z-10"
          >
            <X size={18} />
          </button>
        </div>
        {/* Scrollable Content */}
        <div
          className="overflow-y-auto scroll-momentum px-4 pb-8"
          style={{ maxHeight: `calc(${maxHeight} - 60px)` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
