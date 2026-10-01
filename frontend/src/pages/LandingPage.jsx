import { Link } from 'react-router-dom';
import { ASSETS } from '../constants/theme';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-slate-200">
      <img
        src={ASSETS.landingBackground}
        alt=""
        className="pointer-events-none fixed inset-0 h-full w-full object-cover object-center"
        decoding="async"
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        <main className="relative flex flex-1 flex-col items-center justify-center gap-8 px-5 py-10 lg:gap-10">
          <section className="-mt-2 w-full max-w-xl pl-1 sm:pl-2 lg:absolute lg:left-8 lg:top-[28%] lg:mt-0 lg:w-auto lg:max-w-md lg:pl-0 xl:left-12 2xl:left-16">
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-8 rounded-full bg-[#d32f2f]" aria-hidden />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d32f2f]">
                HFMS Portal
              </p>
            </div>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-[#1d3d7d] sm:text-4xl lg:text-[2.5rem]">
              Finance &amp; Management Portal
            </h1>
            <p className="mt-3 text-base font-medium text-[#1d3d7d]/90 sm:text-lg">
              ધન, યોજના અને કર્મચારી વ્યવસ્થાપન — એક જ જગ્યાએ
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
              Monitor scheme-wise budgets and expenditure, manage teams and track individual leave
              for the Board, in one secure dashboard.
            </p>
          </section>

          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-xl bg-[#1d3d7d] px-10 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#1d3d7d]/25 transition hover:bg-[#163366]"
          >
            Sign in to HFMS →
          </Link>
        </main>
      </div>
    </div>
  );
}
