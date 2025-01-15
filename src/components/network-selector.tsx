"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type NetworkType = 'MAINNET_BRIDGE' | 'TESTNET_BRIDGE';

interface NetworkConfig {
  name: string;
  url: string | undefined;
}

export interface NetworkSelectorProps {
  selectedNetwork: NetworkType;
  onNetworkChange: (network: NetworkType) => void;
}

const networks: Record<NetworkType, NetworkConfig> = {
  MAINNET_BRIDGE: {
    name: "Mainnet Bridge",
    url: process.env.NEXT_PUBLIC_MAINNET_BRIDGE_URL
  },
  TESTNET_BRIDGE: {
    name: "Testnet Bridge",
    url: process.env.NEXT_PUBLIC_TESTNET_BRIDGE_URL
  }
};

export function NetworkSelector({ selectedNetwork, onNetworkChange }: NetworkSelectorProps) {
  return (
    <Select value={selectedNetwork} onValueChange={onNetworkChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Network" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(networks).map(([key, value]) => (
          <SelectItem key={key} value={key as NetworkType}>
            {value.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
