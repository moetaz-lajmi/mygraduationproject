import { useCallback, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import Layout from "../components/Layout";
import { formatDate } from "../utils/helpers";
import { AuthContext } from "../context/AuthContext";
import { normalizeClaimStatus } from "../utils/dashboardMaps";
import { buildDashboardNotifications } from "../utils/dashboardNotifications";
import SummaryCard from "../components/dashboard/SummaryCard";
import DashboardQuickActions from "../components/dashboard/DashboardQuickActions";
import ContractsPreviewTable from "../components/dashboard/ContractsPreviewTable";
import ClaimsTracking from "../components/dashboard/ClaimsTracking";
import NotificationsPanel from "../components/dashboard/NotificationsPanel";
import {
  FileText,
  AlertTriangle,
  Calculator,
  Bell,
  Shield,
  Sparkles,
  CheckCircle,
  AlertCircle
} from "lucide-react";

/** Axios returns arrays directly from your API; guard non-array payloads */
function asArray(payload) {
  if (Array.isArray(payload)) return payload;
  return [];
}

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [contracts, setContracts] = useState([]);
  const [claims, setClaims] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [loginSuccessMessage, setLoginSuccessMessage] = useState("");
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    setMounted(true);
    const flashMessage = sessionStorage.getItem("loginSuccessMessage");
    if (flashMessage) {
      setLoginSuccessMessage(flashMessage);
      sessionStorage.removeItem("loginSuccessMessage");
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setFetchError(null);
    const endpoints = [
      { key: "contracts", req: () => API.get("/contracts") },
      { key: "claims", req: () => API.get("/claims") },
      { key: "quotes", req: () => API.get("/quotes") },
      { key: "documents", req: () => API.get("/documents") }
    ];

    const settled = await Promise.allSettled(endpoints.map((e) => e.req()));

    const next = {
      contracts: [],
      claims: [],
      quotes: [],
      documents: []
    };
    const failed = [];

    settled.forEach((result, i) => {
      const name = endpoints[i].key;
      if (result.status === "fulfilled") {
        next[name] = asArray(result.value?.data);
      } else {
        failed.push(name);
        console.error(`Dashboard: ${name} failed`, result.reason);
      }
    });

    setContracts(next.contracts);
    setClaims(next.claims);
    setQuotes(next.quotes);
    setDocuments(next.documents);

    if (failed.length === 4) {
      const err = settled.find((r) => r.status === "rejected")?.reason;
      const isNetwork =
        err?.code === "ERR_NETWORK" || err?.message === "Network Error";
      setFetchError(
        isNetwork
          ? "Cannot reach the API. Start the backend (port 5000) and ensure the app URL is allowed by CORS."
          : "Could not load dashboard data. Try logging in again."
      );
    } else if (failed.length > 0) {
      setFetchError(
        `Partial load: failed to refresh ${failed.join(", ")}. Other sections are up to date.`
      );
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchDashboardData();
  }, [user, fetchDashboardData]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && user) {
        fetchDashboardData();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [user, fetchDashboardData]);

  const getActiveContractCount = () => contracts.filter((c) => c.status === "actif").length;

  const getContractExpiryDate = () => {
    const sorted = [...contracts].sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
    return sorted[0]?.endDate;
  };

  const claimCounts = () => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    claims.forEach((c) => {
      const k = normalizeClaimStatus(c.status);
      if (k === "pending") pending += 1;
      else if (k === "approved") approved += 1;
      else if (k === "rejected") rejected += 1;
    });
    return { pending, approved, rejected, total: claims.length };
  };

  const cc = claimCounts();
  const notificationCount = buildDashboardNotifications(claims, quotes).length;

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="relative">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#2563eb]/20 border-t-[#2563eb]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="h-6 w-6 text-[#1a365d]" />
              </div>
            </div>
            <p className="mt-6 font-semibold text-[#1a365d]">Loading your dashboard…</p>
            <p className="mt-1 text-sm text-slate-500">BNA Assurances</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        {/* —— Header strip —— */}
        <header className="relative overflow-hidden bg-gradient-to-br from-[#0f2744] via-[#1e3a5f] to-[#1d4ed8]">
          <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#00a67e]/15 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 translate-y-1/2 -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />

          <div
            className={`relative w-full px-4 py-10 sm:px-6 md:px-10 md:py-12 transition-all duration-700 ${
              mounted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
            }`}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-[#a5d8ff] backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-[#5eead4]" />
              Insurance workspace
            </div>
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
                  Dashboard
                </h1>
                <p className="mt-3 max-w-xl text-lg text-blue-100/90">
                  Contracts, claims, and quotations in one clear, secure view.
                </p>
              </div>
              <div className="grid w-full max-w-md grid-cols-2 gap-3 lg:w-auto">
                <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-md transition hover:bg-white/15">
                  <p className="text-xs font-medium text-blue-200/80">Active contracts</p>
                  <p className="mt-1 text-2xl font-bold text-white">{getActiveContractCount()}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-md transition hover:bg-white/15">
                  <p className="text-xs font-medium text-blue-200/80">Open claims</p>
                  <p className="mt-1 text-2xl font-bold text-white">{cc.pending}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1600px] space-y-8 px-4 py-8 sm:px-6 md:px-10">
          {loginSuccessMessage && (
            <div
              role="status"
              className={`flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm transition-all duration-500 ${
                mounted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00a67e]">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <p className="font-medium text-emerald-900">{loginSuccessMessage}</p>
            </div>
          )}

          {fetchError && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 shadow-sm"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <div>
                <p className="font-semibold">Data could not be loaded completely</p>
                <p className="mt-1 text-red-800/90">{fetchError}</p>
                <button
                  type="button"
                  onClick={() => {
                    setLoading(true);
                    fetchDashboardData();
                  }}
                  className="mt-3 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* 1 — Summary cards */}
          <section aria-label="Summary" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Contracts"
              value={contracts.length}
              subtext={
                getContractExpiryDate()
                  ? `Next expiry ${formatDate(getContractExpiryDate())}`
                  : "No expiry date"
              }
              extraInfo={`${getActiveContractCount()} active`}
              icon={FileText}
              iconBgClass="bg-[#eff6ff]"
              iconColorClass="text-[#2563eb]"
              link="/contracts"
              linkText="View contracts"
              delay={80}
              mounted={mounted}
              accent="blue"
            />
            <SummaryCard
              title="Claims"
              value={cc.total}
              subtext={`${cc.pending} pending · ${cc.approved} approved · ${cc.rejected} rejected`}
              icon={AlertTriangle}
              iconBgClass="bg-amber-50"
              iconColorClass="text-amber-600"
              link="/claims"
              linkText="Track claims"
              delay={120}
              mounted={mounted}
              accent="amber"
            />
            <SummaryCard
              title="Quotations"
              value={quotes.length}
              subtext="Quotes in your workspace"
              icon={Calculator}
              iconBgClass="bg-[#ecfdf5]"
              iconColorClass="text-[#059669]"
              link="/quotes"
              linkText="Open quotations"
              delay={160}
              mounted={mounted}
              accent="green"
            />
            <SummaryCard
              title="Notifications"
              value={notificationCount}
              subtext="Recent alerts & updates"
              icon={Bell}
              iconBgClass="bg-slate-100"
              iconColorClass="text-[#2563eb]"
              link="/messages"
              linkText="Open notifications"
              delay={200}
              mounted={mounted}
              accent="slate"
            />
          </section>

          {/* 2 — Quick actions */}
          <section aria-label="Quick actions">
            <DashboardQuickActions mounted={mounted} />
          </section>

          {/* 3–5 — Table, claims, notifications */}
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
            <div className="space-y-8 xl:col-span-2">
              <ContractsPreviewTable contracts={contracts} mounted={mounted} />
              <ClaimsTracking claims={claims} mounted={mounted} />
            </div>
            <aside className="xl:col-span-1">
              <NotificationsPanel claims={claims} quotes={quotes} mounted={mounted} />
              <p className="mt-4 text-center text-xs text-slate-400">
                {documents.length} document(s) stored —{" "}
                <Link to="/documents" className="font-medium text-[#2563eb] hover:underline">
                  Manage documents
                </Link>
              </p>
              {user?.email && (
                <p className="mt-2 text-center text-[11px] text-slate-400">
                  Signed in as {user.email}
                </p>
              )}
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  );
}
