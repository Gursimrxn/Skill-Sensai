'use client';

import React from "react";
import { signOut } from 'next-auth/react';
import Image from "next/image";
import { useRouter } from "next/navigation";

export const Header: React.FC = () => {
    const router = useRouter();

    const handleProfileClick = () => {
        router.push('/profile');
    };

    return (
        <header className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center justify-center gap-3">
                <Image
                    className=""
                    src="/logo.png"
                    alt="Skill Sensai logo"
                    width={32}
                    height={32}
                    priority
                />
                <h1 className="text-xl font-bold text-gray-900 font-urbanist">
                    Skill Sensei
                </h1>
            </div>

            <div className="flex items-center gap-4">
                {/* Level badge */}
                <div className="flex items-center gap-2 bg-gray-900 text-white px-3 py-1 rounded-full text-sm">
                    <span>Level 1</span>
                </div>
                {/* Logout button */}
                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-sm border border-gray-900 text-gray-600 rounded-full px-3 py-1 transition-colors hover:bg-gray-900 hover:text-white"
                >
                    Logout
                </button>
                {/* Profile icon */}
                <div 
                    className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center cursor-pointer hover:bg-orange-600 transition-colors"
                    onClick={handleProfileClick}
                >
                    <Image src="/profile.png" alt="Profile" width={32} height={32} />
                </div>
            </div>
        </header>
    );
};
