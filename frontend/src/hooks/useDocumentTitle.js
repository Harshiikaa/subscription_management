import { useEffect } from "react";

const useDocumentTitle = (title) => {
  useEffect(() => {
    if (!title) return;
    const prev = document.title;
    document.title = title;
    return () => {
      document.title = prev;
    };
  }, [title]);
};

export default useDocumentTitle;
