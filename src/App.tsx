/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock } from 'lucide-react';

function KeysCafeLogo() {
  return (
    <div className="relative w-44 h-44 flex items-center justify-center select-none scale-105 pointer-events-none">
      {/* Background overlapping soft pastel glowing blur circles */}
      <div className="absolute inset-0 rounded-[52px] overflow-hidden bg-[#8b7e47] flex items-center justify-center">
        {/* Soft pastel overlapping circles (blue, purple, peach, mint) matching image 3 precisely */}
        <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-[#759ffd] opacity-90 blur-md" />
        <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-[#9c78f1] opacity-90 blur-md" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full bg-[#fde8df] opacity-50 blur-lg" />
        <div className="absolute top-2 -right-4 w-24 h-24 rounded-full bg-[#adba6b] opacity-80 blur-md" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-[#f6a495] opacity-90 blur-md" />
      </div>

      {/* Main black rounded box (squircle) representing keyboard keys board */}
      <div className="relative w-[114px] h-[114px] bg-black rounded-[28px] shadow-2xl flex flex-col justify-between p-3.5 z-10 border border-white/10">
        {/* Row 1 */}
        <div className="flex justify-between items-center w-full">
          {/* Teal Circle Key */}
          <div className="w-[22px] h-[22px] rounded-full bg-[#a3ecd1] shadow-[0_1.5px_6px_rgba(163,236,209,0.4)]" />
          {/* Peach Circle Key */}
          <div className="w-[22px] h-[22px] rounded-full bg-[#f6bca2] shadow-[0_1.5px_6px_rgba(246,188,162,0.4)]" />
          {/* Magenta Heart Key */}
          <div className="w-[22px] h-[22px] flex items-center justify-center bg-transparent rounded-full overflow-hidden">
            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] text-[#ff3a6b] drop-shadow-[0_1.5px_5px_rgba(255,58,107,0.5)]" fill="currentColor">
              <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
            </svg>
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex justify-between items-center w-full">
          {/* White Circle Key */}
          <div className="w-[22px] h-[22px] rounded-full bg-white shadow-[0_1.5px_6px_rgba(255,255,255,0.4)]" />
          {/* Blue Circle Key */}
          <div className="w-[22px] h-[22px] rounded-full bg-[#3d7eff] shadow-[0_1.5px_6px_rgba(61,126,255,0.4)]" />
          {/* Gray Circle Key */}
          <div className="w-[22px] h-[22px] rounded-full bg-[#c0c0cb] shadow-[0_1.5px_5px_rgba(192,192,203,0.3)]" />
        </div>

        {/* Emerald green pill spacebar at bottom */}
        <div className="w-full h-[18px] rounded-full bg-[#5fe3a8] shadow-[0_1.5px_6px_rgba(95,227,168,0.4)]" />
      </div>
    </div>
  );
}

export default function App() {
  const [stage, setStage] = useState<'setup' | 'start' | 'video' | 'escaped'>('setup');
  const [isTrapped, setIsTrapped] = useState(false);
  const [showResistanceText, setShowResistanceText] = useState(false);
  const [mouseY, setMouseY] = useState(0);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  // Keys Cafe UI States
  const [showSplash, setShowSplash] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRefs = useRef<{
    loading?: HTMLAudioElement;
    scary?: HTMLAudioElement;
    jolly?: HTMLAudioElement;
  }>({});

  const playSound = (url: string, volume = 0.5) => {
    const audio = new Audio(url);
    audio.volume = volume;
    audio.play().catch(() => {});
  };

  // Automatically fade splash screen after some time
  useEffect(() => {
    if (stage === 'start') {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [stage]);

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
    // Request pointer lock and fullscreen directly
    const element = document.documentElement;
    
    if (document.body.requestPointerLock) {
      document.body.requestPointerLock();
    }

    const requestFS = element.requestFullscreen || 
                      (element as any).webkitRequestFullscreen || 
                      (element as any).mozRequestFullScreen || 
                      (element as any).msRequestFullscreen;

    if (requestFS) {
      requestFS.call(element).catch(() => {});
    }

    setIsTrapped(true);

    // Escape hatch after 60 seconds
    setTimeout(() => {
      releaseTrap();
    }, 60000);
  };

  const handleEscape = () => {
    playSound('https://www.soundjay.com/human/sounds/laughter-3.mp3', 0.4);
    releaseTrap();
    setStage('escaped');
  };

  const handlePauseAttempt = () => {
    if (passwordInput === '3105') {
      playSound('https://www.soundjay.com/buttons/sounds/button-10.mp3', 0.5);
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
      playSound('https://www.soundjay.com/communication/sounds/access-denied-01.mp3', 0.5);
      // Wrong password - maybe a little shake or just clear it
      setPasswordInput('');
    }
  };

  const startSequence = () => {
    trapUser();
    playSound('https://www.soundjay.com/buttons/sounds/button-3.mp3', 0.6);
    setStage('video');
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
      const element = document.documentElement;
      const requestFS = element.requestFullscreen || 
                        (element as any).webkitRequestFullscreen || 
                        (element as any).mozRequestFullScreen || 
                        (element as any).msRequestFullscreen;

      if (!document.fullscreenElement && requestFS) {
        requestFS.call(element).catch(() => {});
      }
      if (!document.pointerLockElement && document.body.requestPointerLock) {
        document.body.requestPointerLock();
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isTrapped) {
        setShowResistanceText(true);
        // Keep text for a while
        setTimeout(() => setShowResistanceText(false), 5000);
      }
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
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
        {showResistanceText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000000] flex flex-col items-center justify-center bg-black/95 pointer-events-auto"
          >
            <h2 className="text-white font-granny text-3xl md:text-5xl text-center px-4 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] mb-8">
              The more you resist, the more you fall in
            </h2>
            <button
              onClick={() => {
                setShowResistanceText(false);
                if (document.documentElement.requestFullscreen) {
                  document.documentElement.requestFullscreen().catch(() => {});
                }
              }}
              className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors uppercase tracking-widest text-sm"
            >
              Accept Fate
            </button>
          </motion.div>
        )}

        {stage === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 flex flex-col items-center justify-center bg-[#0d0d11] text-white z-[300] p-6 text-center select-none"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.15)_0%,transparent_60%)] pointer-events-none" />
            
            <div className="max-w-md w-full relative z-10 flex flex-col items-center gap-8">
              {/* Pulsing indicator icon */}
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(99,102,241,0.15)] animate-pulse">
                ⚙️
              </div>

              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white mb-3">Keys Cafe Launcher</h1>
                <p className="text-gray-400 text-sm leading-relaxed px-4">
                  Set up this device before handing it over to your target. Fullscreen mode will lock automatically to secure the prank.
                </p>
              </div>

              <div className="w-full bg-[#16161a] border border-[#2d2d3d] rounded-2xl p-5 flex flex-col gap-3.5 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_#818cf8]" />
                  <span className="text-xs font-mono uppercase tracking-widest text-[#818cf8] font-bold">Prank Instructions</span>
                </div>
                <div className="flex flex-col gap-2.5 text-xs text-gray-300 leading-relaxed">
                  <p>1. Clicking the launch button enters **Fullscreen Mode** immediately.</p>
                  <p>2. Hand the device over. **The very first click** on the keyboard customize screen triggers the trap.</p>
                  <p>3. If they try to escape or pause, the **Authorization Key / Passcode** prompt will guard it.</p>
                </div>
              </div>

              {/* Launcher CTA Button */}
              <button
                onClick={() => {
                  playSound('https://www.soundjay.com/buttons/sounds/button-10.mp3', 0.5);
                  
                  // Fullscreen request
                  const element = document.documentElement;
                  const requestFS = element.requestFullscreen || 
                                    (element as any).webkitRequestFullscreen || 
                                    (element as any).mozRequestFullScreen || 
                                    (element as any).msRequestFullscreen;

                  if (requestFS) {
                    requestFS.call(element).catch(() => {});
                  }
                  
                  // Go to start stage
                  setStage('start');
                }}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all tracking-wide cursor-pointer"
              >
                Go Fullscreen & Start Keys Cafe
              </button>

              <div className="text-[11px] text-gray-650 font-mono">
                Admin master bypass passcode is: <span className="text-gray-500 font-semibold">3105</span>
              </div>
            </div>
          </motion.div>
        )}

        {stage === 'start' && (
          <motion.div
            key="start"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 flex flex-col bg-black text-white font-sans z-[100]"
          >
            <AnimatePresence mode="wait">
              {showSplash ? (
                /* SPLASH SCREEN (Screenshot 1) */
                <motion.div
                  key="splash"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  onClick={() => setShowSplash(false)}
                  className="absolute inset-0 flex flex-col items-center justify-between py-16 px-6 bg-[#121212] cursor-pointer"
                >
                  <div />
                  
                  {/* Central Branded Logo & Title */}
                  <div className="flex flex-col items-center gap-6">
                    {/* Keys Cafe Squircle Logo rendered matching precisely the uploaded image 3 */}
                    <KeysCafeLogo />
                    
                    <h1 className="text-4xl font-extrabold tracking-tight text-white mt-4">Keys Cafe</h1>
                  </div>

                  {/* Subtitle at page bottom */}
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm font-medium tracking-wide text-gray-400">My only one keyboard in the world</p>
                    <span className="text-xs text-gray-650 font-mono">Tap anywhere to customize</span>
                  </div>
                </motion.div>
              ) : (
                /* MAIN INTERACTIVE SETTINGS DASHBOARD (Screenshot 2) */
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={startSequence}
                  className="flex flex-col h-full bg-[#000000] text-white select-none relative cursor-pointer"
                >
                  {/* Top Bar with One UI feel */}
                  <div className="flex items-center justify-between px-6 pt-10 pb-4">
                    <button 
                      className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                      onClick={(e) => {
                        // Keeps back chevron to splash still working or triggers sequence? Clicking anything in home should play song! So we let it trigger the sequence either way!
                      }}
                    >
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="flex items-center gap-1">
                      <button className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
                        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="12" cy="5" r="1.5" />
                          <circle cx="12" cy="19" r="1.5" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Header Title Section matching Screenshot 2 */}
                  <div className="px-8 pt-2 pb-6">
                    <h1 className="text-[38px] font-bold text-white tracking-wide leading-tight">Keys Cafe</h1>
                    <p className="text-[#8f8f94] text-sm font-semibold mt-1">Make your own keyboard</p>
                  </div>

                  {/* menu items lists matching Screenshot 2 exact format */}
                  <div className="flex-1 overflow-y-auto px-6 pb-24">
                    <div className="bg-[#1c1c1e] rounded-[32px] overflow-hidden p-1 flex flex-col border border-white/[0.01] shadow-2xl">
                      
                      {/* 1. MAKE YOUR OWN KEYBOARD */}
                      <div className="flex items-center justify-between p-5 hover:bg-white/[0.02] active:scale-[0.99] transition-all duration-150 rounded-t-[30px]">
                        <div className="flex items-center gap-4.5">
                          {/* Light orange box with custom bulb key layout logo */}
                          <div className="w-[46px] h-[46px] rounded-[15px] bg-[#fbaf8c] flex items-center justify-center text-xl shadow-md">
                            ⌨️
                          </div>
                          <div>
                            <h3 className="font-extrabold text-[16px] text-white tracking-wide">Make your own keyboard</h3>
                            <p className="text-[12px] text-[#8f8f94] font-medium leading-snug mt-0.5">Customize the key locations and function keys.</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="h-5 w-[1px] bg-white/[0.08] mr-4" />
                          {/* Switch toggle (checked) */}
                          <div className="w-[48px] h-7 bg-[#3c78ff] rounded-full p-0.5 flex items-center justify-end shadow-inner">
                            <div className="w-6 h-6 bg-white rounded-full shadow-md" />
                          </div>
                        </div>
                      </div>

                      <div className="h-[1px] bg-white/[0.04] mx-5" />

                      {/* 2. STYLE YOUR OWN KEYBOARD */}
                      <div className="flex items-center justify-between p-5 hover:bg-white/[0.02] active:scale-[0.99] transition-all duration-150">
                        <div className="flex items-center gap-4.5">
                          {/* Heart icon inside gorgeous lavender/purple squircle bg */}
                          <div className="w-[46px] h-[46px] rounded-[15px] bg-gradient-to-tr from-[#9c78f1] via-[#d696db] to-[#f6a495] flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] text-white" fill="currentColor">
                              <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-extrabold text-[16px] text-white tracking-wide">Style your own keyboard</h3>
                            <p className="text-[12px] text-[#8f8f94] font-medium leading-snug mt-0.5">Try out with various colors and effects.</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="h-5 w-[1px] bg-white/[0.08] mr-4" />
                          {/* Switch toggle (checked) */}
                          <div className="w-[48px] h-7 bg-[#3c78ff] rounded-full p-0.5 flex items-center justify-end shadow-inner">
                            <div className="w-6 h-6 bg-white rounded-full shadow-md" />
                          </div>
                        </div>
                      </div>

                      <div className="h-[1px] bg-white/[0.04] mx-5" />

                      {/* 3. MY STICKER */}
                      <div className="flex items-center p-5 hover:bg-white/[0.02] active:scale-[0.99] transition-all duration-150">
                        <div className="flex items-center gap-4.5">
                          {/* Peach yellow smiley sticker icon */}
                          <div className="w-[46px] h-[46px] rounded-[15px] bg-[#ffd470] flex items-center justify-center text-2xl shadow-md">
                            😋
                          </div>
                          <div>
                            <h3 className="font-extrabold text-[16px] text-white tracking-wide">My Sticker</h3>
                            <p className="text-[12px] text-[#8f8f94] font-medium leading-snug mt-0.5">Create and edit custom sticker sets.</p>
                          </div>
                        </div>
                      </div>

                      <div className="h-[1px] bg-white/[0.04] mx-5" />

                      {/* 4. PLAY KEYBOARD GAME */}
                      <div className="flex items-center p-5 hover:bg-white/[0.02] active:scale-[0.99] transition-all duration-150">
                        <div className="flex items-center gap-4.5">
                          {/* Gamepad purple icon */}
                          <div className="w-[46px] h-[46px] rounded-[15px] bg-[#c39ffd] flex items-center justify-center text-2xl shadow-md">
                            🎮
                          </div>
                          <div>
                            <h3 className="font-extrabold text-[16px] text-white tracking-wide">Play keyboard game</h3>
                            <p className="text-[12px] text-[#8f8f94] font-medium leading-snug mt-0.5">Show off your keyboard typing skills.</p>
                          </div>
                        </div>
                      </div>

                      <div className="h-[1px] bg-white/[0.04] mx-5" />

                      {/* 5. ADVANCED KEYBOARD SETTING */}
                      <div className="flex items-center p-5 hover:bg-white/[0.02] active:scale-[0.99] transition-all duration-150 rounded-b-[30px]">
                        <div className="flex items-center gap-4.5">
                          {/* Gear theme icon */}
                          <div className="w-[46px] h-[46px] rounded-[15px] bg-[#97abbb] flex items-center justify-center text-xl shadow-md">
                            ⚙️
                          </div>
                          <div>
                            <h3 className="font-extrabold text-[16px] text-white tracking-wide">Advanced keyboard setting</h3>
                            <p className="text-[12px] text-[#8f8f94] font-medium leading-snug mt-0.5">Customize your keyboard setting in detail.</p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
                onClick={() => setStage('setup')}
                className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
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
                placeholder="****"
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
