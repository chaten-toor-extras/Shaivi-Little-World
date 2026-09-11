import type { ThreeElements } from "@react-three/fiber";
type Props = ThreeElements["mesh"] & { color?: string };
export function Box({ color = "#ede0c8", ...props }: Props) {
  return (
    <mesh castShadow receiveShadow {...props}>
      <boxGeometry />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  );
}
export function Ball({ color = "#90a779", ...props }: Props) {
  return (
    <mesh castShadow {...props}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color={color} roughness={0.75} flatShading />
    </mesh>
  );
}
export function Cylinder({ color = "#776046", ...props }: Props) {
  return (
    <mesh castShadow receiveShadow {...props}>
      <cylinderGeometry args={[1, 1, 1, 16]} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  );
}
