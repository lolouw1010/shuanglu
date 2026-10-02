"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import { DoubleSide, LatheGeometry, PerspectiveCamera, Vector2 } from "three";
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

const BOARD_WIDTH = 11.5;
const BOARD_DEPTH = 6.6;
const POINT_STEP = 0.8;
const POINT_LENGTH = 2.32;
const PIECE_SCALE = 0.58;
const SELECTED_PIECE_SCALE = 0.66;

// Fitted to the visible lacquer-table inset in each responsive room background.
const CAMERA_PRESETS = {
  landscape: {
    azimuth: 0.74358,
    elevation: 0.47483,
    distance: 28.52079,
    depthScale: 1.03312,
    shiftX: 83.50491 / 1536,
    shiftY: -21.13557 / 1024,
  },
  portrait: {
    azimuth: 0.55009,
    elevation: 0.64603,
    distance: 53.65825,
    depthScale: 0.82522,
    shiftX: 98.7385 / 1024,
    shiftY: -37.36541 / 1536,
  },
} as const;

function pointPosition(index: number): PointPosition {
  if (index >= 12) {
    const col = index - 12;
    return {
      index,
      row: "top",
      col,
      x: (col - 5.5) * POINT_STEP,
      z: -2.48,
      direction: 1,
    };
  }

  const col = 11 - index;
  return {
    index,
    row: "bottom",
    col,
    x: (col - 5.5) * POINT_STEP,
    z: 2.48,
    direction: -1,
  };
}

