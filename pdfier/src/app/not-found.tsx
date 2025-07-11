"use client"
import react from "react";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-6xl font-bold mb-4">Page Not Found</h1>
                <p className="text-2xl text-gray-600 mb-8">Sorry, we couldn't find the page you're looking for.</p>
                <Link href="/">
                    <button className="bg-[#471396] hover:bg-[#471396]/90 text-white font-bold py-2 px-4 rounded">
                        Go back home
                    </button>
                </Link>
            </div>
        </div>
    )
}