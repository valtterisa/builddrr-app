"use client";

import { CompassIcon, RefreshCwIcon } from "lucide-react";
import { Panel, PanelHeader } from "@/components/panels/panels";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import LoadingUI from "@/components/loading-ui";
import { useSandboxStore } from "@/app/state";
import useSWR from "swr";

interface Props {
  className?: string;
  disabled?: boolean;
  url?: string;
}

export function Preview({ className, disabled, url }: Props) {
  const [currentUrl, setCurrentUrl] = useState(url);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState(url || "");
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadStartTime = useRef<number | null>(null);

  // Sandbox state moved here from SandboxState component
  const { sandboxId, status, setStatus } = useSandboxStore();
  useSWR<"ok" | "stopped">(
    sandboxId ? `/api/sandboxes/${sandboxId}` : null,
    async (pathname: string, init: RequestInit) => {
      const response = await fetch(pathname, init);
      const { status } = await response.json();
      return status;
    },
    { refreshInterval: sandboxId ? 3000 : 0 }
  )?.data === "stopped" &&
    status !== "stopped" &&
    setStatus("stopped");

  useEffect(() => {
    setCurrentUrl(url);
    setInputValue(url || "");
  }, [url]);

  const refreshIframe = () => {
    if (iframeRef.current && currentUrl) {
      setIsLoading(true);
      setError(null);
      loadStartTime.current = Date.now();
      iframeRef.current.src = "";
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentUrl;
        }
      }, 10);
    }
  };

  const loadNewUrl = () => {
    if (iframeRef.current && inputValue) {
      if (inputValue !== currentUrl) {
        setIsLoading(true);
        setError(null);
        loadStartTime.current = Date.now();
        iframeRef.current.src = inputValue;
      } else {
        refreshIframe();
      }
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError("Failed to load the page");
  };

  return (
    <Panel className={className}>
      <PanelHeader>
        <div className="absolute flex items-center space-x-1">
          <a href={currentUrl} target="_blank" className="cursor-pointer px-1">
            <CompassIcon className="w-4" />
          </a>
          <button
            onClick={refreshIframe}
            type="button"
            className={cn("cursor-pointer px-1", {
              "animate-spin": isLoading,
            })}
          >
            <RefreshCwIcon className="w-4" />
          </button>
        </div>

        <div className="m-auto h-6">
          {url && (
            <input
              type="text"
              className="font-mono text-xs h-6 border border-gray-200 px-4 bg-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[300px]"
              onChange={(event) => setInputValue(event.target.value)}
              onClick={(event) => event.currentTarget.select()}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.currentTarget.blur();
                  loadNewUrl();
                }
              }}
              value={inputValue}
            />
          )}
        </div>
      </PanelHeader>

      <div className="flex h-[calc(100%-2rem-1px)] relative">
        {status === "stopped" ? (
          <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <LoadingUI
                message="Sandbox session ended"
                submessage="Start a new session to continue"
              />
              <button
                className="text-sm underline"
                type="button"
                onClick={() => window.location.reload()}
              >
                Start a new session
              </button>
            </div>
          </div>
        ) : currentUrl && !disabled ? (
          <>
            <ScrollArea className="w-full">
              <iframe
                ref={iframeRef}
                src={currentUrl}
                className="w-full h-full"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                title="Browser content"
              />
            </ScrollArea>

            {isLoading && !error && (
              <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center">
                <LoadingUI message="Loading preview..." />
              </div>
            )}

            {error && (
              <div className="absolute inset-0 bg-white flex items-center justify-center flex-col gap-2">
                <span className="text-red-500">Failed to load page</span>
                <button
                  className="text-blue-500 hover:underline text-sm"
                  type="button"
                  onClick={() => {
                    if (currentUrl) {
                      setIsLoading(true);
                      setError(null);
                      const newUrl = new URL(currentUrl);
                      newUrl.searchParams.set("t", Date.now().toString());
                      setCurrentUrl(newUrl.toString());
                    }
                  }}
                >
                  Try again
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center">
            <LoadingUI message="Waiting for preview..." />
          </div>
        )}
      </div>
    </Panel>
  );
}
