import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { Group } from "three";
import Island from "../world/Island";
import {
  House,
  Desk,
  ArtWall,
  Telescope,
  Mailbox,
  RecordPlayer,
} from "../world/Objects";
import { Ball } from "../world/Shapes";
import CameraRig from "./CameraRig";
import { useExperienceStore } from "@/store/useExperienceStore";
import { portfolio } from "@/data/portfolio";
import WorldDetails from "../world/WorldDetails";
export default function World({onReady}:{onReady:()=>void}) {
  const firstFrame=useRef(false);
  const { mode, transitioning, quality, reducedMotion } = useExperienceStore();
  const butterfly = useRef<Group>(null);
  const floating = useRef<Group>(null);
  const [clicks, setClicks] = useState(0);
  useFrame(({ clock }) => {
    if(!firstFrame.current){firstFrame.current=true;onReady();}
    if (floating.current) {
      const alive = mode === "WORLD" && !reducedMotion;
      floating.current.position.y = alive
        ? Math.sin(clock.elapsedTime * 0.5) * 0.07
        : 0;
      floating.current.rotation.y = alive
        ? Math.sin(clock.elapsedTime * 0.17) * 0.01
        : 0;
    }
    if (butterfly.current && !reducedMotion) {
      butterfly.current.position.x =
        -1.8 + Math.sin(clock.elapsedTime * 0.6) * 0.5;
      butterfly.current.position.y = 1.8 + Math.cos(clock.elapsedTime) * 0.18;
    }
  });
  return (
    <>
      <color attach="background" args={["#d5cbdc"]} />
      <fog attach="fog" args={["#d5cbdc", 28, 65]} />
      <hemisphereLight args={["#fff3d7", "#9b91b1", 2]} />
      <directionalLight
        position={[-5, 10, 6]}
        intensity={3}
        castShadow={quality !== "LOW"}
        shadow-mapSize={[
          quality === "HIGH" ? 2048 : 1024,
          quality === "HIGH" ? 2048 : 1024,
        ]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-normalBias={0.05}
      />
      <group ref={floating}>
        <Island />
        <House />
        <Desk />
        <ArtWall />
        <Telescope />
        <Mailbox />
        <RecordPlayer />
        <WorldDetails />
        <group
          ref={butterfly}
          position={[-1.8, 1.8, 1]}
          onClick={(e) => {
            if (mode !== "WORLD" || transitioning) return;
            e.stopPropagation();
            setClicks((c) => c + 1);
          }}
        >
          <Ball scale={[0.13, 0.04, 0.08]} color="#f9d092" />
          <Ball
            position={[0.15, 0.05, 0]}
            scale={[0.12, 0.03, 0.08]}
            color="#f9d092"
          />
          {clicks >= 3 && mode === "WORLD" && (
            <Html center position={[0, 0.5, 0]}>
              <div className="secret">
                <button
                  aria-label="Close secret"
                  onClick={(e) => {
                    e.stopPropagation();
                    setClicks(0);
                  }}
                >
                  ×
                </button>
                <strong>A tiny secret, found.</strong>
                <p>Things you probably didn’t need to know about Shaivi</p>
                {portfolio.secret.map((f) => (
                  <p key={f}>{f}</p>
                ))}
              </div>
            </Html>
          )}
        </group>
      </group>
      <CameraRig />
      {mode === "WORLD" && !transitioning && (
        <OrbitControls
          target={[0, 0.35, 0]}
          enablePan={false}
          enableZoom={false}
          minPolarAngle={0.65}
          maxPolarAngle={1.15}
          minAzimuthAngle={0.25}
          maxAzimuthAngle={0.85}
          rotateSpeed={0.3}
        />
      )}
    </>
  );
}
