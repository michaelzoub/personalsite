import bitcoin from "/public/bitcoin.png"
import ethereum from "/public/ethereum.png"
import visa from "/public/visa.png"
import mastercard from "/public/mastercard.png"
import magical from "/public/magical.png"

export const steamOption = [
    {
        name: "Skins",
        href: "/",
        img: magical,
        slug: "skins",
        color: "orange"
    }
]

export const paymentOptions = [
    {
        name: "Visa",
        href: "/",
        img: visa,
        slug: "visa-cash-payment",
        color: "orange"
    },
    {
        name: "Mastercard",
        href: "/",
        img: mastercard,
        slug: "mastercard-cash-payment",
        color: "orange"
    }, 
]

export const cryptoOptions = [
    {
        name: "Ethereum",
        href: "/",
        img: ethereum,
        slug: "ethereum-crypto-payment",
        color: "text-blue-400"
    },
    {
        name: "Bitcoin",
        href: "/",
        img: bitcoin,
        slug: "bitcoin-crypto-payment",
        color: "text-orange-400"
    }
]