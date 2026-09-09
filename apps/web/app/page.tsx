"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Cpu,
  FileCode,
  Globe,
  Layers,
  Lock,
  Radio,
  ShieldCheck,
  ShoppingCart,
  Wallet,
  X,
} from "lucide-react";

type Language = "ES" | "EN";
type TabKey = "inscribe" | "marketplace" | "gating";
type InscribeStep = "form" | "commit" | "reveal" | "done";
type WalletName = "Xverse" | "Leather";

type FeesState = { low: number; med: number; high: number };

type WalletState = {
  connected: boolean;
  payment: string | null;
  ordinals: string | null;
  name: WalletName | null;
  runeBalance: number | null;
};

type CommitResponse = {
  commit_txid: string;
  taproot_address: string;
  commit_script_hint: string;
  metadata_jsonld: unknown;
};

type PsbtValidationResponse = {
  is_valid: boolean;
  price_sats: number;
  treasury_fee_sats: number;
  sighash_type: string;
  treasury_address: string;
};

type NgfValidationResponse = {
  is_valid: boolean;
  source_of_truth: string;
  declared: {
    rune_name: string;
    rune_number: number;
    rune_id: string;
    etching_txid: string;
    etching_block: number;
    declared_timestamp: string;
  };
  mempool: {
    source: string;
    tx_confirmed: boolean;
    block_height_matches: boolean;
    block_hash?: string | null;
    block_height?: number | null;
    block_timestamp?: number | null;
  };
  rune_index: {
    source: string;
    provider_available: boolean;
    rune_name_matches: boolean;
    rune_number_matches: boolean;
    rune_id_matches: boolean;
    etching_txid_matches: boolean;
  };
  address_balance?: {
    source: string;
    address: string;
    ngf_balance?: string | null;
    has_required_balance: boolean;
  } | null;
  warnings: string[];
};

type Translation = (typeof translations)[Language];

type LanguageContextValue = {
  lang: Language;
  toggleLang: () => void;
  t: Translation;
};

