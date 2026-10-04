import type { Metadata } from 'next'
import Link from 'next/link'
import {
  LuArrowLeft,
  LuBadgeCheck,
  LuBot,
  LuBraces,
  LuMessageSquareText,
  LuPanelsTopLeft,
} from 'react-icons/lu'
import ArticleSectionNav from '@/app/components/ArticleSectionNav'

export const metadata: Metadata = {
  title: 'The Fluid Computer',
  description: 'A proof-learning environment where language, verification, and interface adapt around the student’s reasoning.',
  openGraph: {
    title: 'The Fluid Computer',
    description: 'A proof-learning environment where language, verification, and interface adapt around the student’s reasoning.',
    type: 'article',
    images: ['/writing/fluid-computer/cover.svg'],
  },
}

const sections = [
  { id: 'top', label: 'Introduction' },
  { id: 'background', label: 'Background' },
  { id: 'structure', label: 'From prose to structure' },
  { id: 'verification', label: 'Verification without ceremony' },
  { id: 'interface', label: 'A fluid interface' },
  { id: 'conclusion', label: 'Conclusion' },
]

const requirements = [
  {
    title: 'Natural-language proofs',
    description: 'Students should be able to write mathematical proofs in normal language instead of formal syntax.',
    icon: LuMessageSquareText,
  },
  {
    title: 'Semantic proof understanding',
    description: 'The system should identify meaningful phrases and explain whether each one is an assumption, construction, derivation, or conclusion.',
    icon: LuBraces,
  },
  {
    title: 'Formal verification',
    description: 'Natural-language reasoning should become a formal proof that a verifier can check, while the machinery stays mostly out of the student’s way.',
    icon: LuBadgeCheck,
  },
  {
    title: 'Built-in learning agent',
    description: 'An agent should reason about the proof, the student’s mistakes, their current understanding, and the goal they are working toward.',
    icon: LuBot,
  },
  {
    title: 'Adaptive generative interface',
    description: 'The agent should insert, remove, and rearrange trusted interface components around the student’s goal—not generate arbitrary UI from scratch.',
    icon: LuPanelsTopLeft,
  },
]

export default function FluidComputerArticle() {
  return (
    <main className="article-page fluid-article">
      <ArticleSectionNav sections={sections} />

      <header className="article-hero" id="top">
        <Link href="/" aria-label="Back home" data-sound="none"><LuArrowLeft aria-hidden /> <span>Home</span></Link>
        <p>Project note · September 25, 2026</p>
        <h1>The Fluid Computer</h1>
        <p className="article-deck">A proof-learning environment where language, verification, and interface adapt around the student’s reasoning.</p>
        <div className="article-cover fluid-cover">
          <img src="/writing/fluid-computer/cover.svg" alt="A natural-language proof resolving into a verified formal structure" width={1200} height={480} />
        </div>
      </header>

      <article className="article-body">
        <h2 id="background">Background</h2>
        <p>Mathematical proof is usually taught through two interfaces that do not quite meet. On one side, students write arguments in ordinary language: compact, ambiguous, and full of implied steps. On the other, proof assistants demand a formal language precise enough for a machine to check. The first is natural to think in but difficult to verify. The second is reliable but often makes the notation itself feel like the lesson.</p>
        <p>I started The Fluid Computer from a different premise: the computer should move between those two representations for the student. A learner should be able to explain an argument as they understand it, see the structure the system found, and receive help at the exact point where the reasoning stops holding together.</p>
        <p className="requirements-intro">Some of the basic requirements I wanted in this project:</p>

        <section className="requirements-grid" aria-label="Project requirements">
          {requirements.map(({ title, description, icon: Icon }) => (
            <div className="requirement" key={title}>
              <Icon aria-hidden />
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </section>

        <h2 id="structure">From prose to structure</h2>
        <p>A proof is not a paragraph that happens to contain mathematical words. It is a dependency graph written as prose. A sentence may introduce an assumption, construct an object, apply a theorem, or close a claim. Those roles are often spread across clauses, and the meaning of a later phrase can depend on something established several lines earlier.</p>
        <p>The first job of the system is therefore interpretive. It should group words into meaningful proof units, connect each unit to the statements it depends on, and make that reading visible. The student does not need a wall of parser output. They need to be able to point at a sentence and understand what work it is doing.</p>
        <blockquote>A proof interface should reveal the structure of an argument without replacing the argument with its internal representation.</blockquote>

        <h2 id="verification">Verification without ceremony</h2>
        <p>Explanation alone is not enough. A fluent model can make an invalid step sound convincing, which is precisely the failure mode a proof-learning tool cannot tolerate. The natural-language argument has to compile into a formal representation and pass through a verifier.</p>
        <p>I think of this as a quiet compiler. The student writes prose; the system proposes a structured interpretation; the verifier checks the resulting proof obligations. When something fails, the interface should return to the student’s own words and identify the missing assumption, unsupported inference, or unresolved case. Formal methods remain the source of truth, but they do not have to become the surface area of the product.</p>

        <h2 id="interface">A fluid interface</h2>
        <p>Most learning software fixes the interface before it knows what the learner needs. The same editor, hints, outline, and feedback panels appear for everyone. An agent changes that relationship because it can maintain a model of the proof and a model of the student at the same time.</p>
        <p>If a student is missing a definition, the interface can bring the relevant concept into view. If the proof has the right idea but skips a derivation, it can expose the dependency chain. If the student is ready to work more independently, those supports can recede. The screen becomes fluid around the learning goal.</p>
        <p>That fluidity still needs constraints. I do not want an agent inventing a new interface on every turn. The safer and more legible approach is compositional: give it a small system of well-designed components and let it decide when to insert, remove, or rearrange them. Generative behavior belongs in the orchestration, not in arbitrary pixels.</p>

        <h2 id="conclusion">Conclusion</h2>
        <p>The Fluid Computer is an attempt to make rigor feel less like ceremony. Natural language supplies the medium for thinking, semantic analysis exposes the shape of the argument, formal verification protects correctness, and the learning agent decides what the student should see next.</p>
        <p>The larger idea extends beyond proofs. Computers have traditionally required people to adapt to fixed representations and fixed interfaces. A fluid computer does the reverse: it preserves a trustworthy underlying system while changing how that system is presented, based on the person, the task, and the moment.</p>
      </article>
    </main>
  )
}
