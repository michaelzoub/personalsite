'use client'
import { steamOption } from "@/app/components/paymentdata"
import { paymentOptions } from "@/app/components/paymentdata"
import { cryptoOptions } from "@/app/components/paymentdata"
import { CurrencyContext } from "@/app/components/CurrencyContext"
import { steamMarketCurrencies } from "@/app/components/SteamMarketCurrencies"
import { useContext, useEffect, useState } from "react"
import Image from "next/image"
import qr from "/public/qr.svg"
import { formInterface } from "./interface"
import { Elements } from "@stripe/react-stripe-js";
import {
    PaymentElement,
    useStripe,
    useElements
  } from "@stripe/react-stripe-js";
  import { loadStripe } from "@stripe/stripe-js";
import PayButton from "@/app/components/checkoutform"

const stripePromise = loadStripe("pk_test_51Q2bcKGPi4c603NdurI8SIfP2kblRigYA84OIWosdNUgYtwcMfN6fxa4b9cVhEX6QmUHdsNZb3PlNm83hhxPH3vo00NlENq6XE");

//temporary fake data, we'd fetch it from 
const fakeTxData = [
    {
        date: "2024-10-01",
        amount: 1.1
    },
    {
        date: "2024-10-01",
        amount: 2.0   
    },
    {
        date: "2024-10-01",
        amount: 3.0
    },
    {
        date: "2024-10-01",
        amount: 120.0   
    },
    {
        date: "2024-10-01",
        amount: 2340.0
    },
    {
        date: "2024-10-01",
        amount: 120.0   
    },
    {
        date: "2024-10-01",
        amount: 114.0
    },
    {
        date: "2024-10-01",
        amount: 1110.0   
    },
]

const suggestedDeposits = [10, 25, 75, 250]

const itemsPerPage = 1;

