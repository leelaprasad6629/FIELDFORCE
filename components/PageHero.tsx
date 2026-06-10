"use client";

import { motion } from "framer-motion";

export default function PageHero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mb-8"
    >
      <h1 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 max-w-3xl text-pretty leading-relaxed text-zinc-400">{subtitle}</p>
    </motion.div>
  );
}
