import React, {useEffect, useRef, useState} from 'react';
import { sendMsgToOpenAI } from '../service/openai';
import Image, { StaticImageData } from 'next/image';
import bot from '/public/bot.png'
import user from '/public/user.png'

interface Message {
    fromUser: boolean;
    message: string;
    image: StaticImageData;
}

const commonlyAskedQuestion = ["Why should I trade on dlock?", "How long does it take to receive items?", "What is the cashout limit?"]

export default function Chatbot(click: any) {
    const [text, setText] = useState('')
    const [iconClicked, setIconClicked] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [faqmsg, setFaqmsg] = useState('')

    function addMsg(msg: Message): void {
        setMessages((prevMessages:any) => [...prevMessages, msg]);
    }
    
    async function addMessage(event:any) {
            if (event.key === 'Enter') {
            console.log(messages)
            const newMessage: Message = {fromUser: true, message: text, image: user}; // Assuming 'fromChet' was a typo
            // setMessages([...messages, newMessage]);
            addMsg(newMessage)
            setText('');

            try {
                const response = await sendMsgToOpenAI(text);
                if (response != null) {
                    const chetGPTMsg: Message = {fromUser: false, message: response.toString(), image: bot};
                    addMsg(chetGPTMsg)
                }
                console.log("Response from OpenAI:", response);
            } catch (error) {
                console.error("Error communicating with OpenAI:", error);
            }  
        }
    }

    async function FAQ(e: string) {
        addMsg({fromUser: true, message: e, image: user})
        setText('');
        try {
            const response = await sendMsgToOpenAI(e);
            if (response != null) {
                const chetGPTMsg: Message = {fromUser: false, message: response.toString(), image: bot};
                addMsg(chetGPTMsg)
            }
            console.log("Response from OpenAI:", response);
        } catch (error) {
            console.error("Error communicating with OpenAI:", error);
        }  
    }

    return (
        <div className={`${iconClicked ? 'flex flex-col justify-end text-black absolute end-0 bottom-0 m-4 w-56 h-72 bg-zinc-100 overflow-auto rounded-md' : 'rounded-full text-black absolute end-0 bottom-0 m-2 w-12 h-12 redaccent overflow-hidden'}`}>
            <button onClick={() => setIconClicked(true)} className={`${iconClicked? 'hidden' : 'text-2xl text-white font-semibold ml-[18.3px] mt-[6.5px]'}`}>?</button>
            <div className={`${iconClicked? 'absolute flex start-0 top-0 w-full redaccent text-white py-2' : 'hidden'}`}>
                <div className="ml-2 font-medium">DLOCK SUPPORT</div>
                <button className={`${iconClicked ? 'absolute top-0 end-0 m-2' : 'hidden'}`} onClick={()=> setIconClicked(false)}>✖</button>
            </div>
            <ul className={`${iconClicked ? 'overflow-scroll' : 'hidden'}`}>
                <div className={`${iconClicked ? 'flex flex-col gap-2 mx-3 mt-4 mb-2 rounded-md text-white text-left text-sm' : 'hidden'}`}>
                    <div className="text-black">Commonly asked:</div>
                    {commonlyAskedQuestion.map((e)=> 
                    <button className="redaccent p-1" onClick={() => FAQ(e)} value={e}>{e}</button>)}
                </div>
                {messages.map(e => 
                <div className="w-40 gap-4 text-zinc-700 mx-2">
                    <Image src={e.image} alt='' height={20} width={20}></Image>
                    <div className="flex flex-row mb-2 ml-1">{e.message}</div>
                </div>
                )}
            </ul>
            <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={addMessage} className={`${iconClicked ? 'visible rounded-sm mt-2 px-[1.7px] p-2 outline-none' : 'hidden'}`} placeholder="Trade queries..."></input>
        </div>
    )
}