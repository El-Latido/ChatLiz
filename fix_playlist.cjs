const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

const oldArrayMatch = server.match(/const top30Songs = \[\s*\/\/ Pop & Hits[\s\S]*?\];/);

if (oldArrayMatch) {
const newArray = `const top30Songs = [
  // Pop & Hits
  { title: "Blinding Lights - The Weeknd", url: "https://www.youtube.com/watch?v=4NRXx6U8ABQ" },
  { title: "Shape of You - Ed Sheeran", url: "https://www.youtube.com/watch?v=JGwWNGJdvx8" },
  { title: "As It Was - Harry Styles", url: "https://www.youtube.com/watch?v=H5v3kku4y6Q" },
  { title: "Stay - The Kid LAROI, Justin Bieber", url: "https://www.youtube.com/watch?v=kTJczUoc26U" },
  { title: "Levitating - Dua Lipa", url: "https://www.youtube.com/watch?v=TUVcZfQe-Kw" },
  { title: "Despacito - Luis Fonsi ft. Daddy Yankee", url: "https://www.youtube.com/watch?v=kJQP7kiw5Fk" },
  { title: "Dakiti - Bad Bunny, Jhay Cortez", url: "https://www.youtube.com/watch?v=TmKh7lAwnBI" },
  { title: "Bailando - Enrique Iglesias", url: "https://www.youtube.com/watch?v=NUsoVlDFqZg" },
  { title: "Provenza - Karol G", url: "https://www.youtube.com/watch?v=ca48oMV59LU" },
  
  // 80s & 90s
  { title: "Take On Me - a-ha", url: "https://www.youtube.com/watch?v=djV11Xbc914" },
  { title: "Billie Jean - Michael Jackson", url: "https://www.youtube.com/watch?v=Zi_XLOBDo_Y" },
  { title: "Sweet Child O' Mine - Guns N' Roses", url: "https://www.youtube.com/watch?v=1w7OgIMMRc4" },
  { title: "Livin' On A Prayer - Bon Jovi", url: "https://www.youtube.com/watch?v=lDK9QqIzhwk" },
  { title: "De Música Ligera - Soda Stereo", url: "https://www.youtube.com/watch?v=T_FkEw27XJ0" },
  { title: "Lamento Boliviano - Enanitos Verdes", url: "https://www.youtube.com/watch?v=khbDnaGFDvs" },
  { title: "La Célula Que Explota - Caifanes", url: "https://www.youtube.com/watch?v=rX_3YdKkO8E" },
  { title: "Rayando El Sol - Maná", url: "https://www.youtube.com/watch?v=yYJ4wT2a4_s" },

  // Rock / Alternative
  { title: "Bohemian Rhapsody - Queen", url: "https://www.youtube.com/watch?v=fJ9rUzIMcZQ" },
  { title: "Smells Like Teen Spirit - Nirvana", url: "https://www.youtube.com/watch?v=hTWKbfoikeg" },
  { title: "Hotel California - Eagles", url: "https://www.youtube.com/watch?v=EqPtz5qN7HM" },
  { title: "In The End - Linkin Park", url: "https://www.youtube.com/watch?v=eVTXPUF4Oz4" },
  { title: "Numb - Linkin Park", url: "https://www.youtube.com/watch?v=kXYiU_JCYtU" },

  // Electronic / Dance
  { title: "Wake Me Up - Avicii", url: "https://www.youtube.com/watch?v=IcrbM1l_BoI" },
  { title: "Faded - Alan Walker", url: "https://www.youtube.com/watch?v=60ItHLz5WEA" },
  { title: "Titanium - David Guetta ft. Sia", url: "https://www.youtube.com/watch?v=JRfuAukYTKg" },
  { title: "Lean On - Major Lazer & DJ Snake", url: "https://www.youtube.com/watch?v=YqeW9_5kURI" },
  
  // Japanese (Pop / Rock / Anime Hits)
  { title: "Idol - YOASOBI", url: "https://www.youtube.com/watch?v=ZRtdQ81jPUQ" },
  { title: "Gurenge - LiSA", url: "https://www.youtube.com/watch?v=CwkzK-F0Y00" },
  { title: "KICK BACK - Kenshi Yonezu", url: "https://www.youtube.com/watch?v=M2cckDmNLMI" },
  { title: "Unravel - TK from Ling tosite sigure", url: "https://www.youtube.com/watch?v=Fve_lHIPa-I" },
  { title: "Pretender - Official HIGE DANdism", url: "https://www.youtube.com/watch?v=TQ8WlA2GXbk" },
  { title: "Lemon - Kenshi Yonezu", url: "https://www.youtube.com/watch?v=SX_ViT4Ra7k" }
];`

    server = server.replace(oldArrayMatch[0], newArray);
    fs.writeFileSync('server.ts', server);
}
