export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-light via-pink-light to-white p-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-purple-dark mb-4 tracking-tight">
          Lalooply
        </h1>
        <p className="text-lg text-purple mb-8 max-w-md">
          Your creative companion app — coming soon!
        </p>
        <a
          href="mailto:hello@lalooply.com"
          className="inline-block rounded-2xl bg-purple px-6 py-3 text-white font-semibold shadow-md hover:bg-purple-dark transition-colors"
        >
          Get notified
        </a>
      </div>
    </main>
  );
}
