import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

const useFetch = (url, params) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(Boolean(url));
    const [error, setError] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);
    const paramsKey = JSON.stringify(params ?? {});

    useEffect(() => {
        if (!url) {
            return undefined;
        }

        const controller = new AbortController();

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(url, {
                    params: JSON.parse(paramsKey),
                    signal: controller.signal
                });
                setData(response.data);
            } catch (err) {
                if (!controller.signal.aborted) {
                    setError(err.response?.data?.message || err.message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        load();

        return () => controller.abort();
    }, [url, paramsKey, reloadKey]);

    const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

    return { data, loading, error, refetch };
};

export default useFetch;