import { NextResponse } from 'next/server';

interface MetricsError {
  message: string;
  status?: number;
}

function isMetricsError(error: unknown): error is MetricsError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as MetricsError).message === 'string'
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (isMetricsError(error)) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const network = searchParams.get('network');

  // Throw an error if network is not provided or env variables are missing
  if (!network) {
    return NextResponse.json({ 
      error: 'Network parameter is required' 
    }, { status: 400 });
  }

  let metricsUrl: string;

  switch (network) {
    case 'MAINNET_BRIDGE':
      if (!process.env.NEXT_PUBLIC_MAINNET_BRIDGE_URL) {
        return NextResponse.json({ 
          error: 'NEXT_PUBLIC_MAINNET_BRIDGE_URL is not defined' 
        }, { status: 500 });
      }
      metricsUrl = process.env.NEXT_PUBLIC_MAINNET_BRIDGE_URL;
      break;
    
    case 'TESTNET_BRIDGE':
      if (!process.env.NEXT_PUBLIC_TESTNET_BRIDGE_URL) {
        return NextResponse.json({ 
          error: 'NEXT_PUBLIC_TESTNET_BRIDGE_URL is not defined' 
        }, { status: 500 });
      }
      metricsUrl = process.env.NEXT_PUBLIC_TESTNET_BRIDGE_URL;
      break;
    
    default:
      return NextResponse.json({ 
        error: 'Invalid network parameter' 
      }, { status: 400 });
  }

  try {
    if (!metricsUrl) {
      throw new Error('Metrics URL is not configured');
    }

    const response = await fetch(metricsUrl, {
      headers: {
        'Accept': 'text/plain',
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.text();
    
    return new NextResponse(data, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    
    return new NextResponse(
      JSON.stringify({ 
        error: 'Error fetching metrics', 
        details: getErrorMessage(error) 
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
