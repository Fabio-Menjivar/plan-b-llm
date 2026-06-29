import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Circle, Copy, Loader2, QrCode, Wallet, X, Zap } from "lucide-react";
import QRCode from "react-qr-code";
import type { JsonRpcSigner } from "ethers";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  BoltzServiceError,
  type BoltzSwapPhase,
  connectMetaMask,
  createReverseSwap,
  executeClaim,
  generateSwapPreimage,
  mapBoltzStatusToPhase,
  subscribeToSwapUpdates,
  truncateAddress,
  type ReverseSwapCreated,
  type SwapPreimage,
} from "@/lib/boltzService";

export type SwapStatus = BoltzSwapPhase;

interface FundWithLightningModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDepositComplete: (amount: number) => void;
}

const SWAP_STEPS: { key: SwapStatus; label: string }[] = [
  { key: "pending_payment", label: "Pending Payment" },
  { key: "locked_on_arbitrum", label: "Locked on Arbitrum" },
  { key: "claiming", label: "Claiming" },
  { key: "claimed", label: "Claimed" },
];

function stepIndex(status: SwapStatus) {
  return SWAP_STEPS.findIndex((s) => s.key === status);
}

function getErrorMessage(err: unknown): string {
  if (err instanceof BoltzServiceError) return err.message;
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

export function FundWithLightningModal({
  open,
  onOpenChange,
  onDepositComplete,
}: FundWithLightningModalProps) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [amountSats, setAmountSats] = useState("");
  const [invoiceString, setInvoiceString] = useState<string | null>(null);
  const [swapStatus, setSwapStatus] = useState<SwapStatus>("pending_payment");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preimageRef = useRef<SwapPreimage | null>(null);
  const swapRef = useRef<ReverseSwapCreated | null>(null);
  const wsCleanupRef = useRef<(() => void) | null>(null);
  const claimStartedRef = useRef(false);
  const depositedRef = useRef(false);

  const resetSession = useCallback(() => {
    wsCleanupRef.current?.();
    wsCleanupRef.current = null;
    preimageRef.current = null;
    swapRef.current = null;
    claimStartedRef.current = false;
    depositedRef.current = false;
    setWalletAddress(null);
    setSigner(null);
    setAmountSats("");
    setInvoiceString(null);
    setSwapStatus("pending_payment");
    setIsConnecting(false);
    setIsGenerating(false);
    setCopied(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (!open) resetSession();
  }, [open, resetSession]);

  useEffect(() => {
    return () => {
      wsCleanupRef.current?.();
    };
  }, []);

  async function handleConnectWallet() {
    setError(null);
    setIsConnecting(true);
    try {
      const { address, signer: connectedSigner } = await connectMetaMask();
      setWalletAddress(address);
      setSigner(connectedSigner);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsConnecting(false);
    }
  }

  const handleClaim = useCallback(
    async (swap: ReverseSwapCreated, preimage: SwapPreimage) => {
      if (!signer || claimStartedRef.current) return;
      claimStartedRef.current = true;
      setSwapStatus("claiming");

      try {
        const tx = await executeClaim({ signer, swap, preimage });
        await tx.wait();
        setSwapStatus("claimed");
        if (!depositedRef.current) {
          depositedRef.current = true;
          onDepositComplete(Number(amountSats) || 0);
          setTimeout(() => onOpenChange(false), 1200);
        }
      } catch (err) {
        claimStartedRef.current = false;
        setError(getErrorMessage(err));
        setSwapStatus("locked_on_arbitrum");
      }
    },
    [signer, amountSats, onDepositComplete, onOpenChange],
  );

  const startSwapWatcher = useCallback(
    (swap: ReverseSwapCreated, preimage: SwapPreimage) => {
      wsCleanupRef.current?.();
      wsCleanupRef.current = subscribeToSwapUpdates(swap.id, {
        onStatus: (status) => {
          const phase = mapBoltzStatusToPhase(status);
          if (phase) setSwapStatus(phase);

          if (
            (status === "transaction.confirmed" ||
              status === "transaction.server.confirmed") &&
            !claimStartedRef.current
          ) {
            void handleClaim(swap, preimage);
          }

          if (status === "invoice.settled" && !depositedRef.current) {
            depositedRef.current = true;
            setSwapStatus("claimed");
            onDepositComplete(Number(amountSats) || 0);
            setTimeout(() => onOpenChange(false), 1200);
          }
        },
        onError: (err) => setError(err.message),
      });
    },
    [handleClaim, amountSats, onDepositComplete, onOpenChange],
  );

  async function handleGenerateInvoice() {
    if (!walletAddress || !amountSats || Number(amountSats) <= 0) return;

    setError(null);
    setIsGenerating(true);
    setInvoiceString(null);
    setSwapStatus("pending_payment");
    claimStartedRef.current = false;
    depositedRef.current = false;

    try {
      const preimage = await generateSwapPreimage();
      preimageRef.current = preimage;

      const swap = await createReverseSwap({
        invoiceAmount: Number(amountSats),
        preimageHashHex: preimage.preimageHashHex,
        claimAddress: walletAddress,
      });

      swapRef.current = swap;
      setInvoiceString(swap.invoice);
      setSwapStatus("pending_payment");
      startSwapWatcher(swap, preimage);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopyInvoice() {
    if (!invoiceString) return;
    await navigator.clipboard.writeText(invoiceString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const currentStep = stepIndex(swapStatus);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="fund-lightning-title"
            initial={{ opacity: 0, y: 64 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 64 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-x-4 bottom-4 z-50 mx-auto max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-[#27272A] shadow-2xl sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/60 bg-[#27272A]/95 px-5 py-4 backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-md bg-bitcoin/15 text-bitcoin">
                  <Zap className="h-4 w-4 fill-bitcoin" />
                </div>
                <div>
                  <h2 id="fund-lightning-title" className="font-mono text-sm font-semibold">
                    Fund with Lightning
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    BTC Lightning → USDT on Arbitrum via Boltz
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-[#121212] hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              {error && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-[11px] text-destructive">
                  {error}
                </div>
              )}

              <div className="rounded-lg border border-border/60 bg-[#121212] p-4">
                {walletAddress ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-9 w-9 place-items-center rounded-md bg-bitcoin/10 text-bitcoin">
                        <Wallet className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          Connected · Arbitrum
                        </p>
                        <p className="font-mono text-sm">{truncateAddress(walletAddress)}</p>
                      </div>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_8px] shadow-success/60" />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleConnectWallet}
                    disabled={isConnecting}
                    className="flex w-full items-center justify-center gap-2.5 rounded-md border border-bitcoin/30 bg-bitcoin/10 px-4 py-3 font-mono text-sm font-semibold text-bitcoin transition hover:border-bitcoin/50 hover:bg-bitcoin/15 disabled:opacity-50"
                  >
                    {isConnecting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wallet className="h-4 w-4" />
                    )}
                    Connect MetaMask
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="deposit-sats"
                  className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
                >
                  Deposit amount
                </Label>
                <div className="relative">
                  <Input
                    id="deposit-sats"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    placeholder="10,000"
                    value={amountSats}
                    onChange={(e) => setAmountSats(e.target.value)}
                    disabled={!!invoiceString}
                    className="h-11 border-border/60 bg-[#121212] pr-14 font-mono text-base tabular-nums focus-visible:ring-bitcoin/40"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">
                    sats
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateInvoice}
                disabled={
                  !walletAddress ||
                  !amountSats ||
                  Number(amountSats) <= 0 ||
                  isGenerating ||
                  !!invoiceString
                }
                className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#F7931A] font-mono text-sm font-semibold text-[#121212] shadow-glow transition hover:bg-[#F7931A]/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Generate Lightning Invoice
                  </>
                )}
              </button>

              <AnimatePresence>
                {invoiceString && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="flex flex-col items-center gap-3 rounded-lg border border-border/60 bg-[#121212] p-5">
                      <div className="rounded-lg border border-dashed border-border bg-white p-3">
                        <QRCode value={invoiceString} size={144} level="M" />
                      </div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        Scan to pay · Boltz reverse swap
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                          Lightning invoice
                        </Label>
                        <button
                          type="button"
                          onClick={handleCopyInvoice}
                          className="flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[10px] text-[#F7931A] transition hover:bg-[#F7931A]/10"
                        >
                          {copied ? (
                            <>
                              <Check className="h-3 w-3" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <div className="break-all rounded-md border border-border/60 bg-[#121212] p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
                        {invoiceString}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {invoiceString && (
                <div className="rounded-lg border border-border/40 bg-[#121212]/60 px-3 py-4 sm:px-4">
                  <div className="flex items-start justify-between gap-1">
                    {SWAP_STEPS.map((step, i) => {
                      const done = i < currentStep;
                      const active = i === currentStep;

                      return (
                        <div key={step.key} className="flex min-w-0 flex-1 items-start">
                          <div className="flex min-w-0 flex-col items-center gap-1.5">
                            <span
                              className={cn(
                                "grid h-6 w-6 shrink-0 place-items-center rounded-full border transition",
                                done && "border-bitcoin/50 bg-bitcoin/20 text-bitcoin",
                                active &&
                                  "border-bitcoin bg-bitcoin/15 text-bitcoin shadow-[0_0_10px] shadow-bitcoin/30",
                                !done && !active && "border-border text-muted-foreground/40",
                              )}
                            >
                              {done ? (
                                <Check className="h-3 w-3" />
                              ) : active && swapStatus === "claiming" ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Circle
                                  className={cn("h-2 w-2", active && "fill-bitcoin text-bitcoin")}
                                />
                              )}
                            </span>
                            <span
                              className={cn(
                                "max-w-[64px] text-center font-mono text-[9px] leading-tight sm:max-w-[72px] sm:text-[10px]",
                                active
                                  ? "text-bitcoin"
                                  : done
                                    ? "text-muted-foreground"
                                    : "text-muted-foreground/50",
                              )}
                            >
                              {step.label}
                            </span>
                          </div>
                          {i < SWAP_STEPS.length - 1 && (
                            <div
                              className={cn(
                                "mx-0.5 mb-5 mt-3 h-px flex-1 sm:mx-1",
                                i < currentStep ? "bg-bitcoin/40" : "bg-border/60",
                              )}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
