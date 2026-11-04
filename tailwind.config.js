/** @type {import('tailwindcss').Config} */
const primaryScale = {
  50: '#FCF9EA',
  100: '#FCF9EA',
  200: '#A8BBA3',
  300: '#A8BBA3',
  400: '#FE7A25',
  500: '#FE7A25',
  600: '#006732',
  700: '#064734',
  800: '#064734',
  900: '#064734',
  950: '#064734',
};

const orangeScale = {
  50: '#FFF1E7',
  100: '#FFE2CC',
  200: '#FFC399',
  300: '#FFA366',
  400: '#FE7A25',
  500: '#FE7A25',
  600: '#FE7A25',
  700: '#FE7A25',
  800: '#FE7A25',
  900: '#FE7A25',
  950: '#FE7A25',
};

const sageScale = {
  ...primaryScale,
  400: '#006732',
  500: '#006732',
  600: '#006732',
  700: '#064734',
  800: '#064734',
  900: '#064734',
  950: '#064734',
};

const neutralScale = {
  ...primaryScale,
  400: '#202B27',
  500: '#202B27',
  600: '#202B27',
  700: '#202B27',
  800: '#202B27',
  900: '#202B27',
  950: '#202B27',
};

const themeColors = {
  ...Object.fromEntries(
    ['blue', 'indigo', 'pink', 'purple', 'red', 'rose', 'violet', 'yellow']
      .map((name) => [name, primaryScale])
  ),
  ...Object.fromEntries(
    ['amber', 'orange']
      .map((name) => [name, orangeScale])
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
        black: '#202B27',
        white: '#FCF9EA',
        brand: {
          primary: '#064734',
          orange: '#FE7A25',
          cream: '#FCF9EA',
          sage: '#006732',
          'sage-light': '#A8BBA3',
          ink: '#202B27',
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