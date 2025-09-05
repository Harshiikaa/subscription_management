import { useEffect, useState } from "react";

const useFetch = (fetcher, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await fetcher();
        if (!mounted) return;
        setData(res?.data?.data ?? res?.data ?? null);
      } catch (e) {
        if (!mounted) return;
        setError(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, deps);

  return { data, loading, error, setData };
};

export default useFetch;
