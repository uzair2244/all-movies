import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="container-x py-20 text-center">
        <h1 className="font-display font-extrabold text-5xl text-[var(--color-accent)]">404</h1>
        <p className="mt-3 text-[var(--color-text-dim)]">The page you're looking for doesn't exist.</p>
        <Link href="/" className="btn btn-primary mt-6 inline-flex">
          Go Home
        </Link>
      </main>
      <Footer />
    </>
  );
}
