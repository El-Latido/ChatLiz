const googleTTS = require('google-tts-api');
const url = googleTTS.getAudioUrl('Hola mundo, soy Elizabeth', { lang: 'es-ES', slow: false, host: 'https://translate.google.com' });
console.log(url);