function pieceOffsets(count: number): Array<[number, number, number]> {
  const visible = Math.min(count, 7);
  return Array.from({ length: visible }, (_, index) => {
    const lane = index % 2;
    const row = Math.floor(index / 2);
    return [(lane - 0.5) * 0.18, 0, row * 0.48 + lane * 0.09];
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

function ShuangluHorse({
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
      new Vector2(0.24, 0),
      new Vector2(0.32, 0.04),
      new Vector2(0.31, 0.13),
      new Vector2(0.26, 0.25),
      new Vector2(0.21, 0.4),
      new Vector2(0.165, 0.58),
      new Vector2(0.115, 0.75),
      new Vector2(0.125, 0.87),
      new Vector2(0.175, 0.93),
      new Vector2(0.13, 1.005),
      new Vector2(0.035, 1.035),
    ];
    return new LatheGeometry(profile, 40);
  }, []);

  const isWhite = owner === "white";
  const bodyColor = isWhite ? "#d9ddc7" : "#130f0e";
  const inlayColor = isWhite ? "#927443" : "#9b653a";
  const highlightColor = isWhite ? "#f5f4dc" : "#c99d67";

  return (
    <group position={position} scale={selected ? SELECTED_PIECE_SCALE : PIECE_SCALE}>
      <mesh castShadow receiveShadow geometry={geometry}>
        <meshPhysicalMaterial
          color={bodyColor}
          roughness={isWhite ? 0.3 : 0.17}
          metalness={0.015}
          clearcoat={isWhite ? 0.68 : 1}
          clearcoatRoughness={isWhite ? 0.16 : 0.08}
          emissive={active ? (isWhite ? "#384022" : "#4b260f") : "#000000"}
          emissiveIntensity={active ? 0.16 : 0}
          reflectivity={0.72}
        />
      </mesh>
      <mesh castShadow position={[0, 0.29, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.235, 0.014, 8, 32]} />
        <meshPhysicalMaterial
          color={inlayColor}
          roughness={0.2}
          metalness={0.38}
          clearcoat={0.6}
          clearcoatRoughness={0.12}
        />
      </mesh>
      <mesh position={[-0.105, 0.54, 0.155]} rotation={[0.16, -0.2, -0.1]}>
        <boxGeometry args={[0.014, 0.32, 0.007]} />
        <meshBasicMaterial color={highlightColor} transparent opacity={isWhite ? 0.5 : 0.7} />
      </mesh>
      <mesh position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.4, 32]} />
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
  const baseColor = position.index % 2 === 0 ? "#c9c1a9" : "#a99f87";
  const activeColor = isTarget ? "#78aa87" : isSource ? "#e4c16a" : canSelect ? "#d7b866" : baseColor;
  const isActionable = isTarget || isSource || canSelect;

  const handleClick = () => {
    if (isTarget) {
      onSelectTarget();
      return;
    }
    if (canSelect) onSelectSource();
  };

  return (
    <group position={[position.x, 0.16, position.z]}>
      {isActionable ? (
        <mesh
          position={[0, 0.025, position.direction * (POINT_LENGTH / 2)]}
          rotation={[-Math.PI / 2, 0, 0]}
          onClick={(event) => {
            event.stopPropagation();
            handleClick();
          }}
        >
          <planeGeometry args={[POINT_STEP * 0.94, POINT_LENGTH]} />
          <meshBasicMaterial transparent opacity={0.002} depthWrite={false} />
        </mesh>
      ) : null}
      <mesh position={[0, 0.012, position.direction * (POINT_LENGTH / 2)]}>
        <boxGeometry args={[isActionable ? 0.085 : 0.026, 0.018, POINT_LENGTH]} />
        <meshStandardMaterial
          color={isActionable ? activeColor : "#98753b"}
          emissive={isActionable ? activeColor : "#241508"}
          emissiveIntensity={isTarget ? 0.42 : isActionable ? 0.2 : 0.04}
          metalness={0.62}
          roughness={0.3}
        />
      </mesh>
      <mesh
        receiveShadow
        position={[0, 0.04, 0]}
        onClick={(event) => {
          event.stopPropagation();
          handleClick();
        }}
      >
        <cylinderGeometry args={[0.245, 0.245, 0.045, 32]} />
        <meshPhysicalMaterial
          color={activeColor}
          emissive={isTarget || isSource || canSelect ? activeColor : "#1d130d"}
          emissiveIntensity={isTarget ? 0.42 : isSource || canSelect ? 0.2 : 0.02}
          metalness={0.04}
          roughness={0.3}
          clearcoat={0.5}
          clearcoatRoughness={0.2}
        />
      </mesh>
      <mesh position={[0, 0.069, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.19, 0.248, 32]} />
        <meshStandardMaterial color="#b38b45" metalness={0.62} roughness={0.26} side={DoubleSide} />
      </mesh>
      {isActionable ? (
        <group position={[0, 0.038, position.direction * POINT_LENGTH * 0.48]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            {isTarget ? (
              <circleGeometry args={[0.13, 24]} />
            ) : (
              <ringGeometry args={[0.07, 0.14, 24]} />
            )}
            <meshBasicMaterial color="#1c1815" side={DoubleSide} />
          </mesh>
          <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            {isTarget ? (
              <circleGeometry args={[0.088, 24]} />
            ) : (
              <ringGeometry args={[0.085, 0.112, 24]} />
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
            <ShuangluHorse
              key={pieceIndex}
              owner={point.owner as Player}
              selected={isSource}
              active={isTarget || canSelect || isSource}
              position={[
                x,
                0.12 + y,
                position.direction * (0.18 + depth),
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
    <group position={[0, 0.42, 0]}>
      <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12.45, 7.45]} />
        <meshPhysicalMaterial
          color="#1a100d"
          roughness={0.46}
          metalness={0.015}
          clearcoat={0.64}
          clearcoatRoughness={0.24}
          transparent
          opacity={0.84}
        />
      </mesh>

      <GoldBar position={[-5.42, 0.145, 0]} scale={[0.055, 0.045, BOARD_DEPTH - 0.14]} />
      <GoldBar position={[5.42, 0.145, 0]} scale={[0.055, 0.045, BOARD_DEPTH - 0.14]} />
      <GoldBar position={[0, 0.146, -2.98]} scale={[BOARD_WIDTH - 0.26, 0.045, 0.055]} />
      <GoldBar position={[0, 0.146, 2.98]} scale={[BOARD_WIDTH - 0.26, 0.045, 0.055]} />
      <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.28, 0.35, 48]} />
        <meshStandardMaterial color="#b78d45" metalness={0.62} roughness={0.24} side={DoubleSide} />
      </mesh>
      <mesh position={[0, 0.146, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.17, 36]} />
        <meshPhysicalMaterial
          color="#665d4f"
          roughness={0.3}
          metalness={0.05}
          clearcoat={0.65}
          clearcoatRoughness={0.14}
          side={DoubleSide}
        />
      </mesh>
      {[
        [0, -0.29, 0],
        [0.29, 0, Math.PI / 2],
        [0, 0.29, 0],
        [-0.29, 0, Math.PI / 2],
      ].map(([x, z, rotation], index) => (
        <mesh
          key={index}
          position={[x, 0.151, z]}
          rotation={[-Math.PI / 2, 0, rotation]}
          scale={[0.13, 0.22, 1]}
        >
          <circleGeometry args={[1, 28]} />
          <meshStandardMaterial
            color="#9a6034"
            emissive="#35150c"
            emissiveIntensity={0.08}
            metalness={0.18}
            roughness={0.42}
            side={DoubleSide}
          />
        </mesh>
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

      <group position={[-5.15, 0.34, 0]}>
        <mesh
          castShadow
          receiveShadow
          onClick={(event) => {
            event.stopPropagation();
            if (canSelectBar) onSelectSource("bar");
          }}
        >
          <boxGeometry args={[0.46, 0.08, 2.08]} />
          <meshStandardMaterial
            color={canSelectBar ? "#385f46" : "#371912"}
            emissive={canSelectBar ? "#183e25" : "#000000"}
            emissiveIntensity={canSelectBar ? 0.34 : 0}
            metalness={0.12}
            roughness={0.34}
          />
        </mesh>
        <GoldBar position={[-0.25, 0.08, 0]} scale={[0.025, 0.024, 2.12]} />
        <GoldBar position={[0.25, 0.08, 0]} scale={[0.025, 0.024, 2.12]} />
        <GoldBar position={[0, 0.08, -1.05]} scale={[0.52, 0.024, 0.025]} />
        <GoldBar position={[0, 0.08, 1.05]} scale={[0.52, 0.024, 0.025]} />
      </group>

      <group position={[5.15, 0.34, 0]}>
        <mesh
          castShadow
          receiveShadow
          onClick={(event) => {
            event.stopPropagation();
            if (canBearOff) onSelectTarget("off");
          }}
        >
          <boxGeometry args={[0.46, 0.08, 2.08]} />
          <meshStandardMaterial
            color={canBearOff ? "#765526" : "#371912"}
            emissive={canBearOff ? "#53340f" : "#000000"}
            emissiveIntensity={canBearOff ? 0.34 : 0}
            metalness={0.16}
            roughness={0.3}
          />
        </mesh>
        <GoldBar position={[-0.25, 0.08, 0]} scale={[0.025, 0.024, 2.12]} />
        <GoldBar position={[0.25, 0.08, 0]} scale={[0.025, 0.024, 2.12]} />
        <GoldBar position={[0, 0.08, -1.05]} scale={[0.52, 0.024, 0.025]} />
        <GoldBar position={[0, 0.08, 1.05]} scale={[0.52, 0.024, 0.025]} />
      </group>

    </group>
  );
}

function FixedCamera() {
  const { camera, size } = useThree();

  useLayoutEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return;
    const preset = size.width / size.height < 0.9
      ? CAMERA_PRESETS.portrait
      : CAMERA_PRESETS.landscape;
    const horizontalDistance = preset.distance * Math.cos(preset.elevation);

    camera.position.set(
      horizontalDistance * Math.sin(preset.azimuth),
      0.42 + preset.distance * Math.sin(preset.elevation),
      horizontalDistance * Math.cos(preset.azimuth),
    );
    camera.lookAt(0, 0.45, 0);
    camera.fov = 32;
    camera.updateProjectionMatrix();
    camera.projectionMatrix.elements[8] -= 2 * preset.shiftX;
    camera.projectionMatrix.elements[9] += 2 * preset.shiftY;
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  }, [camera, size.height, size.width]);

  return null;
}

function Scene(props: GameTable3DProps) {
  const { size } = useThree();
  const preset = size.width / size.height < 0.9
    ? CAMERA_PRESETS.portrait
    : CAMERA_PRESETS.landscape;

  return (
    <>
      <ambientLight intensity={0.9} />
      <hemisphereLight args={["#f7ddb0", "#24130e", 1.35]} />
      <directionalLight
        castShadow
        position={[-3.8, 8.4, 5.2]}
        intensity={2.35}
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-5.2, 3.8, 3.2]} color="#efc27a" intensity={1.25} />
      <group scale={[1, 1, preset.depthScale]}>
        <LacquerBoard {...props} />
      </group>
      <FixedCamera />
    </>
  );
}

export function GameTable3D(props: GameTable3DProps) {
  return (
    <section className="game-3d-shell" aria-label="书斋对弈场景中的固定视角双陆棋桌">
      <div className="game-3d-badge">
        <span>月下书斋</span>
        <strong>对弈中</strong>
      </div>
      <div className="game-3d-canvas">
        <Canvas
          camera={{ position: [10, 18, 24], fov: 32, near: 0.1, far: 200 }}
          dpr={[1, 1.4]}
          gl={{ alpha: true, antialias: true }}
          shadows
        >
          <Scene {...props} />
        </Canvas>
      </div>
    </section>
  );
}
