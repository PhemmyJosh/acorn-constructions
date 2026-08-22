import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

/**
 * Public site chrome. Everything under `(site)` is a marketing page and gets
 * the fixed header, the shared footer, and the page <main> landmark.
 *
 * The `(site)` folder is a route group, so it adds nothing to the URL: this
 * layout wraps `/`, `/about`, `/services`, and so on, but not `/admin`.
 */
export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
