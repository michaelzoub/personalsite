import { motion } from "motion/react"
import { useState, useEffect } from "react"

type PropsType = {
    dark: boolean
}

type formObject = {
    subject: string,
    from: string,
    text: string
}

export default function ContactForm({ dark }: PropsType) {

    const [subject, setSubject] = useState("");
    const [from, setFrom] = useState("");
    const [text, setText] = useState("");
    const [isActive, setIsActive] = useState(false)

    async function sendEmail(formObject: formObject) {
        if ((subject || from || text) == "") {
            return;
        }
        const response = await fetch(`/api/contact`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }, 
            body: JSON.stringify(formObject)
        })
        const data = await response.json();
        console.log(data)

    }

    function eraseAll() {
        setSubject("");
        setFrom("");
        setText("");
    }

    return (
        <motion.main className="flex flex-col w-full gap-1">
            <motion.div className="w-full flex flex-col place-items-end gap-2"
                initial={{ opacity: 0, y: 25 }}
                transition={{ delay: 0.1 }}
                whileInView={{opacity: 1, y: 0}}
            >
                <div className="w-full flex flex-row justify-between hidden">
                    <div>Autocomplete</div>
                    <div onClick={() => setIsActive(!isActive)} className="cursor-pointer">
                        <motion.div
                            className={`relative w-14 h-6 rounded-full flex items-center p-1`}
                            initial={{ backgroundColor: "#E4E4E7" }}
                            animate={{
                            backgroundColor: isActive ? "#F97316" : "#E4E4E7",
                            }}
                            transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                            }}
                        >
                            <motion.div
                            className="w-4 h-4 bg-white rounded-full"
                            initial={{ x: 0 }}
                            animate={{
                                x: isActive ? 31.5 : 0,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                            }}
                            />
                        </motion.div>
        </div>
                </div>
                <motion.button className={`${dark ? "bg-zinc-900 text-zinc-400" : "bg-zinc-200"} text-zinc-600 rounded-lg px-2 py-1 w-fit`}
                    whileHover={{ scale: 1.055, }}
                    transition={{ type: "spring", duration: 0.3 }}
                    onClick={eraseAll}
                >Erase</motion.button>
            </motion.div>
            <motion.div className="w-full flex flex-row gap-3"
                initial={{ opacity: 0, y: 25 }}
                transition={{ delay: 0.2 }}
                whileInView={{opacity: 1, y: 0}}
            >
                <div className="w-full flex flex-col">
                    <div className="text-left">Subject</div>
                    <input className={`w-full mx-4 my-1 p-2 rounded-lg mx-auto ${dark ? "bg-zinc-900 text-orange-200" : "text-orange-600 bg-zinc-200"}`} placeholder="Coffee chat?!" value={subject} onChange={(e) => setSubject(e.target.value)}></input>
                </div>
                <div className="flex flex-col w-full">
                    <div className="text-left">From</div>
                    <input className={`w-full mx-4 my-1 p-2 rounded-lg mx-auto ${dark ? "bg-zinc-900 text-orange-200" : "text-orange-600 bg-zinc-200"}`} placeholder="bot@ai.com" value={from} onChange={(e) => setFrom(e.target.value)}></input>
                </div>
            </motion.div>
            <motion.div className="flex flex-col"
                initial={{ opacity: 0, y: 32 }}
                transition={{ delay: 0.3 }}
                whileInView={{opacity: 1, y: 0}}
            >
                <div className="text-left">Content</div>
                <textarea className={`w-full mx-4 my-1 p-2 h-[100px] rounded-lg mx-auto ${dark ? "bg-zinc-900 text-orange-200" : "text-orange-600 bg-zinc-200"}`} placeholder="Input" value={text} onChange={(e) => setText(e.target.value)}></textarea>
            </motion.div>
            <motion.button className="transition delay-150 ease-in-out hover:text-orange-400 w-fit mx-auto" onClick={() => sendEmail({ subject, from, text })}>Send</motion.button>
        </motion.main>
    )
}