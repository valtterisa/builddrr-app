"use client";

import * as React from "react";

export function IframePreview({
  width = 280,
  height = 160,
  children,
}: {
  width?: number;
  height?: number;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;

    function onLoad() {
      try {
        const doc = iframe.contentDocument!;
        // copy stylesheets and inline styles
        const head = doc.head;
        const parentHead = document.head;
        Array.from(
          parentHead.querySelectorAll('style, link[rel="stylesheet"]')
        ).forEach((el) => {
          head.appendChild(el.cloneNode(true));
        });
        // copy theme classes and css variables
        doc.documentElement.className = document.documentElement.className;
        const rootStyle = getComputedStyle(document.documentElement);
        const computedVars: Record<string, string> = {};
        for (let i = 0; i < rootStyle.length; i++) {
          const name = rootStyle[i];
          if (name.startsWith("--"))
            computedVars[name] = rootStyle.getPropertyValue(name);
        }
        Object.entries(computedVars).forEach(([k, v]) => {
          doc.documentElement.style.setProperty(k, v);
        });
        setReady(true);
      } catch {
        setReady(true);
      }
    }

    iframe.addEventListener("load", onLoad);
    if (iframe.contentDocument?.readyState === "complete") onLoad();
    return () => iframe.removeEventListener("load", onLoad);
  }, []);

  return (
    <iframe
      ref={ref}
      title="preview"
      style={{
        width,
        height,
        border: "1px solid hsl(var(--border))",
        borderRadius: 6,
        background: "transparent",
      }}
    >
      {ready && (
        // eslint-disable-next-line react/no-unknown-property
        // @ts-ignore - React allows rendering into iframe via srcDoc/body injection with portal-like approach
        <div dangerouslySetInnerHTML={{ __html: `<div id="root"></div>` }} />
      )}
      {ready &&
        ref.current?.contentDocument &&
        // Render children into iframe body
        (createPortal(
          children as any,
          ref.current.contentDocument.body
        ) as any)}
    </iframe>
  );
}

// Helper for rendering into iframe
import { createPortal } from "react-dom";
