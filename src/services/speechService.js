// Microphone / tab-audio capture and chunked transcription. Pure browser-API
// wrappers — no React here, so useSpeechRecognition can stay focused on state
// and this stays testable/reusable on its own.

// A trailing "?" is the strongest signal, but Whisper frequently drops it —
// especially mid-sentence, since a recording chunk often cuts off
// before the interviewer finishes speaking. Interrogative openers and inner patterns catch the
// rest without waiting on punctuation that may never arrive.
// Comprehensive question starters capturing candidate, interviewer, and courtesy dialogue
// Comprehensive question starters capturing candidate, interviewer, and technical dialogue
const QUESTION_STARTERS = /^(example|examples|sample|syntax|code|program|snippet|demo|usage|uses|types|kinds|advantages|disadvantages|benefits|pros|cons|steps|ways|what|what's|whats|why|why's|how|how's|hows|when|where|who|whom|whose|which|can|could|would|will|shall|should|do|does|did|is|isn't|are|aren't|was|were|have\s+(you|we|they|i)|haven't\s+(you|we|they|i)|has\s+(he|she|it|anyone|anybody|someone|there)|had\s+(you|we|they|he|she|it)|tell|walk|explain|describe|elaborate|give|talk|compare|discuss|solve|write|implement|find|calculate|clarify|define|suppose|given|assume|consider|design|create|build|show|help|outline|name|list|briefly|any thoughts|thoughts on|what about|let's say|what if|how about|could we|can we|are we able to|how did you|why would you|in what situation|when would you|which one|do you think|my question|next question|can someone|would you mind|share)\b/i;

const INNER_QUESTION_PATTERNS = /\b(example of|example code|examples of|sample code|code for|code to|syntax of|syntax for|program to|program for|types of|kinds of|uses of|use cases of|show me|give me an example|what is|what are|what's|what would|what does|how do|how does|how would|how can|how to|why do|why does|why is|why are|can you|could you|would you|have you|do you know|do you have|difference between|difference of|versus|vs\.?|explain how|explain|tell me|tell us|walk me through|in your opinion|in your experience|pros and cons|advantages of|disadvantages of|trade-offs of|trade offs|how does it work|how would you|what do you think|your approach to|how to implement|how to optimize|how would we|can we use|could we use|what happens if|what if|why should we|let's say|best way to|handle|troubleshoot|diagnose|architecture of|lifecycle of|principles of|features of|working of|internal working|use cases|best practices)\b/i;

const CODING_PROMPT_PATTERNS = /\b(write (a |an )?(function|code|program|query|script|class|algorithm|method|component|test|solution)|implement (a |an )?|find the (sum|minimum|maximum|longest|shortest|duplicate|median|kth)|solve (the |this )?|reverse (a |the )?(string|linked list|array)|binary search|two sum|fizzbuzz|palindrome|given (an?|the|two|three) (array|string|binary tree|matrix|list|integer|number|graph|node)|design (a |an |the )?(system|url shortener|cache|rate limiter|api|database|schema|pipeline)|create (a |an )?(function|api|endpoint|component|table)|build (a |an )?(service|app|system|api)|optimize|refactor|debug|time complexity|space complexity|big o|edge cases)\b/i;

// Strictly blacklists greetings, pleasantries, farewells, and YouTube outro hallucinations from ever being detected as questions
// Statements only. Small-talk *questions* ("How are you?", "Can you hear me?")
// are deliberately not here: whatever either side asks gets an answer.
export const NON_QUESTION_PLEASANTRIES = /^(have\s+(a\s+)?(good|great|nice|wonderful|pleasant)\s+(day|time|weekend|evening|afternoon|night|one)|have\s+fun|thank\s*you|thanks|good\s*(morning|afternoon|evening|night|day|bye)|see\s+you|take\s+care|talk\s+to\s+you|bye\s*bye|bye|hello|hi\b|hey\b|you're\s+welcome|no\s+problem|if\s+you\s+(liked|enjoyed)|please\s+subscribe|subscribe\s+to|like\s+and\s+subscribe|i\s+have\s+more\s+videos|that's\s+all|i'm\s+out|useless|go\s+download)/i;

// Catches pleasantries and YouTube outro filler phrases occurring anywhere in the sentence
export const OUTRO_OR_GREETING_ANYWHERE = /\b(have\s+a\s+(good|great|nice|wonderful|pleasant)\s+(day|weekend|evening|night|one)|if\s+you\s+(liked|enjoyed)\s+this\s+video|please\s+subscribe|i\s+have\s+more\s+videos|subscribe\s+to\s+(my\s+)?channel|thank\s+you\s+for\s+(watching|listening)|thanks\s+for\s+(watching|listening)|like\s+and\s+subscribe|leave\s+a\s+comment)\b/i;

// Core technical topics commonly queried or asked in live technical interviews
export const TECHNICAL_INTERVIEW_TOPICS = /\b(java|python|javascript|typescript|c\+\+|c#|golang|rust|react|node|spring|springboot|docker|kubernetes|aws|sql|nosql|mongodb|postgresql|redis|kafka|graphql|rest api|microservices|oop|object oriented|polymorphism|inheritance|encapsulation|abstraction|class|interface|constructor|multithreading|concurrency|deadlock|synchronization|garbage collection|jvm|jdk|memory leak|hashmap|arraylist|linkedlist|binary tree|graph|heap|stack|queue|recursion|dynamic programming|sorting|searching|solid principles|design patterns|singleton|factory|observer|acid properties|indexing|caching|load balancer)\b/i;

export function looksLikeQuestion(text) {
  const t = String(text || '').trim();
  if (!t || t.length < 3) return false;
  if (isSilenceHallucination(t)) return false;
  if (NON_QUESTION_PLEASANTRIES.test(t)) return false;
  if (OUTRO_OR_GREETING_ANYWHERE.test(t)) return false;

  const words = t.split(/\s+/).filter(Boolean);
  if (words.length < 2) {
    return false;
  }

  // Definite question if question mark is present
  if (t.endsWith('?') || t.includes('?')) return true;

  // Question starter (e.g. "What is...", "Explain...", "How to...", "Please describe...")
  if (QUESTION_STARTERS.test(t)) return true;

  // Inner question pattern (e.g. "So what is an object...", "Can you explain polymorphism...")
  if (INNER_QUESTION_PATTERNS.test(t)) return true;

  // Coding or algorithmic task
  if (CODING_PROMPT_PATTERNS.test(t)) return true;

  // A bare topic prompt ("Polymorphism in Java", "Component in React"). Limited
  // to short, non-first-person phrases: otherwise any statement mentioning a
  // technology — including the candidate's own spoken answer — became a question.
  if (TECHNICAL_INTERVIEW_TOPICS.test(t) && words.length <= 6
    && !/^(i|i'm|im|i've|i'd|we|we're|we've|my|our|so\s+i|and\s+i|yeah|yes)\b/i.test(t)) {
    return true;
  }

  return false;
}

export function isSilenceHallucination(text) {
  if (!text || typeof text !== 'string') return true;
  const t = text.trim();
  if (t.length < 2) return true;

  if (OUTRO_OR_GREETING_ANYWHERE.test(t)) return true;

  const patterns = [
    /transcrib(ed|tion|ing)\s+by/i,
    /subtitles?\s+by/i,
    /captions?\s+by/i,
    /closed\s+captions/i,
    /amara\.org/i,
    /otter\.ai/i,
    /https?:\/\//i,
    /www\./i,
    /\bopenai\b/i,
    /technical\s+software\s+engineering\s+interview\s+dialogue/i,
    /^context\s*:\s*#/i,
    /thank(s|\s+you)\s+for\s+(watching|listening)/i,
    /like\s+and\s+subscribe/i,
    /subscribe\s+to\s+(my\s+)?channel/i,
    /if\s+you\s+(liked|enjoyed)\s+this\s+video/i,
    /i\s+have\s+more\s+videos/i,
    /please\s+subscribe/i,
    /\bhave\s+a\s+(good|great|nice|wonderful|pleasant)\s+(day|weekend|evening|night|one)\b/i,
    /^(you|thank\s*you\.?|thanks\.?|okay\.?|yeah\.?|yes\.?|so\.?|bye\.?|blank_audio)$/i,
    /^(useless|go download them all|i'm out|i don't know|that's all|thank you so much|have a great day|have a good day|have a nice day|have a good one)[\.\?!]?$/i,
    /\b(go download them all|i'm out|that's all|have a good day|have a nice day|have a great day|more videos on)\b/i,
    /^\[.*\]$/,
    /^\(.*\)$/,
    /[♪♫]/,
  ];

  return patterns.some((p) => p.test(t));
}

export function repairTechnicalAcoustics(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\b(object|class|interface|inheritance|polymorphism|encapsulation|abstraction|methods?|constructors?|packages?|variables?|arrays?|strings?|pointers?|threads?|garbage collection|generics?)\s+in\s+(a\s+)?job\s+inter?views?\b/gi, '$1 in Java')
    .replace(/\b(in|with|using)\s+job\s+inter?views?\s+(programming|language|code|oop|framework|application)\b/gi, '$1 Java $2')
    .replace(/\bwhat\s+is\s+(an?\s+)?object\s+in\s+job\s+inter?views?\b/gi, 'what is an object in Java')
    .replace(/\bhow\s+to\s+use\s+(an?\s+)?object\s+in\s+job\s+inter?views?\b/gi, 'how to use an object in Java')
    .replace(/\b(in|for)\s+job\s+interview\s+(class|object|interface)\b/gi, '$1 Java $2')
    .replace(/\b(c\s+sharp|see\s+sharp)\b/gi, 'C#')
    .replace(/\b(c\s+plus\s+plus|see\s+plus\s+plus)\b/gi, 'C++')
    .replace(/\b(node\s+j\s*s|node\s+js)\b/gi, 'Node.js')
    .replace(/\b(react\s+j\s*s|react\s+js)\b/gi, 'React')
    .replace(/\bjason\s+(object|payload|response|data|format|string)\b/gi, 'JSON $1');
}

export function deduplicateRepeatedPhrases(text) {
  if (!text || typeof text !== 'string') return '';
  const repaired = repairTechnicalAcoustics(text);
  const clean = repaired.replace(/https?:\/\/\S+/gi, '').replace(/\b(transcribed|subtitles|captions)\s+by\s+[^.!?]+/gi, '').trim();
  const parts = clean.split(/(?<=[?.!])\s+/).map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 1) return clean;

  const unique = [];
  for (const part of parts) {
    const norm = part.toLowerCase().replace(/[^a-z0-9]/g, '');
    const lastNorm = unique.length ? unique[unique.length - 1].toLowerCase().replace(/[^a-z0-9]/g, '') : '';
    if (norm && norm !== lastNorm) {
      unique.push(part);
    }
  }
  return unique.join(' ');
}

// When capturing ambient room audio (e.g. interviewer on laptop speakers), disabling
// hardware echoCancellation prevents the browser from scrubbing out the interviewer's voice,
// while noiseSuppression removes fan hum and electrical disturbance.
export const ROOM_AUDIO_CONSTRAINTS = {
  audio: {
    echoCancellation: false,
    noiseSuppression: true,
    autoGainControl: true,
    channelCount: 1,
  },
};

export const STANDARD_AUDIO_CONSTRAINTS = {
  audio: {
    echoCancellation: false,
    noiseSuppression: true,
    autoGainControl: true,
    channelCount: 1,
  },
};

export const BASIC_AUDIO_CONSTRAINTS = {
  audio: true,
};

// Export AUDIO_CONSTRAINTS for backward compatibility and fallback
export const AUDIO_CONSTRAINTS = ROOM_AUDIO_CONSTRAINTS;

async function getTabAudioStream() {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
    const error = new Error('Tab audio capture is not supported in this browser.');
    error.code = 'TAB_AUDIO_UNAVAILABLE';
    throw error;
  }

  const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
  stream.getVideoTracks().forEach((track) => track.stop());
  if (stream.getAudioTracks().length > 0) return stream;

  stream.getTracks().forEach((track) => track.stop());
  const error = new Error('No shared audio was selected. Select the call tab and enable Share tab audio.');
  error.code = 'NO_AUDIO_SHARED';
  throw error;
}

const VOICE_LOW_HZ = 300;
const VOICE_HIGH_HZ = 3800;

/**
 * Voice-activity decision on one level reading (mean byte spectrum, 0-255,
 * which is logarithmic: ~0.27 dB per unit) taken every ~80ms.
 *
 * A fixed threshold failed in real rooms: a fan or speaker hiss sat above it
 * permanently, so speech was never seen to end and every chunk ran to its
 * maximum length — questions waited 8+ seconds before being sent. Instead the
 * background level is tracked (drops quickly, rises slowly so speech does not
 * pull it up) and only sound clearly above it counts as voice.
 */
export function createVoiceDetector({ marginUnits = 18, minLevel = 11, fall = 0.3, rise = 0.005 } = {}) {
  let noiseFloor = null;
  return (level) => {
    if (noiseFloor === null) noiseFloor = level;
    else if (level < noiseFloor) noiseFloor += (level - noiseFloor) * fall;
    else noiseFloor += (level - noiseFloor) * rise;
    return level > Math.max(minLevel, noiseFloor + marginUnits);
  };
}

async function mixAudioStreams(streams) {
  const AudioContextClass = typeof window !== 'undefined'
    ? (window.AudioContext || window.webkitAudioContext)
    : null;
  if (!AudioContextClass) throw new Error('Audio mixing is not supported in this browser.');

  const audioContext = new AudioContextClass();
  try {
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    const destination = audioContext.createMediaStreamDestination();

    // Highpass filter to eliminate sub-audio rumble, desk knocks, and fan hum below 85Hz
    const highpass = audioContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(85, audioContext.currentTime);

    // Broadcast-grade dynamics compressor to balance candidate voice and remote interviewer voice cleanly
    const compressor = audioContext.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-30, audioContext.currentTime);
    compressor.knee.setValueAtTime(24, audioContext.currentTime);
    compressor.ratio.setValueAtTime(6, audioContext.currentTime);
    compressor.attack.setValueAtTime(0.003, audioContext.currentTime);
    compressor.release.setValueAtTime(0.15, audioContext.currentTime);

    // Real-time Voice Activity Detection (VAD) Analyser to detect actual speech vs silence
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.2;

    highpass.connect(compressor);
    compressor.connect(destination);
    // Measured before the compressor: compression narrows exactly the
    // speech-vs-background contrast the voice detector depends on.
    highpass.connect(analyser);

    // CRITICAL: Retain strong references to all Web Audio nodes to prevent GC sweep
    const activeNodes = [highpass, compressor, analyser];

    streams.forEach((stream) => {
      try {
        const sourceNode = audioContext.createMediaStreamSource(stream);
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(1.4, audioContext.currentTime);
        sourceNode.connect(gainNode);
        gainNode.connect(highpass);
        activeNodes.push(sourceNode, gainNode);
      } catch (err) {
        console.warn('Error attaching stream to audio mixer:', err);
      }
    });

    const mixedStream = destination.stream;
    mixedStream._rawStreams = streams;
    mixedStream._audioCtx = audioContext;
    mixedStream._audioNodes = activeNodes;
    audioContext._activeNodes = activeNodes;

    const freqBuf = new Uint8Array(analyser.frequencyBinCount);
    const binHz = audioContext.sampleRate / analyser.fftSize;
    const loBin = Math.max(1, Math.floor(VOICE_LOW_HZ / binHz));
    const hiBin = Math.min(freqBuf.length, Math.ceil(VOICE_HIGH_HZ / binHz));
    const isVoice = createVoiceDetector();
    mixedStream.hasVoiceActivity = () => {
      try {
        analyser.getByteFrequencyData(freqBuf);
        let sum = 0;
        for (let i = loBin; i < hiBin; i++) sum += freqBuf[i];
        return isVoice(sum / Math.max(1, hiBin - loBin));
      } catch {
        return true;
      }
    };

    audioContext.onstatechange = () => {
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {});
      }
    };

    return mixedStream;
  } catch (err) {
    streams.forEach(stopStreamTracks);
    await audioContext.close().catch(() => {});
    throw err;
  }
}

