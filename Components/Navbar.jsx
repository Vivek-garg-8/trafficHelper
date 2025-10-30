// "use client"
import React from 'react'
import Link from 'next/link'

const Navbar = () => {
    return (
        <div className='bg-slate-800 text-white p-4 px-10 text-3xl mb-2 flex justify-between items-center'>
            <div className='py-1'>
             Traffic Light Helper
            </div>
            <div className='flex gap-5 text-center'>
                <Link href="/" className='float-right mt-1 py-1 hover:text-4xl'>Home</Link >
                <Link href="/About" className='float-right mt-1 py-1 hover:text-4xl'>About</Link >
                <Link href="/Contact" className='float-right mt-1 py-1 hover:text-4xl'>Contact</Link >
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
                    Log in
                </button>
            </div>
        </div>
    )
}

export default Navbar
