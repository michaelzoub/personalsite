'use client'

import R3fForceGraph from 'r3f-forcegraph'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { TrackballControls } from '@react-three/drei'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BoxGeometry, DoubleSide, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, TextureLoader } from 'three'
import SpriteText from 'three-spritetext'
import { motion, useReducedMotion } from 'motion/react'
import { playUiSound } from '../sound'

type Genre = 'Electronic' | 'Rap' | 'Techno' | 'Ambient' | 'Jazz' | 'Indie' | 'R&B'
type Track = { id: string; title: string; artist: string; genre: Genre; cover: string }

const tracks: Track[] = [
  { id:'503CQq3Z1eR2ZzZ8FElDLe',title:'Versions',artist:'Moderat',genre:'Electronic',cover:'/music-covers/versions.jpg' },
  { id:'4x94qgTeMEcwj4X1APUnpb',title:'Girl',artist:'Jamie xx',genre:'Electronic',cover:'/music-covers/girl.jpg' },
  { id:'53oC9lu6vxNkNpSN9J8dIT',title:'Keep You Kimi',artist:'Hird, Yukimi Nagano',genre:'Electronic',cover:'/music-covers/keep-you-kimi.jpg' },
  { id:'1IKnkAtTKion90wF8yxSgS',title:'Bunsen Burner',artist:'CUTS',genre:'Electronic',cover:'/music-covers/bunsen-burner.jpg' },
  { id:'23QqbCvExT7Jwg71cDlStV',title:'CLOUDS',artist:'Selected listening',genre:'Electronic',cover:'/music-covers/clouds.jpg' },
  { id:'1KLP2LBTFyc5kQEgpdHFGx',title:'Monolith',artist:'Benjamin Damage',genre:'Techno',cover:'/music-covers/monolith.jpg' },
  { id:'6yaEXgF7LRroaqYHLOO1c4',title:'Encipher & Decipher',artist:'Barker & Baumecker',genre:'Techno',cover:'/music-covers/encipher.jpg' },
  { id:'3JpzqRcjxif901JZKAPLn6',title:'Mos 6581',artist:'Carbon Based Lifeforms',genre:'Ambient',cover:'/music-covers/mos-6581.jpg' },
  { id:'3GpsyvuiF20J0HebEEpgXy',title:'Artificial Island',artist:'Carbon Based Lifeforms',genre:'Ambient',cover:'/music-covers/artificial-island.jpg' },
  { id:'1WWWfx7SyPJEbLCJKt2mpa',title:'M',artist:'Carbon Based Lifeforms',genre:'Ambient',cover:'/music-covers/m.jpg' },
  { id:'1Ooxm7WoFLrzibkyRj8xin',title:'Photosynthesis',artist:'Carbon Based Lifeforms',genre:'Ambient',cover:'/music-covers/photosynthesis.jpg' },
  { id:'09riz9pAPJyYYDVynE5xxY',title:'1000 Blunts',artist:'$uicideboy$',genre:'Rap',cover:'/music-covers/1000-blunts.jpg' },
  { id:'4IU33qQwEkfP7rxlPc73UA',title:'Chopper',artist:'Lupe Fiasco',genre:'Rap',cover:'/music-covers/chopper.jpg' },
  { id:'3nTQL2ScjeyOxjqSmDoCCr',title:'Timeless',artist:'John Abercrombie',genre:'Jazz',cover:'/music-covers/timeless.jpg' },
  { id:'3X4dCNeVxPCqiRfyB5hJeH',title:'Paradise Engineering',artist:'Barker',genre:'Electronic',cover:'/music-covers/paradise-engineering.jpg' },
  { id:'4U84eaax6nGQ18iPZDQhb3',title:'Love Is A Battlefield',artist:'Barker & Baumecker',genre:'Techno',cover:'/music-covers/love-is-a-battlefield.jpg' },
  { id:'0KeqW4my39At2Ke1mVFYBF',title:'Princess Mononoke Theme Song',artist:'Joe Hisaishi',genre:'Ambient',cover:'/music-covers/princess-mononoke.jpg' },
  { id:'3sL6a6Wi6wdmPjtQAS207O',title:'Daybreak',artist:"Albrecht La'Brooy, Oliver Paterson",genre:'Ambient',cover:'/music-covers/daybreak.jpg' },
  { id:'4mraRJO2iZA5WQ5dxlSQx9',title:'Heather',artist:'Billy Cobham',genre:'Jazz',cover:'/music-covers/heather.jpg' },
  { id:'43QCD6bZmZZEfalvVoQNJ2',title:'When You Come Home',artist:'Marie Therese',genre:'Jazz',cover:'/music-covers/when-you-come-home.jpg' },
  { id:'6NLRMu1qF1kJQnntDNWDmy',title:'Lemon Glow',artist:'Beach House',genre:'Indie',cover:'https://i.scdn.co/image/ab67616d0000b2730af2276ae66a42e73eb07683' },
  { id:'2ZIaH69kaz55RM4Pjx6KXl',title:'Two Thousand and Seventeen',artist:'Four Tet',genre:'Ambient',cover:'https://i.scdn.co/image/ab67616d0000b2733f31769b727102837cb32a63' },
  { id:'5i0EqAX50KcKNgMDMHZndM',title:'Movement 6',artist:'Floating Points, Pharoah Sanders, London Symphony Orchestra',genre:'Jazz',cover:'https://i.scdn.co/image/ab67616d0000b2738718f18aca81c2f4961946f4' },
  { id:'1b6WrQoPSFnfNeDdCTyJm0',title:'K&G Beat',artist:'Floating Points',genre:'Electronic',cover:'https://i.scdn.co/image/ab67616d0000b273b7accac1fcf572e6e5a791c7' },
  { id:'4SFBlxDQvaQlQTGLhPgiEu',title:'Occhi Neri',artist:'The Dining Rooms',genre:'Ambient',cover:'https://i.scdn.co/image/ab67616d0000b2734ccd554a5f7b339b23332e8a' },
  { id:'39eFFeKv7QaTBIukk7TYVu',title:'Summer In The City',artist:'Quincy Jones',genre:'Jazz',cover:'https://i.scdn.co/image/ab67616d0000b2738eebdab9c507b776cfb0298b' },
  { id:'4G3dZN9o3o2X4VKwt4CLts',title:"Passin' Me By",artist:'The Pharcyde',genre:'Rap',cover:'https://i.scdn.co/image/ab67616d0000b2739ec4abd35652fafe34ee7dfb' },
  { id:'76VApg8O41NFKgSFu2wQF9',title:'In Via',artist:'Vril',genre:'Ambient',cover:'https://i.scdn.co/image/ab67616d0000b273b161037ed6b28051cabf5d7f' },
  { id:'1jI6xT7ALnB4HpsJC6aLER',title:'Get The Money',artist:'Dave East, Trouble',genre:'Rap',cover:'https://i.scdn.co/image/ab67616d0000b27378ca46b9125d774ad8dbc66e' },
  { id:'0MXWgfoArZBK01lfhluQsb',title:'Carnival of Souls - Transcode Remix',artist:'Spektre, Transcode',genre:'Techno',cover:'https://i.scdn.co/image/ab67616d0000b273c23e890536e1811c98a72f7a' },
  { id:'7gKldSCb5S2YNtAD0EEWT0',title:'Someday, Sara',artist:'Alex Albrecht',genre:'Electronic',cover:'https://i.scdn.co/image/ab67616d0000b2731819d7290a7e0718400afe7b' },
  { id:'2zWZV7b1xu1qZPaMjavvpS',title:'Mural',artist:'Lupe Fiasco',genre:'Rap',cover:'https://i.scdn.co/image/ab67616d0000b273cc5c6f9f9d6ca3353dbb6c75' },
  { id:'4CiVKhMTI6767xO40Tas0c',title:'Someone Else',artist:'Carlo Whale',genre:'Electronic',cover:'https://i.scdn.co/image/ab67616d0000b273555461c1f5bdd80feb10ebb4' },
  { id:'6RGSnt1KTbukpJ8RoMJHqX',title:'Candy Walls',artist:'TR/ST',genre:'Electronic',cover:'https://i.scdn.co/image/ab67616d0000b27374f60747c0f5408a3c6d2791' },
  { id:'5MRVZcd8AEXUAmLrrYQaiv',title:'Ascension',artist:'Transcode',genre:'Techno',cover:'https://i.scdn.co/image/ab67616d0000b273d0412947f2a519bd4e42ad78' },
  { id:'4cftDFoMLmqq1H7L4vKtiy',title:'Spanish Moss - A Sound Portrait: Savannah the Serene',artist:'Billy Cobham',genre:'Jazz',cover:'https://i.scdn.co/image/ab67616d0000b2734102b2f1e2d9a4e03a1fc0f1' },
  { id:'0yp3TvJNlG50Q4tAHWNCRm',title:'Enjoy the Silence',artist:'Depeche Mode',genre:'Indie',cover:'https://i.scdn.co/image/ab67616d0000b273972ac79d249efed1c7b2c8c1' },
  { id:'6GylfygyT10IRWb1sITlwR',title:'Refraction 1.33',artist:'Carbon Based Lifeforms',genre:'Ambient',cover:'https://i.scdn.co/image/ab67616d0000b273ab1de7a28d96c3044b7c2dd0' },
  { id:'3VnFEw7QY1kDjU5I0VSFPf',title:'Простужен',artist:'FORTUNA 812, madk1d',genre:'Electronic',cover:'https://i.scdn.co/image/ab67616d0000b2736bb2fda101e82a5d64347352' },
  { id:'6UwYHPRnrv4Glcp74tiP9B',title:'Rivet Gun',artist:'Mother Soki',genre:'Indie',cover:'https://i.scdn.co/image/ab67616d0000b273f951aae4ac1b3581c5911850' },
  { id:'5Yc2SVCeXXcDdALmmXIslb',title:'Is It True - Four Tet Remix',artist:'Tame Impala, Four Tet',genre:'Indie',cover:'https://i.scdn.co/image/ab67616d0000b273fa7a70488b4f92bab4fc207b' },
  { id:'0XkDSuAMyMJjwVvHj4ELKc',title:'Passage',artist:'Esteble',genre:'Ambient',cover:'https://i.scdn.co/image/ab67616d0000b273f2f68b33c02153fb58e46207' },
  { id:'5dEyr2b9HMqiTJXFBCQGsv',title:'Vortex',artist:'Carbon Based Lifeforms',genre:'Ambient',cover:'https://i.scdn.co/image/ab67616d0000b273c797d768e78fdd098f397cb2' },
  { id:'2TwenK28594qaIPQ86DYS5',title:'Basic Instinct (feat. G Perico)',artist:'Nipsey Hussle, G Perico',genre:'Rap',cover:'https://i.scdn.co/image/ab67616d0000b273dbffe7c058602c34ccd27dca' },
  { id:'6ZIS9UgkzVPlFG5pIpGsJo',title:'The Unexpected Visitor - CBL Carbonator Remix',artist:'Shulman',genre:'Ambient',cover:'https://i.scdn.co/image/ab67616d0000b27315930acc6a2c35514d1dce0e' },
  { id:'0SffT1jtgjiYf1Mktr6itS',title:'Shuniji',artist:'C418',genre:'Ambient',cover:'https://i.scdn.co/image/ab67616d0000b27365909c4fba00470e664c2e47' },
  { id:'7DSnYENpaf2ITpt5Ec08Wn',title:'druzy®',artist:'Baltra',genre:'Electronic',cover:'https://i.scdn.co/image/ab67616d0000b2731e652295d29785693f7e3a86' },
  { id:'3GaHZrdoerPuKhCoZdO6NU',title:'Gryning',artist:'Carbon Based Lifeforms, Karin My',genre:'Ambient',cover:'https://i.scdn.co/image/ab67616d0000b273c797d768e78fdd098f397cb2' },
  { id:'1SEdAxQxJBIREiBhj0OhvI',title:'Wings - Floating Points Remix',artist:'The Invisible, Floating Points',genre:'Indie',cover:'https://i.scdn.co/image/ab67616d0000b273febce5717575542c3994b435' },
  { id:'1BViPjTT585XAhkUUrkts0',title:'Seigfried',artist:'Frank Ocean',genre:'R&B',cover:'https://i.scdn.co/image/ab67616d0000b273c5649add07ed3720be9d5526' },
  { id:'5Lgqu1th1KqlG97OF2gWGe',title:'Window Pain - Outro',artist:'J. Cole',genre:'Rap',cover:'https://i.scdn.co/image/ab67616d0000b273cf0f0affd0138a7442f13706' },
  { id:'3tK9aXMLi2QSMvxAS7rpv5',title:'Illuminate (feat. Kendrick Lamar)',artist:'Ab-Soul, Kendrick Lamar',genre:'Rap',cover:'https://i.scdn.co/image/ab67616d0000b273758f24ced78e29586d931404' },
  { id:'12e4x5uzKcDa8ZgQbGA0Gr',title:'For How Long',artist:'Tycho, Saint Sinner',genre:'Indie',cover:'https://i.scdn.co/image/ab67616d0000b2738f38659c97d873d794e2c6dd' },
  { id:'2Y1BKUbXxTqu8aD0aroPPP',title:'Music of Wellness - ODESZA Severance Remix',artist:'ODESZA, Theodore Shapiro',genre:'Ambient',cover:'https://i.scdn.co/image/ab67616d0000b273183bc8483f5f44416c608ca9' },
  { id:'6Qp5KAhBHzqxfhgarfBcj3',title:'Hey! Love - Digitally Remastered 1997',artist:'The Delfonics',genre:'R&B',cover:'https://i.scdn.co/image/ab67616d0000b2738f94e3897d30ea450e10558f' },
  { id:'2iZr20PeYF2ng6T34LdVWp',title:'21 Years',artist:'Skepta, Fred again..',genre:'Rap',cover:'https://i.scdn.co/image/ab67616d0000b273096a7117356251107f00c8d8' },
  { id:'04H7h3KJAQp9JHCSPGlp9A',title:'Come Back Down',artist:'Men I Trust',genre:'Indie',cover:'https://i.scdn.co/image/ab67616d0000b273dcfa162250c7d0feed61d638' },
  { id:'2zyPvXUyq8RXbxoDN8GJkF',title:'Careless - Tiny Room Sessions',artist:'Greg Spero, Ronald Bruner, Jr., MonoNeon',genre:'Jazz',cover:'https://i.scdn.co/image/ab67616d0000b273a66ca97bc6e6b376c2127cc9' },
  { id:'63Pi2NAx5yCgeLhCTOrEou',title:'Headlock',artist:'Imogen Heap',genre:'Indie',cover:'https://i.scdn.co/image/ab67616d0000b2730cabafb8b01b956fae313c57' },
  { id:'2X6b7zLdIxCejd6GqVcQ9M',title:'3005',artist:'Childish Gambino',genre:'Rap',cover:'https://i.scdn.co/image/ab67616d0000b27321b2b485aef32bcc96c1875c' },
  { id:'6Rnj6SbTsWUqViYBxusYpC',title:'Devotion',artist:'Transcode',genre:'Techno',cover:'https://i.scdn.co/image/ab67616d0000b273d0412947f2a519bd4e42ad78' },
  { id:'4KXASWZfC8ZCZpiJhlVqXK',title:'Rosinenbomber',artist:'Pan-Pot',genre:'Techno',cover:'https://i.scdn.co/image/ab67616d0000b273c73773804952319805b49f7a' },
]

