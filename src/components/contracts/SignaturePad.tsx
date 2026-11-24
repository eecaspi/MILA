"use client";

import { useEffect, useRef, useState } from "react";

export function SignaturePad({ name }: { name: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    c.width = c.clientWidth * ratio;
    c.height = c.clientHeight * ratio;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1a1a1a";
  }, []);

  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = e.currentTarget.getContext("2d");
    if (!ctx) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const p = point(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + 0.01, p.y + 0.01);
    ctx.stroke();
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = e.currentTarget.getContext("2d");
    if (!ctx) return;
    const p = point(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  function end() {
    if (!drawing.current) return;
    drawing.current = false;
    if (canvas.current) setValue(canvas.current.toDataURL("image/png"));
  }

  function clear() {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.restore();
    setValue("");
  }

  return (
    <div className="space-y-2">
      <span className="block text-sm font-semibold text-ink">חתימה ביד (לא חובה)</span>
      <canvas
        ref={canvas}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        aria-label="אזור לציור חתימה באצבע או בעכבר"
        className="h-40 w-full cursor-crosshair rounded-xl border border-dashed border-line bg-white"
        style={{ touchAction: "none" }}
      />
      <input type="hidden" name={name} value={value} />
      <button type="button" onClick={clear} className="text-sm font-semibold text-accent underline">
        נקי וצייר מחדש
      </button>
    </div>
  );
}
