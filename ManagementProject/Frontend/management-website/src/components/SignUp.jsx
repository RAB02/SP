'use client';

import React from 'react';

export default function SignUp(){
    return(

    <div className="w-2/3 min-w-[600px] bg-white box-content border-4 shadow-2xl shadow-inner p-6 rounded-2xl mt-6 md:w-3/4 md:max-w-[500px]">
            <form className="space-y-5">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700" > Full Name </label>
                <input type="text" id="name" placeholder="John Doe"  />
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700" > Email </label>
                <input type="email" id="email" placeholder="you@example.com"/>
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700"> Password </label>
                <input type="password" id="password" placeholder="********"/>
            </div>

            <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700" > Confirm Password </label>
                <input type="password" id="confirm-password" placeholder="********" />
            </div>

            <button type="submit" className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1">
                Sign Up
            </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600"> Already have an account?{" "}
            {/* <a href="/login" className="text-indigo-600 hover:underline"> Sign in </a> */}
            </p>
        </div>
    )
}
