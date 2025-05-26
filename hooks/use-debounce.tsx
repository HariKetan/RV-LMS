import { useState, useEffect } from 'react';

function useDebounce<T>(value: T, delay?: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Update debounced value after delay
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay || 500);

        // Cancel the timeout if value changes (also on component unmount)
        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

export { useDebounce };