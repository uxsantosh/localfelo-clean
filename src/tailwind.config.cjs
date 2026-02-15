/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './App.tsx',
    './components/**/*.{js,ts,jsx,tsx}',
    './screens/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Lemon Green & Black Branding
        primary: '#CDFF00',
        'primary-dark': '#B8E600',
        'primary-light': '#DEFF4D',
        'primary-foreground': '#000000',
        
        accent: '#CDFF00',
        'accent-foreground': '#000000',
        'secondary-accent': '#000000',
        'tertiary-accent': '#333333',
        
        // Clean Monochrome Palette
        background: '#F5F5F5',
        'background-alt': '#FAFAFA',
        foreground: '#000000',
        
        card: '#FFFFFF',
        'card-foreground': '#000000',
        
        // Text Colors
        heading: '#000000',
        body: '#333333',
        muted: '#666666',
        'muted-foreground': '#999999',
        
        // Borders
        border: '#F0F0F0',
        'border-light': '#F5F5F5',
        input: '#FFFFFF',
        'input-border': '#E0E0E0',
        'input-focus': '#CDFF00',
        
        // Semantic Colors
        destructive: '#FF3B30',
        'destructive-foreground': '#FFFFFF',
        success: '#34C759',
        'success-foreground': '#FFFFFF',
        warning: '#FF9500',
        'warning-foreground': '#FFFFFF',
        info: '#007AFF',
        'info-foreground': '#FFFFFF',
        
        secondary: '#F5F5F5',
        'secondary-foreground': '#000000',
        
        popover: '#FFFFFF',
        'popover-foreground': '#000000',
        
        ring: '#CDFF00',
      },
      borderRadius: {
        // Flat Design - 4px Radius Everywhere
        sm: '4px',
        md: '4px',
        lg: '4px',
        xl: '4px',
        '2xl': '4px',
        '3xl': '4px',
        full: '9999px',
      },
    },
  },
  plugins: [],
};
