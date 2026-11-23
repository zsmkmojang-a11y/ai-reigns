import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, Download, Loader2, Share2, Sparkles, X } from 'lucide-react';
import { EndingDefinition } from '../data/endingsAndPerks';
import { MetaSaveState } from '../types/game';
import {
  buildObituaryShareText,
  ObituaryPosterResult,
  PosterSourceMode,
  renderObituaryPoster,
} from '../utils/obituaryPoster';

interface ShareObituaryModalProps {
  open: boolean;
  ending: EndingDefinition;
  meta: MetaSaveState;
  forcePlaceholder: boolean;
  source: PosterSourceMode;
  survivedTurns?: number;
  onClose: () => void;
}

async function copyTextSafe(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to execCommand fallback (essential on plain HTTP LAN!)
  }

  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', 'true');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export const ShareObituaryModal: React.FC<ShareObituaryModalProps> = ({
  open,
  ending,
  meta,
  forcePlaceholder,
  source,
  survivedTurns,
  onClose,
}) => {
  const [poster, setPoster] = useState<ObituaryPosterResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fallbackShareText = useMemo(
    () =>
      buildObituaryShareText({
        ending,
        meta,
        forcePlaceholder,
        source,
        survivedTurns,
      }),
    [ending, meta, forcePlaceholder, source, survivedTurns]
  );

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setRenderError(null);
    setPoster(null);
    setCopied(false);
    setToastMsg(null);

    renderObituaryPoster({
      ending,
      meta,
      forcePlaceholder,
      source,
      survivedTurns,
    })
      .then((res) => {
        if (!cancelled) {
          setPoster(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setRenderError(err instanceof Error ? err.message : '战报渲染失败');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, ending, meta, forcePlaceholder, source, survivedTurns]);

  const canNativeFileShare = useMemo(() => {
    if (!poster || typeof navigator === 'undefined' || !navigator.canShare) {
      return false;
    }
    try {
      const testFile = new File([poster.blob], poster.downloadFilename, {
        type: 'image/png',
      });
      return navigator.canShare({ files: [testFile] });
    } catch {
      return false;
    }
  }, [poster]);

  if (!open) return null;

  const isTrueWin = ending.category === 'true_ending';

  const showBriefToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => {
      setToastMsg((cur) => (cur === msg ? null : cur));
    }, 2600);
  };

  const handleDownloadPng = () => {
    if (!poster) return;
    const objUrl = URL.createObjectURL(poster.blob);
    const link = document.createElement('a');
    link.href = objUrl;
    link.download = poster.downloadFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(objUrl), 5000);
    showBriefToast('已触发高清战报下载！手机端亦可直接长按上方图片保存');
  };

  const handleNativeShare = async () => {
    if (!poster || !navigator.share) return;
    try {
      const file = new File([poster.blob], poster.downloadFilename, {
        type: 'image/png',
      });
      await navigator.share({
        title: `《王权·奇点》${ending.title}`,
        text: poster.shareText,
        files: [file],
      });
    } catch {
      // User cancelled share sheet — ignore
    }
  };

  const handleCopyText = async () => {
    const text = poster?.shareText ?? fallbackShareText;
    const ok = await copyTextSafe(text);
    if (ok) {
      setCopied(true);
      showBriefToast('纯文本墓志铭战报已写入剪贴板！');
      window.setTimeout(() => setCopied(false), 2200);
    } else {
      showBriefToast('复制受限，请手动选中文本复制');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/88 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
    >
      <motion.div
        initial={{ y: 24, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 16, scale: 0.97, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="panel-gilded w-full max-w-md rounded-3xl overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Header */}
        <div className="relative px-5 pt-4 pb-3 border-b border-gold-400/15 bg-black/35 text-center shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 w-8 h-8 rounded-full flex items-center justify-center text-gold-200/70 hover:text-white hover:bg-white/10 cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.25em] text-gold-300/80">
            <Sparkles className="w-3 h-3 text-gold-300" />
            CYBER OBITUARY CARD
          </div>
          <h3 className="font-display text-lg font-black text-gilded tracking-wide mt-0.5">
            大肥鱼赛博墓志铭战报
          </h3>
        </div>

        {/* Poster Preview Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 flex flex-col items-center justify-center bg-[#050811]/70">
          {loading ? (
            <div className="w-full max-w-[300px] aspect-[2/3] rounded-2xl border border-gold-400/25 bg-black/40 flex flex-col items-center justify-center gap-2.5 text-gold-200/80">
              <Loader2 className="w-6 h-6 animate-spin text-gold-300" />
              <span className="text-xs font-display tracking-wider">
                正在镌刻高清塔罗墓志铭…
              </span>
            </div>
          ) : poster ? (
            <div className="flex flex-col items-center w-full">
              <img
                src={poster.dataUrl}
                alt={`大肥鱼墓志铭_${ending.title}`}
                style={{
                  WebkitTouchCallout: 'default',
                  userSelect: 'auto',
                }}
                className="w-auto max-h-[60vh] max-w-full aspect-[2/3] rounded-2xl shadow-[0_14px_45px_rgba(0,0,0,0.85),0_0_0_1px_rgba(216,180,106,0.45)] object-contain pointer-events-auto select-auto"
              />
              <span className="text-[10.5px] text-slate-400 mt-2">
                支持一键保存高清 PNG，手机端亦可直接长按上方图片存图
              </span>
            </div>
          ) : (
            <div className="w-full rounded-2xl border border-rose-400/30 bg-rose-950/25 p-4 text-center space-y-2">
              <div className="text-xs text-rose-200 font-bold">
                {renderError ?? '画布生成异常'}
              </div>
              <p className="text-[11.5px] text-slate-300 leading-relaxed select-text">
                {fallbackShareText}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 pt-3 border-t border-gold-400/15 bg-black/40 space-y-2 shrink-0">
          {toastMsg && (
            <div className="text-center text-[11px] font-medium text-emerald-300 bg-emerald-950/50 border border-emerald-400/30 rounded-xl py-1 px-2.5">
              {toastMsg}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              disabled={!poster}
              onClick={handleDownloadPng}
              className={`shimmer flex-1 py-2.5 px-3 rounded-2xl font-bold text-[12.5px] flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-[0.98] disabled:opacity-45 ${
                isTrueWin
                  ? 'bg-gradient-to-b from-emerald-300 to-emerald-500 text-[#04110a] shadow-[0_6px_22px_-6px_rgba(16,185,129,0.65)]'
                  : 'bg-gradient-to-b from-gold-200 to-gold-500 text-[#1a1206] shadow-[0_6px_22px_-6px_rgba(216,180,106,0.65)]'
              }`}
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>保存战报长图 (PNG)</span>
            </button>

            {canNativeFileShare && (
              <button
                type="button"
                onClick={handleNativeShare}
                title="调用系统原生分享面板"
                className="py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-gold-400/40 text-gold-100 font-bold text-[12.5px] flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] transition shrink-0"
              >
                <Share2 className="w-4 h-4 text-gold-300" />
                <span>分享</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleCopyText}
            className={`w-full py-2.5 px-3 rounded-2xl border font-bold text-[12.5px] flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-[0.98] ${
              copied
                ? 'bg-emerald-950/70 border-emerald-400/65 text-emerald-200'
                : 'bg-black/35 hover:bg-white/[0.06] border-gold-400/35 text-gold-100'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>已复制文字墓志铭 ✓</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-gold-300" />
                <span>复制文字墓志铭</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
