import { useLocation } from "react-router-dom";
import useAnalytics from "../hooks/useAnalytics";

const AnalyticsListener = () => {
  const location = useLocation();
  useAnalytics({ type: "page_view", data: { path: location.pathname } });
  return null;
};

export default AnalyticsListener;
