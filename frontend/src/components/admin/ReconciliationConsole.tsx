'use client';

import { useState } from 'react';
import { Loader2, RefreshCw, Send, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import { postAdminJson } from '@/utils/admin-api';
import { BATCH_ID } from '@/lib/reconciliation-batch';

interface Preview {
  batchId: string;
  manifestHash: string;
  summary: Record<string, number>;
  warnings: string[];
}

interface TelegramStatus {
  expected: number;
  sent: number;
  remaining: number;
  failed: string[];
  uncertain: string[];
  nextOrderId: string | null;
}

export default function ReconciliationConsole() {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [confirmation, setConfirmation] = useState('');
  const [applyResult, setApplyResult] = useState<any>(null);
  const [telegramStatus, setTelegramStatus] = useState<TelegramStatus | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const loadPreview = async () => {
    setBusy('preview');
    try {
      const result = await postAdminJson<Preview>('previewOrderReconciliation');
      setPreview(result);
      toast.success('Fresh reconciliation preview loaded');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Preview failed');
    } finally {
      setBusy(null);
    }
  };

  const apply = async () => {
    if (!preview || confirmation !== BATCH_ID) return;
    setBusy('apply');
    try {
      const result = await postAdminJson('applyOrderReconciliation', {
        confirm: confirmation,
        manifestHash: preview.manifestHash,
      });
      setApplyResult(result);
      toast.success('All frozen orders were repriced and verified');
      await loadPreview();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Apply failed');
    } finally {
      setBusy(null);
    }
  };

  const loadTelegramStatus = async () => {
    setBusy('status');
    try {
      setTelegramStatus(await postAdminJson<TelegramStatus>('getCorrectionNotificationStatus'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not load Telegram status');
    } finally {
      setBusy(null);
    }
  };

  const sendNext = async () => {
    if (!telegramStatus?.nextOrderId) return;
    setBusy('send');
    try {
      await postAdminJson('sendCorrectedPendingOrderNotification', {
        orderId: telegramStatus.nextOrderId,
      });
      setTelegramStatus(await postAdminJson<TelegramStatus>('getCorrectionNotificationStatus'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Telegram send stopped');
      await loadTelegramStatus();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-3 text-primary mb-3">
          <ShieldCheck className="w-6 h-6" />
          <span className="text-xs font-black uppercase tracking-[0.25em]">Restricted accounting operation</span>
        </div>
        <h1 className="text-3xl font-black">Historical Order Reconciliation</h1>
        <p className="text-sm text-slate-500 mt-2">Frozen batch: {BATCH_ID}</p>
      </div>

      <section className="bg-white dark:bg-[#0D1518] border border-border rounded-3xl p-7 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-black uppercase tracking-wider">1. Dry-run</h2>
          <button onClick={loadPreview} disabled={!!busy} className="px-5 py-3 rounded-xl bg-slate-900 text-white text-xs font-black disabled:opacity-50">
            {busy === 'preview' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load fresh preview'}
          </button>
        </div>
        {preview && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(preview.summary).map(([key, value]) => (
                <div key={key} className="rounded-2xl bg-slate-50 dark:bg-white/5 p-4">
                  <p className="text-[9px] uppercase tracking-widest text-slate-400 break-words">{key}</p>
                  <p className="text-lg font-black mt-1 tabular-nums">{Number(value).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] font-mono text-slate-400 break-all">Manifest: {preview.manifestHash}</p>
            {preview.warnings.map((warning) => <p key={warning} className="text-xs text-amber-600">{warning}</p>)}
          </>
        )}
      </section>

      <section className="bg-white dark:bg-[#0D1518] border border-border rounded-3xl p-7 space-y-5">
        <h2 className="font-black uppercase tracking-wider">2. Apply and verify all 90 orders</h2>
        <input
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          placeholder={`Type ${BATCH_ID}`}
          className="w-full px-4 py-3 border border-border rounded-xl bg-transparent font-mono text-xs"
        />
        <button
          onClick={apply}
          disabled={!preview || confirmation !== BATCH_ID || !!busy}
          className="px-6 py-3 rounded-xl bg-red-600 text-white text-xs font-black disabled:opacity-40"
        >
          {busy === 'apply' ? 'Applying and verifying…' : 'Apply frozen reconciliation'}
        </button>
        {applyResult && <p className="text-sm text-emerald-600 font-bold">Verified backup: {applyResult.backupPath}</p>}
      </section>

      <section className="bg-white dark:bg-[#0D1518] border border-border rounded-3xl p-7 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-black uppercase tracking-wider">3. Telegram correction ledger</h2>
          <button onClick={loadTelegramStatus} disabled={!!busy} className="p-3 rounded-xl border border-border" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${busy === 'status' ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {telegramStatus && (
          <div className="space-y-4">
            <div className="flex gap-6 text-sm font-bold">
              <span>Expected: {telegramStatus.expected}</span>
              <span className="text-emerald-600">Sent: {telegramStatus.sent}</span>
              <span>Remaining: {telegramStatus.remaining}</span>
            </div>
            {(telegramStatus.failed.length > 0 || telegramStatus.uncertain.length > 0) && (
              <p className="text-red-600 text-xs font-bold">Dispatch is blocked: {telegramStatus.failed.length} failed, {telegramStatus.uncertain.length} uncertain.</p>
            )}
            <button
              onClick={sendNext}
              disabled={
                !(applyResult || (preview?.summary.changedItemCount === 0 && preview?.summary.changedOrderCount === 0))
                || !telegramStatus.nextOrderId
                || telegramStatus.failed.length > 0
                || telegramStatus.uncertain.length > 0
                || !!busy
              }
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-xs font-black disabled:opacity-40"
            >
              {busy === 'send' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send next single order
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
