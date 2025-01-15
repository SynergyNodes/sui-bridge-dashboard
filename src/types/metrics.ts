export interface EthQueries {
  blockNumber: number;
  call: number;
  chainId: number;
  getBlockByNumber: number;
  getTransactionReceipt: number;
}

export interface SuiQuery {
  received: number;
  ok: number;
  inflight: number;
}

export interface CacheQuery {
  hits: number;
  misses: number;
}

export interface WatcherActivity {
  receivedActions: number;
  receivedEvents: number;
  unrecognizedEvents: number;
}

export interface BridgeMetrics {
  status: string;
  version: string;
  uptime: number;
  clientEnabled: boolean;
  eth: {
    queries: EthQueries;
  };
  sui: {
    handleAddTokensOnSui: SuiQuery;
  };
  cache: {
    ethActionVerifier: CacheQuery;
    governanceVerifier: CacheQuery;
    suiActionVerifier: CacheQuery;
  };
  errors: {
    buildSuiTransaction: number;
    signatureAggregation: number;
    suiTransactionExecution: number;
    suiTransactionSubmission: number;
    suiTransactionSubmissionTooManyFailures: number;
  };
  client: {
    ethWatcher: WatcherActivity;
    suiWatcher: WatcherActivity;
    gasCoinBalance: number;
    lastFinalizedEthBlock: number;
  };
  timestamp?: number;
}

export interface HistoricalMetric extends BridgeMetrics {
  timestamp: number;
}

export interface NetworkStatus {
  isOnline: boolean;
  lastChecked: Date;
  responseTime: number;
}
