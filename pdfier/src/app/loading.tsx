import react from "react";

export default function Loading() {
    return (
        <div className="h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-2 text-lg font-medium text-blue-500">Loading...</p>
        </div>
    )
}
