import ERC20SwapArtifact from "boltz-core/out/ERC20Swap.sol/ERC20Swap.json";
import RouterArtifact from "boltz-core/out/Router.sol/Router.json";
import { Contract, BrowserProvider, JsonRpcSigner, type TransactionResponse } from "ethers";

import {
  ARBITRUM_CHAIN_ID,
  ARBITRUM_CHAIN_SLUG,
  BOLTZ_API_URL,
  BOLTZ_WS_URL,
  REVERSE_SWAP_FROM,
  REVERSE_SWAP_TO,
} from "./boltzConstants";

export type BoltzSwapPhase =
  | "pending_payment"
  | "locked_on_arbitrum"
  | "claiming"
  | "claimed";

export interface SwapPreimage {
  preimage: Uint8Array;
  preimageHex: string;
  preimageHashHex: string;
}

export interface ReverseSwapCreated {
  id: string;
  invoice: string;
  onchainAmount?: string | number;
  refundAddress?: string;
  timeoutBlockHeight?: number;
  tokenAddress?: string;
  routerAddress?: string;
  claimSignature?: { v: number; r: string; s: string };
  claimTransaction?: string;
  raw: Record<string, unknown>;
}

export interface BoltzChainContracts {
  network: { chainId: number; name: string };
  swapContracts: { EtherSwap: string; ERC20Swap: string };
  tokens?: Record<string, string>;
  router?: string;
}

export interface SwapUpdateMessage {
  event: string;
  args: [{ status: string; transaction?: { id?: string; hex?: string } }];
}

export class BoltzServiceError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "BoltzServiceError";
  }
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function generateSwapPreimage(): Promise<SwapPreimage> {
  const preimage = crypto.getRandomValues(new Uint8Array(32));
  const digest = await crypto.subtle.digest("SHA-256", preimage);
  return {
    preimage,
    preimageHex: bytesToHex(preimage),
    preimageHashHex: bytesToHex(new Uint8Array(digest)),
  };
}

export function mapBoltzStatusToPhase(status: string): BoltzSwapPhase | null {
  switch (status) {
    case "swap.created":
    case "invoice.pending":
      return "pending_payment";
    case "transaction.mempool":
    case "transaction.confirmed":
    case "transaction.server.mempool":
    case "transaction.server.confirmed":
      return "locked_on_arbitrum";
    case "invoice.settled":
      return "claimed";
    default:
      return null;
  }
}

async function boltzFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BOLTZ_API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  const body = (await res.json().catch(() => ({}))) as T & { error?: string; message?: string };

  if (!res.ok) {
    throw new BoltzServiceError(
      body.error ?? body.message ?? `Boltz API error (${res.status})`,
      String(res.status),
    );
  }

  return body;
}

export async function createReverseSwap(params: {
  invoiceAmount: number;
  preimageHashHex: string;
  claimAddress: string;
}): Promise<ReverseSwapCreated> {
  const data = await boltzFetch<Record<string, unknown>>("/v2/swap/reverse", {
    method: "POST",
    body: JSON.stringify({
      from: REVERSE_SWAP_FROM,
      to: REVERSE_SWAP_TO,
      invoiceAmount: params.invoiceAmount,
      preimageHash: params.preimageHashHex,
      claimAddress: params.claimAddress,
    }),
  });

  const sig = data.claimSignature as Record<string, unknown> | undefined;

  return {
    id: String(data.id),
    invoice: String(data.invoice ?? data.bolt11 ?? ""),
    onchainAmount: data.onchainAmount as string | number | undefined,
    refundAddress: data.refundAddress as string | undefined,
    timeoutBlockHeight: data.timeoutBlockHeight as number | undefined,
    tokenAddress: (data.tokenAddress ?? data.token) as string | undefined,
    routerAddress: (data.routerAddress ?? data.router) as string | undefined,
    claimSignature: sig
      ? { v: Number(sig.v), r: String(sig.r), s: String(sig.s) }
      : undefined,
    claimTransaction: data.claimTransaction as string | undefined,
    raw: data,
  };
}

export async function fetchChainContracts(
  chain: string = ARBITRUM_CHAIN_SLUG,
): Promise<BoltzChainContracts> {
  return boltzFetch<BoltzChainContracts>(`/v2/chain/${chain}/contracts`);
}

export function subscribeToSwapUpdates(
  swapId: string,
  handlers: {
    onStatus: (status: string, msg: SwapUpdateMessage) => void;
    onError?: (err: Error) => void;
    onClose?: () => void;
  },
): () => void {
  const ws = new WebSocket(BOLTZ_WS_URL);

  ws.onopen = () => {
    ws.send(
      JSON.stringify({
        op: "subscribe",
        channel: "swap.update",
        args: [swapId],
      }),
    );
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(String(event.data)) as SwapUpdateMessage;
      if (msg.event === "update" && msg.args?.[0]?.status) {
        handlers.onStatus(msg.args[0].status, msg);
      }
    } catch (err) {
      handlers.onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  };

  ws.onerror = () => {
    handlers.onError?.(new BoltzServiceError("Boltz WebSocket connection error"));
  };

  ws.onclose = () => {
    handlers.onClose?.();
  };

  return () => {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
  };
}