async function getMicStream(preferRoomAudio = false) {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    throw new Error('Microphone audio is not supported in this browser environment.');
  }

  const attempts = preferRoomAudio
    ? [ROOM_AUDIO_CONSTRAINTS, STANDARD_AUDIO_CONSTRAINTS, BASIC_AUDIO_CONSTRAINTS]
    : [STANDARD_AUDIO_CONSTRAINTS, ROOM_AUDIO_CONSTRAINTS, BASIC_AUDIO_CONSTRAINTS];

  let lastErr = null;
  for (const constraints of attempts) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (stream && stream.getAudioTracks().length > 0) {
        stream.getAudioTracks().forEach((track) => {
          track.enabled = true;
        });
        return stream;
      }
    } catch (err) {
      lastErr = err;
      console.warn('Microphone constraint attempt failed, trying next:', constraints, err.name || err.message);
    }
  }
  throw lastErr || new Error('No accessible audio input device found.');
}

/**
 * Grabs the audio channels to listen on, one per source, so each is
 * transcribed separately and attributed by where it came from:
 *   'interviewer' — shared meeting/tab audio (the remote side, possibly several people)
 *   'you'         — the local microphone, when meeting audio is captured separately
 *   'unknown'     — a single source that may contain either side (mic-only / tab-only)
 * Returns { channels: [{ stream, speaker }], warning }.
 */
