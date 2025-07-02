// "use client";
// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useAuthStore } from "@/store/AuthStore";
// import { FilePlus, Minimize2 } from "lucide-react";
// import Link from "next/link";

// export default function MergePage() {
//   const router = useRouter();
// //   const { user } = useAuthStore();
//   const [pdfs, setPdfs] = useState<File[]>([]);
//   const [loading, setLoading] = useState(false);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files;
//     if (files) {
//       const pdfFiles = Array.from(files).filter((file) => file.type === "application/pdf");
//       setPdfs(pdfFiles);
//     }
//   };

//   const handleMerge = async () => {
//     if (pdfs.length === 0) {
//       alert("Please select at least one PDF file to merge.");
//       return;
//     }

//     setLoading(true);
//     const formData = new FormData();
//     pdfs.forEach((pdf) => {
//       formData.append("pdfs", pdf);
//     });

//     try {
//       const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tools/merge`, {
//         method: "POST",
//         body: formData,
//       });

//       const data = await response.json();
//       if (response.ok) {
//         const url = URL.createObjectURL(new Blob([data.pdf], { type: "application/pdf" }));
//         const link = document.createElement("a");
//         link.href = url;
//         link.setAttribute("download", `merged-${new Date().toISOString()}.pdf`);
//         link.style.display = "none";
//         document.body.appendChild(link);
//         link.click();
//         setTimeout(() => {
//           URL.revokeObjectURL(url);
//           link.remove();
//         }, 0);
//       } else {
//         alert(data.detail || "Failed to merge PDFs. Please try again.");
//       }
//     } catch (error) {
//       console.error("Error merging PDFs:", error);
//       alert("Network error or unable to connect to the server.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[#A294F9] p-4">
//       <div className="w-full max-w-md">
//         <h1 className="text-3xl font-bold text-[#471396] mb-4">Merge PDFs</h1>
//         <p className="text-[#471396] mb-8">
//           Select at least two PDF files to merge into a single PDF.
//         </p>
//         <input
//           type="file"
//           accept=".pdf"
//           multiple
//           onChange={handleFileChange}
//           className="block w-full px-4 py-2 text-[#471396] bg-white border border-[#471396] rounded-md shadow-sm focus:outline-none focus:ring-[#A294F9] focus:border-[#A294F9]"
//         />
//         <button
//           className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[#471396] bg-[#A294F9] hover:bg-[#A294F9]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A294F9]"
//           onClick={handleMerge}
//           disabled={loading || pdfs.length < 2}
//         >
//           {loading ? (
//             <div className="flex items-center justify-center">
//               <Minimize2 size={20} className="animate-spin mr-2 text-[#471396]" />
//               <span>Merging...</span>
//             </div>
//           ) : (
//             <div className="flex items-center justify-center">
//               <FilePlus size={20} className="mr-2 text-[#471396]" />
//               <span>Merge PDFs</span>
//             </div>
//           )}
//         </button>
//         <p className="text-[#471396] mt-4">
//           You can also{" "}
//           <Link href="/tools/split" className="text-[#A294F9] hover:text-[#A294F9]/90">
//             split a PDF
//           </Link>
//           into multiple PDFs.
//         </p>
//       </div>
//     </div>
//   );
// }


