"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { SubNavbar } from "@/components/Navbar";
import { SimpleFooter } from "@/components/Footer";
import { RetellWebClient } from "retell-client-js-sdk";
import { useI18n } from "@/lib/i18n";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://shon-unmonumented-nigel.ngrok-free.dev";

const apiHeaders: Record<string, string> = {
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "true",
};

const MAX_DAILY_SECONDS = 3 * 60; // 3 minutes total per day
const USAGE_KEY = "fd_call_usage";

interface UsageData { date: string; usedSeconds: number }

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getUsage(): UsageData {
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    if (!raw) return { date: todayKey(), usedSeconds: 0 };
    const data: UsageData = JSON.parse(raw);
    if (data.date !== todayKey()) return { date: todayKey(), usedSeconds: 0 };
    return data;
  } catch { return { date: todayKey(), usedSeconds: 0 }; }
}

function getRemainingSeconds(): number {
  return Math.max(0, MAX_DAILY_SECONDS - getUsage().usedSeconds);
}

function addUsedSeconds(seconds: number): number {
  const usage = getUsage();
  usage.usedSeconds += Math.ceil(seconds);
  try { localStorage.setItem(USAGE_KEY, JSON.stringify(usage)); } catch {}
  return Math.max(0, MAX_DAILY_SECONDS - usage.usedSeconds);
}

