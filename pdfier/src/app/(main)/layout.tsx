export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex flex-col">
      <header className="bg-slate-300 p-4">
        <h1 className="text-4xl font-bold">PDFier</h1>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
