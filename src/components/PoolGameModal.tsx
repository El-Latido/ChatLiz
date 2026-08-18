import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { X, User } from 'lucide-react';
import { Socket } from 'socket.io-client';
import { UserObj } from '../types';

interface PoolGameModalProps {
  gameId: string;
  isHost: boolean;
  opponentName: string;
  bet: number;
  socket: Socket;
  user: UserObj;
  onClose: () => void;
}

const TABLE_WIDTH = 400;
const TABLE_HEIGHT = 800;
const BALL_RADIUS = 10;
const HOLE_RADIUS = 20;

export function PoolGameModal({ gameId, isHost, opponentName, bet, socket, user, onClose }: PoolGameModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  
  const [power, setPower] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [turn, setTurn] = useState<string>(isHost ? user.username : opponentName);
  const [status, setStatus] = useState<'playing' | 'game_over'>('playing');
  
  const [aimAngle, setAimAngle] = useState(0);
  const [ballPositions, setBallPositions] = useState<{ id: number; x: number; y: number; color: string; label: string }[]>([]);

  useEffect(() => {
    // Only Host runs physics
    if (!isHost) return;

    const engine = Matter.Engine.create({ gravity: { x: 0, y: 0, scale: 0 } });
    engineRef.current = engine;

    // Create table boundaries (cushions)
    const wallOptions = { isStatic: true, restitution: 0.9, render: { fillStyle: '#3E2723' } };
    const walls = [
      Matter.Bodies.rectangle(TABLE_WIDTH / 2, -10, TABLE_WIDTH, 20, wallOptions),
      Matter.Bodies.rectangle(TABLE_WIDTH / 2, TABLE_HEIGHT + 10, TABLE_WIDTH, 20, wallOptions),
      Matter.Bodies.rectangle(-10, TABLE_HEIGHT / 2, 20, TABLE_HEIGHT, wallOptions),
      Matter.Bodies.rectangle(TABLE_WIDTH + 10, TABLE_HEIGHT / 2, 20, TABLE_HEIGHT, wallOptions)
    ];
    Matter.World.add(engine.world, walls);

    // Initial rack of balls
    const balls: Matter.Body[] = [];
    const ballOptions = { restitution: 0.9, friction: 0.005, frictionAir: 0.015, density: 0.05 };

    const cueBall = Matter.Bodies.circle(TABLE_WIDTH * 0.25, TABLE_HEIGHT / 2, BALL_RADIUS, { 
        ...ballOptions, label: 'cue', render: { fillStyle: '#FFFFFF' } 
    });
    balls.push(cueBall);

    let startX = TABLE_WIDTH * 0.7;
    let startY = TABLE_HEIGHT / 2;
    let cols = 5;
    let ballId = 1;
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row <= col; row++) {
        let x = startX + col * (BALL_RADIUS * 2.1);
        let y = startY - (col * BALL_RADIUS) + (row * BALL_RADIUS * 2.1);
        let color = ballId === 8 ? '#000000' : (ballId % 2 === 0 ? '#1565C0' : '#D32F2F');
        balls.push(Matter.Bodies.circle(x, y, BALL_RADIUS, {
          ...ballOptions, label: ballId === 8 ? 'eight' : 'object', render: { fillStyle: color }
        }));
        ballId++;
      }
    }
    Matter.World.add(engine.world, balls);

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    const syncInterval = setInterval(() => {
        const positions = balls.filter(b => !b.isSensor).map(b => ({
            id: b.id,
            x: b.position.x,
            y: b.position.y,
            color: b.render.fillStyle || '#fff',
            label: b.label
        }));
        setBallPositions(positions);
        socket.emit('pool_sync', { gameId, positions });
        
        // Very basic Turn logic: if all balls are sleeping and we were moving, we change turn
        // For simplicity, just checking if speed < 0.1
        const isMoving = balls.some(b => b.speed > 0.1);
        // Turn logic requires tracking if a shot was fired and now finished. We'll add that later.
    }, 1000 / 30);

    
  return () => {
      clearInterval(syncInterval);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
    };
  }, [gameId, isHost, socket]);

  useEffect(() => {
      if (isHost) return;
      const handleSync = (data: any) => {
          if (data.gameId === gameId) setBallPositions(data.positions);
      };
      socket.on('pool_sync', handleSync);
      return () => { socket.off('pool_sync', handleSync); };
  }, [gameId, isHost, socket]);

  useEffect(() => {
      const handleShoot = (data: any) => {
          if (isHost && data.gameId === gameId) {
              const engine = engineRef.current;
              if (engine) {
                  const cue = engine.world.bodies.find(b => b.label === 'cue');
                  if (cue) {
                      Matter.Body.applyForce(cue, cue.position, data.force);
                  }
              }
          }
      };
      socket.on('pool_shoot', handleShoot);
      return () => { socket.off('pool_shoot', handleShoot); };
  }, [gameId, isHost, socket]);

  // Handle Power Bar
  const handlePowerStart = () => { if (turn === user.username) { setIsCharging(true); setPower(0); } };
  const handlePowerMove = (e: React.TouchEvent | React.MouseEvent) => {
      if (!isCharging || turn !== user.username) return;
      let clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      const bar = document.getElementById('power-bar');
      if (bar) {
          const rect = bar.getBoundingClientRect();
          setPower(Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)));
      }
  };
  const handlePowerEnd = () => {
      if (!isCharging || turn !== user.username) return;
      setIsCharging(false);
      shoot(power, aimAngle);
      setPower(0);
      // Switch turn locally for instant feedback
      if (opponentName !== 'Práctica') setTurn(turn === user.username ? opponentName : user.username);
  };

  const shoot = (p: number, angle: number) => {
      const forceMagnitude = Math.max(0.01, p * 1.8); // Adjust max power
      const force = { x: Math.cos(angle) * forceMagnitude, y: Math.sin(angle) * forceMagnitude };
      
      if (isHost) {
          const cue = engineRef.current?.world.bodies.find(b => b.label === 'cue');
          if (cue) {
              Matter.Body.applyForce(cue, cue.position, force);
          }
      } else {
          socket.emit('pool_shoot', { gameId, force });
      }
      if (opponentName !== 'Práctica') socket.emit('pool_turn_change', { gameId, nextTurn: turn === user.username ? opponentName : user.username });
  };

  useEffect(() => {
      const handleTurn = (data: any) => {
          if (data.gameId === gameId) setTurn(data.nextTurn);
      };
      socket.on('pool_turn_change', handleTurn);
      return () => { socket.off('pool_turn_change', handleTurn); }
  }, [gameId, socket]);

  // Aiming logic
  const handleTableMove = (e: React.MouseEvent | React.TouchEvent) => {
      if (turn !== user.username) return;
      const table = document.getElementById('pool-table');
      const cueBall = ballPositions.find(b => b.label === 'cue');
      if (table && cueBall) {
          const rect = table.getBoundingClientRect();
          const scaleX = TABLE_WIDTH / rect.width;
          const scaleY = TABLE_HEIGHT / rect.height;
          
          let clientX, clientY;
          if ('touches' in e) {
              clientX = e.touches[0].clientX;
              clientY = e.touches[0].clientY;
          } else {
              clientX = (e as React.MouseEvent).clientX;
              clientY = (e as React.MouseEvent).clientY;
          }
          
          const x = (clientX - rect.left) * scaleX;
          const y = (clientY - rect.top) * scaleY;
          
          const dx = cueBall.x - x; // Reverse so cue hits in direction of drag
          const dy = cueBall.y - y;
          setAimAngle(Math.atan2(dy, dx));
      }
  };

  const cueBall = ballPositions.find(b => b.label === 'cue');

  
  // 8-Ball Advanced Aiming Logic
  let ghostBall = null;
  let deflectionLine = null;
  
  if (turn === user.username && cueBall && !isCharging && power === 0) {
      const D = { x: Math.cos(aimAngle), y: Math.sin(aimAngle) };
      let closestT = Infinity;
      let targetBall = null;

      ballPositions.forEach(b => {
          if (b.label === 'cue') return;
          const V = { x: cueBall.x - b.x, y: cueBall.y - b.y };
          const b_coeff = 2 * ((D.x * V.x) + (D.y * V.y));
          const c_coeff = (V.x * V.x) + (V.y * V.y) - (4 * BALL_RADIUS * BALL_RADIUS);
          const disc = (b_coeff * b_coeff) - (4 * c_coeff);
          
          if (disc >= 0) {
              const t1 = (-b_coeff - Math.sqrt(disc)) / 2;
              const t2 = (-b_coeff + Math.sqrt(disc)) / 2;
              if (t1 > 0 && t1 < closestT) { closestT = t1; targetBall = b; }
              else if (t2 > 0 && t2 < closestT) { closestT = t2; targetBall = b; }
          }
      });

      // Check walls if no ball is hit, or if wall is closer
      let wallT = Infinity;
      // Right wall
      if (D.x > 0) wallT = Math.min(wallT, (TABLE_WIDTH - BALL_RADIUS - cueBall.x) / D.x);
      // Left wall
      if (D.x < 0) wallT = Math.min(wallT, (BALL_RADIUS - cueBall.x) / D.x);
      // Bottom wall
      if (D.y > 0) wallT = Math.min(wallT, (TABLE_HEIGHT - BALL_RADIUS - cueBall.y) / D.y);
      // Top wall
      if (D.y < 0) wallT = Math.min(wallT, (BALL_RADIUS - cueBall.y) / D.y);

      if (wallT < closestT) {
          closestT = wallT;
          targetBall = null;
      }

      if (closestT !== Infinity) {
          ghostBall = { x: cueBall.x + D.x * closestT, y: cueBall.y + D.y * closestT };
          
          if (targetBall) {
              const impactNormal = { x: targetBall.x - ghostBall.x, y: targetBall.y - ghostBall.y };
              const dist = Math.sqrt(impactNormal.x*impactNormal.x + impactNormal.y*impactNormal.y);
              impactNormal.x /= dist; impactNormal.y /= dist;
              
              // Target ball path (line passing through target ball center and ghost ball center)
              deflectionLine = {
                  x1: ghostBall.x, y1: ghostBall.y,
                  x2: ghostBall.x + impactNormal.x * 60, y2: ghostBall.y + impactNormal.y * 60
              };
          }
      }
  }

  return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-8 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0f111a] border border-[#2e7d32]/30 rounded-3xl w-full h-full md:max-h-[90vh] md:max-w-5xl flex flex-col overflow-hidden shadow-[0_0_50px_rgba(46,125,50,0.2)]">
        {/* Header */}
        <div className="p-4 border-b border-[#2e7d32]/20 flex items-center justify-between bg-gradient-to-r from-[#0a0f1c] to-[#121B2A]">
          <h2 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
            🎱 Billar
          </h2>
          <button onClick={onClose} className="p-2 text-red-400 hover:bg-red-500/20 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="p-2 md:p-4 flex flex-col gap-2 md:gap-4 flex-1 min-h-0 overflow-hidden bg-[#050B14]">
            
            {/* Player HUD */}
            <div className="flex justify-between items-center px-4 py-2 bg-[#0A101D] rounded-2xl border border-white/5 shadow-lg">
                {/* Me */}
                <div className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${turn === user.username ? 'bg-blue-900/40 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'opacity-50'}`}>
                    <img src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed='+user.username} className="w-10 h-10 rounded-full border-2 border-blue-400" />
                    <div>
                        <div className="font-bold text-white text-sm">{user.username}</div>
                        <div className="text-blue-400 text-xs flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div> Tu turno</div>
                    </div>
                </div>

                <div className="text-2xl font-black text-white/20 italic">VS</div>

                {/* Opponent */}
                <div className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${turn === opponentName ? 'bg-red-900/40 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'opacity-50'}`}>
                    <div className="text-right">
                        <div className="font-bold text-white text-sm">{opponentName}</div>
                        <div className="text-red-400 text-xs flex items-center justify-end gap-1">Su turno <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div></div>
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-red-400 bg-gray-800 flex items-center justify-center text-xs">Rival</div>
                </div>
            </div>

            
            {/* HUD / Ball Tracker */}
            <div className="flex justify-between px-4">
                <div className="flex gap-1">
                    {[1,2,3,4,5,6,7].map(i => {
                        const isPocketed = !ballPositions.some(b => b.label === `ball_${i}`);
                        return <div key={i} className={`w-4 h-4 rounded-full border border-white/20 ${isPocketed ? 'opacity-20 bg-gray-600' : 'bg-blue-500'}`}></div>;
                    })}
                </div>
                <div className="flex gap-1">
                    {[9,10,11,12,13,14,15].map(i => {
                        const isPocketed = !ballPositions.some(b => b.label === `ball_${i}`);
                        return <div key={i} className={`w-4 h-4 rounded-full border border-white/20 flex flex-col items-center justify-center ${isPocketed ? 'opacity-20 bg-gray-600' : 'bg-white'}`}>
                            <div className="w-full h-[50%] bg-red-500"></div>
                        </div>;
                    })}
                </div>
            </div>
            
            {/* Game Area */}
            <div className="flex flex-1 gap-2 md:gap-6 items-stretch justify-center h-full min-h-0 w-full overflow-hidden">
                
                {/* Table */}
                <div 
                    id="pool-table"
                    className="relative border-[12px] md:border-[20px] rounded-[2rem] shadow-2xl overflow-hidden" 
                    style={{ 
                        height: '100%', aspectRatio: '1/2', maxHeight: '80vh',
                        borderColor: '#2D1B11', // Dark wood border
                        backgroundColor: '#0A3B1C', // Deep Professional green cloth
                        backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.4) 100%), url("https://www.transparenttextures.com/patterns/felt.png")'
                    }}
                    onMouseMove={handleTableMove}
                    onTouchMove={handleTableMove}
                    onMouseDown={handleTableMove}
                >
                    {/* Inner rubber rails */}
                    <div className="absolute inset-0 border-[6px] border-[#154a27] rounded-[1.2rem] opacity-80 pointer-events-none z-0"></div>

                    {/* Render table relative to 400x800 internally via percentages */}
                    {/* Pockets */}
                    {[
                        { x: 0, y: 0 }, { x: TABLE_WIDTH, y: 0 },
                        { x: 0, y: TABLE_HEIGHT / 2 }, { x: TABLE_WIDTH, y: TABLE_HEIGHT / 2 },
                        { x: 0, y: TABLE_HEIGHT }, { x: TABLE_WIDTH, y: TABLE_HEIGHT }
                    ].map((p, i) => (
                        <div key={i} className="absolute bg-[#0a0a0a] rounded-full shadow-[inset_0_5px_10px_rgba(0,0,0,0.9),0_1px_2px_rgba(255,255,255,0.1)] z-0" 
                              style={{ 
                                  width: (HOLE_RADIUS*2/TABLE_WIDTH)*100+'%', 
                                  height: (HOLE_RADIUS*2/TABLE_HEIGHT)*100+'%',
                                  left: ((p.x - HOLE_RADIUS)/TABLE_WIDTH)*100+'%',
                                  top: ((p.y - HOLE_RADIUS)/TABLE_HEIGHT)*100+'%'
                              }} />
                    ))}
                    
                    {/* Balls */}
                    {ballPositions.map((b, i) => {
                        const isCue = b.label === 'cue';
                        const color = isCue ? '#ffffff' : b.color;
                        const isStripe = !isCue && i > 8; // Simplified logic just for visuals
                        
                        return (
                            <div key={b.id} className="absolute rounded-full z-10 pointer-events-none flex items-center justify-center overflow-hidden transition-all duration-[30ms] ease-linear" 
                                  style={{ 
                                      width: (BALL_RADIUS*2/TABLE_WIDTH)*100+'%', 
                                      height: (BALL_RADIUS*2/TABLE_HEIGHT)*100+'%',
                                      left: ((b.x - BALL_RADIUS)/TABLE_WIDTH)*100+'%',
                                      top: ((b.y - BALL_RADIUS)/TABLE_HEIGHT)*100+'%',
                                      backgroundColor: isCue ? '#ffffff' : (isStripe ? '#ffffff' : color),
                                      boxShadow: '2px 4px 6px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(0,0,0,0.5), inset 1px 1px 3px rgba(255,255,255,0.8)'
                                  }}>
                                  
                                  <div className="absolute inset-0 w-full h-full flex items-center justify-center" style={{ transform: `rotate(${b.angle}rad)` }}>
                                  {/* Stripe overlay */}
                                  {!isCue && isStripe && (
                                      <div className="absolute w-full h-[50%] top-[25%]" style={{ backgroundColor: color }}></div>
                                  )}

                                  {/* Number circle */}
                                  {!isCue && (
                                      <div className="w-[50%] h-[50%] bg-white rounded-full flex items-center justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] z-10">
                                          <span className="text-[6px] md:text-[8px] font-black text-black leading-none" style={{transform: 'scale(0.8)'}}>{i}</span>
                                      </div>
                                  )}
                                  </div>

                                  {/* Specular Highlight Overlay (Glass reflection) */}
                                  <div className="absolute w-[40%] h-[40%] top-[15%] left-[20%] rounded-full bg-gradient-to-br from-white/80 to-transparent z-20"></div>
                            </div>
                        );
                    })}

                    {/* Aim Line (8-Ball Pool Style) */}
                    {turn === user.username && cueBall && ghostBall && (
                        <>
                            {/* Main Trajectory */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ overflow: 'visible' }}>
                                <line 
                                    x1={(cueBall.x / TABLE_WIDTH) * 100 + '%'} 
                                    y1={(cueBall.y / TABLE_HEIGHT) * 100 + '%'} 
                                    x2={(ghostBall.x / TABLE_WIDTH) * 100 + '%'} 
                                    y2={(ghostBall.y / TABLE_HEIGHT) * 100 + '%'} 
                                    stroke="rgba(255, 255, 255, 0.7)" 
                                    strokeWidth="1.5" 
                                    strokeDasharray="4 2"
                                />
                                {/* Ghost Ball Circle */}
                                <circle 
                                    cx={(ghostBall.x / TABLE_WIDTH) * 100 + '%'} 
                                    cy={(ghostBall.y / TABLE_HEIGHT) * 100 + '%'} 
                                    r={(BALL_RADIUS / TABLE_WIDTH) * 100 + '%'} 
                                    fill="none" 
                                    stroke="rgba(255, 255, 255, 0.8)" 
                                    strokeWidth="1" 
                                />
                                {/* Deflection Line */}
                                {deflectionLine && (
                                    <line 
                                        x1={(deflectionLine.x1 / TABLE_WIDTH) * 100 + '%'} 
                                        y1={(deflectionLine.y1 / TABLE_HEIGHT) * 100 + '%'} 
                                        x2={(deflectionLine.x2 / TABLE_WIDTH) * 100 + '%'} 
                                        y2={(deflectionLine.y2 / TABLE_HEIGHT) * 100 + '%'} 
                                        stroke="rgba(255, 255, 255, 0.9)" 
                                        strokeWidth="2" 
                                    />
                                )}
                            </svg>
                        </>
                    )}

                    {/* Cue Stick */}
                    {turn === user.username && cueBall && (
                        <div className="absolute z-30 pointer-events-none"
                             style={{
                                 left: (cueBall.x / TABLE_WIDTH) * 100 + '%',
                                 top: (cueBall.y / TABLE_HEIGHT) * 100 + '%',
                                 width: '80%', // Longer cue
                                 height: '10px',
                                 background: 'linear-gradient(to right, #000 0%, #111 2%, #d4b895 5%, #8b5a2b 40%, #3e2723 80%, #1a100c 95%, #fff 100%)',
                                 boxShadow: '0px 20px 20px rgba(0,0,0,0.5), inset 0px 3px 3px rgba(255,255,255,0.3)',
                                 transformOrigin: '0% 50%',
                                 transform: `rotate(${aimAngle + Math.PI}rad) translateX(${(BALL_RADIUS/TABLE_WIDTH)*100 + (power * 30) + 2}%)`,
                                 borderRadius: '5px'
                             }}
                        >
                            {/* Blue tip */}
                            <div className="absolute left-0 top-0 bottom-0 w-[2%] bg-blue-500 rounded-l-[5px]"></div>
                        </div>
                    )}
                </div>

                {/* Power Bar (8-Ball Style) */}
                <div className="w-14 md:w-20 h-full max-h-[80vh] bg-[#111] border-[4px] border-[#222] rounded-2xl relative flex flex-col justify-end overflow-hidden cursor-pointer touch-none shadow-[0_0_30px_rgba(0,0,0,0.8)] shrink-0"
                     id="power-bar"
                     onMouseDown={handlePowerStart}
                     onMouseMove={handlePowerMove}
                     onMouseUp={handlePowerEnd}
                     onMouseLeave={handlePowerEnd}
                     onTouchStart={handlePowerStart}
                     onTouchMove={handlePowerMove}
                     onTouchEnd={handlePowerEnd}
                >
                    {/* Power scale markers */}
                    <div className="absolute inset-0 flex flex-col justify-between py-4 z-0 opacity-20 pointer-events-none">
                        {[1,2,3,4,5,6,7,8,9,10].map(i => <div key={i} className="w-full h-px bg-white"></div>)}
                    </div>

                    <div className="w-full bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 pointer-events-none transition-all duration-75 relative z-10" 
                         style={{ height: `${power * 100}%` }}>
                         <div className="absolute top-0 w-full h-2 bg-white shadow-[0_0_15px_white]"></div>
                    </div>

                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white/50 pointer-events-none uppercase tracking-widest">
                        Tirar
                    </div>
                </div>
            </div></div>
      </div>
    </div>
  );
}
