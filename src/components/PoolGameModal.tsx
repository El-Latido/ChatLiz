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

        <div className="p-4 flex flex-col items-center gap-4 flex-1 min-h-0 overflow-hidden">
            {/* Status */}
            <div className="text-[#E8D9B0] text-lg">
                Turno de: <span className="font-bold text-green-400">{turn}</span>
            </div>

            <div className="flex flex-1 gap-4 items-stretch justify-center h-full min-h-0 w-full overflow-hidden">
                {/* Table */}
                <div 
                    id="pool-table"
                    className="relative border-[10px] md:border-[15px] border-[#3E2723] rounded-[1.5rem] shadow-2xl bg-[#0a4220] overflow-hidden" 
                    style={{ height: '100%', aspectRatio: '1/2', maxHeight: '80vh' }}
                    onMouseMove={handleTableMove}
                    onTouchMove={handleTableMove}
                    onMouseDown={handleTableMove}
                >
                    {/* Render table relative to 400x800 internally via percentages */}
                    {/* Pockets */}
                    {[
                        { x: 0, y: 0 }, { x: TABLE_WIDTH, y: 0 },
                        { x: 0, y: TABLE_HEIGHT / 2 }, { x: TABLE_WIDTH, y: TABLE_HEIGHT / 2 },
                        { x: 0, y: TABLE_HEIGHT }, { x: TABLE_WIDTH, y: TABLE_HEIGHT }
                    ].map((p, i) => (
                        <div key={i} className="absolute bg-black rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] z-0" 
                              style={{ 
                                  width: (HOLE_RADIUS*2/TABLE_WIDTH)*100+'%', 
                                  height: (HOLE_RADIUS*2/TABLE_HEIGHT)*100+'%',
                                  left: ((p.x - HOLE_RADIUS)/TABLE_WIDTH)*100+'%',
                                  top: ((p.y - HOLE_RADIUS)/TABLE_HEIGHT)*100+'%'
                              }} />
                    ))}
                    
                    {/* Balls */}
                    {ballPositions.map(b => {
                        const isCue = b.label === 'cue';
                        const color = isCue ? '#ffffff' : b.color;
                        return (
                            <div key={b.id} className="absolute rounded-full z-10 pointer-events-none" 
                                  style={{ 
                                      width: (BALL_RADIUS*2/TABLE_WIDTH)*100+'%', 
                                      height: (BALL_RADIUS*2/TABLE_HEIGHT)*100+'%',
                                      left: ((b.x - BALL_RADIUS)/TABLE_WIDTH)*100+'%',
                                      top: ((b.y - BALL_RADIUS)/TABLE_HEIGHT)*100+'%',
                                      background: `radial-gradient(circle at 35% 35%, ${isCue ? '#ffffff' : 'rgba(255,255,255,0.7)'} 0%, ${color} 30%, #111 110%)`,
                                      boxShadow: '3px 5px 6px rgba(0,0,0,0.5), inset -2px -2px 5px rgba(0,0,0,0.4)'
                                  }} />
                        );
                    })}

                    {/* Cue Stick */}
                    {turn === user.username && cueBall && (
                        <div className="absolute z-20 pointer-events-none"
                             style={{
                                 left: (cueBall.x / TABLE_WIDTH) * 100 + '%',
                                 top: (cueBall.y / TABLE_HEIGHT) * 100 + '%',
                                 width: '60%',
                                 height: '8px',
                                 background: 'linear-gradient(to right, #1a0b00 0%, #3e1f00 5%, #8b4513 20%, #d2b48c 80%, #f4f4f4 95%, #444 100%)',
                                 boxShadow: '0px 15px 15px rgba(0,0,0,0.6), inset 0px 2px 2px rgba(255,255,255,0.2)',
                                 transformOrigin: '0% 50%',
                                 transform: `rotate(${aimAngle + Math.PI}rad) translateX(${(BALL_RADIUS/TABLE_WIDTH)*100 + (power * 15) + 2}%)`,
                                 borderRadius: '4px'
                             }}
                        />
                    )}

                    {/* Aim Line */}
                    {turn === user.username && cueBall && (
                        <div className="absolute pointer-events-none z-20"
                             style={{
                                 left: (cueBall.x / TABLE_WIDTH) * 100 + '%',
                                 top: (cueBall.y / TABLE_HEIGHT) * 100 + '%',
                                 width: '15%', // Short line
                                 height: '2px',
                                 backgroundColor: 'rgba(255, 255, 255, 0.4)',
                                 transformOrigin: '0% 50%',
                                 transform: `rotate(${aimAngle}rad)`
                             }}
                        />
                    )}
                </div>

                {/* Power Bar */}
                <div className="w-12 md:w-16 h-full max-h-[80vh] bg-[#0a0f1c] border-[3px] border-green-500/30 rounded-xl relative flex flex-col justify-end overflow-hidden cursor-pointer touch-none shadow-xl shrink-0"
                     id="power-bar"
                     onMouseDown={handlePowerStart}
                     onMouseMove={handlePowerMove}
                     onMouseUp={handlePowerEnd}
                     onMouseLeave={handlePowerEnd}
                     onTouchStart={handlePowerStart}
                     onTouchMove={handlePowerMove}
                     onTouchEnd={handlePowerEnd}
                >
                    <div className="w-full bg-gradient-to-t from-green-600 via-emerald-400 to-yellow-300 pointer-events-none transition-all duration-75 relative" 
                         style={{ height: `${power * 100}%` }}>
                         <div className="absolute top-0 w-full h-1 bg-white/80 shadow-[0_0_8px_white]"></div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
