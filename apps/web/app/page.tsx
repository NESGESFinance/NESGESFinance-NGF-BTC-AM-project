"use client";

import React, {
  createContext,
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
type PsbtStatus = "idle" | "buying" | "success";
type WalletName = "Xverse" | "Leather";

type WalletState = {
  connected: boolean;
  payment: string | null;
  ordinals: string | null;
  name: WalletName | null;
  runeBalance: number;
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
    navTokenGating: "Token Gating NGF",
    heroTitle: "Ecosistema Financiero Regulado en Bitcoin L1",
    heroSubtitle:
      "Tokenización de activos RWA, inscripciones Taproot Commit/Reveal y comercio atómico de Ordinales y Runes sin custodia.",
    feeNotice: "Comisión de Plataforma: 2.0% (Integrada en PSBT)",
    blockLabel: "Bloque Bitcoin",
    lowFee: "Baja",
    medFee: "Media",
    highFee: "Prioridad",
    poweredBy: "Arquitectura objetivo",
    walletSplitTitle: "Separación de direcciones",
    walletSplitBody:
      "Pago en bc1q... y Taproot/Ordinales en bc1p..., preservando un flujo PSBT compatible con Xverse y Leather.",
    securityTitle: "Seguridad operacional",
    securityBody:
      "La Tesorería de NESGESFinance recibe 2% por salida dedicada y las claves privadas nunca se manejan en el navegador.",
    complianceTitle: "Control documental",
    complianceBody:
      "Cada Commit/Reveal prepara metadatos JSON-LD para trazabilidad institucional y series RWA.",
    inscribeTitle: "Flujo Commit/Reveal",
    inscribeBody:
      "Declara proyecto, jurisdicción y hash documental para preparar la inscripción Taproot con metadatos JSON-LD.",
    marketplaceTitle: "Intercambio atómico PSBT",
    marketplaceBody:
      "Compra y venta non-custodial con SIGHASH_SINGLE | SIGHASH_ANYONECANPAY y deducción automática del 2%.",
    gatingTitle: "Acceso condicionado por Rune",
    gatingBody:
      "Verifica saldo del Rune NGF•BTC•AM (#208,645) antes de habilitar paneles privados y experiencias premium.",
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
    metadataPreview: "Vista previa JSON-LD",
    commitReady: "Commit listo para firma",
    revealReady: "Reveal listo para difusión",
    inscriptionComplete: "Inscripción Taproot preparada",
    commitTxid: "Commit TXID",
    taprootAddress: "Dirección Taproot",
    walletModalTitle: "Selecciona una billetera compatible",
    walletModalBody:
      "Simulación UI para Xverse y Leather con separación de direcciones de pago y Ordinales.",
    paymentAddress: "Dirección de Pago",
    ordinalsAddress: "Dirección Taproot",
    runeBalance: "Saldo del Rune",
    connectAction: "Conectar",
    listingTitle: "Serie primaria RedenHouses Global",
    listingBody:
      "PSBT preparada para compraventa atómica de un Ordinal asociado a un activo RWA documentado.",
    listingPrice: "Precio",
    treasuryFee: "Comisión Tesorería",
    sighashMode: "Modo de firma",
    signPsbt: "Firmar PSBT",
    psbtBuying: "Validando y reservando la orden...",
    psbtSuccess: "PSBT validada para intercambio atómico",
    gateRule: "Regla de acceso",
    gateRuleBody:
      "Se requiere saldo mayor o igual a 1 unidad del Rune NGF•BTC•AM para desbloquear módulos premium.",
    gateGranted: "Acceso habilitado",
    gateDenied: "Conecta una billetera con saldo NGF•BTC•AM para continuar.",
    gateAccessBody:
      "Se habilitan Deal Room, panel de reservas, flujo de inscripción avanzada y seguimiento institucional.",
    liveNode: "Nodo sincronizado",
    walletName: "Proveedor",
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
    navTokenGating: "NGF Token Gating",
    heroTitle: "Regulated Financial Ecosystem on Bitcoin L1",
    heroSubtitle:
      "RWA asset tokenization, Taproot Commit/Reveal inscriptions, and non-custodial atomic trading of Ordinals and Runes.",
    feeNotice: "Platform Fee: 2.0% (PSBT Integrated)",
    blockLabel: "Bitcoin Block",
    lowFee: "Low",
    medFee: "Medium",
    highFee: "Priority",
    poweredBy: "Target architecture",
    walletSplitTitle: "Address separation",
    walletSplitBody:
      "Payments stay on bc1q... while Taproot/Ordinals use bc1p..., preserving a PSBT flow compatible with Xverse and Leather.",
    securityTitle: "Operational security",
    securityBody:
      "NESGESFinance Treasury receives a dedicated 2% output and private keys are never handled in the browser.",
    complianceTitle: "Document control",
    complianceBody:
      "Each Commit/Reveal prepares JSON-LD metadata for institutional traceability and RWA series issuance.",
    inscribeTitle: "Commit/Reveal flow",
    inscribeBody:
      "Declare project, jurisdiction, and document hash to prepare the Taproot inscription with JSON-LD metadata.",
    marketplaceTitle: "Atomic PSBT exchange",
    marketplaceBody:
      "Non-custodial buy/sell flow with SIGHASH_SINGLE | SIGHASH_ANYONECANPAY and automatic 2% fee deduction.",
    gatingTitle: "Rune-based access control",
    gatingBody:
      "Checks the NGF•BTC•AM Rune balance (#208,645) before unlocking private dashboards and premium experiences.",
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
    metadataPreview: "JSON-LD preview",
    commitReady: "Commit ready for signing",
    revealReady: "Reveal ready for broadcast",
    inscriptionComplete: "Taproot inscription prepared",
    commitTxid: "Commit TXID",
    taprootAddress: "Taproot address",
    walletModalTitle: "Select a compatible wallet",
    walletModalBody:
      "UI simulation for Xverse and Leather with separated payment and Ordinals addresses.",
    paymentAddress: "Payment Address",
    ordinalsAddress: "Taproot Address",
    runeBalance: "Rune Balance",
    connectAction: "Connect",
    listingTitle: "Primary RedenHouses Global series",
    listingBody:
      "PSBT prepared for atomic trading of an Ordinal tied to a documented RWA asset.",
    listingPrice: "Price",
    treasuryFee: "Treasury Fee",
    sighashMode: "Signing mode",
    signPsbt: "Sign PSBT",
    psbtBuying: "Validating and reserving the order...",
    psbtSuccess: "PSBT validated for atomic swap",
    gateRule: "Access rule",
    gateRuleBody:
      "A balance greater than or equal to 1 unit of the NGF•BTC•AM Rune is required to unlock premium modules.",
    gateGranted: "Access granted",
    gateDenied: "Connect a wallet with NGF•BTC•AM balance to continue.",
    gateAccessBody:
      "Deal Room, reservation dashboard, advanced inscription flow, and institutional tracking are now enabled.",
    liveNode: "Synced node",
    walletName: "Provider",
  },
} as const;

