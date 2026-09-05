const fs = require('fs');
let code = fs.readFileSync('src/components/ActiveCallModal.tsx', 'utf8');

const webrtcSearch = `                let makingOffer = false;
                pc.onnegotiationneeded = async () => {
                    try {
                        makingOffer = true;
                        const offer = await pc.createOffer();
                        await pc.setLocalDescription(offer);
                        socket.emit('webrtc_offer', {
                            target: partner.username,
                            sdp: offer
                        });
                    } catch (e) {
                        console.error("negotiation error", e);
                    } finally {
                        makingOffer = false;
                    }
                };

                pc.onicecandidate = (event) => {`;

const webrtcReplace = `                let makingOffer = false;
                let ignoreOffer = false;
                
                pc.onnegotiationneeded = async () => {
                    try {
                        makingOffer = true;
                        const offer = await pc.createOffer();
                        await pc.setLocalDescription(offer);
                        socket.emit('webrtc_offer', {
                            target: partner.username,
                            sdp: pc.localDescription
                        });
                    } catch (e) {
                        console.error("negotiation error", e);
                    } finally {
                        makingOffer = false;
                    }
                };

                pc.onicecandidate = (event) => {`;

code = code.replace(webrtcSearch, webrtcReplace);


const offerSearch = `        const handleOffer = async (data: { sender: string, sdp: RTCSessionDescriptionInit }) => {
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
        };`;

const offerReplace = `        let ignoreOffer = false;
        const handleOffer = async (data: { sender: string, sdp: RTCSessionDescriptionInit }) => {
            if (data.sender !== partner.username || !peerConnection.current) return;
            const pc = peerConnection.current;
            
            const offerCollision = (pc.signalingState !== "stable") || pc.localDescription !== null; // Simplify check for collision context
            const polite = !isInitiator;
            
            ignoreOffer = !polite && offerCollision;
            if (ignoreOffer) {
                return;
            }
            
            try {
                if (pc.signalingState !== "stable" && polite) {
                    await Promise.all([
                        pc.setLocalDescription({type: "rollback"}),
                        pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
                    ]);
                } else {
                    await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                }
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit('webrtc_answer', {
                    target: partner.username,
                    sdp: pc.localDescription
                });
            } catch (e) {
                console.error("Error handling offer", e);
            }
        };`;

code = code.replace(offerSearch, offerReplace);

const answerSearch = `        const handleAnswer = async (data: { sender: string, sdp: RTCSessionDescriptionInit }) => {
            if (data.sender !== partner.username || !peerConnection.current) return;
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
        };

        const handleIceCandidate = async (data: { sender: string, candidate: RTCIceCandidateInit }) => {
            if (data.sender !== partner.username || !peerConnection.current) return;
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        };`;

const answerReplace = `        const handleAnswer = async (data: { sender: string, sdp: RTCSessionDescriptionInit }) => {
            if (data.sender !== partner.username || !peerConnection.current) return;
            try {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
            } catch(e) {
                console.error("Error setting answer", e);
            }
        };

        const handleIceCandidate = async (data: { sender: string, candidate: RTCIceCandidateInit }) => {
            if (data.sender !== partner.username || !peerConnection.current) return;
            try {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (e) {
                if (!ignoreOffer) {
                    console.error("Error adding ice candidate", e);
                }
            }
        };`;
        
code = code.replace(answerSearch, answerReplace);


const renderSearch = `            <div className="flex-1 relative flex items-center justify-center overflow-hidden rounded-[40px] border border-white/5 bg-black shadow-2xl">
                {/* Remote Video/Audio */}
                <video 
                    ref={remoteVideoRef} 
                    autoPlay 
                    playsInline 
                    className={\`w-full h-full object-cover transition-opacity duration-500 \${remoteStreamAvailable ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}\`}
                />
                
                {/* Placeholder if no remote video (but audio still plays via video tag) */}
                {!remoteStreamAvailable && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#12141c] to-[#0B1220]">
                        <div className="w-48 h-48 rounded-full overflow-hidden border-[6px] border-cyan-500/30 mb-8 relative shadow-[0_0_80px_rgba(6,182,212,0.15)] animate-in zoom-in-95 duration-700">
                            <div className="absolute inset-0 bg-cyan-500/10 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                            <img src={partner.profilePic || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${partner.username}\`} alt={partner.username} className="w-full h-full object-cover bg-[#1A2639] relative z-10" />
                        </div>
                        <h3 className="text-4xl font-light text-white mb-3 tracking-wide">{partner.username}</h3>
                        <p className="text-cyan-400 font-mono text-2xl tracking-widest bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/20">{formatTime(duration)}</p>
                    </div>
                )}

                {/* Local Video Picture-in-Picture */}
                <div className={\`absolute bottom-6 right-6 w-32 h-48 sm:w-48 sm:h-64 bg-[#12141c] rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl transition-all duration-500 \${isVideoOn ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}\`}>
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                </div>
            </div>`;


const renderReplace = `            <div className="flex-1 relative flex items-center justify-center overflow-hidden rounded-[40px] border border-white/5 bg-black shadow-2xl">
                {/* Main Video (Remote by default, Local if swapped) */}
                <video 
                    ref={isSwapped ? localVideoRef : remoteVideoRef} 
                    autoPlay 
                    playsInline 
                    muted={isSwapped} // Local video should be muted
                    onClick={() => setIsSwapped(!isSwapped)}
                    className={\`w-full h-full object-cover cursor-pointer transition-opacity duration-500 \${(isSwapped ? isVideoOn : remoteStreamAvailable) ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}\`}
                />
                
                {/* Placeholder if Main video is not available */}
                {!(isSwapped ? isVideoOn : remoteStreamAvailable) && (
                    <div 
                      onClick={() => setIsSwapped(!isSwapped)}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#12141c] to-[#0B1220] cursor-pointer"
                    >
                        <div className="w-48 h-48 rounded-full overflow-hidden border-[6px] border-cyan-500/30 mb-8 relative shadow-[0_0_80px_rgba(6,182,212,0.15)] animate-in zoom-in-95 duration-700">
                            <div className="absolute inset-0 bg-cyan-500/10 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                            <img src={isSwapped ? \`https://api.dicebear.com/7.x/avataaars/svg?seed=local\` : (partner.profilePic || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${partner.username}\`)} alt="Profile" className="w-full h-full object-cover bg-[#1A2639] relative z-10" />
                        </div>
                        <h3 className="text-4xl font-light text-white mb-3 tracking-wide">{isSwapped ? 'Tú' : partner.username}</h3>
                        <p className="text-cyan-400 font-mono text-2xl tracking-widest bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/20">{formatTime(duration)}</p>
                    </div>
                )}

                {/* PiP Video (Local by default, Remote if swapped) */}
                <div 
                    onClick={() => setIsSwapped(!isSwapped)}
                    className={\`absolute bottom-6 right-6 w-32 h-48 sm:w-48 sm:h-64 bg-[#12141c] rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl cursor-pointer transition-all duration-500 \${(!isSwapped ? isVideoOn : remoteStreamAvailable) ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}\`}
                >
                    <video 
                      ref={!isSwapped ? localVideoRef : remoteVideoRef} 
                      autoPlay 
                      playsInline 
                      muted={!isSwapped} // Local video should be muted
                      className="w-full h-full object-cover" 
                    />
                </div>
            </div>`;

code = code.replace(renderSearch, renderReplace);

fs.writeFileSync('src/components/ActiveCallModal.tsx', code);
