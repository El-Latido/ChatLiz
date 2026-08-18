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

const TABLE_WIDTH = 800;
const TABLE_HEIGHT = 400;
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
      setTurn(turn === user.username ? opponentName : user.username);
  };

  const shoot = (p: number, angle: number) => {
      const forceMagnitude = Math.max(0.01, p * 1.2); // Adjust max power
      const force = { x: Math.cos(angle) * forceMagnitude, y: Math.sin(angle) * forceMagnitude };
      
      if (isHost) {
          const cue = engineRef.current?.world.bodies.find(b => b.label === 'cue');
          if (cue) {
              Matter.Body.applyForce(cue, cue.position, force);
          }
      } else {
          socket.emit('pool_shoot', { gameId, force });
      }
      socket.emit('pool_turn_change', { gameId, nextTurn: turn === user.username ? opponentName : user.username });
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
      <div className="bg-[#0f111a] border border-[#2e7d32]/30 rounded-3xl w-full max-w-5xl flex flex-col overflow-hidden shadow-[0_0_50px_rgba(46,125,50,0.2)]">
        {/* Header */}
        <div className="p-4 border-b border-[#2e7d32]/20 flex items-center justify-between bg-gradient-to-r from-[#0a0f1c] to-[#121B2A]">
          <h2 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
            🎱 Billar
          </h2>
          <button onClick={onClose} className="p-2 text-red-400 hover:bg-red-500/20 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 flex flex-col items-center gap-4">
            {/* Status */}
            <div className="text-[#E8D9B0] text-lg">
                Turno de: <span className="font-bold text-green-400">{turn}</span>
            </div>

            <div className="flex gap-4">
                {/* Table */}
                <div 
                    id="pool-table"
                    className="relative border-[10px] border-[#3E2723] rounded-lg shadow-2xl bg-[#0a4220] overflow-hidden" 
                    style={{ width: '100%', maxWidth: TABLE_WIDTH, aspectRatio: '2/1' }}
                    onMouseMove={handleTableMove}
                    onTouchMove={handleTableMove}
                >
                    {/* Render table relative to 800x400 internally via percentages */}
                    {/* Pockets */}
                    {[
                        { x: 0, y: 0 }, { x: TABLE_WIDTH / 2, y: 0 }, { x: TABLE_WIDTH, y: 0 },
                        { x: 0, y: TABLE_HEIGHT }, { x: TABLE_WIDTH / 2, y: TABLE_HEIGHT }, { x: TABLE_WIDTH, y: TABLE_HEIGHT }
                    ].map((p, i) => (
                        <div key={i} className="absolute bg-black rounded-full" 
                             style={{ 
                                 width: (HOLE_RADIUS*2/TABLE_WIDTH)*100+'%', 
                                 height: (HOLE_RADIUS*2/TABLE_HEIGHT)*100+'%', 
                                 left: ((p.x - HOLE_RADIUS)/TABLE_WIDTH)*100+'%', 
                                 top: ((p.y - HOLE_RADIUS)/TABLE_HEIGHT)*100+'%' 
                             }} />
                    ))}
                    
                    {/* Balls */}
                    {ballPositions.map(b => (
                        <div key={b.id} className="absolute rounded-full shadow-sm" 
                             style={{ 
                                 width: (BALL_RADIUS*2/TABLE_WIDTH)*100+'%', 
                                 height: (BALL_RADIUS*2/TABLE_HEIGHT)*100+'%', 
                                 left: ((b.x - BALL_RADIUS)/TABLE_WIDTH)*100+'%', 
                                 top: ((b.y - BALL_RADIUS)/TABLE_HEIGHT)*100+'%', 
                                 backgroundColor: b.color 
                             }} />
                    ))}

                    {/* Aim Line */}
                    {turn === user.username && cueBall && (
                        <div className="absolute origin-left pointer-events-none"
                             style={{
                                 left: (cueBall.x / TABLE_WIDTH) * 100 + '%',
                                 top: (cueBall.y / TABLE_HEIGHT) * 100 + '%',
                                 width: '30%',
                                 height: '2px',
                                 backgroundColor: 'rgba(255, 255, 255, 0.4)',
                                 borderTop: '2px dashed white',
                                 transform: `translateY(-50%) rotate(${aimAngle}rad)`
                             }}
                        />
                    )}
                </div>

                {/* Power Bar */}
                <div className="w-12 bg-[#121B2A] border-2 border-green-500/30 rounded-full relative flex flex-col justify-end overflow-hidden cursor-pointer touch-none"
                     id="power-bar"
                     onMouseDown={handlePowerStart}
                     onMouseMove={handlePowerMove}
                     onMouseUp={handlePowerEnd}
                     onMouseLeave={handlePowerEnd}
                     onTouchStart={handlePowerStart}
                     onTouchMove={handlePowerMove}
                     onTouchEnd={handlePowerEnd}
                >
                    <div className="w-full bg-gradient-to-t from-green-500 to-emerald-300 pointer-events-none transition-all duration-75"
                         style={{ height: `${power * 100}%` }} />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
