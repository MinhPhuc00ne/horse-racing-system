import React, { useEffect, useRef, useState } from 'react';
import './RaphaelHUD.css';
import { audioManager } from '../../utils/audioHelper';
import logo from '../../assets/logo.png';

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const transitionStyles = `
@keyframes slideFromOutside {
  0% {
    transform: scale(4.5);
    opacity: 0;
    filter: blur(25px) drop-shadow(0 0 0px #00ccff);
  }
  20% {
    transform: scale(1);
    opacity: 1;
    filter: blur(0px) drop-shadow(0 0 20px #00ccff);
  }
  82% {
    transform: scale(0.96);
    opacity: 1;
    filter: blur(0px) drop-shadow(0 0 25px #ff8800);
  }
  100% {
    transform: scale(0.5);
    opacity: 0;
    filter: blur(15px) drop-shadow(0 0 50px #ff8800);
  }
}

.transition-logo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle, rgba(5,10,20,0.9) 0%, rgba(1,3,7,0.98) 100%);
  overflow: hidden;
}

.transition-logo-content {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  animation: slideFromOutside 3.4s cubic-bezier(0.08, 0.82, 0.17, 1) forwards;
  color: #ffffff;
  font-family: var(--font-family);
  text-align: center;
}

.hud-logo-icon {
  font-size: 100px;
  margin-bottom: 20px;
  filter: drop-shadow(0 0 15px #ff8800);
}

.hud-logo-icon-img {
  height: 160px;
  width: auto;
  margin-bottom: 20px;
  filter: drop-shadow(0 0 25px rgba(0, 204, 255, 0.8)) drop-shadow(0 0 15px rgba(255, 136, 0, 0.6));
}

.hud-logo-title {
  font-size: 54px;
  font-weight: 900;
  letter-spacing: 12px;
  color: #ffffff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px #ff8800, 0 0 40px #ff8800;
  margin: 0;
  text-transform: uppercase;
}

.hud-logo-subtitle {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 8px;
  color: #00ccff;
  text-shadow: 0 0 10px #00ccff, 0 0 20px #00ccff;
  margin-top: 15px;
  text-transform: uppercase;
}

.hud-glow-line {
  width: 180px;
  height: 4px;
  background: linear-gradient(90deg, transparent, #00ccff, #ff8800, #00ccff, transparent);
  margin-top: 25px;
  box-shadow: 0 0 15px #00ccff;
  border-radius: 2px;
}
`;

