import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0b1e3a',
          green: '#14b87a',
          gray: '#6b7280'
        }
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.08)'
      }
    }
  },
  plugins: []
}
export default config
