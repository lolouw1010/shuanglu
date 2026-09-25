"use client";

import { Box, BookOpen, Bot, Globe2, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/store/gameStore";

export function MainMenu() {
  const startMatch = useGameStore((store) => store.startMatch);
  const createOnlineRoom = useGameStore((store) => store.createOnlineRoom);
  const joinOnlineRoom = useGameStore((store) => store.joinOnlineRoom);
  const onlineStatus = useGameStore((store) => store.onlineStatus);
  const toggleRules = useGameStore((store) => store.toggleRules);
  const [roomCode, setRoomCode] = useState("");
  const joinedFromUrl = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room")?.trim().toUpperCase();
    if (!room || joinedFromUrl.current) return;
    joinedFromUrl.current = true;
    setRoomCode(room);
    void joinOnlineRoom(room);
  }, [joinOnlineRoom]);

  return (
    <main className="menu-shell-bg menu-mobile-shell min-h-[100dvh] px-4 py-8 text-stone-100">
      <section className="menu-panel menu-mobile-panel relative z-10 mx-auto flex min-h-[calc(100dvh-4rem)] max-w-6xl flex-col justify-between rounded border px-5 py-6 sm:px-8">
        <div className="menu-intro pt-8">
          <p className="text-sm text-amber-200">Tang-Song Double Sixes Reconstruction</p>
          <h1 className="mt-3 font-display text-6xl text-amber-50 sm:text-7xl">
            双陆
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-stone-200">
            掷骰行马，把 15 枚马先送出棋盘即胜。复原模式会提示每一步该点哪里。
          </p>
        </div>

        <div className="menu-actions grid gap-4 pb-10 sm:max-w-3xl">
          <div className="menu-mode-grid grid gap-3 sm:grid-cols-5">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded border border-amber-200/40 bg-amber-100 px-4 py-3 font-semibold text-stone-950"
              onClick={createOnlineRoom}
            >
              <Globe2 size={18} />
              开房间
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded border border-amber-200/40 bg-[#2b1512] px-4 py-3 font-semibold text-amber-50"
              onClick={() => startMatch("human")}
            >
              <Users size={18} />
              本机双人
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded border border-amber-200/40 bg-[#2b1512] px-4 py-3 font-semibold text-amber-50"
              onClick={() => startMatch("human", "3d")}
            >
              <Box size={18} />
              3D测试
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded border border-amber-200/40 bg-[#2b1512] px-4 py-3 font-semibold text-amber-50"
              onClick={() => startMatch("ai")}
            >
              <Bot size={18} />
              人机
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded border border-amber-200/25 bg-black/24 px-4 py-3 font-semibold text-amber-50"
              onClick={toggleRules}
            >
              <BookOpen size={18} />
              规则
            </button>
          </div>
          <div className="menu-join-panel grid gap-2 rounded border border-amber-200/20 bg-black/22 p-3 sm:grid-cols-[1fr_auto]">
            <input
              aria-label="房间码"
              className="rounded border border-amber-200/20 bg-black/32 px-3 py-2 text-sm uppercase text-amber-50 outline-none placeholder:text-stone-500 focus:border-amber-100"
              placeholder="输入朋友给你的房间码"
              value={roomCode}
              onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
            />
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded border border-amber-200/35 bg-black/30 px-4 py-2 text-sm font-semibold text-amber-50"
              onClick={() => joinOnlineRoom(roomCode)}
            >
              加入房间
            </button>
            {onlineStatus ? (
              <p className="text-sm text-amber-100 sm:col-span-2">
                {onlineStatus}
              </p>
            ) : (
              <p className="text-sm text-stone-400 sm:col-span-2">
                开房间后，把房间码发给朋友；朋友输入房间码即可执黑加入。
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
