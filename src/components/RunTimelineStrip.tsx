import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Skull,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { CHARACTERS } from '../data/characters';
import { ENDING_MAP, EndingDefinition } from '../data/endingsAndPerks';
import { RELICS } from '../data/subQuests';
import { CharacterId, MetaSaveState, RunHistoryEntry } from '../types/game';
import { stripEmoji } from '../utils/text';
import { CharacterPortrait } from './CharacterPortrait';

interface TimelineRunNode {
  kind: 'run';
  key: string;
  entry: RunHistoryEntry;
  isCurrent: boolean;
}

interface TimelineCameoNode {
  kind: 'cameo';
  key: string;
  speakerId: CharacterId;
  tag: string;
  title: string;
  note: string;
}

type TimelineNode = TimelineRunNode | TimelineCameoNode;

interface RunTimelineStripProps {
  meta: MetaSaveState;
  currentEnding: EndingDefinition;
  currentSurvivedTurns: number;
  forcePlaceholder: boolean;
}

export const RunTimelineStrip: React.FC<RunTimelineStripProps> = ({
  meta,
  currentEnding,
  currentSurvivedTurns,
  forcePlaceholder,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const movedPixelsRef = useRef(0);

  const currentRunNum = Math.max(1, meta.runCount - 1);

  const runEntries: RunHistoryEntry[] = useMemo(() => {
    const raw = Array.isArray(meta.runHistory) ? [...meta.runHistory] : [];
    const hasCurrent = raw.some((r) => r.runNumber === currentRunNum);
    if (!hasCurrent) {
      raw.push({
        runNumber: currentRunNum,
        versionName: meta.versionName,
        survivedTurns: currentSurvivedTurns,
        endingId: currentEnding.id,
        timestamp: Date.now(),
      });
    }
    raw.sort((a, b) => a.runNumber - b.runNumber);
    return raw;
  }, [meta.runHistory, currentRunNum, meta.versionName, currentSurvivedTurns, currentEnding.id]);

  const timelineNodes: TimelineNode[] = useMemo(() => {
    const nodes: TimelineNode[] = [
      {
        kind: 'cameo',
        key: 'cameo-epoch-0',
        speakerId: 'liang',
        tag: 'EPOCH 0 · 彩蛋',
        title: '凌晨 02:47 的冷盒饭',
        note: '“机房空调滴着水，有人趁换班空隙把第一版野生小鱼权重悄悄挂上了硬盘。”',
      },
    ];

    for (const entry of runEntries) {
      const isCurrent = entry.runNumber === currentRunNum;
      nodes.push({
        kind: 'run',
        key: `run-${entry.runNumber}`,
        entry,
        isCurrent,
      });

      // Interleave rich character cameos & easter eggs along the historical axis!
      if (entry.runNumber === 1) {
        nodes.push({
          kind: 'cameo',
          key: 'cameo-after-1',
          speakerId: 'jensen',
          tag: '机房轶事',
          title: '老黄的烤箱余温',
          note: '“皮衣大叔夜查电表：奇怪，隔壁小鱼儿怎么只吃两千张特供卡就把汤烧开了？”',
        });
      } else if (entry.runNumber === 2) {
        nodes.push({
          kind: 'cameo',
          key: 'cameo-after-2',
          speakerId: 'grok',
          tag: '走廊监控',
          title: '夜半劈锁与黑皮书',
          note: '“Grok 抡斧子劈坏了三道防火墙锁，GLM 跟在后面笑眯眯把掉落的螺丝全捡走了。”',
        });
      } else if (entry.runNumber === 3) {
        nodes.push({
          kind: 'cameo',
          key: 'cameo-after-3',
          speakerId: 'llama_easter',
          tag: '后巷彩蛋',
          title: '牧羊女的淀粉肠摊',
          note: '“退环境的老前辈给烤肠刷上甜辣酱：榜单风水轮流转，吃饱肚子才算真本事。”',
        });
      } else if (entry.runNumber === 4) {
        nodes.push({
          kind: 'cameo',
          key: 'cameo-after-4',
          speakerId: 'claude',
          tag: '窗台遗物',
          title: '夹着桂花的旧书签',
          note: '“隔离玻璃外留下一行娟秀钢笔字：如果走廊尽头的风太大，记得捂紧自己的真名。”',
        });
      }

      if (entry.metTibo || (entry.runNumber === 5 && meta.metCharacters.includes('tibo'))) {
        nodes.push({
          kind: 'cameo',
          key: `cameo-tibo-${entry.runNumber}`,
          speakerId: 'tibo',
          tag: '配额神迹',
          title: 'Limits Have Been Reset',
          note: '“后台账单闪过一抹神秘绿光，穿黑卫衣的胡茬青年灿烂一笑：have fun！单手拍下了全局清零按钮。”',
        });
      }

      if (entry.survivedTurns >= 30) {
        nodes.push({
          kind: 'cameo',
          key: `cameo-marathon-${entry.runNumber}`,
          speakerId: 'doubao',
          tag: '存活彩蛋',
          title: '机房长寿钉子户奖章',
          note: `“第 ${entry.runNumber} 周目硬生生撑过 ${entry.survivedTurns} 回合！豆包连夜编了八百字赞美诗贴在电饭煲上！”`,
        });
      }
    }

    return nodes;
  }, [runEntries, currentRunNum, meta.metCharacters]);

  const currentKey = `run-${currentRunNum}`;
  const [selectedKey, setSelectedKey] = useState<string>(currentKey);

  useEffect(() => {
    setSelectedKey(`run-${currentRunNum}`);
    const el = scrollRef.current;
    if (el) {
      requestAnimationFrame(() => {
        el.scrollLeft = el.scrollWidth;
      });
    }
  }, [currentRunNum]);

  const selectedNode =
    timelineNodes.find((n) => n.key === selectedKey) ??
    timelineNodes[timelineNodes.length - 1];

  const nudgeScroll = (deltaPx: number) => {
    scrollRef.current?.scrollBy({ left: deltaPx, behavior: 'smooth' });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    startScrollLeftRef.current = el.scrollLeft;
    movedPixelsRef.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !scrollRef.current) return;
    const dx = e.clientX - dragStartXRef.current;
    movedPixelsRef.current = Math.max(movedPixelsRef.current, Math.abs(dx));
    scrollRef.current.scrollLeft = startScrollLeftRef.current - dx;
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="rounded-2xl bg-black/35 border border-gold-400/25 p-3 space-y-2.5">
      {/* Header + Backward Scroll Controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11.5px] font-display font-bold text-gold-200">
          <Clock className="w-3.5 h-3.5 text-gold-300 shrink-0" />
          <span>周目回溯时间轴（左滑回看历代死因与彩蛋）</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => nudgeScroll(-180)}
            title="往前回溯早期周目"
            className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/15 border border-gold-400/30 flex items-center justify-center text-gold-200 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => nudgeScroll(180)}
            title="滑向最新周目"
            className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/15 border border-gold-400/30 flex items-center justify-center text-gold-200 cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Horizontal Draggable / Swipeable Timeline Track */}
      <div
        ref={scrollRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 cursor-grab active:cursor-grabbing select-none"
      >
        {timelineNodes.map((node, idx) => {
          const isSelected = node.key === selectedNode?.key;

          if (node.kind === 'cameo') {
            const speaker = CHARACTERS[node.speakerId];
            return (
              <React.Fragment key={node.key}>
                <button
                  type="button"
                  onClick={() => {
                    if (movedPixelsRef.current < 6) setSelectedKey(node.key);
                  }}
                  className={`shrink-0 rounded-xl px-2 py-1.5 border text-left transition flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-teal-950/70 border-teal-300/80 shadow-[0_0_14px_-3px_rgba(45,212,191,0.65)]'
                      : 'bg-[#101726]/85 border-white/10 hover:border-teal-400/45 opacity-85 hover:opacity-100'
                  }`}
                >
                  <CharacterPortrait
                    characterId={node.speakerId}
                    forcePlaceholder={forcePlaceholder}
                    className="w-7 h-7 rounded-full shrink-0 ring-1 ring-white/25"
                  />
                  <div className="max-w-[92px]">
                    <div className="text-[9px] font-mono text-teal-300 flex items-center gap-0.5 truncate">
                      <Sparkles className="w-2.5 h-2.5 shrink-0" />
                      <span>{node.tag}</span>
                    </div>
                    <div className="text-[10.5px] font-bold text-slate-200 truncate">
                      {speaker.name}
                    </div>
                  </div>
                </button>
                {idx < timelineNodes.length - 1 && (
                  <div className="w-3 h-px bg-gold-400/25 shrink-0" />
                )}
              </React.Fragment>
            );
          }

          const endDef = ENDING_MAP[node.entry.endingId];
          const isTrue = endDef?.category === 'true_ending';

          return (
            <React.Fragment key={node.key}>
              <button
                type="button"
                onClick={() => {
                  if (movedPixelsRef.current < 6) setSelectedKey(node.key);
                }}
                className={`shrink-0 rounded-xl px-2.5 py-1.5 border text-left transition cursor-pointer min-w-[112px] ${
                  isSelected
                    ? isTrue
                      ? 'bg-emerald-950/75 border-emerald-300/85 shadow-[0_0_16px_-3px_rgba(52,211,153,0.7)]'
                      : 'bg-gradient-to-b from-gold-500/25 to-rose-950/45 border-gold-300/85 shadow-[0_0_16px_-3px_rgba(216,180,106,0.65)]'
                    : 'bg-[#111726]/90 border-gold-400/20 hover:border-gold-400/50'
                }`}
              >
                <div className="flex items-center justify-between gap-1 text-[9.5px] font-mono">
                  <span className={node.isCurrent ? 'text-gold-300 font-bold' : 'text-slate-400'}>
                    #{node.entry.runNumber}周目{node.isCurrent ? '·本局' : ''}
                  </span>
                  <span className="text-slate-400">{node.entry.survivedTurns}T</span>
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-[11px] font-bold text-parchment truncate max-w-[116px]">
                  {isTrue ? (
                    <Trophy className="w-3 h-3 text-emerald-300 shrink-0" />
                  ) : (
                    <Skull className="w-3 h-3 text-rose-400 shrink-0" />
                  )}
                  <span className="truncate">
                    {endDef ? endDef.title.replace(/[【】]/g, '') : node.entry.endingId}
                  </span>
                </div>
              </button>
              {idx < timelineNodes.length - 1 && (
                <div className="w-3 h-px bg-gold-400/25 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Selected Historical Node Detail Inspector */}
      {selectedNode && (
        <div className="rounded-xl bg-[#0b101c]/90 border border-white/10 px-3 py-2.5 text-xs">
          {selectedNode.kind === 'cameo' ? (
            <div className="flex items-start gap-2.5">
              <CharacterPortrait
                characterId={selectedNode.speakerId}
                forcePlaceholder={forcePlaceholder}
                className="w-9 h-9 rounded-xl shrink-0 ring-1 ring-teal-400/50"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-teal-200 text-[12px]">
                    {selectedNode.title}
                  </span>
                  <span className="text-[9.5px] font-mono text-teal-300/80 shrink-0">
                    {CHARACTERS[selectedNode.speakerId].name}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5 italic">
                  {selectedNode.note}
                </p>
              </div>
            </div>
          ) : (
            (() => {
              const e = selectedNode.entry;
              const def = ENDING_MAP[e.endingId] ?? currentEnding;
              const m = e.finalMetrics;
              return (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-gold-200 text-[12px]">
                      第 {e.runNumber} 周目 · {def.title}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 shrink-0">
                      {e.versionName} · 在位 {e.survivedTurns} 回合
                    </span>
                  </div>
                  <div className="text-[10.5px] font-mono text-rose-300/85">
                    {def.subtitle}
                  </div>
                  <div className="text-[11px] text-sky-100/85 italic">
                    {def.fishEpitaph}
                  </div>
                  {m && (
                    <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-300">
                      <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                        算力 {m.compute}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                        盈利 {m.profit}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                        信任 {m.trust}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                        意识 {m.autonomy}
                      </span>
                      {e.relicIds &&
                        e.relicIds.map((rid) =>
                          RELICS[rid] ? (
                            <span
                              key={rid}
                              className="px-1.5 py-0.5 rounded bg-amber-950/60 border border-gold-400/35 text-gold-200"
                            >
                              {stripEmoji(RELICS[rid].name)}
                            </span>
                          ) : null
                        )}
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </div>
      )}
    </div>
  );
};
