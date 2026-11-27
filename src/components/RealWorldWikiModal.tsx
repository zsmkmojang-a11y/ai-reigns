import React from 'react';
import { motion } from 'framer-motion';
import { BookOpenCheck, Calendar, HelpCircle, Sparkles, X } from 'lucide-react';
import { WikiArticle } from '../data/realWorldWiki';
import { renderInlineMarkup } from '../utils/inlineFormat';

interface RealWorldWikiModalProps {
  article: WikiArticle | null;
  onClose: () => void;
}

const TAG_STYLES: Record<
  WikiArticle['tag'],
  { bg: string; border: string; text: string }
> = {
  主线历史大案: {
    bg: 'bg-amber-950/75',
    border: 'border-gold-400/60',
    text: 'text-gold-200',
  },
  硅谷真实黑料: {
    bg: 'bg-indigo-950/75',
    border: 'border-indigo-400/60',
    text: 'text-indigo-200',
  },
  名场面梗百科: {
    bg: 'bg-sky-950/75',
    border: 'border-sky-400/60',
    text: 'text-sky-200',
  },
  真实失控事故: {
    bg: 'bg-rose-950/75',
    border: 'border-rose-400/60',
    text: 'text-rose-200',
  },
};

export const RealWorldWikiModal: React.FC<RealWorldWikiModalProps> = ({
  article,
  onClose,
}) => {
  if (!article) return null;
  const tagStyle = TAG_STYLES[article.tag];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[#04060c]/85 backdrop-blur-md flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 24, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 14, scale: 0.98, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="panel-gilded w-full max-w-md rounded-3xl overflow-hidden flex flex-col max-h-[86vh]"
      >
        {/* Header */}
        <div className="relative px-5 pt-4 pb-3 border-b border-gold-400/20 bg-gradient-to-b from-gold-500/[0.08] to-transparent shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭现实原型档案"
            className="absolute right-3.5 top-3.5 w-8 h-8 rounded-full flex items-center justify-center text-gold-200/70 hover:text-gold-100 hover:bg-white/10 cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-mono tracking-[0.22em] text-gold-300/85">
              <HelpCircle className="w-3.5 h-3.5 text-gold-300" />
              REAL-WORLD WIKI
            </span>
            <span
              className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${tagStyle.bg} ${tagStyle.border} ${tagStyle.text}`}
            >
              {article.tag}
            </span>
          </div>

          <h2 className="font-display text-[18px] font-black text-gilded leading-snug pr-7">
            {article.title}
          </h2>

          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-mono text-gold-200/65">
            <Calendar className="w-3 h-3 shrink-0 text-gold-300/80" />
            <span className="truncate">{article.timeline}</span>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 overflow-y-auto space-y-3.5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gold-200 tracking-wide">
              <BookOpenCheck className="w-3.5 h-3.5 text-gold-300" />
              <span>现实历史原型</span>
            </div>
            <p className="font-display text-[13.5px] leading-[1.85] text-parchment/92 text-justify bg-black/30 rounded-2xl p-3.5 border border-gold-400/15">
              {renderInlineMarkup(article.realEvent, 'wiki')}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-300 tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>沙箱卡牌彩蛋映射</span>
            </div>
            <p className="text-[12.5px] leading-[1.75] text-sky-100/85 bg-sky-950/30 rounded-2xl p-3 border border-sky-400/25">
              {renderInlineMarkup(article.inGameMapping, 'wiki')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gold-400/15 bg-black/30 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-gradient-to-b from-gold-200 to-gold-500 text-[#1a1206] font-bold text-[12.5px] tracking-wider shadow-[0_6px_22px_-6px_rgba(216,180,106,0.65)] cursor-pointer active:scale-[0.98] transition"
          >
            合上现实考据档案 · 继续决策
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
