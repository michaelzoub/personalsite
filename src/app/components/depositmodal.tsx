import { useState } from "react"

export default function Deposit() {

    const [shown, setShown] = useState(true)

    return (
        <main className="absolute flex flex-row w-full h-screen bgblack text-white">
            <div>test</div>
            <div className={`${shown? "relative animate-show-depositLeft h-screen left-0" : "hiddenDepositRight"}`}>
                <div>test left</div>
            </div>
            <div className={`${shown? "relative animate-show-depositRight right-0" : "hiddenDepositRight"}`}>
                <div className="grid items-grid w-96">
                    <div>test</div>
                    <div>test</div>
                    <div>test</div>
                    <div>test</div>
                </div>
            </div>
        </main>
    )
}