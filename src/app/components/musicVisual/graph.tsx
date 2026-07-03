'use client'

import R3fForceGraph from 'r3f-forcegraph'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { TrackballControls } from '@react-three/drei'
import { useCallback, useMemo, useRef, useState } from 'react'
import { BoxGeometry, DoubleSide, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, TextureLoader } from 'three'
import SpriteText from 'three-spritetext'
import { AnimatePresence, motion } from 'motion/react'

type Genre = 'Electronic' | 'Rap' | 'Techno' | 'Ambient' | 'Jazz'
type Track = { id: string; title: string; artist: string; genre: Genre; cover: string; x: number; y: number; z: number }

const tracks: Track[] = [
  { id:'503CQq3Z1eR2ZzZ8FElDLe',title:'Versions',artist:'Moderat',genre:'Electronic',cover:'/music-covers/versions.jpg',x:-38,y:105,z:4 },
  { id:'4x94qgTeMEcwj4X1APUnpb',title:'Girl',artist:'Jamie xx',genre:'Electronic',cover:'/music-covers/girl.jpg',x:-12,y:124,z:-3 },
  { id:'53oC9lu6vxNkNpSN9J8dIT',title:'Keep You Kimi',artist:'Hird, Yukimi Nagano',genre:'Electronic',cover:'/music-covers/keep-you-kimi.jpg',x:20,y:108,z:5 },
  { id:'1IKnkAtTKion90wF8yxSgS',title:'Bunsen Burner',artist:'CUTS',genre:'Electronic',cover:'/music-covers/bunsen-burner.jpg',x:43,y:128,z:-6 },
  { id:'23QqbCvExT7Jwg71cDlStV',title:'CLOUDS',artist:'Selected listening',genre:'Electronic',cover:'/music-covers/clouds.jpg',x:10,y:80,z:8 },
  { id:'1KLP2LBTFyc5kQEgpdHFGx',title:'Monolith',artist:'Benjamin Damage',genre:'Techno',cover:'/music-covers/monolith.jpg',x:-28,y:45,z:-4 },
  { id:'6yaEXgF7LRroaqYHLOO1c4',title:'Encipher & Decipher',artist:'Barker & Baumecker',genre:'Techno',cover:'/music-covers/encipher.jpg',x:27,y:38,z:5 },
  { id:'3JpzqRcjxif901JZKAPLn6',title:'Mos 6581',artist:'Carbon Based Lifeforms',genre:'Ambient',cover:'/music-covers/mos-6581.jpg',x:-42,y:-8,z:6 },
  { id:'3GpsyvuiF20J0HebEEpgXy',title:'Artificial Island',artist:'Carbon Based Lifeforms',genre:'Ambient',cover:'/music-covers/artificial-island.jpg',x:-10,y:-25,z:-5 },
  { id:'1WWWfx7SyPJEbLCJKt2mpa',title:'M',artist:'Carbon Based Lifeforms',genre:'Ambient',cover:'/music-covers/m.jpg',x:23,y:-7,z:7 },
  { id:'1Ooxm7WoFLrzibkyRj8xin',title:'Photosynthesis',artist:'Carbon Based Lifeforms',genre:'Ambient',cover:'/music-covers/photosynthesis.jpg',x:44,y:-32,z:-4 },
  { id:'09riz9pAPJyYYDVynE5xxY',title:'1000 Blunts',artist:'$uicideboy$',genre:'Rap',cover:'/music-covers/1000-blunts.jpg',x:-26,y:-75,z:5 },
  { id:'4IU33qQwEkfP7rxlPc73UA',title:'Chopper',artist:'Lupe Fiasco',genre:'Rap',cover:'/music-covers/chopper.jpg',x:30,y:-82,z:-5 },
  { id:'3nTQL2ScjeyOxjqSmDoCCr',title:'Timeless',artist:'John Abercrombie',genre:'Jazz',cover:'/music-covers/timeless.jpg',x:0,y:-137,z:4 },
]

const genrePositions: Record<Genre,{x:number;y:number;z:number}> = {
  Electronic:{x:0,y:104,z:0}, Techno:{x:0,y:48,z:0}, Ambient:{x:0,y:-7,z:0}, Rap:{x:0,y:-78,z:0}, Jazz:{x:0,y:-120,z:0},
}
const genres = Object.keys(genrePositions) as Genre[]

