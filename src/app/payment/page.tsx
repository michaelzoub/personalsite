'use client'
import Link from "next/link"
import Image from "next/image"

import { steamOption } from "../components/paymentdata"
import { paymentOptions } from "../components/paymentdata"
import { cryptoOptions } from "../components/paymentdata"

export default function Payment() {
    return (
        <main className="z-10 px-32 flex flex-col min-h-screen items-center bgblack gap-8 text-white overflow-auto overflow-x-hidden">
            <div className="mt-20 w-full">
                <div className="text-lg my-4">Steam</div>
                <div className="grid gap-2 items-grid flex flex-row">
                    {steamOption.map((e) => 
                    <Link href={`/payment/${e.slug}`} className="flex flex-col searchbg items-center gap-2 p-1 rounded-sm hover:hoversearchbg">
                        <Image className="rounded-sm tradebox px-6 py-2 w-full" src={e.img} width={100} height={60} alt={e.name}></Image>
                        <div className="text-sm my-2 ">{e.name}</div>
                    </Link>
                    )}
                </div>
            </div>
            <div className="w-full">
                <div className="text-lg my-4">Cash</div>
                <div className="grid gap-2 items-grid flex flex-row">
                    {paymentOptions.map((e) => 
                    <Link href={`/payment/${e.slug}`} className="flex flex-col searchbg items-center gap-2 p-1 rounded-sm hover:hoversearchbg">
                        <Image className="rounded-sm tradebox px-6 py-2 w-full" src={e.img} width={100} height={60} alt={e.name}></Image>
                        <div className="text-sm my-2 ">{e.name}</div>
                    </Link>
                    )}
                </div>
            </div>
            <div className="w-full mb-8">
                <div className="text-lg my-4">Crypto</div>
                <div className="grid gap-2 items-grid flex flex-row">
                    {cryptoOptions.map((e) => 
                    <Link href={`/payment/${e.slug}`} className="flex flex-col searchbg items-center gap-2 p-1 rounded-sm hover:hoversearchbg">
                        <Image className="rounded-sm tradebox px-6 py-2 w-full" src={e.img} width={100} height={60} alt={e.name}></Image>
                        <div className="text-sm my-2 ">{e.name}</div>
                    </Link>
                    )}
                </div>
            </div>
        </main>
    )
}