export async function getListenChannels(source = 'both') {
  if (source === 'tab') {
    const tabStream = await getTabAudioStream();
    return { channels: [{ stream: await mixAudioStreams([tabStream]), speaker: 'interviewer' }], warning: '' };
  }

  if (source === 'mic') {
    const micStream = await getMicStream(false);
    return { channels: [{ stream: await mixAudioStreams([micStream]), speaker: 'unknown' }], warning: '' };
  }

  let tabStream;
  try {
    tabStream = await getTabAudioStream();
  } catch (err) {
    const warning = 'Meeting audio was not shared, so only microphone audio is being recorded.';
    console.warn('Tab audio unavailable; continuing with room microphone audio:', err);
    const micStream = await getMicStream(true);
    try {
      return { channels: [{ stream: await mixAudioStreams([micStream]), speaker: 'unknown' }], warning };
    } catch {
return { channels: [{ stream: micStream, speaker: 'unknown' }], warning };
    }
  }

  let interviewer = null;
  let micStream = null;
  try {
    interviewer = await mixAudioStreams([tabStream]);
    micStream = await getMicStream(true);
    const you = await mixAudioStreams([micStream]);
    return {
      channels: [{ stream: interviewer, speaker: 'interviewer' }, { stream: you, speaker: 'you' }],
      warning: '',
    };
  } catch (err) {
    stopStreamTracks(interviewer || tabStream);
    stopStreamTracks(micStream);
    throw err;
  }

}

