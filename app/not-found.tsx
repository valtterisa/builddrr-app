import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export default function NotFound() {
  return (
    <div className="flex flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-violet-600">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center text-white pb-6 pt-12 md:pb-12 md:pt-24  h-full">
        <h1 className="text-7xl font-extrabold mb-4 animate-bounce">404</h1>
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Page Not Found</h2>
        <p className="mb-8 text-lg text-gray-200 max-w-md text-center">
          Oops! The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-white text-violet-700 rounded-lg font-semibold shadow-lg hover:bg-violet-100 transition-colors duration-200"
        >
          Go Home
        </Link>
        <div className="mt-12 opacity-60">
          <svg
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            className="mx-auto animate-pulse"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M9 10h.01M15 10h.01M9.5 15c1.5 1 3.5 1 5 0"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </main>
      <Footer />
    </div>
  );
}
