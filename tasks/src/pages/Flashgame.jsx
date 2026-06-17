const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect, useRef, useCallback } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp, History, Coins, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const TICK_MS = 50;
const HISTORY_MAX = 10;

function generateCrashPoint() {
  const r = Math.random();
  if (r < 0.33) return +(1.0 + Math.random() * 0.5).toFixed(2);
  if (r < 0.60) return +(1.5 + Math.random() * 1.0).toFixed(2);
  if (r < 0.80) return +(2.5 + Math.random() * 2.5).toFixed(2);
  if (r < 0.93) return +(5.0 + Math.random() * 5.0).toFixed(2);
  return +(10 + Math.random() * 40).toFixed(2);
}

export default function Flashgame() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: wallet } = useQuery({
    queryKey: ["wallet-me", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const w = await db.entities.Wallet.filter({ user_id: user.id }, "-created_date", 1);
      return w[0] || null;
    },
    enabled: !!user?.id,
    staleTime: 0,
    refetchInterval: 5000,
  });

  const tokens = wallet?.tokens ?? 0;

  // UI state
  const [phase, setPhase] = useState("idle"); // idle | cooldown | running | crashed | cashed
  const [cooldown, setCooldown] = useState(0); // countdown seconds
  const [multiplier, setMultiplier] = useState(1.00);
  const [crashPoint, setCrashPoint] = useState(null);
  const [cashOutMultiplier, setCashOutMultiplier] = useState(null);
  const [history, setHistory] = useState([]);
  const [bet, setBet] = useState(10);
  const [autoCashOut, setAutoCashOut] = useState("");

  // Cooldown timer ref
  const cooldownRef = useRef(null);

  const startCooldown = useCallback((seconds, onDone) => {
    setCooldown(seconds);
    setPhase("cooldown");
    let remaining = seconds;
    cooldownRef.current = setInterval(() => {
      remaining -= 1;
      setCooldown(remaining);
      if (remaining <= 0) {
        clearInterval(cooldownRef.current);
        cooldownRef.current = null;
        onDone();
      }
    }, 1000);
  }, []);

  // Refs for the game loop — never stale
  const intervalRef = useRef(null);
  const gameRef = useRef({
    running: false,
    multiplier: 1.00,
    crashPoint: null,
    betVal: 0,
    autoCO: 0,
    settled: false, // true once cashout or crash processed
  });
  // track active game id to ignore stale timeouts
  const gameIdRef = useRef(0);

  const addHistory = useCallback((mult, win) => {
    setHistory(prev => [{ multiplier: mult, win }, ...prev].slice(0, HISTORY_MAX));
  }, []);

  const stopLoop = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    gameRef.current.running = false;
  }, []);

  const deductBet = async (amount) => {
    if (!user?.id) return false;
    const fresh = await db.entities.Wallet.filter({ user_id: user.id }, "-created_date", 1);
    const fw = fresh[0];
    if (!fw) { toast.error("Carteira não encontrada!"); return false; }
    if ((fw.tokens || 0) < amount) { toast.error("Tokens insuficientes!"); return false; }
    await db.entities.Wallet.update(fw.id, { tokens: fw.tokens - amount });
    queryClient.invalidateQueries({ queryKey: ["wallet-me", user.id] });
    return true;
  };

  const addWinnings = async (amount) => {
    if (!user?.id) return;
    const fresh = await db.entities.Wallet.filter({ user_id: user.id }, "-created_date", 1);
    const fw = fresh[0];
    if (!fw) return;
    await db.entities.Wallet.update(fw.id, { tokens: fw.tokens + amount });
    queryClient.invalidateQueries({ queryKey: ["wallet-me", user.id] });
  };

  const startGame = async () => {
    if (gameRef.current.running) return;
    const betVal = parseInt(bet, 10);
    if (!betVal || betVal < 1) { toast.error("Aposta inválida!"); return; }

    const ok = await deductBet(betVal);
    if (!ok) return;

    // New game session
    const thisGameId = ++gameIdRef.current;
    const cp = generateCrashPoint();
    const autoCO = parseFloat(autoCashOut) || 0;

    gameRef.current = {
      running: true,
      multiplier: 1.00,
      crashPoint: cp,
      betVal,
      autoCO,
      settled: false,
    };

    setCrashPoint(cp);
    setMultiplier(1.00);
    setCashOutMultiplier(null);
    setPhase("running");

    intervalRef.current = setInterval(() => {
      const g = gameRef.current;
      if (!g.running) return;

      const next = +(g.multiplier + 0.01).toFixed(2);
      g.multiplier = next;
      setMultiplier(next);

      // Auto cash out
      if (!g.settled && g.autoCO >= 1.01 && next >= g.autoCO) {
        g.settled = true;
        g.running = false;
        stopLoop();
        const winnings = Math.floor(g.betVal * g.autoCO);
        setCashOutMultiplier(g.autoCO);
        setPhase("cashed");
        addWinnings(winnings);
        addHistory(g.autoCO, true);
        toast.success(`Auto Cash Out a ${g.autoCO.toFixed(2)}x → +${winnings} tokens!`);
        setTimeout(() => {
          if (gameIdRef.current === thisGameId) {
            setMultiplier(1.00);
            startCooldown(3, () => setPhase("idle"));
          }
        }, 1500);
        return;
      }

      // Crash
      if (!g.settled && next >= g.crashPoint) {
        g.settled = true;
        g.running = false;
        stopLoop();
        setPhase("crashed");
        addHistory(+g.crashPoint, false);
        toast.error(`💥 CRASH a ${g.crashPoint}x — Perdeste ${g.betVal} tokens!`);
        setTimeout(() => {
          if (gameIdRef.current === thisGameId) {
            setMultiplier(1.00);
            startCooldown(3, () => setPhase("idle"));
          }
        }, 1500);
      }
    }, TICK_MS);
  };

  const cashOut = () => {
    const g = gameRef.current;
    if (!g.running || g.settled) return;
    g.settled = true;
    g.running = false;
    stopLoop();

    const mult = g.multiplier;
    const winnings = Math.floor(g.betVal * mult);
    const thisGameId = gameIdRef.current;

    setCashOutMultiplier(mult);
    setPhase("cashed");
    addWinnings(winnings);
    addHistory(mult, true);
    toast.success(`💰 Cash Out a ${mult.toFixed(2)}x → +${winnings} tokens!`);
    setTimeout(() => {
      if (gameIdRef.current === thisGameId) {
        setMultiplier(1.00);
        startCooldown(3, () => setPhase("idle"));
      }
    }, 1500);
  };

  // Cleanup on unmount
  useEffect(() => () => {
    stopLoop();
    clearInterval(cooldownRef.current);
  }, [stopLoop]);

  const isRunning = phase === "running";
  const isBlocked = phase !== "idle"; // blocks bet button during any non-idle phase

  return (
    <div className="min-h-screen p-4 flex flex-col items-center gap-6 bg-[#0f0a0a]">
      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-400" />
          <h1 className="text-2xl font-display font-bold tracking-widest">FLASHGAME</h1>
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">CRASH</Badge>
        </div>
        <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-1.5">
          <Coins className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-bold text-yellow-300">{tokens.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground">tokens</span>
        </div>
      </div>

      {/* Main crash display */}
      <div className={`w-full max-w-2xl bg-card border border-border rounded-2xl flex flex-col items-center justify-center py-16 gap-4 transition-shadow duration-500 ${
        phase === "crashed" ? "shadow-[0_0_60px_rgba(239,68,68,0.4)]" :
        phase === "cashed"  ? "shadow-[0_0_40px_rgba(34,197,94,0.35)]" :
        isRunning           ? "shadow-[0_0_30px_rgba(99,102,241,0.25)]" :
        ""
      }`}>
        {phase === "crashed" ? (
          <div className="flex flex-col items-center gap-2">
            <AlertTriangle className="w-12 h-12 text-red-400" />
            <span className="text-5xl font-display font-black text-red-400">CRASH!</span>
            <span className="text-2xl text-red-300">{crashPoint}x</span>
          </div>
        ) : phase === "cashed" ? (
          <div className="flex flex-col items-center gap-2">
            <span className="text-7xl md:text-8xl font-display font-black text-green-400">
              {cashOutMultiplier?.toFixed(2)}x
            </span>
            <span className="text-xl font-bold text-green-400">✅ CASH OUT!</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <span className={`text-7xl md:text-8xl font-display font-black ${
              multiplier < 2 ? "text-yellow-300" :
              multiplier < 5 ? "text-green-400" :
              "text-purple-400"
            }`}>
              {multiplier.toFixed(2)}x
            </span>
            {isRunning && (
              <div className="flex items-center gap-1.5 text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-semibold">A SUBIR...</span>
              </div>
            )}
            {phase === "idle" && (
              <span className="text-muted-foreground text-sm">Faz a tua aposta e começa!</span>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl p-5 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Aposta (tokens)</label>
            <Input
              type="number"
              value={bet}
              onChange={(e) => setBet(e.target.value)}
              min={1}
              disabled={isRunning}
              className="text-center font-bold"
            />
            <div className="flex gap-1">
              {[10, 50, 100, 500].map((v) => (
                <button
                  key={v}
                  onClick={() => setBet(v)}
                  disabled={isRunning}
                  className="flex-1 text-xs py-1 rounded bg-secondary hover:bg-primary/20 hover:text-primary transition-colors disabled:opacity-40"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Auto Cash Out</label>
            <Input
              type="number"
              value={autoCashOut}
              onChange={(e) => setAutoCashOut(e.target.value)}
              placeholder="ex: 2.00"
              step="0.01"
              min="1.01"
              disabled={isRunning}
              className="text-center"
            />
            <p className="text-[10px] text-muted-foreground">Deixa vazio para manual</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={startGame}
            disabled={isBlocked || !user}
            className="flex-1 font-bold text-base h-12 bg-green-600 hover:bg-green-500 text-white disabled:opacity-50"
          >
            {isRunning ? "🎲 Em Jogo..." :
             phase === "cooldown" ? `⏳ Aguarda ${cooldown}s...` :
             "🚀 Apostar"}
          </Button>
          <Button
            onClick={cashOut}
            disabled={!isRunning}
            className="flex-1 font-bold text-base h-12 bg-yellow-500 hover:bg-yellow-400 text-black disabled:opacity-50"
          >
            💰 CASH OUT
          </Button>
        </div>

        {!user && (
          <p className="text-center text-sm text-muted-foreground">Faz login para jogar com tokens reais.</p>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="w-full max-w-2xl bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Últimas Rondas</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map((h, i) => (
              <div
                key={i}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold border ${
                  h.win
                    ? "bg-green-500/10 border-green-500/30 text-green-400"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}
              >
                {h.win ? "✅" : "💥"} {h.multiplier.toFixed(2)}x
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info box */}
      <div className="w-full max-w-2xl bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3">
        <p className="text-xs text-yellow-400/80 text-center">
          ⚠️ <strong>Aviso:</strong> Este é um jogo de diversão dentro da plataforma. Os tokens são virtuais e não têm valor monetário.
        </p>
      </div>
    </div>
  );
}