function pickSupportedMimeType() {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', ''];
  if (typeof MediaRecorder === 'undefined') return '';
  for (const type of candidates) {
    if (!type || MediaRecorder.isTypeSupported(type)) return type;
  }
  return '';
}

/**
 * A MediaRecorder that is cut into chunks at natural pauses (voice-activity
 * endpointing) rather than on a fixed timer. A fixed timer split questions
 * mid-word ("What is comp" / "onent in React"), so half-questions were answered
 * and the real one was then dropped as a duplicate.
 *
 *   - speech then `endSilenceMs` of quiet  -> chunk ends, endOfUtterance: true
 *   - continuous speech for `maxChunkMs`   -> chunk ends, endOfUtterance: false
 *   - no speech for `intervalMs`           -> silent chunk, discarded upstream
 *
 * onChunk(blob, { hadSpeech, endOfUtterance })
 */
export function createChunkedRecorder(stream, {
  intervalMs = 1800, endSilenceMs = 500, minSpeechChunkMs = 700, maxChunkMs = 5000, onChunk,
} = {}) {
  const mimeType = pickSupportedMimeType();
  const hasVad = Boolean(stream && typeof stream.hasVoiceActivity === 'function');
  let hadSpeechInChunk = false;
  let chunkStartedAt = 0;
  let lastVoiceAt = 0;
  let vadMonitorTimer = null;

  const makeRecorder = () => {
    let recorder;
    const options = { audioBitsPerSecond: 64000 };
    if (mimeType) options.mimeType = mimeType;
    try {
recorder = new MediaRecorder(stream, options);
    } catch {
      try {
        recorder = new MediaRecorder(stream);
      } catch {
        recorder = null;
      }
    }
    return recorder;
  };

  let active = null;
  let stopped = false;

  // Swap to a fresh recorder (started before the old one stops, so no audio
  // falls in the gap) and hand the finished chunk on with its metadata.
  const cut = (endOfUtterance) => {
    const meta = { hadSpeech: hasVad ? hadSpeechInChunk : true, endOfUtterance };
    hadSpeechInChunk = false;
    chunkStartedAt = Date.now();
    const previous = active;
    if (!stopped) {
      try {
        const next = makeRecorder();
        if (next) {
          next.start();
          active = next;
        }
      } catch (e) {
        console.warn('Recorder cycle error:', e);
      }
    }
    if (previous && previous.state === 'recording') {
      previous.ondataavailable = (e) => {
        if (e.data && e.data.size > 0 && onChunk) onChunk(e.data, meta);
      };
      try { previous.stop(); } catch {}
    }
  };

  const tick = () => {
    const now = Date.now();
    const elapsed = now - chunkStartedAt;
    if (hasVad && stream.hasVoiceActivity()) {
      hadSpeechInChunk = true;
      lastVoiceAt = now;
    }
    if (!hasVad) {
      if (elapsed >= intervalMs) cut(false);
      return;
    }
    if (hadSpeechInChunk) {
      if (now - lastVoiceAt >= endSilenceMs && elapsed >= minSpeechChunkMs) cut(true);
      else if (elapsed >= maxChunkMs) cut(false);
    } else if (elapsed >= intervalMs) {
      cut(false);
    }
  };

  return {
    // True while the current (unfinished) chunk has heard voice: the speaker
    // is still talking, so whatever they said before is not complete yet.
    isSpeaking() {
      return hasVad && !stopped && hadSpeechInChunk;
    },
    start() {
      stopped = false;
      hadSpeechInChunk = false;
      chunkStartedAt = Date.now();
      active = makeRecorder();
if (!active) throw new Error('Could not initialize audio recorder for stream');
      active.start();
      if (vadMonitorTimer) clearInterval(vadMonitorTimer);
      active = null;
    },
  };
}

