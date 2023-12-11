/** @type {import('tailwindcss').Config} */

import { sand, sandDarkA } from '@radix-ui/colors'

export default {
  content: ['./resources/**/*.{edge,js,ts,jsx,tsx,vue}', './content/**/*.svg'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Instrument Sans'],
        mono: ['DM Mono'],
      },
      boxShadow: {
        card: '0 0 #0000, 0 0 #0000, 0px 2px 4px rgba(44,43,42,.1)',
        timeline: 'rgb(255, 255, 255) 0px 0px 8px 8px',
      },
      fontSize: {
        /**
         * Overrides
         */
        'xs': [
          '13px',
          {
            lineHeight: '1rem',
          },
        ],

        'sm': [
          '15px',
          {
            lineHeight: '1.3rem',
          },
        ],

        'hero': [
          '72px',
          {
            lineHeight: '72px',
            letterSpacing: '-4px',
          },
        ],

        'hero-mobile': [
          '54px',
          {
            lineHeight: '54px',
            letterSpacing: '-2px',
          },
        ],

        'lede': [
          '21px',
          {
            letterSpacing: '-0.2px',
            lineHeight: '30px',
          },
        ],

        'post-title': [
          '62px',
          {
            lineHeight: '70px',
            letterSpacing: '-2.4px',
          },
        ],

        'post-title-mobile': [
          '54px',
          {
            lineHeight: '54px',
            letterSpacing: '-2px',
          },
        ],

        'section-title': [
          '42px',
          {
            lineHeight: '46px',
            letterSpacing: '-1.5px',
          },
        ],

        'section-text': [
          '18px',
          {
            lineHeight: '27px',
          },
        ],

        'subsection-title': [
          '26px',
          {
            lineHeight: '28px',
            letterSpacing: '-0.8px',
          },
        ],

        'subsection-text': [
          '17px',
          {
            lineHeight: '26px',
          },
        ],

        'tabTrigger': [
          '15px',
          {
            lineHeight: '1.3rem',
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
        content: '1056px',
      },

      colors: {
        brand: '#5a45ff',
        sand13: '#0e0d0c',
        ...sand,
        ...sandDarkA,
      },
    },
  },
  plugins: [],
  safelist: [
    {
      pattern: /(bg|text)-(cyan|teal|pink|indigo)-\d/,
    },
  ],
}
