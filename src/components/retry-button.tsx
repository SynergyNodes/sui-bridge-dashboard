"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface RetryButtonProps {
  onRetry: () => void;
  isLoading: boolean;
}

export function RetryButton({ onRetry, isLoading }: RetryButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onRetry}
      disabled={isLoading}
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Retrying...' : 'Retry'}
    </Button>
  );
}
