import React, { useState, useEffect, useRef } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { socket } from '../socket';

interface ActiveCallModalProps {
    partner: { username: string, profilePic: string };
    isInitiator: boolean;
    onEndCall: () => void;
}

export function ActiveCallModal({ partner, isInitiator, onEndCall }: ActiveCallModalProps) {
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(false);
    const [streamAvailable, setStreamAvailable] = useState(false);
    const [remoteStreamAvailable, setRemoteStreamAvailable] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localStream = useRef<MediaStream | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setDuration(prev => prev + 1), 1000);
        
        const initWebRTC = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                localStream.current = stream;
                setStreamAvailable(true);
                setIsVideoOn(true);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                
                // Initialize Peer Connection
                const pc = new RTCPeerConnection({
                    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
                });
                peerConnection.current = pc;
                
                stream.getTracks().forEach(track => pc.addTrack(track, stream));
                
                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.emit('webrtc_ice_candidate', {
                            target: partner.username,
                            candidate: event.candidate
                        });
                    }
                };
                
                pc.ontrack = (event) => {
                    if (remoteVideoRef.current && event.streams[0]) {
                        remoteVideoRef.current.srcObject = event.streams[0];
                        setRemoteStreamAvailable(true);
                    }
                };
                
                if (isInitiator) {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    socket.emit('webrtc_offer', {
                        target: partner.username,
                        sdp: offer
                    });
                }
                
            } catch (err) {
                console.error("Error accessing media devices.", err);
            }
        };
        
        initWebRTC();

        const handleOffer = async (data: { sender: string, sdp: any }) => {
            if (data.sender !== partner.username || !peerConnection.current) return;
            const pc = peerConnection.current;
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('webrtc_answer', {
                target: partner.username,
                sdp: answer
            });
        };

        const handleAnswer = async (data: { sender: string, sdp: any }) => {
            if (data.sender !== partner.username || !peerConnection.current) return;
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
        };

        const handleIceCandidate = async (data: { sender: string, candidate: any }) => {
            if (data.sender !== partner.username || !peerConnection.current) return;
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        };

        const handleCallEnded = (sender: string) => {
            if (sender === partner.username) {
                cleanup();
                onEndCall();
            }
        };

        socket.on('webrtc_offer', handleOffer);
        socket.on('webrtc_answer', handleAnswer);
        socket.on('webrtc_ice_candidate', handleIceCandidate);
        socket.on('call_ended', handleCallEnded);

        return () => {
            clearInterval(timer);
            socket.off('webrtc_offer', handleOffer);
            socket.off('webrtc_answer', handleAnswer);
            socket.off('webrtc_ice_candidate', handleIceCandidate);
            socket.off('call_ended', handleCallEnded);
            cleanup();
        };
    }, [isInitiator, partner.username, onEndCall]);

    const cleanup = () => {
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => track.stop());
        }
        if (peerConnection.current) {
            peerConnection.current.close();
        }
    };

    const toggleMute = () => {
        if (localStream.current) {
            const audioTrack = localStream.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (localStream.current) {
            const videoTrack = localStream.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOn(videoTrack.enabled);
            }
        }
    };

    const handleEndCall = () => {
        socket.emit('end_call', partner.username);
        cleanup();
        onEndCall();
    };

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `\${m.toString().padStart(2, '0')}:\${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 bg-[#050505] z-[200] flex flex-col p-4 animate-in fade-in duration-300">
            <div className="flex-1 relative flex items-center justify-center overflow-hidden rounded-3xl border border-white/5 bg-[#0a0a16] shadow-2xl">
                {/* Remote Video */}
                <video 
                    ref={remoteVideoRef} 
                    autoPlay 
                    playsInline 
                    className={`w-full h-full object-cover transition-opacity duration-500 \${remoteStreamAvailable ? 'opacity-100' : 'opacity-0'}`}
                />
                
                {/* Placeholder if no remote video */}
                {!remoteStreamAvailable && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a16]/80 backdrop-blur-sm">
                        <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-cyan-500/50 mb-6 relative shadow-[0_0_50px_rgba(6,182,212,0.2)]">
                            <img src={partner.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=\${partner.username}`} alt={partner.username} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-cyan-500/20 animate-pulse"></div>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-2">{partner.username}</h3>
                        <p className="text-cyan-400 font-mono text-xl">{formatTime(duration)}</p>
                        <p className="text-gray-500 text-sm mt-4 animate-pulse">Conectando video...</p>
                    </div>
                )}

                {/* Local Video Picture-in-Picture */}
                <div className={`absolute bottom-6 right-6 w-32 h-48 sm:w-48 sm:h-64 bg-[#12141c] rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl transition-all duration-300 \${streamAvailable && isVideoOn ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                </div>
            </div>
            
            {/* Controls */}
            <div className="h-28 flex items-center justify-center gap-6 mt-4">
                <button 
                    onClick={toggleMute}
                    className={`p-5 rounded-full transition-all \${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                    {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
                </button>
                
                <button 
                    onClick={handleEndCall}
                    className="p-6 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-transform hover:scale-110"
                >
                    <PhoneOff size={36} />
                </button>
                
                <button 
                    onClick={toggleVideo}
                    className={`p-5 rounded-full transition-all \${!isVideoOn ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                    {!isVideoOn ? <VideoOff size={28} /> : <Video size={28} />}
                </button>
            </div>
        </div>
    );
}