function GraphScene({ onSelect }: { onSelect:(track:Track)=>void }) {
  const graph = useRef<any>(null)
  const cards = useRef(new Map<string, Group>())
  const { camera, gl } = useThree()
  const loader = useMemo(() => new TextureLoader(), [])
  const maxAnisotropy = useMemo(() => gl.capabilities.getMaxAnisotropy(), [gl])
  useFrame(() => {
    graph.current?.tickFrame()
    cards.current.forEach((card) => card.quaternion.copy(camera.quaternion))
  })

  const data = useMemo(() => {
    const nodes = [
      ...genres.map((genre) => ({ id:`genre-${genre}`, genre, kind:'genre', x:genrePositions[genre].x, y:genrePositions[genre].y, z:genrePositions[genre].z * 5 })),
      ...tracks.map((track) => ({ id:track.id, genre:track.genre, kind:'track', x:track.x * 1.85, y:track.y, z:track.z * 5 })),
    ]
    const links = tracks.map((track) => ({ source:`genre-${track.genre}`, target:track.id }))
    const cross = [
      ['genre-Electronic','genre-Techno'],['genre-Techno','genre-Ambient'],['genre-Ambient','genre-Rap'],['genre-Rap','genre-Jazz'],
      [tracks[0].id,tracks[5].id],[tracks[1].id,tracks[8].id],[tracks[4].id,tracks[10].id],[tracks[6].id,tracks[11].id],[tracks[9].id,tracks[13].id],
      [tracks[2].id,tracks[7].id],[tracks[3].id,tracks[6].id],[tracks[7].id,tracks[12].id],
      [tracks[0].id,tracks[2].id],[tracks[0].id,tracks[4].id],[tracks[1].id,tracks[3].id],[tracks[1].id,tracks[5].id],
      [tracks[2].id,tracks[6].id],[tracks[4].id,tracks[8].id],[tracks[5].id,tracks[8].id],[tracks[5].id,tracks[9].id],
      [tracks[6].id,tracks[10].id],[tracks[7].id,tracks[9].id],[tracks[8].id,tracks[10].id],[tracks[9].id,tracks[11].id],
      [tracks[10].id,tracks[12].id],[tracks[11].id,tracks[12].id],[tracks[11].id,tracks[13].id],[tracks[12].id,tracks[13].id],
    ].map(([source,target]) => ({ source,target }))
    return { nodes, links:[...links,...cross] }
  }, [])

  const makeNode = useCallback((node:any) => {
    if (node.kind === 'genre') {
      const label = new SpriteText(node.genre)
      label.color = '#111111'
      label.textHeight = 4.2
      label.fontWeight = '600'
      label.material.depthWrite = false
      return label
    }
    const track = tracks.find((item) => item.id === node.id)!
    const group = new Group()
    const texture = loader.load(track.cover)
    texture.colorSpace = 'srgb'
    texture.anisotropy = maxAnisotropy
    const body = new Mesh(
      new BoxGeometry(22,22,1.6),
      new MeshStandardMaterial({ color:'#e7e4de', roughness:.48, metalness:.06 }),
    )
    group.add(body)
    const cover = new Mesh(
      new PlaneGeometry(20.8,20.8),
      new MeshBasicMaterial({ map:texture, side:DoubleSide }),
    )
    cover.position.z = 1.05
    group.add(cover)
    cards.current.set(track.id, group)
    const label = new SpriteText(track.title)
    label.color = '#111111'
    label.backgroundColor = 'rgba(250,250,250,.9)'
    label.padding = 1.2
    label.borderRadius = 2
    label.textHeight = 2.7
    label.position.set(0,-13.5,0)
    label.material.depthWrite = false
    group.add(label)
    return group
  }, [loader, maxAnisotropy])

  return <R3fForceGraph
    ref={graph}
    graphData={data}
    numDimensions={3}
    d3AlphaDecay={.012}
    d3VelocityDecay={.18}
    warmupTicks={0}
    cooldownTime={18000}
    nodeThreeObject={makeNode}
    linkColor={() => '#191919'}
    linkWidth={.22}
    linkOpacity={.62}
    linkDirectionalParticles={1}
    linkDirectionalParticleWidth={.45}
    linkDirectionalParticleSpeed={.0025}
    onNodeClick={(node:any) => { const track = tracks.find((item) => item.id === node.id); if (track) onSelect(track) }}
  />
}

export default function Graph() {
  const [selected,setSelected] = useState<Track|null>(null)
  return <section className="simple-music dense-music-graph">
    <p className="music-hint">Drag to explore · Scroll to zoom · Select artwork to listen</p>
    <div className="simple-music-canvas">
      <Canvas flat dpr={[1, 2]} camera={{ position:[78,48,245], far:3000 }}>
        <color attach="background" args={['#fafcff']} />
        <ambientLight intensity={2.2} />
        <directionalLight position={[90,110,160]} intensity={3.4} />
        <directionalLight position={[-80,-40,-100]} intensity={1.1} />
        <TrackballControls rotateSpeed={3.2} panSpeed={1.1} zoomSpeed={1.25} dynamicDampingFactor={.14} />
        <GraphScene onSelect={setSelected} />
      </Canvas>
      <AnimatePresence mode="wait">
        {selected && <motion.aside key={selected.id} className="track-panel simple-track-panel" initial={{opacity:0,transform:'translateY(8px) scale(.98)'}} animate={{opacity:1,transform:'translateY(0) scale(1)'}} exit={{opacity:0,transform:'translateY(5px) scale(.98)'}} transition={{duration:.18,ease:[.23,1,.32,1]}}>
          <div className="track-meta"><img src={selected.cover} alt="" /><div><small>{selected.genre}</small><h2>{selected.title}</h2><p>{selected.artist}</p></div><button onClick={() => setSelected(null)} aria-label="Close player">×</button></div>
          <iframe title={`Listen to ${selected.title}`} src={`https://open.spotify.com/embed/track/${selected.id}`} width="100%" height="80" allow="encrypted-media" loading="lazy" />
        </motion.aside>}
      </AnimatePresence>
    </div>
  </section>
}
