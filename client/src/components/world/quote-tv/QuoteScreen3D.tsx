"use client";

import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { CanvasTexture, Group, MeshBasicMaterial, SRGBColorSpace, Shape } from "three";
import { useQuoteTV } from "./QuoteTVContext";
import { SCREEN_CENTER } from "./quoteTVConfig";
import { quotePointerGuard } from "./quotePointerGuard";

// A screen-local texture remains visible if the text worker/font cannot load.
// It uses system fonts and never becomes a DOM card or a second television.
function TextFallback({ text, width, height, color }: { text: string; width: number; height: number; color: string }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024; canvas.height = Math.max(64, Math.round(1024 * height / width));
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = color; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const lines: string[] = [];
    let line = "";
    ctx.font = "36px Georgia, serif";
    for (const char of Array.from(text)) {
      if (char === "\n" || ctx.measureText(line + char).width > 950) {
        lines.push(line); line = char === "\n" ? "" : char;
      } else line += char;
    }
    lines.push(line);
    const spacing = Math.min(64, (canvas.height - 12) / lines.length);
    ctx.font = `${Math.min(36, spacing * 0.8)}px Georgia, serif`;
    lines.forEach((value, i) => ctx.fillText(value, 512, canvas.height / 2 + (i - (lines.length - 1) / 2) * spacing));
    const result = new CanvasTexture(canvas); result.colorSpace = SRGBColorSpace;
    return result;
  }, [text, width, height, color]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh><planeGeometry args={[width, height]} />
    <meshBasicMaterial map={texture} transparent toneMapped={false} depthWrite={false} />
  </mesh>;
}

class TextBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function ScreenGlass() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 8; canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "rgba(69,74,63,0.045)";
    for (let y = 0; y < 256; y += 4) ctx.fillRect(0, y, 8, 1);
    return new CanvasTexture(canvas);
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return <group position={[0, 0, 0.004]}>
    <mesh><planeGeometry args={[1.01, 0.58]} /><meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} /></mesh>
    <mesh position={[0, 0.317, 0]}><planeGeometry args={[0.87, 0.009]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.14} depthWrite={false} toneMapped={false} /></mesh>
  </group>;
}

export function BroadcastText({ text, small = false, width = 0.96, height = small ? 0.04 : 0.37, color = "#454a3f" }: { text: string; small?: boolean; width?: number; height?: number; color?: string }) {
  const [ready, setReady] = useState(false);
  const fallback = <TextFallback text={text} width={width} height={height} color={color} />;
  return <group>
    {!ready && fallback}
    <TextBoundary fallback={null}><Suspense fallback={null}>
    <Text visible={ready} font={small ? undefined : "/fonts/Italiana-Regular.ttf"} fontSize={small ? Math.min(0.026, height * 0.8) : text.length < 65 ? 0.092 : text.length < 120 ? 0.078 : 0.067}
      maxWidth={width} lineHeight={1.18} textAlign="center" anchorX="center" anchorY="middle"
      overflowWrap="break-word" color={color} material-toneMapped={false}
      onSync={(mesh) => {
        const bounds = mesh.geometry.boundingBox;
        if (!bounds) return;
        const scale = Math.min(1, height / Math.max(0.001, bounds.max.y - bounds.min.y),
          width / Math.max(0.001, bounds.max.x - bounds.min.x));
        mesh.scale.setScalar(scale);
        setReady(true);
      }}>
      {text}
    </Text>
  </Suspense></TextBoundary></group>;
}