const translations = {
  ES: {
    brandName: "NESGESFinance",
    platformName: "NESGESFinance.app",
    runeName: "NGF•BTC•AM",
    bitcoinL1: "Bitcoin L1",
    mempoolLive: "NESGESMemPool En Vivo",
    connectWallet: "Conectar Billetera",
    disconnectWallet: "Desconectar",
    walletConnected: "Conectado",
    navInscribe: "Inscripción Taproot",
    navMarketplace: "Marketplace PSBT",
    navTokenGating: "Validación On-Chain NGF",
    heroTitle: "Ecosistema Financiero Regulado en Bitcoin L1",
    heroSubtitle:
      "Integración real con API Rust, streaming WebSocket de Mempool, validación on-chain de NGF•BTC•AM y flujos Taproot/PSBT sin custodia.",
    feeNotice: "Comisión de Plataforma: 2.0% (Integrada en PSBT)",
    blockLabel: "Bloque Bitcoin",
    lowFee: "Baja",
    medFee: "Media",
    highFee: "Prioridad",
    poweredBy: "Arquitectura objetivo",
    walletSplitTitle: "Separación de direcciones",
    walletSplitBody:
      "Pago en bc1q... y Taproot/Ordinales en bc1p..., con datos reales consumidos desde el backend Rust.",
    securityTitle: "Seguridad operacional",
    securityBody:
      "La Tesorería de NESGESFinance recibe 2% por salida dedicada y la validación PSBT se ejecuta del lado del servidor.",
    complianceTitle: "Control documental",
    complianceBody:
      "El backend genera Commit/Reveal con metadatos JSON-LD y valida evidencia on-chain frente a Bitcoin L1.",
    inscribeTitle: "Flujo Commit/Reveal",
    inscribeBody:
      "Envía el formulario al API Rust para preparar una inscripción Taproot con metadatos JSON-LD institucionales.",
    marketplaceTitle: "Validación PSBT",
    marketplaceBody:
      "Envía una PSBT al backend Rust para verificar SIGHASH_SINGLE | SIGHASH_ANYONECANPAY y la comisión del 2%.",
    gatingTitle: "Validación on-chain de NGF•BTC•AM",
    gatingBody:
      "Cruza Bitcoin L1 y un indexador compatible con ord para verificar número, Rune ID, TXID de etching y saldo por dirección.",
    stepForm: "Formulario",
    stepCommit: "Commit",
    stepReveal: "Reveal",
    stepDone: "Finalizado",
    projectName: "Nombre del proyecto",
    jurisdiction: "Jurisdicción",
    contractHash: "Hash SHA-256 del expediente",
    createCommit: "Crear Commit",
    continueReveal: "Preparar Reveal",
    completeInscribe: "Completar inscripción",
    metadataPreview: "Respuesta del API / JSON-LD",
    commitReady: "Commit creado por el API",
    revealReady: "Reveal listo para difusión",
    inscriptionComplete: "Inscripción Taproot preparada",
    commitTxid: "Commit TXID",
    taprootAddress: "Dirección Taproot",
    walletModalTitle: "Selecciona una billetera compatible",
    walletModalBody:
      "Usa direcciones de ejemplo para conectar Xverse o Leather y consultar el saldo NGF•BTC•AM desde el backend.",
    paymentAddress: "Dirección de Pago",
    ordinalsAddress: "Dirección Taproot",
    runeBalance: "Saldo del Rune",
    connectAction: "Conectar",
    listingTitle: "Validación de intercambio atómico",
    listingBody:
      "Pega una PSBT real para validar la política de firma y la comisión a Tesorería en el API Rust.",
    listingPrice: "Precio",
    treasuryFee: "Comisión Tesorería",
    sighashMode: "Modo de firma",
    signPsbt: "Validar PSBT",
    gateRule: "Regla de acceso",
    gateRuleBody:
      "El acceso premium requiere saldo mayor o igual a 1 unidad del Rune NGF•BTC•AM verificado on-chain.",
    gateGranted: "Acceso habilitado",
    gateDenied: "Saldo insuficiente o pendiente de verificación on-chain.",
    gateAccessBody:
      "Se habilitan Deal Room, panel de reservas, flujo de inscripción avanzada y seguimiento institucional.",
    liveNode: "Nodo sincronizado",
    walletName: "Proveedor",
    mempoolSocket: "Socket Mempool",
    mempoolConnected: "Conectado",
    mempoolDisconnected: "Reconectando",
    apiStatus: "Estado del API",
    apiIdle: "Listo",
    apiLoading: "Procesando...",
    apiError: "Error del API",
    validateNgf: "Validar NGF•BTC•AM",
    validationStatus: "Estado de validación",
    warnings: "Advertencias",
    runeProvider: "Indexador Rune",
    etchingTx: "TX de etching",
    blockMatch: "Bloque coincide",
    runeMatch: "Rune coincide",
    numberMatch: "Número coincide",
    idMatch: "Rune ID coincide",
    txidMatch: "TXID coincide",
    psbtHex: "PSBT Hex",
    validationResult: "Resultado",
    connectToValidate: "Conecta una dirección Taproot para consultar saldo y access gating.",
    onChainVerified: "Verificado on-chain",
    onChainPending: "Validación parcial o pendiente",
  },
  EN: {
    brandName: "NESGESFinance",
    platformName: "NESGESFinance.app",
    runeName: "NGF•BTC•AM",
    bitcoinL1: "Bitcoin L1",
    mempoolLive: "NESGESMemPool Live",
    connectWallet: "Connect Wallet",
    disconnectWallet: "Disconnect",
    walletConnected: "Connected",
    navInscribe: "Taproot Inscription",
    navMarketplace: "PSBT Marketplace",
    navTokenGating: "NGF On-Chain Validation",
    heroTitle: "Regulated Financial Ecosystem on Bitcoin L1",
    heroSubtitle:
      "Real Rust API integration, live Mempool WebSocket streaming, on-chain NGF•BTC•AM validation, and non-custodial Taproot/PSBT flows.",
    feeNotice: "Platform Fee: 2.0% (PSBT Integrated)",
    blockLabel: "Bitcoin Block",
    lowFee: "Low",
    medFee: "Medium",
    highFee: "Priority",
    poweredBy: "Target architecture",
    walletSplitTitle: "Address separation",
    walletSplitBody:
      "Payments stay on bc1q... while Taproot/Ordinals use bc1p..., with real data loaded through the Rust backend.",
    securityTitle: "Operational security",
    securityBody:
      "NESGESFinance Treasury receives a dedicated 2% output and PSBT validation runs server-side.",
    complianceTitle: "Document control",
    complianceBody:
      "The backend generates Commit/Reveal JSON-LD metadata and validates on-chain evidence against Bitcoin L1.",
    inscribeTitle: "Commit/Reveal flow",
    inscribeBody:
      "Submit the form to the Rust API to prepare a Taproot inscription with institutional JSON-LD metadata.",
    marketplaceTitle: "PSBT validation",
    marketplaceBody:
      "Send a PSBT to the Rust backend to verify SIGHASH_SINGLE | SIGHASH_ANYONECANPAY and the 2% treasury fee.",
    gatingTitle: "NGF•BTC•AM on-chain validation",
    gatingBody:
      "Cross-checks Bitcoin L1 and an ord-compatible indexer to verify the Rune number, Rune ID, etching TXID, and address balance.",
    stepForm: "Form",
    stepCommit: "Commit",
    stepReveal: "Reveal",
    stepDone: "Complete",
    projectName: "Project name",
    jurisdiction: "Jurisdiction",
    contractHash: "Record SHA-256 hash",
    createCommit: "Create Commit",
    continueReveal: "Prepare Reveal",
    completeInscribe: "Complete inscription",
    metadataPreview: "API response / JSON-LD",
    commitReady: "Commit created by API",
    revealReady: "Reveal ready for broadcast",
    inscriptionComplete: "Taproot inscription prepared",
    commitTxid: "Commit TXID",
    taprootAddress: "Taproot address",
    walletModalTitle: "Select a compatible wallet",
    walletModalBody:
      "Use example addresses to connect Xverse or Leather and query NGF•BTC•AM balances through the backend.",
    paymentAddress: "Payment Address",
    ordinalsAddress: "Taproot Address",
    runeBalance: "Rune Balance",
    connectAction: "Connect",
    listingTitle: "Atomic swap validation",
    listingBody:
      "Paste a real PSBT to validate the signing policy and treasury fee in the Rust API.",
    listingPrice: "Price",
    treasuryFee: "Treasury Fee",
    sighashMode: "Signing mode",
    signPsbt: "Validate PSBT",
    gateRule: "Access rule",
    gateRuleBody:
      "Premium access requires a balance greater than or equal to 1 unit of the NGF•BTC•AM Rune verified on-chain.",
    gateGranted: "Access granted",
    gateDenied: "Insufficient balance or pending on-chain verification.",
    gateAccessBody:
      "Deal Room, reservation dashboard, advanced inscription flow, and institutional tracking are now enabled.",
    liveNode: "Synced node",
    walletName: "Provider",
    mempoolSocket: "Mempool socket",
    mempoolConnected: "Connected",
    mempoolDisconnected: "Reconnecting",
    apiStatus: "API status",
    apiIdle: "Ready",
    apiLoading: "Processing...",
    apiError: "API error",
    validateNgf: "Validate NGF•BTC•AM",
    validationStatus: "Validation status",
    warnings: "Warnings",
    runeProvider: "Rune indexer",
    etchingTx: "Etching tx",
    blockMatch: "Block matches",
    runeMatch: "Rune matches",
    numberMatch: "Number matches",
    idMatch: "Rune ID matches",
    txidMatch: "TXID matches",
    psbtHex: "PSBT Hex",
    validationResult: "Result",
    connectToValidate: "Connect a Taproot address to query balance and access gating.",
    onChainVerified: "On-chain verified",
    onChainPending: "Partial or pending validation",
  },
} as const;

