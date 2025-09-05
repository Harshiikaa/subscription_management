import { useEffect } from "react";

const ensureMeta = () => {
  let tag = document.querySelector('meta[name="description"]');
  if (!tag) {
    tag = document.createElement("meta");
    tag.name = "description";
    document.head.appendChild(tag);
  }
  return tag;
};

const useMeta = ({ description }) => {
  useEffect(() => {
    if (!description) return;
    const tag = ensureMeta();
    const prev = tag.getAttribute("content");
    tag.setAttribute("content", description);
    return () => {
      tag.setAttribute("content", prev || "");
    };
  }, [description]);
};

export default useMeta;