export default function QuoteScreen3D() {
  const tv = useQuoteTV();
  const screen = useRef<Group>(null);
  const broadcast = useRef<Group>(null);
  const glow = useRef<MeshBasicMaterial>(null);
  const level = useRef(0);
  const transition = useRef({ elapsed: 1, out: false });
  const text = tv?.isLoading ? "Tuning in…" : tv?.quote ? tv.pageText : "Nothing on air yet.";
  const key = `${tv?.index}-${tv?.page}-${text}`;
  const author = tv?.quote?.author?.trim();
  const category = tv?.quote?.category?.trim();
  const [display, setDisplay] = useState({ text, key, author, category });
  const shape = useMemo(() => {
    const s = new Shape(), x = -0.562, y = -0.348, w = 1.124, h = 0.696, r = 0.06;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }, []);
  const on = tv?.power === "ON" || tv?.power === "POWERING_ON";
  const fadeDuration = tv?.reducedMotion ? 45 : 150;
  useEffect(() => {
    transition.current = { elapsed: 0, out: true };
    const timer = setTimeout(() => {
      setDisplay({ text, key, author, category });
      transition.current = { elapsed: 0, out: false };
    }, on ? fadeDuration : 0);
    return () => clearTimeout(timer);
  }, [key, text, author, category, on, fadeDuration]);
  useFrame((_, dt) => {
    if (!tv || !screen.current || !broadcast.current || !glow.current) return;
    level.current = Math.min(1, Math.max(0, level.current + (on ? 1 : -1) * dt / (tv.reducedMotion ? 0.09 : 0.42)));
    screen.current.visible = level.current > 0;
    screen.current.scale.y = tv.reducedMotion ? 1 : Math.max(0.004, level.current);
    glow.current.opacity = level.current;
    transition.current.elapsed += dt;
    const fade = Math.min(1, transition.current.elapsed / (fadeDuration / 1000));
    const opacity = (transition.current.out ? 1 - fade : fade) * level.current;
    broadcast.current.visible = on;
    broadcast.current.traverse((object) => {
      const material = (object as unknown as { material?: MeshBasicMaterial }).material;
      if (material) { material.transparent = true; material.opacity = opacity; }
    });
  });
  if (!tv?.enabled) return null;
  return <group position={SCREEN_CENTER}>
    <mesh><shapeGeometry args={[shape]} /><meshStandardMaterial color="#303c35" roughness={0.22} metalness={0.2} /></mesh>
    <group ref={screen} position={[0, 0, 0.001]}>
      <mesh><shapeGeometry args={[shape]} /><meshBasicMaterial ref={glow} color="#dadbc2" transparent toneMapped={false} /></mesh>
      <group ref={broadcast} position={[0, 0, 0.002]}>
        <group position={[-0.36, 0.283, 0]}><BroadcastText small width={0.27} text={`CH ${tv.total ? String(tv.index + 1).padStart(2, "0") : "—"}`} /></group>
        <group position={[0.35, 0.283, 0]}><BroadcastText small width={0.29} text={tv.isLoading ? "TUNING IN" : tv.total ? "● ON AIR" : "OFF AIR"} /></group>
        <mesh position={[0, 0.245, 0]}><planeGeometry args={[0.98, 0.0015]} /><meshBasicMaterial color="#89927b" transparent opacity={0.4} toneMapped={false} /></mesh>
        <BroadcastText key={display.key} text={display.text} />
        <group position={[0, -0.228, 0]}><BroadcastText small width={0.94} height={0.035} text={[display.category?.toUpperCase(), display.author ? `— ${display.author}` : undefined].filter(Boolean).join("   ")} /></group>
        <group position={[0, -0.293, 0]}>
          <BroadcastText small width={0.93} height={0.025} text={tv.pages.length > 1 ? `${tv.index + 1} / ${tv.total}     ·     PAGE ${tv.page + 1} / ${tv.pages.length} — TAP TO READ ON` : `${tv.total ? tv.index + 1 : 0} / ${tv.total}     ·     NO BREAKING NEWS. JUST PASSING THOUGHTS.`} />
        </group>
      </group>
      <ScreenGlass />
    </group>
    {tv.interactive && tv.on && tv.pages.length > 1 && <mesh position={[0, 0, 0.005]}
      onClick={(e) => { e.stopPropagation(); if (e.delta < 6 && quotePointerGuard.allows(performance.now())) tv.turnPage(tv.pages.length); }}>
      <planeGeometry args={[1.1, 0.68]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>}
  </group>;
}