function formatTime(totalSec: number): string {
  const m = Math.floor(totalSec / 60).toString().padStart(2, "0");
  const s = (totalSec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

type CallState = "idle" | "connecting" | "active" | "ended";

export function CallClient() {
  const { t } = useI18n();
  const tRef = useRef(t);
  useEffect(() => { tRef.current = t; }, [t]);

  const [state, setState] = useState<CallState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [timer, setTimer] = useState("00:00");
  const [callElapsed, setCallElapsed] = useState(0);
  const [subText, setSubText] = useState("");
  const [isTalking, setIsTalking] = useState(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const retellRef = useRef<RetellWebClient | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Request mic permission once on mount (must be in useEffect for SSR safety)
  useEffect(() => {
    navigator.mediaDevices?.getUserMedia({ audio: true })
      .then((stream) => { mediaStreamRef.current = stream; })
      .catch((err) => { console.error("Microphone access denied:", err); });
    return () => {
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const [remainingSec, setRemainingSec] = useState(MAX_DAILY_SECONDS);
  const exhausted = remainingSec <= 0;

  // Load remaining seconds on mount
  useEffect(() => {
    setRemainingSec(getRemainingSeconds());
  }, []);

  const endCallRef = useRef<(() => void) | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback((maxSec: number) => {
    startTimeRef.current = Date.now();
    setCallElapsed(0);
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - startTimeRef.current) / 1000
      );
      setCallElapsed(elapsed);
      setTimer(formatTime(elapsed));
      setRemainingSec(Math.max(0, getRemainingSeconds() - elapsed));

      if (elapsed >= maxSec && endCallRef.current) {
        endCallRef.current();
      }
    }, 1000);
  }, []);

  const endCall = useCallback(() => {
    if (retellRef.current) {
      try {
        retellRef.current.stopCall();
      } catch { }
    }

    // Calculate duration and report to backend (reset ref to prevent double-counting)
    const duration = startTimeRef.current
      ? Math.ceil((Date.now() - startTimeRef.current) / 1000)
      : 0;
    startTimeRef.current = 0;
    if (duration > 0) {
      const left = addUsedSeconds(duration);
      setRemainingSec(left);
      fetch(`${BACKEND_URL}/api/retell/call-ended`, {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify({ duration }),
      }).catch(() => {});
    }

    setState("ended");
    setSubText(getRemainingSeconds() > 0
      ? tRef.current("call.tapAgain")
      : tRef.current("call.exhausted"));
    setIsTalking(false);
    stopTimer();
    retellRef.current = null;
  }, [stopTimer]);

  useEffect(() => {
    endCallRef.current = endCall;
  }, [endCall]);

  const startCall = useCallback(async () => {
    if (state === "active" || state === "connecting") return;

    const left = getRemainingSeconds();
    setRemainingSec(left);
    if (left <= 0) {
      setError(tRef.current("call.exhaustedError"));
      return;
    }

    setState("connecting");
    setError(null);
    setIsTalking(false);
    setSubText(tRef.current("call.setup"));

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/retell/create-web-call`,
        {
          method: "POST",
          headers: apiHeaders,
          body: JSON.stringify({}),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 429) {
          setRemainingSec(0);
        }
        throw new Error(errData.message || "Failed to create call session");
      }

      const data = await res.json();
      const serverRemaining: number = data.remaining_seconds ?? left;

      if (!data.access_token)
        throw new Error("No access token received from server");

      const client = new RetellWebClient();
      retellRef.current = client;

      client.on("call_started", () => {
        setState("active");
        setSubText(tRef.current("call.active"));
        startTimer(serverRemaining);
      });

      client.on("call_ended", () => {
        endCallRef.current?.();
      });

      client.on("error", (e: unknown) => {
        setState("idle");
        setError(
          "Call error: " +
          ((e as { message?: string })?.message ||
            "Connection lost. Please try again.")
        );
        setIsTalking(false);
        stopTimer();
        retellRef.current = null;
      });

      client.on("agent_start_talking", () => {
        setIsTalking(true);
        setSubText(tRef.current("call.active"));
      });

      client.on("agent_stop_talking", () => {
        setIsTalking(false);
        setSubText(tRef.current("call.active"));
      });

      await client.startCall({
        accessToken: data.access_token,
      });
    } catch (err: unknown) {
      setState("idle");
      setError(
        (err as Error).message ||
        tRef.current("call.startError")
      );
    }
  }, [state, startTimer, stopTimer]);

  const toggleMute = useCallback(() => {
    if (!mediaStreamRef.current || state !== "active") return;

    const next = !isMuted;

    mediaStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !next; // disable = mute
    });

    setIsMuted(next);
  }, [isMuted, state]);
  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const isActive = state === "active";
  const isConnecting = state === "connecting";
  const showCall = state === "idle" || state === "ended";
  const showHangup = state === "connecting" || state === "active";
  const showMute = state === "active";
  const showTimer = state === "active" || state === "ended";

  // Blink red when 67% of today's allowance is used (including this call)
  const totalUsedToday = getUsage().usedSeconds + callElapsed;
  const isWarning = isActive && totalUsedToday >= MAX_DAILY_SECONDS * 0.67;

  const statusText =
    state === "connecting"
      ? t("call.connecting")
      : state === "active"
        ? t("call.active")
        : state === "ended"
          ? t("call.ended")
          : t("call.title");

  return (
    <>
      <SubNavbar />

      <main className="call-page">
        <div className="call-container">
          <div className="call-orb-wrap">
            <div
              className={`call-orb${isActive || isConnecting ? " active" : ""
                }${isTalking ? " talking" : ""}`}
            >
              <div className="orb-pulse" />
              {isTalking && <div className="orb-pulse orb-pulse-2" />}
              <Image
                src="/fdlogo.png"
                alt="Farm Doctor AI"
                width={100}
                height={100}
              />
            </div>
          </div>

          <div
            className={`waveform${isActive ? " active" : ""}${isTalking ? " talking" : ""
              }`}
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="wave-bar" />
            ))}
          </div>

          <div className="call-status">{statusText}</div>
          <div className="call-sub">{subText}</div>

          <div
            className={`call-timer${showTimer ? " visible" : ""}${isWarning ? " low" : ""
              }`}
          >
            {timer}
          </div>

          {isActive && (
            <div className="call-limit-hint">{formatTime(remainingSec)} {t("call.remaining")}</div>
          )}

          <div className="call-controls">
            {showMute && (
              <button
                className={`ctrl-btn btn-mute${isMuted ? " muted" : ""}`}
                onClick={toggleMute}
                title={isMuted ? t("call.unmute") : t("call.mute")}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                  <path d="M19 10v2a7 7 0 01-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </button>
            )}

            {showCall && (
              <button
                className="ctrl-btn btn-call"
                style={{ opacity: exhausted ? 0.5 : 1 }}
                onClick={startCall}
                title={exhausted ? t("call.noMinutes") : t("call.start")}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
              </button>
            )}

            {showHangup && (
              <button
                className="ctrl-btn btn-hangup"
                style={{ display: "flex" }}
                onClick={endCall}
                title={t("call.end")}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
              </button>
            )}
          </div>

          {error && (
            <div className="call-error" style={{ display: "block" }}>
              {error}
            </div>
          )}

          <div className="call-info">
            <p>
              <strong>{t("call.howTitle")}</strong> {t("call.howDesc")}
            </p>
          </div>
        </div>
      </main>

      <SimpleFooter />
    </>
  );
}