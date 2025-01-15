"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, AlertTriangle, CheckCircle, Database, Wallet, RefreshCw } from 'lucide-react';
import { NetworkSelector } from '@/components/network-selector';
import { ThemeToggle } from '@/components/theme-toggle';
import { NetworkStatusIndicator } from '@/components/network-status';
import { RetryButton } from '@/components/retry-button';
import { HistoricalChart } from '@/components/historical-chart';
import { BridgeMetrics, HistoricalMetric, NetworkStatus } from '@/types/metrics';
import { NetworkType } from '@/components/network-selector';
import Link from 'next/link';

const REFRESH_INTERVAL = 30000;
const MAX_HISTORICAL_POINTS = 30;

const BridgeDashboard = () => {
  const [metrics, setMetrics] = useState<BridgeMetrics | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalMetric[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>(
  (process.env.NEXT_PUBLIC_DEFAULT_NETWORK as NetworkType) || "MAINNET_BRIDGE"
);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: false,
    lastChecked: new Date(),
    responseTime: 0,
  });


  const parseMetricsData = (text: string): BridgeMetrics => {
    const parseValue = (line: string) => {
      const value = line.split(' ')[1];
      return parseFloat(value);
    };

    const findMetric = (name: string) => {
      const line = text.split('\n').find(l => l.startsWith(name));
      return line ? parseValue(line) : 0;
    };

    const getVersion = (text: string) => {
      const versionLine = text.split('\n').find(line => line.includes('version'));
      const match = versionLine?.match(/version="([^"]+)"/);
      return match?.[1] || '0.0.0';
    };

    const getClientEnabled = (text: string) => {
      const versionLine = text.split('\n').find(line => line.includes('version'));
      const match = versionLine?.match(/client_enabled="(true|false)"/);
      return match?.[1] === 'true';
    };

    return {
      status: 'Active',
      version: getVersion(text),
      uptime: findMetric('uptime') * 1000,
      clientEnabled: getClientEnabled(text),
      eth: {
        queries: {
          blockNumber: findMetric('bridge_eth_rpc_queries{type="eth_blockNumber"}'),
          call: findMetric('bridge_eth_rpc_queries{type="eth_call"}'),
          chainId: findMetric('bridge_eth_rpc_queries{type="eth_chainId"}'),
          getBlockByNumber: findMetric('bridge_eth_rpc_queries{type="eth_getBlockByNumber"}'),
          getTransactionReceipt: findMetric('bridge_eth_rpc_queries{type="eth_getTransactionReceipt"}')
        }
      },
      sui: {
        handleAddTokensOnSui: {
          received: findMetric('bridge_requests_received{type="handle_add_tokens_on_sui"}'),
          ok: findMetric('bridge_requests_ok{type="handle_add_tokens_on_sui"}'),
          inflight: findMetric('bridge_requests_inflight{type="handle_add_tokens_on_sui"}')
        }
      },
      cache: {
        ethActionVerifier: {
          hits: findMetric('bridge_signer_with_cache_hit{type="EthActionVerifier"}'),
          misses: findMetric('bridge_signer_with_cache_miss{type="EthActionVerifier"}')
        },
        governanceVerifier: {
          hits: findMetric('bridge_signer_with_cache_hit{type="GovernanceVerifier"}'),
          misses: findMetric('bridge_signer_with_cache_miss{type="GovernanceVerifier"}')
        },
        suiActionVerifier: {
          hits: findMetric('bridge_signer_with_cache_hit{type="SuiActionVerifier"}'),
          misses: findMetric('bridge_signer_with_cache_miss{type="SuiActionVerifier"}')
        }
      },
      errors: {
        buildSuiTransaction: findMetric('bridge_err_build_sui_transaction'),
        signatureAggregation: findMetric('bridge_err_signature_aggregation'),
        suiTransactionExecution: findMetric('bridge_err_sui_transaction_execution'),
        suiTransactionSubmission: findMetric('bridge_err_sui_transaction_submission'),
        suiTransactionSubmissionTooManyFailures: findMetric('bridge_err_sui_transaction_submission_too_many_failures')
      },
      client: {
        ethWatcher: {
          receivedActions: findMetric('bridge_eth_watcher_received_actions'),
          receivedEvents: findMetric('bridge_eth_watcher_received_events'),
          unrecognizedEvents: findMetric('bridge_eth_watcher_unrecognized_events')
        },
        suiWatcher: {
          receivedActions: findMetric('bridge_sui_watcher_received_actions'),
          receivedEvents: findMetric('bridge_sui_watcher_received_events'),
          unrecognizedEvents: 0
        },
        gasCoinBalance: findMetric('bridge_gas_coin_balance'),
        lastFinalizedEthBlock: findMetric('bridge_last_finalized_eth_block')
      }
    };
  };

  const updateHistoricalData = useCallback((newMetrics: BridgeMetrics) => {
    setHistoricalData(prev => {
      // Ensure timestamp is added
      const newMetricWithTimestamp: HistoricalMetric = {
        ...newMetrics,
        timestamp: Date.now()
      };
      const newData = [...prev, newMetricWithTimestamp];
      return newData.slice(-MAX_HISTORICAL_POINTS);
    });
  }, []);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