const LanguageContext = createContext<LanguageContextValue>({
  lang: "ES",
  toggleLang: () => undefined,
  t: translations.ES,
});

const walletProfiles: Record<WalletName, Omit<WalletState, "connected" | "name" | "runeBalance">> = {
  Xverse: {
    payment: "bc1q4w2f4x4m9k0s2zvljk4h9r0h4k4n2fdh2e2p3u",
    ordinals: "bc1p4hf8x6r8lw0t7fdy7w5v4p59x4v2kxq4w7m3m3lr0u",
  },
  Leather: {
    payment: "bc1q8yjtw0t39znm36mu6r4x9z3r5x2m4x9hm0gk9g",
    ordinals: "bc1pjx5eu0h7d5k9prpq3q6sjx5v7m6wjzyd9x0sju7fxv",
  },
};

const treasuryAddress =
  "bc1pl8qtw4g9afscmctydmv56mak4m9leqxyqlvqgxaltj2d5wt9wteqqgpdug";
const listingPriceSats = 1_450_000;
const fallbackFees = { low: 12, med: 18, high: 25 };
const fallbackBlockHeight = 860240;

function useLanguage() {
  return useContext(LanguageContext);
}

function formatSats(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function shortenAddress(value: string | null | undefined) {
  if (!value) return "—";
  return `${value.slice(0, 10)}...${value.slice(-8)}`;
}

function apiBaseUrl() {
  return process.env.NEXT_PUBLIC_NESGES_API_BASE_URL ?? "http://localhost:8080";
}

function websocketBaseUrl() {
  return apiBaseUrl().replace(/^http/, "ws");
}

function StatusCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/15 text-orange-200">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
    </div>
  );
}

