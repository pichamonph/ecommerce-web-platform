"use client"

import { SCTNavlink } from "@/utils/link"
import Link from "next/link"
import Logo from "./Logo"
import Profile from "./Profile"
import Notification from "./Notification"
import { usePathname } from "next/navigation"

function SCTNavbar() {
  const pathname = usePathname()

  return (
    <div className="bg-[#578FCA] w-30 hidden md:block mx-auto">
      <div className="h-screen flex flex-col justify-between items-center py-4">

        <div className="flex flex-col items-center">
          <Logo />
          {SCTNavlink.map((item, index) => {
            const Itemicon = item.icon
            const isActive = pathname === item.href
            return (
              <div key={index} className="w-full h-16 flex justify-center items-center">
                <Link href={item.href} className={`relative group text-white font-medium ${ isActive ? "text-[#578FCA] p-3 bg-[#f8fbff] rounded-2xl  hover:rounded-r-none" : "text-white p-0"} hover:p-3 hover:bg-[#f8fbff] hover:rounded-l-2xl`}>
                  <Itemicon className={` group-hover:text-[#578FCA] ${ isActive ? "text-[#578FCA] " : "text-white "} text-2xl`} />
                  <span className="absolute left-full top-0 ml-0 px-3 py-2.5  bg-[#f8fbff] rounded-r-2xl text-[#578FCA] text-xl opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-99">
                    {item.label}
                  </span>
                </Link>
              </div>

            )
          })}
        </div>

        <div className="flex flex-col items-center">
            <Notification />
            <Profile />
          
        </div>

      </div>
    </div>
  )
}
export default SCTNavbar