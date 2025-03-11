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

    return (
        <motion.main className="flex flex-col w-full gap-1">
            <motion.div className="w-full flex flex-row gap-3"
                initial={{ opacity: 0, y: 25 }}
                transition={{ delay: 0.1 }}
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
                transition={{ delay: 0.2 }}
                whileInView={{opacity: 1, y: 0}}
            >
                <div className="text-left">Content</div>
                <textarea className={`w-full mx-4 my-1 p-2 h-[100px] rounded-lg mx-auto ${dark ? "bg-zinc-900 text-orange-200" : "text-orange-600 bg-zinc-200"}`} placeholder="Input" value={text} onChange={(e) => setText(e.target.value)}></textarea>
            </motion.div>
            <motion.button className="transition delay-150 ease-in-out hover:text-orange-400 w-fit mx-auto" onClick={() => sendEmail({ subject, from, text })}>Send</motion.button>
        </motion.main>
    )
}