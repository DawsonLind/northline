"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useJson<T>(url: string, intervalMs = 4000) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const loadRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`${response.status}`);
        }
        const json = (await response.json()) as T;
        if (!cancelled) {
          setData(json);
          setError(null);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to reach the network feed");
          setLoading(false);
        }
      }
    }

    loadRef.current = load;
    void load();
    const id = setInterval(() => {
      void load();
    }, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [url, intervalMs]);

  const reload = useCallback(() => loadRef.current(), []);

  return { data, error, loading, reload };
}
