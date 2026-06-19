import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompletedRacesAPI, reportViolationAPI, saveSimulatedRaceAPI } from '../../services/referee';
import './LiveSimulation.css';

export default function LiveSimulation() {
  const navigate = useNavigate();
  const numLanes = 4;

  // Using dummy horses for simulation since API isn't fully returning ongoing participants yet
  const initialHorses = [
    { id: 1, name: 'Lightning Bolt', progress: 0, color: '#00f2fe', flaggedPositions: [] },
    { id: 2, name: 'Desert Wind', progress: 0, color: '#10b981', flaggedPositions: [] },
    { id: 3, name: 'Midnight Star', progress: 0, color: '#ef4444', flaggedPositions: [] },
    { id: 4, name: 'Stormbreaker', progress: 0, color: '#d4af37', flaggedPositions: [] },
  ];

  const [horses, setHorses] = useState(initialHorses);
  const [isRunning, setIsRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [resultsSaved, setResultsSaved] = useState(false);
  
  // Custom Modals State
  const [showResultsSummary, setShowResultsSummary] = useState(false);
  const [finalPodium, setFinalPodium] = useState([]);
  const [simulatedRaceName, setSimulatedRaceName] = useState('');

  const [selectedHorseForFlag, setSelectedHorseForFlag] = useState(null);
  const [flagReason, setFlagReason] = useState('');
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [clickedProgress, setClickedProgress] = useState(null);
  const [environment, setEnvironment] = useState('sunset');

  const canvasRef = useRef(null);
  const horsesRef = useRef(horses);
  const visualHorses = useRef(initialHorses.map(h => ({ ...h, visualProgress: 0, trail: [] })));

  // Sync state to ref for rendering frame rate decoupling
  useEffect(() => {
    horsesRef.current = horses;
  }, [horses]);

  // Handle simulation timer
  useEffect(() => {
    let interval;
    if (isRunning && !finished) {
      interval = setInterval(() => {
        setHorses(prev => {
          let allFinished = true;
          const nextHorses = prev.map(h => {
            if (h.progress < 100) {
              // High variability: advance random amount between 0.5% and 8%
              const advance = 0.5 + Math.random() * 7.5;
              const newProgress = Math.min(100, h.progress + advance);
              if (newProgress < 100) allFinished = false;
              
              let finishedTime = h.finishedTime;
              if (newProgress === 100 && !h.finishedTime) {
                finishedTime = Date.now();
              }
              return { ...h, progress: newProgress, finishedTime };
            }
            return h;
          });
          if (allFinished) {
            setIsRunning(false);
            setFinished(true);
          }
          return nextHorses;
        });
      }, 400);
    }
    return () => clearInterval(interval);
  }, [isRunning, finished]);

  // Pre-generate initial race name on mount
  useEffect(() => {
    const newRaceId = Date.now();
    setSimulatedRaceName(`Simulated Race #${Math.floor(newRaceId / 1000) % 1000}`);
  }, []);

  // Handle saving race results to localStorage when finished
  useEffect(() => {
    if (finished && !resultsSaved) {
      // Sort horses to calculate ranks
      const sorted = [...horses].sort((a, b) => (a.finishedTime || 0) - (b.finishedTime || 0));
      const results = sorted.map((h, index) => ({
        rank: index + 1,
        horseName: h.name,
        jockeyName: 'Jockey ' + h.id,
        time: `1m ${15 + index * 2}s`
      }));
      
      const newRaceId = Date.now();
      const newRace = {
        id: newRaceId,
        raceName: simulatedRaceName,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        status: 'FINISHED'
      };
      
      saveSimulatedRaceAPI(newRace, results).then(() => {
        setResultsSaved(true);
        setFinalPodium(results);
        setShowResultsSummary(true);
      }).catch(err => {
        console.error('Failed to save simulated race', err);
      });
    }
  }, [finished, horses, resultsSaved, simulatedRaceName]);

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let speedOffset = 0;
    
    // Pre-generate clouds for a realistic sky
    const clouds = [
      { x: canvas.width * 0.1, y: canvas.height * 0.08, w: 90, h: 25, speed: 0.1 },
      { x: canvas.width * 0.45, y: canvas.height * 0.05, w: 140, h: 35, speed: 0.07 },
      { x: canvas.width * 0.75, y: canvas.height * 0.12, w: 100, h: 28, speed: 0.12 }
    ];

    // Pre-generate snowflakes for snow environment
    const snowFlakes = [];
    for (let i = 0; i < 60; i++) {
      snowFlakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.5,
        speedY: Math.random() * 1.2 + 0.6,
        speedX: Math.random() * 0.5 - 0.25
      });
    }

    const render = () => {
      const W = canvas.width;
      const H = canvas.height;
      const horizonY = H * 0.32; // horizon at 32% of canvas height
      const startX = W * 0.06;
      const endX = W * 0.94;
      const Vx = W / 2;

      // Theme-specific configurations
      const themeConfigs = {
        sunset: {
          skyColors: ['#10375c', '#1a5f7a', '#f9d976'],
          sunColor: 'rgba(253, 186, 116, 0.8)',
          sunRadius: 45,
          grassColor: '#194d33',
          trackColor: '#654321',
          fenceColor: '#ffffff',
          laneLineColor: 'rgba(255, 255, 255, 0.4)',
          gridColor: 'rgba(0, 0, 0, 0.18)',
          dustColor: 'rgba(180, 150, 110, 0.35)',
          postColor: '#f8fafc'
        },
        cyber: {
          skyColors: ['#020408', '#050a12', '#0a192f'],
          sunColor: 'rgba(0, 242, 254, 0.15)',
          sunRadius: 70,
          grassColor: '#030d1a',
          trackColor: '#0a0f1d',
          fenceColor: '#00f2fe',
          laneLineColor: 'rgba(0, 242, 254, 0.25)',
          gridColor: 'rgba(0, 242, 254, 0.08)',
          dustColor: 'rgba(0, 242, 254, 0.15)',
          postColor: '#00f2fe'
        },
        sunny: {
          skyColors: ['#38bdf8', '#7dd3fc', '#bae6fd'],
          sunColor: 'rgba(253, 224, 71, 0.95)',
          sunRadius: 35,
          grassColor: '#16a34a',
          trackColor: '#15803d',
          fenceColor: '#ffffff',
          laneLineColor: 'rgba(255, 255, 255, 0.55)',
          gridColor: 'rgba(255, 255, 255, 0.15)',
          dustColor: 'rgba(255, 255, 255, 0.25)',
          postColor: '#ffffff'
        },
        snow: {
          skyColors: ['#475569', '#64748b', '#94a3b8'],
          sunColor: 'rgba(255, 255, 255, 0.4)',
          sunRadius: 50,
          grassColor: '#cbd5e1',
          trackColor: '#f1f5f9',
          fenceColor: '#78350f',
          laneLineColor: 'rgba(71, 85, 105, 0.25)',
          gridColor: 'rgba(71, 85, 105, 0.08)',
          dustColor: 'rgba(255, 255, 255, 0.5)',
          postColor: '#78350f'
        }
      };

      const config = themeConfigs[environment] || themeConfigs.sunset;
      
      // 1. Draw Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, config.skyColors[0]);
      skyGrad.addColorStop(0.6, config.skyColors[1]);
      skyGrad.addColorStop(1, config.skyColors[2]);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, horizonY);

      // Draw Sun
      const sunGrad = ctx.createRadialGradient(Vx, horizonY, 0, Vx, horizonY, config.sunRadius);
      sunGrad.addColorStop(0, '#ffffff');
      sunGrad.addColorStop(0.3, config.sunColor);
      sunGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(Vx, horizonY, config.sunRadius, 0, Math.PI * 2);
      ctx.fill();

      // Clouds (Sunset and Sunny themes)
      if (environment !== 'cyber') {
        ctx.fillStyle = environment === 'snow' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.22)';
        clouds.forEach(c => {
          if (isRunning) {
            c.x += c.speed;
            if (c.x > W) c.x = -c.w;
          }
          ctx.beginPath();
          ctx.ellipse(c.x, c.y, c.w * 0.5, c.h * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(c.x + c.w * 0.2, c.y + c.h * 0.1, c.w * 0.4, c.h * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Cyber Spotlights
      if (environment === 'cyber') {
        const timeSec = Date.now() * 0.001;
        const drawSpotlight = (x, y, angleOffset, color) => {
          ctx.save();
          const angle = Math.sin(timeSec + angleOffset) * 0.15 - Math.PI / 2;
          const beamLength = H * 0.75;
          
          const grad = ctx.createRadialGradient(x, y, 0, x, y, beamLength);
          grad.addColorStop(0, color);
          grad.addColorStop(0.4, 'rgba(0, 242, 254, 0.03)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(angle - 0.15) * beamLength, y + Math.sin(angle - 0.15) * beamLength);
          ctx.lineTo(x + Math.cos(angle + 0.15) * beamLength, y + Math.sin(angle + 0.15) * beamLength);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        };
        drawSpotlight(W * 0.12, horizonY, 0, 'rgba(0, 242, 254, 0.12)');
        drawSpotlight(W * 0.38, horizonY, 1.5, 'rgba(16, 185, 129, 0.08)');
        drawSpotlight(W * 0.62, horizonY, 3.0, 'rgba(16, 185, 129, 0.08)');
        drawSpotlight(W * 0.88, horizonY, 4.5, 'rgba(0, 242, 254, 0.12)');
      }

      // 2. Draw Grass Fields on the sides
      ctx.fillStyle = config.grassColor;
      ctx.fillRect(0, horizonY, W, H - horizonY);

      // Draw Distant Hills silhouette
      ctx.fillStyle = environment === 'cyber' ? '#02060f' : environment === 'snow' ? '#475569' : '#0f3224';
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.quadraticCurveTo(W * 0.15, horizonY - 12, W * 0.35, horizonY - 4);
      ctx.quadraticCurveTo(W * 0.55, horizonY - 18, W * 0.7, horizonY - 6);
      ctx.quadraticCurveTo(W * 0.88, horizonY - 8, W, horizonY);
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fill();

      // Redraw grass overlay
      ctx.fillStyle = config.grassColor;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(W, horizonY);
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fill();

      // 3. Draw Track Surface
      ctx.fillStyle = config.trackColor;
      ctx.beginPath();
      ctx.moveTo(Vx - 18, horizonY);
      ctx.lineTo(Vx + 18, horizonY);
      ctx.lineTo(endX, H);
      ctx.lineTo(startX, H);
      ctx.closePath();
      ctx.fill();

      // 4. Draw lane dividing chalk lines
      ctx.strokeStyle = config.laneLineColor;
      ctx.lineWidth = 1.5;
      for (let i = 1; i < numLanes; i++) {
        const bottomDividerX = startX + i * (endX - startX) / numLanes;
        const topDividerX = Vx - 18 + i * 36 / numLanes;
        ctx.beginPath();
        ctx.moveTo(topDividerX, horizonY);
        ctx.lineTo(bottomDividerX, H);
        ctx.stroke();
      }

      // 5. Draw 3D Fences/Rails
      ctx.strokeStyle = config.fenceColor;
      ctx.lineWidth = 2.5;

      // Horizontal rails
      ctx.beginPath();
      ctx.moveTo(Vx - 18, horizonY);
      ctx.lineTo(startX, H - 40);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(Vx + 18, horizonY);
      ctx.lineTo(endX, H - 40);
      ctx.stroke();

      // Vertical posts
      ctx.fillStyle = config.postColor;
      const numPosts = 10;
      for (let k = 0; k <= numPosts; k++) {
        const val = k / numPosts;
        const t = val * val;
        const y = horizonY + (H - horizonY) * t;
        const postH = 40 * t;

        // Left post
        const lx = Vx - 18 + (startX - (Vx - 18)) * t;
        ctx.fillRect(lx - 1.5 * t, y - postH, 3 * t, postH);

        // Right post
        const rx = Vx + 18 + (endX - (Vx + 18)) * t;
        ctx.fillRect(rx - 1.5 * t, y - postH, 3 * t, postH);
      }

      // 6. Draw Horizontal dirt speed texture
      if (isRunning) {
        speedOffset += 0.05;
        if (speedOffset > 1) speedOffset -= 1;
      }
      ctx.strokeStyle = config.gridColor;
      ctx.lineWidth = 2;
      for (let k = 0; k < 15; k++) {
        const val = (k + speedOffset) / 15;
        const t = val * val;
        const lineY = horizonY + (H - horizonY) * t;
        const leftLimitX = Vx - 18 + (startX - (Vx - 18)) * t;
        const rightLimitX = Vx + 18 + (endX - (Vx + 18)) * t;
        
        ctx.beginPath();
        ctx.moveTo(leftLimitX, lineY);
        ctx.lineTo(rightLimitX, lineY);
        ctx.stroke();
      }

      // 7. Draw Checkered Finish Line Banner & Posts at t = 0.92
      const finishT = 0.92;
      const finishY = horizonY + (H - horizonY) * (finishT * finishT);
      const finishLeftX = Vx - 18 + (startX - (Vx - 18)) * finishT;
      const finishRightX = Vx + 18 + (endX - (Vx + 18)) * finishT;

      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(finishLeftX, finishY);
      ctx.lineTo(finishRightX, finishY);
      ctx.stroke();
      
      ctx.strokeStyle = '#000000';
      ctx.setLineDash([8, 8]);
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(finishLeftX, finishY);
      ctx.lineTo(finishRightX, finishY);
      ctx.stroke();
      ctx.restore();

      // Draw Finish Posts
      const finishPostH = 65;
      ctx.fillStyle = '#b91c1c';
      
      ctx.fillRect(finishLeftX - 4, finishY - finishPostH, 8, finishPostH);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(finishLeftX - 4, finishY - finishPostH + 15, 8, 12);
      ctx.fillRect(finishLeftX - 4, finishY - finishPostH + 40, 8, 12);

      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(finishRightX - 4, finishY - finishPostH, 8, finishPostH);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(finishRightX - 4, finishY - finishPostH + 15, 8, 12);
      ctx.fillRect(finishRightX - 4, finishY - finishPostH + 40, 8, 12);

      // overhead banner
      ctx.fillStyle = '#0f3224';
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2;
      const bannerW = finishRightX - finishLeftX - 40;
      const bannerH = 18;
      const bannerX = finishLeftX + 20;
      const bannerY = finishY - finishPostH + 5;
      
      ctx.fillRect(bannerX, bannerY, bannerW, bannerH);
      ctx.strokeRect(bannerX, bannerY, bannerW, bannerH);
      
      ctx.fillStyle = '#d4af37';
      ctx.font = "bold 9px 'Inter', sans-serif";
      ctx.textAlign = 'center';
      ctx.fillText("FINISH", Vx, bannerY + 12);

      // 8. Draw Violation Flags
      horsesRef.current.forEach((horse, laneIndex) => {
        if (horse.flaggedPositions && horse.flaggedPositions.length > 0) {
          horse.flaggedPositions.forEach(pos => {
            const posT = pos / 100;
            const y = horizonY + (H - horizonY) * (posT * posT);
            const laneStartX = startX + (laneIndex + 0.5) * (endX - startX) / numLanes;
            const x = Vx + (laneStartX - Vx) * posT;
            
            const flagScale = posT;
            const flagHeight = 40 * flagScale;

            ctx.save();
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#ef4444';
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3 * flagScale;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y - flagHeight);
            ctx.stroke();
            
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(x, y - flagHeight);
            ctx.lineTo(x + 12 * flagScale, y - flagHeight + 4 * flagScale);
            ctx.lineTo(x, y - flagHeight + 8 * flagScale);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          });
        }
      });

      // 9. Draw Horses
      visualHorses.current.forEach((vHorse, laneIndex) => {
        const stateHorse = horsesRef.current.find(h => h.id === vHorse.id);
        const targetProgress = stateHorse ? stateHorse.progress : 0;
        
        vHorse.visualProgress += (targetProgress - vHorse.visualProgress) * 0.08;
        if (Math.abs(targetProgress - vHorse.visualProgress) < 0.01) {
          vHorse.visualProgress = targetProgress;
        }

        const t = vHorse.visualProgress / 100;
        const laneStartX = startX + (laneIndex + 0.5) * (endX - startX) / numLanes;
        const horseX = Vx + (laneStartX - Vx) * t;
        const baseHorseY = horizonY + (H - horizonY) * (t * t);

        const gallopFreq = 0.02 + 0.03 * (laneIndex % 3);
        const bobY = isRunning && vHorse.visualProgress < 100
          ? Math.sin(Date.now() * gallopFreq) * 5 * t
          : 0;
        const horseY = baseHorseY + bobY;
        const size = 16 + 42 * t;

        let horseColor = '#00f2fe';
        if (vHorse.id === 2) horseColor = '#10b981';
        if (vHorse.id === 3) horseColor = '#ef4444';
        if (vHorse.id === 4) horseColor = '#d4af37';

        if (!vHorse.trail) vHorse.trail = [];
        if (isRunning && vHorse.visualProgress < 100) {
          vHorse.trail.push({ x: horseX, y: horseY, size, alpha: 0.5 });
          if (vHorse.trail.length > 10) vHorse.trail.shift();
        } else {
          if (vHorse.trail.length > 0) vHorse.trail.shift();
        }

        // Elliptical ground shadow
        ctx.fillStyle = `rgba(0, 0, 0, ${0.45 * t})`;
        ctx.beginPath();
        ctx.ellipse(horseX, baseHorseY + 2 * t, size * 0.45, size * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Trail ribbon
        vHorse.trail.forEach((p, idx) => {
          const alpha = (idx / vHorse.trail.length) * p.alpha;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.shadowBlur = 5;
          ctx.shadowColor = horseColor;
          ctx.fillStyle = horseColor;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.35, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // Dust clouds
        if (isRunning && vHorse.visualProgress > 0 && vHorse.visualProgress < 100) {
          ctx.fillStyle = config.dustColor;
          for (let p = 0; p < 2; p++) {
            ctx.beginPath();
            ctx.arc(
              horseX - (size * 0.45) + (Math.random() - 0.5) * 8,
              baseHorseY + 2 * t + (Math.random() - 0.5) * 4,
              (1.5 + Math.random() * 3.5) * t,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        }

        // Holographic Ring
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = horseColor;
        ctx.strokeStyle = horseColor;
        ctx.lineWidth = 2.5;
        
        ctx.beginPath();
        ctx.arc(horseX, horseY, size * 0.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Inner fill
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(horseX, horseY, size * 0.48, 0, Math.PI * 2);
        ctx.fill();

        // Emoji
        ctx.fillStyle = '#ffffff';
        ctx.font = `${Math.round(size * 0.55)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🏇', horseX, horseY);

        // Nametag
        if (size > 22) {
          ctx.save();
          ctx.fillStyle = 'rgba(15, 30, 24, 0.85)';
          ctx.strokeStyle = horseColor;
          ctx.lineWidth = 1;
          const labelW = size * 1.5;
          const labelH = size * 0.4;
          const lx = horseX - labelW * 0.5;
          const ly = horseY - size * 0.65 - labelH;
          
          ctx.fillRect(lx, ly, labelW, labelH);
          ctx.strokeRect(lx, ly, labelW, labelH);
          
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.max(9, Math.round(size * 0.22))}px 'Inter', sans-serif`;
          ctx.fillText(`H${vHorse.id}: ${vHorse.name.split(' ')[0]}`, horseX, ly + labelH * 0.55);
          ctx.restore();
        }
      });

      // Falling Snow Particles (Snow Theme)
      if (environment === 'snow') {
        ctx.fillStyle = '#ffffff';
        snowFlakes.forEach(flake => {
          if (isRunning) {
            flake.y += flake.speedY;
            flake.x += flake.speedX;
            if (flake.y > H) {
              flake.y = 0;
              flake.x = Math.random() * W;
            }
          }
          ctx.beginPath();
          ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isRunning, environment]);

  const handleStart = () => {
    if (finished) {
      // Reset
      setHorses(initialHorses);
      setFinished(false);
      setResultsSaved(false);
      
      const newRaceId = Date.now();
      setSimulatedRaceName(`Simulated Race #${Math.floor(newRaceId / 1000) % 1000}`);
      
      // Reset visual models
      visualHorses.current = initialHorses.map(h => ({ ...h, visualProgress: 0, trail: [] }));
    }
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleFlagClick = (horse) => {
    setClickedProgress(Math.round(horse.progress));
    setSelectedHorseForFlag(horse);
    setShowFlagModal(true);
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;
    
    const H = canvas.height;
    const W = canvas.width;
    const horizonY = H * 0.32;
    const startX = W * 0.06;
    const endX = W * 0.94;
    const Vx = W / 2;
    
    if (clickY > horizonY) {
      const t = Math.sqrt((clickY - horizonY) / (H - horizonY));
      const progressPercent = t * 100;
      let clickedLane = -1;
      
      for (let i = 0; i < numLanes; i++) {
        const leftTopX = Vx - 18 + i * 36 / numLanes;
        const leftBottomX = startX + i * (endX - startX) / numLanes;
        const rightTopX = Vx - 18 + (i + 1) * 36 / numLanes;
        const rightBottomX = startX + (i + 1) * (endX - startX) / numLanes;
        
        const leftX = leftTopX + (leftBottomX - leftTopX) * t;
        const rightX = rightTopX + (rightBottomX - rightTopX) * t;
        
        if (clickX >= leftX && clickX <= rightX) {
          clickedLane = i;
          break;
        }
      }
      
      if (clickedLane !== -1) {
        const horse = horses.find(h => h.id === clickedLane + 1);
        if (horse) {
          setClickedProgress(Math.round(progressPercent));
          setSelectedHorseForFlag(horse);
          setShowFlagModal(true);
        }
      }
    }
  };

  const submitFlag = async () => {
    if (!flagReason) return;
    try {
      const position = clickedProgress !== null ? clickedProgress : Math.round(selectedHorseForFlag.progress);
      await reportViolationAPI({
        raceName: simulatedRaceName,
        horseName: selectedHorseForFlag.name,
        jockeyName: 'Unknown',
        violationType: `${flagReason} (at ${position}%)`,
        isBlacklist: false
      });
      
      setHorses(prev => prev.map(h => {
        if (h.id === selectedHorseForFlag.id) {
          return {
            ...h,
            flaggedPositions: [...(h.flaggedPositions || []), position]
          };
        }
        return h;
      }));

      setShowFlagModal(false);
      setFlagReason('');
      setClickedProgress(null);
    } catch (err) {
      alert('Failed to flag: ' + err.message);
    }
  };

  // Sort horses in real-time based on progress/results for HUD leaderboard
  const sortedLeaderboard = [...horses].sort((a, b) => {
    if (a.finishedTime && b.finishedTime) {
      return a.finishedTime - b.finishedTime;
    }
    if (a.finishedTime) return -1;
    if (b.finishedTime) return 1;
    return b.progress - a.progress;
  });

  return (
    <>
      <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h2 className="ho-font-epilogue fs-3 fw-bold text-dark m-0">Live Simulation</h2>
                <span className="live-status-badge">
                  <span className="pulse-dot"></span> LIVE
                </span>
              </div>
              <p className="text-secondary small m-0">Virtual high-tech perspective tracking and incident flagging tool.</p>
            </div>
          </div>
          <div className="d-flex gap-2">
            {!isRunning ? (
              <button className="ho-btn ho-btn-gold-solid py-2 px-4" onClick={handleStart}>
                {finished ? 'Restart Simulation' : 'Start Simulation'}
              </button>
            ) : (
              <button className="ho-btn ho-btn-outline-danger py-2 px-4" onClick={handleStop}>
                Pause Simulation
              </button>
            )}
          </div>
        </div>

        <div className="sim-container">
          {/* Racetrack Visual Container */}
          <div className="glass-sim-card">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
              <span className="fw-bold text-dark fs-6 d-flex align-items-center gap-2">
                <span className="material-symbols-outlined text-success" style={{ fontSize: '18px' }}>analytics</span>
                {simulatedRaceName}
              </span>
              <div className="d-flex flex-wrap align-items-center gap-2">
                <div className="d-flex align-items-center gap-1 small text-secondary me-2">
                  <span>Theme:</span>
                  <select 
                    className="form-select form-select-sm bg-white border-secondary text-dark" 
                    style={{ fontSize: '11px', borderRadius: '20px', padding: '2px 24px 2px 8px', width: 'auto', minWidth: '120px' }}
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                  >
                    <option value="sunset">🌇 Sunset Twilight</option>
                    <option value="cyber">🛸 Cyber Neon</option>
                    <option value="sunny">☀️ Sunny Turf</option>
                    <option value="snow">❄️ Snowy Winter</option>
                  </select>
                </div>
                <span className="stat-pill">Dist: <strong>2300m</strong></span>
                <span className="stat-pill">Track: <strong className="text-success">{environment === 'snow' ? 'SNOW' : 'TURF'}</strong></span>
                <span className="stat-pill">Weather: <strong className={environment === 'snow' ? 'text-info' : environment === 'sunny' ? 'text-warning' : 'text-success'}>
                  {environment === 'snow' ? 'SNOWING' : environment === 'sunny' ? 'SUNNY' : 'CLEAR'}
                </strong></span>
                <span className="stat-pill">Temp: <strong>{environment === 'snow' ? '-2°C' : environment === 'sunny' ? '28°C' : '24°C'}</strong></span>
              </div>
            </div>

            <div className="canvas-wrapper">
              <canvas 
                ref={canvasRef} 
                width={880} 
                height={495} 
                onClick={handleCanvasClick}
                style={{ cursor: 'crosshair' }}
              />
            </div>
            <div className="text-center mt-3 text-secondary small">
              💡 <span className="text-info">Tip:</span> Click directly on a track lane inside the simulator to quickly flag a violation at that specific progress position.
            </div>
          </div>

          {/* Right Floating Leaders Panel */}
          <div className="glass-hud-panel">
            <h4 className="fw-bold text-dark fs-5 mb-3 pb-2 d-flex align-items-center gap-2" style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
              <span className="material-symbols-outlined text-warning">emoji_events</span>
              Leaderboard
            </h4>
            
            <div className="leaderboard-list">
              {sortedLeaderboard.map((horse, idx) => {
                const rank = idx + 1;
                return (
                  <div 
                    key={horse.id} 
                    className={`leaderboard-item rank-${rank}`}
                    style={{ borderLeftColor: horse.color }}
                  >
                    <div className="leaderboard-rank">
                      {rank === 1 ? '1st' : rank === 2 ? '2nd' : rank === 3 ? '3rd' : `${rank}th`}
                    </div>
                    
                    <div className="leaderboard-horse-info">
                      <div className="leaderboard-horse-name d-flex align-items-center gap-2">
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: horse.color }}></span>
                        {horse.name}
                      </div>
                      <div className="leaderboard-jockey-name">Jockey {horse.id}</div>
                    </div>
                    
                    <div className="leaderboard-metrics">
                      <div className="leaderboard-progress">{Math.round(horse.progress)}%</div>
                      <button 
                        className="btn-flag-action" 
                        onClick={() => handleFlagClick(horse)}
                        title="Flag violation"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>flag</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showFlagModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={() => { setShowFlagModal(false); setClickedProgress(null); }}>
          <div className="modal-content-custom animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="fs-5 fw-bold mb-3 text-dark d-flex align-items-center gap-2">
              <span className="material-symbols-outlined text-danger">report</span>
              Flag Violation
            </h3>
            <p className="mb-2 text-secondary">Horse: <strong className="text-dark">{selectedHorseForFlag?.name}</strong></p>
            <p className="mb-3 text-secondary small">Flag Position: <strong className="text-primary-medium">{clickedProgress}%</strong> along the track</p>
            <div className="mb-4">
              <label className="ho-input-label mb-2">Reason for Flagging</label>
              <select 
                className="ho-form-input" 
                value={flagReason} 
                onChange={(e) => setFlagReason(e.target.value)}
              >
                <option value="">Select a reason...</option>
                <option value="Illegal Blocking">Illegal Blocking</option>
                <option value="Dangerous Riding">Dangerous Riding</option>
                <option value="Whip Violation">Whip Violation</option>
              </select>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button className="ho-btn ho-btn-outline-secondary" onClick={() => { setShowFlagModal(false); setClickedProgress(null); }}>Cancel</button>
              <button className="ho-btn ho-btn-outline-danger" onClick={submitFlag} disabled={!flagReason}>Submit Flag</button>
            </div>
          </div>
        </div>
      )}

      {showResultsSummary && (
        <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={() => setShowResultsSummary(false)}>
          <div className="modal-content-custom animate-scale-up text-center p-4" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <span className="material-symbols-outlined text-warning mb-2" style={{ fontSize: '64px' }}>
              emoji_events
            </span>
            <h3 className="ho-font-epilogue fs-4 fw-bold text-dark mb-1">Race Completed!</h3>
            <p className="text-secondary small mb-4">{simulatedRaceName}</p>

            {/* Podium List */}
            <div className="d-flex flex-column gap-2 mb-4 text-start">
              {finalPodium.slice(0, 3).map((item) => (
                <div 
                  key={item.rank} 
                  className="d-flex align-items-center justify-content-between p-3 rounded"
                  style={{ 
                    backgroundColor: item.rank === 1 ? 'rgba(212, 175, 55, 0.08)' : '#f8f9fa',
                    border: item.rank === 1 ? '1px solid var(--ho-accent-gold)' : '1px solid #e9ecef'
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <span style={{ fontSize: '24px' }}>
                      {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : '🥉'}
                    </span>
                    <div>
                      <h6 className="fw-bold text-dark mb-0">{item.horseName}</h6>
                      <span className="text-secondary small">{item.jockeyName}</span>
                    </div>
                  </div>
                  <span className="fw-bold text-primary small">{item.time}</span>
                </div>
              ))}
            </div>

            <div className="d-flex gap-2">
              <button 
                className="ho-btn ho-btn-outline-secondary flex-grow-1" 
                onClick={() => setShowResultsSummary(false)}
              >
                Close
              </button>
              <button 
                className="ho-btn ho-btn-gold-solid flex-grow-1 py-2" 
                onClick={() => {
                  setShowResultsSummary(false);
                  navigate('/referee/confirm-results');
                }}
              >
                Confirm Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
