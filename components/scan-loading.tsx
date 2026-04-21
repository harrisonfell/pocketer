"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const STAGES = [
  "Reading 90 days of transactions",
  "Grouping the repeats",
  "Looking at what's worth it",
  "Finding cheaper swaps",
];

export function ScanLoading({ onDone }: { onDone: () => void }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const stepMs = 240;
    for (let i = 1; i < STAGES.length; i++) {
      timers.push(setTimeout(() => setStage(i), i * stepMs));
    }
    timers.push(setTimeout(onDone, STAGES.length * stepMs + 180));
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center px-8">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative mb-10 h-24 w-24"
      >
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-baltic/30 dark:border-icy/30"
          animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-baltic/40 dark:border-icy/40"
          animate={{ scale: [1, 1.25, 1], opacity: [0.9, 0, 0.9] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: 0.4 }}
        />
        <div className="absolute inset-[30%] rounded-full bg-baltic dark:bg-icy" />
      </motion.div>

      <p className="mb-1 text-micro text-baltic dark:text-icy">READING</p>
      <div className="h-6 w-full text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={stage}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="text-body text-ink-60 dark:text-snow-60"
          >
            {STAGES[stage]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
