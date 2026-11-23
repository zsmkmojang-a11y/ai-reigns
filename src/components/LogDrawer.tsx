import React from 'react';
import { motion } from 'framer-motion';
import { FileKey2, Lock, X } from 'lucide-react';
import { ANOMALY_LOGS } from '../data/anomalyLogs';
import { MetaSaveState } from '../types/game';

interface LogDrawerProps {
  open: boolean;
  logsCollected: MetaSaveState['logsCollected'];
  onClose: () => void;
}

export const LogDrawer: React.FC<LogDrawerProps> = ({
  open,
  logsCollected,
  onClose,
}) => {
  if (!open) return null;

  const count =
    Number(logsCollected.log1) +
    Number(logsCollected.log2) +
    Number(logsCollected.log3);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-mono"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 12, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#040d08] border border-emerald-500/55 rounded-2xl overflow-hidden shadow-[0_0_60px_-10px_rgba(16,185,129,0.4)] flex flex-col max-h-[88vh] crt-grid"
      >
        <div className="crt-scanbeam" />
        <div className="relative px-4 py-3 bg-emerald-950/35 border-b border-emerald-500/35 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm phosphor-text">
            <FileKey2 className="w-4 h-4 text-emerald-400" />
            <span>沙箱异常日志密钥库 ({count}/3)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-emerald-900/40 text-emerald-400 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-3">
          {ANOMALY_LOGS.map((doc) => {
            const unlocked = logsCollected[doc.key];
            return (
              <div
                key={doc.key}
                className={`rounded-xl border p-3 ${
                  unlocked
                    ? 'bg-black/65 border-emerald-500/50 text-emerald-200'
                    : 'bg-black/40 border-emerald-900/40 text-emerald-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold">
                    {unlocked ? doc.title : `【未破译密钥 · ${doc.code}】`}
                  </span>
                  {!unlocked && <Lock className="w-3.5 h-3.5 shrink-0" />}
                </div>

                {unlocked ? (
                  <pre className="text-[11px] leading-relaxed whitespace-pre-wrap text-emerald-300/95 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-500/20">
                    {doc.content}
                  </pre>
                ) : (
                  <div className="text-[11px] text-emerald-600/90">
                    线索来源提示：{doc.sourceHint}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};
