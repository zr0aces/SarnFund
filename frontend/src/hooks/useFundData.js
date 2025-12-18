import { useState, useEffect, useCallback } from 'react';

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 Hours
const API_BASE_URL = ''; // Always use relative path to use proxy

export const useFundData = (fundType, initialMockData) => {
    const [funds, setFunds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [dataSource, setDataSource] = useState('loading'); // 'loading', 'cache', 'api', 'mock'

    // Load initial state from Cache or Mock
    useEffect(() => {
        const cacheKey = `fund_cache_v3_${fundType}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                const age = Date.now() - parsed.timestamp;
                if (age < CACHE_DURATION) {
                    console.log(`[useFundData] Using valid cache for ${fundType}`);
                    setFunds(parsed.data);
                    setLastUpdated(new Date(parsed.timestamp).toLocaleTimeString());
                    setDataSource('cache');
                    return;
                } else {
                    console.log(`[useFundData] Cache expired for ${fundType}`);
                }
            } catch (e) {
                console.error("Cache parse error", e);
            }
        }

        // Use Mock/Initial Data if available
        if (initialMockData && initialMockData.length > 0) {
            console.log(`[useFundData] Using initial mock data for ${fundType}`);
            setFunds(initialMockData);
            setDataSource('mock');
            setLastUpdated(new Date().toLocaleTimeString());
            // Disable background API fetch to prevent overwriting with stale data
            // fetchDataFromAPI(false, true); // silent update
            return;
        }

        // If no cache or mock, start with loading
        setLastUpdated(null);
        setDataSource('loading');

        // Try to fetch from API
        fetchDataFromAPI(false, false);
    }, [fundType, initialMockData]);

    const fetchDataFromAPI = useCallback(async (forceRefresh = false, silent = false) => {
        setLoading(true);
        setError(null);

        try {
            const endpoint = `/api/funds/${fundType}`;
            const response = await fetch(`${API_BASE_URL}${endpoint}`);

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.data && result.data.length > 0) {
                setFunds(result.data);
                setLastUpdated(new Date(result.timestamp).toLocaleTimeString());
                setDataSource('api');

                // Save to local cache
                const cachePayload = {
                    timestamp: result.timestamp,
                    data: result.data
                };
                localStorage.setItem(`fund_cache_v3_${fundType}`, JSON.stringify(cachePayload));

                console.log(`[useFundData] Fetched ${result.data.length} funds from API`);
            } else {
                throw new Error('No data available from API');
            }

        } catch (err) {
            console.error(`[useFundData] Error fetching from API:`, err);

            // Show error to user
            if (!silent) {
                setError(`Unable to fetch data: ${err.message}`);
                setDataSource('error');
            }
        } finally {
            setLoading(false);
        }
    }, [fundType]);

    const refresh = useCallback(async () => {
        await fetchDataFromAPI(true);
    }, [fetchDataFromAPI]);

    return {
        funds,
        loading,
        error,
        lastUpdated,
        dataSource,
        refresh
    };
};
