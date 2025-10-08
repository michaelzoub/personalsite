import cev from '/public/cev.jpg'
import umontreal from '/public/umontreal.jpg'
import neptumePrev from '/public/neptume.jpg'
import dlockPrev from '/public/dlockPrev.jpg'
import jwsPrev from '/public/jwsPrev.jpg'
import cyborg from '/public/CYBORG.svg'
import jws from '/public/wen.png'
import earth from '/public/earth.jpg'
import neptume from '/public/neptune3.jpg'

export const projects = [
  {
    id: 'umontreal',
    name: 'uMontreal',
    iconType: 'text',
    iconText: 'uMTL',
    description: "Montreal's event and party destination for university/college students.",
    url: 'https://umontreal.vercel.app/',
    buttonText: 'Explore',
    buttonWidth: 'w-[90px]',
    arrowPosition: 'pl-[60px]',
    screenshotUrl : umontreal
  },
  {
    id: 'neptume',
    name: 'Neptume',
    iconType: 'image',
    iconSrc: neptume,
    description: 'A supercharged crypto wallet that seamlessly integrates multiple chains. Trade, swap, and manage your assets effortlessly with AI-powered intelligence, enhancing your crypto experience at every step.',
    url: 'https://neptume.com/',
    buttonText: 'Explore',
    buttonWidth: 'w-[90px]',
    arrowPosition: 'pl-[60px]',
    screenshotUrl : neptumePrev
  },
  {
    id: 'cev',
    name: 'CEV',
    iconType: 'image',
    iconSrc: earth,
    description: "A crypto exchange visualizer, exchanges with registered locations show up on the map, the stick height shown depends on the daily BTC volume.",
    url: 'https://cryptoexchangevisual.vercel.app/',
    buttonText: 'Explore',
    buttonWidth: 'w-[90px]',
    arrowPosition: 'pl-[60px]',
    screenshotUrl : cev
  },
  {
    id: 'jws',
    name: 'Jws.onl',
    iconType: 'image',
    iconSrc: jws,
    description: 'A web app that tracks job postings from select Wall Street and Big Tech companies and sends out notifications to signed up users on new listings.',
    url: 'https://jws-pi.vercel.app/',
    buttonText: 'Explore',
    buttonWidth: 'w-[90px]',
    arrowPosition: 'pl-[60px]',
    screenshotUrl : jwsPrev
  },
  {
    id: 'dlock',
    name: 'dlock.shop',
    iconType: 'image',
    iconSrc: cyborg,
    description: "Skins market being built for Valve's new third-person shooter Deadlock. Currently a work in progress, some functionalities are being added as you read this.",
    url: 'https://market-two-kappa.vercel.app/',
    buttonText: 'Explore',
    buttonWidth: 'w-[90px]',
    arrowPosition: 'pl-[60px]',
    screenshotUrl : dlockPrev
  }
];