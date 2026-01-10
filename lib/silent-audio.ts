// Oscillator-based silent audio helper with slight modulation to improve reliability.
// Must be triggered by a user gesture (e.g., user clicks "Start session") to satisfy autoplay policies.

let audioCtx: AudioContext | null = null;
let oscillator: OscillatorNode | null = null;
let gainNode: GainNode | null = null;
let modulationInterval: number | null = null;
let started = false;

const BASE_GAIN = 0.00001; // Very small, near-silent value
const MOD_PERIOD_MS = 12_000; // Change gain every 12s to avoid some aggressive optimizers

export async function startSilentAudio() {
  if (started) return;
  try {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Resume if suspended (often required and must be called after a user gesture)
    if (audioCtx.state === "suspended") {
      try {
        await audioCtx.resume();
      } catch (e) {
        console.warn("[silent-audio] resume failed:", e);
      }
    }

    oscillator = audioCtx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = 440; // audible frequency but gain is near zero

    gainNode = audioCtx.createGain();
    gainNode.gain.value = BASE_GAIN;

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Start oscillator
    oscillator.start();

    // Periodically modulate gain slightly to reduce chance of throttling
    modulationInterval = window.setInterval(() => {
      if (!gainNode || !audioCtx) return;
      const now = audioCtx.currentTime;
      // small variation around BASE_GAIN
      const variation = BASE_GAIN * (0.8 + Math.random() * 0.4);
      try {
        gainNode.gain.setValueAtTime(variation, now);
        // restore quickly to base to keep it near-silent
        gainNode.gain.setValueAtTime(BASE_GAIN, now + 0.2);
      } catch (e) {
        // setValueAtTime may throw if AudioContext closed; ignore
      }
    }, MOD_PERIOD_MS);

    started = true;
    console.log("[silent-audio] started (oscillator)");
  } catch (err) {
    console.error("[silent-audio] failed to start:", err);
  }
}

export function stopSilentAudio() {
  try {
    if (!started) return;

    if (modulationInterval !== null) {
      clearInterval(modulationInterval);
      modulationInterval = null;
    }

    if (oscillator) {
      try {
        oscillator.stop();
      } catch (e) {}
      try { oscillator.disconnect(); } catch (e) {}
      oscillator = null;
    }

    if (gainNode) {
      try { gainNode.disconnect(); } catch (e) {}
      gainNode = null;
    }

    if (audioCtx) {
      // Close the context to free resources
      audioCtx.close().catch(() => {});
      audioCtx = null;
    }

    started = false;
    console.log("[silent-audio] stopped");
  } catch (err) {
    console.error("[silent-audio] stop error:", err);
  }
}
