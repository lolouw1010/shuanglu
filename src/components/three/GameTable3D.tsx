"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";
import { DoubleSide, LatheGeometry, Shape, Vector2 } from "three";
import type { BoardState, Move, Player, Point } from "@/game";

type Source = number | "bar";

type GameTable3DProps = {
  state: BoardState;
  availableMoves: Move[];
  selectedSource: Source | null;
  targetMoves: Move[];
  onSelectSource: (source: Source) => void;
  onSelectTarget: (target: number | "off") => void;
};

type PointPosition = {
  index: number;
  row: "top" | "bottom";
  col: number;
  x: number;
  z: number;
  direction: 1 | -1;
};

const BOARD_WIDTH = 11.35;
const BOARD_DEPTH = 6.15;
const POINT_STEP = 0.76;
const POINT_LENGTH = 2.34;
const PIECE_SCALE = 0.35;
const SELECTED_PIECE_SCALE = 0.4;

function pointPosition(index: number): PointPosition {
  if (index >= 12) {
    const col = index - 12;
    return {
      index,
      row: "top",
      col,
      x: (col - 5.5) * POINT_STEP,
      z: -2.28,
      direction: 1,
    };
  }

  const col = 11 - index;
  return {
    index,
    row: "bottom",
    col,
    x: (col - 5.5) * POINT_STEP,
    z: 2.28,
    direction: -1,
  };
}

function pieceOffsets(count: number): Array<[number, number, number]> {
  const visible = Math.min(count, 7);
  return Array.from({ length: visible }, (_, index) => {
    const lane = index % 2;
    const row = Math.floor(index / 2);
    return [(lane - 0.5) * 0.12, row * 0.105, index * 0.12];
  });
}

function GoldBar({
  position,
  scale,
  rotation,
}: {
  position: [number, number, number];
  scale: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={scale} />
      <meshStandardMaterial
        color="#d6a34d"
        emissive="#5b3108"
        emissiveIntensity={0.14}
        metalness={0.48}
        roughness={0.2}
      />
    </mesh>
  );
}

function VasePiece({
  owner,
  position,
  selected,
  active,
}: {
  owner: Player;
  position: [number, number, number];
  selected: boolean;
  active: boolean;
}) {
  const geometry = useMemo(() => {
    const profile = [
      new Vector2(0.18, 0),
      new Vector2(0.31, 0.05),
      new Vector2(0.36, 0.14),
      new Vector2(0.5, 0.5),
      new Vector2(0.46, 0.82),
      new Vector2(0.31, 1.06),
      new Vector2(0.16, 1.26),
      new Vector2(0.15, 1.68),
      new Vector2(0.23, 1.88),
      new Vector2(0.38, 1.98),
      new Vector2(0.3, 2.09),
      new Vector2(0.08, 2.13),
    ];
    return new LatheGeometry(profile, 40);
  }, []);

  const isWhite = owner === "white";
  const bodyColor = isWhite ? "#fff0c5" : "#030303";
  const rimColor = isWhite ? "#302317" : "#e7c574";
  const highlightColor = isWhite ? "#fff9e8" : "#e6ddd1";

  return (
    <group position={position} scale={selected ? SELECTED_PIECE_SCALE : PIECE_SCALE}>
      <mesh castShadow receiveShadow geometry={geometry}>
        <meshPhysicalMaterial
          color={bodyColor}
          roughness={isWhite ? 0.16 : 0.11}
          metalness={0.01}
          clearcoat={1}
          clearcoatRoughness={0.05}
          emissive={active ? "#4b2a08" : "#000000"}
          emissiveIntensity={active ? 0.2 : 0}
          reflectivity={0.72}
        />
      </mesh>
      <mesh castShadow position={[0, 0.035, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.27, 0.045, 12, 44]} />
        <meshStandardMaterial color={rimColor} roughness={0.18} metalness={0.03} />
      </mesh>
      <mesh castShadow position={[0, 1.94, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.04, 12, 48]} />
        <meshPhysicalMaterial
          color={rimColor}
          roughness={0.12}
          clearcoat={1}
          clearcoatRoughness={0.04}
        />
      </mesh>
      <mesh position={[-0.24, 1.06, 0.28]} rotation={[0.16, -0.2, -0.18]}>
        <boxGeometry args={[0.035, 0.82, 0.012]} />
        <meshBasicMaterial color={highlightColor} transparent opacity={isWhite ? 0.5 : 0.7} />
      </mesh>
      <mesh position={[-0.07, 1.78, 0.31]} rotation={[0.1, 0, -0.1]}>
        <boxGeometry args={[0.025, 0.32, 0.012]} />
        <meshBasicMaterial color={highlightColor} transparent opacity={0.62} />
      </mesh>
      <mesh position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.42, 42]} />
        <meshStandardMaterial color="#020101" transparent opacity={0.32} />
      </mesh>
    </group>
  );
}

