"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import { DoubleSide, LatheGeometry, OrthographicCamera, Shape, Vector2 } from "three";
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
const POINT_LENGTH = 2.42;
const PIECE_SCALE = 0.42;
const SELECTED_PIECE_SCALE = 0.48;

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
      new Vector2(0.34, 0.03),
      new Vector2(0.42, 0.11),
      new Vector2(0.43, 0.25),
      new Vector2(0.36, 0.38),
      new Vector2(0.24, 0.48),
      new Vector2(0.15, 0.61),
      new Vector2(0.18, 0.72),
      new Vector2(0.3, 0.79),
      new Vector2(0.26, 0.86),
      new Vector2(0.07, 0.9),
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
          roughness={isWhite ? 0.24 : 0.2}
          metalness={0.01}
          clearcoat={1}
          clearcoatRoughness={0.12}
          emissive={active ? "#4b2a08" : "#000000"}
          emissiveIntensity={active ? 0.2 : 0}
          reflectivity={0.72}
        />
      </mesh>
      <mesh castShadow position={[0, 0.025, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.27, 0.035, 10, 32]} />
        <meshStandardMaterial color={rimColor} roughness={0.18} metalness={0.03} />
      </mesh>
      <mesh castShadow position={[0, 0.79, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.03, 10, 32]} />
        <meshPhysicalMaterial
          color={rimColor}
          roughness={0.12}
          clearcoat={1}
          clearcoatRoughness={0.04}
        />
      </mesh>
      <mesh position={[-0.19, 0.43, 0.24]} rotation={[0.16, -0.2, -0.18]}>
        <boxGeometry args={[0.025, 0.34, 0.01]} />
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
  const triangle = useMemo(
    () =>
      new Shape([
        new Vector2(-0.32, 0),
        new Vector2(0.32, 0),
        new Vector2(0, position.direction * -POINT_LENGTH),
      ]),
    [position.direction],
  );
  const baseColor = position.index % 2 === 0 ? "#c19a62" : "#733d32";
  const activeColor = isTarget ? "#7ebc96" : isSource ? "#e9c978" : canSelect ? "#cfaa66" : baseColor;
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
          metalness={0.06}
          roughness={0.48}
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

function StudyAtmosphere() {
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
        <planeGeometry args={[20, 14]} />
        <meshStandardMaterial color="#3a281f" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.055, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[7.2, 72]} />
        <meshStandardMaterial color="#241814" roughness={0.96} />
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
    <group position={[0, 0.42, 0]}>
      <mesh castShadow receiveShadow position={[0, -0.28, 0]}>
        <boxGeometry args={[12.7, 0.5, 7.75]} />
        <meshPhysicalMaterial
          color="#4a281c"
          roughness={0.34}
          metalness={0.03}
          clearcoat={0.65}
          clearcoatRoughness={0.24}
        />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.02, 0]}>
        <boxGeometry args={[BOARD_WIDTH, 0.18, BOARD_DEPTH]} />
        <meshPhysicalMaterial
          color="#251511"
          roughness={0.52}
          metalness={0.04}
          clearcoat={0.42}
          clearcoatRoughness={0.34}
        />
      </mesh>
      <mesh receiveShadow position={[0, 0.125, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10.74, 5.86]} />
        <meshStandardMaterial
          color="#302019"
          roughness={0.68}
          metalness={0.01}
          emissive="#1d100c"
          emissiveIntensity={0.08}
        />
      </mesh>

      <GoldBar position={[0, 0.235, 0]} scale={[0.09, 0.075, BOARD_DEPTH - 0.42]} />
      <GoldBar position={[-5.42, 0.235, 0]} scale={[0.08, 0.09, BOARD_DEPTH - 0.14]} />
      <GoldBar position={[5.42, 0.235, 0]} scale={[0.08, 0.09, BOARD_DEPTH - 0.14]} />
      <GoldBar position={[0, 0.236, -2.98]} scale={[BOARD_WIDTH - 0.26, 0.07, 0.075]} />
      <GoldBar position={[0, 0.236, 2.98]} scale={[BOARD_WIDTH - 0.26, 0.07, 0.075]} />

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
          <boxGeometry args={[0.48, 0.12, 2.2]} />
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

      <group position={[5.15, 0.34, 0]}>
        <mesh
          castShadow
          receiveShadow
          onClick={(event) => {
            event.stopPropagation();
            if (canBearOff) onSelectTarget("off");
          }}
        >
          <boxGeometry args={[0.48, 0.12, 2.2]} />
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

      <mesh position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[13.2, 7.9]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

function FixedCamera() {
  const { camera, size } = useThree();

  useLayoutEffect(() => {
    if (!(camera instanceof OrthographicCamera)) return;
    camera.position.set(8.4, 9.8, 10.6);
    camera.lookAt(0, 0.45, 0);
    camera.zoom = Math.min(size.width / 14.6, size.height / 9.4);
    camera.updateProjectionMatrix();
  }, [camera, size.height, size.width]);

  return null;
}

function Scene(props: GameTable3DProps) {
  return (
    <>
      <color attach="background" args={["#211611"]} />
      <ambientLight intensity={0.9} />
      <hemisphereLight args={["#f7ddb0", "#24130e", 1.35]} />
      <directionalLight
        castShadow
        position={[-3.8, 8.4, 5.2]}
        intensity={2.35}
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-5.2, 3.8, 3.2]} color="#efc27a" intensity={1.25} />
      <StudyAtmosphere />
      <LacquerBoard {...props} />
      <FixedCamera />
    </>
  );
}

export function GameTable3D(props: GameTable3DProps) {
  return (
    <section className="game-3d-shell" aria-label="固定视角双陆棋桌">
      <div className="game-3d-badge">
        <span>宋韵棋案</span>
        <strong>固定视角</strong>
      </div>
      <div className="game-3d-canvas">
        <Canvas
          orthographic
          camera={{ position: [8.4, 9.8, 10.6], zoom: 48 }}
          dpr={[1, 1.4]}
          shadows
        >
          <Scene {...props} />
        </Canvas>
      </div>
    </section>
  );
}
