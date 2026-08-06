const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const t1 = `    } catch(e: any) {
        if (e?.status === 429 || e?.status === 503 || e?.message?.includes('429') || e?.message?.includes('503')) {
            console.warn("Gemini API rate limit (429/503) during moderation. Allowing message to pass.");
        } else {
            console.error("Moderation error:", e);
        }
    }`;

const r1 = `    } catch(e: any) {
        if (e?.status === 429 || e?.status === 503 || e?.message?.includes('429') || e?.message?.includes('503')) {
            // Silently fail and allow the message to pass without moderation
        } else {
            console.error("Moderation error:", e);
        }
    }`;

if(code.includes(t1)) {
    code = code.replace(t1, r1);
    fs.writeFileSync('server.ts', code);
    console.log("Replaced moderation block again");
} else {
    console.log("Could not find moderation block");
}
