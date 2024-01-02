/** @type {import('tailwindcss').Config} */

/**
 * Convert Radix colors to their CSS variable reference. This way
 * we can use p3 color scales, which it not possible via JS API
 * and Tailwind.
 */
function colorsToVars(tailwindShade, radixShade) {
  return new Array(12).fill(0).reduce((result, _, index) => {
    result[`${tailwindShade}${index + 1}`] = `var(--${radixShade}${index + 1})`
    return result
  }, {})
}

export default {
  content: ['./resources/**/*.{edge,js,ts,jsx,tsx,vue}', './content/**/*.svg'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Instrument Sans'],
        mono: ['DM Mono'],
      },

      boxShadow: {
        card: '0 0 0 1px #0101370f,0 8px 40px #0000000d,0 12px 32px -16px #0101370f',
      },

      fontSize: {
        /**
         * Overrides
         */
        'sm': [
          '15px',
          {
            lineHeight: '22px',
          },
        ],

        'hero': [
          '62px',
          {
            lineHeight: '62px',
            letterSpacing: '-2px',
          },
        ],

        'hero-small': [
          '52px',
          {
            lineHeight: '52px',
            letterSpacing: '-1.5px',
          },
        ],

        'hero-mobile': [
          '48px',
          {
            lineHeight: '48px',
            letterSpacing: '-1.5px',
          },
        ],

        'lede': [
          '20px',
          {
            letterSpacing: '-0.1px',
            lineHeight: '30px',
          },
        ],

        'lede-small': [
          '18px',
          {
            lineHeight: '28px',
          },
        ],

        'section-title': [
          '46px',
          {
            lineHeight: '50px',
            letterSpacing: '-1.8px',
          },
        ],

        'section-text': [
          '18px',
          {
            lineHeight: '27px',
          },
        ],

        'pre': [
          '15px',
          {
            lineHeight: '24px',
          },
        ],
      },

      maxWidth: {
        content: '1104px',
      },

      colors: {
        brand: '#5a45ff',
        sand13: 'color(display-p3 0.05 0.06 0.06)',
        ...colorsToVars('sand', 'sand-'),
        ...colorsToVars('sanda', 'sand-a'),
      },

      saturate: {
        110: '1.1',
      },

      contrast: {
        88: '.88',
      },
    },
  },
  safelist: [
    {
      pattern: /(bg|text)-(cyan|teal|pink|indigo)-\d/,
    },
  ],
}
