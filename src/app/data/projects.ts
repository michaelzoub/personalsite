import neptume from '/public/neptune3.jpg'

export type Project = {
  id: string
  name: string
  iconType: 'text' | 'image'
  iconText?: string
  iconSrc?: typeof neptume
  iconClassName?: string
  description: string
  hoverDetail: string
  url: string
  buttonText: string
  buttonWidth: string
  arrowPosition: string
  screenshotUrl?: string
  videoUrl?: string
  previewAccent?: string
  category: 'Engineering'
  year: string
}

export const projects: Project[] = [
  {
    id: 'caliga',
    name: 'Caliga',
    iconType: 'text',
    iconText: 'Ca',
    iconClassName: 'bg-[#c47a30] text-white',
    description:
      'A research collective covering crypto, fintech, deep tech, and frontier AI. Research-first, published before pitched.',
    hoverDetail:
      'Research on frontier technology before the market prices it in. Open methodology, adversarial review, and AI-assisted synthesis for founders who want implementation-level diligence.',
    url: 'https://caliga.xyz/',
    buttonText: 'Explore',
    buttonWidth: 'w-[90px]',
    arrowPosition: 'pl-[60px]',
    screenshotUrl: '/caliga-preview.png',
    previewAccent: 'from-amber-500/25 to-orange-700/20',
    category: 'Engineering',
    year: '2026-02-11',
  },
  {
    id: 'coldvision',
    name: 'coldvision',
    iconType: 'text',
    iconText: 'CV',
    iconClassName: 'bg-slate-900 text-cyan-300',
    description:
      'A terminal for prediction markets. Your compass in the storm for researching and acting on market odds.',
    hoverDetail:
      'coldvision pro is a prediction-market terminal built for fast research, odds tracking, and decision-making when markets move quickly.',
    url: 'https://coldvision.xyz/',
    buttonText: 'Explore',
    buttonWidth: 'w-[90px]',
    arrowPosition: 'pl-[60px]',
    screenshotUrl: '/coldvision-preview.png',
    previewAccent: 'from-cyan-400/20 to-slate-800/40',
    category: 'Engineering',
    year: '2026-04-08',
  },
  {
    id: 'rubicon',
    name: 'Rubicon',
    iconType: 'text',
    iconText: 'R',
    iconClassName: 'bg-[#24292f] text-white',
    description:
      'Infrastructure for publishing premium research that autonomous agents can discover, purchase, and read.',
    hoverDetail:
      'Rubicon gives creators a workspace for publishing paid research, tracking agent reads, managing earnings, and settling payouts through programmable payment rails.',
    url: 'https://www.rubiconpay.xyz/',
    buttonText: 'View repo',
    buttonWidth: 'w-[100px]',
    arrowPosition: 'pl-[70px]',
    screenshotUrl: '/rubicon-preview.png',
    videoUrl: '/rubicon-demo.mp4',
    previewAccent: 'from-violet-500/20 to-zinc-800/50',
    category: 'Engineering',
    year: '2026-06-19',
  },
]
