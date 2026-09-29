"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import { DoubleSide, LatheGeometry, OrthographicCamera, Vector2 } from "three";
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
const PIECE_SCALE = 0.43;
const SELECTED_PIECE_SCALE = 0.49;

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
    return [(lane - 0.5) * 0.14, 0, row * 0.42 + lane * 0.08];
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
      new Vector2(0.21, 0),
      new Vector2(0.29, 0.035),
      new Vector2(0.3, 0.12),
      new Vector2(0.27, 0.22),
      new Vector2(0.22, 0.42),
      new Vector2(0.16, 0.64),
      new Vector2(0.105, 0.82),
      new Vector2(0.11, 0.92),
      new Vector2(0.15, 0.98),
      new Vector2(0.11, 1.035),
      new Vector2(0.025, 1.055),
    ];
    return new LatheGeometry(profile, 40);
  }, []);

  const isWhite = owner === "white";
  const bodyColor = isWhite ? "#e5dfc9" : "#120e0c";
  const inlayColor = isWhite ? "#a17a38" : "#b08a49";
  const highlightColor = isWhite ? "#fffbea" : "#d8c7a5";

  return (
    <group position={position} scale={selected ? SELECTED_PIECE_SCALE : PIECE_SCALE}>
      <mesh castShadow receiveShadow geometry={geometry}>
        <meshPhysicalMaterial
          color={bodyColor}
          roughness={isWhite ? 0.34 : 0.2}
          metalness={0.015}
          clearcoat={isWhite ? 0.55 : 1}
          clearcoatRoughness={isWhite ? 0.2 : 0.1}
          emissive={active ? "#4b2a08" : "#000000"}
          emissiveIntensity={active ? 0.2 : 0}
          reflectivity={0.72}
        />
      </mesh>
      <mesh castShadow position={[0, 0.27, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.245, 0.018, 8, 32]} />
        <meshPhysicalMaterial
          color={inlayColor}
          roughness={0.2}
          metalness={0.48}
          clearcoat={0.6}
          clearcoatRoughness={0.12}
        />
      </mesh>
      <mesh position={[-0.12, 0.5, 0.18]} rotation={[0.16, -0.2, -0.1]}>
        <boxGeometry args={[0.018, 0.35, 0.008]} />
        <meshBasicMaterial color={highlightColor} transparent opacity={isWhite ? 0.5 : 0.7} />
      </mesh>
      <mesh position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.38, 32]} />
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
        <cylinderGeometry args={[0.215, 0.215, 0.045, 32]} />
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
        <ringGeometry args={[0.164, 0.218, 32]} />
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
      <mesh castShadow receiveShadow position={[0, -0.19, 0]}>
        <boxGeometry args={[12.45, 0.34, 7.45]} />
        <meshPhysicalMaterial
          color="#17100d"
          roughness={0.25}
          metalness={0.025}
          clearcoat={0.82}
          clearcoatRoughness={0.16}
        />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.005, 0]}>
        <boxGeometry args={[BOARD_WIDTH, 0.12, BOARD_DEPTH]} />
        <meshPhysicalMaterial
          color="#211713"
          roughness={0.35}
          metalness={0.025}
          clearcoat={0.58}
          clearcoatRoughness={0.24}
        />
      </mesh>
      <mesh receiveShadow position={[0, 0.075, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10.74, 5.86]} />
        <meshStandardMaterial
          color="#1b1512"
          roughness={0.5}
          metalness={0.01}
          emissive="#100c0a"
          emissiveIntensity={0.04}
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
            color={canSelectBar ? "#385f46" : "#16100e"}
            emissive={canSelectBar ? "#183e25" : "#000000"}
            emissiveIntensity={canSelectBar ? 0.34 : 0}
            metalness={0.12}
            roughness={0.34}
          />
        </mesh>
        <GoldBar position={[0, 0.08, 0]} scale={[0.58, 0.028, 2.12]} />
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
            color={canBearOff ? "#765526" : "#16100e"}
            emissive={canBearOff ? "#53340f" : "#000000"}
            emissiveIntensity={canBearOff ? 0.34 : 0}
            metalness={0.16}
            roughness={0.3}
          />
        </mesh>
        <GoldBar position={[0, 0.08, 0]} scale={[0.58, 0.028, 2.12]} />
      </group>

      <mesh position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12.6, 7.45]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

function FixedCamera() {
  const { camera, size } = useThree();

  useLayoutEffect(() => {
    if (!(camera instanceof OrthographicCamera)) return;
    camera.position.set(5.4, 10.8, 13.2);
    camera.lookAt(0, 0.45, 0);
    camera.zoom = Math.min(size.width / 17, size.height / 10.2);
    camera.updateProjectionMatrix();
  }, [camera, size.height, size.width]);

  return null;
}

function Scene(props: GameTable3DProps) {
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
      <LacquerBoard {...props} />
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
          orthographic
          camera={{ position: [5.4, 10.8, 13.2], zoom: 48 }}
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
