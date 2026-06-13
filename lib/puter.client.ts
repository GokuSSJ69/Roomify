/**
 * Lazy, client-only accessor for the Puter SDK singleton.
 *
 * The @heyputer/puter.js module eagerly instantiates a global `puter` object
 * on import (including touching `window.parent.document`), which crashes
 * during SSR and can break React hydration.  By deferring the import to a
 * dynamic `import()` that only runs in the browser, we guarantee the module
 * is never evaluated on the server or during the initial synchronous
 * hydration pass.
 */

let _puter: typeof import("@heyputer/puter.js").default | null = null;
let _puterPromise: Promise<typeof import("@heyputer/puter.js").default> | null = null;

/**
 * Returns the Puter SDK instance, lazily loading it on first call.
 * Always resolves on the client; throws if accidentally called on the server.
 */
export function getPuter(): Promise<typeof import("@heyputer/puter.js").default> {
    if (_puter) return Promise.resolve(_puter);

    if (typeof window === "undefined") {
        return Promise.reject(
            new Error("Puter SDK is client-only and cannot be used during SSR"),
        );
    }

    if (!_puterPromise) {
        _puterPromise = import("@heyputer/puter.js").then((mod) => {
            _puter = mod.default;
            return _puter;
        });
    }

    return _puterPromise;
}
