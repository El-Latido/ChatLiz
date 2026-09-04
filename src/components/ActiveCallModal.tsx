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
    const [isSwapped, setIsSwapped] = useState(false);
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
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: false, 
                    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
                });
                localStream.current = stream;
                
                const pc = new RTCPeerConnection({
                    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
                });
                peerConnection.current = pc;
                
                stream.getTracks().forEach(track => pc.addTrack(track, stream));
                
                pc.onnegotiationneeded = async () => {
                    try {
                        if (pc.signalingState !== "stable") return;
                        const offer = await pc.createOffer();
                        await pc.setLocalDescription(offer);
                        socket.emit('webrtc_offer', {
                            target: partner.username,
                            sdp: offer
                        });
                    } catch (e) {
                        console.error("negotiation error", e);
                    }
                };
                
                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.emit('webrtc_ice_candidate', {
                            target: partner.username,
                            candidate: event.candidate
                        });
                    }
                };
                
                pc.ontrack = (event) => {
                    if (remoteVideoRef.current) {
                        let stream = remoteVideoRef.current.srcObject;
                        if (!stream) {
                            if (event.streams && event.streams[0]) {
                                stream = event.streams[0];
                            } else {
                                stream = new MediaStream();
                            }
                            remoteVideoRef.current.srcObject = stream;
                        }
                        if (event.track && !(stream as MediaStream).getTracks().includes(event.track)) {
                            (stream as MediaStream).addTrack(event.track);
                        }
                        const hasVideo = (stream as MediaStream).getVideoTracks().length > 0;
                        setRemoteStreamAvailable(hasVideo);
                        remoteVideoRef.current.play().catch(e => console.error("Play error:", e));
                    }
                };

                // Manual initial offer handled by negotiationneeded
            } catch (e) {
                console.error("WebRTC Error:", e);
            }
        };

        initWebRTC();

        const handleOffer = async (data: { sender: string, sdp: RTCSessionDescriptionInit }) => {
            if (data.sender !== partner.username || !peerConnection.current) return;
            const pc = peerConnection.current;
            // Glare resolution
            const offerCollision = (pc.signalingState !== "stable");
            const polite = !isInitiator;
            
            if (offerCollision && !polite) {
                // We are impolite and there is a collision, ignore their offer
                return;
            }
            
            try {
                // If we are polite and there's a collision, we rollback our offer by setting the remote one.
                // Actually setRemoteDescription handles rollback implicitly in modern browsers if signalingState is have-local-offer
                await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit('webrtc_answer', {
                    target: partner.username,
                    sdp: answer
                });
            } catch (e) {
                console.error("Error handling offer", e);
            }
        };

        const handleAnswer = async (data: { sender: string, sdp: RTCSessionDescriptionInit }) => {
            if (data.sender !== partner.username || !peerConnection.current) return;
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
        };

        const handleIceCandidate = async (data: { sender: string, candidate: RTCIceCandidateInit }) => {
            if (data.sender !== partner.username || !peerConnection.current) return;
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        };

        const handleCallEnded = () => {
            cleanup();
            onEndCall();
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
                const sender = peerConnection.current.getSenders().find(s => s.track?.kind === 'video');
                if (sender) {
                    sender.replaceTrack(vTrack);
                } else {
                    peerConnection.current.addTrack(vTrack, localStream.current);
                }
                setIsVideoOn(true);
                
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = localStream.current;
                }

                // Let negotiationneeded handle it automatically
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
        <div className="fixed inset-0 bg-[#0B1220] z-[200] flex flex-col p-4 animate-in fade-in duration-300">
            {videoRequestState === 'pending' && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-cyan-900/80 text-cyan-100 px-6 py-3 rounded-full text-sm font-medium backdrop-blur-md whitespace-nowrap z-50 shadow-xl border border-cyan-500/30 animate-pulse">
                    Esperando que {partner.username} acepte la videollamada...
                </div>
            )}
            
            {videoRequestState === 'incoming' && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-[#12141c] border border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.3)] p-5 rounded-3xl backdrop-blur-md flex flex-col items-center gap-5 z-50 animate-in slide-in-from-top-4 min-w-[280px]">
                    <p className="text-white text-sm text-center font-medium">
                        <span className="text-cyan-400 font-bold">{partner.username}</span> quiere iniciar videollamada
                    </p>
                    <div className="flex gap-4 w-full">
                        <button 
                            onClick={() => {
                                socket.emit('video_response', { target: partner.username, accepted: false });
                                setVideoRequestState('idle');
                            }}
                            className="flex-1 bg-red-500/10 text-red-400 py-3 rounded-2xl text-xs font-bold hover:bg-red-500 hover:text-white border border-red-500/20 transition-colors"
                        >
                            Rechazar
                        </button>
                        <button 
                            onClick={async () => {
                                socket.emit('video_response', { target: partner.username, accepted: true });
                                setVideoRequestState('idle');
                                await enableVideo();
                            }}
                            className="flex-1 bg-cyan-500/10 text-cyan-400 py-3 rounded-2xl text-xs font-bold hover:bg-cyan-500 hover:text-white border border-cyan-500/20 transition-colors"
                        >
                            Aceptar
                        </button>
                    </div>
                </div>
            )}
            
            <div className="flex-1 relative flex items-center justify-center overflow-hidden rounded-[40px] border border-white/5 bg-black shadow-2xl">
                {/* Remote Video/Audio */}
                <video 
                    ref={remoteVideoRef} 
                    autoPlay 
                    playsInline 
                    className={`w-full h-full object-cover transition-opacity duration-500 ${remoteStreamAvailable ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}
                />
                
                {/* Placeholder if no remote video (but audio still plays via video tag) */}
                {!remoteStreamAvailable && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#12141c] to-[#0B1220]">
                        <div className="w-48 h-48 rounded-full overflow-hidden border-[6px] border-cyan-500/30 mb-8 relative shadow-[0_0_80px_rgba(6,182,212,0.15)] animate-in zoom-in-95 duration-700">
                            <div className="absolute inset-0 bg-cyan-500/10 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                            <img src={partner.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${partner.username}`} alt={partner.username} className="w-full h-full object-cover bg-[#1A2639] relative z-10" />
                        </div>
                        <h3 className="text-4xl font-light text-white mb-3 tracking-wide">{partner.username}</h3>
                        <p className="text-cyan-400 font-mono text-2xl tracking-widest bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/20">{formatTime(duration)}</p>
                    </div>
                )}

                {/* Local Video Picture-in-Picture */}
                <div className={`absolute bottom-6 right-6 w-32 h-48 sm:w-48 sm:h-64 bg-[#12141c] rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl transition-all duration-500 ${isVideoOn ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                </div>
            </div>
            
            {/* Controls */}
            <div className="h-28 flex items-center justify-center gap-6 mt-6">
                <button 
                    onClick={toggleMute}
                    className={`p-5 rounded-[24px] transition-all duration-300 shadow-lg ${isMuted ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white' : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white'}`}
                >
                    {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
                </button>
                
                <button 
                    onClick={handleEndCall}
                    className="p-6 rounded-[28px] bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all duration-300 hover:scale-110 hover:bg-red-600 hover:shadow-[0_0_40px_rgba(239,68,68,0.5)] group"
                >
                    <PhoneOff size={36} className="group-hover:scale-95 transition-transform" />
                </button>
                
                <button 
                    onClick={requestOrToggleVideo}
                    className={`p-5 rounded-[24px] transition-all duration-300 shadow-lg ${!isVideoOn ? 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500 hover:text-white'}`}
                >
                    {!isVideoOn ? <VideoOff size={28} /> : <Video size={28} />}
                </button>
            </div>
        </div>
    );
}
