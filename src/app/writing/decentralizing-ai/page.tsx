import type { Metadata } from 'next'
import Link from 'next/link'
import { LuArrowLeft, LuArrowUpRight } from 'react-icons/lu'
import ArticleSectionNav from '@/app/components/ArticleSectionNav'

export const metadata: Metadata = {
  title: 'The war against frontier labs: decentralizing AI',
  description: 'Why access to intelligence should remain contestable, and why decentralized training and open weights matter.',
  openGraph: {
    title: 'The war against frontier labs: decentralizing AI',
    description: 'Why access to intelligence should remain contestable, and why decentralized training and open weights matter.',
    type: 'article',
    images: ['/writing/decentralizing-ai/cover.jpg'],
  },
}

const sections = [
  { id: 'top', label: 'Introduction' },
  { id: 'central-risk', label: 'The central risk' },
  { id: 'current-market', label: 'The current market' },
  { id: 'dethrone', label: 'How to dethrone the hegemon' },
  { id: 'conclusion', label: 'Conclusion' },
]

export default function DecentralizingAiArticle() {
  return <main className="article-page">
    <ArticleSectionNav sections={sections} />
    <header className="article-hero" id="top">
      <Link href="/" aria-label="Back home"><LuArrowLeft aria-hidden /> <span>Home</span></Link>
      <p>Essay · June 14, 2026</p>
      <h1>The war against frontier labs: decentralizing AI</h1>
      <p className="article-deck">Access to intelligence should not depend on a few labs, clouds, distribution platforms, and governments.</p>
      <div className="article-cover">
        <img src="/writing/decentralizing-ai/cover.jpg" alt="Cover for The war against frontier labs: decentralizing AI" width={1200} height={480} />
      </div>
    </header>

    <article className="article-body">
      <p>If you follow frontier AI, the Fable 5 episode should bother you.</p>
      <p>Anthropic released one of the most capable models available to the public. Within days, access was restricted after the U.S. government intervened over national-security and export-control concerns. Whether that decision was justified is a separate debate. The important part is the shape of the current system: a model used by millions can disappear, or become geographically gated, through decisions made by a very small number of companies and actors.</p>

      <h2 id="central-risk">The central risk</h2>
      <p>Access to intelligence is becoming dependent on a few labs, a few clouds, a few distribution platforms, and a few governments. That should concern everyone involved, including consumers.</p>
      <p>As we know it, there are two labs capable enough to consistently release frontier models that compete with each other. Thanks to that, users are free to choose between two very capable models. The more competition there is at the frontier of AI, the better it is for users. Token prices drop and it becomes much harder to restrict access to a select few.</p>
      <p><em>Now here&apos;s a thought experiment: what if there was only one lab that led AI development?</em></p>
      <p>One lab at the frontier would have much more pricing power. Monopolies are hard to bring down. We do not want this to happen, so we need to change the trajectory of current model training and infrastructure.</p>
      <p>The lab would have the liberty to choose who has access to frontier models, a very dangerous tool if it falls into the wrong hands.</p>
      <blockquote>He who controls the spice controls the universe.<cite>Frank Herbert</cite></blockquote>
      <p>These dynamics resemble the concentration crypto was meant to prevent, but the stakes are higher. If access to intelligence is restricted, whoever holds the key holds leverage over everyone downstream of it.</p>
      <p>This is why I believe in the crypto ethos applied to AI development: decentralizing AI.</p>
      <p>Decentralized training pools idle compute from many machines over the internet to train a model collaboratively, rather than inside a single company&apos;s data center. It matters because these networks stay associated with open weights. With enough scale, we could see decentralized open-weight models trailing the frontier, or even competing with it.</p>

      <h2 id="current-market">The issue with the current market</h2>
      <p>Most people overestimate how often they need the absolute frontier. They pay for premium subscriptions for technology that could be very cheap otherwise. Some open-weight models offer very competitive prices, and users can run models locally. Regarding agents, users can also run open-source harnesses such as Hermes locally.</p>
      <p>In past posts I claimed that most people should not pay for frontier models. I still agree, and I still believe that even decentralized models will cost money because inference for trillion-parameter models is expensive. But society benefits when frontier access is contestable.</p>
      <p>The ceiling on prices rises and the floor on access drops unless diffusion fights back. It is in our hands to make open weights and decentralized training contestable against the frontier, preventing the gap from widening until one lab sets the terms.</p>
      <p>Do not get me wrong: Claude and ChatGPT are great providers, and the capabilities are there. Regular users have free access to very good models and can choose to subscribe for frontier access. Frontier labs subsidize subscriptions heavily; for most users, a $20 plan delivers far more usage than the same spend on API calls.</p>
      <p>Centralized training is also more governable. Labs with good taste can make models more aligned. That becomes much harder for decentralized runs, where accountability, evaluations, provenance, and safety interventions are more difficult.</p>
      <p>However, the positives do not outweigh the negatives of relying on closed-weight frontier labs. In previous free markets, intelligence was technically available to everyone: money could buy brains, but so could ideas, trajectory, and conviction. With AI, even the most dangerous ideas can ship with a competent execution layer. It is natural to be sceptical about frontier labs&apos; true intentions, especially when only a few exist.</p>
      <p>Revenue at frontier labs flows from enterprise and consumer customers. A large share of Anthropic&apos;s API revenue runs through a few developer tools. The chokepoint is not just one lab serving everyone; it is one lab whose economics depend on a thin band of downstream buyers. As revenue keeps climbing, it gets harder for other labs to catch up.</p>

      <h2 id="dethrone">How to dethrone the hegemon</h2>
      <p>I am an avid DeFi user and crypto believer. Crypto gives anyone in the world access to safe and provable finances and mitigates banks&apos; influence on consumers. Take Ethereum: the second-largest token by market capitalization and the most decentralized chain by validators.</p>
      <p>Ethereum is the first decentralized system that ran at massively parallel scale and still functions to this day. Validators each have votes, and hundreds of thousands of nodes exist throughout the planet, preventing control over the network by a single actor.</p>
      <p>A similar ideal could be applied to AI: performant models can be trained by anyone, compute is decentralized and widely accessible at free-market prices, and inference is not locked behind frontier-lab APIs.</p>
      <p>Decentralized training has been gaining momentum. Hundreds of millions in funding now back it: 0G Labs raised $290M, Prime Intellect $70M, Nous $65M from Paradigm at a $1B valuation, and Gensyn $50M from a16z crypto.</p>
      <p>However, open-weight models still lag frontier models by roughly four months. It would take hundreds of times more nodes for the current largest decentralized network to compete with frontier data centers. Could decentralized open-weight models one day trail even closer behind frontier ones?</p>
      <p>We wonder whether decentralized training is feasible at large scale. The data points to yes. A lot of compute throughout the world is under-utilized. If decentralized training runs had $30B worth of infrastructure—the same order as the Bitcoin network—we would have enough for a gigawatt data center capable of a frontier-scale run today.</p>
      <p>To support that trajectory, it is important to stand behind builders bridging decentralization and AI. Nous Research works on open-source AI, from Hermes agents to models. They spearheaded Psyche, which democratizes access to model development and prevents a single entity from deciding what alignment an AI has.</p>
      <p>Prime Intellect offers inexpensive, open infrastructure for reinforcement-learning training. Their philosophy is that frontier labs should not control intelligence; consumers should.</p>
      <p>The crypto ethos is worth defending. As consumers with little leverage, the move is to back these teams: collaborate, work there, or contribute to open source. Do we want a world where a select few set the terms for everyone, or one with real alternatives?</p>

      <h2 id="conclusion">Conclusion</h2>
      <p>Leaving intelligence in the hands of a few is arguably even more dangerous than leaving capital in the hands of a few. The former is leverage for much more than money. If we achieve AGI, I believe decentralizing it is a better trajectory than leaving it in the hands of a small number of companies and states.</p>
      <footer><a href="https://x.com/wenkafka/status/2066170830191530243" target="_blank" rel="noreferrer"><span>View original on X</span> <LuArrowUpRight aria-hidden /></a></footer>
    </article>
  </main>
}
