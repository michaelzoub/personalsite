"use client"
import R3fForceGraph from 'r3f-forcegraph';
import { useMemo, useCallback, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { TrackballControls } from '@react-three/drei';
import { TextureLoader, SpriteMaterial, Sprite } from 'three'
import { getTopArtists } from '@/app/utils/spotify';
import { motion } from 'motion/react';
import SpriteText from 'three-spritetext';

import X from '../x';

import { useAtom } from 'jotai';
import { darkMode } from '@/app/atoms/darkMode';
import { musicInfo } from '@/app/atoms/musicInfo';

type Node = {
  id: number,
  name: string,
  val: number
}

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
      id: 4,
      name: "Floating Points",
      type: "text",
      val: 1,
      imgurl: "/logo512.jpg",
      link: "https://open.spotify.com/track/75QdM3nsnAluOD19G1J4il?si=575b49f5ad1f401b",
      genres: [""]
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
    }
  ]
};


const GraphViz = () => {
  const fgRef = useRef<any>();
  useFrame(() => (fgRef.current.tickFrame()));

  const loader = new TextureLoader();

  const [, setMusic] = useAtom(musicInfo);

  useEffect(() => {
    //fetch spotify:
    async function fetchSpotify() {
      const response = await getTopArtists();
      console.log(response);
    }
    fetchSpotify();
  }, []);

  //const N = 300;
  const gData = useMemo(() => ({
    nodes: exampleJson.nodes.map(i => ({ id: i.id })),
    links: exampleJson.links.map(link => ({
      source: link.source,
      target: link.target
    }))
  }), []);

  const nodeToThree = (image: string) => {
    const imgTexture = loader.load(image)
    const material = new SpriteMaterial({ map: imgTexture })
    const sprite = new Sprite(material)
    sprite.scale.set(15, 15, 0)
    return sprite
  }

  const nodeText = (name: string) => {
    const sprite = new SpriteText(name);
    sprite.material.depthWrite = false;
    sprite.color = 'black';
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

  return <div className="bg-white" style={{ height: window.innerHeight }}>
      <motion.div className={`flex flex-col absolute z-[100] px-4 pb-4 pt-4 gap-6 rounded-md bg- border-[1px] border-zinc-300 bottom-0 m-16 gap-2 ${ music ? "visible" : "hidden" }`}
        initial={{ opacity: music ? 1 : 0 }}
        animate={{ scale: music ? 1 : 0, opacity: music ? 1 : 0, type: "damp" }}
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
          animate={{ opacity: music ? 1 : 0, type: "damp" }}
          transition={{ delay: 0.5 }}
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
      <Canvas className='bg-white' flat camera={{ position: [0, 0, 65], far: 4000 }}>
        <TrackballControls rotateSpeed={15} panSpeed={2} zoomSpeed={2} />
        <color attach="background" args={dark ? [0.009, 0.009, 0.01] : [1, 1, 1]} />
        <ambientLight color={0xcccccc} intensity={Math.PI}/>
        <directionalLight intensity={0.6 * Math.PI}/>
        <GraphViz />
      </Canvas>
    </div>;
}