function BoardPoint3D({
  point,
  position,
  isSource,
  isTarget,
  canSelect,
  onSelectSource,
  onSelectTarget,
}: {
  point: Point;
  position: PointPosition;
  isSource: boolean;
  isTarget: boolean;
  canSelect: boolean;
  onSelectSource: () => void;
  onSelectTarget: () => void;
}) {
  const triangle = useMemo(
    () =>
      new Shape([
        new Vector2(-0.32, 0),
        new Vector2(0.32, 0),
        new Vector2(0, position.direction * -POINT_LENGTH),
      ]),
    [position.direction],
  );
  const baseColor = position.index % 2 === 0 ? "#c89a48" : "#6f4324";
  const activeColor = isTarget ? "#74d8a4" : isSource ? "#f4d16a" : canSelect ? "#d5b15d" : baseColor;
  const isActionable = isTarget || isSource || canSelect;

  const handleClick = () => {
    if (isTarget) {
      onSelectTarget();
      return;
    }
    if (canSelect) onSelectSource();
  };

  return (
    <group position={[position.x, 0.12, position.z]}>
      {isActionable ? (
        <mesh
          position={[0, -0.008, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[1.12, 1.12, 1.12]}
        >
          <shapeGeometry args={[triangle]} />
          <meshBasicMaterial color="#1c1815" side={DoubleSide} />
        </mesh>
      ) : null}
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(event) => {
          event.stopPropagation();
          handleClick();
        }}
      >
        <shapeGeometry args={[triangle]} />
        <meshStandardMaterial
          color={activeColor}
          emissive={isTarget || isSource || canSelect ? activeColor : "#120804"}
          emissiveIntensity={isTarget ? 0.36 : isSource || canSelect ? 0.16 : 0.06}
          metalness={0.42}
          roughness={0.28}
          side={DoubleSide}
        />
      </mesh>
      {isActionable ? (
        <group position={[0, 0.018, position.direction * -POINT_LENGTH * 0.48]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            {isTarget ? (
              <circleGeometry args={[0.09, 24]} />
            ) : (
              <ringGeometry args={[0.045, 0.1, 24]} />
            )}
            <meshBasicMaterial color="#1c1815" side={DoubleSide} />
          </mesh>
          <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            {isTarget ? (
              <circleGeometry args={[0.058, 24]} />
            ) : (
              <ringGeometry args={[0.06, 0.082, 24]} />
            )}
            <meshStandardMaterial
              color={isTarget ? "#c9ffe2" : "#f4d16a"}
              emissive={isTarget ? "#2f8f5e" : "#5c3508"}
              emissiveIntensity={isTarget ? 0.45 : 0.24}
              metalness={0.35}
              roughness={0.25}
              side={DoubleSide}
            />
          </mesh>
        </group>
      ) : null}
      {point.owner
        ? pieceOffsets(point.count).map(([x, y, depth], pieceIndex) => (
            <VasePiece
              key={pieceIndex}
              owner={point.owner as Player}
              selected={isSource}
              active={isTarget || canSelect || isSource}
              position={[
                x,
                0.13 + y,
                position.direction * (0.16 + depth),
              ]}
            />
          ))
        : null}
      {point.count > 7 ? (
        <mesh position={[0.2, 0.63, position.direction * 0.54]}>
          <sphereGeometry args={[0.065, 20, 12]} />
          <meshStandardMaterial
            color="#f3d589"
            emissive="#6e3f08"
            emissiveIntensity={0.28}
            metalness={0.35}
            roughness={0.18}
          />
        </mesh>
      ) : null}
    </group>
  );
}

function Pip({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, 0.271, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.052, 18]} />
      <meshStandardMaterial color="#24140d" roughness={0.32} />
    </mesh>
  );
}

function DiceCube({
  value,
  position,
  rotation,
}: {
  value: number | "-";
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  const pips: Record<number, Array<[number, number]>> = {
    1: [[0, 0]],
    2: [
      [-0.13, -0.13],
      [0.13, 0.13],
    ],
    3: [
      [-0.14, -0.14],
      [0, 0],
      [0.14, 0.14],
    ],
    4: [
      [-0.14, -0.14],
      [0.14, -0.14],
      [-0.14, 0.14],
      [0.14, 0.14],
    ],
    5: [
      [-0.14, -0.14],
      [0.14, -0.14],
      [0, 0],
      [-0.14, 0.14],
      [0.14, 0.14],
    ],
    6: [
      [-0.14, -0.16],
      [0.14, -0.16],
      [-0.14, 0],
      [0.14, 0],
      [-0.14, 0.16],
      [0.14, 0.16],
    ],
  };

  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.56, 0.56, 0.56]} />
        <meshPhysicalMaterial
          color="#f3d393"
          roughness={0.22}
          clearcoat={0.86}
          clearcoatRoughness={0.12}
        />
      </mesh>
      {typeof value === "number"
        ? pips[value].map(([x, z], index) => <Pip key={index} x={x} z={z} />)
        : null}
    </group>
  );
}