const fetchMetrics = useCallback(async () => {
  const startTime = Date.now();
  try {
    setLoading(true);
    const response = await fetch(`/api/metrics?network=${selectedNetwork}`);
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    const parsedMetrics = parseMetricsData(text);
    
    setMetrics(parsedMetrics);
    updateHistoricalData(parsedMetrics);
    setLastUpdated(new Date());
    setError(null);
    setNetworkStatus({
      isOnline: true,
      lastChecked: new Date(),
      responseTime,
    });
  } catch (err) {
    // Proper error type checking
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    setError(errorMessage);
    setNetworkStatus({
      isOnline: false,
      lastChecked: new Date(),
      responseTime: Date.now() - startTime,
    });
    console.error('Error fetching metrics:', err);
  } finally {
    setLoading(false);
  }
}, [selectedNetwork, updateHistoricalData]);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [selectedNetwork, fetchMetrics]);

  const calculateCacheHitRatio = (hits: number, misses: number) => {
    const total = hits + misses;
    return total === 0 ? 0 : (hits / total) * 100;
  };

  const formatUptime = (ms: number) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${days}d ${hours}h ${minutes}m`;
  };

  const handleRetry = () => {
    fetchMetrics();
  };

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error fetching metrics</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <div className="mt-4">
            <RetryButton onRetry={handleRetry} isLoading={loading} />
          </div>
        </Alert>
      </div>
    );
  }


  if (!mounted) {
    return null; // or a loading spinner
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          {/* ... error content ... */}
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sui Bridge Dashboard</h1>
        <div className="flex items-center gap-4">
          <NetworkStatusIndicator
            status={networkStatus}
            networkName={selectedNetwork}
          />
          <NetworkSelector 
            selectedNetwork={selectedNetwork}
            onNetworkChange={setSelectedNetwork}
          />
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdated?.toLocaleTimeString()}
          </div>
          <ThemeToggle />
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading metrics...</span>
          </div>
        </div>
      )}

      {metrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                <Activity className="text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.status}</div>
                <p className="text-xs text-muted-foreground">
                  Version: {metrics.version}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <CheckCircle className="text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatUptime(metrics.uptime)}</div>
                <p className="text-xs text-muted-foreground">
                  Since {new Date(Date.now() - metrics.uptime).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gas Balance</CardTitle>
                <Wallet className="text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(metrics.client.gasCoinBalance / 1000000000).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">SUI</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cache Performance</CardTitle>
                <Database className="text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {calculateCacheHitRatio(
                    metrics.cache.ethActionVerifier.hits + 
                    metrics.cache.governanceVerifier.hits + 
                    metrics.cache.suiActionVerifier.hits,
                    metrics.cache.ethActionVerifier.misses + 
                    metrics.cache.governanceVerifier.misses + 
                    metrics.cache.suiActionVerifier.misses
                  ).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">Cache Hit Ratio</p>
              </CardContent>
            </Card>
          </div>

          {Object.values(metrics.errors).some(val => val > 0) && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Active Errors Detected</AlertTitle>
              <AlertDescription>
                <div className="mt-2">
                  {Object.entries(metrics.errors).map(([key, value]) => (
                    value > 0 && (
                      <div key={key} className="text-sm">
                        {key}: {value}
                      </div>
                    )
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ethereum Network Activity</CardTitle>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      {
                        name: 'Current',
                        blockNumber: metrics.eth.queries.blockNumber,
                        calls: metrics.eth.queries.call,
                        receipts: metrics.eth.queries.getTransactionReceipt
                      }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="blockNumber" stroke="#8884d8" name="Block Queries" />
                    <Line type="monotone" dataKey="calls" stroke="#82ca9d" name="Contract Calls" />
                    <Line type="monotone" dataKey="receipts" stroke="#ffc658" name="Receipt Queries" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sui Network Activity</CardTitle>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      {
                        name: 'Current',
                        received: metrics.sui.handleAddTokensOnSui.received,
                        ok: metrics.sui.handleAddTokensOnSui.ok,
                        inflight: metrics.sui.handleAddTokensOnSui.inflight
                      }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="received" stroke="#8884d8" name="Received" />
                    <Line type="monotone" dataKey="ok" stroke="#82ca9d" name="Successful" />
                    <Line type="monotone" dataKey="inflight" stroke="#ffc658" name="In Flight" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>


<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <HistoricalChart
    data={historicalData}
    title="Gas Balance History"
    dataKey="client.gasCoinBalance"
    valueFormatter={(value) => `${(value / 1000000000).toFixed(2)} SUI`}
  />
  <HistoricalChart
    data={historicalData}
    title="Cache Hit Ratio History"
    dataKey="cache.ethActionVerifier.hits"
    valueFormatter={(value) => `${value.toFixed(1)}%`}
  />
</div>

          <Card>
            <CardHeader>
              <CardTitle>Watcher Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold">Ethereum Watcher</h3>
                  <div className="mt-2 space-y-1">
                    <div>Actions: {metrics.client.ethWatcher.receivedActions}</div>
                    <div>Events: {metrics.client.ethWatcher.receivedEvents}</div>
                    <div>Unrecognized: {metrics.client.ethWatcher.unrecognizedEvents}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">Sui Watcher</h3>
                  <div className="mt-2 space-y-1">
                    <div>Actions: {metrics.client.suiWatcher.receivedActions}</div>
                    <div>Events: {metrics.client.suiWatcher.receivedEvents}</div>
                    <div>Unrecognized: {metrics.client.suiWatcher.unrecognizedEvents}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">Network Status</h3>
                  <div className="mt-2 space-y-1">
                    <div>Last ETH Block: {metrics.client.lastFinalizedEthBlock}</div>
                    <div>Client Enabled: {metrics.clientEnabled ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cache Performance Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold">ETH Action Verifier</h3>
                  <div className="mt-2">
                    <div>Hits: {metrics.cache.ethActionVerifier.hits}</div>
                    <div>Misses: {metrics.cache.ethActionVerifier.misses}</div>
                    <div>Ratio: {calculateCacheHitRatio(
                      metrics.cache.ethActionVerifier.hits,
                      metrics.cache.ethActionVerifier.misses
                    ).toFixed(1)}%</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">Governance Verifier</h3>
                  <div className="mt-2">
                    <div>Hits: {metrics.cache.governanceVerifier.hits}</div>
                    <div>Misses: {metrics.cache.governanceVerifier.misses}</div>
                    <div>Ratio: {calculateCacheHitRatio(
                      metrics.cache.governanceVerifier.hits,
                      metrics.cache.governanceVerifier.misses
                    ).toFixed(1)}%</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">SUI Action Verifier</h3>
                  <div className="mt-2">
                    <div>Hits: {metrics.cache.suiActionVerifier.hits}</div>
                    <div>Misses: {metrics.cache.suiActionVerifier.misses}</div>
                    <div>Ratio: {calculateCacheHitRatio(
                      metrics.cache.suiActionVerifier.hits,
                      metrics.cache.suiActionVerifier.misses
                    ).toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

        <Link
          href="https://www.synergynodes.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center"
        >by Synergy Nodes
        </Link>
    </div>
  );
};

export default BridgeDashboard;
