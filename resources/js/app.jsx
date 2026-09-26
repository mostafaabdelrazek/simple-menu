import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';

// Vite serves this app through Blade, so there is no HTML entry for
// @vitejs/plugin-react to inject its Fast Refresh preamble into. Importing the
// virtual preamble module is the supported way to get hot reloading back. The
// import is awaited so the runtime flag is set before React initialises, and
// the statically false guard keeps the empty module out of production builds.
if (import.meta.env.DEV) {
    await import('@vitejs/plugin-react/preamble');
}

createInertiaApp({
    title: (title) => (title ? `${title} — SimpleMenu` : 'SimpleMenu'),
    resolve: (name) => import.meta.glob('./pages/**/*.jsx')[`./pages/${name}.jsx`](),
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#d97706',
    },
});