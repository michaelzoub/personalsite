'use client'
import Image from "next/image";
import { useState, useRef, Profiler, useMemo, useContext, useEffect } from 'react'
import Link from "next/link";
import Chatbot from "./components/helpchatbot";
import { LanguageContext } from "./components/LanguageContext";
import { CurrencyContext } from "./components/CurrencyContext";
import { languages } from "./components/languages";
import { steamMarketCurrencies } from "./components/SteamMarketCurrencies";

//this array would have ITEM name, image url, condition etc, price and add cart function
const array = ['','','','','','','','','','','','','','','','','','','','','','','','','']
const heroes = ['Abrams', 'Bebop', 'Dynamo', 'Grey Talon', 'Haze', 'Infernus', 'Ivy', 'Kelvin', 'Lady Geist', 'Lash', 'McGinnis', 'Mo & Krill', 'Paradox', 'Pocket', 'Seven', 'Shiv', 'Vindicta', 'Viscous', 'Warden', 'Wraith', 'Yamato',]
const fakeItems = [{id:0, price: 1, hero: 'Shiv', imgurl: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFQznaKdID5D6d23ldHSwKOmZeyEz21XvZZ12LzE9t6nigbgqkplNjihJIaLMlhpF1ZeR5c/360fx360f', rarity: 'common'}, 
                  {id:1, price: 10, hero: 'Seven', imgurl: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsQ1xmLBcF5uj2FBdy3P7HTjlH09G_hoGMkrmkNuODwG8F7ZMl2bqSoI_22ATg_0s6a2qiIofDdA5rNVmG8la5k7i6m9bi60_Jt_x9/360fx360f', rarity: 'common'}, 
                  {id:2, price: 200, hero: 'Shiv', imgurl: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFQznaKdID5D6d23ldHSwKOmZeyEz21XvZZ12LzE9t6nigbgqkplNjihJIaLMlhpF1ZeR5c/360fx360f', rarity: 'common'}, 
                  {id:3, price: 1000, hero: 'McGinnis', imgurl: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhhwszHeDFH6OO7kYSCgvq6YOKFkD1XvZRz2rmYporw3Vfk_RZkMGD6doeUcA86Yg6C-APtyO_v0Ij84sqHVshLpA/360fx360f', rarity: 'common'}, 
                  {id:4, price: 10000, hero: 'Dynamo', imgurl: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJh5C0mvLnO4TFl2Vu5cB1g_zMu92g2g3k8kZvYmmlLYeVdw5vYl-D-VDvxOzshZDovJWbnSBmvnVx7CnD30vgSw3eKYg/360fx360f', rarity: 'common'}, 
                  {id:5, price: 30000, hero: 'Haze', imgurl: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQh5hlcX0nvUOGsx8DdQBJjIAVHubSaIAlp1fb3ejxQ7dG0nZTFw_H3a--IlTwCuMQl3r2UoY6n3QLj80I5MDr0JIbBJg9qYFnRrFS_wvCv28FbcdtZVg/360fx360f', rarity: 'common'}]

let temp: any = [] //this is where filters are stored until reload

// set up feature that adds item params (hero, rarity, type) to lambda obj / storage / cookies and sends to kotlin onclick

//start working on trade functionality -> backend
// 1) send user cart to backend (all available items should be stored, we'll most likely own steam accounts with items so we'd have to implement a system that checks for items)
// 2) first, check if user has enough funds for all combined items -> send all IDs to backend, compare with database; SQL: SELECT * FROM table_example WHERE id IN (:ids)   -> (:ids) is a paramater for a list of ids (array) but for kotlin

export default function Home() {
  const [filterGlobal, setFilterGlobal] = useState(false) //checks wether user is filtering
  const [filterPlus, setFilterplus] = useState(false)
  const [filterRarity, setFilterRarity] = useState(false)
  const [filterCart, setFilterCart] = useState(false)
  const [signed, setSigned] = useState(false)
  const [tradeError, setTradeError] = useState('')

  const [checkedHeroes, setCheckedHeroes] = useState<string[]>([])
  const [checkedGlobal, setCheckedGlobal] = useState(false)

  const [inCart, setInCart] = useState<string[]>([])
  const [cartPrice, setCartPrice] = useState<number>(0)

  const [smallRange, setSmallRange] = useState<number>(0)
  const [bigRange, setBigRange] = useState<number>(0)

  const [searchTerm, setSearchTerm] = useState('')
  const [searchFilter, setSearchFilter] = useState<string[]>([])
  const [searchCondition, setSearchCondition] = useState(false)

  const [qmarkClicked, setQmarkClicked] = useState(false)

  //Profiler, check speed:
  function onRenderCallback(
    id:any, 
    phase:any, 
    actualDuration:any, 
    baseDuration:any,
    startTime:any, 
    commitTime:any, 
  ) {
    console.log({
      id,
      phase,
      actualDuration,
      baseDuration,
      startTime,
      commitTime,
    });
  }

  const isPriceInRange = (price: number) => {
    return (bigRange > 0 || smallRange > 0) ? (price <= bigRange && price >= smallRange) : true;
  };
  
  const matchesFilters = (hero: string) => {
    if (filterGlobal) {
      if (searchCondition) {
        return checkedGlobal ? (checkedHeroes.includes(hero) && searchFilter.includes(hero)) : searchFilter.includes(hero);
      } else {
        return checkedGlobal ? checkedHeroes.includes(hero) : true;
      }
    }
    return true;
  };

  //Memo optimize (needed for large amounts of data that don't necessarily need to be rerendered every time, aka filtering)
  //redesign filter function,basically first i need to check if there's a filter condition
  const filteredItems = useMemo(()=> 
    fakeItems.filter(e => 
      isPriceInRange(e.price) && matchesFilters(e.hero)
    ), [fakeItems, checkedGlobal, checkedHeroes, smallRange, bigRange, searchCondition, filterGlobal, searchFilter, isPriceInRange, matchesFilters]
  )

  const object = {
    hero: checkedHeroes
  }

  async function handleSendToApiFilter() {
    console.log(checkedHeroes)
    const response = await fetch('http://localhost:8080/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(object)
    }
    )

    console.log(response.body)
  }

  //add in cart items to cookies
  function addToCart(e: any) {
    let temp = e.target.value 
    let parsed = parseInt(temp)
    if (inCart.includes(temp)) {
      setInCart((prev) => inCart.filter((e) => e !== temp))
      const find = fakeItems.find(item => item.id === parsed);
      const price: any = find?.price
     setCartPrice((e) => e - price)
    } else {
      setInCart((prev) => [...prev, temp])
      //find id and then price
      const find = fakeItems.find(item => item.id === parsed);
      const price: any = find?.price
      setCartPrice((e) => e + price)
    }
  }

  function filterByInCart() {
    setFilterGlobal(true)
    setCheckedGlobal(true)
    setCheckedHeroes(inCart)
  }

  const userTradeObject = {
    cartValue: Number(cartPrice),
    loggedInSteamId: "TestId"
  }

  async function tradeFunctionality() {
    setTradeError('')
    setTimeout(()=> {
      setTradeError('')
    }, 3000)
    if (signed) {
      setTradeError('TRADE FAILED; SIGN IN.')
    } else {
      if (cartPrice === 0) {
        setTradeError("Empty cart.")
        return 0
      } else {
      console.log('Trade processing')
      console.log(cartPrice)
      const response = await fetch('http://localhost:8080/api/trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userTradeObject) //sent as string (id)
      })
      if (response.ok) {
        const res = await response.text()
        if (res === 'false') {
          setTradeError("Error, missing funds.")
        } else {
          setTradeError("Success, waiting for bot.")
        }
      } else {
        setTradeError("Error, internal server.")
        }
      }
    }
  }

  function zero(e: any) {
    //check tomorrow (drunk)
    setFilterGlobal(true)
    setSmallRange(e.target.value)
    console.log(smallRange)
  }

  function infinity(e: any) {
//copy fixed code above and inverse
    setFilterGlobal(true)
    setBigRange(e.target.value)
    console.log(bigRange)
  }

  function itemSearch(e:any) {
    //add search for item functionality 
    setSearchTerm(e.target.value)
    let typedText = e.target.value
    setFilterGlobal(true)
    setSearchCondition(true)
    if (typedText == '') {
      setSearchFilter([])
      setSearchCondition(false)
    } else {
    const updatedCheckedHeroes = fakeItems.filter(hero => hero.hero.toLowerCase().includes(searchTerm.toLowerCase()));
    console.log(updatedCheckedHeroes)
    setSearchFilter(updatedCheckedHeroes.map(e => e.hero))
    console.log(searchFilter)
    }
  }

  function clearFilterButton() {
    setCheckedGlobal(false)
    setCheckedHeroes([])
    setSmallRange(0)
    setBigRange(0)
    setSearchTerm('')
    setFilterGlobal(false)
    setSearchCondition(false)
  }

  function checkboxFilter(e:any) {
    //add all object (id, hero, price, etc)
    setFilterGlobal(true)
    setCheckedGlobal(true)
    let hero = e.target.value
    let temp = []
    temp.push(e.target.value)
    if (e.target.checked) {
      // Add checked hero to the array
      setFilterGlobal(true)
      setCheckedHeroes(prevHeroes => {
      const update = [...prevHeroes, hero]
      return update
      }
      );
      
    } else {
      setCheckedHeroes(prevHeroes => {
       const update = prevHeroes.filter((h) => h !== hero)
       temp = update
       if (temp.length === 0) {
        console.log(checkedHeroes)
        setCheckedGlobal(false)
        setCheckedHeroes([])
      }
       return update
      }
      );
    }
    console.log('temp:', temp)
  }

      let array = [''];

      let language = useContext(LanguageContext)
      if (language.toString() === "English") {
        console.log('english hit')
        array = languages.English
        console.log(array)
      } if (language.toString() == "Portuguese") {
        console.log('portuguese hit')
        array = languages.Portuguese
        console.log(array)
      } if (language == "Chinese") {
        array = languages.Chinese
      }

      let currencyObjectKeys = Object.keys(steamMarketCurrencies)
      let currencyContext = useContext(CurrencyContext)
      let matchingObjectKey = currencyObjectKeys.filter((e) => e === currencyContext)

      const [time, setTime] = useState(1)
      const [test, setTest]:any = useState(false)

      useEffect(()=> {
        console.log(language.toString())
        console.log(matchingObjectKey)
      }, [])



  return (
    <Profiler id='App' onRender={onRenderCallback}>
    <main className="z-10 flex min-h-screen flex-col items-center bgblack gap-8 text-white overflow-auto overflow-x-hidden">
      <div className="flex flex-col mx-auto w-[90%] md:flex-row md:w-[95%]">
      <div className="flex flex-col mx-auto h-screen w-full md:flex-row">
      <div className="flex-col w-full fade-in-largecontainer">
      <div className="flex flex-row justify-between mt-20 insidebox p-2 rounded-sm">
        <div className="">{/*You are giving:*/} {array[0]}</div>
        <div className="whitespace-nowrap">{matchingObjectKey}0 🛒</div>
      </div>
      <div className="overflow-auto p-2 tradebox h-[85%] mt-3 rounded-sm">
      <input className="w-full px-2 m-1 mb-2 mx-auto rounded-sm searchbg" placeholder={`${array[14]}`} onChange={itemSearch}></input>
      <div className={`${signed? 'hidden' : 'flex flex-col visible mx-auto text-center gap-2 mt-20'}`}>
        <div className="text-4xl">❗</div>
        <div className="text-xl font-semibold">{array[1]}</div>
        <Link href="" className="redaccenttext mt-2 font-light hover:redhoveraccent">{array[2]}</Link>
        </div>
      <div className={`${signed? 'grid gap-2 items-grid' : 'hidden'}`}>
        {fakeItems.map((e) => 
          <div className={`${checkedGlobal ? `${checkedHeroes.includes(e.hero) && e.price >= smallRange || e.price <= bigRange ? 'flex flex-col h-full w-full pb-1 px-1 insidebox rounded-sm shadow-inner border-2 borderinsidebox hover:bg-zinc-500 hover:border-blue-500' : 'hidden'}` : 'flex flex-col h-full w-full px-1 insidebox rounded-sm shadow-inner border-2 borderinsidebox pb-1 hover:bg-zinc-500 hover:border-blue-500'}`}><Image src={e.imgurl} alt='img' width={120} height={80} className="mx-auto"></Image>
            <button className={`${inCart.includes(`${e.id}`)? 'text-white justify-end redhoveraccent w-full rounded-sm' : 'w-full text-white h-fit justify-end bg-zinc-600 w-full rounded-sm transition ease-in-out delay-150 hover:bg-red-300'}`} onClick={addToCart} value={e.id}>{array[3]}</button>
          </div>
        )}
      </div>
      </div>
      <div className={`${tradeError ? 'absolute start-0 mt-[-29px] animate-show-error w-fit px-1 py-2 my-auto mx-auto justify-center items-center rounded-sm border-[1px] border-red-700 redaccent font-semibold text-sm' : 'right-[-100px] mt-10 hiddenError'}`}>{tradeError}</div>
      </div>

      <div className="fade-in-rest flex flex-col mx-auto py-10 pb-36 rounded-sm w-full order-last md:w-fit md:mx-5 md:py-0 md:order-none md:mb-0">
        <button onClick={tradeFunctionality} className="mt-20 mx-auto rounded-sm redaccent py-[10px] text-sm shadow-inner text-lg w-[65%]">{array[4]}</button>
        <div className="justify-between flex flex-col h-[85%] rounded-sm p-2 mt-3 overflow-auto">
        <div className="w-full mx-auto flex flex-col p-1 mt-3 rounded-sm text-center gap-4">
          <div className="text-center">{array[5]}</div>
          <div className="text-left flex flex-col w-full gap-4 divide-y-2">{array[6]}
            <div className="flex flex-row gap-4 mx-auto text-white">
              <input className="rounded-sm text-center w-28 searchbg sm:w-24"  placeholder="C $0" value={smallRange} onChange={zero}></input>
              <input className="rounded-sm text-center w-28 searchbg sm:w-24" placeholder="C $∞" value={bigRange} onChange={infinity}></input>
            </div>
          </div>
          <button onClick={()=> setFilterplus(!filterPlus)} className="justify-between flex flex-row"><div className="">{array[7]}</div><div>{filterPlus? '-' : '+'}</div></button>
          <div className={`${filterPlus? 'mt-[-10px] visible w-full text-left text-sm' : 'hidden'}`}>
            {heroes.map((e) => 
          <div className="flex flex-row">
              <input type="checkbox" checked={checkedHeroes.includes(e)} className="mx-2 mr-3" onChange={checkboxFilter} value={e}></input>
              <div>{e}</div>
          </div>
            )}
          </div>

          <button onClick={()=> setFilterRarity(!filterRarity)} className="justify-between flex flex-row"><div className="">{array[8]}</div><div>{filterRarity? '-' : '+'}</div></button>
          <div className={`${filterRarity? 'mt-[-10px] visible w-full text-left text-sm' : 'hidden'}`}>
            <div className="text-blue-400">{array[9]}</div> {/* Modify in components/languages once official rarities come out */}
            <div className="text-green-400">{array[10]}</div>
            <div className="text-red-400">{array[11]}</div>
          </div>
        </div>
        <button onClick={clearFilterButton} className="mx-auto border-2 border-red-400 px-6 rounded-sm">{array[12]}</button>
        </div>
        <button onClick={handleSendToApiFilter}></button>
      </div>

      <div className="flex-col w-full mt-4 md:mt-0 fade-in-largecontainer">
      <div className="flex flex-row justify-between mt-20 insidebox p-2 rounded-sm">
        <div className="">{array[13]}</div>
        <div className="whitespace-nowrap">{matchingObjectKey}{cartPrice} 🛒</div>
      </div>
      <div className="overflow-auto p-2 tradebox h-[85%] mt-3 rounded-sm">
      <input className="w-full px-2 m-1 mb-2 mx-auto rounded-sm searchbg" placeholder={`${array[14]}`} onChange={itemSearch} value={searchTerm}></input>
      <div className="grid gap-2 items-grid">
        {filteredItems.map((e) => 
          <div className={`${checkedGlobal ? 'flex flex-col h-full w-full pb-1 px-1 insidebox rounded-sm shadow-inner border-2 borderinsidebox hover:bg-zinc-500 hover:border-yellow-500' : 'flex flex-col h-full w-full px-1 insidebox rounded-sm shadow-inner border-2 borderinsidebox pb-1 hover:bg-zinc-500 hover:border-yellow-500'}`}><Image src={e.imgurl} alt='img' width={120} height={80} className="mx-auto"></Image>
            <div className="my-1 text-sm text-zinc-100">{matchingObjectKey} {e.price}</div>
            <button className={`${inCart.includes(`${e.id}`)? 'py-1 text-sm text-white justify-end redaccent rounded-sm' : 'py-1 text-sm text-white h-fit justify-end cartbutton w-full rounded-sm transition ease-in-out delay-150 hover:bg-red-300'}`} onClick={addToCart} value={e.id}>🛒</button>
          </div>
        )}
      </div>
      </div>
      </div>
      </div>
      </div>
      <div className={`${qmarkClicked ? `hidden` : `rounded-full text-black absolute end-0 bottom-0 m-2 w-12 h-12 redaccent overflow-hidden helpping`}`} onMouseEnter={() => setQmarkClicked(true)}></div>
      <Chatbot onClick={() => setQmarkClicked(true)}/>
    </main>
    </Profiler>
  );
}