const tracksById = new Map(tracks.map((track) => [track.id, track]))

const genrePositions: Record<Genre,{x:number;y:number;z:number}> = {
  Electronic:{x:0,y:92,z:0},
  Techno:{x:0,y:60,z:0},
  Indie:{x:0,y:30,z:0},
  Ambient:{x:0,y:2,z:0},
  Rap:{x:0,y:-26,z:0},
  'R&B':{x:0,y:-52,z:0},
  Jazz:{x:0,y:-78,z:0},
}
const genres = Object.keys(genrePositions) as Genre[]

function GraphScene({ onHover, onSelect }: { onHover:(track:Track|null)=>void; onSelect:(track:Track)=>void }) {
  const graph = useRef<any>(null)
  const cards = useRef(new Map<string, Group>())
  const coverMaterials = useRef(new Set<MeshBasicMaterial>())
  const cleanupTimer = useRef<ReturnType<typeof setTimeout>|null>(null)
  const { camera, gl, invalidate } = useThree()
  const loader = useMemo(() => new TextureLoader(), [])
  const maxAnisotropy = useMemo(() => gl.capabilities.getMaxAnisotropy(), [gl])
  const bodyGeometry = useMemo(() => new BoxGeometry(22,22,1.6), [])
  const coverGeometry = useMemo(() => new PlaneGeometry(20.8,20.8), [])
  const bodyMaterial = useMemo(() => new MeshStandardMaterial({ color:'#e7e4de', roughness:.48, metalness:.06 }), [])
  useFrame(() => {
    graph.current?.tickFrame()
    cards.current.forEach((card) => card.quaternion.copy(camera.quaternion))
  })

  useEffect(() => {
    if (cleanupTimer.current) clearTimeout(cleanupTimer.current)
    return () => {
      cleanupTimer.current = setTimeout(() => {
        cards.current.clear()
        coverMaterials.current.forEach((material) => {
          material.map?.dispose()
          material.dispose()
        })
        coverMaterials.current.clear()
        bodyGeometry.dispose()
        coverGeometry.dispose()
        bodyMaterial.dispose()
      }, 0)
    }
  }, [bodyGeometry, bodyMaterial, coverGeometry])

  const data = useMemo(() => {
    const genreCounts = tracks.reduce<Record<Genre, number>>((acc, track) => {
      acc[track.genre] = (acc[track.genre] ?? 0) + 1
      return acc
    }, {} as Record<Genre, number>)
    const genreOffsets: Record<Genre, number> = {
      Electronic: 0,
      Techno: 0,
      Indie: 0,
      Ambient: 0,
      Rap: 0,
      'R&B': 0,
      Jazz: 0,
    }
    const positionedTracks = tracks.map((track) => {
      const index = genreOffsets[track.genre]
      genreOffsets[track.genre] += 1
      const total = Math.max(genreCounts[track.genre] ?? 1, 1)
      const angle = (index / total) * Math.PI * 2
      const ring = Math.floor(index / 8)
      const radius = 20 + ring * 9
      const genre = genrePositions[track.genre]
      return {
        ...track,
        x: (genre.x + Math.cos(angle) * radius) * 1.85,
        y: genre.y + ((index % 3) - 1) * 2.4,
        z: (genre.z + Math.sin(angle) * radius) * 5,
      }
    })
    const tracksByGenre = genres.reduce<Record<Genre, typeof positionedTracks>>((acc, genre) => {
      acc[genre] = positionedTracks.filter((track) => track.genre === genre)
      return acc
    }, {} as Record<Genre, typeof positionedTracks>)
    const nodes = [
      ...genres.map((genre) => ({ id:`genre-${genre}`, genre, kind:'genre', x:genrePositions[genre].x, y:genrePositions[genre].y, z:genrePositions[genre].z * 5 })),
      ...positionedTracks.map((track) => ({ id:track.id, genre:track.genre, kind:'track', x:track.x, y:track.y, z:track.z })),
    ]
    const links = positionedTracks.map((track) => ({ source:`genre-${track.genre}`, target:track.id }))
    const intraGenre = genres.flatMap((genre) => {
      const bucket = tracksByGenre[genre]
      const edges: Array<{ source: string; target: string }> = []
      for (let index = 0; index < bucket.length - 1; index += 1) {
        edges.push({ source: bucket[index].id, target: bucket[index + 1].id })
        if (index + 2 < bucket.length) edges.push({ source: bucket[index].id, target: bucket[index + 2].id })
      }
      return edges
    })
    const interGenre = genres.flatMap((genre, index) => {
      const nextGenre = genres[index + 1]
      if (!nextGenre) return []
      const current = tracksByGenre[genre]
      const next = tracksByGenre[nextGenre]
      if (!current.length || !next.length) return []
      return [
        { source: current[0].id, target: next[0].id },
        { source: current[current.length - 1].id, target: next[next.length - 1].id },
      ]
    })
    return { nodes, links:[...links,...intraGenre,...interGenre] }
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
    const track = tracksById.get(node.id)!
    const group = new Group()
    const texture = loader.load(track.cover, () => invalidate())
    texture.colorSpace = 'srgb'
    texture.anisotropy = Math.min(maxAnisotropy, 8)
    const coverMaterial = new MeshBasicMaterial({ map:texture, side:DoubleSide })
    coverMaterials.current.add(coverMaterial)
    const body = new Mesh(
      bodyGeometry,
      bodyMaterial,
    )
    group.add(body)
    const cover = new Mesh(
      coverGeometry,
      coverMaterial,
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
  }, [bodyGeometry, bodyMaterial, coverGeometry, invalidate, loader, maxAnisotropy])

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
    linkOpacity={.52}
    onNodeHover={(node:any) => onHover(node?.kind === 'track' ? tracksById.get(node.id) ?? null : null)}
    onNodeClick={(node:any) => { const track = tracksById.get(node.id); if (track) onSelect(track) }}
  />
}

export default function Graph() {
  const [selected,setSelected] = useState<Track|null>(null)
  const [preloaded,setPreloaded] = useState<Track|null>(null)
  const preloadTimer = useRef<ReturnType<typeof setTimeout>|null>(null)
  const reduceMotion = useReducedMotion()
  useEffect(() => {
    const preconnect = document.createElement('link')
    preconnect.rel = 'preconnect'
    preconnect.href = 'https://open.spotify.com'
    document.head.append(preconnect)
    return () => {
      preconnect.remove()
      if (preloadTimer.current) clearTimeout(preloadTimer.current)
    }
  }, [])

  const preload = useCallback((track:Track|null) => {
    if (preloadTimer.current) clearTimeout(preloadTimer.current)
    if (!track || selected) return
    preloadTimer.current = setTimeout(() => {
      setPreloaded((current) => current?.id === track.id ? current : track)
    }, 120)
  }, [selected])

  const selectTrack = useCallback((track:Track) => {
    if (preloadTimer.current) clearTimeout(preloadTimer.current)
    playUiSound('music-select')
    setPreloaded(track)
    setSelected(track)
  }, [])

  return <motion.section
    className="simple-music dense-music-graph"
    initial={reduceMotion ? { opacity:0 } : { opacity:0, transform:'scale(.995)' }}
    animate={{ opacity:1, transform:'scale(1)' }}
    transition={{ duration:reduceMotion ? .12 : .28, ease:[.23,1,.32,1] }}
  >
    <div className="simple-music-canvas" role="application" aria-label="Interactive map of music by genre">
      <Canvas
        flat
        dpr={[1, 2]}
        gl={{ antialias:true, alpha:false, powerPreference:'high-performance' }}
        camera={{ position:[78,48,245], far:3000 }}
      >
        <color attach="background" args={['#fafcff']} />
        <ambientLight intensity={2.2} />
        <directionalLight position={[90,110,160]} intensity={3.4} />
        <directionalLight position={[-80,-40,-100]} intensity={1.1} />
        <TrackballControls rotateSpeed={2.6} panSpeed={.95} zoomSpeed={1.1} dynamicDampingFactor={.18} />
        <GraphScene onHover={preload} onSelect={selectTrack} />
      </Canvas>
      {preloaded && <motion.aside
        className={`track-panel simple-track-panel spotify-player${selected ? ' is-visible' : ''}`}
        aria-hidden={!selected}
        initial={false}
        animate={selected
          ? { opacity:1, transform:'translateY(0) scale(1)' }
          : { opacity:0, transform:reduceMotion ? 'none' : 'translateY(6px) scale(.985)' }}
        transition={{duration:reduceMotion ? .1 : .18,ease:selected ? [.23,1,.32,1] : [.4,0,1,1]}}
      >
        <div className="track-meta"><img src={preloaded.cover} alt="" /><div><small>{preloaded.genre}</small><h2>{preloaded.title}</h2><p>{preloaded.artist}</p></div><button onClick={() => setSelected(null)} aria-label="Close player" tabIndex={selected ? 0 : -1}>×</button></div>
        <iframe title={`Listen to ${preloaded.title}`} src={`https://open.spotify.com/embed/track/${preloaded.id}`} width="100%" height="80" allow="encrypted-media" tabIndex={selected ? 0 : -1} />
      </motion.aside>}
    </div>
  </motion.section>
}
