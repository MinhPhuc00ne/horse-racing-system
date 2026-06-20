import React, { useEffect, useRef, useState } from 'react';
import './RaphaelHUD.css';

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default function RaphaelHUD({ horses, environment, onComplete }) {
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
            updateSystemText("[ KHỞI ĐỘNG HỆ THỐNG TRÌNH DIỄN NGỰA ĐUA ]");

            await wait(2500);
            if (isCancelled) return;
            triggerFlash(300);
            if (noticeContainerRef.current) noticeContainerRef.current.style.animation = '';

            updateSystemText("Đang tải dữ liệu hồ sơ ngựa đua...");
            if (mcWrapperRef.current) mcWrapperRef.current.style.animation = 'drawCircle 1.5s linear forwards';

            await wait(1500);
            if (isCancelled) return;
            if (mcWrapperRef.current) mcWrapperRef.current.classList.add('drawn');

            // Loop through horses
            for (let i = 0; i < horses.length; i++) {
                const horse = horses[i];
                setCurrentHorse(horse);

                const speed = horse.id === 1 ? 99 : horse.id === 2 ? 92 : horse.id === 3 ? 96 : 88;
                const stamina = horse.id === 1 ? 95 : horse.id === 2 ? 88 : horse.id === 3 ? 90 : 92;
                const accel = horse.id === 1 ? "MAX" : horse.id === 2 ? "BURST" : horse.id === 3 ? "STEADY" : "RAPID";

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
                if (elWinRate) elWinRate.innerText = (85 + Math.random() * 14).toFixed(2) + "%";

                if (fgHorseRef.current) {
                    fgHorseRef.current.style.opacity = '1';
                    fgHorseRef.current.classList.add('show-horse');
                }
                updateSystemText(`Bắt đầu giới thiệu: [${horse.name}]...`);

                await wait(1200);
                if (isCancelled) return;
                if (panel1Ref.current) panel1Ref.current.style.animation = 'slideInRight 0.4s ease-out forwards';

                await wait(1000);
                if (isCancelled) return;
                updateSystemText(`Trích xuất thông tin Đội Đua & Nài Ngựa [${horse.name}]...`);
                if (panel2Ref.current) panel2Ref.current.style.animation = 'slideInRight 0.4s ease-out forwards';

                await wait(1000);
                if (isCancelled) return;
                triggerFlash(200);
                if (panel3Ref.current) panel3Ref.current.style.animation = 'slideInRight 0.4s ease-out forwards';
                updateSystemText(`Hiển thị phong độ gần đây của [${horse.name}].`);

                await wait(2000);
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
                    await wait(400);
                }
            }

            updateSystemText("Đã giới thiệu xong. Chuẩn bị mở cổng đua!");
            await wait(1500);
            if (isCancelled) return;
            triggerFlash(1200);

            onComplete();
        };

        runSequence();

        return () => { isCancelled = true; };
    }, [horses, environment, onComplete]);

    return (
        <div className="raphael-hud-overlay">
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
                        <svg viewBox="0 0 576 512" className="custom-horse-svg">
                            <path d="M575.92 76.6c-.01-8.13-3.02-15.87-8.58-21.8-3.78-4.03-8.58-9.12-13.69-14.5 11.06-6.84 19.5-17.49 22.18-30.66C576.85 4.68 572.96 0 567.9 0H447.92c-70.69 0-128 57.31-128 128H160c-28.84 0-54.4 12.98-72 33.11V160c-48.53 0-88 39.47-88 88v56c0 8.84 7.16 16 16 16h16c8.84 0 16-7.16 16-16v-56c0-13.22 6.87-24.39 16.78-31.68-.21 2.58-.78 5.05-.78 7.68 0 27.64 11.84 52.36 30.54 69.88l-25.72 68.6a63.945 63.945 0 0 0-2.16 37.99l24.85 99.41A15.982 15.982 0 0 0 107.02 512h65.96c10.41 0 18.05-9.78 15.52-19.88l-26.31-105.26 23.84-63.59L320 345.6V496c0 8.84 7.16 16 16 16h64c8.84 0 16-7.16 16-16V318.22c19.74-20.19 32-47.75 32-78.22 0-.22-.07-.42-.08-.64V136.89l16 7.11 18.9 37.7c7.45 14.87 25.05 21.55 40.49 15.37l32.55-13.02a31.997 31.997 0 0 0 20.12-29.74l-.06-77.71zm-64 19.4c-8.84 0-16-7.16-16-16s7.16-16 16-16 16 7.16 16 16-7.16 16-16 16z" />
                        </svg>
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
                    <svg viewBox="0 0 576 512" className="custom-horse-svg">
                        <path d="M575.92 76.6c-.01-8.13-3.02-15.87-8.58-21.8-3.78-4.03-8.58-9.12-13.69-14.5 11.06-6.84 19.5-17.49 22.18-30.66C576.85 4.68 572.96 0 567.9 0H447.92c-70.69 0-128 57.31-128 128H160c-28.84 0-54.4 12.98-72 33.11V160c-48.53 0-88 39.47-88 88v56c0 8.84 7.16 16 16 16h16c8.84 0 16-7.16 16-16v-56c0-13.22 6.87-24.39 16.78-31.68-.21 2.58-.78 5.05-.78 7.68 0 27.64 11.84 52.36 30.54 69.88l-25.72 68.6a63.945 63.945 0 0 0-2.16 37.99l24.85 99.41A15.982 15.982 0 0 0 107.02 512h65.96c10.41 0 18.05-9.78 15.52-19.88l-26.31-105.26 23.84-63.59L320 345.6V496c0 8.84 7.16 16 16 16h64c8.84 0 16-7.16 16-16V318.22c19.74-20.19 32-47.75 32-78.22 0-.22-.07-.42-.08-.64V136.89l16 7.11 18.9 37.7c7.45 14.87 25.05 21.55 40.49 15.37l32.55-13.02a31.997 31.997 0 0 0 20.12-29.74l-.06-77.71zm-64 19.4c-8.84 0-16-7.16-16-16s7.16-16 16-16 16 7.16 16 16-7.16 16-16 16z" />
                    </svg>
                </div>

                <div className="info-container">
                    <div className="info-panel" ref={panel1Ref}>
                        <div className="panel-title">THÔNG TIN NGỰA ĐUA</div>
                        <div className="panel-data">
                            <span>Mã định danh (ID)</span>
                            <span className="highlight">#{currentHorse?.horseId || '00' + (Math.floor(Math.random() * 99))}</span>
                        </div>
                        <div className="panel-data">
                            <span>Tuổi (Age)</span>
                            <span className="highlight" style={{ color: '#ff8800' }}>4 Tuổi</span>
                        </div>
                        <div className="panel-data">
                            <span>Cân nặng (Weight)</span>
                            <span className="highlight" style={{ color: '#00ffaa' }}>{currentHorse?.weight || '485.5'} kg</span>
                        </div>
                    </div>

                    <div className="info-panel" ref={panel2Ref}>
                        <div className="panel-title">ĐỘI ĐUA & NÀI NGỰA</div>
                        <div className="panel-data">
                            <span>Chủ sở hữu:</span>
                            <span className="highlight" style={{ fontSize: '16px', color: '#ffcc00' }}>{currentHorse?.ownerName || 'Tập đoàn Apex'}</span>
                        </div>
                        <div className="panel-data">
                            <span>Nài ngựa (Jockey):</span>
                            <span className="highlight" style={{ fontSize: '16px', color: '#00ccff' }}>{currentHorse?.jockeyName || 'Unknown'}</span>
                        </div>
                    </div>

                    <div className="info-panel panel-3" ref={panel3Ref}>
                        <div className="panel-title">PHONG ĐỘ (RECENT FORM)</div>
                        <div className="panel-data" style={{ borderBottom: 'none', paddingBottom: '0' }}>
                            <span>Tỉ lệ thắng (Win Rate):</span>
                            <span className="highlight-supreme" id="hud-statWinRate" style={{ fontSize: '24px' }}>99.9%</span>
                        </div>
                        <div className="panel-data" style={{ borderBottom: 'none', paddingTop: '5px' }}>
                            <span>5 trận gần nhất:</span>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <span style={{ background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>1</span>
                                <span style={{ background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>1</span>
                                <span style={{ background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>4</span>
                                <span style={{ background: '#f59e0b', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>2</span>
                                <span style={{ background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>1</span>
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