export default function paymentSlug({ params }: any) { //number for total amount of pages
    const totalPages = Math.ceil(fakeTxData.length / itemsPerPage)
    const [center, setCenter] = useState(Math.ceil(totalPages / 2))
    const [page, setPage] = useState(0)
    const [over, setOver] = useState(false)
    const [loading, setLoading] = useState(<div></div>)
    const [inputAmount, setInputAmount] = useState<number>()
    const [currencyState, setCurrencyState] = useState("usd")
    const [loadingTimer, setLoadingTimer] = useState(false)
    const [paymentResponse, setPaymentResponse] = useState("")
    const [clientSecretState, setClientSecretState] = useState("")
    const [buttonColor, setButtonColor] = useState(false)
    const [notNumberError, setNotNumberError] = useState("")

    const startIndex = itemsPerPage * page
    const paginatedData = fakeTxData.slice(startIndex, startIndex + itemsPerPage);

    let parsedPages: any = [];

    let currencyObjectKeys = Object.keys(steamMarketCurrencies)
    let currencyContext = useContext(CurrencyContext)
    let matchingObjectKey = currencyObjectKeys.filter((e) => e === currencyContext)

    const object: formInterface = {
        payment: inputAmount ?? 0,
        currency: currencyState
    }

    useEffect(() => {
        matchingObjectKey.includes("EUR") ? setCurrencyState("eur") :  (matchingObjectKey.includes("JPY") ? setCurrencyState("jpy") : matchingObjectKey.includes("CNY") ? setCurrencyState("cny") : matchingObjectKey.includes("BRL") ? setCurrencyState("brl") : setCurrencyState("usd"))
        if (slug.includes("cash")) {
        }
        if (totalPages <= 4) {
            setOver(true)
        }
        for (let i = 1; i <= totalPages; i++) {
            parsedPages.push(i)
        }
    },[])

    function performSelectSelection(e:any) {
        const target = e.target.value
        setPage(e.target.value - 1)
    }

    function isNumber(input:any): boolean {
        return !isNaN(Number(input))
    }

    function rightPage(e:any) {
        if (e.target.value >= totalPages - 1) {
            if (e.target.value > totalPages - 1) {

            } else {
                setPage(e.target.value - 1)
            }
        } else {
            setPage(e.target.value - 1)
            let plus = center + 1
            setCenter(plus)
        }
    }

    function leftPage(e:any) {
        if (e.target.value <= 2) {
            if (e.target.value < 2) {

            } else {
                setPage(e.target.value - 1)
            }
        } else {
            setPage(e.target.value - 1)
            let minus = center - 1
            setCenter(minus)
        }
    }

    function first(e:any) {
        setPage(e.target.value - 1)
        if (totalPages < 5) {
            setCenter(2)
        } else {
            setCenter(3)
        }
    }

    function last(e:any) {
        setPage(e.target.value - 1)
        if (totalPages < 5) {
            if (over) {
                setCenter(totalPages - 2)
            } else {
                setCenter(totalPages - 1)
            }
        } else {
            setCenter(totalPages - 2)
        }
    }

    async function confirmPayment(e:any) {
        e.preventDefault()
        setButtonColor(true)
        //send to backend
        const response = await fetch('http://localhost:8080/api/confirm-payment-intent', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(object)
        })

        console.log(response.body)
        setPaymentResponse(JSON.stringify(response.body))
    }

    async function fetchPaymentIntent() {
        if (inputAmount === 0) {
            setNotNumberError("Required field")
            return;
        }
        else if (!isNumber(inputAmount)) {
            setNotNumberError("Enter a number")
            return;
        } 
        const response = await fetch("http://localhost:8080/api/create-payment-intent", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(object)
        })
        const body = await response.json()
        setLoading(<div className="z-10 animate-spin radius mx-auto mt-32"></div>)
        setTimeout(() => setLoadingTimer(true), body? 399 : 1000)
        setTimeout(() => setLoading(<div></div>), body ? 399 : 1000) 
        setClientSecretState(body.clientSecret)
    }

    let payment: any;

    const { slug } = params;
    if (slug.includes("crypto")) {
        payment = cryptoOptions.find((e) => e.slug === slug)
    } if (slug.includes("cash")) {
        payment = paymentOptions.find((e) => e.slug === slug)
    } if (slug.includes("skins")) {
        payment = steamOption.find((e) => e.slug === slug)
    }

    const appearance = {
        theme: 'night',
        variables: {
          fontFamily: 'Sohne, system-ui, sans-serif',
          fontWeightNormal: '500',
          borderRadius: '2px',
          colorBackground: '#2B2F3C',
          colorPrimary: '#e96969',
          accessibleColorOnColorPrimary: '#1A1B25',
          colorText: 'white',
          colorTextSecondary: 'white',
          colorTextPlaceholder: '#ABB2BF',
          tabIconColor: 'white',
          logoColor: 'dark'
        },
        rules: {
          '.Input': {
            backgroundColor: '#2B2F3C',
            border: '1px solid var(--colorPrimary)'
          }
        }
      };
      const options:any = {
        clientSecret: clientSecretState,
        appearance
      };

    return(
        <main className="z-10 px-10 flex flex-col min-h-screen items-center bgblack gap-8 text-white overflow-auto overflow-x-hidden">
            {slug.includes("crypto") ?  
            <div>
            <div className="mt-20 text-lg font-medium">Deposit <span className={`${String(payment.color)}`}>{payment.name}</span>:</div>
            <div>
                You will receive balance automatically after sending {String(payment.name)} to the address displayed below. (12 confirmations required).
            </div>
            <div className="flex flex-col gap-2 tradebox px-10 p-4 rounded-sm w-full">
                <div className="mx-auto text-lg">Wallet address:</div>
                <Image className="bg-white rounded-sm mx-auto" src={qr} width={200} alt="qr"></Image>
                <div className="mx-auto mt-4 border-2 rounded-sm border-zinc-400 p-1">Transfer only ${payment.name} to this address</div>
            </div>
            <div className="w-full shadow-inner rounded-sm bgblack flex flex-col gap-2 p-4">
                <div className="text-2xl font-medium">Transaction History:</div>
                <div className="grid grid-cols divide-y-[1px]">
                <div className="flex flex-row justify-between text-zinc-300 my-2">
                    <div>Type</div>
                    <div>Amount</div>
                    <div>Date</div>
                </div>
                {
                    paginatedData.map((e) => 
                    <div className="flex flex-row justify-between p-1 rounded-sm">
                        <div className="text-red-400 text-left">Sell</div>
                        <div className="w-52 pl-24 text-left">{e.amount} {matchingObjectKey}</div>
                        <div className="text-zinc-300">{e.date}</div>
                    </div>
                )
                }
                </div>
                <div className="flex flex-row mx-auto gap-4">
                                <button className="rounded-md bg-red-400 p-2 w-fit" onClick={first} value={1}>First</button>
                                <div className="flex flex-row gap-2">
                                    <button className={`${over ? "hidden" : "rounded-md bg-red-400 p-2 w-7"}`} onClick={leftPage} value={center - 1}>{center - 1}</button>
                                    <button className="rounded-md bg-red-400 p-2 w-7" onClick={(e:any) => setPage(e.target.value - 1)} value={center}>{center}</button>
                                    <button className="rounded-md bg-red-400 p-2 w-7" onClick={rightPage} value={center + 1}>{center + 1}</button>
                                </div>
                                <button className="rounded-md bg-red-400 p-2 w-fit" onClick={last} value={totalPages}>Last</button>
                </div>
                <div className="text-sm text-zinc-400 mx-auto m-2">Page {page + 1} - {totalPages}</div>
            </div>
            </div>: (slug.includes("cash") ? 
            <div className="w-full">
            {loading}
            <div className={`${clientSecretState ? "hidden" : "w-fit p-10 px-16 mt-32 mx-auto flex flex-col hoversearchbg rounded-md shadow-inner border-2 border-gray-600"}`}>
                <div className="p-2">Input an amount:</div>
                <div className="flex flex-row justify-end mx-auto">
                    <input placeholder="Payment Amount" className="p-[12px] rounded-sm text-sm bg-[#2B2F3C] border-[1.5px] border-[#e96969]" onChange={(e:any) => setInputAmount(e.target.value)} value={inputAmount} onKeyDown={fetchPaymentIntent}></input>
                    <button className={`${buttonColor ? "mr-[-2px] m-2 bg-green-400 border-[2.5px] border-green-500 rounded-md px-[5px] py-1 text-sm text-white" : "absolute m-2 bg-white border-[2.5px] shadow-inner border-zinc-400 rounded-md px-[3px] py-1 text-sm text-zinc-400 hover:bg-green-100 hover:border-green-600 hover:text-green-500"}`} onClick={fetchPaymentIntent}>✔</button>
                </div>
                <div className={`${notNumberError ? "absolute flex flex-row mt-12 ml-[220px]" : "hidden"}`}>
                <div className="absolute right-[-1.8px] text-red-500 text-sm">◀</div>
                        <span className="absolute bg-red-500 text-white text-xs rounded py-1 px-2 w-[110px]">{notNumberError}</span>
                </div>
                <div className="p-2 mt-4 w-52 mx-auto">Or select an amount:</div>
                <div className="grid prices-grid px-2 w-52 mx-auto">
                    {
                        suggestedDeposits.map((e:number) => 
                            <button className="bg-red-400 rounded-sm px-4 py-2 border-2 border-red-300 shadow-inner shadow-red-500 hover:shadow-red-600" value={e} onClick={(t: any) => setInputAmount(t.target.value)}>{e}$</button>
                        )
                    }
                </div>
            </div>
            {clientSecretState && loadingTimer && ( 
                <Elements options={options} stripe={stripePromise}>
                    <div className={loadingTimer ? "w-96 mt-32 text-black mx-auto" : "hidden"}>
                        <PayButton currency={matchingObjectKey} amount={inputAmount} value='e'></PayButton>
                        <div className={`${paymentResponse ? "visible" : "hidden"}`}>{paymentResponse}</div>
                    </div>
                </Elements>
                )}
            </div> : 
            <div></div>)}
            <div className={`${paymentResponse ? 'absolute start-0 top-[95%] animate-show-error w-fit px-1 py-2 my-auto mx-auto justify-center items-center rounded-sm border-[1px] border-red-700 redaccent font-semibold text-sm' : 'right-[-100px] mt-10 hiddenError'}`}>{paymentResponse}</div>
        </main>
    )
}