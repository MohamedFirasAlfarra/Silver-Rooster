module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        tertiary: {
          DEFAULT: "hsl(var(--tertiary))",
          foreground: "hsl(var(--tertiary-foreground))",
        },
        neutral: {
          DEFAULT: "hsl(var(--neutral))",
          foreground: "hsl(var(--neutral-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        gray: {
          50: "hsl(45, 20%, 98%)",
          100: "hsl(45, 12%, 94%)",
          200: "hsl(45, 8%, 85%)",
          300: "hsl(45, 7%, 75%)",
          400: "hsl(45, 5%, 60%)",
          500: "hsl(45, 4%, 50%)",
          600: "hsl(45, 5%, 40%)",
          700: "hsl(45, 6%, 30%)",
          800: "hsl(45, 7%, 20%)",
          900: "hsl(45, 8%, 12%)",
        },
      },
      fontFamily: {
        sans: ['"Nunito Sans"', 'sans-serif'],
        serif: ['Raleway', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        lg: "12px",
        md: "10px",
        sm: "8px",
      },
      spacing: {
        '4': '1rem',
        '8': '2rem',
        '12': '3rem',
        '16': '4rem',
        '24': '6rem',
        '32': '8rem',
        '48': '12rem',
        '64': '16rem',
      },
      backgroundImage: {
        'gradient-1': 'linear-gradient(135deg, hsl(0, 0%, 40%), hsl(0, 0%, 70%))',
        'gradient-2': 'linear-gradient(135deg, hsl(0, 0%, 50%), hsl(0, 0%, 80%))',
        'button-border-gradient': 'linear-gradient(90deg, hsl(0, 0%, 40%), hsl(0, 0%, 60%))',
      },
    },
  },
  plugins: [],
}
