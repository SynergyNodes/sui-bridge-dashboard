"use client";

import { Badge } from "@/components/ui/badge";
import { NetworkStatus } from "@/types/metrics";
import { Clock, Wifi, WifiOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NetworkStatusIndicatorProps {
  status: NetworkStatus;
  networkName: string;
}

export function NetworkStatusIndicator({ status, networkName }: NetworkStatusIndicatorProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge 
            variant={status.isOnline ? "default" : "destructive"}
            className="flex items-center gap-1"
          >
            {status.isOnline ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            {networkName}
            <Clock className="h-3 w-3 ml-1" />
            {status.responseTime}ms
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Last checked: {status.lastChecked.toLocaleTimeString()}</p>
          <p>Response time: {status.responseTime}ms</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
