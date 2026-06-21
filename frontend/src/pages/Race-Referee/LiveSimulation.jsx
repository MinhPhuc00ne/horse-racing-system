import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssignedRacesAPI, getRacePreCheckAPI, getCompletedRacesAPI, reportViolationAPI, saveSimulatedRaceAPI, startRaceAPI } from '../../services/referee';
import RaphaelHUD from './RaphaelHUD';
import './LiveSimulation.css';

export default function LiveSimulation() {
  const navigate = useNavigate();

  const [horses, setHorses] = useState([]);
  const numLanes = Math.max(1, horses.length);
  const [racePhase, setRacePhase] = useState('IDLE'); // IDLE, RAPHAEL, PRE_RACE, RUNNING, FINISHED
  const [spawnedCount, setSpawnedCount] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [resultsSaved, setResultsSaved] = useState(false);

  // Custom Modals State
  const [showResultsSummary, setShowResultsSummary] = useState(false);
  const [finalPodium, setFinalPodium] = useState([]);
  const [simulatedRaceName, setSimulatedRaceName] = useState('Simulated Race');
  const [actualRaceId, setActualRaceId] = useState(null);

  const [selectedHorseForFlag, setSelectedHorseForFlag] = useState(null);
  const [flagReason, setFlagReason] = useState('');
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [clickedProgress, setClickedProgress] = useState(null);
  const [environment, setEnvironment] = useState('sunset');

  const canvasRef = useRef(null);
  const horsesRef = useRef(horses);
  const visualHorses = useRef([]);
  const confettiParticles = useRef([]);

  const triggerConfetti = () => {
    const colors = ['#fbbf24', '#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#ec4899', '#8b5cf6'];
    const newParticles = [];
    for (let i = 0; i < 80; i++) {
      newParticles.push({
        x: 440 + (Math.random() - 0.5) * 300,
        y: 495,
        vx: (Math.random() - 0.5) * 10,
        vy: -15 - Math.random() * 15,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 6,
        alpha: 1.0,
        gravity: 0.35,
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 0.2
      });
    }
    confettiParticles.current.push(...newParticles);
  };

  // Sync state to ref for rendering frame rate decoupling
  useEffect(() => {
    horsesRef.current = horses;
  }, [horses]);

  // Handle simulation timer
  useEffect(() => {
    let interval;
    if (racePhase === 'RUNNING') {
      interval = setInterval(() => {
        setHorses(prev => {
          let allFinished = true;
          const nextHorses = prev.map(h => {
            if (h.isDisqualified) return h;
            if (h.progress < 100) {
              // Adjust advance to make the race last ~30s (average 1.25% per 400ms)
              const advance = 0.5 + Math.random() * 1.5;
              const newProgress = Math.min(100, h.progress + advance);
              if (newProgress < 100) allFinished = false;

              let finishedTime = h.finishedTime;
              if (newProgress === 100 && !h.finishedTime) {
                const penalty = (h.flaggedPositions?.length || 0) * 4000;
                finishedTime = Date.now() + penalty;
                triggerConfetti();
              }
              return { ...h, progress: newProgress, finishedTime };
            }
            return h;
          });

          allFinished = nextHorses.length > 0 && nextHorses.every(h => h.progress >= 100 || h.isDisqualified);
          if (allFinished) {
            setRacePhase('FINISHED');
          }
          return nextHorses;
        });
      }, 400);
    }
    return () => clearInterval(interval);
  }, [racePhase]);

  // Pre-Race Sequence
  useEffect(() => {
    if (racePhase === 'PRE_RACE') {
      let isCancelled = false;
      const runPreRace = async () => {
        for (let i = 1; i <= numLanes; i++) {
          await new Promise(r => setTimeout(r, 600));
          if (isCancelled) return;
          setSpawnedCount(i);
        }
        await new Promise(r => setTimeout(r, 600));
        for (let i = 5; i > 0; i--) {
          if (isCancelled) return;
          setCountdown(i.toString());
          await new Promise(r => setTimeout(r, 1000));
        }
        if (isCancelled) return;
        setCountdown('GO!');
        await new Promise(r => setTimeout(r, 600));
        if (isCancelled) return;
        setCountdown(null);
        setRacePhase('RUNNING');
      };
      runPreRace();
      return () => { isCancelled = true; };
    }
  }, [racePhase, numLanes]);

  // Fetch real upcoming race and participants
  useEffect(() => {
    const fetchUpcomingRace = async () => {
      try {
        let races = await getAssignedRacesAPI('upcoming');
        if (!races || races.length === 0) {
          races = await getAssignedRacesAPI('running');
        }
        if (races && races.length > 0) {
          const race = races[0];
          const rId = race.raceId || race.id;
          setActualRaceId(rId);
          setSimulatedRaceName(race.raceName);

          const preCheck = await getRacePreCheckAPI(rId);
          if (preCheck && preCheck.participants && preCheck.participants.length > 0) {
            const fetchedHorses = preCheck.participants.map((p, idx) => ({
              id: p.participantId,
              horseId: p.horseId,
              name: p.horseName,
              jockeyName: p.jockeyName,
              ownerName: p.ownerName || 'Tập đoàn ' + ['Alpha', 'Vanguard', 'Omega', 'Titan', 'Apex'][idx % 5],
              weight: p.actualWeight || (450 + Math.random() * 50).toFixed(1),
              progress: 0,
              color: ['#00f2fe', '#10b981', '#ef4444', '#d4af37', '#9333ea'][idx % 5],
              flaggedPositions: []
            }));
            setHorses(fetchedHorses);
            visualHorses.current = fetchedHorses.map(h => ({ ...h, visualProgress: 0, trail: [] }));
          }
        } else {
          setSimulatedRaceName('Chưa có vòng đua nào');
          setHorses([]);
          setActualRaceId(null);
        }
      } catch (err) {
        console.error("Failed to fetch real race data for simulation", err);
        setSimulatedRaceName('Lỗi tải dữ liệu');
      }
    };
    fetchUpcomingRace();
  }, []);

  // Handle saving race results to localStorage when finished
  useEffect(() => {
    if (racePhase === 'FINISHED' && !resultsSaved) {
      // Sort horses to calculate ranks
      const sorted = [...horses].sort((a, b) => {
        if (a.isDisqualified && b.isDisqualified) return 0;
        if (a.isDisqualified) return 1;
        if (b.isDisqualified) return -1;
        return (a.finishedTime || 0) - (b.finishedTime || 0);
      });
      const results = sorted.map((h, index) => {
        const flagPenalties = h.flaggedPositions?.length || 0;
        return {
          rank: h.isDisqualified ? 'DSQ' : index + 1,
          horseName: h.name,
          jockeyName: h.jockeyName || ('Jockey ' + h.id),
          time: h.isDisqualified ? 'Disqualified' : `1m ${15 + index * 2 + flagPenalties * 4}s`
        };
      });

      const newRaceId = actualRaceId || Date.now();
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
  }, [racePhase, horses, resultsSaved, simulatedRaceName]);

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

    // Pre-generate rain drops
    const rainDrops = [];
    for (let i = 0; i < 150; i++) {
      rainDrops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        l: Math.random() * 15 + 10,
        speedY: Math.random() * 6 + 10,
        speedX: Math.random() * 1.5 + 0.5
      });
    }

    const render = () => {
      const W = canvas.width;
      const H = canvas.height;
      const horizonY = H * 0.32; // horizon at 32% of canvas height
      const startX = W * 0.06;
      const endX = W * 0.94;
      const Vx = W / 2;

      const drawStands = (isLeft) => {
        ctx.save();
        ctx.fillStyle = environment === 'cyber' ? '#111827' : '#334155';
        ctx.strokeStyle = environment === 'cyber' ? '#00f2fe' : '#475569';
        ctx.lineWidth = 2;

        let topX1, topY1_val, topX2, topY2_val, bottomX2, bottomY2, bottomX1, bottomY1;
        if (isLeft) {
          topX1 = 0;
          topY1_val = horizonY - 40;
          topX2 = Vx - 55;
          topY2_val = horizonY - 20;
          bottomX2 = startX - 80;
          bottomY2 = H;
          bottomX1 = 0;
          bottomY1 = H;
        } else {
          topX1 = Vx + 55;
          topY1_val = horizonY - 20;
          topX2 = W;
          topY2_val = horizonY - 40;
          bottomX2 = W;
          bottomY2 = H;
          bottomX1 = endX + 80;
          bottomY1 = H;
        }

        // Draw main concrete stand structure
        ctx.beginPath();
        ctx.moveTo(topX1, topY1_val);
        ctx.lineTo(topX2, topY2_val);
        ctx.lineTo(bottomX2, bottomY2);
        ctx.lineTo(bottomX1, bottomY1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw stand roof (canopy)
        ctx.fillStyle = environment === 'cyber' ? '#0f172a' : '#1e293b';
        ctx.beginPath();
        if (isLeft) {
          ctx.moveTo(0, topY1_val - 25);
          ctx.lineTo(Vx - 65, topY2_val - 15);
          ctx.lineTo(Vx - 55, topY2_val);
          ctx.lineTo(0, topY1_val);
        } else {
          ctx.moveTo(Vx + 55, topY1_val);
          ctx.lineTo(W, topY2_val);
          ctx.lineTo(W, topY2_val - 25);
          ctx.lineTo(Vx + 65, topY1_val - 15);
        }
        ctx.closePath();
        ctx.fill();

        // Canopy trim/neon light
        ctx.strokeStyle = environment === 'cyber' ? '#00f2fe' : '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (isLeft) {
          ctx.moveTo(0, topY1_val);
          ctx.lineTo(Vx - 55, topY2_val);
        } else {
          ctx.moveTo(Vx + 55, topY1_val);
          ctx.lineTo(W, topY2_val);
        }
        ctx.stroke();

        // Draw Tiers
        const numTiers = 8;
        ctx.strokeStyle = environment === 'cyber' ? 'rgba(0, 242, 254, 0.4)' : 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1.5;
        for (let t = 1; t < numTiers; t++) {
          const ratio = t / numTiers;
          ctx.beginPath();
          if (isLeft) {
            const startX_tier = 0;
            const startY_tier = topY1_val + (H - topY1_val) * ratio;
            const endX_tier = (Vx - 55) + ((startX - 80) - (Vx - 55)) * ratio;
            const endY_tier = topY2_val + (H - topY2_val) * ratio;
            ctx.moveTo(startX_tier, startY_tier);
            ctx.lineTo(endX_tier, endY_tier);
          } else {
            const startX_tier = (Vx + 55) + ((endX + 80) - (Vx + 55)) * ratio;
            const startY_tier = topY1_val + (H - topY1_val) * ratio;
            const endX_tier = W;
            const endY_tier = topY2_val + (H - topY2_val) * ratio;
            ctx.moveTo(startX_tier, startY_tier);
            ctx.lineTo(endX_tier, endY_tier);
          }
          ctx.stroke();
        }

        const timeSec = Date.now() * 0.005;
        const crowdColors = ['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#e2e8f0', '#a78bfa'];

        // Draw Spectators
        for (let tier = 0; tier < numTiers; tier++) {
          const ratio = (tier + 0.5) / numTiers;
          
          let startX_tier, startY_tier, endX_tier, endY_tier;
          if (isLeft) {
            startX_tier = 0;
            startY_tier = topY1_val + (H - topY1_val) * ratio;
            endX_tier = (Vx - 55) + ((startX - 80) - (Vx - 55)) * ratio;
            endY_tier = topY2_val + (H - topY2_val) * ratio;
          } else {
            startX_tier = (Vx + 55) + ((endX + 80) - (Vx + 55)) * ratio;
            startY_tier = topY1_val + (H - topY1_val) * ratio;
            endX_tier = W;
            endY_tier = topY2_val + (H - topY2_val) * ratio;
          }

          const size = 2.2 + 8.5 * ratio;
          const count = Math.floor(25 + 65 * ratio); // Dense crowd
          
          for (let i = 0; i < count; i++) {
            const xRatio = i / (count - 1 || 1);
            const x = startX_tier + (endX_tier - startX_tier) * xRatio;
            const y = startY_tier + (endY_tier - startY_tier) * xRatio;
            
            const seed = (tier * 100 + i) * 2.3;
            const bob = (racePhase === 'RUNNING') ? Math.sin(timeSec * 3 + seed) * (1.2 + 3.8 * ratio) : 0;

            // Optional cheering arms (drawn behind/next to body)
            if (racePhase === 'RUNNING' && (i + tier) % 3 === 0) {
              ctx.strokeStyle = '#fca5a5';
              ctx.lineWidth = Math.max(1, size * 0.22);
              ctx.beginPath();
              // Left arm
              ctx.moveTo(x - size * 0.22, y - size * 0.8 + bob);
              ctx.lineTo(x - size * 0.55, y - size * 1.5 + bob + Math.cos(timeSec * 6 + seed) * (size * 0.4));
              // Right arm
              ctx.moveTo(x + size * 0.22, y - size * 0.8 + bob);
              ctx.lineTo(x + size * 0.55, y - size * 1.5 + bob + Math.sin(timeSec * 6 + seed) * (size * 0.4));
              ctx.stroke();
            }

            // Body
            ctx.fillStyle = crowdColors[(tier + i) % crowdColors.length];
            ctx.beginPath();
            ctx.arc(x, y - size * 0.8 + bob, size * 0.45, 0, Math.PI * 2);
            ctx.fill();
            
            // Head
            ctx.fillStyle = '#fca5a5';
            ctx.beginPath();
            ctx.arc(x, y - size * 1.25 + bob, size * 0.3, 0, Math.PI * 2);
            ctx.fill();

            // Cap/Hair
            ctx.fillStyle = crowdColors[(tier + i + 3) % crowdColors.length];
            ctx.beginPath();
            ctx.arc(x, y - size * 1.4 + bob, size * 0.28, Math.PI, 0);
            ctx.fill();

            // Waving flags
            if ((i + tier * 3) % 12 === 0) {
              const flagColor = crowdColors[(tier + i + 1) % crowdColors.length];
              const flagHeight = size * 1.6;
              const flagWaving = Math.sin(timeSec * 5 + seed) * (size * 0.35);
              
              ctx.strokeStyle = '#94a3b8';
              ctx.lineWidth = Math.max(1, size * 0.15);
              ctx.beginPath();
              ctx.moveTo(x, y - size * 0.8 + bob);
              ctx.lineTo(x + size * 0.3, y - size * 0.8 - flagHeight + bob);
              ctx.stroke();
              
              ctx.fillStyle = flagColor;
              ctx.beginPath();
              ctx.moveTo(x + size * 0.3, y - size * 0.8 - flagHeight + bob);
              ctx.lineTo(x + size * 0.3 + size * 1.0, y - size * 0.8 - flagHeight + flagWaving + bob);
              ctx.lineTo(x + size * 0.3, y - size * 0.8 - flagHeight + size * 0.65 + bob);
              ctx.closePath();
              ctx.fill();
            }
          }
        }

        ctx.restore();
      };

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
        },
        rain: {
          skyColors: ['#2b323a', '#44515c', '#606c76'],
          sunColor: 'rgba(255, 255, 255, 0)',
          sunRadius: 0,
          grassColor: '#123524',
          trackColor: '#3d2b1f',
          fenceColor: '#a0aec0',
          laneLineColor: 'rgba(255, 255, 255, 0.3)',
          gridColor: 'rgba(0, 0, 0, 0.25)',
          dustColor: 'rgba(60, 40, 30, 0.4)',
          postColor: '#e2e8f0'
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
          if (racePhase === 'RUNNING') {
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

      // Draw Spectator Stands (left and right)
      drawStands(true);
      drawStands(false);

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
      if (racePhase === 'RUNNING') {
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

      // Pre-Race Overlay
      if (racePhase === 'PRE_RACE') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, W, H);
      }

      // 9. Draw Horses
      if (racePhase === 'PRE_RACE' || racePhase === 'RUNNING' || racePhase === 'FINISHED') {
        visualHorses.current.forEach((vHorse, laneIndex) => {
          if (racePhase === 'PRE_RACE' && laneIndex >= spawnedCount) return;
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
          const bobY = (racePhase === 'RUNNING') && vHorse.visualProgress < 100
            ? Math.sin(Date.now() * gallopFreq) * 5 * t
            : 0;
          const horseY = baseHorseY + bobY;
          const size = 16 + 42 * t;

          let horseColor = '#00f2fe';
          if (vHorse.id === 2) horseColor = '#10b981';
          if (vHorse.id === 3) horseColor = '#ef4444';
          if (vHorse.id === 4) horseColor = '#d4af37';

          if (!vHorse.trail) vHorse.trail = [];
          if (racePhase === 'RUNNING' && vHorse.visualProgress < 100) {
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
          if (racePhase === 'RUNNING' && vHorse.visualProgress > 0 && vHorse.visualProgress < 100) {
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

          // Draw Flags
          if (stateHorse && stateHorse.flaggedPositions && stateHorse.flaggedPositions.length > 0) {
            stateHorse.flaggedPositions.forEach(flagProg => {
              const ft = flagProg / 100;
              const flagX = Vx + (laneStartX - Vx) * ft;
              const flagY = horizonY + (H - horizonY) * (ft * ft);

              ctx.save();
              ctx.fillStyle = '#ef4444';
              ctx.font = `${Math.max(14, Math.round(35 * ft))}px Arial`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'bottom';
              ctx.shadowColor = '#000';
              ctx.shadowBlur = 4;
              ctx.fillText('🚩', flagX, flagY - 5);
              ctx.restore();
            });
          }
        });
      }

      // Falling Snow Particles (Snow Theme)
      if (environment === 'snow') {
        ctx.fillStyle = '#ffffff';
        snowFlakes.forEach(flake => {
          if (racePhase === 'RUNNING' || racePhase === 'PRE_RACE') {
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

      // Falling Rain Particles (Rain Theme)
      if (environment === 'rain') {
        ctx.strokeStyle = 'rgba(174, 194, 224, 0.6)';
        ctx.lineWidth = 1.5;
        rainDrops.forEach(drop => {
          if (racePhase === 'RUNNING' || racePhase === 'PRE_RACE') {
            drop.y += drop.speedY;
            drop.x -= drop.speedX;
            if (drop.y > H) {
              drop.y = -drop.l;
              drop.x = Math.random() * W + 100;
            }
          }
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - drop.speedX, drop.y + drop.l);
          ctx.stroke();
        });
      }

      // Draw Countdown Text
      if (countdown) {
        ctx.save();
        ctx.fillStyle = countdown === 'GO!' ? '#10b981' : '#ff8800';
        ctx.font = `bold 120px 'Arial Black', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 20;
        const pulse = 1 + Math.sin(Date.now() * 0.01) * 0.05;
        ctx.translate(W / 2, H / 2);
        ctx.scale(pulse, pulse);
        ctx.fillText(countdown, 0, 0);
        ctx.restore();
      }

      // Update and Draw Confetti
      if (confettiParticles.current.length > 0) {
        confettiParticles.current.forEach((p, idx) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity;
          p.rotation += p.rotationSpeed;
          p.alpha -= 0.008;

          if (p.alpha <= 0 || p.y > H) {
            confettiParticles.current.splice(idx, 1);
            return;
          }

          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        });
      }

      // Camera flashes in the crowd
      if (racePhase === 'RUNNING' && Math.random() < 0.12) {
        const flashCount = Math.floor(Math.random() * 3) + 1;
        for (let f = 0; f < flashCount; f++) {
          const flashIsLeft = Math.random() < 0.5;
          const flashTier = Math.floor(Math.random() * 8);
          const flashRatio = (flashTier + 0.5) / 8;
          const flashY_val = horizonY + (H - horizonY) * flashRatio;
          
          let lineStartX, lineEndX;
          if (flashIsLeft) {
            lineStartX = 0;
            lineEndX = (Vx - 55) + ((startX - 80) - (Vx - 55)) * flashRatio;
          } else {
            lineStartX = (Vx + 55) + ((endX + 80) - (Vx + 55)) * flashRatio;
            lineEndX = W;
          }
          const flashX = lineStartX + Math.random() * (lineEndX - lineStartX);
          const flashSize = 2 + 10 * Math.random();
          
          ctx.save();
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = environment === 'cyber' ? '#00f2fe' : '#ffffff';
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.arc(flashX, flashY_val - (2 + 9 * flashRatio), flashSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [racePhase, environment, countdown, spawnedCount]);

  const handleStart = async () => {
    if (racePhase === 'FINISHED') {
      // Refresh real data if any
      if (actualRaceId) {
        try {
          const preCheck = await getRacePreCheckAPI(actualRaceId);
          if (preCheck && preCheck.participants && preCheck.participants.length > 0) {
            const fetchedHorses = preCheck.participants.map((p, idx) => ({
              id: p.participantId,
              horseId: p.horseId,
              name: p.horseName,
              jockeyName: p.jockeyName,
              ownerName: p.ownerName || 'Tập đoàn ' + ['Alpha', 'Vanguard', 'Omega', 'Titan', 'Apex'][idx % 5],
              weight: p.actualWeight || (450 + Math.random() * 50).toFixed(1),
              progress: 0,
              color: ['#00f2fe', '#10b981', '#ef4444', '#d4af37', '#9333ea'][idx % 5],
              flaggedPositions: []
            }));
            setHorses(fetchedHorses);
            visualHorses.current = fetchedHorses.map(h => ({ ...h, visualProgress: 0, trail: [] }));
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        setHorses([]);
        visualHorses.current = [];
      }
      setResultsSaved(false);
      setSpawnedCount(0);
      setCountdown(null);
    }

    // Call start API if real race
    if (actualRaceId && racePhase !== 'FINISHED') {
      try {
        await startRaceAPI(actualRaceId);
      } catch (err) {
        console.error("Could not start race API", err);
      }
    }
    setRacePhase('RAPHAEL');
  };

  const handleRaphaelComplete = () => {
    setRacePhase('PRE_RACE');
  };

  const handleStop = () => {
    if (racePhase === 'RUNNING') setRacePhase('IDLE');
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

      const newFlags = [...(selectedHorseForFlag.flaggedPositions || []), position];
      const isBlacklisted = newFlags.length >= 3;

      await reportViolationAPI(actualRaceId, {
        horseId: selectedHorseForFlag.horseId,
        violationType: `${flagReason} (at ${position}%)`,
        description: `Flagged at ${position}%`
      });

      setHorses(prev => prev.map(h => {
        if (h.id === selectedHorseForFlag.id) {
          return {
            ...h,
            flaggedPositions: newFlags,
            isDisqualified: isBlacklisted,
            finishedTime: isBlacklisted ? null : h.finishedTime
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
            {racePhase === 'IDLE' || racePhase === 'FINISHED' ? (
              <button className="ho-btn ho-btn-gold-solid py-2 px-4" onClick={handleStart}>
                {racePhase === 'FINISHED' ? 'Restart Simulation' : 'Start Simulation'}
              </button>
            ) : racePhase === 'RUNNING' ? (
              <button className="ho-btn ho-btn-outline-danger py-2 px-4" onClick={handleStop}>
                Pause Simulation
              </button>
            ) : (
              <button className="ho-btn ho-btn-outline-secondary py-2 px-4" disabled>
                System Active...
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
                    <option value="rain">🌧️ Rainy Storm</option>
                  </select>
                </div>
                <span className="stat-pill">Dist: <strong>2300m</strong></span>
                <span className="stat-pill">Track: <strong className="text-success">{environment === 'snow' ? 'SNOW' : environment === 'rain' ? 'MUD' : 'TURF'}</strong></span>
                <span className="stat-pill">Weather: <strong className={environment === 'snow' ? 'text-info' : environment === 'rain' ? 'text-primary' : environment === 'sunny' ? 'text-warning' : 'text-success'}>
                  {environment === 'snow' ? 'SNOWING' : environment === 'rain' ? 'RAINING' : environment === 'sunny' ? 'SUNNY' : 'CLEAR'}
                </strong></span>
                <span className="stat-pill">Temp: <strong>{environment === 'snow' ? '-2°C' : environment === 'rain' ? '18°C' : environment === 'sunny' ? '28°C' : '24°C'}</strong></span>
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
                      <div className="leaderboard-jockey-name">{horse.jockeyName}</div>
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
                className="ho-btn ho-btn-gold-solid flex-grow-1 py-2"
                onClick={() => setShowResultsSummary(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {racePhase === 'RAPHAEL' && (
        <RaphaelHUD
          horses={horses}
          environment={environment}
          onComplete={handleRaphaelComplete}
        />
      )}
    </>
  );
}
