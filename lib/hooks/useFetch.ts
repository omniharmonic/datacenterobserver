'use client';

import useSWR, { type SWRConfiguration } from 'swr';

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(`Request failed: ${r.status}`);
    return r.json();
  });

export function useFetch<T>(url: string | null, config?: SWRConfiguration) {
  return useSWR<T>(url, fetcher, { revalidateOnFocus: false, ...config });
}
