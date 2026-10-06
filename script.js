(() => {
  "use strict";

  // The code is never fetched from anywhere — it's derived once, here, from
  // the five clues on screen. Mastermind-style: for each clue, N digits of
  // the three shown are present somewhere in the real code, and the clue
  // says whether those matches land in the same position or not.
  const SECRET_CODE = [3, 9, 4];

  const digits = [0, 0, 0];
  const dialEls = [
    document.getElementById("digit-0"),
    document.getElementById("digit-1"),
    document.getElementById("digit-2"),
  ];
  const feedbackEl = document.getElementById("feedback");
  const submitBtn = document.getElementById("submit-btn");
  const cardEl = document.querySelector(".card");
  const muteBtn = document.getElementById("mute-btn");
  const soundOnIcon = muteBtn.querySelector(".icon-sound-on");
  const soundOffIcon = muteBtn.querySelector(".icon-sound-off");

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------------- Sound (Web Audio, no asset files) ---------------- */

  let audioCtx = null;
  let muted = false;

  try {
    muted = localStorage.getItem("crackTheCode:muted") === "1";
  } catch (_) {
    /* storage unavailable — default to unmuted */
  }
  updateMuteIcon();

  function getAudioCtx() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      audioCtx = new Ctx();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function tone({ freq, duration, type = "sine", delay = 0, gain = 0.18 }) {
    if (muted) return;
    const ctx = getAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const start = ctx.currentTime + delay;
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(gain, start + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  function playClick() {
    tone({ freq: 720, duration: 0.07, type: "triangle", gain: 0.12 });
  }

  function playFail() {
    tone({ freq: 190, duration: 0.22, type: "sawtooth", gain: 0.16 });
    tone({ freq: 140, duration: 0.26, type: "sawtooth", delay: 0.1, gain: 0.14 });
  }

  function playSuccess() {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      tone({ freq, duration: 0.3, type: "sine", delay: i * 0.1, gain: 0.16 });
    });
  }

  function vibrate(pattern) {
    if (navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (_) {
        /* ignore */
      }
    }
  }

  function updateMuteIcon() {
    soundOnIcon.hidden = muted;
    soundOffIcon.hidden = !muted;
    muteBtn.setAttribute("aria-pressed", String(muted));
    muteBtn.setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
  }

  muteBtn.addEventListener("click", () => {
    muted = !muted;
    updateMuteIcon();
    try {
      localStorage.setItem("crackTheCode:muted", muted ? "1" : "0");
    } catch (_) {
      /* ignore */
    }
    if (!muted) playClick();
  });

  /* ---------------- Dials ---------------- */

  function renderDigit(index) {
    dialEls[index].textContent = String(digits[index]);
  }

  document.querySelectorAll(".dial").forEach((dialEl) => {
    const index = Number(dialEl.dataset.index);
    const upBtn = dialEl.querySelector(".up");
    const downBtn = dialEl.querySelector(".down");

    upBtn.addEventListener("click", () => {
      digits[index] = (digits[index] + 1) % 10;
      renderDigit(index);
      playClick();
      vibrate(8);
    });

    downBtn.addEventListener("click", () => {
      digits[index] = (digits[index] + 9) % 10;
      renderDigit(index);
      playClick();
      vibrate(8);
    });
  });

  /* ---------------- Submit ---------------- */

  function setFeedback(message, state) {
    feedbackEl.textContent = message;
    feedbackEl.classList.remove("success", "fail");
    if (state) feedbackEl.classList.add(state);
  }

  submitBtn.addEventListener("click", () => {
    const correct = digits.every((d, i) => d === SECRET_CODE[i]);

    if (correct) {
      setFeedback(
        "The tumblers click into place. The cache is yours — happy hunting!",
        "success"
      );
      playSuccess();
      vibrate([10, 40, 10, 40, 30]);
      if (!prefersReducedMotion) {
        cardEl.classList.remove("unlocked");
        void cardEl.offsetWidth; // restart animation
        cardEl.classList.add("unlocked");
        launchConfetti();
      }
    } else {
      setFeedback("Not quite — the lock holds. Re-check the clues and try again.", "fail");
      playFail();
      vibrate(120);
      if (!prefersReducedMotion) {
        cardEl.classList.remove("shake");
        void cardEl.offsetWidth;
        cardEl.classList.add("shake");
      }
    }
  });

  /* ---------------- Confetti ---------------- */

  const canvas = document.getElementById("confetti-canvas");
  const ctx2d = canvas.getContext("2d");
  let particles = [];
  let confettiFrame = null;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  const CONFETTI_COLORS = ["#d9a441", "#f3c66d", "#6fcf8f", "#ece0c4", "#e2685a"];

  function launchConfetti() {
    const count = 110;
    const originX = canvas.width / 2;
    particles = Array.from({ length: count }, () => ({
      x: originX + (Math.random() - 0.5) * 120,
      y: canvas.height * 0.28 + (Math.random() - 0.5) * 40,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * -6 - 4,
      size: Math.random() * 6 + 4,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      life: 0,
      maxLife: 140 + Math.random() * 40,
    }));

    if (confettiFrame) cancelAnimationFrame(confettiFrame);
    const gravity = 0.18;
    const step = () => {
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      let stillAlive = false;

      particles.forEach((p) => {
        p.life += 1;
        if (p.life > p.maxLife) return;
        stillAlive = true;
        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        const fade = 1 - p.life / p.maxLife;
        ctx2d.save();
        ctx2d.globalAlpha = Math.max(fade, 0);
        ctx2d.translate(p.x, p.y);
        ctx2d.rotate(p.rotation);
        ctx2d.fillStyle = p.color;
        ctx2d.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx2d.restore();
      });

      if (stillAlive) {
        confettiFrame = requestAnimationFrame(step);
      } else {
        ctx2d.clearRect(0, 0, canvas.width, canvas.height);
        confettiFrame = null;
      }
    };
    confettiFrame = requestAnimationFrame(step);
  }
})();
