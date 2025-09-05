import { useEffect } from "react";

export const trackEvent = async (payload) => {
  try {
    const url = process.env.REACT_APP_ANALYTICS_URL;
    if (!url) {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.log("analytics:event", payload);
      }
      return;
    }
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (_) {}
};

const useAnalytics = ({ type, data }) => {
  useEffect(() => {
    if (!type) return;
    const payload = { type, ts: Date.now(), ...data };
    trackEvent(payload);
  }, [type, data]);
};

export default useAnalytics;
