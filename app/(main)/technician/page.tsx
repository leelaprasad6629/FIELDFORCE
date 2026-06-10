"use client";

import { PointerEvent, useRef, useState } from "react";
import ExpenseLogger from "@/components/ExpenseLogger";

const initialChecklist = [
  { label: "Inspect site entry and verify geofence", completed: true },
  { label: "Confirm customer identity via photo verification", completed: false },
  { label: "Begin maintenance tasks and log parts usage", completed: false },
  { label: "Complete signature verification and close job", completed: false },
];

export default function TechnicianPage() {
  const [checklist, setChecklist] = useState(initialChecklist);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const toggleChecklist = (index: number) => {
    setChecklist((current) =>
      current.map((item, idx) => (idx === index ? { ...item, completed: !item.completed } : item))
    );
  };

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = "#60a5fa";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(event.clientX - rect.left, event.clientY - rect.top);
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(event.clientX - rect.left, event.clientY - rect.top);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  const submitReport = () => {
    alert("Success! Report submitted with photo capture.");
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-surface2 p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.32em] text-violet-300">Technician workspace</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Personal task execution cockpit</h2>
        <p className="mt-2 text-sm text-slate-300">Your assigned tasks, verification forms, and expense capture are ready for next dispatch.</p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-violet-300">Assigned tasks</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">Your checklist</h3>
            </div>
            <div className="rounded-2xl bg-violet-500/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-violet-200">{checklist.filter((item) => item.completed).length}/4 completed</div>
          </div>

          <div className="mt-6 space-y-4">
            {checklist.map((item, index) => (
                <button
                key={item.label}
                type="button"
                onClick={() => toggleChecklist(index)}
                className={`flex w-full items-center gap-4 rounded-3xl border border-white/10 bg-surface p-4 text-left transition ${item.completed ? "opacity-80" : "hover:bg-white/5"}`}
              >
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl border ${item.completed ? "border-emerald-400 bg-emerald-500/15 text-emerald-300" : "border-slate-700 text-slate-300"}`}>
                  {item.completed ? "✓" : ""}
                </span>
                <p className={`text-sm ${item.completed ? "line-through text-slate-500" : "text-slate-200"}`}>{item.label}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-violet-500/5 p-5">
            <p className="text-sm uppercase tracking-[0.28em] text-violet-300">Digital signature pad</p>
            <p className="mt-2 text-sm text-slate-300">Capture a quick handwritten acknowledgment before submitting your report.</p>
            <div className="mt-4 overflow-hidden rounded-3xl border border-white/10 bg-slate-950 p-2">
              <canvas
                ref={canvasRef}
                width={780}
                height={220}
                className="h-44 w-full touch-none rounded-3xl bg-slate-900"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              />
            </div>
            <button
              type="button"
              onClick={submitReport}
              className="mt-5 rounded-3xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
            >
              Submit Report with Photo Capture
            </button>
          </div>
        </div>

        <ExpenseLogger />
      </section>
    </div>
  );
}
