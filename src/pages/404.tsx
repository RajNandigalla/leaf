import Head from 'next/head';
import Link from 'next/link';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found | LeafInk</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-blue-600 mb-4">404</h1>
            <h2 className="text-3xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
            <p className="text-gray-600">
              Sorry, we couldn&apos;t find the page you&apos;re looking for.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="w-full px-6 py-3 bg-gray-200 text-gray-900 font-medium rounded-lg hover:bg-gray-300 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
