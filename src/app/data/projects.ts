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
  status: string
}

export const projects: Project[] = [
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
    status: 'active',
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
    status: 'active',
  },
  {
    id: 'research-agent',
    name: 'Research Agent',
    iconType: 'text',
    iconText: 'RA',
    iconClassName: 'bg-slate-100 text-slate-700',
    description:
      'Local research and optimization harness for running agent loops, producing reports, artifacts, timelines, and score improvements.',
    hoverDetail:
      'A guided command-line tool that turns a question or goal into a research or optimization loop, then leaves behind inspectable reports and run artifacts.',
    url: 'https://github.com/michaelzoub/research-agent',
    buttonText: 'View repo',
    buttonWidth: 'w-[100px]',
    arrowPosition: 'pl-[70px]',
    screenshotUrl: '/research-agent-preview.png',
    previewAccent: 'from-slate-200/30 to-blue-200/20',
    category: 'Engineering',
    year: '2026-07-05',
    status: 'in progress',
  },
]
