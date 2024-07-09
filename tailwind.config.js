// Importação da customização das cores
import { colors } from './src/styles/colors'
import { fontFamily } from './src/styles/fontFamily'

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.tsx"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors,
      fontFamily
    },
  },
  plugins: [],
}