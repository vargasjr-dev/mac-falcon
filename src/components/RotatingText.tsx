"use client";
import { useState, useEffect } from "react";

const TEXTS = ["Vellum Assistant", "OpenClaw", "Hermes Agent"];
const HOLD_MS = 2000;
const FADE_MS = 380;

export default function RotatingText() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hold = setTimeout(() => {
      setVisible(false);
      const swap = setTimeout(() => {
        setIndex((i) => (i + 1) % TEXTS.length);
        setVisible(true);
      }, FADE_MS);
      return () => clearTimeout(swap);
    }, HOLD_MS);
    return () => clearTimeout(hold);
  }, [index]);

  return (
    <span
      className="inline-block bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent falcon-text-glow"
      style={{
        transition: `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-10px)",
      }}
    >
      {TEXTS[index]}
    </span>
  );
}
