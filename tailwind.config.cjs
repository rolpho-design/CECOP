const tokens=require('./tokens.json');
module.exports={content:['./src/**/*.{astro,html,js,mjs,ts,json}'],theme:{extend:tokens},plugins:[require('@tailwindcss/forms'),require('@tailwindcss/container-queries')]};
