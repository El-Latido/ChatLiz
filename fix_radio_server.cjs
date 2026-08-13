const fs = require('fs');
let file = fs.readFileSync('server.ts', 'utf8');

const regex = /const top30Songs = \[([\s\S]*?)\];/;

const newTop30 = `const top30Songs = [
  // Pop & Hits
  { title: "Blinding Lights - The Weeknd", url: "https://www.youtube.com/watch?v=4NRXx6U8ABQ" },
  { title: "Shape of You - Ed Sheeran", url: "https://www.youtube.com/watch?v=JGwWNGJdvx8" },
  { title: "As It Was - Harry Styles", url: "https://www.youtube.com/watch?v=H5v3kku4y6Q" },
  { title: "Stay - The Kid LAROI, Justin Bieber", url: "https://www.youtube.com/watch?v=kTJczUoc26U" },
  { title: "Levitating - Dua Lipa", url: "https://www.youtube.com/watch?v=TUVcZfQe-Kw" },
  { title: "Despacito - Luis Fonsi", url: "https://www.youtube.com/watch?v=kJQP7kiw5Fk" },
  { title: "Dakiti - Bad Bunny", url: "https://www.youtube.com/watch?v=TmKh7lAwnBI" },
  { title: "Bailando - Enrique Iglesias", url: "https://www.youtube.com/watch?v=NUsoVlDFqZg" },
  { title: "Provenza - Karol G", url: "https://www.youtube.com/watch?v=ca48oMV59LU" },
  { title: "Watermelon Sugar - Harry Styles", url: "https://www.youtube.com/watch?v=E07s5ZYygMg" },
  { title: "Peaches - Justin Bieber", url: "https://www.youtube.com/watch?v=tQ0yjYUFKAE" },
  
  // 80s & 90s
  { title: "Take On Me - a-ha", url: "https://www.youtube.com/watch?v=djV11Xbc914" },
  { title: "Billie Jean - Michael Jackson", url: "https://www.youtube.com/watch?v=Zi_XLOBDo_Y" },
  { title: "Sweet Child O' Mine - Guns N' Roses", url: "https://www.youtube.com/watch?v=1w7OgIMMRc4" },
  { title: "Livin' On A Prayer - Bon Jovi", url: "https://www.youtube.com/watch?v=lDK9QqIzhwk" },
  { title: "De Música Ligera - Soda Stereo", url: "https://www.youtube.com/watch?v=T_FkEw27XJ0" },
  { title: "Lamento Boliviano - Enanitos Verdes", url: "https://www.youtube.com/watch?v=khbDnaGFDvs" },
  { title: "La Célula Que Explota - Caifanes", url: "https://www.youtube.com/watch?v=rX_3YdKkO8E" },
  { title: "Rayando El Sol - Maná", url: "https://www.youtube.com/watch?v=yYJ4wT2a4_s" },
  { title: "Wonderwall - Oasis", url: "https://www.youtube.com/watch?v=bx1Bh8ZvH84" },
  { title: "Don't Stop Believin' - Journey", url: "https://www.youtube.com/watch?v=1k8craCGv14" },
  { title: "Every Breath You Take - The Police", url: "https://www.youtube.com/watch?v=OMOGaugKpzs" },

  // Rock / Alternative
  { title: "Bohemian Rhapsody - Queen", url: "https://www.youtube.com/watch?v=fJ9rUzIMcZQ" },
  { title: "Smells Like Teen Spirit - Nirvana", url: "https://www.youtube.com/watch?v=hTWKbfoikeg" },
  { title: "Hotel California - Eagles", url: "https://www.youtube.com/watch?v=EqPtz5qN7HM" },
  { title: "In The End - Linkin Park", url: "https://www.youtube.com/watch?v=eVTXPUF4Oz4" },
  { title: "Numb - Linkin Park", url: "https://www.youtube.com/watch?v=kXYiU_JCYtU" },
  { title: "Yellow - Coldplay", url: "https://www.youtube.com/watch?v=yKNxeF4KMsY" },
  { title: "Do I Wanna Know? - Arctic Monkeys", url: "https://www.youtube.com/watch?v=bpOSxM0rNPM" },

  // Electronic / Dance
  { title: "Wake Me Up - Avicii", url: "https://www.youtube.com/watch?v=IcrbM1l_BoI" },
  { title: "Faded - Alan Walker", url: "https://www.youtube.com/watch?v=60ItHLz5WEA" },
  { title: "Titanium - David Guetta ft. Sia", url: "https://www.youtube.com/watch?v=JRfuAukYTKg" },
  { title: "Lean On - Major Lazer", url: "https://www.youtube.com/watch?v=YqeW9_5kURI" },
  { title: "Animals - Martin Garrix", url: "https://www.youtube.com/watch?v=gCYcHz2k5x0" },
  { title: "Closer - The Chainsmokers", url: "https://www.youtube.com/watch?v=PT2_F-1esPk" },
  
  // Japanese
  { title: "Yoru ni Kakeru - YOASOBI", url: "https://www.youtube.com/watch?v=x8VYWazR5mE" },
  { title: "Idol - YOASOBI", url: "https://www.youtube.com/watch?v=ZRtdQ81jPUQ" },
  { title: "Kick Back - Kenshi Yonezu", url: "https://www.youtube.com/watch?v=M2cckDmNLMI" },
  { title: "Gurenge - LiSA", url: "https://www.youtube.com/watch?v=CwkzK-F0Y00" },
  { title: "Pretender - Official HIGE DANdism", url: "https://www.youtube.com/watch?v=TQ8WlA2GXbk" },
  { title: "Lemon - Kenshi Yonezu", url: "https://www.youtube.com/watch?v=SX_ViT4Ra7k" },
  { title: "Racing Into The Night - YOASOBI", url: "https://www.youtube.com/watch?v=x8VYWazR5mE" }
];`;

file = file.replace(regex, newTop30);

fs.writeFileSync('server.ts', file);
