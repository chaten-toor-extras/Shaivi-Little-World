"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Group } from "three";
import { useIntentionalClick } from "@/utils/intentionalClick";
import { useQuoteTV } from "./QuoteTVContext";
import { TV_BUTTONS } from "./quoteTVConfig";
import { useCursor } from "@react-three/drei";
import { bindQuotePointerGuard, quotePointerGuard } from "./quotePointerGuard";
import { BroadcastText } from "./QuoteScreen3D";

function TVButton({ button }: { button: typeof TV_BUTTONS[number] }) {
  const tv = useQuoteTV();
  const group = useRef<Group>(null);
  const pressedUntil = useRef(0);
  const [hover, setHover] = useState(false);
  const gesture = useIntentionalClick();
  const enabled = !!tv?.interactive && (button.action === "power" || tv.canTune);
  useCursor(hover && enabled);
  useEffect(() => {
    if (!enabled) setHover(false);
  }, [enabled]);
  useFrame(() => {
    if (group.current) group.current.position.z = enabled && !tv?.reducedMotion && performance.now() < pressedUntil.current ? -0.018 : 0;
  });
  return <group position={[0.8, button.y, 0.25]}>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[button.action === "power" ? 0.060 : 0.099, button.action === "power" ? 0.060 : 0.099, 0.018, 48]} />
      <meshStandardMaterial color="#514d40" roughness={0.55} />
    </mesh>
    <group ref={group}>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.012]}>
        <cylinderGeometry args={[button.action === "power" ? 0.048 : 0.081, button.action === "power" ? 0.048 : 0.084, 0.045, 48]} />
        <meshStandardMaterial color={hover ? "#f4e5c6" : enabled || !tv?.focused ? "#d3c2a3" : "#9d917c"} roughness={0.48} />
      </mesh>
      <mesh position={[0, 0, 0.036]}><torusGeometry args={[button.action === "power" ? 0.041 : 0.072, 0.003, 6, 48]} /><meshStandardMaterial color="#b4a080" /></mesh>
      {/* Marks on the existing knobs: directional triangles and a power ring. */}
      <mesh position={[0, 0, 0.038]} rotation={[0, 0, button.action === "previous" ? Math.PI : 0]}>
        {button.action === "power" ? <ringGeometry args={[0.016, 0.021, 20]} /> : <circleGeometry args={[0.024, 3]} />}
        <meshBasicMaterial color="#3d4540" toneMapped={false} />
      </mesh>
      {button.action === "power" && <mesh position={[0, 0.018, 0.039]}><planeGeometry args={[0.004, 0.025]} /><meshBasicMaterial color="#3d4540" toneMapped={false} /></mesh>}
    </group>
    <group position={[0, button.action === "power" ? -0.076 : -0.112, 0.002]}><BroadcastText small width={0.21} height={0.023} color="#eadbc0" text={button.label} /></group>
    {button.action === "power" && <mesh position={[0.092, 0, 0.008]}><sphereGeometry args={[0.011, 12, 8]} /><meshBasicMaterial color={tv?.on && tv.focused ? "#b8d59a" : "#5a4a3b"} toneMapped={false} /></mesh>}
    {enabled && <mesh position={[0, 0, 0.075]}
      onPointerDown={(e) => { e.stopPropagation(); gesture.handlePointerDown(e); }}
      onPointerMove={gesture.handlePointerMove}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
      onPointerOut={() => setHover(false)}
      onClick={(e) => {
        e.stopPropagation();
        if (!quotePointerGuard.allows(performance.now()) || !gesture.isIntentionalClick(e)) return;
        pressedUntil.current = performance.now() + 150;
        if (button.action === "power") tv.toggle();
        else tv[button.action]();
      }}>
      <boxGeometry args={[0.27, button.action === "power" ? 0.17 : 0.215, 0.06]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>}
  </group>;
}

export default function TVControls3D() {
  const { gl } = useThree();
  useEffect(() => bindQuotePointerGuard(gl.domElement), [gl]);
  return <group>{TV_BUTTONS.map((button) => <TVButton key={button.action} button={button} />)}</group>;
}
