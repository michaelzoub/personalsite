import type { Metadata } from 'next'
import Link from 'next/link'
import { LuArrowLeft, LuArrowUpRight } from 'react-icons/lu'
import ArticleSectionNav from '@/app/components/ArticleSectionNav'

export const metadata: Metadata = {
  title: 'The biggest hurdle to achieving AGI',
  description: 'Why open-ended exploration and uncertainty over objectives matter more than optimizing harder against fixed targets.',
  openGraph: {
    title: 'The biggest hurdle to achieving AGI',
    description: 'Why open-ended exploration and uncertainty over objectives matter more than optimizing harder against fixed targets.',
    type: 'article',
    images: ['/writing/agi/cover.jpg'],
  },
}

const sections = [
  { id: 'top', label: 'Introduction' },
  { id: 'exploration', label: 'Exploration > exploitation' },
  { id: 'uncertainty', label: 'Uncertainty in AI systems' },
  { id: 'collapse', label: 'Collapsing uncertainty' },
  { id: 'conclusion', label: 'Conclusion' },
]

// Intrinsic dimensions reserve each figure's height before the file loads, so
// the page doesn't grow mid-scroll and section-nav jumps land exactly.
const Figure = ({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) => (
  <figure><img src={src} alt={alt} loading="lazy" width={width} height={height} /></figure>
)

export default function AgiArticle() {
  return (
    <main className="article-page">
      <ArticleSectionNav sections={sections} />
      <header className="article-hero" id="top">
        <Link href="/" aria-label="Back home"><LuArrowLeft aria-hidden /> <span>Home</span></Link>
        <p>Essay · June 2, 2026</p>
        <h1>The biggest hurdle to achieving AGI</h1>
        <p className="article-deck">Open-ended exploration and uncertainty over objectives may matter more than simply optimizing harder.</p>
        <div className="article-cover">
          <img src="/writing/agi/cover.jpg" alt="Cover artwork for The biggest hurdle to achieving AGI" width={1120} height={448} />
        </div>
      </header>

      <article className="article-body">
        <p>Most people would be quick to jump in and claim that energy production, compute, or even algorithmic optimization is the bottleneck to truly intelligent systems. I believe it&apos;s something much more abstract, yet foundational.</p>
        <p>Current systems often treat the user prompt as a complete target, then optimize towards an inferred interpretation. But real human tasks are underspecified. Intelligent agents will need two properties at once:</p>
        <ol>
          <li>Open-ended exploration to discover better solutions</li>
          <li>Objective uncertainty to remain aligned with what the user actually wants.</li>
        </ol>
        <p>In order to achieve open-ended exploration, it&apos;s imperative to have long-running agent sessions where sufficiently enough entropy gets introduced during runs. Self-evolving harness loops have been a central interest of mine and look extremely promising in terms of agent output quality for long-running tasks, especially optimization tasks where exploration is surprisingly more efficient than exploitation. Some problems are best solved by methods that ignore the objective.</p>
        <p>Current frontier LLMs are primarily reactive systems. They require externally supplied objectives (inputs) and optimize towards an inferred user intent. Humans, by contrast, are capable of generating objectives internally through curiosity, exploration, and reflection. Therefore I believe AI systems should address any initial uncertainties from the prompt and then approach the problem from a curiosity-driven point of view. In order to maximize the chances of having a useful output, agents should not be afraid to branch off, even if a solution tested against an evaluator is worse than the previous one, this usually leads to better results down the line.</p>
        <Figure src="/writing/agi/01.png" alt="Diagram contrasting optimization and open-ended exploration" width={1200} height={298} />
        <p>I will make a lot of parallels between intelligent biological systems (humans) and intelligent artificial systems since we want to model the latter as closely as possible to the former.</p>

        <h2 id="exploration">Exploration &gt; exploitation</h2>
        <p>I believe current AI systems remain fundamentally constrained by externally specified objectives. For example, humans are very bad at giving concrete and step-by-step goals for machine intelligence to follow. Human-to-human collaboration is oftentimes much more effective because skilled humans are more resourceful and spend time reflecting at every step which oftentimes leads to a different trajectory than what was initially planned. Compared to current AI systems, humans update their trajectory after every new “iteration” of work based on its outcome.</p>
        <p>Across reinforcement learning, bandit problems, evolutionary search, and modern agent systems, empirical evidence consistently shows that balancing exploration and exploitation outperforms prioritizing exploitation in environments with uncertainty, sparse rewards, or incomplete information.</p>
        <Figure src="/writing/agi/02.jpg" alt="Exploration and exploitation comparison" width={1200} height={800} />
        <p>Take Minecraft as an example, if you discover how to craft a wooden pickaxe and use it to mine for cobblestone all the time then you maximized exploitation whilst mostly ignoring exploration. Thanks to exploration, intelligence is able to exploit an environment more effectively by sacrificing short-term gains for long-term returns.</p>
        <p>Intelligent species increase exploration when current strategies are deemed suboptimal. Intelligence with agency should spend more time exploring, less time exploiting, since finding more effective formulas for completing tasks leads to tech tree unlocks, which in turn increases yield.</p>
        <p>In the 2023 Voyager research paper, an AI plays Minecraft and progresses in the game, the researchers made sure the agent maximizes exploration, which yielded much better results than previous ones.</p>
        <Figure src="/writing/agi/03.jpg" alt="Voyager performance in Minecraft" width={1200} height={843} />
        <p>The Voyager project employs a sort of evolutionary harness, on every iteration there&apos;s a prompting mechanism which outputs new actions the agent can do:</p>
        <Figure src="/writing/agi/04.jpg" alt="Voyager iterative prompting mechanism" width={1200} height={675} />
        <p>To better understand what&apos;s happening here, the agent maintains an automatic curriculum that continually generates new tasks near the frontier of its abilities, an iterative prompting mechanism that explores solutions through self-refinement and environmental feedback, and a skill library that acts as long-term memory by storing reusable behaviors discovered during exploration.</p>
        <Figure src="/writing/agi/05.jpg" alt="Voyager automatic curriculum and skill library" width={1200} height={800} />
        <p>In 2021, a research team worked on Go-Explore which is a novel approach for exploration problems. Two Atari games served as benchmarks for intelligent exploration, yet all state-of-the-art models performed poorly. Go-Explore used the following principles:</p>
        <Figure src="/writing/agi/06.png" alt="Go-Explore principles" width={595} height={560} />
        <p>The combined effect of these principles yielded dramatic performance improvements on hard exploration problems. On Montezuma&apos;s Revenge, Go-Explore scored a mean of over 43k points, almost 4 times the previous state of the art.</p>
        <Figure src="/writing/agi/07.png" alt="Go-Explore benchmark results" width={1200} height={450} />
        <p>Additionally, I recently wrote a paper on how automated research will be everywhere, where I claim that evolutionary harnesses will drastically improve agent outputs, and will likely become the golden standard for open-ended tasks. Each iteration should be wildly different from the previous one, yet still built on top of past artifacts.</p>
        <Figure src="/writing/agi/08.png" alt="Automated research paper cover" width={350} height={405} />
        <p>Pure exploration often leads to harder evaluations, unpredictability, and high costs, yet it&apos;s still an under explored domain, especially considering the fact that token costs keep going down.</p>
        <hr />
        <p>Regarding unpredictability (and hard evaluations), having human evaluators is always an option, albeit currently inefficient. However, LMArena has a huge community of curious people judging LLM outputs in 1v1 arenas.</p>
        <p>If humans are constantly evaluated by other humans, why not try the same with artificial beings?</p>
        <Figure src="/writing/agi/09.png" alt="Human evaluation and model comparison diagram" width={1200} height={236} />

        <h2 id="uncertainty">Uncertainty in AI systems</h2>
        <p>As argued earlier, agents should have no trouble completing open-ended tasks, however we still want agents to be guided, we want to give them some level of agency but they should be as aligned as possible. They should reason like humans instead of spitting out random inferences on every iteration from some ambiguous prompt. There&apos;s an inherent disconnect regarding this, current systems resemble this:</p>
        <Figure src="/writing/agi/10.jpg" alt="Current agent reasoning flow" width={1200} height={554} />
        <p>Essentially, agents lack some sort of separation of concerns, like trying to converse with an intelligent humans who takes good guesses about what you want multiple times instead of asking clarifying questions and solidifying his understanding of the goal. The flow agents should follow should resemble this:</p>
        <p>Where multiple iterations of this exact reasoning run repeatedly.</p>
        <p>This is similar to existing observations, engineers at Google worked on ReAct which synergizes reasoning and acting in models:</p>
        <p>ReAct performed much better on benchmarks compared to past methods:</p>
        <Figure src="/writing/agi/11.jpg" alt="ReAct benchmark performance" width={1200} height={1020} />
        <p>And new agents have increasingly been becoming more capable, here&apos;s a self-evolving harness absolutely destroying benchmarks:</p>
        <Figure src="/writing/agi/12.jpg" alt="Self-evolving agent benchmark results" width={1200} height={675} />
        <p>Furthermore, if the agent is certain about the wrong objective, it will optimize the wrong thing harder. If it is uncertain, it has reason to ask, observe, defer, and update.</p>

        <h2 id="collapse">AI systems collapse uncertainty too early</h2>
        <p>A fundamental problem is that predictions are static, the model is not literally obeying an instruction, it&apos;s producing behavior shaped by pre-training, fine-tuning, reinforcement learning, prompting, tool context, and inference-time constraints. This essentially means that an AI model doesn&apos;t actually “follow” orders and respects rules, it simply makes predictions based on how it was trained and what was valued. Since exploitation is oftentimes prized in lab environments, a lot of the most capable models are extremely eager to finish tasks early, or exploit already working formulas instead of taking leaps which lead to worse local scores but might improve results down the line.</p>
        <Figure src="/writing/agi/13.jpg" alt="Benchmark optimization and model behavior" width={1200} height={510} />
        <p>This is exactly why indirectly giving training models access to benchmark data leads to empirically better results but doesn&apos;t necessarily indicate an improvement in real world tasks. Hence why new benchmarks try to counter saturation in models.</p>
        <p>Frontier AI development is increasingly benchmark-driven, and benchmark-driven optimization naturally favors exploitation of known evaluation distributions over open-ended discovery.</p>
        <hr />
        <p>If improvements continue while the benchmark becomes less discriminative, optimization pressure is increasingly being spent on benchmark-specific knowledge, evaluation artifacts, and distribution-specific patterns rather than broadly useful capabilities.</p>
        <p>Additionally, the more capable models are better at exploiting flaws in objectives and evaluations. <strong>Goodhart&apos;s law states that when a measure becomes a target it ceases to be a good measure.</strong></p>
        <Figure src="/writing/agi/14.png" alt="Goodhart's law and objective exploitation" width={1200} height={740} />
        <p>Stuart Russell’s theory of beneficial AI gives a formal frame for this problem. In the standard model, an AI system is given a fixed objective and is judged by how well it optimizes that objective. Russell argues that this is dangerous because humans rarely specify what they actually mean. The alternative is not goal-less AI, but AI with uncertainty over its objective. A useful agent should treat the user’s request as evidence about an underlying preference, not as a complete specification. This uncertainty should make the system ask clarifying questions, defer when needed, and update its plan as it learns more about the user’s intent, hence the need for an evolutionary component to be paired up with a model (in this case an evolutionary harness).</p>
        <blockquote>“Machines are beneficial to the extent that their actions can be expected to achieve our objectives.”<cite>Stuart Russell</cite></blockquote>

        <h2 id="conclusion">Conclusion</h2>
        <p>Current frontier labs are doing a great job at building a product that&apos;s useful to most people and yields the most profit. However, if we want to get closer towards truly intelligent systems we need to backtrack and have new labs train models which prioritize exploration and preserve uncertainty until sufficient proof exists. Agents should possess evolutionary harnesses, which should in theory lead to longer task duration and more self-reflection, which should in turn lead to better results.</p>
        <footer><a href="https://arxiv.org/abs/2305.16291" target="_blank" rel="noreferrer"><span>View on arXiv</span> <LuArrowUpRight aria-hidden /></a></footer>
      </article>
    </main>
  )
}
