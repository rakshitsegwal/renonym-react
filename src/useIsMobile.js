import { useState, useEffect } from 'react';

// Tiny viewport hook for the inline-style components (where CSS media queries
// can't reach). Returns true at/below `maxWidth`. SSR-safe default.
export function useIsMobile(maxWidth = 760) {
    const q = `(max-width:${maxWidth}px)`;
    const [isMobile, setIsMobile] = useState(
        () => typeof window !== 'undefined' && window.matchMedia(q).matches
    );
    useEffect(() => {
        const mq = window.matchMedia(q);
        const onChange = () => setIsMobile(mq.matches);
        onChange();
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, [q]);
    return isMobile;
}