export default function RaphaelHUD({ horses, environment, onComplete, onCancel, isMovieScreenMode }) {
    const noticeContainerRef = useRef(null);
    const mcWrapperRef = useRef(null);
    const fgHorseRef = useRef(null);
    const horseNameTagRef = useRef(null);
    const panel1Ref = useRef(null);
    const panel2Ref = useRef(null);
    const panel3Ref = useRef(null);
    const flashScreenRef = useRef(null);

    const [currentText, setCurrentText] = useState("");
    const [textOpacity, setTextOpacity] = useState(0);
    const [currentHorse, setCurrentHorse] = useState(null);
    const [showTransitionLogo, setShowTransitionLogo] = useState(false);
    const [transitionStep, setTransitionStep] = useState(0); // 0: none, 1: Ready, 2: Bet, 3: Start
    const [imageErrors, setImageErrors] = useState({});

    // Helper to generate deterministic values based on a horse seed
    const getDeterministicValues = (horse) => {
        if (!horse) return { speed: 90, stamina: 90, accel: 'MAX', winRate: '95.00%', age: 4, recentForm: [1, 1, 2, 1, 3] };
        const seed = horse.horseId || horse.id || 0;
        const getPseudoRandom = (s, offset) => {
            const x = Math.sin(s + offset) * 10000;
            return x - Math.floor(x);
        };
        const speed = Math.floor(82 + getPseudoRandom(seed, 1) * 17);
        const stamina = Math.floor(80 + getPseudoRandom(seed, 2) * 19);
        const winRate = (80 + getPseudoRandom(seed, 3) * 19.9).toFixed(2) + "%";
        const accels = ["MAX", "BURST", "STEADY", "RAPID", "STABLE", "EXPLOSIVE"];
        const accel = accels[Math.floor(getPseudoRandom(seed, 4) * accels.length)];
        const age = Math.floor(3 + getPseudoRandom(seed, 5) * 6);
        const recentForm = [];
        for (let j = 0; j < 5; j++) {
            const rand = getPseudoRandom(seed, 6 + j);
            if (rand < 0.5) recentForm.push(1);
            else if (rand < 0.75) recentForm.push(2);
            else if (rand < 0.9) recentForm.push(3);
            else recentForm.push(4);
        }
        return { speed, stamina, accel, winRate, age, recentForm };
    };

    const currentStats = getDeterministicValues(currentHorse);

    const updateSystemText = (text) => {
        setTextOpacity(0);
        setTimeout(() => {
            setCurrentText(text);
            setTextOpacity(1);
        }, 150);
    };

    const triggerFlash = (duration = 500) => {
        if (!flashScreenRef.current) return;
        flashScreenRef.current.style.animation = 'none';
        void flashScreenRef.current.offsetWidth;
        flashScreenRef.current.style.animation = `flashAnim ${duration}ms ease-out`;
    };

    useEffect(() => {
        let isCancelled = false;

        const runSequence = async () => {
            await wait(100);
            if (isCancelled) return;

            if (noticeContainerRef.current) {
                noticeContainerRef.current.style.animation = 'appearNotice 2.5s forwards';
            }
            audioManager.playSystemBoot();
            updateSystemText("[ INITIALIZING HORSE PRESENTATION SYSTEM ]");

            await wait(2500);
            if (isCancelled) return;
            triggerFlash(300);
            if (noticeContainerRef.current) noticeContainerRef.current.style.animation = '';

            updateSystemText("Loading racing horse profiles data...");
            if (mcWrapperRef.current) mcWrapperRef.current.style.animation = 'drawCircle 1.5s linear forwards';

            await wait(1500);
            if (isCancelled) return;
            if (mcWrapperRef.current) mcWrapperRef.current.classList.add('drawn');

            // Loop through horses
            for (let i = 0; i < horses.length; i++) {
                const horse = horses[i];
                setCurrentHorse(horse);
                audioManager.playIntroChime(); // Play intro chime arpeggio for each horse

                const stats = getDeterministicValues(horse);
                const speed = stats.speed;
                const stamina = stats.stamina;
                const accel = stats.accel;

                if (fgHorseRef.current) {
                    fgHorseRef.current.style.setProperty('--horse-color', horse.color || '#00ccff');
                    fgHorseRef.current.style.setProperty('--horse-fill', horse.color ? horse.color.replace(')', ', 0.6)').replace('rgb', 'rgba') : 'rgba(0, 204, 255, 0.6)');
                }
                if (horseNameTagRef.current) horseNameTagRef.current.innerText = horse.name;

                const elSpeed = document.getElementById('hud-statSpeed');
                const elStamina = document.getElementById('hud-statStamina');
                const elSpeedFill = document.getElementById('hud-speedFill');
                const elStaminaFill = document.getElementById('hud-staminaFill');
                const elAccel = document.getElementById('hud-statAccel');
                const elCond = document.getElementById('hud-statCond');
                const elWinRate = document.getElementById('hud-statWinRate');

                if (elSpeed) elSpeed.innerText = speed;
                if (elStamina) elStamina.innerText = stamina;
                if (elSpeedFill) elSpeedFill.style.width = speed + '%';
                if (elStaminaFill) elStaminaFill.style.width = stamina + '%';
                if (elAccel) elAccel.innerText = accel;
                if (elCond) elCond.innerText = environment.toUpperCase();
                if (elWinRate) elWinRate.innerText = stats.winRate;

                if (fgHorseRef.current) {
                    fgHorseRef.current.style.opacity = '1';
                    fgHorseRef.current.classList.add('show-horse');
                }
                updateSystemText(`Starting presentation: [${horse.name}]...`);

                await wait(1500);
                if (isCancelled) return;
                if (panel1Ref.current) {
                    panel1Ref.current.style.animation = 'slideInRight 0.4s ease-out forwards';
                    audioManager.playSlideTick();
                }

                await wait(1500);
                if (isCancelled) return;
                updateSystemText(`Extracting Stable & Jockey data for [${horse.name}]...`);
                if (panel2Ref.current) {
                    panel2Ref.current.style.animation = 'slideInRight 0.4s ease-out forwards';
                    audioManager.playSlideTick();
                }

                await wait(1500);
                if (isCancelled) return;
                triggerFlash(200);
                if (panel3Ref.current) {
                    panel3Ref.current.style.animation = 'slideInRight 0.4s ease-out forwards';
                    audioManager.playSlideTick();
                }
                updateSystemText(`Displaying recent form for [${horse.name}].`);

                await wait(2500);
                if (isCancelled) return;

                if (i < horses.length - 1) {
                    triggerFlash(200);
                    if (fgHorseRef.current) {
                        fgHorseRef.current.style.opacity = '0';
                        fgHorseRef.current.classList.remove('show-horse');
                    }
                    if (panel1Ref.current) { panel1Ref.current.style.animation = ''; panel1Ref.current.style.opacity = '0'; }
                    if (panel2Ref.current) { panel2Ref.current.style.animation = ''; panel2Ref.current.style.opacity = '0'; }
                    if (panel3Ref.current) { panel3Ref.current.style.animation = ''; panel3Ref.current.style.opacity = '0'; }
                    await wait(500);
                }
            }

            updateSystemText("Presentation complete. Preparing starting gates!");
            await wait(1200);
            if (isCancelled) return;

            // Stop the introductory music/crowd and trigger the heroic transition music
            audioManager.stopSfx('horse_intro');
            audioManager.stopSfx('crowd');
            audioManager.playSfx('intro_heroic');

            // Trigger Transition Step 1: "ARE YOU READY?"
            setShowTransitionLogo(true);
            setTransitionStep(1);
            
            await wait(3500); // 3.5 seconds
            if (isCancelled) return;

            // Trigger Transition Step 2: "PLACE YOUR BETS"
            triggerFlash(150);
            setTransitionStep(2);

            await wait(3500); // 3.5 seconds
            if (isCancelled) return;

            // Trigger Transition Step 3: "RACE START"
            triggerFlash(200);
            setTransitionStep(3);

            await wait(2800); // Wait 2.8s for the text to scale in and show
            if (isCancelled) return;
            
            // Trigger transition flash
            triggerFlash(1000);
            await wait(180); // Wait 180ms to reach peak brightness (pure white screen)
            if (isCancelled) return;

            setShowTransitionLogo(false);
            setTransitionStep(0);
            
            await wait(820); // Wait for flash to fade out completely
            if (isCancelled) return;

            onComplete();
        };

        runSequence();

        return () => { isCancelled = true; };
    }, [horses, environment, onComplete]);

    return (
        <div className={`raphael-hud-overlay ${isMovieScreenMode ? 'is-movie-screen-mode' : ''}`}>
            <style dangerouslySetInnerHTML={{ __html: transitionStyles }} />
            
            {/* High-tech Action Buttons */}
            <div style={{
                position: 'absolute',
                top: '24px',
                right: '24px',
                display: 'flex',
                gap: '12px',
                zIndex: 20000
            }}>
                <button
                    onClick={() => {
                        onComplete();
                    }}
                    style={{
                        background: 'rgba(0, 204, 255, 0.15)',
                        border: '2px solid #00ccff',
                        color: '#00ccff',
                        borderRadius: '30px',
                        padding: '8px 20px',
                        fontSize: '13px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 0 15px rgba(0, 204, 255, 0.2)',
                        fontFamily: 'var(--font-family)'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = '#00ccff';
                        e.target.style.color = '#02050a';
                        e.target.style.boxShadow = '0 0 25px rgba(0, 204, 255, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(0, 204, 255, 0.15)';
                        e.target.style.color = '#00ccff';
                        e.target.style.boxShadow = '0 0 15px rgba(0, 204, 255, 0.2)';
                    }}
                >
                    ⏭️ Skip Presentation
                </button>
                
                {onCancel && (
                    <button
                        onClick={onCancel}
                        style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '2px solid #ef4444',
                            color: '#ef4444',
                            borderRadius: '30px',
                            padding: '8px 20px',
                            fontSize: '13px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 0 15px rgba(239, 68, 68, 0.2)',
                            fontFamily: 'var(--font-family)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = '#ef4444';
                            e.target.style.color = '#ffffff';
                            e.target.style.boxShadow = '0 0 25px rgba(239, 68, 68, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(239, 68, 68, 0.15)';
                            e.target.style.color = '#ef4444';
                            e.target.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.2)';
                        }}
                    >
                        ✖ Close / Exit
                    </button>
                )}
            </div>
            
            {showTransitionLogo && (
                <div className="transition-logo-overlay">
                    {transitionStep === 1 && (
                        <div className="transition-logo-content" key="step1">
                            <img src={logo} alt="EquineElite Logo" className="hud-logo-icon-img" />
                            <div className="hud-logo-title">ARE YOU READY?</div>
                            <div className="hud-logo-subtitle">SYSTEM ACTIVE</div>
                            <div className="hud-glow-line"></div>
                        </div>
                    )}
                    {transitionStep === 2 && (
                        <div className="transition-logo-content" key="step2">
                            <img src={logo} alt="EquineElite Logo" className="hud-logo-icon-img" />
                            <div className="hud-logo-title">PLACE YOUR BETS</div>
                            <div className="hud-logo-subtitle">YOUR WINNING OPPORTUNITY</div>
                            <div className="hud-glow-line"></div>
                        </div>
                    )}
                    {transitionStep === 3 && (
                        <div className="transition-logo-content" key="step3">
                            <img src={logo} alt="EquineElite Logo" className="hud-logo-icon-img" />
                            <div className="hud-logo-title">RACE START</div>
                            <div className="hud-logo-subtitle">STARTING GATES PREPARING TO OPEN</div>
                            <div className="hud-glow-line"></div>
                        </div>
                    )}
                </div>
            )}
            <div className="dark-overlay" style={{ opacity: 1 }}></div>

            <div className="notice-container" ref={noticeContainerRef}>
                <div className="notice-diamond">
                    <div className="notice-text">LIVE</div>
                </div>
            </div>

            <div className="analysis-scene">
                <div className="grid-bg"></div>

                <div className="mc-wrapper" ref={mcWrapperRef}>
                    <div className="blue-glow-bg"></div>

                    <div className="core-horse">
                        <img 
                            src={logo} 
                            alt="EquineElite Logo" 
                            className="hud-horse-avatar" 
                            style={{ 
                                border: '3px solid #ff8800', 
                                boxShadow: '0 0 20px #ff8800',
                                objectFit: 'contain',
                                padding: '12px',
                                background: 'rgba(5, 10, 20, 0.85)'
                            }} 
                        />
                    </div>

                    <svg className="runes-svg" viewBox="0 0 1000 1000">
                        <defs>
                            <path id="circle-out" d="M 500, 500 m -450, 0 a 450,450 0 1,1 900,0 a 450,450 0 1,1 -900,0" />
                            <path id="circle-mid" d="M 500, 500 m -370, 0 a 370,370 0 1,0 740,0 a 370,370 0 1,0 -740,0" />
                        </defs>

                        <circle cx="500" cy="500" r="480" stroke="#00ccff" strokeWidth="20" fill="none" strokeDasharray="4 46.2" opacity="0.6" />
                        <circle cx="500" cy="500" r="480" stroke="#ff8800" strokeWidth="30" fill="none" strokeDasharray="12 239.3" opacity="0.8" />

                        <circle cx="500" cy="500" r="420" stroke="#00ccff" strokeWidth="2" fill="none" opacity="0.5" />
                        <circle cx="500" cy="500" r="410" stroke="#00ccff" strokeWidth="1" fill="none" strokeDasharray="10 10" style={{ animation: 'spinSvg 20s linear infinite reverse' }} />
                        <circle cx="500" cy="500" r="320" stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.2" />
                        <circle cx="500" cy="500" r="310" stroke="#ffffff" strokeWidth="4" fill="none" strokeDasharray="30 20" style={{ animation: 'spinSvg 15s linear infinite' }} />

                        <g style={{ transformOrigin: '500px 500px' }}>
                            <path d="M 200 800 A 424 424 0 1 1 800 800" fill="none" stroke="rgba(0, 204, 255, 0.15)" strokeWidth="40" strokeLinecap="round" />
                            <path d="M 200 800 A 424 424 0 1 1 800 800" fill="none" stroke="#ff8800" strokeWidth="40" strokeLinecap="round" strokeDasharray="2600" strokeDashoffset="2600" style={{ animation: 'revUp 2.5s alternate infinite cubic-bezier(0.4, 0, 0.2, 1)' }} />
                        </g>

                        <g style={{ filter: 'drop-shadow(0 0 15px #00ccff)' }}>
                            <path d="M 380 350 V 550 A 120 120 0 0 0 620 550 V 350" fill="none" stroke="#00ccff" strokeWidth="40" strokeLinecap="round" />
                            <circle cx="380" cy="400" r="8" fill="#050a10" />
                            <circle cx="380" cy="470" r="8" fill="#050a10" />
                            <circle cx="380" cy="540" r="8" fill="#050a10" />
                            <circle cx="620" cy="400" r="8" fill="#050a10" />
                            <circle cx="620" cy="470" r="8" fill="#050a10" />
                            <circle cx="620" cy="540" r="8" fill="#050a10" />
                        </g>

                        <text fontSize="28" fill="#00ccff" letterSpacing="4" fontFamily="monospace" style={{ animation: 'spinSvg 40s linear infinite', transformOrigin: '50% 50%' }}>
                            <textPath href="#circle-out" startOffset="0%">| HORSE PRESENTATION SYSTEM | RACING PROFILES | ELITE EQUINE SHOWCASE | HORSE PRESENTATION SYSTEM | RACING PROFILES | ELITE EQUINE SHOWCASE </textPath>
                        </text>

                        <text fontSize="22" fill="#ff8800" fontWeight="bold" letterSpacing="6" fontFamily="monospace" style={{ animation: 'spinSvg 30s linear infinite reverse', transformOrigin: '50% 50%' }}>
                            <textPath href="#circle-mid" startOffset="0%">&gt;&gt;&gt; HORSE DATA &gt;&gt;&gt; JOCKEY PROFILE &gt;&gt;&gt; RECENT FORM &gt;&gt;&gt; WIN RATE &gt;&gt;&gt; HORSE DATA &gt;&gt;&gt; JOCKEY PROFILE &gt;&gt;&gt; RECENT FORM &gt;&gt;&gt; WIN RATE</textPath>
                        </text>
                    </svg>
                </div>

                <div className="fg-horse" ref={fgHorseRef}>
                    <div className="horse-name-tag" ref={horseNameTagRef}>VELDORA</div>
                    {(currentHorse?.imageUrl || currentHorse?.avatarUrl) && !imageErrors[currentHorse?.id] ? (
                        <img 
                            src={currentHorse.imageUrl || currentHorse.avatarUrl} 
                            alt="FG Horse" 
                            className="hud-horse-avatar" 
                            onError={() => setImageErrors(prev => ({ ...prev, [currentHorse.id]: true }))}
                        />
                    ) : (
                        <svg viewBox="0 0 576 512" className="custom-horse-svg">
                            <path d="M575.92 76.6c-.01-8.13-3.02-15.87-8.58-21.8-3.78-4.03-8.58-9.12-13.69-14.5 11.06-6.84 19.5-17.49 22.18-30.66C576.85 4.68 572.96 0 567.9 0H447.92c-70.69 0-128 57.31-128 128H160c-28.84 0-54.4 12.98-72 33.11V160c-48.53 0-88 39.47-88 88v56c0 8.84 7.16 16 16 16h16c8.84 0 16-7.16 16-16v-56c0-13.22 6.87-24.39 16.78-31.68-.21 2.58-.78 5.05-.78 7.68 0 27.64 11.84 52.36 30.54 69.88l-25.72 68.6a63.945 63.945 0 0 0-2.16 37.99l24.85 99.41A15.982 15.982 0 0 0 107.02 512h65.96c10.41 0 18.05-9.78 15.52-19.88l-26.31-105.26 23.84-63.59L320 345.6V496c0 8.84 7.16 16 16 16h64c8.84 0 16-7.16 16-16V318.22c19.74-20.19 32-47.75 32-78.22 0-.22-.07-.42-.08-.64V136.89l16 7.11 18.9 37.7c7.45 14.87 25.05 21.55 40.49 15.37l32.55-13.02a31.997 31.997 0 0 0 20.12-29.74l-.06-77.71zm-64 19.4c-8.84 0-16-7.16-16-16s7.16-16 16-16 16 7.16 16 16-7.16 16-16 16z" />
                        </svg>
                    )}
                </div>

                <div className="info-container">
                    <div className="info-panel" ref={panel1Ref}>
                        <div className="panel-title">HORSE PROFILE INFO</div>
                        <div className="panel-data">
                            <span>Identification ID</span>
                            <span className="highlight">#{currentHorse?.horseId || '00' + (Math.floor(Math.random() * 99))}</span>
                        </div>
                        <div className="panel-data">
                            <span>Age</span>
                            <span className="highlight" style={{ color: '#ff8800' }}>{currentStats.age} Years Old</span>
                        </div>
                        <div className="panel-data">
                            <span>Weight</span>
                            <span className="highlight" style={{ color: '#00ffaa' }}>{currentHorse?.weight || '485.5'} kg</span>
                        </div>
                    </div>

                    <div className="info-panel" ref={panel2Ref}>
                        <div className="panel-title">STABLE & JOCKEY</div>
                        <div className="panel-data">
                            <span>Owner:</span>
                            <span className="highlight" style={{ fontSize: '16px', color: '#ffcc00' }}>{currentHorse?.ownerName || 'Apex Group'}</span>
                        </div>
                        <div className="panel-data">
                            <span>Jockey:</span>
                            <span className="highlight" style={{ fontSize: '16px', color: '#00ccff' }}>{currentHorse?.jockeyName || 'Unknown'}</span>
                        </div>
                    </div>

                    <div className="info-panel panel-3" ref={panel3Ref}>
                        <div className="panel-title">RECENT FORM</div>
                        <div className="panel-data" style={{ borderBottom: 'none', paddingBottom: '0' }}>
                            <span>Win Rate:</span>
                            <span className="highlight-supreme" id="hud-statWinRate" style={{ fontSize: '24px' }}>{currentStats.winRate}</span>
                        </div>
                        <div className="panel-data" style={{ borderBottom: 'none', paddingTop: '5px' }}>
                            <span>Last 5 Races:</span>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                {currentStats.recentForm.map((pos, idx) => {
                                    const bg = pos === 1 ? '#10b981' : pos === 2 ? '#f59e0b' : pos === 3 ? '#3b82f6' : '#ef4444';
                                    return (
                                        <span key={idx} style={{ background: bg, color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                                            {pos}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div className="flash-screen" ref={flashScreenRef}></div>

            {currentText && (
                <div className="system-text" style={{ opacity: textOpacity }}>
                    {currentText}
                </div>
            )}
        </div>
    );
}