function StudyAtmosphere() {
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
        <planeGeometry args={[18, 12]} />
        <meshStandardMaterial color="#211511" roughness={0.78} />
      </mesh>
      <mesh receiveShadow position={[0, 2.2, -4.78]}>
        <boxGeometry args={[15, 4.5, 0.16]} />
        <meshStandardMaterial color="#1b1110" roughness={0.86} />
      </mesh>
      {[-4.6, -2.3, 0, 2.3, 4.6].map((x) => (
        <mesh key={x} position={[x, 2.18, -4.66]}>
          <boxGeometry args={[0.045, 3.55, 0.08]} />
          <meshStandardMaterial color="#7a5126" metalness={0.18} roughness={0.34} />
        </mesh>
      ))}
      <mesh position={[-5.7, 0.08, 2.65]} rotation={[0, 0.22, 0]}>
        <boxGeometry args={[2.15, 0.08, 0.72]} />
        <meshStandardMaterial color="#efe2c0" roughness={0.5} />
      </mesh>
      <mesh position={[-4.9, 0.17, 2.42]} rotation={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 1.35, 16]} />
        <meshStandardMaterial color="#2f160c" roughness={0.4} />
      </mesh>
      <mesh position={[5.05, 0.1, 2.72]} rotation={[0, -0.24, 0]}>
        <boxGeometry args={[2.2, 0.06, 0.32]} />
        <meshStandardMaterial color="#c8a15f" roughness={0.46} />
      </mesh>
      <mesh position={[5.82, 0.18, 2.63]} rotation={[0, -0.24, Math.PI / 2]}>
        <cylinderGeometry args={[0.13, 0.13, 0.36, 24]} />
        <meshStandardMaterial color="#6b2b18" roughness={0.42} metalness={0.1} />
      </mesh>
      <mesh position={[4.9, 0.22, -2.98]}>
        <cylinderGeometry args={[0.54, 0.72, 0.28, 42]} />
        <meshStandardMaterial color="#5b1f1b" roughness={0.72} />
      </mesh>
      <mesh position={[-4.9, 0.22, -2.98]}>
        <cylinderGeometry args={[0.54, 0.72, 0.28, 42]} />
        <meshStandardMaterial color="#20283b" roughness={0.74} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.9, 7.4, 72]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.26} side={DoubleSide} />
      </mesh>
    </group>
  );
}