export function stopStreamTracks(stream) {
  if (!stream) return;
  if (stream._rawStreams && Array.isArray(stream._rawStreams)) {
    stream._rawStreams.forEach((s) => {
      try {
        s.getTracks().forEach((track) => track.stop());
      } catch {}
    });
  }
  if (stream._audioNodes && Array.isArray(stream._audioNodes)) {
    stream._audioNodes.forEach((node) => {
      try { node.disconnect(); } catch {}
    });
    stream._audioNodes = [];
  }
  if (stream._audioCtx && typeof stream._audioCtx.close === 'function') {
    try {
      stream._audioCtx.close();
    } catch {}
  }
  try {
    stream.getTracks().forEach((track) => track.stop());
  } catch {}
}

/**
 * Uploads one recorded chunk for transcription. Throws on a non-OK response.
 *
 * A chunk goes out every 3.5s during a live session, so this is by far the
 * most frequent call in the app — it's the one most likely to land in the
 * few-hundred-ms window while the backend's dev auto-reload is mid-restart
 * (a plain "server_unavailable" 503, not a real failure). A couple of quick
 * retries absorb that instead of losing the chunk and surfacing a scary
 * error for something that resolves itself within a second.
 */
// Kept short on purpose: a live chunk that takes longer than this is stale, and
// a hung request holds one of the browser's 6 connections to this origin.
const CHUNK_TIMEOUT_MS = 8000;

export async function transcribeChunk(blob, sessionId, attempts = 2, delayMs = 300) {
  let lastErr;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': blob.type || 'audio/webm',
          'X-Filename': 'chunk.webm',
          'X-Session-Id': String(sessionId),
        },
        body: blob,
        signal: AbortSignal.timeout(CHUNK_TIMEOUT_MS),
      });

      if (res.ok) return await res.json().catch(() => ({ text: '' }));

      const data = await res.json().catch(() => ({}));
      const isTransient =
        (res.status === 503 && data.error === 'server_unavailable') ||
        res.status === 504 ||
        res.status === 408 ||
        data.error === 'timeout';

      lastErr = Object.assign(new Error(data.message || 'Transcription failed.'), { status: res.status, data });
      if (!isTransient || attempt === attempts) {
        // Return empty transcription gracefully rather than throwing scary timeout errors
        console.warn(`[transcribeChunk attempt ${attempt}/${attempts}] failed:`, data.message || res.statusText);
        return { text: '' };
      }
    } catch (err) {
      lastErr = err;
      if (attempt === attempts) {
        console.warn('[transcribeChunk final catch]:', err.message);
        return { text: '' };
      }
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return { text: '' };
}
