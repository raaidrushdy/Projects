import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

function LogoMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4 w-4" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v4h4M9 12h6M9 15h6M9 9h2" />
    </svg>
  );
}

interface HeaderProps {
  // Provided on the homepage to reset the app in place (same as "Start
  // over") instead of a full navigation/reload. Omitted elsewhere (e.g.
  // /privacy), where the href alone correctly links back to "/".
  onLogoClick?: () => void;
}

export function Header({ onLogoClick }: HeaderProps = {}) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          onClick={
            onLogoClick
              ? (event) => {
                  event.preventDefault();
                  onLogoClick();
                }
              : undefined
          }
          className="flex cursor-pointer items-center gap-2.5 rounded-lg -mx-2 -my-1 px-2 py-1 outline-none transition-colors duration-180 ease-precise hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-accent/50 active:scale-[0.98]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <LogoMark />
          </span>
          <span className="font-display text-lg tracking-tight">Redrafted</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 text-sm font-medium text-muted sm:flex">
          <a
            href="#how-it-works"
            className="rounded-sm outline-none transition-colors duration-180 ease-precise hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            How it works
          </a>
          <a
            href="#faq"
            className="rounded-sm outline-none transition-colors duration-180 ease-precise hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            FAQ
          </a>
        </nav>

        <ThemeToggle />
      </div>
    </header>
  );
}
