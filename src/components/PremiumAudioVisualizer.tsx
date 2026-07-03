import React, { useRef, useEffect } from 'react';

export const PremiumAudioVisualizer = ({ stream }: { stream: MediaStream | null }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const requestRef = useRef<number>(0);

    useEffect(() => {
        if (!stream || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Ensure canvas respects its display size
        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        try {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            const analyser = audioContextRef.current.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);
            analyserRef.current = analyser;
        } catch (e) {
            console.error("Audio Context setup error", e);
        }

        const bufferLength = analyserRef.current?.frequencyBinCount || 0;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            if (!analyserRef.current || !ctx) return;
            analyserRef.current.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, width, height);
            
            const barWidth = (width / bufferLength) * 1.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * height;

                const gradient = ctx.createLinearGradient(0, height, 0, 0);
                gradient.addColorStop(0, '#D4AF37');
                gradient.addColorStop(1, '#F3E5AB');

                ctx.fillStyle = gradient;
                
                // Draw rounded top bar
                const radius = barWidth / 2;
                ctx.beginPath();
                ctx.moveTo(x, height);
                ctx.lineTo(x, height - barHeight + radius);
                ctx.arcTo(x, height - barHeight, x + radius, height - barHeight, radius);
                ctx.arcTo(x + barWidth, height - barHeight, x + barWidth, height - barHeight + radius, radius);
                ctx.lineTo(x + barWidth, height);
                ctx.fill();

                x += barWidth + 2;
            }

            requestRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(requestRef.current);
            if (audioContextRef.current?.state !== 'closed') {
                audioContextRef.current?.close();
            }
        };
    }, [stream]);

    return (
        <div className="flex items-center gap-2 bg-[#0a0f1c] px-4 py-2 rounded-full border border-[#D4AF37]/50 shadow-[0_0_10px_rgba(212,175,55,0.15)] flex-1 overflow-hidden h-10 min-w-[120px]">
             <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
             <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mr-2">Grabando</span>
             <canvas ref={canvasRef} className="flex-1 h-full w-full" />
        </div>
    );
};