function TabButton({
  tab,
  label,
  icon,
  active,
  onClick,
}: {
  tab: TabKey;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: (tab: TabKey) => void;
}) {
  return (
    <button
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? "border-orange-400 bg-orange-500/20 text-white"
          : "border-white/10 bg-white/5 text-slate-300 hover:border-orange-300/50 hover:text-white"
      }`}
      onClick={() => onClick(tab)}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

function FeesTicker({
  fees,
  blockHeight,
  wsConnected,
}: {
  fees: FeesState;
  blockHeight: number;
  wsConnected: boolean;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-full border border-orange-400/20 bg-black/20 px-4 py-2 text-xs text-slate-200">
      <span className="flex items-center gap-2 font-medium text-orange-200">
        <Radio className="h-4 w-4" />
        {t.mempoolLive}
      </span>
      <span>{t.blockLabel}: {blockHeight}</span>
      <span>{t.lowFee}: {fees.low} sat/vB</span>
      <span>{t.medFee}: {fees.med} sat/vB</span>
      <span>{t.highFee}: {fees.high} sat/vB</span>
      <span className="rounded-full border border-white/10 px-3 py-1">
        {t.mempoolSocket}: {wsConnected ? t.mempoolConnected : t.mempoolDisconnected}
      </span>
    </div>
  );
}

function ResultPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${
        ok
          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
          : "border-amber-400/30 bg-amber-500/10 text-amber-100"
      }`}
    >
      {ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}

