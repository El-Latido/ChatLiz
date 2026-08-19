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
  const [ballPositions, setBallPositions] = useState<{ id: number; x: number; y: number; color: string; label: string; angle?: number }[]>([]);

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
            label: b.label,
            angle: b.angle
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0f18] text-white font-sans">
      <div className="relative w-full h-full md:max-w-[500px] md:h-[95vh] bg-[#1a2235] flex flex-col md:rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10">
        
        {/* HEADER / HUD */}
        <div className="flex-none flex flex-col p-4 z-20 bg-gradient-to-b from-[#111824] to-transparent">
            <div className="flex justify-between items-center mb-4">
                <div className="bg-[#2a2d36]/80 px-4 py-1 rounded-full border border-white/5 mx-auto shadow-lg">
                    <span className="text-gray-300 font-bold text-sm tracking-wider">8 BALL POOL</span>
                </div>
                <button onClick={onClose} className="absolute right-4 p-2 bg-black/50 text-white rounded-full hover:bg-white/20">
                    <X size={18} />
                </button>
            </div>
            
            <div className="flex justify-between items-start w-full">
                {/* P1 */}
                <div className={`flex items-start gap-3 transition-opacity ${turn === user.username ? 'opacity-100' : 'opacity-50'}`}>
                    <img src={user.profilePic || 'https://api.dicebear.com/7.x/avataaars/svg?seed='+user.username} className="w-12 h-12 rounded-xl object-cover border-2 border-blue-500 bg-gray-800" />
                    <div className="flex flex-col">
                        <span className="font-bold text-sm leading-tight">Player 1</span>
                        <span className="text-gray-400 text-xs mb-1">(You)</span>
                        <div className="flex gap-1">
                            {[1,2,3,4,5,6,7].map(i => {
                                const isPocketed = !ballPositions.some(b => b.label === `ball_${i}`);
                                const colors = ['#f4c20d', '#1e88e5', '#d32f2f', '#4a148c', '#ff5722', '#00796b', '#880e4f'];
                                return (
                                    <div key={i} className="relative w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-inner" style={{ backgroundColor: colors[i-1] }}>
                                        <div className="w-[45%] h-[45%] bg-white rounded-full"></div>
                                        {isPocketed && <div className="absolute inset-0 bg-black/80 rounded-full flex items-center justify-center"><X size={10} className="text-red-500"/></div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                {/* P2 */}
                <div className={`flex items-start gap-3 flex-row-reverse transition-opacity ${turn === opponentName ? 'opacity-100' : 'opacity-50'}`}>
                    <div className="w-12 h-12 rounded-xl bg-gray-800 border-2 border-red-500 overflow-hidden flex items-center justify-center">
                        <img src={'https://api.dicebear.com/7.x/avataaars/svg?seed='+opponentName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="font-bold text-sm leading-tight">Player 2</span>
                        <span className="text-gray-400 text-xs mb-1">(Rival)</span>
                        <div className="flex gap-1">
                            {[9,10,11,12,13,14,15].map(i => {
                                const isPocketed = !ballPositions.some(b => b.label === `ball_${i}`);
                                const colors = ['#f4c20d', '#1e88e5', '#d32f2f', '#4a148c', '#ff5722', '#00796b', '#880e4f'];
                                return (
                                    <div key={i} className="relative w-3.5 h-3.5 rounded-full flex items-center justify-center bg-white shadow-inner overflow-hidden">
                                        <div className="w-full h-[40%] flex items-center justify-center" style={{ backgroundColor: colors[i-9] }}>
                                            <div className="w-[50%] h-[120%] bg-white rounded-full"></div>
                                        </div>
                                        {isPocketed && <div className="absolute inset-0 bg-black/80 rounded-full flex items-center justify-center"><X size={10} className="text-red-500"/></div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* GAME AREA */}
        <div className="flex-1 w-full flex flex-row items-center justify-center gap-4 p-4 pb-8 overflow-hidden z-10">
            
            {/* TABLE WRAPPER */}
            <div className="relative shrink-0" style={{ height: '95%', aspectRatio: '1/2' }}>
                
                {/* TABLE CUSHIONS AND WOODEN RAILS */}
                <div className="absolute -inset-6 md:-inset-8 bg-[#3E2723] rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,1)] border-y-[16px] border-x-[16px] border-[#2d1b15] pointer-events-none z-0">
                    <div className="absolute inset-0 rounded-xl shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] border border-[#5d4037]/40"></div>
                    
                    {/* Pockets (Visual) */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-black rounded-full shadow-[inset_0_5px_10px_rgba(0,0,0,1)]"></div>
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-black rounded-full shadow-[inset_0_5px_10px_rgba(0,0,0,1)]"></div>
                    <div className="absolute top-1/2 -left-5 w-10 h-12 bg-black rounded-[2rem] shadow-[inset_0_5px_10px_rgba(0,0,0,1)] -translate-y-1/2"></div>
                    <div className="absolute top-1/2 -right-5 w-10 h-12 bg-black rounded-[2rem] shadow-[inset_0_5px_10px_rgba(0,0,0,1)] -translate-y-1/2"></div>
                    <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-black rounded-full shadow-[inset_0_5px_10px_rgba(0,0,0,1)]"></div>
                    <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-black rounded-full shadow-[inset_0_5px_10px_rgba(0,0,0,1)]"></div>
                </div>

                {/* GREEN CLOTH */}
                <div className="absolute inset-0 bg-[#0c593b] rounded-xl pointer-events-none z-0 overflow-hidden">
                    {/* Cloth Texture / Shadow */}
                    <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] opacity-90 mix-blend-multiply"></div>
                    
                    {/* Table Lines / Dots */}
                    <div className="absolute top-[25%] left-0 w-full h-[2px] bg-white/10"></div>
                    <div className="absolute top-[75%] left-0 w-full h-[2px] bg-white/10"></div>
                    <div className="absolute top-[75%] left-[50%] w-2 h-2 rounded-full bg-white/30 -translate-x-1/2 -translate-y-1/2"></div>
                </div>

                {/* PLAYABLE HITBOX (Exactly the green cloth dimensions) */}
                <div 
                    id="pool-table"
                    className="absolute inset-0 z-20"
                    onMouseMove={handleTableMove}
                    onTouchMove={handleTableMove}
                    onMouseDown={handleTableMove}
                >
                    {/* BALLS */}
                    {ballPositions.map((b, i) => {
                        const isCue = b.label === 'cue';
                        const color = isCue ? '#ffffff' : b.color;
                        const num = isCue ? 0 : parseInt(b.label.split('_')[1]);
                        const isStripe = num > 8; 
                        
                        return (
                            <div key={b.id} className="absolute rounded-full z-30 pointer-events-none flex items-center justify-center overflow-hidden transition-all duration-[30ms] ease-linear" 
                                    style={{ 
                                        width: (BALL_RADIUS*2/TABLE_WIDTH)*100+'%', 
                                        height: (BALL_RADIUS*2/TABLE_HEIGHT)*100+'%',
                                        left: ((b.x - BALL_RADIUS)/TABLE_WIDTH)*100+'%',
                                        top: ((b.y - BALL_RADIUS)/TABLE_HEIGHT)*100+'%',
                                        backgroundColor: isCue ? '#ffffff' : (isStripe ? '#ffffff' : color),
                                        boxShadow: '2px 4px 6px rgba(0,0,0,0.6), inset -2px -2px 4px rgba(0,0,0,0.7), inset 1px 1px 3px rgba(255,255,255,0.8)'
                                    }}>
                                    
                                    <div className="absolute inset-0 w-full h-full flex items-center justify-center" style={{ transform: `rotate(${b.angle}rad)` }}>
                                        {!isCue && isStripe && (
                                            <div className="absolute w-full h-[45%] top-[27.5%]" style={{ backgroundColor: color }}></div>
                                        )}
                                        {!isCue && (
                                            <div className="w-[45%] h-[45%] bg-white rounded-full flex items-center justify-center shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] z-10">
                                                <span className="text-[7px] md:text-[9px] font-black text-black leading-none">{num}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute w-[40%] h-[40%] top-[10%] left-[15%] rounded-full bg-gradient-to-br from-white/90 to-transparent z-40"></div>
                            </div>
                        );
                    })}

                    {/* AIM LINE */}
                    {turn === user.username && cueBall && ghostBall && (
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" style={{ overflow: 'visible' }}>
                            <line 
                                x1={(cueBall.x / TABLE_WIDTH) * 100 + '%'} 
                                y1={(cueBall.y / TABLE_HEIGHT) * 100 + '%'} 
                                x2={(ghostBall.x / TABLE_WIDTH) * 100 + '%'} 
                                y2={(ghostBall.y / TABLE_HEIGHT) * 100 + '%'} 
                                stroke="rgba(255, 255, 255, 0.9)" 
                                strokeWidth="2.5" 
                                strokeDasharray="4 2"
                            />
                            <circle 
                                cx={(ghostBall.x / TABLE_WIDTH) * 100 + '%'} 
                                cy={(ghostBall.y / TABLE_HEIGHT) * 100 + '%'} 
                                r={(BALL_RADIUS / TABLE_WIDTH) * 100 + '%'} 
                                fill="none" 
                                stroke="rgba(255, 255, 255, 0.9)" 
                                strokeWidth="1.5" 
                            />
                            {deflectionLine && (
                                <line 
                                    x1={(deflectionLine.x1 / TABLE_WIDTH) * 100 + '%'} 
                                    y1={(deflectionLine.y1 / TABLE_HEIGHT) * 100 + '%'} 
                                    x2={(deflectionLine.x2 / TABLE_WIDTH) * 100 + '%'} 
                                    y2={(deflectionLine.y2 / TABLE_HEIGHT) * 100 + '%'} 
                                    stroke="rgba(255, 255, 255, 0.9)" 
                                    strokeWidth="2.5" 
                                />
                            )}
                        </svg>
                    )}

                    {/* CUE STICK */}
                    {turn === user.username && cueBall && (
                        <div className="absolute z-50 pointer-events-none"
                                style={{
                                    left: (cueBall.x / TABLE_WIDTH) * 100 + '%',
                                    top: (cueBall.y / TABLE_HEIGHT) * 100 + '%',
                                    width: '120%', 
                                    height: '16px',
                                    background: 'linear-gradient(to right, #000 0%, #111 2%, #D4A373 5%, #8B5A2B 40%, #5C4033 80%, #222 95%, #fff 100%)',
                                    boxShadow: '0px 25px 35px rgba(0,0,0,0.8), inset 0px 4px 4px rgba(255,255,255,0.4)',
                                    transformOrigin: '0% 50%',
                                    transform: `rotate(${aimAngle + Math.PI}rad) translateX(${(BALL_RADIUS/TABLE_WIDTH)*100 + (power * 35) + 2}%)`,
                                    borderRadius: '8px'
                                }}
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-[2%] bg-blue-500 rounded-l-[8px] border-r border-white/50"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* POWER BAR */}
            <div className="relative w-12 md:w-16 h-[85%] shrink-0 rounded-[2rem] p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.9),inset_0_0_10px_rgba(255,255,255,0.1)] border border-[#444] bg-[#1a1c23] z-20"
                 id="power-bar"
                 onMouseDown={handlePowerStart}
                 onMouseMove={handlePowerMove}
                 onMouseUp={handlePowerEnd}
                 onMouseLeave={handlePowerEnd}
                 onTouchStart={handlePowerStart}
                 onTouchMove={handlePowerMove}
                 onTouchEnd={handlePowerEnd}
            >
                <div className="absolute inset-2 rounded-[1.5rem] bg-gradient-to-b from-[#2ecc71] via-[#f1c40f] to-[#e74c3c] shadow-[inset_0_5px_15px_rgba(0,0,0,0.8)] overflow-hidden">
                    <div className="absolute inset-0 bg-black/60 pointer-events-none transition-opacity" style={{ opacity: 0.8 - power }}></div>
                </div>
                
                <div className="absolute left-1/2 -translate-x-1/2 w-[140%] h-6 bg-gradient-to-b from-gray-200 to-gray-500 rounded shadow-lg border border-gray-400 z-10 pointer-events-none flex items-center justify-center cursor-pointer"
                        style={{ 
                            top: `${Math.max(0, Math.min(100, (1 - power) * 100))}%`,
                            transform: 'translateY(-50%)',
                            transition: isCharging ? 'none' : 'top 0.3s ease-out'
                        }}>
                    <div className="w-[80%] h-1 bg-gray-600/50 rounded-full shadow-inner"></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}