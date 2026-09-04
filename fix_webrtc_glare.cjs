const fs = require('fs');
let code = fs.readFileSync('src/components/ActiveCallModal.tsx', 'utf8');

const webrtcInitOld = `                pc.onnegotiationneeded = async () => {
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

                pc.onicecandidate = (event) => {`;

const webrtcInitNew = `                let makingOffer = false;
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
code = code.replace(webrtcInitOld, webrtcInitNew);

const handleOfferOld = `        const handleOffer = async (data: { sender: string, sdp: RTCSessionDescriptionInit }) => {
            if (data.sender !== partner.username || !peerConnection.current) return;
            const pc = peerConnection.current;
            if (pc.signalingState !== "stable") {
                // If we are initiator and we receive an offer while not stable, we ignore it (glare resolution - initiator wins)
                if (isInitiator) return;
                // If non-initiator, we should rollback, but standard WebRTC rollback is complex.
                // We'll just try to set it.
            }
            try {
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

const handleOfferNew = `        const handleOffer = async (data: { sender: string, sdp: RTCSessionDescriptionInit }) => {
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
code = code.replace(handleOfferOld, handleOfferNew);

const initBlockOld = `                if (isInitiator) {
                    // Slight delay to ensure the other peer is ready to receive the offer
                    setTimeout(async () => {
                        try {
                            const offer = await pc.createOffer();
                            await pc.setLocalDescription(offer);
                            socket.emit('webrtc_offer', {
                                target: partner.username,
                                sdp: offer
                            });
                        } catch(e) { console.error("Error creating offer", e); }
                    }, 1000);
                }`;
const initBlockNew = `                // Manual initial offer handled by negotiationneeded`;
code = code.replace(initBlockOld, initBlockNew);

fs.writeFileSync('src/components/ActiveCallModal.tsx', code);
