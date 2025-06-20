"use client"
import R3fForceGraph from 'r3f-forcegraph';
import { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { TrackballControls } from '@react-three/drei';
import { TextureLoader, SpriteMaterial, Sprite } from 'three'
import { getTopArtists } from '@/app/utils/spotify';
import { motion } from 'motion/react';
import SpriteText from 'three-spritetext';
import { useAtom } from 'jotai';
import { darkMode } from '@/app/atoms/darkMode';
import { musicInfo } from '@/app/atoms/musicInfo';
import MouseTooltip from '../mousetooltip';

const exampleJson = {
  nodes: [
    {
      id: 1,
      name: "Bias",
      type: "image",
      val: 0,
      imgurl: "/logo512.jpg",
      link: "https://open.spotify.com/track/75QdM3nsnAluOD19G1J4il?si=575b49f5ad1f401b"
    },
    {
      id: 2,
      name: "Key103",
      type: "image",
      val: 0,
      imgurl: "/logo513.jpg",
      link: "https://open.spotify.com/track/7jqyOefdf3A4zFKhTNVjVf?si=17e9cf76b02b49d6"
    },
    {
      id: 3,
      name: "Silurian Blue",
      type: "image",
      val: 0,
      imgurl: "/logo514.jpg",
      link: "https://open.spotify.com/track/7HwjvjGnewY4FBbWCNtCMW?si=5338aeac4f814609"
    },
    {
      id: 13,
      name: "Sais",
      type: "image",
      val: 0,
      imgurl: "/sais.jpg",
      link: "https://open.spotify.com/track/65c7ctSEOiYbz61XtytvOV?si=b34e21b2316b417a"
    },
    {
      id: 4,
      name: "Floating Points",
      type: "text",
      val: 1,
      imgurl: "/logo512.jpg",
      link: "https://open.spotify.com/track/75QdM3nsnAluOD19G1J4il?si=575b49f5ad1f401b",
      genres: [""]
    },
    {
      id: 5,
      name: "Yoshi City",
      type: "image",
      val: 0,
      imgurl: "/yoshi.png",
      link: "https://open.spotify.com/track/3da3ufjRxK1Kn5oqM0wmx4?si=688932ac2c474ed4"
    },
    {
      id: 6,
      name: "Kyoto",
      type: "image",
      val: 0,
      imgurl: "/kyoto.jpg",
      link: "https://open.spotify.com/track/7vQ8hT2jlA6RhxI4ZxISVd?si=90ded3cf69c0497e"
    },
    {
      id: 7,
      name: "Miami Ultras",
      type: "image",
      val: 0,
      imgurl: "/miami.jpg",
      link: "https://open.spotify.com/track/7vb0J4M6dZNE7ZvtvMDlCK?si=876f587b1ac74d5f"
    },
    {
      id: 8,
      name: "Yung Lean",
      type: "text",
      val: 1,
      imgurl: "/logo512.jpg",
      link: "https://open.spotify.com/track/75QdM3nsnAluOD19G1J4il?si=575b49f5ad1f401b",
      genres: [""]
    },
    {
      id: 9,
      name: "Cascades",
      type: "image",
      val: 0,
      imgurl: "/cascades.jpg",
      link: "https://open.spotify.com/track/7GIQDECN4gG0K1jjL6HmkT?si=b466cebc71304066"
    },
    {
      id: 10,
      name: "Black Trees",
      type: "image",
      val: 0,
      imgurl: "/blacktrees.jpg",
      link: "https://open.spotify.com/track/41x9pfhxDZdO6jzh7D9wOW?si=e12020f363164dcd"
    },
    {
      id: 11,
      name: "Night Arp Blues",
      type: "image",
      val: 0,
      imgurl: "/night.jpg",
      link: "https://open.spotify.com/track/2ZFs2wbwnljTAS9fSJJ6oH?si=9a2f596aca1d40cf"
    },
    {
      id: 12,
      name: "Indian Wells",
      type: "text",
      val: 1,
      imgurl: "/logo512.jpg",
      link: "https://open.spotify.com/track/75QdM3nsnAluOD19G1J4il?si=575b49f5ad1f401b",
      genres: [""]
    },
    {
      id: 16,
      name: "Nova",
      type: "image",
      val: 0,
      imgurl: "/nova.jpg",
      link: "https://open.spotify.com/track/7dYjEwbLJ1B5reoz3lWra0?si=33c1b0be4fea42f0"
    },
    {
      id: 17,
      name: "Archangel",
      type: "image",
      val: 0,
      imgurl: "/archangel.jpg",
      link: "https://open.spotify.com/track/55gnBQAhU5rGzLsXTAx2MM?si=031aa574cb964481"
    },
    {
      id: 18,
      name: "NYC",
      type: "image",
      val: 0,
      imgurl: "/tunes.jpg",
      link: "https://open.spotify.com/track/0itLChB4g2Oavxp6oAUbVS?si=4658af55fb2e4d0c"
    },
    {
      id: 19,
      name: "Burial",
      type: "text",
      val: 1,
      imgurl: "/logo512.jpg",
      link: "https://open.spotify.com/track/75QdM3nsnAluOD19G1J4il?si=575b49f5ad1f401b",
      genres: [""]
    },
    {
      id: 20,
      name: "Electronic",
      type: "text",
      val: 1,
      imgurl: "",
      link: "",
      genres: [""]
    },
    {
      id: 21,
      name: "Rap",
      type: "text",
      val: 1,
      imgurl: "",
      link: "",
      genres: [""]
    },
    {
      id: 22,
      name: "DnB",
      type: "text",
      val: 1,
      imgurl: "",
      link: "",
      genres: [""]
    },
    {
      id: 23,
      name: "Injury Reserve",
      type: "text",
      val: 1,
      imgurl: "",
      link: "",
      genres: [""]
    },
    {
      id: 24,
      name: "Ttktv",
      type: "image",
      val: 0,
      imgurl: "/ttktv.jpg", // Add image if desired
      link: "https://open.spotify.com/track/6U8wLl0pMsgS1Lcql3nQjH?si=f52992c7f75b4066"
    },
    {
      id: 25,
      name: "Outside",
      type: "image",
      val: 0,
      imgurl: "/outside.jpg", // Add image if desired
      link: "https://open.spotify.com/track/5s0oWj51ttqiINWWJynNPz?si=004992a72fc84ea5"
    },
    {
      id: 26,
      name: "Best Spot in the House",
      type: "image",
      val: 0,
      imgurl: "/bsith.jpg", // Add image if desired
      link: "https://open.spotify.com/track/1NmVaOMhftw2jZaE1KTk1p?si=063b923243ce4827"
    }
  ],
  links: [
    {
      source: 4,
      target: 1
    },
    {
      source: 4,
      target: 2
    },
    {
      source: 4,
      target: 3
    },
    {
      source: 4,
      target: 13
    },
    {
      source: 8,
      target: 5
    },
    {
      source: 8,
      target: 6
    },
    {
      source: 8,
      target: 7
    },
    {
      source: 12,
      target: 9
    },
    {
      source: 12,
      target: 10
    },
    {
      source: 12,
      target: 11
    },
    {
      source: 16,
      target: 19
    },
    {
      source: 17,
      target: 19
    },
    {
      source: 18,
      target: 19
    },
    {
      source: 20,
      target: 21
    },
    {
      source: 20,
      target: 22
    },
    {
      source: 22,
      target: 19
    },
    {
      source: 21,
      target: 8
    },
    {
      source: 20,
      target: 4
    },
    {
      source: 20,
      target: 12
    },
    { source: 23, target: 20 }, // Injury Reserve -> Electronic
    { source: 23, target: 21 }, // Injury Reserve -> Rap
    { source: 23, target: 24 }, // Injury Reserve -> Top Picks For You
    { source: 23, target: 25 }, // Injury Reserve -> SS San Francisco
    { source: 23, target: 26 }  // Injury Reserve -> Knees
  ]
};

const GraphViz = () => {
  const fgRef = useRef<any>();
  useFrame(() => (fgRef.current.tickFrame()));

  const loader = useMemo(() => new TextureLoader(), []);

  const [, setMusic] = useAtom(musicInfo);
  const [dark] = useAtom(darkMode);

  useEffect(() => {
    //fetch spotify:
    async function fetchSpotify() {
      const response = await getTopArtists();
      console.log(response);
    }
    fetchSpotify();
  }, []);

  const gData = useMemo(() => ({
    nodes: exampleJson.nodes.map(i => ({ id: i.id })),
    links: exampleJson.links.map(link => ({
      source: link.source,
      target: link.target
    }))
  }), []);



  const nodeToThree = useCallback((image: string) => {
    const imgTexture = loader.load(image)
    const material = new SpriteMaterial({ map: imgTexture })
    const sprite = new Sprite(material)
    sprite.scale.set(15, 15, 0)
    return sprite
  }, [loader])

  const nodeText = (name: string) => {
    const sprite = new SpriteText(name);
    sprite.material.depthWrite = false;
    sprite.color = dark ? "white" : "black";
    sprite.textHeight = 4;
    return sprite;
  }

  const handleNodeHover = useCallback((node: any | null, prevNode: any | null) => {
    console.log(node)
    //first find matching node id:
    const nodeObject = exampleJson.nodes.find((e) => e.id == node.id)
    console.log(nodeObject)
    if (nodeObject?.type == "image") {
      console.log('Node hovered:', node);
      setMusic({
        name: nodeObject.name,
        link: nodeObject.link,
        genres: []
      })
    } else if (nodeObject?.type == "text") {
      setMusic({
        name: nodeObject.name,
        link: nodeObject.link,
        genres: []
      })
    }
  }, []);

  return <R3fForceGraph
    nodeAutoColorBy="group"
    ref={fgRef}
    graphData={gData}
    onNodeClick={handleNodeHover}
    //onLinkClick={handleNodeHover}
    nodeThreeObject={(node) => {
      const found = exampleJson.nodes.find((e) => e.id == node.id);

      if (found?.type == "image") {
        return nodeToThree(found.imgurl);
      } else if (found?.type == "text") {
        return nodeText(found.name);
      }

      return nodeToThree("/logo512.jpg");
    }}
    linkWidth={0.15}
    linkColor="#000000"
    linkOpacity={0.9}
  />;
}

export default function Graph() {

  const [dark] = useAtom(darkMode);
  const [music, setMusic] = useAtom(musicInfo);
  const [height, setHeight] = useState(800);

  useEffect(() => {
    setHeight(window.innerHeight)
  },[])

  return <div className="bg-white" style={{ height: height }}>
      <MouseTooltip />
      <motion.div className={`flex flex-col absolute z-[100] px-4 pb-4 pt-4 gap-6 rounded-md bg- border-[1px] border-zinc-300 bottom-0 m-16 gap-2 ${dark ? "text-white" : "text-black"} ${ music ? "visible" : "hidden" }`}
        initial={{ opacity: music ? 1 : 0 }}
        animate={{ scale: music ? 1 : 0, opacity: music ? 1 : 0 }}
        transition={{
          type: "spring",
          damping: 20,
          stiffness: 100,
        }}
      >
        <div className='flex flex-row justify-between'>
          <motion.div className=""
          >{music?.name}</motion.div>
          <motion.svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" className="transition delay-50 duration-300 ease-in-out hover:text-orange-400 w-fit hover:cursor-pointer my-auto" onClick={() => setMusic(null)}
              initial={{ rotate: 0 }}
          >
              <line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" />
              <line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" strokeWidth="1.5" />
          </motion.svg>
        </div>
        <motion.div
          initial={{ opacity: music ? 1 : 0 }}
          animate={{ opacity: music ? 1 : 0}}
          transition={{
            type: "spring",
            damping: 20,  // controls the 'dampness' of the spring
            stiffness: 100,
            delay: 0.5
          }}
        >
        <iframe 
          src={`https://open.spotify.com/embed/track/${music?.link.split("/track/")[1]?.split("?")[0]}`} 
          width="300" 
          height="80" 
          frameBorder="0" 
          allow="encrypted-media"
          className="rounded-lg"
        ></iframe>
        </motion.div>
      </motion.div>
      <Canvas className='bg-white' flat camera={{ position: [0, 0, 120], far: 4000 }}>
        <TrackballControls rotateSpeed={15} panSpeed={2} zoomSpeed={2} />
        <color attach="background" args={dark ? [0.009, 0.009, 0.01] : [1, 1, 1]} />
        <ambientLight color={0xcccccc} intensity={Math.PI}/>
        <directionalLight intensity={0.6 * Math.PI}/>
        <GraphViz />
      </Canvas>
    </div>;
}