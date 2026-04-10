"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { SubNavbar } from "@/components/Navbar";
import { SimpleFooter } from "@/components/Footer";
import { RetellWebClient } from "retell-client-js-sdk";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://farmdoctor-backend.onrender.com";

const MAX_CALL_SECONDS = 3 * 60; // 3-minute limit
const CALL_COOLDOWN_KEY = "fd_last_call";
const CALL_COOLDOWN_MS = 24 * 60 * 60 * 1000;

function canCallToday(): boolean {
  try {
    const last = localStorage.getItem(CALL_COOLDOWN_KEY);
    if (!last) return true;
    return Date.now() - Number(last) >= CALL_COOLDOWN_MS;
  } catch { return true; }
}

function markCallUsed(): void {
  try { localStorage.setItem(CALL_COOLDOWN_KEY, String(Date.now())); } catch {}
}

type CallState = "idle" | "connecting" | "active" | "ended";

export function CallClient() {
  const [state, setState] = useState<CallState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [timer, setTimer] = useState("00:00");
  const [subText, setSubText] = useState(
    "Tap the green button to start a voice call with our AI agronomist"
  );
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

  const [sdkLoaded] = useState(true);
  const [callUsed, setCallUsed] = useState(false);

  // Check on mount if call was already used today
  useEffect(() => {
    setCallUsed(!canCallToday());
  }, []);

  const endCallRef = useRef<(() => void) | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - startTimeRef.current) / 1000
      );
      const mins = Math.floor(elapsed / 60)
        .toString()
        .padStart(2, "0");
      const secs = (elapsed % 60).toString().padStart(2, "0");
      setTimer(`${mins}:${secs}`);

      if (elapsed >= MAX_CALL_SECONDS && endCallRef.current) {
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
    setState("ended");
    setSubText("Tap the green button to call again");
    setIsTalking(false);
    stopTimer();
    retellRef.current = null;
  }, [stopTimer]);

  useEffect(() => {
    endCallRef.current = endCall;
  }, [endCall]);

  const startCall = useCallback(async () => {
    if (state === "active" || state === "connecting") return;

    // Enforce 1 call/day on frontend
    if (!canCallToday()) {
      setCallUsed(true);
      setError("You can only make 1 call per day. Please try again tomorrow.");
      return;
    }

    setState("connecting");
    setError(null);
    setIsTalking(false);
    setSubText("Setting up your call with Farm Doctor AI");

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/retell/create-web-call`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 429) {
          setCallUsed(true);
          markCallUsed();
        }
        throw new Error(errData.message || "Failed to create call session");
      }

      const data = await res.json();

      if (!data.access_token)
        throw new Error("No access token received from server");

      const client = new RetellWebClient();
      retellRef.current = client;

      client.on("call_started", () => {
        setState("active");
        setSubText("Speak to describe your crop issue");
        markCallUsed();
        setCallUsed(true);
        startTimer();
      });

      client.on("call_ended", () => {
        setState("ended");
        setSubText("Tap the green button to call again");
        setIsTalking(false);
        stopTimer();
        retellRef.current = null;
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
        setSubText("AI is speaking...");
      });

      client.on("agent_stop_talking", () => {
        setIsTalking(false);
        setSubText("Listening...");
      });

      await client.startCall({
        accessToken: data.access_token,
      });
    } catch (err: unknown) {
      setState("idle");
      setError(
        (err as Error).message ||
        "Failed to start call. Please check your microphone permissions and try again."
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

  const elapsed = startTimeRef.current
    ? Math.floor((Date.now() - startTimeRef.current) / 1000)
    : 0;

  const remaining = MAX_CALL_SECONDS - elapsed;
  const isLowTime = isActive && remaining <= 60 && remaining > 0;

  const statusText =
    state === "connecting"
      ? "Connecting..."
      : state === "active"
        ? "Call Active"
        : state === "ended"
          ? "Call Ended"
          : "Farm Doctor AI";

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
            className={`call-timer${showTimer ? " visible" : ""}${isLowTime ? " low" : ""
              }`}
          >
            {timer}
          </div>

          {isActive && (
            <div className="call-limit-hint">3 min limit &middot; 1 call per day</div>
          )}

          <div className="call-controls">
            {showMute && (
              <button
                className={`ctrl-btn btn-mute${isMuted ? " muted" : ""}`}
                onClick={toggleMute}
                title={isMuted ? "Unmute" : "Mute"}
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
                onClick={startCall}
                title={callUsed ? "1 call per day – try again tomorrow" : "Start Call"}
                disabled={!sdkLoaded || callUsed}
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
                title="End Call"
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
              <strong>How it works:</strong> Click the call button to connect
              with our AI agronomist. Describe your crop problems or ask farming
              questions in English, French, or Pidgin. The AI will respond with
              expert advice in real-time.
            </p>
          </div>
        </div>
      </main>

      <SimpleFooter />
    </>
  );
}