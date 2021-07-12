// tailwind.config.js
module.exports = {
    // ...
    // rest of the config
    plugins: [
      require('@tailwindcss/ui'),
      require('daisyui')
      
    ],
    purge: [
      '*.html',
  
    ],  
  }

module.exports = {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  }
