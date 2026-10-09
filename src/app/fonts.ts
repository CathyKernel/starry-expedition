import localFont from 'next/font/local'

export const playfair = localFont({
  src: [
    {
      path: './fonts/PlayfairDisplay-400-normal.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/PlayfairDisplay-400-italic.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: './fonts/PlayfairDisplay-500-normal.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/PlayfairDisplay-600-normal.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/PlayfairDisplay-700-normal.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-playfair',
  display: 'swap',
})

export const cormorant = localFont({
  src: [
    {
      path: './fonts/CormorantGaramond-300-normal.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/CormorantGaramond-400-normal.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/CormorantGaramond-500-normal.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/CormorantGaramond-300-italic.ttf',
      weight: '300',
      style: 'italic',
    },
    {
      path: './fonts/CormorantGaramond-400-italic.ttf',
      weight: '400',
      style: 'italic',
    },
  ],
  variable: '--font-cormorant',
  display: 'swap',
})
