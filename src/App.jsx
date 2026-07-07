import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Volume2, 
  VolumeX, 
  RotateCw, 
  Play, 
  Pause, 
  Compass, 
  Zap, 
  Sparkles, 
  Shield, 
  Flame, 
  Swords, 
  Info,
  Tv,
  Mic,
  Activity
} from 'lucide-react';

import { characters } from './data/CharacterData';
import { playSound, startKiCharge, setMuted, getMuted } from './audio';
import ModelViewer from './components/ModelViewer';
import logoImg from './assets/logo.png';

function App() {
  const [selectedCharIndex, setSelectedCharIndex] = useState(0);
  const [selectedFormId, setSelectedFormId] = useState('base');
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [lightingPreset, setLightingPreset] = useState('aura');
  const [activeAnimationIndex, setActiveAnimationIndex] = useState(0);
  const [animationsList, setAnimationsList] = useState([]);
  
  // Loading states
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadError, setLoadError] = useState(null);
  
  // Sound states
  const [muted, setMutedState] = useState(false);

  // Power Up state
  const [poweringUp, setPoweringUp] = useState(false);
  const [powerLevel, setPowerLevel] = useState(9001);
  const chargeAudioRef = useRef(null);
  const powerIntervalRef = useRef(null);
  const powerUpTimerRef = useRef(null);

  // Active Character & Form References
  const activeChar = characters[selectedCharIndex];
  const activeForm = activeChar.forms.find(f => f.id === selectedFormId) || activeChar.forms[0];

  // Set default form and power level when switching characters
  useEffect(() => {
    setSelectedFormId(activeChar.forms[0].id);
    setPowerLevel(calculateInitialPower(activeChar.basePowerLevel, activeChar.forms[0]));
    setActiveAnimationIndex(0);
    playSound('characterChange');
  }, [selectedCharIndex]);

  // Set power level based on form
  useEffect(() => {
    setPowerLevel(calculateInitialPower(activeChar.basePowerLevel, activeForm));
  }, [selectedFormId]);

  const calculateInitialPower = (basePower, form) => {
    // Modify base power level based on form stats
    const multiplier = 1 + (form.stats.power - 70) / 30;
    return Math.round(basePower * multiplier);
  };

  // Toggle Mute
  const handleMuteToggle = () => {
    const newMuted = !muted;
    setMutedState(newMuted);
    setMuted(newMuted);
    if (!newMuted) {
      // Small trigger to activate AudioContext
      playSound('select');
    }
  };

  // Switch transformation form
  const handleFormChange = (formId) => {
    setSelectedFormId(formId);
    playSound('characterChange');
    
    // Trigger small transformation burst of confetti
    const form = activeChar.forms.find(f => f.id === formId) || activeChar.forms[0];
    const rect = document.getElementById('model-viewport')?.getBoundingClientRect();
    if (rect) {
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { 
          x: (rect.left + rect.width / 2) / window.innerWidth, 
          y: (rect.top + rect.height / 2) / window.innerHeight 
        },
        colors: [form.accentColor, '#ffffff', '#ffd700']
      });
    }
  };

  // Ki Charging (Power Up) Handlers
  const startPoweringUp = (e) => {
    e.preventDefault();
    if (poweringUp) return;
    setPoweringUp(true);
    playSound('select');

    // Start Synthesized sound hum
    chargeAudioRef.current = startKiCharge();

    // Increment power level
    powerIntervalRef.current = setInterval(() => {
      setPowerLevel(prev => prev + Math.floor(Math.random() * 250) + 100);
      
      // Shoot small particle bursts from bottom
      const rect = document.getElementById('power-up-btn')?.getBoundingClientRect();
      if (rect) {
        confetti({
          particleCount: 10,
          angle: 90,
          spread: 60,
          origin: { 
            x: (rect.left + rect.width / 2) / window.innerWidth, 
            y: (rect.top) / window.innerHeight 
          },
          colors: [activeForm.accentColor, '#ffffff']
        });
      }
    }, 100);
  };

  const stopPoweringUp = () => {
    if (!poweringUp) return;
    setPoweringUp(false);

    // Stop synthesized sound hum
    if (chargeAudioRef.current) {
      chargeAudioRef.current.stop();
      chargeAudioRef.current = null;
    }

    // Stop power incrementing
    if (powerIntervalRef.current) {
      clearInterval(powerIntervalRef.current);
      powerIntervalRef.current = null;
    }

    // Play release explosion sound
    playSound('blast');

    // Giant explosive confetti shockwave!
    const rect = document.getElementById('model-viewport')?.getBoundingClientRect();
    if (rect) {
      // 360 spread confetti
      confetti({
        particleCount: 150,
        spread: 120,
        origin: { 
          x: (rect.left + rect.width / 2) / window.innerWidth, 
          y: (rect.top + rect.height / 2) / window.innerHeight 
        },
        colors: [activeForm.accentColor, '#ffffff', '#ffd700', '#00e1ff']
      });
    }
  };

  // Trigger signature moves
  const handleSignatureMove = (move) => {
    playSound(move.soundType);

    // Screen flash element effect
    const flashEl = document.getElementById('screen-flash');
    if (flashEl) {
      flashEl.style.backgroundColor = activeForm.accentColor;
      flashEl.classList.add('flash-active');
      setTimeout(() => {
        flashEl.classList.remove('flash-active');
      }, 800);
    }

    // Launch directional confetti beams
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 45,
        origin: { x: 0.1, y: 0.8 },
        colors: [activeForm.accentColor, '#ffffff']
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 45,
        origin: { x: 0.9, y: 0.8 },
        colors: [activeForm.accentColor, '#ffffff']
      });
    }, 400);
  };

  // Form loading descriptions or funny loading tips
  const loadingTips = {
    goku: "Preparing the Kaio-ken multiplier... Remember, Goku's power level in base was over 9,000 against Nappa!",
    vegeta: "Polishing the Saiyan armor... Fun fact: Vegeta's hair never changes from the day he is born!",
    trunks: "Sharpening the Brave Sword... Trunks is a hybrid Saiyan, possessing high latent potential."
  };

  return (
    <div className="app-container min-h-screen bg-[#06060a] text-gray-100 flex flex-col font-sans overflow-x-hidden relative">
      
      {/* Screen flash for signature moves */}
      <div id="screen-flash" className="fixed inset-0 pointer-events-none z-50 opacity-0 transition-opacity duration-300" />

      {/* Background glowing particles/aura grid */}
      <div className="absolute inset-0 bg-radial-grid opacity-10 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 py-4 flex justify-between items-center border-b border-white/5 backdrop-blur-md bg-black/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-orange-600 to-yellow-400 flex items-center justify-center font-bold text-black text-xl shadow-lg shadow-orange-500/20 tracking-tighter">
            DBZ
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider bg-gradient-to-r from-orange-500 via-yellow-400 to-red-500 bg-clip-text text-transparent uppercase">
              Saiyan Scouter 3D
            </h1>
            <p className="text-xs text-gray-500">Interactive Character Profile Files</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleMuteToggle}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10 transition-colors"
            title={muted ? "Unmute Sound" : "Mute Sound"}
          >
            {muted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-green-400" />}
          </button>
          <div className="hidden md:flex flex-col text-right">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">Local Timeline</span>
            <span className="text-xs text-orange-400 font-mono font-bold">AGE 780</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 relative z-10 w-full max-w-7xl mx-auto p-4 md:p-6 gap-6 items-stretch">
        
        {/* Left Side: 3D model viewport + Controls */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Main 3D Canvas Box */}
          <div 
            id="model-viewport" 
            className="relative flex-1 rounded-2xl border border-white/10 overflow-hidden bg-gradient-to-b from-[#0c0c14] to-[#08080f] shadow-2xl flex flex-col"
            style={{ minHeight: '450px' }}
          >
            
            {/* Visual Aura Halo Ring behind the character model */}
            <div 
              className="absolute inset-0 pointer-events-none transition-all duration-1000 blur-[80px]"
              style={{
                background: `radial-gradient(circle at 50% 60%, ${activeForm.glowStyle.replace('0.4', poweringUp ? '0.7' : '0.25')} 0%, transparent 60%)`
              }}
            />

            {/* Title HUD on canvas overlay */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none">
              <div className="px-3 py-1.5 rounded-md bg-black/60 border border-white/10 backdrop-blur-md flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Active Subject</span>
                <span className="text-lg font-bold tracking-wide" style={{ color: activeForm.accentColor }}>
                  {activeChar.name}
                </span>
                <span className="text-xs text-gray-300 font-medium italic">{activeForm.name}</span>
              </div>
            </div>

            {/* Logo overlay on canvas top-right */}
            <div className="absolute top-4 right-4 z-20 pointer-events-none select-none">
              <img 
                src={logoImg} 
                alt="Dragon Ball Z Logo" 
                style={{ height: '45px', width: 'auto' }}
                className="object-contain drop-shadow-[0_0_12px_rgba(255,107,0,0.35)]" 
              />
            </div>

            {/* Controls overlay (bottom left) */}
            <div className="absolute bottom-4 left-4 z-20 flex gap-2">
              <button
                onClick={() => setIsAutoRotate(!isAutoRotate)}
                className={`p-2.5 rounded-lg border backdrop-blur-md transition-all flex items-center gap-2 text-xs font-semibold ${
                  isAutoRotate 
                    ? 'bg-orange-500/20 border-orange-500 text-orange-400' 
                    : 'bg-black/60 border-white/10 hover:border-white/20 text-gray-300'
                }`}
                title="Toggle Auto Rotation"
              >
                <RotateCw className={`w-4 h-4 ${isAutoRotate ? 'animate-spin-slow' : ''}`} />
                <span>Orbit</span>
              </button>

              {/* Lighting Presets */}
              <div className="relative group">
                <button
                  className="p-2.5 rounded-lg bg-black/60 border border-white/10 hover:border-white/20 backdrop-blur-md text-gray-300 text-xs font-semibold flex items-center gap-1.5"
                  title="Lighting Preset"
                >
                  <Compass className="w-4 h-4 text-orange-400" />
                  <span className="capitalize">{lightingPreset} Light</span>
                </button>
                <div className="absolute bottom-full left-0 mb-2 hidden group-hover:flex flex-col bg-black/90 border border-white/15 rounded-lg p-1.5 min-w-[120px] shadow-xl z-30">
                  {['aura', 'studio', 'neon', 'sunset'].map(preset => (
                    <button
                      key={preset}
                      onClick={() => {
                        setLightingPreset(preset);
                        playSound('select');
                      }}
                      className={`px-3 py-1.5 text-left text-xs rounded-md transition-colors capitalize ${
                        lightingPreset === preset 
                          ? 'bg-orange-500/25 text-orange-400 font-bold' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Animations selector (bottom right) */}
            {animationsList.length > 0 && (
              <div className="absolute bottom-4 right-4 z-20">
                <div className="relative group">
                  <button className="p-2.5 rounded-lg bg-black/60 border border-white/10 hover:border-white/20 backdrop-blur-md text-gray-300 text-xs font-semibold flex items-center gap-1.5">
                    <Play className="w-4 h-4 text-orange-400" />
                    <span>Action: {animationsList[activeAnimationIndex]}</span>
                  </button>
                  <div className="absolute bottom-full right-0 mb-2 hidden group-hover:flex flex-col bg-black/90 border border-white/15 rounded-lg p-1.5 min-w-[180px] max-h-[200px] overflow-y-auto shadow-xl z-30">
                    {animationsList.map((anim, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveAnimationIndex(idx);
                          playSound('select');
                        }}
                        className={`px-3 py-1.5 text-left text-xs rounded-md transition-colors truncate ${
                          activeAnimationIndex === idx 
                            ? 'bg-orange-500/25 text-orange-400 font-bold' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {anim}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3D Model Canvas Element */}
            {loadError ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
                <div className="w-16 h-16 rounded-full bg-red-950/50 border border-red-500 flex items-center justify-center text-red-500 mb-4 text-2xl font-bold font-mono">!</div>
                <h3 className="text-lg font-bold text-red-400">Failed to render 3D space</h3>
                <p className="text-sm text-gray-500 max-w-md mt-2">
                  Could not load model at {activeChar.modelPath.split('/').pop()}. Verify asset files exist and your local server has permissions.
                </p>
                <button
                  onClick={() => {
                    // Force refresh page or trigger re-render
                    window.location.reload();
                  }}
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md text-sm transition-colors"
                >
                  Reload Scouter
                </button>
              </div>
            ) : (
              <ModelViewer
                modelPath={activeChar.modelPath}
                scale={activeChar.scale}
                position={activeChar.position}
                rotation={activeChar.rotation}
                auraColor={activeForm.auraColor}
                auraIntensity={activeForm.auraIntensity}
                isAutoRotate={isAutoRotate}
                poweringUp={poweringUp}
                lightingPreset={lightingPreset}
                activeAnimationIndex={activeAnimationIndex}
                onLoadProgress={(p) => setLoadProgress(p)}
                onLoadComplete={() => {
                  setLoadProgress(100);
                  setLoadError(null);
                }}
                onLoadError={(err) => {
                  setLoadError(err.message || 'Error loading asset');
                }}
                onAnimationsFound={(anims) => {
                  setAnimationsList(anims);
                }}
              />
            )}

            {/* Detailed Loading Progress Overlay */}
            {loadProgress < 100 && (
              <div className="absolute inset-0 bg-black/90 backdrop-blur-lg flex flex-col items-center justify-center p-6 text-center z-30 transition-all duration-300">
                
                {/* Stylized Ki Aura loader */}
                <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-t-orange-500 border-r-yellow-400 border-b-transparent border-l-transparent animate-spin" />
                  <div className="absolute inset-2 rounded-full border border-orange-500/30 border-dashed animate-spin-reverse" />
                  <Flame className="w-10 h-10 text-orange-500 animate-pulse" />
                </div>

                <h3 className="text-xl font-bold uppercase tracking-wider text-white">
                  {loadProgress === -1 ? 'Analyzing Scouter Signature...' : `Syncing Ki Signature: ${loadProgress}%`}
                </h3>
                
                <div className="w-64 h-1.5 bg-white/10 rounded-full mt-4 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 via-yellow-400 to-red-500 transition-all duration-300"
                    style={{ width: loadProgress === -1 ? '40%' : `${loadProgress}%` }}
                  />
                </div>

                {/* DBZ Hint box */}
                <div className="mt-8 max-w-sm px-4 py-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex gap-2 items-start text-left">
                    <Info className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-orange-400">Scouter Scans:</span>
                      <p className="text-xs text-gray-300 leading-relaxed mt-1">
                        {loadingTips[activeChar.id]}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Power Up Section (Hold down button) */}
          <div className="p-4 rounded-2xl border border-white/10 bg-gradient-to-r from-[#0c0c14] to-[#08080f] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold flex items-center gap-1">
                <Activity className="w-3 h-3 text-red-500" /> Aura Modulation
              </span>
              <p className="text-xs text-gray-300 mt-1 max-w-xs">
                Press and hold the button below to funnel energy, trigger Ki sounds, camera tremors, and scale power levels!
              </p>
            </div>
            
            <button
              id="power-up-btn"
              onMouseDown={startPoweringUp}
              onMouseUp={stopPoweringUp}
              onMouseLeave={stopPoweringUp}
              onTouchStart={startPoweringUp}
              onTouchEnd={stopPoweringUp}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 select-none ${
                poweringUp 
                  ? 'bg-red-600 shadow-lg shadow-red-500/50 scale-95 border-red-400 text-white' 
                  : 'bg-gradient-to-r from-orange-600 to-yellow-500 hover:from-orange-500 hover:to-yellow-400 active:scale-95 shadow-md text-black'
              }`}
              style={{
                boxShadow: poweringUp ? `0 0 30px ${activeForm.accentColor}` : 'none'
              }}
            >
              <Zap className={`w-5 h-5 ${poweringUp ? 'animate-bounce' : ''}`} />
              <span>{poweringUp ? 'CHARGING KI...!' : 'POWER UP!'}</span>
            </button>
          </div>

        </section>

        {/* Right Side: Profile Details & Stats */}
        <section className="lg:col-span-5 flex flex-col gap-6">

          {/* Character Carousel/Cards selector */}
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
            {characters.map((char, index) => {
              const charForm = char.forms[0]; // standard base form color for card
              const isSelected = selectedCharIndex === index;
              return (
                <button
                  key={char.id}
                  onClick={() => setSelectedCharIndex(index)}
                  className={`flex-shrink-0 p-3 rounded-xl border text-left transition-all w-28 flex flex-col justify-between select-none relative overflow-hidden ${
                    isSelected 
                      ? 'bg-white/5' 
                      : 'bg-black/40 border-white/5 opacity-60 hover:opacity-90'
                  }`}
                  style={{
                    borderColor: isSelected ? charForm.accentColor : 'rgba(255,255,255,0.05)',
                    boxShadow: isSelected ? `inset 0 0 12px ${charForm.accentColor}30` : 'none'
                  }}
                >
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">DBZ-{index+1}</span>
                  <div className="mt-4">
                    <h4 className="text-xs font-bold truncate text-white">{char.name}</h4>
                    <span className="text-[9px] text-gray-400 block truncate mt-0.5">{char.title}</span>
                  </div>
                  {isSelected && (
                    <div 
                      className="absolute top-0 right-0 w-2 h-2 rounded-bl"
                      style={{ backgroundColor: charForm.accentColor }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Dossier Content */}
          <div className="flex-1 rounded-2xl border border-white/10 bg-gradient-to-b from-[#0c0c14] to-[#08080f] p-6 shadow-2xl flex flex-col justify-between gap-6">
            
            {/* Header section of card */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-2xl font-black tracking-wider text-white uppercase font-sans">
                    {activeChar.name}
                  </h2>
                  <p className="text-xs text-orange-400 font-semibold italic mt-0.5">{activeChar.title}</p>
                </div>
                
                {/* Numeric Power Level Display */}
                <div className="flex flex-col items-end">
                  <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Power Rating</span>
                  <span className="text-2xl font-mono font-bold tracking-tighter" style={{ color: activeForm.accentColor }}>
                    {powerLevel.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Over 9000 easter egg */}
              {powerLevel > 9000 && (
                <div className="py-1 px-3 rounded bg-red-950/30 border border-red-500/40 text-center animate-pulse">
                  <span className="text-[10px] uppercase font-black tracking-widest text-red-400">
                    ⚠️ WARNING: IT'S OVER 9000!!!
                  </span>
                </div>
              )}

              <p className="text-xs text-gray-300 leading-relaxed mt-2 bg-white/5 border border-white/5 rounded-lg p-3">
                {activeChar.biography}
              </p>
            </div>

            {/* Transformation Selector */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Ascend Forms
              </span>
              <div className="grid grid-cols-2 gap-2">
                {activeChar.forms.map((form) => {
                  const isActive = selectedFormId === form.id;
                  return (
                    <button
                      key={form.id}
                      onClick={() => handleFormChange(form.id)}
                      className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
                        isActive
                          ? 'bg-white/5'
                          : 'bg-black/30 border-white/5 hover:border-white/10 hover:bg-black/50 text-gray-400 hover:text-white'
                      }`}
                      style={{
                        borderColor: isActive ? form.accentColor : 'rgba(255,255,255,0.05)',
                        color: isActive ? '#ffffff' : ''
                      }}
                    >
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse"
                        style={{ backgroundColor: form.accentColor, boxShadow: `0 0 8px ${form.accentColor}` }}
                      />
                      <span className="truncate">{form.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Statistics */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-400" /> Subject Analytics
              </span>
              <div className="space-y-2.5">
                {Object.entries(activeForm.stats).map(([statName, val]) => (
                  <div key={statName} className="flex items-center gap-3 text-xs">
                    <span className="w-20 text-gray-400 capitalize font-medium">{statName}</span>
                    
                    {/* Glowing progress bar */}
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden relative border border-white/5">
                      <div 
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{ 
                          width: `${val}%`, 
                          backgroundColor: activeForm.accentColor,
                          boxShadow: `0 0 10px ${activeForm.accentColor}`
                        }}
                      />
                    </div>

                    <span className="w-6 text-right font-mono font-bold text-gray-200">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Signature Moves */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5 text-red-400" /> Signature Attack Protocols
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeChar.moves.map((move) => (
                  <button
                    key={move.name}
                    onClick={() => handleSignatureMove(move)}
                    className="p-2.5 rounded-lg bg-black/40 border border-white/5 hover:border-orange-500/40 hover:bg-black/60 text-left transition-all select-none group flex flex-col justify-between gap-1"
                  >
                    <span className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors flex items-center gap-1.5">
                      <Flame className="w-3 h-3 text-orange-500" /> {move.name}
                    </span>
                    <span className="text-[10px] text-gray-400 leading-normal line-clamp-2">
                      {move.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Metadata Pills Footer */}
            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/5 text-[10px] text-gray-400">
              <div className="flex items-center gap-1.5 truncate">
                <Info className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <span className="truncate">Race: {activeChar.race}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <Tv className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <span className="truncate">First: {activeChar.firstAppearance.split('/').pop().trim()}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <Mic className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <span className="truncate">Actor: {activeChar.voiceActor.split('/').pop().trim()}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <Shield className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <span className="truncate">Team: {activeChar.affiliation}</span>
              </div>
            </div>

          </div>

        </section>

      </main>

      {/* Retro scanlines effect */}
      <div className="absolute inset-0 pointer-events-none bg-scanlines opacity-5 mix-blend-overlay" />
    </div>
  );
}

export default App;
