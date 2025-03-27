import React from 'react';
import { FcGoogle } from 'react-icons/fc';

const GoogleLogin = () => {
    return (
        <div className="flex flex-col items-center gap-4 p-8">
            <h1 className="text-2xl font-semibold text-gray-800">Welcome Back</h1>
            <button className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                <FcGoogle className="w-5 h-5" />
                <div className="h-5 w-[1px] bg-[#FF0000]"></div>
                <span className="text-sm font-medium">Sign in with Google</span>
            </button>
        </div>
    )
}

export default GoogleLogin; 