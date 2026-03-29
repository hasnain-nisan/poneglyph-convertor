import { AUTHOR_NAME, GITHUB_URL, LINKEDIN_URL } from "../constants/app";
import { PoneglyphMark } from "./PoneglyphMark";

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path d="M12 .297C5.373.297 0 5.67 0 12.297c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.017-2.04-3.338.724-4.043-1.61-4.043-1.61-.546-1.385-1.333-1.754-1.333-1.754-1.09-.745.082-.729.082-.729 1.206.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.496.997.108-.775.418-1.305.761-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.47-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.009-.322 3.302 1.23a11.49 11.49 0 0 1 3.003-.404c1.018.005 2.042.137 3.003.404 2.291-1.552 3.3-1.23 3.3-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.807 5.625-5.48 5.921.43.372.823 1.103.823 2.223 0 1.606-.014 2.898-.014 3.293 0 .32.216.694.824.576C20.565 22.092 24 17.592 24 12.297 24 5.67 18.627.297 12 .297Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.026-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.638-1.85 3.37-1.85 3.601 0 4.266 2.37 4.266 5.455v6.286ZM5.337 7.433a2.065 2.065 0 1 1 0-4.13 2.065 2.065 0 0 1 0 4.13Zm1.782 13.019H3.555V9h3.564v11.452Z" />
    </svg>
  );
}

export function BrandingFooter() {
  return (
    <footer className="stone-panel mt-8 overflow-hidden p-6 sm:p-7">
      <div className="grid gap-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <PoneglyphMark />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold-200/70">Built by {AUTHOR_NAME}</p>
          <h3 className="mt-3 font-display text-2xl text-parchment-100">Crafted for public demos, portfolios, and serious data cargo.</h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            Designed and implemented by {AUTHOR_NAME} with a frontend-first focus on polished UX, modular code, and
            conversion flows that stay reliable even with heavy datasets.
          </p>
        </div>
        <div className="flex gap-3 lg:justify-end">
          <a className="social-link" href={LINKEDIN_URL} target="_blank" rel="noreferrer" aria-label="LinkedIn profile">
            <LinkedInIcon />
            <span>LinkedIn</span>
          </a>
          <a className="social-link" href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="GitHub profile">
            <GitHubIcon />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
