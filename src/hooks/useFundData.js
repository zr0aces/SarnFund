import { useState, useEffect, useCallback } from 'react';

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 Hours
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useFundData = (fundType, initialMockData) => {
    const [funds, setFunds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    // Load initial state from Cache or Mock
    useEffect(() => {
        const cacheKey = `fund_cache_${fundType}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                const age = Date.now() - parsed.timestamp;
                if (age < CACHE_DURATION) {
                    console.log(`[useFundData] Using valid cache for ${fundType}`);
                    setFunds(parsed.data);
                    setLastUpdated(new Date(parsed.timestamp).toLocaleTimeString());
                    return;
                } else {
                    console.log(`[useFundData] Cache expired for ${fundType}`);
                }
            } catch (e) {
                console.error("Cache parse error", e);
            }
        }

        // If no cache or expired, use mock data initially
        // User can manually refresh to fetch from API
        setFunds(initialMockData);
        setLastUpdated(new Date().toLocaleTimeString());
        
        // Try to fetch from API in the background without showing errors
        fetchDataFromAPI(false, true);
    }, [fundType, initialMockData]);

    const fetchDataFromAPI = useCallback(async (forceRefresh = false, silent = false) => {
        setLoading(true);
        setError(null);

        try {
            const endpoint = fundType === 'rmf' ? '/api/funds/rmf' : '/api/funds/tesg';
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success && result.data && result.data.length > 0) {
                setFunds(result.data);
                setLastUpdated(new Date(result.timestamp).toLocaleTimeString());
                
                // Save to local cache
                const cachePayload = {
                    timestamp: result.timestamp,
                    data: result.data
                };
                localStorage.setItem(`fund_cache_${fundType}`, JSON.stringify(cachePayload));
                
                console.log(`[useFundData] Fetched ${result.data.length} funds from API`);
            } else {
                throw new Error('No data available from API');
            }

        } catch (err) {
            console.error(`[useFundData] Error fetching from API:`, err);
            
            // Only show error to user if this is a manual refresh (not silent)
            if (!silent) {
                setError(`Unable to fetch data: ${err.message}. Using fallback data.`);
                
                // Fallback to mock data if API fails on manual refresh
                setFunds(initialMockData);
                setLastUpdated(new Date().toLocaleTimeString());
            }
            // If silent, just log and don't change anything (keep existing data)
        } finally {
            setLoading(false);
        }
    }, [fundType, initialMockData]);

    const refresh = useCallback(async () => {
        await fetchDataFromAPI(true);
    }, [fetchDataFromAPI]);

    return {
        funds,
        loading,
        error,
        lastUpdated,
        refresh
    };
};
