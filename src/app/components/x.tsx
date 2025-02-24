"use client"
import { useAtom } from "jotai"
import { useState } from "react";
import { hoverAtom } from "../atoms/hover"
import { motion } from "framer-motion";

export default function X() {

    const [, setHover] = useAtom(hoverAtom);
    const [xClick, setXClick] = useState(false);

    function handleXClick() {
        setXClick(true);
        setTimeout(() => {
            setHover(false)
            setXClick(false);
        },800)
    }

    return (
        <motion.svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" className="transition delay-50 duration-300 ease-in-out hover:text-orange-400 w-fit hover:cursor-pointer my-auto" onClick={handleXClick}
            initial={{ rotate: 0 }}
            animate={{ rotate: xClick ? 135  : 0 }}
        >
            <line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" />
            <line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" strokeWidth="1.5" />
        </motion.svg>
      )
}