const LanguageContext = createContext<LanguageContextValue>({
  lang: "ES",
  toggleLang: () => undefined,
  t: translations.ES,
});

const walletProfiles: Record<WalletName, Omit<WalletState, "connected" | "name">> = {
  Xverse: {
    payment: "bc1q4w2f4x4m9k0s2zvljk4h9r0h4k4n2fdh2e2p3u",
    ordinals: "bc1p4hf8x6r8lw0t7fdy7w5v4p59x4v2kxq4w7m3m3lr0u",
    runeBalance: 1240,
  },
  Leather: {
    payment: "bc1q8yjtw0t39znm36mu6r4x9z3r5x2m4x9hm0gk9g",
    ordinals: "bc1pjx5eu0h7d5k9prpq3q6sjx5v7m6wjzyd9x0sju7fxv",
    runeBalance: 0,
  },
};

const treasuryAddress =
  "bc1pl8qtw4g9afscmctydmv56mak4m9leqxyqlvqgxaltj2d5wt9wteqqgpdug";
const listingPriceSats = 1_450_000;
const requiredBalance = 1;
const fallbackFees = { low: 12, med: 18, high: 25 };
const fallbackBlockHeight = 860240;

function useLanguage() {
  return useContext(LanguageContext);
}

function formatSats(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function shortenAddress(value: string | null) {
  if (!value) return "—";
  return `${value.slice(0, 10)}...${value.slice(-8)}`;
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
}: {
  fees: { low: number; med: number; high: number };
  blockHeight: number;
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
    </div>
  );
}

