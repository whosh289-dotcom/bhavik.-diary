/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock } from 'lucide-react';

export default function App() {
  const [stage, setStage] = useState<'start' | 'loading' | 'text1' | 'text2' | 'video' | 'escaped'>('start');
  const [isTrapped, setIsTrapped] = useState(false);
  const [mouseY, setMouseY] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRefs = useRef<{
    loading?: HTMLAudioElement;
    scary?: HTMLAudioElement;
    jolly?: HTMLAudioElement;
  }>({});

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        if (audio instanceof HTMLAudioElement) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, []);

  const releaseTrap = () => {
    if (document.exitPointerLock) document.exitPointerLock();
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    setIsTrapped(false);
  };

  const trapUser = () => {
    const requestLock = () => {
      try {
        if (document.body.requestPointerLock) {
          const promise = document.body.requestPointerLock() as any;
          if (promise && typeof promise.catch === 'function') {
            promise.catch(() => {});
          }
        }
      } catch (e) {
        // Silent fail if browser blocks it
      }

      try {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } catch (e) {
        // Silent fail
      }
    };

    requestLock();
    setIsTrapped(true);

    // Escape hatch after 20 seconds
    setTimeout(() => {
      releaseTrap();
    }, 20000);
  };

  const handleEscape = () => {
    releaseTrap();
    setStage('escaped');
  };

  const handlePauseAttempt = () => {
    if (passwordInput === '////-////') {
      if (videoRef.current) {
        if (videoRef.current.paused) {
          videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
      }
      setShowPasswordPrompt(false);
      setPasswordInput('');
    } else {
      // Wrong password - maybe a little shake or just clear it
      setPasswordInput('');
    }
  };

  const startSequence = () => {
    trapUser();
    setStage('loading');
    
    // Initialize audio
    audioRefs.current.loading = new Audio('https://www.soundjay.com/communication/sounds/data-transfer-1.mp3');
    audioRefs.current.loading.loop = true;
    audioRefs.current.loading.volume = 0.2;
    audioRefs.current.loading.play().catch(() => {});

    // Fake logs for loading screen
    const logMessages = [
      "> Inflating balloons...",
      "> Baking digital cookies...",
      "> Spreading confetti...",
      "> Tuning the party music...",
      "> Polishing the surprise...",
      "> Almost ready for the fun!",
      "> FINALIZING JOLLINESS..."
    ];

    logMessages.forEach((msg, i) => {
      setTimeout(() => {
        setLogs(prev => [...prev, msg].slice(-5));
      }, i * 400);
    });

    setTimeout(() => {
      if (audioRefs.current.loading) {
        audioRefs.current.loading.pause();
        audioRefs.current.loading.currentTime = 0;
      }
      setStage('text1');
      audioRefs.current.scary = new Audio('https://www.soundjay.com/horror/sounds/horror-sting-01.mp3');
      audioRefs.current.scary.volume = 0.6;
      audioRefs.current.scary.play().catch(() => {});
    }, 4000);

    setTimeout(() => {
      setStage('text2');
      if (audioRefs.current.scary) {
        audioRefs.current.scary.pause();
      }
      audioRefs.current.jolly = new Audio('https://www.soundjay.com/human/sounds/tada-fanfare-02.mp3');
      audioRefs.current.jolly.volume = 0.5;
      audioRefs.current.jolly.play().catch(() => {});
    }, 9000);

    setTimeout(() => {
      setStage('video');
    }, 14000);
  };

  // Play video when stage changes to 'video'
  useEffect(() => {
    if (stage === 'video' && videoRef.current) {
      const playVideo = async () => {
        try {
          await videoRef.current?.play();
        } catch (err) {
          console.error("Video play failed, trying muted:", err);
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().catch(e => console.error("Muted play failed too:", e));
          }
        }
      };
      playVideo();
    }
  }, [stage]);

  // The FOOLPROOF GESTURE TRAP
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseY(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);

    if (!isTrapped) return;

    const handleInteraction = () => {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      if (!document.pointerLockElement && document.body.requestPointerLock) {
        document.body.requestPointerLock();
      }
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, [isTrapped]);

  const isCursorHidden = isTrapped && mouseY < window.innerHeight / 2;

  return (
    <div 
      className={`fixed inset-0 bg-[#0a0a0f] flex items-center justify-center overflow-hidden select-none font-sans ${isCursorHidden ? 'cursor-none' : 'cursor-default'}`}
    >
      {/* Global Style for Cursor Hiding and Atmospheric Effects */}
      <style>
        {`
          ${isCursorHidden ? '* { cursor: none !important; }' : ''}
          .scanline {
            width: 100%;
            height: 100px;
            z-index: 999;
            background: linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0.02) 50%, rgba(0, 0, 0, 0) 100%);
            pointer-events: none;
            position: absolute;
            bottom: 100%;
            animation: scanline 10s linear infinite;
          }
          @keyframes scanline {
            0% { transform: translateY(0); }
            100% { transform: translateY(200vh); }
          }
        `}
      </style>

      <div className="scanline" />

      {/* Invisible shield when trapped */}
      {isCursorHidden && stage !== 'start' && (
        <div className="fixed inset-0 z-[999999] cursor-none" />
      )}

      <AnimatePresence mode="wait">
        {stage === 'start' && (
          <motion.div
            key="start"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[#fdfcf0] to-[#fff5e6] z-[100]"
          >
            <div className="relative bg-white p-12 rounded-3xl shadow-[0_20px_60px_rgba(255,180,100,0.2)] text-center border border-[#ffe4b5] max-w-md w-full mx-4 overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-full h-2 bg-[#ffb347]" />
              <div className="absolute top-4 right-4 text-[10px] text-[#ffb347] font-mono uppercase tracking-widest">v2.4.0-COZY</div>
              
              <div className="mb-6 inline-flex p-4 bg-[#fffaf0] rounded-full border border-[#ffe4b5]">
                <div className="text-3xl">📔</div>
              </div>
              
              <h1 className="text-[#5d4037] text-4xl font-bold mb-2 tracking-tight">Bhavik's Diary</h1>
              <div className="flex items-center justify-center gap-2 mb-8">
                <span className="w-2 h-2 bg-[#ffb347] rounded-full animate-pulse" />
                <span className="text-xs text-[#8d6e63] font-mono uppercase tracking-widest">Sweet & Secure</span>
              </div>
              
              <button
                onClick={startSequence}
                className="group relative w-full inline-flex items-center justify-center gap-3 px-10 py-5 bg-[#ffb347] text-white font-bold rounded-2xl hover:bg-[#ffa000] hover:scale-[1.02] transition-all active:scale-95 shadow-[0_10px_25px_rgba(255,179,71,0.3)]"
              >
                Unlock Diary
              </button>
              
              <p className="mt-8 text-[10px] text-[#a1887f] font-mono uppercase tracking-[0.2em]">Last Access: 05-APR-2026</p>
            </div>
          </motion.div>
        )}

        {stage === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center w-full max-lg px-8"
          >
            <div className="mb-12">
              <h2 className="text-white text-2xl font-mono mb-6 tracking-[0.3em] font-bold">CONNECTING TO SWEET & COZY SERVER...</h2>
              <div className="relative w-full h-3 bg-gray-900 rounded-full overflow-hidden border border-white/10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 4, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-[#ffcc33] to-[#ff66cc]"
                />
              </div>
            </div>
            
            <div className="bg-black/40 border border-white/5 rounded-lg p-6 font-mono text-left text-sm h-40 overflow-hidden">
              {logs.map((log, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-pink-400 mb-1"
                >
                  {log}
                </motion.div>
              ))}
              <motion.span 
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-2 h-4 bg-yellow-400 align-middle ml-1"
              />
            </div>
          </motion.div>
        )}

        {stage === 'text1' && (
          <motion.div
            key="text1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 flex items-center justify-center z-50 px-4 bg-black/95"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,0,0,0.1)_0%,transparent_70%)]" />
            <h2 className="font-granny text-[#ff0000] text-5xl md:text-8xl text-center uppercase tracking-widest drop-shadow-[0_0_20px_rgba(255,0,0,0.8)] relative z-10">
              Did you really think I gave you my diary?
            </h2>
          </motion.div>
        )}

        {stage === 'text2' && (
          <motion.div
            key="text2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed inset-0 flex items-center justify-center z-50 px-4 bg-gradient-to-b from-yellow-400/30 to-pink-500/30"
          >
            <div className="text-center">
              <h2 className="font-jolly text-white text-5xl md:text-7xl font-bold mb-8 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
                Anyway, there is still a surprise. 🎁✨
              </h2>
              <div className="text-8xl">
                🎉🎈🍭
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'escaped' && (
          <motion.div
            key="escaped"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 flex items-center justify-center bg-black z-[200] text-center px-4"
          >
            <div className="max-w-md">
              <h2 className="text-white text-4xl md:text-6xl font-bold mb-6">
                You got rickrolled in 2026! 🕺
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Bhavik got you good. Better luck next time!
              </p>
              <button
                onClick={() => setStage('start')}
                className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Try Again?
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className={`fixed inset-0 bg-black z-10 transition-opacity duration-1000 flex items-center justify-center ${stage === 'video' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ height: '100dvh' }}
      >
        <video
          ref={videoRef}
          src="https://ia801602.us.archive.org/11/items/Rick_Astley_Never_Gonna_Give_You_Up/Rick_Astley_Never_Gonna_Give_You_Up.mp4"
          className="w-full h-full object-contain md:object-cover"
          playsInline
          loop
          preload="auto"
          autoPlay
          onError={(e) => console.error("Video element error:", e)}
        />
        
        {/* Prank UI Overlay */}
        {stage === 'video' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-12 pointer-events-none">
            <div className="flex gap-4 pointer-events-auto">
              <button
                onClick={handleEscape}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white/50 hover:text-white text-xs font-mono uppercase tracking-widest rounded border border-white/10 transition-all"
              >
                Escape
              </button>
              <button
                onClick={() => setShowPasswordPrompt(true)}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white/50 hover:text-white text-xs font-mono uppercase tracking-widest rounded border border-white/10 transition-all"
              >
                Pause
              </button>
            </div>
          </div>
        )}

        {/* Password Prompt Overlay */}
        {showPasswordPrompt && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto">
            <div className="bg-[#1a1a1a] p-8 rounded-xl border border-white/10 w-full max-w-xs text-center">
              <h3 className="text-white font-mono text-sm uppercase tracking-widest mb-4">Enter Authorization Key</h3>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePauseAttempt()}
                autoFocus
                className="w-full bg-black border border-white/20 rounded p-2 text-white text-center font-mono mb-4 focus:border-[#cd3232] outline-none"
                placeholder="****-****"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowPasswordPrompt(false); setPasswordInput(''); }}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-mono uppercase rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePauseAttempt}
                  className="flex-1 px-4 py-2 bg-[#cd3232] hover:bg-[#f03e3e] text-white text-xs font-mono uppercase rounded transition-colors"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
