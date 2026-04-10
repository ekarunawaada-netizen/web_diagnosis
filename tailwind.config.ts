import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "on-surface": "#191c1e",
        "secondary-fixed": "#cbe6ff",
        "error-container": "#ffdad6",
        "on-tertiary-fixed": "#2e1500",
        "surface-dim": "#d8dadc",
        "on-tertiary": "#ffffff",
        "secondary": "#21638d",
        "primary-fixed-dim": "#9ecaff",
        "surface-bright": "#f7f9fb",
        "on-error": "#ffffff",
        "primary": "#0061a4",
        "background": "#f7f9fb",
        "on-secondary-fixed-variant": "#004b71",
        "on-primary-fixed-variant": "#00497d",
        "surface-tint": "#0061a4",
        "on-secondary-container": "#105982",
        "surface-container-high": "#e6e8ea",
        "tertiary": "#904d00",
        "secondary-container": "#95cfff",
        "primary-container": "#2196f3",
        "tertiary-fixed-dim": "#ffb77b",
        "surface-container-highest": "#e0e3e5",
        "on-tertiary-fixed-variant": "#6d3900",
        "surface-container-lowest": "#ffffff",
        "on-tertiary-container": "#452200",
        "on-secondary": "#ffffff",
        "on-primary-container": "#002c4f",
        "surface": "#f7f9fb",
        "on-surface-variant": "#404752",
        "tertiary-container": "#db7900",
        "outline": "#707883",
        "error": "#ba1a1a",
        "primary-fixed": "#d1e4ff",
        "inverse-surface": "#2d3133",
        "on-error-container": "#93000a",
        "on-background": "#191c1e",
        "inverse-primary": "#9ecaff",
        "on-primary-fixed": "#001d36",
        "secondary-fixed-dim": "#93cdfc",
        "on-secondary-fixed": "#001e30",
        "tertiary-fixed": "#ffdcc2",
        "inverse-on-surface": "#eff1f3",
        "on-primary": "#ffffff",
        "outline-variant": "#bfc7d4",
        "surface-container": "#eceef0",
        "surface-container-low": "#f2f4f6",
        "surface-variant": "#e0e3e5"
      },
      fontFamily: {
        "headline": ["Manrope", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
};
export default config;
