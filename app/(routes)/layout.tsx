import { Footer } from "@/components/footer";

function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="w-full h-auto min-h-screen flex flex-col">
      <div className="flex-1">{children}</div>
      <Footer />
    </main>
  );
}
export default AppLayout;
