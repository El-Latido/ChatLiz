const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const t1 = `      try {
          if (process.env.GEMINI_API_KEY && Object.keys(answers).length > 0) {
              const response = await ai.models.generateContent({
                  model: 'gemini-2.5-flash',
                  contents: prompt,
                  config: {
                      responseMimeType: "application/json",
                  }
              });
              resultJson = JSON.parse(response.text || '{}');
          } else {
             // Fallback local scoring if no Gemini or no answers
             for (const [p, pAnswers] of Object.entries(answers)) {
                 let pts = 0;
                 resultJson.details[p] = {};
                 ['name', 'color', 'animal', 'fruit', 'thing'].forEach(cat => {
                     const ans = (pAnswers as any)[cat];
                     if (ans && typeof ans === 'string' && ans.trim().toUpperCase().startsWith(letter)) {
                         pts += 10;
                         resultJson.details[p][cat] = { word: ans, points: 10, reason: "Válida (Local)" };
                     } else {
                         resultJson.details[p][cat] = { word: ans || '', points: 0, reason: "Inválida" };
                     }
                 });
                 resultJson.scores[p] = pts;
             }
          }
      } catch (e) {
          console.error("Error evaluating with Gemini:", e);
      }`;

const r1 = `      try {
          if (process.env.GEMINI_API_KEY && Object.keys(answers).length > 0) {
              const response = await ai.models.generateContent({
                  model: 'gemini-2.5-flash',
                  contents: prompt,
                  config: {
                      responseMimeType: "application/json",
                  }
              });
              resultJson = JSON.parse(response.text || '{}');
          } else {
              throw new Error("No API key or no answers");
          }
      } catch (e) {
          console.error("Error evaluating with Gemini, using local fallback:", e);
          // Fallback local scoring if no Gemini or no answers
          for (const [p, pAnswers] of Object.entries(answers)) {
              let pts = 0;
              resultJson.details[p] = {};
              ['name', 'color', 'animal', 'fruit', 'thing'].forEach(cat => {
                  const ans = (pAnswers as any)[cat];
                  if (ans && typeof ans === 'string' && ans.trim().toUpperCase().startsWith(letter)) {
                      pts += 10;
                      resultJson.details[p][cat] = { word: ans, points: 10, reason: "Válida (Local)" };
                  } else {
                      resultJson.details[p][cat] = { word: ans || '', points: 0, reason: "Inválida" };
                  }
              });
              resultJson.scores[p] = pts;
          }
      }`;

if(code.includes(t1)) {
    code = code.replace(t1, r1);
    fs.writeFileSync('server.ts', code);
    console.log("Replaced tutifrutti error handling");
} else {
    console.log("Could not find tutifrutti error handling block");
}
