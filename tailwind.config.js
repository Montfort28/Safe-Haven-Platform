/** @type {import('tailwindcss').Config} */
const primaryScale = {
  50: '#FCF9EA',
  100: '#FCF9EA',
  200: '#A8BBA3',
  300: '#A8BBA3',
  400: '#DB9558',
  500: '#DB9558',
  600: '#97A87A',
  700: '#44513D',
  800: '#44513D',
  900: '#44513D',
  950: '#44513D',
};

const sageScale = {
  ...primaryScale,
  400: '#97A87A',
  500: '#97A87A',
  600: '#97A87A',
};

const neutralScale = {
  ...primaryScale,
  400: '#A8BBA3',
  500: '#97A87A',
  600: '#97A87A',
};

const themeColors = {
  ...Object.fromEntries(
    ['amber', 'blue', 'indigo', 'orange', 'pink', 'purple', 'red', 'rose', 'violet', 'yellow']
      .map((name) => [name, primaryScale])
  ),
  ...Object.fromEntries(
    ['cyan', 'emerald', 'green', 'sky', 'teal']
      .map((name) => [name, sageScale])
  ),
  ...Object.fromEntries(
    ['gray', 'slate', 'zinc']
      .map((name) => [name, neutralScale])
  ),
};

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ...themeColors,
        black: '#44513D',
        white: '#FCF9EA',
        brand: {
          primary: '#DB9558',
          cream: '#FCF9EA',
          sage: '#97A87A',
          'sage-light': '#A8BBA3',
          ink: '#44513D',
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      fontFamily: {
        sans: ['"Manrope"', 'sans-serif'],
        serif: ['"Manrope"', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}