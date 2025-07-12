import React from "react";
import Image from "next/image";
export const Header: React.FC = () => {
    return (
        <header className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
                <Image
                    className="mx-auto mb-8"
                    src="/logo.png"
                    alt="Skill Sensai logo"
                    width={50}
                    height={50}
                    priority
                />
                <h1 className="text-xl font-bold text-gray-900 font-urbanist">
                    Skill Sensei
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-gray-900 text-white px-3 py-1 rounded-full text-sm">
                    <span>Level 1</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
            <Image src="/profile.png" alt="Profile" width={32} height={32}>
              
                    </Image>
                </div>
            </div>
        </header>
    );
};
