import powerupSound from './assets/Powerup sound.mp3';
import characterChangingSound from './assets/character changing sound.mp3';

// Web Audio API Synthesizer for DBZ Retro Sound Effects
let audioCtx = null;
let isMuted = false;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setMuted(muted) {
  isMuted = muted;
}

export function getMuted() {
  return isMuted;
}

// Generate a brief white noise buffer
function createNoiseBuffer(ctx, duration) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

export function playSound(type) {
  if (isMuted) return null;
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  switch (type) {
    case 'characterChange': {
      const audio = new Audio(characterChangingSound);
      audio.muted = isMuted;
      audio.volume = 0.5;
      audio.play().catch(e => console.log("Audio play blocked by browser:", e));
      break;
    }

    case 'select': {
      // Short menu select beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
      break;
    }
    
    case 'teleport': {
      // Retro DBZ Teleport (Zanish/Vanish) effect: high-pitched swoosh
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(2000, now + 0.18);

      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(150, now);
      osc2.frequency.exponentialRampToValueAtTime(2200, now + 0.18);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(3500, now + 0.18);
      filter.Q.setValueAtTime(5, now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.22);
      osc2.stop(now + 0.22);
      break;
    }

    case 'impact':
    case 'blast': {
      // Ki Blast Release
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, 0.4);
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, now);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.4);

      const subOsc = ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(150, now);
      subOsc.frequency.linearRampToValueAtTime(40, now + 0.3);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      subOsc.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      subOsc.start(now);
      noise.stop(now + 0.4);
      subOsc.stop(now + 0.4);
      break;
    }

    case 'kamehameha':
    case 'finalflash':
    case 'burning': {
      // Complex charging energy and then firing!
      // Step 1: Play short charging whistle
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.8);
      
      // Pitch flutter (vibrato)
      const vibrato = ctx.createOscillator();
      const vibratoGain = ctx.createGain();
      vibrato.frequency.value = 15; // 15 Hz modulation
      vibratoGain.gain.value = 40; // Pitch fluctuation range
      
      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);
      
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc.connect(gain);
      gain.connect(ctx.destination);
      
      vibrato.start(now);
      osc.start(now);
      vibrato.stop(now + 0.85);
      osc.stop(now + 0.85);

      // Step 2: Schedule the actual firing blast slightly delayed
      setTimeout(() => {
        if (isMuted) return;
        const blastCtx = getAudioContext();
        const bNow = blastCtx.currentTime;
        
        // Massive energy release noise + wave
        const bNoise = blastCtx.createBufferSource();
        bNoise.buffer = createNoiseBuffer(blastCtx, 0.8);
        
        const bFilter = blastCtx.createBiquadFilter();
        bFilter.type = 'bandpass';
        bFilter.frequency.setValueAtTime(2000, bNow);
        bFilter.frequency.exponentialRampToValueAtTime(300, bNow + 0.8);
        bFilter.Q.value = 3;

        const bassOsc = blastCtx.createOscillator();
        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(80, bNow);
        bassOsc.frequency.linearRampToValueAtTime(50, bNow + 0.8);

        const bGain = blastCtx.createGain();
        bGain.gain.setValueAtTime(0.35, bNow);
        bGain.gain.exponentialRampToValueAtTime(0.001, bNow + 0.8);

        bNoise.connect(bFilter);
        bFilter.connect(bGain);
        bassOsc.connect(bGain);
        bGain.connect(blastCtx.destination);

        bNoise.start(bNow);
        bassOsc.start(bNow);
        bNoise.stop(bNow + 0.8);
        bassOsc.stop(bNow + 0.8);
      }, 700);

      break;
    }
    
    default:
      break;
  }
}

// Start continuous Ki energy charging hum loop (returns control object)
export function startKiCharge() {
  if (isMuted) {
    return { stop: () => {} };
  }
  
  const audio = new Audio(powerupSound);
  audio.loop = true;
  audio.volume = 0.55;
  audio.muted = isMuted;
  audio.play().catch(e => console.log("Audio play blocked by browser:", e));

  return {
    stop: () => {
      // Fade out volume gradually for smooth audio release transition
      const fadeInterval = setInterval(() => {
        if (audio.volume > 0.05) {
          audio.volume -= 0.05;
        } else {
          clearInterval(fadeInterval);
          audio.pause();
        }
      }, 20);
    }
  };
}
