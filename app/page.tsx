import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export default async function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-zinc-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold text-sm tracking-tight">
            Patchboard
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/docs"
              className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              Docs
            </Link>
            <Link href="/login">
              <Button size="sm" variant="outline">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-zinc-100 text-zinc-500 text-xs px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
          Open source · Free to use
        </div>

        <h1 className="text-5xl font-semibold tracking-tight text-zinc-900 mb-5 leading-tight">
          Dependency updates,{" "}
          <span className="text-zinc-400">reviewed not ignored</span>
        </h1>

        <p className="text-lg text-zinc-500 max-w-xl mx-auto mb-8">
          Patchboard scans your GitHub repos, shows you what&apos;s outdated,
          and lets you approve updates and raise a PR, all without leaving your
          browser.
        </p>

        <Link href="/login">
          <Button size="lg" className="gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Sign in with GitHub
          </Button>
        </Link>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-24">
        <div className="rounded-2xl border border-zinc-200 overflow-hidden shadow-xl shadow-zinc-100">
          <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-zinc-200" />
            <div className="w-3 h-3 rounded-full bg-zinc-200" />
            <div className="w-3 h-3 rounded-full bg-zinc-200" />
            <div className="flex-1 bg-zinc-200 rounded h-4 max-w-48 mx-auto" />
          </div>
          <Image
            src="/screenshot.png"
            alt="Patchboard dashboard"
            width={1200}
            height={700}
            className="w-full"
            priority
          />
        </div>
      </section>

      <section className="border-t border-zinc-100 bg-zinc-50">
        <div className="max-w-5xl mx-auto px-4 py-24">
          <h2 className="text-2xl font-semibold text-center mb-16">
            The dependency workflow that doesn&apos;t get in your way
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <div className="w-9 h-9 rounded-lg bg-zinc-900 flex items-center justify-center mb-4">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <h3 className="font-medium mb-2">Instant scanning</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Connect any GitHub repo and Patchboard scans your dependencies
                against the npm registry in seconds.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <div className="w-9 h-9 rounded-lg bg-zinc-900 flex items-center justify-center mb-4">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-medium mb-2">Review workflow</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Approve or snooze each update individually. Major version bumps
                are flagged so nothing slips through unnoticed.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <div className="w-9 h-9 rounded-lg bg-zinc-900 flex items-center justify-center mb-4">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </div>
              <h3 className="font-medium mb-2">One-click PRs</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Approve your updates and raise a single pull request with all
                changes in one go. No more nine PRs for nine packages.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-24">
        <h2 className="text-2xl font-semibold text-center mb-4">
          Simple pricing
        </h2>
        <p className="text-zinc-500 text-center mb-16">
          Start free. Upgrade when you need more.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div className="rounded-2xl border border-zinc-200 p-8">
            <div className="mb-6">
              <span className="text-sm font-medium text-zinc-500 uppercase tracking-wide">
                Free
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">
                  £0
                </span>
                <span className="text-zinc-400 text-sm">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-sm">
                <span className="text-zinc-600">
                  Up to{" "}
                  <strong className="text-zinc-900 font-medium">
                    3 repositories
                  </strong>
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span className="text-zinc-600">
                  Up to{" "}
                  <strong className="text-zinc-900 font-medium">
                    5 snapshots
                  </strong>{" "}
                  per repository
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="text-green-400" size={16} />
                <span className="text-zinc-600">One-click PRs</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="text-green-400" size={16} />
                <span className="text-zinc-600">Manual scanning</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <X className="text-red-400" size={16} />
                <span className="text-zinc-600">Weekly automatic scanning</span>
              </li>
            </ul>

            <Link href="/login">
              <Button variant="outline" className="w-full">
                Get started free
              </Button>
            </Link>
          </div>

          <div className="rounded-2xl border-2 border-zinc-900 bg-zinc-900 p-8 text-white relative">
            <div className="absolute top-4 right-4">
              <span className="text-xs font-medium bg-white text-zinc-900 px-2 py-0.5 rounded-full">
                Pro
              </span>
            </div>
            <div className="mb-6">
              <span className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
                Pro
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">
                  £5
                </span>
                <span className="text-zinc-400 text-sm">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-sm">
                <span className="text-zinc-300">
                  <strong className="text-white font-medium">Unlimited</strong>{" "}
                  repositories
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span className="text-zinc-300">
                  <strong className="text-white font-medium">Unlimited</strong>{" "}
                  snapshots
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="text-green-400" size={16} />
                <span className="text-zinc-300">One-click PRs</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="text-green-400" size={16} />
                <span className="text-zinc-300">Manual scans</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="text-green-400" size={16} />
                <span className="text-zinc-300">Weekly automatic scanning</span>
              </li>
            </ul>

            <Link href="/login">
              <Button className="w-full bg-white text-zinc-900 hover:bg-zinc-100">
                Upgrade to Pro
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl font-semibold mb-4">
          Ready to stop ignoring updates?
        </h2>
        <p className="text-zinc-500 mb-8">
          Free, open source, and takes 30 seconds to set up.
        </p>
        <Link href="/login">
          <Button size="lg" className="gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Get started free
          </Button>
        </Link>
      </section>

      <footer className="border-t border-zinc-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-xs text-zinc-400">
            Patchboard · Open source
          </span>
          <a
            href="https://github.com/ZakDev1/patchboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-400 hover:text-zinc-600"
          >
            GitHub →
          </a>
        </div>
      </footer>
    </div>
  );
}
