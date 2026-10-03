import { Link } from 'react-router-dom';

export const NotFound = ({ requestedPath }) => {

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-16 sm:py-24 text-center space-y-6">
      <p className="text-6xl font-extrabold text-slate-950 dark:text-[#0bff03]">404</p>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100">
        That page does not exist
      </h1>
      {requestedPath && (
        <p className="text-slate-500 dark:text-slate-400 break-all">Nothing is served at <code>{requestedPath}</code>.</p>
      )}
      <p className="text-slate-600 dark:text-slate-300">
        The link may be mistyped or out of date. Pick a tool instead.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/tools"
          className="px-5 py-2.5 rounded-lg bg-[#0bff03] text-slate-900 font-semibold hover:bg-[#09d902] transition-colors"
        >
          Browse all tools
        </Link>
        <Link
          to="/"
          className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold hover:border-[#0bff03] transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
};
