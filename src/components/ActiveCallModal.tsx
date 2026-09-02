import React, { useState, useEffect, useRef } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Camera } from 'lucide-react';
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
    const [remoteStreamAvailable, setRemoteStreamAvailable] = useState(false);
    const [videoRequestState, setVideoRequestState] = useState<'idle' | 'pending' | 'incoming'>('idle');

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localStream = useRef<MediaStream | null>(null);

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0');
    };

    useEffect(() => {
        const timer = setInterval(() => setDuration(prev => prev + 1), 1000);
        
        const initWebRTC = async () => {
            try {
                // Initial connection is Audio Only
                const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
                localStream.current = stream;
                
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
                        // Check if remote stream has video
                        const hasVideo = event.streams[0].getVideoTracks().length > 0;
                        if (hasVideo) {
                            setRemoteStreamAvailable(true);
                        }
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

        const handleVideoRequest = (sender: string) => {
            if (sender === partner.username) {
                setVideoRequestState('incoming');
            }
        };

        const handleVideoResponse = async (data: { sender: string, accepted: boolean }) => {
            if (data.sender === partner.username) {
                setVideoRequestState('idle');
                if (data.accepted) {
                    await enableVideo();
                }
            }
        };

        socket.on('webrtc_offer', handleOffer);
        socket.on('webrtc_answer', handleAnswer);
        socket.on('webrtc_ice_candidate', handleIceCandidate);
        socket.on('call_ended', handleCallEnded);
        socket.on('video_request', handleVideoRequest);
        socket.on('video_response', handleVideoResponse);

        return () => {
            clearInterval(timer);
            socket.off('webrtc_offer', handleOffer);
            socket.off('webrtc_answer', handleAnswer);
            socket.off('webrtc_ice_candidate', handleIceCandidate);
            socket.off('call_ended', handleCallEnded);
            socket.off('video_request', handleVideoRequest);
            socket.off('video_response', handleVideoResponse);
            cleanup();
        };
    }, [isInitiator, partner.username, onEndCall]);

    const enableVideo = async () => {
        try {
            const vStream = await navigator.mediaDevices.getUserMedia({ video: true });
            const vTrack = vStream.getVideoTracks()[0];
            
            if (localStream.current && peerConnection.current) {
                localStream.current.addTrack(vTrack);
                peerConnection.current.addTrack(vTrack, localStream.current);
                setIsVideoOn(true);
                
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = localStream.current;
                }

                // Renegotiate connection with new track
                const offer = await peerConnection.current.createOffer();
                await peerConnection.current.setLocalDescription(offer);
                socket.emit('webrtc_offer', { target: partner.username, sdp: offer });
            }
        } catch (e) {
            console.error("Failed to enable video", e);
        }
    };

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

    const requestOrToggleVideo = () => {
        if (isVideoOn) {
            // If already on, just disable the track (keeps connection intact but sends black frame)
            if (localStream.current) {
                const videoTrack = localStream.current.getVideoTracks()[0];
                if (videoTrack) {
                    videoTrack.enabled = !videoTrack.enabled;
                    setIsVideoOn(videoTrack.enabled);
                }
            }
        } else {
            // If not on, request it from the other user
            socket.emit('video_request', partner.username);
            setVideoRequestState('pending');
        }
    };

    const handleEndCall = () => {
        socket.emit('end_call', partner.username);
        cleanup();
        onEndCall();
    };

    return (
        <div className="fixed inset-0 bg-[#050505] z-[200] flex flex-col p-4 animate-in fade-in duration-300">
            {videoRequestState === 'pending' && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-cyan-900/80 text-cyan-100 px-6 py-3 rounded-full text-sm font-medium backdrop-blur-md whitespace-nowrap z-50 shadow-xl border border-cyan-500/30 animate-pulse">
                    Esperando que {partner.username} acepte la videollamada...
                </div>
            )}

            {videoRequestState === 'incoming' && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-[#12141c] border border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.3)] p-5 rounded-2xl backdrop-blur-md flex flex-col items-center gap-4 z-50 animate-in slide-in-from-top-4">
                    <p className="text-white text-sm text-center font-medium">
                        <span className="text-cyan-400 font-bold">{partner.username}</span> quiere iniciar videollamada
                    </p>
                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={() => {
                                socket.emit('video_response', { target: partner.username, accepted: false });
                                setVideoRequestState('idle');
                            }}
                            className="flex-1 bg-red-500/20 text-red-400 py-2.5 rounded-xl text-xs font-bold hover:bg-red-500/30 transition-colors"
                        >
                            Rechazar
                        </button>
                        <button 
                            onClick={async () => {
                                socket.emit('video_response', { target: partner.username, accepted: true });
                                setVideoRequestState('idle');
                                await enableVideo();
                            }}
                            className="flex-1 bg-green-500/20 text-green-400 py-2.5 rounded-xl text-xs font-bold hover:bg-green-500/30 transition-colors"
                        >
                            Aceptar
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-1 relative flex items-center justify-center overflow-hidden rounded-3xl border border-white/5 bg-[#0a0a16] shadow-2xl">
                {/* Remote Video */}
                <video 
                    ref={remoteVideoRef} 
                    autoPlay 
                    playsInline 
                    className={`w-full h-full object-cover transition-opacity duration-500 ${remoteStreamAvailable ? 'opacity-100' : 'opacity-0'}`}
                />
                
                {/* Placeholder if no remote video */}
                {!remoteStreamAvailable && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a16]/80 backdrop-blur-sm">
                        <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-cyan-500/50 mb-6 relative shadow-[0_0_50px_rgba(6,182,212,0.2)]">
                            <img src={partner.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${partner.username}`} alt={partner.username} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-cyan-500/20 animate-pulse"></div>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-2">{partner.username}</h3>
                        <p className="text-cyan-400 font-mono text-xl tracking-wider">{formatTime(duration)}</p>
                    </div>
                )}

                {/* Local Video Picture-in-Picture */}
                <div className={`absolute bottom-6 right-6 w-32 h-48 sm:w-48 sm:h-64 bg-[#12141c] rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl transition-all duration-300 ${isVideoOn ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                </div>
            </div>
            
            {/* Controls */}
            <div className="h-28 flex items-center justify-center gap-6 mt-4">
                <button 
                    onClick={toggleMute}
                    className={`p-5 rounded-full transition-all ${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
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
                    onClick={requestOrToggleVideo}
                    className={`p-5 rounded-full transition-all ${!isVideoOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'}`}
                >
                    {!isVideoOn ? <VideoOff size={28} /> : <Video size={28} />}
                </button>
            </div>
        </div>
    );
}
