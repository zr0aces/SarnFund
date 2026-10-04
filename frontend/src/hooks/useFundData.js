import { useState, useEffect, useCallback, useRef } from 'react';

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 h
const CACHE_VERSION  = 'v4';                  // bump to bust old caches

export const useFundData = (fundType, initialMockData) => {
    const cacheKey = `fund_cache_${CACHE_VERSION}_${fundType}`;

    const getInitialCache = useCallback(() => {
        try {
            const raw = localStorage.getItem(cacheKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed?.data) && parsed.data.length > 0 &&
                    parsed.data.every(fund => fund && typeof fund === 'object' && !Array.isArray(fund)) &&
                    Number.isFinite(parsed.timestamp) && Date.now() - parsed.timestamp < CACHE_DURATION) {
                    return parsed;
                }
            }
        } catch { /* corrupted or unavailable browser storage */ }
        return null;
    }, [cacheKey]);

    const initialCache = getInitialCache();

    const [funds,       setFunds]       = useState(() => {
        if (initialCache) return initialCache.data;
        if (initialMockData?.length) return initialMockData;
        return [];
    });
    const [loading,     setLoading]     = useState(() => !initialCache && !initialMockData?.length);
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

    const fetchData = useCallback(async (isSilent = false, cachedTs = null, ignoreRef = null) => {
        if (!isSilent) {
            setLoading(true);
            setError(null);
        }

        try {
            const res = await fetch(`/api/funds/${fundType}`);
            if (!res.ok) throw new Error(`API error: ${res.status}`);

            const result = await res.json();
            if (ignoreRef?.current) return;
            if (!result.success || !Array.isArray(result.data) || !result.data.length ||
                !Number.isFinite(result.timestamp)) {
                throw new Error('No data available from API');
            }

            // Skip update if the server has no newer data than what's displayed.
            if (cachedTs && result.timestamp <= cachedTs) return;
            // Skip if a newer response already arrived.
            if (result.timestamp <= currentTimestamp.current) return;

            currentTimestamp.current = result.timestamp;
            setFunds(result.data);
            setLastUpdated(result.lastUpdated || new Date(result.timestamp).toISOString());
            setDataSource('api');
            setLoading(false);

            try {
                localStorage.setItem(cacheKey, JSON.stringify({
                    timestamp:   result.timestamp,
                    lastUpdated: result.lastUpdated,
                    data:        result.data,
                }));
            } catch { /* display API data even if browser storage is unavailable */ }
        } catch (err) {
            if (ignoreRef?.current) return;
            // In silent mode, only surface the error if there's no cache to fall back on.
            if (!isSilent || !cachedTs) {
                setError(`Unable to fetch data: ${err.message}`);
                setDataSource('error');
            }
        } finally {
            if (!ignoreRef?.current && (!isSilent || !cachedTs)) {
                setLoading(false);
            }
        }
    }, [fundType, cacheKey]);

    // On mount or fundType change: query server asynchronously.
    useEffect(() => {
        const cached = getInitialCache();
        const ignoreRef = { current: false };

        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData(true, cached?.timestamp, ignoreRef);

        return () => {
            ignoreRef.current = true;
        };
    }, [fundType, cacheKey, getInitialCache, fetchData]);

    const refresh = useCallback(() => {
        try { localStorage.removeItem(cacheKey); } catch { /* browser storage unavailable */ }
        currentTimestamp.current = 0;
        fetchData(false, null);
    }, [cacheKey, fetchData]);

    return { funds, loading, error, lastUpdated, dataSource, refresh };
};
