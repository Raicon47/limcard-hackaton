// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./node_modules/flowbite/**/*.{js,jsx,ts,tsx}", // 👈 Add Flowbite Vue
    "./node_modules/flowbite/**/*.{js,jsx,ts,tsx}",     // 👈 Add Flowbite JS
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('flowbite'), 
    // require('flowbite/plugin'), 
  ],
}