import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Group, Mesh } from "three";
import { Box, Ball, Cylinder } from "./Shapes";
import { useExperienceStore } from "@/store/useExperienceStore";
import { labels, type Section } from "@/data/portfolio";
import { ProjectsContent } from "@/components/ui/Content";
function ObjectLink({
  section,
  position,
  labelHeight = 2,
  children,
}: {
  section: Section;
  position: [number, number, number];
  labelHeight?: number;
  children: React.ReactNode;
}) {
  const [hover, setHover] = useState(false);
  const mode = useExperienceStore((s) => s.mode),
    busy = useExperienceStore((s) => s.transitioning),
    open = useExperienceStore((s) => s.open);
  const active = mode === "WORLD" && !busy;
  return (
    <group
      position={position}
      onPointerOver={(e) => {
        if (active) {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = "pointer";
        }
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        if (active) {
          e.stopPropagation();
          document.body.style.cursor = "auto";
          setHover(false);
          open(section);
        }
      }}
    >
      <group scale={hover ? 1.035 : 1}>{children}</group>
      {active && (
        <Html center position={[0, labelHeight, 0]} zIndexRange={[20, 10]}>
          <button
            className={`world-label ${hover ? "hovered" : ""}`}
            onClick={() => {
              setHover(false);
              document.body.style.cursor = "auto";
              open(section);
            }}
          >
            <span>
              {section === "PROJECTS"
                ? "✳"
                : section === "ABOUT"
                  ? "⌂"
                  : section === "GALLERY"
                    ? "▧"
                    : section === "JOURNEY"
                      ? "✧"
                      : section === "CONTACT"
                        ? "✉"
                        : "♫"}
            </span>
            {labels[section]}
          </button>
        </Html>
      )}
    </group>
  );
}
export function House() {
  const door = useRef<Group>(null);
  const mode = useExperienceStore((s) => s.mode);
  useFrame((_, dt) => {
    if (door.current)
      door.current.rotation.y +=
        ((mode === "ABOUT" ? -1.3 : 0) - door.current.rotation.y) *
        Math.min(dt * 5, 1);
  });
  return (
    <ObjectLink section="ABOUT" position={[0, 0.15, -1.1]} labelHeight={3.2}>
      <Box position={[0, 1, 0]} scale={[2.1, 1.9, 1.65]} color="#e9cfaa" />
      <mesh position={[0, 2.35, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.85, 1.15, 4]} />
        <meshStandardMaterial color="#b46d57" roughness={1} />
      </mesh>
      <Box
        position={[0.65, 2.65, -0.3]}
        scale={[0.3, 0.85, 0.32]}
        color="#b38671"
      />
      <Box position={[0, 0.1, 1]} scale={[1.1, 0.15, 0.55]} color="#e1d4b9" />
      <group ref={door} position={[-0.32, 0.75, 0.84]}>
        <Box position={[0.3, 0, 0]} scale={[0.6, 1.4, 0.08]} color="#75877a" />
        <Ball position={[0.5, 0, 0.07]} scale={0.04} color="#e5ba6d" />
      </group>
      {[-0.75, 0.75].map((x) => (
        <group key={x} position={[x, 1.1, 0.84]}>
          <Box scale={[0.48, 0.55, 0.07]} color="#fcdf9e" />
          <Box scale={[0.04, 0.62, 0.1]} color="#a98168" />
          <Box scale={[0.54, 0.04, 0.1]} color="#a98168" />
          <Box
            position={[0, -0.35, 0.1]}
            scale={[0.63, 0.16, 0.25]}
            color="#b67860"
          />
          <Ball position={[0, -0.22, 0.12]} scale={[0.3, 0.15, 0.16]} />
        </group>
      ))}
    </ObjectLink>
  );
}
export function Desk() {
  const mode = useExperienceStore((s) => s.mode),
    busy = useExperienceStore((s) => s.transitioning);
  return (
    <ObjectLink
      section="PROJECTS"
      position={[1.4, 0.12, 2.1]}
      labelHeight={2.1}
    >
      <Box position={[0, 0.78, 0]} scale={[1.8, 0.13, 0.8]} color="#b89372" />
      {[-0.75, 0.75].flatMap((x) =>
        [-0.28, 0.28].map((z) => (
          <Box
            key={`${x}${z}`}
            position={[x, 0.38, z]}
            scale={[0.08, 0.76, 0.08]}
            color="#786756"
          />
        )),
      )}
      <Box position={[0, 1.4, 0]} scale={[1.25, 0.83, 0.1]} color="#4a5555" />
      <Box
        position={[0, 1.4, 0.061]}
        scale={[1.13, 0.7, 0.025]}
        color={mode === "PROJECTS" ? "#efe9df" : "#a7b8b3"}
      />
      <Box position={[0, 0.97, 0]} scale={[0.1, 0.3, 0.1]} color="#5b615b" />
      <Box
        position={[0, 0.85, 0.02]}
        scale={[0.5, 0.03, 0.27]}
        color="#5b615b"
      />
      <Box
        position={[0, 0.86, 0.25]}
        scale={[0.65, 0.025, 0.2]}
        color="#e4ded0"
      />
      <Ball
        position={[0.5, 0.86, 0.25]}
        scale={[0.07, 0.03, 0.09]}
        color="#e6dfd0"
      />
      <Cylinder
        position={[-0.68, 0.96, 0.05]}
        scale={[0.1, 0.23, 0.1]}
        color="#e0b89b"
      />
      <Box
        position={[0.5, 0.96, -0.2]}
        scale={[0.24, 0.2, 0.16]}
        color="#bca175"
      />
      {mode === "PROJECTS" && !busy && (
        <Html
          transform
          position={[0, 1.4, 0.084]}
          distanceFactor={1}
          zIndexRange={[60, 50]}
        >
          <div id="monitor-content" className="monitor-interface">
            <ProjectsContent />
          </div>
        </Html>
      )}
    </ObjectLink>
  );
}
export function ArtWall() {
  return (
    <ObjectLink
      section="GALLERY"
      position={[-2.8, 0.12, -0.3]}
      labelHeight={2.4}
    >
      <Box position={[0, 1.2, 0]} scale={[1.1, 1.45, 0.1]} color="#a88364" />
      <Box
        position={[0, 1.2, 0.07]}
        scale={[0.94, 1.28, 0.03]}
        color="#f2d9b8"
      />
      <Ball
        position={[-0.1, 1.43, 0.1]}
        scale={[0.28, 0.28, 0.02]}
        color="#c88968"
      />
      <Box
        position={[0, 0.86, 0.1]}
        scale={[0.93, 0.5, 0.025]}
        color="#8f9c82"
      />
      {[-0.38, 0.38].map((x) => (
        <Box
          key={x}
          position={[x, 0.65, -0.04]}
          rotation={[0, 0, -x * 0.25]}
          scale={[0.07, 1.5, 0.09]}
          color="#967655"
        />
      ))}
      <Box
        position={[0, 0.49, 0.15]}
        scale={[1.3, 0.08, 0.3]}
        color="#9e7b60"
      />
    </ObjectLink>
  );
}
export function Telescope() {
  return (
    <ObjectLink
      section="JOURNEY"
      position={[1.65, 0.35, -2.5]}
      labelHeight={2.5}
    >
      <Ball position={[0, -0.25, 0]} scale={[1.3, 0.4, 1]} color="#a3b187" />
      {[0, 2.1, 4.2].map((a) => (
        <Cylinder
          key={a}
          position={[Math.sin(a) * 0.22, 0.6, Math.cos(a) * 0.22]}
          rotation={[Math.cos(a) * 0.35, 0, -Math.sin(a) * 0.35]}
          scale={[0.035, 1.15, 0.035]}
          color="#9b7f61"
        />
      ))}
      <group position={[0, 1.35, 0]} rotation={[0.75, 0, -0.65]}>
        <Cylinder scale={[0.15, 0.9, 0.15]} color="#ede0bb" />
        <Cylinder
          position={[0, 0.5, 0]}
          scale={[0.18, 0.12, 0.18]}
          color="#776957"
        />
        <Cylinder
          position={[0, 0.57, 0]}
          scale={[0.13, 0.02, 0.13]}
          color="#556478"
        />
      </group>
    </ObjectLink>
  );
}
export function Mailbox() {
  const lid = useRef<Group>(null);
  const mode = useExperienceStore((s) => s.mode);
  useFrame((_, dt) => {
    if (lid.current)
      lid.current.rotation.x +=
        ((mode === "CONTACT" ? 1.3 : 0) - lid.current.rotation.x) *
        Math.min(dt * 5, 1);
  });
  return (
    <ObjectLink
      section="CONTACT"
      position={[-0.5, 0.12, 3.1]}
      labelHeight={1.6}
    >
      <Box position={[0, 0.45, 0]} scale={[0.1, 0.9, 0.1]} color="#967857" />
      <Box position={[0, 0.95, 0]} scale={[0.56, 0.4, 0.5]} color="#b67469" />
      <group ref={lid} position={[0, 0.75, 0.26]}>
        <Box
          position={[0, 0.19, 0]}
          scale={[0.56, 0.4, 0.045]}
          color="#d08e7c"
        />
      </group>
      <Box
        position={[0.33, 1.12, 0]}
        scale={[0.04, 0.32, 0.04]}
        color="#775e54"
      />
      <Box
        position={[0.41, 1.25, 0]}
        scale={[0.2, 0.12, 0.045]}
        color="#e8c886"
      />
      {mode === "CONTACT" && (
        <Box
          position={[0, 1.13, 0.4]}
          rotation={[-0.3, 0, 0]}
          scale={[0.4, 0.24, 0.015]}
          color="#fff1d9"
        />
      )}
    </ObjectLink>
  );
}
export function RecordPlayer() {
  const disk = useRef<Mesh>(null);
  const mode = useExperienceStore((s) => s.mode),
    reduced = useExperienceStore((s) => s.reducedMotion);
  useFrame((_, dt) => {
    if (disk.current && mode === "INTERESTS" && !reduced)
      disk.current.rotation.y += dt * 1.5;
  });
  return (
    <ObjectLink section="INTERESTS" position={[3, 0.12, 0.3]} labelHeight={1.7}>
      <Box position={[0, 0.46, 0]} scale={[1, 0.09, 0.7]} color="#9f8065" />
      {[-0.4, 0.4].map((x) => (
        <Box
          key={x}
          position={[x, 0.24, 0]}
          scale={[0.06, 0.45, 0.5]}
          color="#81644e"
        />
      ))}
      <Box position={[0, 0.62, 0]} scale={[0.86, 0.2, 0.58]} color="#b48263" />
      <Cylinder
        ref={undefined}
        position={[-0.12, 0.73, 0]}
        scale={[0.24, 0.025, 0.24]}
        color="#414944"
      />
      <mesh ref={disk} position={[-0.12, 0.75, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.02, 20]} />
        <meshStandardMaterial color="#e1b57d" />
      </mesh>
      <Box
        position={[0.24, 0.77, 0]}
        rotation={[0, 0.3, 0]}
        scale={[0.035, 0.025, 0.4]}
        color="#e2cfb1"
      />
    </ObjectLink>
  );
}
