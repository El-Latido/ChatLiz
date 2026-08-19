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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      
      {/* 
        IMAGE-AS-REFERENCE CONTAINER 
        Adjust max-width or aspect ratio to match your uploaded image precisely.
      */}
      <div 
        className="relative w-full h-full md:h-[90vh] md:w-auto md:aspect-[9/16] bg-cover bg-center bg-no-repeat overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] md:rounded-[3rem]"
        style={{ backgroundImage: 'url("/pool-bg.jpg")' }} // The user must upload pool-bg.jpg to the public/ folder
      >
        
        {/* CLOSE BUTTON */}
        <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white rounded-full hover:bg-white/20">
            <X size={24} />
        </button>

        {/* --- HUD OVERLAYS (Hitboxes for crossing out pocketed balls) --- */}
        
        {/* Player 1 Balls Status Overlay */}
        <div className="absolute top-[10.5%] left-[10%] w-[32%] h-[2.5%] flex items-center justify-between z-20">
            {[1,2,3,4,5,6,7].map(i => {
                const isPocketed = !ballPositions.some(b => b.label === `ball_${i}`);
                return (
                    <div key={i} className="h-full aspect-square flex items-center justify-center">
                        {isPocketed && (
                            // Black cross or dark overlay for pocketed balls
                            <div className="w-[120%] h-[120%] bg-black/70 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <X size={12} className="text-red-500 opacity-80" />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>

        {/* Player 2 Balls Status Overlay */}
        <div className="absolute top-[10.5%] right-[10%] w-[32%] h-[2.5%] flex items-center justify-between flex-row-reverse z-20">
            {[9,10,11,12,13,14,15].map(i => {
                const isPocketed = !ballPositions.some(b => b.label === `ball_${i}`);
                return (
                    <div key={i} className="h-full aspect-square flex items-center justify-center">
                        {isPocketed && (
                            <div className="w-[120%] h-[120%] bg-black/70 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <X size={12} className="text-red-500 opacity-80" />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>


        {/* --- TABLE HITBOX --- */}
        {/* Adjust top, left, width, and height to perfectly align with the green cloth in your image */}
        <div 
            id="pool-table"
            className="absolute z-10"
            style={{
                top: '18.5%',      // Adjust this to match the top edge of the green cloth
                left: '11%',       // Adjust this to match the left edge of the green cloth
                width: '78%',      // Adjust this to span from left edge to right edge
                aspectRatio: '1/2' // Standard pool table ratio
            }}
            onMouseMove={handleTableMove}
            onTouchMove={handleTableMove}
            onMouseDown={handleTableMove}
        >
            {/* We NO LONGER draw the table styling, borders, or pockets. 
                Everything is on the background image. We ONLY draw dynamic elements. */}

            {/* BALLS */}
            {ballPositions.map((b, i) => {
                const isCue = b.label === 'cue';
                const color = isCue ? '#ffffff' : b.color;
                const num = isCue ? 0 : parseInt(b.label.split('_')[1]);
                const isStripe = num > 8; 
                
                return (
                    <div key={b.id} className="absolute rounded-full z-10 pointer-events-none flex items-center justify-center overflow-hidden transition-all duration-[30ms] ease-linear" 
                            style={{ 
                                width: (BALL_RADIUS*2/TABLE_WIDTH)*100+'%', 
                                height: (BALL_RADIUS*2/TABLE_HEIGHT)*100+'%',
                                left: ((b.x - BALL_RADIUS)/TABLE_WIDTH)*100+'%',
                                top: ((b.y - BALL_RADIUS)/TABLE_HEIGHT)*100+'%',
                                backgroundColor: isCue ? '#ffffff' : (isStripe ? '#ffffff' : color),
                                // Simplified shadow since the image has its own lighting, just enough to pop
                                boxShadow: '2px 4px 6px rgba(0,0,0,0.5), inset -2px -2px 4px rgba(0,0,0,0.6)'
                            }}>
                            
                            {/* Rotation wrapper */}
                            <div className="absolute inset-0 w-full h-full flex items-center justify-center" style={{ transform: `rotate(${b.angle}rad)` }}>
                                {/* Stripe overlay */}
                                {!isCue && isStripe && (
                                    <div className="absolute w-full h-[45%] top-[27.5%]" style={{ backgroundColor: color }}></div>
                                )}
                                {/* Number circle */}
                                {!isCue && (
                                    <div className="w-[45%] h-[45%] bg-white rounded-full flex items-center justify-center shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] z-10">
                                        <span className="text-[7px] md:text-[9px] font-black text-black leading-none">{num}</span>
                                    </div>
                                )}
                            </div>

                            {/* Specular Highlight */}
                            <div className="absolute w-[40%] h-[40%] top-[10%] left-[15%] rounded-full bg-gradient-to-br from-white/80 to-transparent z-20"></div>
                    </div>
                );
            })}

            {/* AIM LINE */}
            {turn === user.username && cueBall && ghostBall && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ overflow: 'visible' }}>
                    <line 
                        x1={(cueBall.x / TABLE_WIDTH) * 100 + '%'} 
                        y1={(cueBall.y / TABLE_HEIGHT) * 100 + '%'} 
                        x2={(ghostBall.x / TABLE_WIDTH) * 100 + '%'} 
                        y2={(ghostBall.y / TABLE_HEIGHT) * 100 + '%'} 
                        stroke="rgba(255, 255, 255, 0.85)" 
                        strokeWidth="2" 
                    />
                    {/* Ghost Ball */}
                    <circle 
                        cx={(ghostBall.x / TABLE_WIDTH) * 100 + '%'} 
                        cy={(ghostBall.y / TABLE_HEIGHT) * 100 + '%'} 
                        r={(BALL_RADIUS / TABLE_WIDTH) * 100 + '%'} 
                        fill="none" 
                        stroke="rgba(255, 255, 255, 0.9)" 
                        strokeWidth="1.5" 
                    />
                    {/* Deflection */}
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
            )}

            {/* CUE STICK */}
            {turn === user.username && cueBall && (
                <div className="absolute z-30 pointer-events-none"
                        style={{
                            left: (cueBall.x / TABLE_WIDTH) * 100 + '%',
                            top: (cueBall.y / TABLE_HEIGHT) * 100 + '%',
                            width: '100%', 
                            height: '14px',
                            background: 'linear-gradient(to right, #000 0%, #111 2%, #D4A373 5%, #8B5A2B 40%, #5C4033 80%, #222 95%, #fff 100%)',
                            boxShadow: '0px 20px 30px rgba(0,0,0,0.7)',
                            transformOrigin: '0% 50%',
                            transform: `rotate(${aimAngle + Math.PI}rad) translateX(${(BALL_RADIUS/TABLE_WIDTH)*100 + (power * 35) + 2}%)`,
                            borderRadius: '7px'
                        }}
                >
                    {/* Blue tip */}
                    <div className="absolute left-0 top-0 bottom-0 w-[2%] bg-blue-500 rounded-l-[7px] border-r border-white/50"></div>
                </div>
            )}
        </div>

        {/* --- POWER BAR HITBOX --- */}
        {/* Adjust to match the power bar slider in your image */}
        <div className="absolute z-20 cursor-pointer touch-none"
             style={{
                 top: '35%',
                 right: '3%',
                 width: '8%',
                 height: '30%',
                 // backgroundColor: 'rgba(255,0,0,0.2)' // Uncomment to debug hitbox positioning
             }}
             id="power-bar"
             onMouseDown={handlePowerStart}
             onMouseMove={handlePowerMove}
             onMouseUp={handlePowerEnd}
             onMouseLeave={handlePowerEnd}
             onTouchStart={handlePowerStart}
             onTouchMove={handlePowerMove}
             onTouchEnd={handlePowerEnd}
        >
            {/* The Draggable Thumb (Matches exactly where power is) */}
            <div className="absolute left-1/2 -translate-x-1/2 w-[120%] h-6 bg-gradient-to-b from-gray-200 to-gray-400 rounded shadow-lg border border-white z-10 pointer-events-none flex items-center justify-center"
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
  );
}