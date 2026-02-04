"use client";

import { ErrorContent } from "@/components/error/ErrorContent";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorContent error={error} reset={reset} />;
}
