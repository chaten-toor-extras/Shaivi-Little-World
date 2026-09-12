"use client";

import { RoundedBox } from "@react-three/drei";
import { Box } from "../Shapes";
import { BroadcastText } from "./QuoteScreen3D";

/** Rounded cabinet and recessed CRT trim on the island's existing television. */
export default function TVCabinet3D() {
  return <group>
    <RoundedBox position={[0.15, 1.4, -0.015]} args={[1.72, 1.02, 0.4]} radius={0.065} smoothness={4} castShadow receiveShadow>
      <meshStandardMaterial color="#806d57" roughness={0.68} />
    </RoundedBox>
    <RoundedBox position={[0.15, 1.4, 0.18]} args={[1.66, 0.96, 0.035]} radius={0.05} smoothness={4}>
      <meshStandardMaterial color="#b29b77" roughness={0.65} />
    </RoundedBox>
    <RoundedBox position={[0.15, 1.4, 0.20]} args={[1.62, 0.92, 0.035]} radius={0.045} smoothness={4}>
      <meshStandardMaterial color="#806d57" roughness={0.76} />
    </RoundedBox>
    <RoundedBox position={[0, 1.4, 0.219]} args={[1.28, 0.85, 0.1]} radius={0.07} smoothness={5}>
      <meshStandardMaterial color="#454a3f" roughness={0.36} />
    </RoundedBox>
    <RoundedBox position={[0, 1.4, 0.255]} args={[1.17, 0.74, 0.025]} radius={0.07} smoothness={5}>
      <meshStandardMaterial color="#a9ad94" metalness={0.22} roughness={0.38} />
    </RoundedBox>
    {[-0.49, 0.68].map((x) => <Box key={x} position={[x, 0.88, -0.005]} scale={[0.17, 0.08, 0.25]} color="#5c5547" />)}
    {Array.from({ length: 7 }, (_, i) => <Box key={i} position={[0.8, 1.235 + i * 0.012, 0.224]} scale={[0.21, 0.004, 0.008]} color="#4d4b3f" />)}
    <group position={[0.8, 0.972, 0.228]}>
      <BroadcastText small width={0.26} height={0.03} color="#eadbc0" text="LITTLE WORLD" />
    </group>
    <group position={[0, 0.945, 0.223]}>
      <BroadcastText small width={0.74} height={0.024} color="#eadbc0" text="QUIET FREQUENCIES · COLOUR TELEVISION" />
    </group>
  </group>;
}
