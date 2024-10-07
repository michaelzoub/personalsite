'use client'
import Link from "next/link";
import Image from "next/image";
import steam from '/public/steam-1.svg'
import usa from '/public/United-states_flag_icon_round.svg.png'
import brazil from '/public/Brazilian_Flag_-_round.svg.png'
import china from '/public/china.png'
import dlockbanner from '/public/bannerdlock.png'
import { useState, useContext, useEffect } from "react";
import { LanguageContext } from "./components/LanguageContext";
import { CurrencyContext } from "./components/CurrencyContext";
import { UserprofilepicContext, UsernameContext } from '@/app/components/UserContext'
import { languagesnavbar } from "./components/languages";
import Deposit from "./components/depositmodal";
import { authorizationUrl } from "./service/openid";

export function Navbar({children}:any) {
	//update language and currency method, useEffect -> set as cookie if exists, else 

	const languages = [
		{ code: 'EN', name: 'English', flag: usa },
		{ code: 'PT', name: 'Portuguese', flag: brazil },
		{ code: 'CH', name: 'Chinese', flag: china },
	];

	const [openDropdown, setOpenDropdown] = useState<'language' | 'currency' | null>(null)
	const [selectedLanguage, setSelectedLanguage] = useState({ code: 'EN', name: 'English', flag: usa });
  	const [loginClick, setLoginClick] = useState(false)
	const [path, setPath] = useState("")
	const [loggedInUsername, setLoggedInUsername] = useState("")
	const [loggedInPfp, setLoggedInPfp] = useState("")
	const [loggedInBalance, setLoggedInBalance] = useState("")
	const [openProfileSettings, setOpenProfileSettings] = useState(false)

	const toggleDropdown = (dropdown: 'language' | 'currency') => {
		setOpenDropdown(openDropdown === dropdown ? null : dropdown)
	}

  const [sidebar, setSidebar] = useState(false)
  const [showBar, setShowBar] = useState(false)
  const [heightCheck, setHeightCheck] = useState(false)

  const username = useContext(UsernameContext)

	useEffect(() => {

		setPath(window.location.pathname)

		async function fetchCookies() {
			const response = await fetch("http://localhost:8080/api/usercookies", {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include',
			})
			const body = await response.json()
			console.log('response:', body)
			const splitUsername = body[0]
			setLoggedInUsername(splitUsername)
			setLoggedInPfp(body[1])
			setLoggedInBalance(body[2])
		}

		if (window.location.pathname.includes('/auth/callback') || window.location.pathname.includes('')) {
			console.log('Window.location works')
			fetchCookies()
	
		}
		
	}, [location.pathname])

	async function clearCookies() {
		const response = await fetch("http://localhost:8080/api/clearcookies", {
			method: 'POST',
			credentials: 'include'
		})
		const body = await response.json()
		console.log('cleared cookies:', body)
	}

    function sideBar() {
      if (sidebar) {
        setHeightCheck(false)
        setShowBar((e) => !e)
        setTimeout(()=> {
          setSidebar((e) => !e)
        }, 1000)
      } else {
      setHeightCheck(true)
      setSidebar((e) => !e)
      setTimeout(()=> {
        setShowBar((e) => !e)
      }, 300);
    }
    }


	let array: Array<String> = [];
	let language = useContext(LanguageContext)
	if (selectedLanguage.name === "English") {
	  console.log('english hit')
	  array = languagesnavbar.English
	  console.log(array)
	} if (selectedLanguage.name == "Portuguese") {
	  console.log('portuguese hit')
	  array = languagesnavbar.Portuguese
	  console.log(array)
	} if (selectedLanguage.name == "Chinese") {
	  array = languagesnavbar.Chinese
	}

	const [deposit, setDeposit] = useState(false)



	return (
		<UserprofilepicContext.Provider value="test">
		<CurrencyContext.Provider value="$USD">
		<UsernameContext.Provider value={loggedInUsername}>
		<LanguageContext.Provider value={selectedLanguage.name}>
		<nav className={`${sidebar? 'absolute flex flex-row overflow-hidden text-white w-full h-screen md:h-16' : `absolute flex flex-row text-white w-full overflow-x-hidden ${heightCheck ? 'h-screen' : 'h-16'} md:h-16 md:overflow-visible`}`}>
			<div className="fade-in-navbar z-10 invisible md:visible md:w-full flex justify-between text-sm">

      <div className="flex items-center space-x-6 ml-4">
				<Link href="/" className="hover:cursor-pointer mr-2">
					<Image src={dlockbanner} alt="Dlock Banner" width={140} height={60} />
				</Link>
				<Link href="/market" className="nav-tab font-bold pt-1 text-gray-500 text-sm">{array[0]}</Link>
				<Link href="/trade" className="nav-tab font-bold pt-1 text-gray-500 text-sm">{array[1]}</Link>
				<Link href="/components/statsimage" className="nav-tab font-bold pt-1 text-gray-500 text-sm">{array[2]}</Link>
			</div>
			<div className="flex items-center mr-2">
				<Link href="/payment" className="z-10 login-button redaccent rounded-sm py-[7px] flex items-center w-20 justify-center text-sm mx-1" onClick={() => setDeposit(true)}>Deposit</Link>
				<Link href="/payment" className="z-10 login-button searchbg rounded-sm py-[7px] flex items-center w-20 justify-center text-sm mx-1 text-zinc-300" onClick={() => console.log('add withdraw')}>Withdraw</Link>
				<Link href="/payment" className="z-10 login-button searchbg rounded-sm py-[7px] flex items-center w-12 justify-center text-sm mx-2 text-zinc-300" onClick={() => setDeposit(true)}>${loggedInBalance?.includes("null") ? '0' : loggedInBalance}</Link>
				<Link href={`${!loggedInUsername.includes("null")? '/' : authorizationUrl}`} className={`${!loggedInUsername.includes("null") ? "login-button searchbg flex items-center mx-3 w-16 py-1 text-sm font-bold rounded-sm" : "login-button flex items-center mx-3 w-16 py-1 text-sm font-bold rounded-sm"}`}>
					<Image src={steam} alt='steam' width={20} height={20} className={`${!loggedInUsername.includes("null") ? "hidden" : "mr-1 invert"}`} />
					{!loggedInUsername.includes("null") ? <Image src={loggedInPfp.includes("null") ? '' : loggedInPfp} alt="User's profile picture" width={30} height={30} className="rounded-sm my-auto mx-[3px]"></Image> : 'Login'}
					<button className={`${!loggedInUsername.includes("null") ? 'visible mx-2' : 'hidden'}`} onClick={() => setOpenProfileSettings((prev:any) => !prev)}>
						<svg className="visible mt-4 mr-1" width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18">
							<polyline points="0,0 9,6 18,0" fill="none" stroke="white" strokeWidth="2"></polyline>
						</svg>
						<div className={`${openProfileSettings ? "flex flex-col absolute gap-1 mt-2 mx-auto rounded-sm font-medium" : "hidden"}`}>
							<div>testing</div>
							<button onClick={clearCookies}>Logout</button>
						</div>
						<div className="hidden">{loggedInBalance}</div>
					</button>

				</Link>
			</div>
      </div>

      <div className={`${sidebar? 'absolute flex w-full flex-row justify-end h-screen md:hidden' : 'transition delay-150 flex w-full h-0 flex-row justify-end md:hidden'}`}>
          <div className="flex flex-col w-full">
            <button className={`${sidebar? 'z-20 absolute end-0 text-end m-4 text-red-400' : 'absolute end-0 text-end m-4'}`} onClick={sideBar}>═</button>
            <div className={`${sidebar? 'z-10 flex flex-row h-screen justify-end w-full transition ease-in-out delay-150 backdrop-blur' : 'w-full navbarblur'}`}>
            <div className={`${showBar? 'z-10 flex flex-col gap-4 animate-show w-[100%] tradebox h-screen pt-14 text-left px-4' : 'hiddenLogin flex flex-col gap-4 w-[100%] h-screen tradebox pt-14 px-4'}`}>
              <div className="mx-auto flex flex-row text-xl hover:cursor-pointer font-bold">d<span className="text-red-500">lock</span>.shop</div>
              <Link href="/service/api/auth/login" className="login-button flex items-center px-6 py-2 text-sm font-bold mx-auto hover:redhoveraccenttext">
					      <Image src={steam} alt='steam' width={20} height={20} className="mr-2 invert" />
					      Login
			  </Link>
              <div className="border-2 border-red-400 p-1 pl-3 rounded-md hover:text-red-400 hover:cursor-pointer">Market</div>
              <div className="border-2 border-red-400 p-1 pl-3 rounded-md hover:text-red-400 hover:cursor-pointer">Trade</div>
              <div className="border-2 border-red-400 p-1 pl-3 rounded-md hover:text-red-400 hover:cursor-pointer">FAQ</div>
            </div>
            </div>
          </div>
      </div>
		</nav>
		{children}
		</LanguageContext.Provider>
		</UsernameContext.Provider>
		</CurrencyContext.Provider>
		</UserprofilepicContext.Provider>
	);
}