export default function UnifiedApp() {
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window === "undefined") {
      return "ES";
    }

    return localStorage.getItem("nesges_lang") === "EN" ? "EN" : "ES";
  });
  const [activeTab, setActiveTab] = useState<TabKey>("inscribe");
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    payment: null,
    ordinals: null,
    name: null,
    runeBalance: null,
  });
  const [fees, setFees] = useState<FeesState>(fallbackFees);
  const [blockHeight, setBlockHeight] = useState(fallbackBlockHeight);
  const [wsConnected, setWsConnected] = useState(false);
  const [inscribeStep, setInscribeStep] = useState<InscribeStep>("form");
  const [form, setForm] = useState({
    projectName: "RedenHouses Global",
    jurisdiction: "LatAm Corporate Framework",
    contractHash:
      "4c0b2416f3dd122025f89a62d7ff265fcee8d00e0fabd874669617cf85437c82",
  });
  const [commitLoading, setCommitLoading] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);
  const [commitResult, setCommitResult] = useState<CommitResponse | null>(null);
  const [psbtHex, setPsbtHex] = useState("");
  const [psbtLoading, setPsbtLoading] = useState(false);
  const [psbtError, setPsbtError] = useState<string | null>(null);
  const [psbtResult, setPsbtResult] = useState<PsbtValidationResponse | null>(null);
  const [ngfLoading, setNgfLoading] = useState(false);
  const [ngfError, setNgfError] = useState<string | null>(null);
  const [ngfValidation, setNgfValidation] = useState<NgfValidationResponse | null>(null);

  const t = translations[lang];
  const treasuryFee = Math.floor(listingPriceSats * 0.02);
  const hasGateAccess = Boolean(ngfValidation?.address_balance?.has_required_balance);

  const refreshNgfValidation = useCallback(async (address?: string | null) => {
    setNgfLoading(true);
    setNgfError(null);

    try {
      const endpoint = new URL(`${apiBaseUrl()}/api/v1/ngf/validate`);
      if (address) {
        endpoint.searchParams.set("address", address);
      }

      const response = await fetch(endpoint.toString(), { cache: "no-store" });
      const payload = (await response.json()) as NgfValidationResponse | { error?: string };

      if (!response.ok || !("is_valid" in payload)) {
        throw new Error((payload as { error?: string }).error ?? "NGF validation failed");
      }

      setNgfValidation(payload);
      const rawBalance = payload.address_balance?.ngf_balance?.replaceAll(",", "",
      );
      const parsedBalance = rawBalance ? Number.parseInt(rawBalance, 10) : Number.NaN;

      setWallet((current) =>
        current.ordinals === address
          ? {
              ...current,
              runeBalance: Number.isFinite(parsedBalance) ? parsedBalance : null,
            }
          : current,
      );
    } catch (error) {
      setNgfError(error instanceof Error ? error.message : "NGF validation failed");
    } finally {
      setNgfLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadMempool = async () => {
      try {
        const response = await fetch(`${apiBaseUrl()}/api/v1/mempool/fees`, {
          cache: "no-store",
        });
        const data = (await response.json()) as
          | {
              low_fee: number;
              medium_fee: number;
              high_fee: number;
              block_height: number;
            }
          | { error?: string };

        if (!response.ok || !("low_fee" in data)) {
          throw new Error((data as { error?: string }).error ?? "mempool fetch failed");
        }

        setFees({
          low: data.low_fee,
          med: data.medium_fee,
          high: data.high_fee,
        });
        setBlockHeight(data.block_height);
      } catch {
        setFees(fallbackFees);
        setBlockHeight(fallbackBlockHeight);
      }
    };

    void loadMempool();
  }, []);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: number | undefined;

    const connect = () => {
      socket = new WebSocket(`${websocketBaseUrl()}/api/v1/mempool/ws`);

      socket.addEventListener("open", () => setWsConnected(true));
      socket.addEventListener("close", () => {
        setWsConnected(false);
        reconnectTimer = window.setTimeout(connect, 3000);
      });
      socket.addEventListener("error", () => {
        setWsConnected(false);
        socket?.close();
      });
      socket.addEventListener("message", (event) => {
        try {
          const payload = JSON.parse(event.data) as {
            block_height?: number;
            low_fee?: number;
            medium_fee?: number;
            high_fee?: number;
          };

          if (typeof payload.block_height === "number") {
            setBlockHeight(payload.block_height);
          }

          if (
            typeof payload.low_fee === "number" ||
            typeof payload.medium_fee === "number" ||
            typeof payload.high_fee === "number"
          ) {
            setFees((current) => ({
              low: payload.low_fee ?? current.low,
              med: payload.medium_fee ?? current.med,
              high: payload.high_fee ?? current.high,
            }));
          }
        } catch {
          // ignore malformed upstream frames
        }
      });
    };

    connect();

    return () => {
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
      }
      socket?.close();
    };
  }, []);

  useEffect(() => {
    if (wallet.connected && wallet.ordinals) {
      void refreshNgfValidation(wallet.ordinals);
    }
  }, [refreshNgfValidation, wallet.connected, wallet.ordinals]);

  const toggleLang = () => {
    const nextLang = lang === "ES" ? "EN" : "ES";
    setLang(nextLang);
    localStorage.setItem("nesges_lang", nextLang);
  };

  const connectWallet = (name: WalletName) => {
    setWallet({ connected: true, name, ...walletProfiles[name], runeBalance: null });
    setIsWalletOpen(false);
  };

  const disconnectWallet = () => {
    setWallet({
      connected: false,
      payment: null,
      ordinals: null,
      name: null,
      runeBalance: null,
    });
    setNgfValidation(null);
  };

  const handleCommit = async () => {
    setCommitLoading(true);
    setCommitError(null);

    try {
      const response = await fetch(`${apiBaseUrl()}/api/v1/inscribe/commit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_name: form.projectName,
          jurisdiction: form.jurisdiction,
          contract_hash: form.contractHash,
        }),
      });
      const payload = (await response.json()) as CommitResponse | { error?: string };

      if (!response.ok || !("commit_txid" in payload)) {
        throw new Error((payload as { error?: string }).error ?? "commit failed");
      }

      setCommitResult(payload);
      setInscribeStep("commit");
    } catch (error) {
      setCommitError(error instanceof Error ? error.message : "commit failed");
    } finally {
      setCommitLoading(false);
    }
  };

  const handlePsbtValidation = async () => {
    setPsbtLoading(true);
    setPsbtError(null);
    setPsbtResult(null);

    try {
      const response = await fetch(`${apiBaseUrl()}/api/v1/psbt/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          psbt_hex: psbtHex.trim(),
          price_sats: listingPriceSats,
        }),
      });
      const payload = (await response.json()) as
        | PsbtValidationResponse
        | { error?: string; treasury_address?: string };

      if (!response.ok || !("is_valid" in payload)) {
        throw new Error((payload as { error?: string }).error ?? "PSBT validation failed");
      }

      setPsbtResult(payload);
    } catch (error) {
      setPsbtError(
        error instanceof Error ? error.message : "PSBT validation failed",
      );
    } finally {
      setPsbtLoading(false);
    }
  };

  const metadataPreview = useMemo(() => {
    const payload = commitResult?.metadata_jsonld ?? {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: form.projectName,
      about: t.runeName,
      isPartOf: t.platformName,
      provider: t.brandName,
      identifier: {
        rune: t.runeName,
        network: t.bitcoinL1,
        inscription_flow: "Commit/Reveal",
      },
      jurisdiction: form.jurisdiction,
      contract_hash: form.contractHash,
      taproot_address: wallet.ordinals,
    };

    return JSON.stringify(payload, null, 2);
  }, [commitResult, form.contractHash, form.jurisdiction, form.projectName, t, wallet.ordinals]);

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-8">
          <header className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-orange-400/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-orange-200">
                    {t.poweredBy}
                  </span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                    {t.bitcoinL1} · Taproot · PSBT
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-200">{t.brandName}</p>
                  <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                    {t.heroTitle}
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                    {t.heroSubtitle}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-slate-200">
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2">
                    {t.feeNotice}
                  </span>
                  <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2">
                    {t.liveNode}: Bitcoin Core + Mempool
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-start gap-3 lg:items-end">
                <div className="flex items-center gap-3">
                  <button
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:border-orange-300/50"
                    onClick={toggleLang}
                    type="button"
                  >
                    <Globe className="h-4 w-4" />
                    {lang}
                  </button>
                  <button
                    className="flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-orange-400"
                    onClick={() =>
                      wallet.connected ? disconnectWallet() : setIsWalletOpen(true)
                    }
                    type="button"
                  >
                    <Wallet className="h-4 w-4" />
                    {wallet.connected ? t.disconnectWallet : t.connectWallet}
                  </button>
                </div>
                {wallet.connected && (
                  <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-200">
                    <div className="font-medium text-white">{t.walletConnected}</div>
                    <div className="mt-1">{t.walletName}: {wallet.name}</div>
                    <div className="mt-1">{t.paymentAddress}: {shortenAddress(wallet.payment)}</div>
                    <div className="mt-1">{t.ordinalsAddress}: {shortenAddress(wallet.ordinals)}</div>
                    <div className="mt-1">{t.runeBalance}: {wallet.runeBalance ?? "—"}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <FeesTicker
                fees={fees}
                blockHeight={blockHeight}
                wsConnected={wsConnected}
              />
            </div>
          </header>

          <section className="mt-8 grid gap-4 md:grid-cols-3">
            <StatusCard
              icon={<Wallet className="h-5 w-5" />}
              title={t.walletSplitTitle}
              body={t.walletSplitBody}
            />
            <StatusCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title={t.securityTitle}
              body={t.securityBody}
            />
            <StatusCard
              icon={<FileCode className="h-5 w-5" />}
              title={t.complianceTitle}
              body={t.complianceBody}
            />
          </section>

          <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="flex flex-wrap gap-3">
              <TabButton
                tab="inscribe"
                label={t.navInscribe}
                icon={<Layers className="h-4 w-4" />}
                active={activeTab === "inscribe"}
                onClick={setActiveTab}
              />
              <TabButton
                tab="marketplace"
                label={t.navMarketplace}
                icon={<ShoppingCart className="h-4 w-4" />}
                active={activeTab === "marketplace"}
                onClick={setActiveTab}
              />
              <TabButton
                tab="gating"
                label={t.navTokenGating}
                icon={<Lock className="h-4 w-4" />}
                active={activeTab === "gating"}
                onClick={setActiveTab}
              />
            </div>

            {activeTab === "inscribe" && (
              <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-white">{t.inscribeTitle}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{t.inscribeBody}</p>
                    </div>
                    <div className="rounded-full border border-orange-400/30 px-3 py-1 text-xs text-orange-200">
                      Commit/Reveal
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-300">
                    {[
                      ["form", t.stepForm],
                      ["commit", t.stepCommit],
                      ["reveal", t.stepReveal],
                      ["done", t.stepDone],
                    ].map(([stepKey, label]) => {
                      const steps = ["form", "commit", "reveal", "done"];
                      const active =
                        steps.indexOf(stepKey) <= steps.indexOf(inscribeStep);

                      return (
                        <span
                          className={`rounded-full border px-3 py-1 ${
                            active
                              ? "border-orange-400/40 bg-orange-500/10 text-orange-100"
                              : "border-white/10 bg-white/5"
                          }`}
                          key={stepKey}
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <label className="text-sm text-slate-200 sm:col-span-2">
                      <span className="mb-2 block">{t.projectName}</span>
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-orange-300"
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            projectName: event.target.value,
                          }))
                        }
                        value={form.projectName}
                      />
                    </label>
                    <label className="text-sm text-slate-200">
                      <span className="mb-2 block">{t.jurisdiction}</span>
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-orange-300"
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            jurisdiction: event.target.value,
                          }))
                        }
                        value={form.jurisdiction}
                      />
                    </label>
                    <label className="text-sm text-slate-200">
                      <span className="mb-2 block">{t.contractHash}</span>
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-orange-300"
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            contractHash: event.target.value,
                          }))
                        }
                        value={form.contractHash}
                      />
                    </label>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      className="flex items-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-400 disabled:opacity-70"
                      disabled={commitLoading}
                      onClick={() => void handleCommit()}
                      type="button"
                    >
                      {commitLoading ? t.apiLoading : t.createCommit}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-orange-300/50"
                      onClick={() => setInscribeStep("reveal")}
                      type="button"
                    >
                      {t.continueReveal}
                    </button>
                    <button
                      className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/20"
                      onClick={() => setInscribeStep("done")}
                      type="button"
                    >
                      {t.completeInscribe}
                    </button>
                  </div>

                  <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                    <div className="flex items-center gap-2 text-white">
                      <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                      {commitResult ? t.commitReady : t.apiIdle}
                    </div>
                    <div>{t.commitTxid}: {commitResult?.commit_txid ?? "—"}</div>
                    <div>{t.taprootAddress}: {commitResult?.taproot_address ?? "—"}</div>
                    <div>{t.apiStatus}: {commitLoading ? t.apiLoading : t.apiIdle}</div>
                    {commitError && (
                      <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-rose-100">
                        {t.apiError}: {commitError}
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                    <FileCode className="h-5 w-5 text-orange-200" />
                    {t.metadataPreview}
                  </h3>
                  <pre className="mt-4 overflow-x-auto rounded-2xl bg-black/30 p-4 text-xs leading-6 text-slate-300">
                    {metadataPreview}
                  </pre>
                </div>
              </div>
            )}

            {activeTab === "marketplace" && (
              <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-white">{t.marketplaceTitle}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{t.marketplaceBody}</p>
                    </div>
                    <ShoppingCart className="h-6 w-6 text-orange-200" />
                  </div>
                  <div className="mt-6 rounded-2xl border border-orange-400/20 bg-orange-500/10 p-5">
                    <h3 className="text-lg font-semibold text-white">{t.listingTitle}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-200">{t.listingBody}</p>
                    <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">{t.listingPrice}</dt>
                        <dd className="mt-1 text-xl font-semibold text-white">{formatSats(listingPriceSats)} sats</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">{t.treasuryFee}</dt>
                        <dd className="mt-1 text-xl font-semibold text-white">{formatSats(treasuryFee)} sats</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">{t.sighashMode}</dt>
                        <dd className="mt-1 text-sm font-medium text-slate-200">SIGHASH_SINGLE | SIGHASH_ANYONECANPAY</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Treasury</dt>
                        <dd className="mt-1 text-sm font-medium text-slate-200">{shortenAddress(treasuryAddress)}</dd>
                      </div>
                    </dl>
                  </div>

                  <label className="mt-6 block text-sm text-slate-200">
                    <span className="mb-2 block">{t.psbtHex}</span>
                    <textarea
                      className="min-h-40 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 font-mono text-xs text-white outline-none transition placeholder:text-slate-500 focus:border-orange-300"
                      onChange={(event) => setPsbtHex(event.target.value)}
                      placeholder="70736274ff..."
                      value={psbtHex}
                    />
                  </label>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      className="flex items-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-400 disabled:opacity-70"
                      disabled={psbtLoading}
                      onClick={() => void handlePsbtValidation()}
                      type="button"
                    >
                      {psbtLoading ? t.apiLoading : t.signPsbt}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                    <Cpu className="h-5 w-5 text-orange-200" />
                    {t.validationResult}
                  </h3>
                  {psbtResult && (
                    <div className="mt-4 space-y-3 text-sm text-slate-200">
                      <ResultPill ok={psbtResult.is_valid} label={psbtResult.is_valid ? t.onChainVerified : t.onChainPending} />
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div>{t.treasuryFee}: {formatSats(psbtResult.treasury_fee_sats)} sats</div>
                        <div>{t.sighashMode}: {psbtResult.sighash_type}</div>
                        <div>Treasury: {shortenAddress(psbtResult.treasury_address)}</div>
                      </div>
                    </div>
                  )}
                  {!psbtResult && !psbtError && (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                      {t.apiStatus}: {psbtLoading ? t.apiLoading : t.apiIdle}
                    </div>
                  )}
                  {psbtError && (
                    <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                      {t.apiError}: {psbtError}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "gating" && (
              <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-white">{t.gatingTitle}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{t.gatingBody}</p>
                    </div>
                    <Lock className="h-6 w-6 text-orange-200" />
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      className="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-400 disabled:opacity-70"
                      disabled={ngfLoading}
                      onClick={() => void refreshNgfValidation(wallet.ordinals)}
                      type="button"
                    >
                      {ngfLoading ? t.apiLoading : t.validateNgf}
                    </button>
                    {!wallet.connected && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                        {t.connectToValidate}
                      </span>
                    )}
                  </div>

                  {ngfValidation && (
                    <div className="mt-6 space-y-4">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                        <div className="font-medium text-white">{t.validationStatus}</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <ResultPill ok={ngfValidation.is_valid} label={ngfValidation.is_valid ? t.onChainVerified : t.onChainPending} />
                          <ResultPill ok={ngfValidation.mempool.tx_confirmed} label={t.etchingTx} />
                          <ResultPill ok={ngfValidation.mempool.block_height_matches} label={t.blockMatch} />
                          <ResultPill ok={ngfValidation.rune_index.rune_name_matches} label={t.runeMatch} />
                          <ResultPill ok={ngfValidation.rune_index.rune_number_matches} label={t.numberMatch} />
                          <ResultPill ok={ngfValidation.rune_index.rune_id_matches} label={t.idMatch} />
                          <ResultPill ok={ngfValidation.rune_index.etching_txid_matches} label={t.txidMatch} />
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                        <div>Rune: {ngfValidation.declared.rune_name} · #{ngfValidation.declared.rune_number}</div>
                        <div>Rune ID: {ngfValidation.declared.rune_id}</div>
                        <div>{t.etchingTx}: {shortenAddress(ngfValidation.declared.etching_txid)}</div>
                        <div>{t.blockLabel}: {ngfValidation.mempool.block_height ?? "—"}</div>
                        <div>{t.runeProvider}: {ngfValidation.rune_index.source}</div>
                        <div>{t.runeBalance}: {ngfValidation.address_balance?.ngf_balance ?? "—"}</div>
                      </div>

                      {ngfValidation.warnings.length > 0 && (
                        <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                          <div className="font-medium">{t.warnings}</div>
                          <ul className="mt-2 list-disc space-y-1 pl-5">
                            {ngfValidation.warnings.map((warning) => (
                              <li key={warning}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {ngfError && (
                    <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                      {t.apiError}: {ngfError}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                  <div
                    className={`rounded-2xl border p-5 ${
                      hasGateAccess
                        ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
                        : "border-white/10 bg-white/5 text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      {hasGateAccess ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <X className="h-5 w-5" />
                      )}
                      {hasGateAccess ? t.gateGranted : t.gateDenied}
                    </div>
                    {hasGateAccess && (
                      <p className="mt-3 text-sm leading-6">{t.gateAccessBody}</p>
                    )}
                    {!hasGateAccess && (
                      <p className="mt-3 text-sm leading-6 text-slate-300">{t.gateRuleBody}</p>
                    )}
                  </div>

                  <div className="mt-6 space-y-3 text-sm text-slate-200">
                    {[
                      "Deal Room / RedenHouses Global",
                      "Taproot Commit/Reveal Desk",
                      "Marketplace PSBT Settlement",
                      "Institutional Traceability Feed",
                    ].map((item) => (
                      <div
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                        key={item}
                      >
                        <span>{item}</span>
                        {hasGateAccess ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                        ) : (
                          <Lock className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {isWalletOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-6">
            <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl shadow-black/40">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white">{t.walletModalTitle}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{t.walletModalBody}</p>
                </div>
                <button
                  className="rounded-full border border-white/10 p-2 text-slate-300 transition hover:border-orange-300/50 hover:text-white"
                  onClick={() => setIsWalletOpen(false)}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {(Object.keys(walletProfiles) as WalletName[]).map((walletName) => (
                  <button
                    className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-orange-300/50 hover:bg-orange-500/10"
                    key={walletName}
                    onClick={() => connectWallet(walletName)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-lg font-semibold text-white">{walletName}</div>
                      <Wallet className="h-5 w-5 text-orange-200" />
                    </div>
                    <dl className="mt-4 space-y-2 text-sm text-slate-300">
                      <div>
                        <dt className="font-medium text-slate-100">{t.paymentAddress}</dt>
                        <dd>{walletProfiles[walletName].payment}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-slate-100">{t.ordinalsAddress}</dt>
                        <dd>{walletProfiles[walletName].ordinals}</dd>
                      </div>
                    </dl>
                    <div className="mt-4 inline-flex rounded-full border border-orange-400/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-100">
                      {t.connectAction}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </LanguageContext.Provider>
  );
}
