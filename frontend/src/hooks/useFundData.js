import { useState, useEffect, useCallback, useRef } from 'react';

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 h
const CACHE_VERSION  = 'v4';                  // bump to bust old caches

export const useFundData = (fundType, initialMockData) => {
    const cacheKey = `fund_cache_${CACHE_VERSION}_${fundType}`;

    const getInitialCache = useCallback(() => {
        const raw = localStorage.getItem(cacheKey);
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                if (Date.now() - parsed.timestamp < CACHE_DURATION) {
                    return parsed;
                }
            } catch { /* corrupted cache */ }
        }
        return null;
    }, [cacheKey]);

    const initialCache = getInitialCache();

    const [funds,       setFunds]       = useState(() => {
        if (initialCache) return initialCache.data;
        if (initialMockData?.length) return initialMockData;
        return [];
    });
    const [loading,     setLoading]     = useState(false);
    const [error,       setError]       = useState(null);
    const [lastUpdated, setLastUpdated] = useState(() => {
        if (initialCache) return initialCache.lastUpdated || new Date(initialCache.timestamp).toISOString();
        return null;
    });
    const [dataSource,  setDataSource]  = useState(() => {
        if (initialCache) return 'cache';
        if (initialMockData?.length) return 'mock';
        return 'loading';
    });

    // Prevents a stale silent fetch from overwriting newer data that arrived
    // while it was in-flight.
    const currentTimestamp = useRef(initialCache ? initialCache.timestamp : 0);

    const fetchDataFromAPI = useCallback(async (silent = false, cachedTimestamp = null) => {
        if (!silent) setLoading(true);
        if (!silent) setError(null);

        try {
            const res = await fetch(`/api/funds/${fundType}`);
            if (!res.ok) throw new Error(`API error: ${res.status}`);

            const result = await res.json();
            if (!result.success || !result.data?.length) {
                throw new Error('No data available from API');
            }

            // Skip update if the server has no newer data than what's displayed.
            if (cachedTimestamp && result.timestamp <= cachedTimestamp) return;
            // Skip if a newer response already arrived.
            if (result.timestamp <= currentTimestamp.current) return;

            currentTimestamp.current = result.timestamp;
            setFunds(result.data);
            setLastUpdated(result.lastUpdated || new Date(result.timestamp).toISOString());
            setDataSource('api');

            localStorage.setItem(cacheKey, JSON.stringify({
                timestamp:   result.timestamp,
                lastUpdated: result.lastUpdated,
                data:        result.data,
            }));
        } catch (err) {
            if (!silent) {
                setError(`Unable to fetch data: ${err.message}`);
                setDataSource('error');
            }
        } finally {
            if (!silent) setLoading(false);
        }
    }, [fundType, cacheKey]);

    // On mount: serve from cache immediately, then silently check server.
    useEffect(() => {
        const cached = getInitialCache();
        if (cached) {
            currentTimestamp.current = cached.timestamp;
            // Silently update if the server has newer data.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchDataFromAPI(true, cached.timestamp);
        } else if (initialMockData?.length) {
            // Already initialized in useState, no action needed
        } else {
            fetchDataFromAPI(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fundType]);

    const refresh = useCallback(() => {
        localStorage.removeItem(cacheKey);
        currentTimestamp.current = 0;
        fetchDataFromAPI(false);
    }, [cacheKey, fetchDataFromAPI]);

    return { funds, loading, error, lastUpdated, dataSource, refresh };
};
