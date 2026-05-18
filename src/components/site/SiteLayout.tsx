import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 pt-16 lg:pt-20">{children}</main>
      <Footer />
    </div>
  );
}