export async function claimErc20Swap(params: {
  signer: JsonRpcSigner;
  contracts: BoltzChainContracts;
  swap: ReverseSwapCreated;
  preimage: SwapPreimage;
}): Promise<TransactionResponse> {
  const { signer, contracts, swap, preimage } = params;

  const tokenAddress =
    swap.tokenAddress ?? contracts.tokens?.TBTC ?? contracts.tokens?.tBTC;

  if (!tokenAddress) {
    throw new BoltzServiceError("Token address missing from swap / chain contracts");
  }
  if (!swap.refundAddress || swap.timeoutBlockHeight == null || swap.onchainAmount == null) {
    throw new BoltzServiceError("Incomplete swap data for ERC20 claim");
  }

  const erc20Swap = new Contract(
    contracts.swapContracts.ERC20Swap,
    ERC20SwapArtifact.abi,
    signer,
  );

  const amount = BigInt(swap.onchainAmount);

  if (swap.claimSignature) {
    const { v, r, s } = swap.claimSignature;
    return erc20Swap["claim(bytes32,uint256,address,address,uint256,uint8,bytes32,bytes32)"](
      `0x${preimage.preimageHex}`,
      amount,
      tokenAddress,
      swap.refundAddress,
      swap.timeoutBlockHeight,
      v,
      r,
      s,
    ) as Promise<TransactionResponse>;
  }

  return erc20Swap["claim(bytes32,uint256,address,address,uint256)"](
    `0x${preimage.preimageHex}`,
    amount,
    tokenAddress,
    swap.refundAddress,
    swap.timeoutBlockHeight,
  ) as Promise<TransactionResponse>;
}

export async function claimViaRouter(params: {
  signer: JsonRpcSigner;
  routerAddress: string;
  swap: ReverseSwapCreated;
  preimage: SwapPreimage;
  calls?: { target: string; data: string; value?: string }[];
  minAmountOut?: bigint;
  destination?: string;
}): Promise<TransactionResponse> {
  const { signer, routerAddress, swap, preimage, calls = [], minAmountOut = 0n } = params;
  const destination = params.destination ?? (await signer.getAddress());

  if (!swap.refundAddress || swap.timeoutBlockHeight == null || swap.onchainAmount == null) {
    throw new BoltzServiceError("Incomplete swap data for Router claim");
  }

  const tokenAddress = swap.tokenAddress;
  if (!tokenAddress) {
    throw new BoltzServiceError("Token address required for Router claim");
  }

  const router = new Contract(routerAddress, RouterArtifact.abi, signer);

  const claim = {
    preimage: `0x${preimage.preimageHex}`,
    amount: BigInt(swap.onchainAmount),
    tokenAddress,
    refundAddress: swap.refundAddress,
    timelock: swap.timeoutBlockHeight,
    v: swap.claimSignature?.v ?? 0,
    r: swap.claimSignature?.r ?? `0x${"0".repeat(64)}`,
    s: swap.claimSignature?.s ?? `0x${"0".repeat(64)}`,
  };

  const formattedCalls = calls.map((c) => ({
    target: c.target,
    data: c.data,
    value: BigInt(c.value ?? 0),
  }));

  return router.claimERC20Execute(claim, formattedCalls, destination, minAmountOut) as Promise<
    TransactionResponse
  >;
}

export async function executeClaim(params: {
  signer: JsonRpcSigner;
  swap: ReverseSwapCreated;
  preimage: SwapPreimage;
}): Promise<TransactionResponse> {
  const contracts = await fetchChainContracts();

  if (contracts.network.chainId !== ARBITRUM_CHAIN_ID) {
    throw new BoltzServiceError(
      `Expected Arbitrum (${ARBITRUM_CHAIN_ID}), got chain ${contracts.network.chainId}`,
    );
  }

  if (params.swap.claimTransaction) {
    return params.signer.sendTransaction(params.swap.claimTransaction);
  }

  const routerAddress =
    params.swap.routerAddress ??
    contracts.router ??
    (params.swap.raw.routerAddress as string | undefined);

  const dexCalls = params.swap.raw.dexCalls as
    | { target: string; data: string; value?: string }[]
    | undefined;

  if (routerAddress && dexCalls?.length) {
    return claimViaRouter({
      signer: params.signer,
      routerAddress,
      swap: params.swap,
      preimage: params.preimage,
      calls: dexCalls,
      minAmountOut: params.swap.raw.minAmountOut
        ? BigInt(String(params.swap.raw.minAmountOut))
        : 0n,
    });
  }

  return claimErc20Swap({
    signer: params.signer,
    contracts,
    swap: params.swap,
    preimage: params.preimage,
  });
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

export async function connectMetaMask(): Promise<{ address: string; signer: JsonRpcSigner }> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new BoltzServiceError("MetaMask is not installed");
  }

  const provider = new BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);

  const network = await provider.getNetwork();
  if (Number(network.chainId) !== ARBITRUM_CHAIN_ID) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${ARBITRUM_CHAIN_ID.toString(16)}` }],
      });
    } catch (switchError: unknown) {
      const err = switchError as { code?: number };
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${ARBITRUM_CHAIN_ID.toString(16)}`,
              chainName: "Arbitrum One",
              nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://arb1.arbitrum.io/rpc"],
              blockExplorerUrls: ["https://arbiscan.io"],
            },
          ],
        });
      } else {
        throw new BoltzServiceError("Please switch MetaMask to Arbitrum One");
      }
    }
  }

  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  return { address, signer };
}

export function truncateAddress(address: string) {
  return `${address.slice(0, 5)}...${address.slice(-4)}`;
}
