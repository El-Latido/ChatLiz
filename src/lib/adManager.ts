export class ChatLizAdFlowManager {
    chatSessionId: string;
    onAdCompletedCallback: (reward: number) => void;
    
    constructor(chatSessionId: string, onAdCompletedCallback: (reward: number) => void) {
        this.chatSessionId = chatSessionId;
        this.onAdCompletedCallback = onAdCompletedCallback;
    }

    async initialize() {
        console.log("ChatLiz Ad SDK Initialized");
    }

    showRewardedVideoAd() {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'black';
        overlay.style.zIndex = '999999';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        
        const video = document.createElement('video');
        video.src = 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
        video.style.maxWidth = '100%';
        video.style.maxHeight = '80%';
        video.autoplay = true;
        video.controls = false;
        
        const skipText = document.createElement('div');
        skipText.style.color = 'white';
        skipText.style.marginTop = '20px';
        skipText.style.fontFamily = 'sans-serif';
        skipText.innerText = 'El anuncio terminará en unos segundos...';
        
        overlay.appendChild(video);
        overlay.appendChild(skipText);
        document.body.appendChild(overlay);

        let timeLeft = 10;
        const interval = setInterval(() => {
            timeLeft--;
            if (timeLeft > 0) {
                skipText.innerText = `Recompensa en ${timeLeft}s...`;
            } else {
                clearInterval(interval);
                skipText.innerText = '¡Recompensa obtenida! Puedes cerrar este anuncio.';
                
                const closeBtn = document.createElement('button');
                closeBtn.innerText = 'CERRAR Y RECLAMAR';
                closeBtn.style.padding = '10px 20px';
                closeBtn.style.marginTop = '20px';
                closeBtn.style.backgroundColor = '#10B981';
                closeBtn.style.color = 'white';
                closeBtn.style.border = 'none';
                closeBtn.style.borderRadius = '8px';
                closeBtn.style.cursor = 'pointer';
                closeBtn.style.fontWeight = 'bold';
                
                closeBtn.onclick = () => {
                    document.body.removeChild(overlay);
                    this.onAdCompletedCallback(10);
                };
                overlay.appendChild(closeBtn);
            }
        }, 1000);
    }
}
