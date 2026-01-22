import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1f2937', foreground: '#ffffff' },
        border: '#e5e7eb',
        background: '#fafafa',
        muted: { DEFAULT: '#f3f4f6', foreground: '#6b7280' },
      },
    },
  },
  plugins: [],
}

export default config
