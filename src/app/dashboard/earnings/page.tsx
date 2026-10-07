"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDownToLine,
  Banknote,
  CalendarCheck,
  Clock,
  Landmark,
  Loader2,
  Wallet,
} from "lucide-react";
import { apiGet, apiSend } from "@/lib/api-client";
import { getLoggedInCreator } from "@/lib/creator-auth";
import { formatPrice } from "@/data/creators";
import { SelectDropdown } from "@/components/SelectDropdown";
import {
  AuthSection,
  authInputClass,
  authLabelClass,
} from "@/components/auth/AuthSection";
import type {
  Booking,
  EarningsSummary,
  PayoutAccount,
  Withdrawal,
} from "@/types";

type Bank = { name: string; code: string };

const withdrawalStyle: Record<Withdrawal["status"], string> = {
  pending: "text-amber-700 bg-amber-50 border-amber-200",
  processing: "text-amber-700 bg-amber-50 border-amber-200",
  success: "text-olive-700 bg-olive-50 border-olive-200",
  failed: "text-red-600 bg-red-50 border-red-200",
  reversed: "text-red-600 bg-red-50 border-red-200",
};

const withdrawalLabel: Record<Withdrawal["status"], string> = {
  pending: "Processing",
  processing: "Processing",
  success: "Paid",
  failed: "Failed",
  reversed: "Reversed",
};

function formatDateTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function EarningsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [account, setAccount] = useState<PayoutAccount | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [earned, setEarned] = useState<Booking[]>([]);

  const [banks, setBanks] = useState<Bank[]>([]);
  const [editingAccount, setEditingAccount] = useState(false);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);

  const [amount, setAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const [earnings, bookings] = await Promise.all([
      apiGet<{
        summary: EarningsSummary;
        payoutAccount: PayoutAccount | null;
        withdrawals: Withdrawal[];
      }>("/api/earnings"),
      apiGet<{ bookings: Booking[] }>("/api/bookings"),
    ]);
    setSummary(earnings.summary);
    setAccount(earnings.payoutAccount);
    setWithdrawals(earnings.withdrawals);
    setEarned(
      bookings.bookings.filter(
        (b) =>
          b.paymentStatus === "paid" &&
          (b.status === "confirmed" || b.status === "completed")
      )
    );
  }, []);

  useEffect(() => {
    getLoggedInCreator().then(async (creator) => {
      if (!creator) {
        router.replace("/signin");
        return;
      }
      setReady(true);
      try {
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load earnings.");
      } finally {
        setLoading(false);
      }
    });
  }, [router, load]);

  // Only fetch the bank list when it's needed.
  const showAccountForm = editingAccount || (!loading && !account);
  useEffect(() => {
    if (!showAccountForm || banks.length > 0) return;
    apiGet<{ banks: Bank[] }>("/api/earnings/banks")
      .then((data) => setBanks(data.banks))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Could not load banks.")
      );
  }, [showAccountForm, banks.length]);

  const saveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const bank = banks.find((b) => b.code === bankCode);
    if (!bank) {
      setError("Please choose your bank.");
      return;
    }
    setSavingAccount(true);
    setError("");
    setNotice("");
    try {
      const data = await apiSend<{ payoutAccount: PayoutAccount }>(
        "/api/earnings/payout-account",
        "PUT",
        {
          bankName: bank.name,
          bankCode: bank.code,
          accountNumber: accountNumber.trim(),
        }
      );
      setAccount(data.payoutAccount);
      setEditingAccount(false);
      setAccountNumber("");
      setNotice(`Saved. Withdrawals will go to ${data.payoutAccount.accountName}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save account.");
    } finally {
      setSavingAccount(false);
    }
  };

  const withdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!Number.isInteger(value) || value <= 0) {
      setError("Enter a whole-naira amount.");
      return;
    }
    setWithdrawing(true);
    setError("");
    setNotice("");
    try {
      const data = await apiSend<{ notice?: string }>(
        "/api/earnings/withdraw",
        "POST",
        { amount: value }
      );
      setAmount("");
      setNotice(
        data.notice ??
          `Withdrawal of ${formatPrice(value)} started. It usually reaches your bank within minutes.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Withdrawal failed.");
    } finally {
      await load().catch(() => undefined);
      setWithdrawing(false);
    }
  };

  if (!ready) return null;

  const canWithdraw = Boolean(account && summary && summary.available >= summary.minWithdrawal);

  const cards = summary
    ? [
        {
          label: "Available to withdraw",
          value: summary.available,
          icon: Wallet,
          tone: "bg-olive-600 text-milky-50",
          sub: "text-olive-100",
          hint: "Ready now",
        },
        {
          label: "Pending",
          value: summary.pendingEarnings,
          icon: Clock,
          tone: "bg-milky-50 text-olive-900 border border-olive-200/70",
          sub: "text-olive-500",
          hint: "Awaiting your acceptance",
        },
        {
          label: "Total earned",
          value: summary.totalEarned,
          icon: CalendarCheck,
          tone: "bg-milky-50 text-olive-900 border border-olive-200/70",
          sub: "text-olive-500",
          hint: "From accepted bookings",
        },
        {
          label: "Withdrawn",
          value: summary.withdrawn,
          icon: Banknote,
          tone: "bg-milky-50 text-olive-900 border border-olive-200/70",
          sub: "text-olive-500",
          hint: "Paid out or in progress",
        },
      ]
    : [];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-olive-900">Earnings</h1>
          <p className="text-olive-600">
            Your share of every accepted booking. Withdraw whenever you like.
          </p>
        </div>
        <Link
          href="/dashboard/bookings"
          className="inline-flex items-center gap-2 rounded-xl border border-olive-200 px-4 py-2 text-sm font-medium text-olive-700 hover:bg-olive-50"
        >
          <CalendarCheck size={16} />
          Bookings
        </Link>
      </div>

      {notice && (
        <p className="mb-4 rounded-xl bg-olive-50 px-4 py-3 text-sm text-olive-700">
          {notice}
        </p>
      )}
      {error && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-olive-600" size={28} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {cards.map(({ label, value, icon: Icon, tone, sub, hint }) => (
              <div key={label} className={`rounded-2xl p-5 shadow-sm ${tone}`}>
                <div className="flex items-center justify-between">
                  <p className={`text-sm ${sub}`}>{label}</p>
                  <Icon size={18} className={sub} />
                </div>
                <p className="mt-2 text-3xl font-bold">{formatPrice(value)}</p>
                <p className={`mt-1 text-xs ${sub}`}>{hint}</p>
              </div>
            ))}
          </div>

          <AuthSection
            title="Withdraw"
            description={`Minimum ${formatPrice(summary?.minWithdrawal ?? 0)}. Money is sent to your bank account.`}
          >
            {!account ? (
              <p className="text-sm text-olive-600">
                Add your bank account below to enable withdrawals.
              </p>
            ) : (
              <form onSubmit={withdraw} className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-olive-500">
                      ₦
                    </span>
                    <input
                      inputMode="numeric"
                      className={`${authInputClass} pl-8`}
                      placeholder="Amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setAmount(String(summary?.available ?? 0))}
                    className="rounded-xl border border-olive-200 px-4 py-2.5 text-sm font-medium text-olive-700 hover:bg-olive-50"
                  >
                    Withdraw all
                  </button>
                  <button
                    type="submit"
                    disabled={withdrawing || !canWithdraw || !amount}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-olive-600 px-5 py-2.5 font-semibold text-milky-50 hover:bg-olive-700 disabled:opacity-60"
                  >
                    {withdrawing ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <ArrowDownToLine size={16} />
                    )}
                    Withdraw
                  </button>
                </div>
                {!canWithdraw && (
                  <p className="text-xs text-olive-500">
                    You need at least {formatPrice(summary?.minWithdrawal ?? 0)}{" "}
                    available to withdraw.
                  </p>
                )}
              </form>
            )}
          </AuthSection>

          <AuthSection
            title="Bank account"
            description="Where your withdrawals are paid."
          >
            {account && !editingAccount ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-olive-100 p-2.5 text-olive-700">
                    <Landmark size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-olive-900">
                      {account.accountName}
                    </p>
                    <p className="text-sm text-olive-600">
                      {account.bankName} · ••••{account.accountNumber.slice(-4)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingAccount(true)}
                  className="text-sm font-semibold text-olive-700 hover:underline"
                >
                  Change
                </button>
              </div>
            ) : (
              <form onSubmit={saveAccount} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={authLabelClass}>Bank</label>
                    <SelectDropdown
                      value={bankCode}
                      onChange={setBankCode}
                      options={banks.map((b) => ({ value: b.code, label: b.name }))}
                      placeholder={banks.length ? "Select bank" : "Loading banks…"}
                    />
                  </div>
                  <div>
                    <label htmlFor="acct" className={authLabelClass}>
                      Account number
                    </label>
                    <input
                      id="acct"
                      inputMode="numeric"
                      maxLength={10}
                      className={authInputClass}
                      value={accountNumber}
                      onChange={(e) =>
                        setAccountNumber(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="10-digit NUBAN"
                    />
                  </div>
                </div>
                <p className="text-xs text-olive-500">
                  We verify the account with your bank and use the registered
                  account name.
                </p>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={savingAccount || accountNumber.length !== 10 || !bankCode}
                    className="inline-flex items-center gap-2 rounded-xl bg-olive-600 px-5 py-2.5 font-semibold text-milky-50 hover:bg-olive-700 disabled:opacity-60"
                  >
                    {savingAccount && <Loader2 size={16} className="animate-spin" />}
                    {savingAccount ? "Verifying…" : "Save account"}
                  </button>
                  {account && (
                    <button
                      type="button"
                      onClick={() => setEditingAccount(false)}
                      className="rounded-xl border border-olive-200 px-5 py-2.5 text-sm font-medium text-olive-700 hover:bg-olive-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </AuthSection>

          <AuthSection
            title="Earnings history"
            description="UpNext keeps a small commission; the rest is yours."
          >
            {earned.length === 0 ? (
              <p className="text-sm text-olive-500">
                Accepted bookings will show up here.
              </p>
            ) : (
              <ul className="divide-y divide-olive-100">
                {earned.map((b) => (
                  <li
                    key={b.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-olive-900">
                        {b.serviceName} · {b.clientName}
                      </p>
                      <p className="text-xs text-olive-500">
                        {formatDateTime(b.createdAt)} · Client paid{" "}
                        {formatPrice(b.price)} − {b.commissionPercent ?? 0}% fee (
                        {formatPrice(b.commission ?? 0)})
                      </p>
                    </div>
                    <p className="font-semibold text-olive-800">
                      +{formatPrice(b.creatorPayout ?? b.price)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </AuthSection>

          <AuthSection title="Withdrawals">
            {withdrawals.length === 0 ? (
              <p className="text-sm text-olive-500">No withdrawals yet.</p>
            ) : (
              <ul className="divide-y divide-olive-100">
                {withdrawals.map((w) => (
                  <li
                    key={w.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-olive-900">
                        {formatPrice(w.amount)}
                      </p>
                      <p className="text-xs text-olive-500">
                        {formatDateTime(w.createdAt)} · {w.bankName} ••••
                        {w.accountNumber.slice(-4)}
                      </p>
                      {w.failureReason &&
                        (w.status === "failed" || w.status === "reversed") && (
                          <p className="text-xs text-red-500">
                            {w.failureReason} — returned to your balance.
                          </p>
                        )}
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${withdrawalStyle[w.status]}`}
                    >
                      {withdrawalLabel[w.status]}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </AuthSection>
        </div>
      )}
    </div>
  );
}