function LacquerBoard({
  state,
  availableMoves,
  selectedSource,
  targetMoves,
  onSelectSource,
  onSelectTarget,
}: GameTable3DProps) {
  const targetPoints = useMemo(
    () =>
      new Set(
        targetMoves
          .filter((move) => typeof move.to === "number")
          .map((move) => move.to as number),
      ),
    [targetMoves],
  );
  const sourcePoints = useMemo(
    () =>
      new Set(
        availableMoves
          .filter((move) => typeof move.from === "number")
          .map((move) => move.from as number),
      ),
    [availableMoves],
  );
  const canSelectBar = availableMoves.some((move) => move.from === "bar");
  const canBearOff = targetMoves.some((move) => move.to === "off");

  return (
    <group position={[0, 0.52, 0]}>
      <mesh castShadow receiveShadow position={[0, -0.28, 0]}>
        <boxGeometry args={[12.75, 0.56, 7.45]} />
        <meshPhysicalMaterial
          color="#38120c"
          roughness={0.24}
          metalness={0.03}
          clearcoat={0.92}
          clearcoatRoughness={0.12}
        />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.02, 0]}>
        <boxGeometry args={[BOARD_WIDTH, 0.16, BOARD_DEPTH]} />
        <meshPhysicalMaterial
          color="#120907"
          roughness={0.42}
          metalness={0.04}
          clearcoat={0.64}
          clearcoatRoughness={0.24}
        />
      </mesh>
      <mesh receiveShadow position={[0, 0.125, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10.7, 5.54]} />
        <meshStandardMaterial
          color="#1a0d09"
          roughness={0.54}
          metalness={0.04}
          emissive="#160806"
          emissiveIntensity={0.12}
        />
      </mesh>

      <GoldBar position={[0, 0.235, 0]} scale={[0.09, 0.075, BOARD_DEPTH - 0.42]} />
      <GoldBar position={[-5.42, 0.235, 0]} scale={[0.08, 0.09, BOARD_DEPTH - 0.14]} />
      <GoldBar position={[5.42, 0.235, 0]} scale={[0.08, 0.09, BOARD_DEPTH - 0.14]} />
      <GoldBar position={[0, 0.236, -2.98]} scale={[BOARD_WIDTH - 0.26, 0.07, 0.075]} />
      <GoldBar position={[0, 0.236, 2.98]} scale={[BOARD_WIDTH - 0.26, 0.07, 0.075]} />

      {Array.from({ length: 13 }, (_, index) => (
        <GoldBar
          key={index}
          position={[(index - 6) * POINT_STEP, 0.226, 0]}
          scale={[0.024, 0.026, BOARD_DEPTH - 0.62]}
        />
      ))}

      {state.points.map((point, index) => {
        const position = pointPosition(index);
        return (
          <BoardPoint3D
            key={index}
            point={point}
            position={position}
            isSource={selectedSource === index}
            isTarget={targetPoints.has(index)}
            canSelect={sourcePoints.has(index)}
            onSelectSource={() => onSelectSource(index)}
            onSelectTarget={() => onSelectTarget(index)}
          />
        );
      })}

      <group position={[-5.05, 0.38, 0]}>
        <mesh
          castShadow
          receiveShadow
          onClick={(event) => {
            event.stopPropagation();
            if (canSelectBar) onSelectSource("bar");
          }}
        >
          <boxGeometry args={[0.56, 0.18, 2.08]} />
          <meshStandardMaterial
            color={canSelectBar ? "#315b3c" : "#140908"}
            emissive={canSelectBar ? "#1a5d32" : "#000000"}
            emissiveIntensity={canSelectBar ? 0.34 : 0}
            metalness={0.12}
            roughness={0.34}
          />
        </mesh>
        <GoldBar position={[0, 0.12, 0]} scale={[0.64, 0.035, 2.16]} />
      </group>

      <group position={[5.05, 0.38, 0]}>
        <mesh
          castShadow
          receiveShadow
          onClick={(event) => {
            event.stopPropagation();
            if (canBearOff) onSelectTarget("off");
          }}
        >
          <boxGeometry args={[0.56, 0.18, 2.08]} />
          <meshStandardMaterial
            color={canBearOff ? "#7b4e16" : "#140908"}
            emissive={canBearOff ? "#7a450e" : "#000000"}
            emissiveIntensity={canBearOff ? 0.34 : 0}
            metalness={0.16}
            roughness={0.3}
          />
        </mesh>
        <GoldBar position={[0, 0.12, 0]} scale={[0.64, 0.035, 2.16]} />
      </group>

      <group position={[0, 0.29, 0.08]}>
        <mesh receiveShadow position={[0, -0.02, 0]}>
          <boxGeometry args={[1.72, 0.08, 1.14]} />
          <meshStandardMaterial color="#180b08" roughness={0.5} metalness={0.08} />
        </mesh>
        <DiceCube
          value={state.currentRoll?.[0] ?? "-"}
          position={[-0.38, 0.34, -0.1]}
          rotation={[0.08, 0.22, -0.08]}
        />
        <DiceCube
          value={state.currentRoll?.[1] ?? "-"}
          position={[0.4, 0.34, 0.08]}
          rotation={[-0.05, -0.28, 0.1]}
        />
      </group>

      <mesh position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[13.2, 7.9]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

function Scene(props: GameTable3DProps) {
  return (
    <>
      <color attach="background" args={["#080605"]} />
      <fog attach="fog" args={["#080605", 9, 18]} />
      <ambientLight intensity={0.64} />
      <hemisphereLight args={["#ffe0a4", "#170806", 1.05]} />
      <directionalLight
        castShadow
        position={[3.8, 7.6, 4.8]}
        intensity={2.9}
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-4.5, 3.1, 2.7]} color="#f2b35f" intensity={1.55} />
      <pointLight position={[4.2, 2.6, -2.8]} color="#b66a42" intensity={0.82} />
      <StudyAtmosphere />
      <LacquerBoard {...props} />
      <OrbitControls
        enablePan={false}
        minDistance={7.8}
        maxDistance={10.8}
        minPolarAngle={0.58}
        maxPolarAngle={1.02}
        target={[0, 0.62, 0]}
      />
    </>
  );
}

export function GameTable3D(props: GameTable3DProps) {
  return (
    <section className="game-3d-shell" aria-label="三维双陆棋桌测试">
      <div className="game-3d-badge">
        <span>博物复原桌面</span>
        <strong>灰盒 01</strong>
      </div>
      <div className="game-3d-canvas">
        <Canvas
          camera={{ position: [0, 6.15, 8.35], fov: 39 }}
          dpr={[1, 1.4]}
          shadows
        >
          <Scene {...props} />
        </Canvas>
      </div>
    </section>
  );
}
