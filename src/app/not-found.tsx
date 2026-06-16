import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-canvas p-6 text-text">
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          404
        </p>
        <h1 className="mt-2 text-lg font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-muted">
          That view doesn&apos;t exist. Head back to the monitoring dashboard.
        </p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-canvas hover:opacity-90"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