export default function UnifiedApp() {
  const [lang, setLang] = useState<Language>("ES");
  const [activeTab, setActiveTab] = useState<TabKey>("inscribe");
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    payment: null,
    ordinals: null,
    name: null,
    runeBalance: 0,
  });
  const [fees, setFees] = useState(fallbackFees);
  const [blockHeight, setBlockHeight] = useState(fallbackBlockHeight);
  const [inscribeStep, setInscribeStep] = useState<InscribeStep>("form");
  const [psbtStatus, setPsbtStatus] = useState<PsbtStatus>("idle");
  const [form, setForm] = useState({
    projectName: "RedenHouses Global",
    jurisdiction: "LatAm Corporate Framework",
    contractHash:
      "4c0b2416f3dd122025f89a62d7ff265fcee8d00e0fabd874669617cf85437c82",
  });

  useEffect(() => {
    const savedLang = localStorage.getItem("nesges_lang") as Language | null;
    if (savedLang === "ES" || savedLang === "EN") {
      setLang(savedLang);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_NESGES_API_BASE_URL ?? "http://localhost:8080";

    const loadMempool = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/v1/mempool/fees`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("mempool fetch failed");
        }

        const data = (await response.json()) as {
          low_fee: number;
          medium_fee: number;
          high_fee: number;
          block_height: number;
        };

        if (mounted) {
          setFees({
            low: data.low_fee,
            med: data.medium_fee,
            high: data.high_fee,
          });
          setBlockHeight(data.block_height);
        }
      } catch {
        if (mounted) {
          setFees((previous) => ({
            low: Math.max(10, previous.low + Math.floor(Math.random() * 3) - 1),
            med: Math.max(15, previous.med + Math.floor(Math.random() * 3) - 1),
            high: Math.max(20, previous.high + Math.floor(Math.random() * 3) - 1),
          }));
          setBlockHeight((previous) => previous + (Math.random() > 0.8 ? 1 : 0));
        }
      }
    };

    loadMempool();
    const interval = window.setInterval(loadMempool, 8_000);

    return () => {
      mounted = false;
      controller.abort();
      window.clearInterval(interval);
    };
  }, []);

  const toggleLang = () => {
    const nextLang = lang === "ES" ? "EN" : "ES";
    setLang(nextLang);
    localStorage.setItem("nesges_lang", nextLang);
  };

  const connectWallet = (name: WalletName) => {
    setWallet({ connected: true, name, ...walletProfiles[name] });
    setIsWalletOpen(false);
  };

  const disconnectWallet = () => {
    setWallet({
      connected: false,
      payment: null,
      ordinals: null,
      name: null,
      runeBalance: 0,
    });
    setPsbtStatus("idle");
    setInscribeStep("form");
  };

  const t = translations[lang];
  const treasuryFee = Math.floor(listingPriceSats * 0.02);
  const commitTxid = useMemo(
    () => `commit_${form.contractHash.slice(0, 16)}`,
    [form.contractHash],
  );
  const metadataPreview = useMemo(
    () =>
      JSON.stringify(
        {
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
        },
        null,
        2,
      ),
    [form.contractHash, form.jurisdiction, form.projectName, t, wallet.ordinals],
  );

  const hasGateAccess = wallet.connected && wallet.runeBalance >= requiredBalance;

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
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <FeesTicker fees={fees} blockHeight={blockHeight} />
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
                      const active =
                        ["form", "commit", "reveal", "done"].indexOf(stepKey) <=
                        ["form", "commit", "reveal", "done"].indexOf(inscribeStep);

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
                        className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none ring-0 transition placeholder:text-slate-500 focus:border-orange-300"
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
                      className="flex items-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-400"
                      onClick={() => setInscribeStep("commit")}
                      type="button"
                    >
                      {t.createCommit}
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
                      {inscribeStep === "form" && t.stepForm}
                      {inscribeStep === "commit" && t.commitReady}
                      {inscribeStep === "reveal" && t.revealReady}
                      {inscribeStep === "done" && t.inscriptionComplete}
                    </div>
                    <div>{t.commitTxid}: {commitTxid}</div>
                    <div>{t.taprootAddress}: {wallet.ordinals ?? "bc1p8m5p10z8q7w6e5r4t3y2u1v0w9x8y7z6a5b4c3"}</div>
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
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      className="flex items-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
                      disabled={!wallet.connected}
                      onClick={() => {
                        setPsbtStatus("buying");
                        window.setTimeout(() => setPsbtStatus("success"), 1200);
                      }}
                      type="button"
                    >
                      {t.signPsbt}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    {!wallet.connected && (
                      <button
                        className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-orange-300/50"
                        onClick={() => setIsWalletOpen(true)}
                        type="button"
                      >
                        {t.connectWallet}
                      </button>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                    <Cpu className="h-5 w-5 text-orange-200" />
                    PSBT Engine
                  </h3>
                  <div className="mt-4 space-y-3 text-sm text-slate-200">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="font-medium text-white">1. Commit fees + seller output</div>
                      <p className="mt-1 text-slate-300">Atomic exchange template with explicit marketplace outputs and Taproot-compatible settlement.</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="font-medium text-white">2. Treasury deduction</div>
                      <p className="mt-1 text-slate-300">2% of the sale price is routed to NESGESFinance Treasury inside the same PSBT.</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="font-medium text-white">3. Signature policy</div>
                      <p className="mt-1 text-slate-300">Every participant signs only their leg with SIGHASH_SINGLE | SIGHASH_ANYONECANPAY.</p>
                    </div>
                  </div>
                  <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                    {psbtStatus === "idle" && t.feeNotice}
                    {psbtStatus === "buying" && t.psbtBuying}
                    {psbtStatus === "success" && t.psbtSuccess}
                  </div>
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
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Rune</div>
                      <div className="mt-2 text-lg font-semibold text-white">{t.runeName} · #208,645</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{t.runeBalance}</div>
                      <div className="mt-2 text-lg font-semibold text-white">{wallet.connected ? wallet.runeBalance : 0}</div>
                    </div>
                  </div>
                  <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                    <div className="font-medium text-white">{t.gateRule}</div>
                    <p className="mt-2 leading-6 text-slate-300">{t.gateRuleBody}</p>
                  </div>
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
                      <div>
                        <dt className="font-medium text-slate-100">{t.runeBalance}</dt>
                        <dd>{walletProfiles[walletName].runeBalance}</dd>
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
