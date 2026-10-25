import { createStore } from "zustand/vanilla";
import { createJSONStorage, persist } from "zustand/middleware";

export type RecordState<T> = { value: T; ready: boolean; available: boolean };

// Synchronous browser records retain the existing save-or-fail contract. Persist owns
// serialization and hydration; this adapter only bridges legacy keys and validation.
export function createPersistedRecord<T>(options: {
  name: string;
  initial: T;
  parse: (value: unknown) => T;
  storage?: () => Storage;
  legacy?: (storage: Storage) => { value: unknown; keys: string[] } | null;
}) {
  const storage = options.storage ?? (() => window.localStorage);
  let legacyKeys: string[] = [];
  let hydrationError: unknown;
  let hydratedValue: { value: T } | undefined;
  let saving = false;
  let pending: RecordState<T> | undefined;
  let restore: (state: Partial<RecordState<T>>) => void;
  const store = createStore<RecordState<T>, [["zustand/persist", { value: T }]]>(
    (set, get, api) => {
      restore = set;
      // persist normally publishes before writing. Buffer explicit saves so subscribers
      // never observe uncommitted stock/settings when browser storage rejects a write.
      const bufferedSet: typeof set = (partial, replace) => {
        const current = pending ?? get();
        const next = typeof partial === "function" ? partial(current) : partial;
        const complete = replace ? (next as RecordState<T>) : { ...current, ...next };
        if (saving) pending = complete;
        else set(complete, true);
      };
      api.setState = bufferedSet;
      return persist<RecordState<T>, [], [], { value: T }>(
        () => ({ value: options.initial, ready: false, available: true }),
        {
          name: options.name,
          version: 1,
          skipHydration: true,
          partialize: ({ value }) => ({ value }),
          storage: createJSONStorage(() => ({
            getItem(name) {
              legacyKeys = [];
              const target = storage();
              const current = target.getItem(name);
              if (current !== null) return current;
              const legacy = options.legacy?.(target);
              if (!legacy) return null;
              const value = options.parse(legacy.value);
              legacyKeys = legacy.keys;
              return JSON.stringify({ state: { value }, version: 0 });
            },
            setItem(name, value) {
              const target = storage();
              target.setItem(name, value);
              // Cleanup failure must not turn a successfully committed write into failure.
              try {
                const legacy = options.legacy?.(target);
                if (legacy) {
                  options.parse(legacy.value);
                  legacyKeys = legacy.keys;
                }
              } catch {
                /* Keep malformed legacy records for manual recovery. */
              }
              for (const key of legacyKeys) {
                try {
                  target.removeItem(key);
                } catch {
                  /* Retry is safe: new data wins. */
                }
              }
              legacyKeys = [];
            },
            removeItem: (name) => storage().removeItem(name),
          })),
          migrate: (state, version) => {
            if (version !== 0) throw new Error("Unsupported storage version");
            return { value: options.parse((state as { value?: unknown })?.value) };
          },
          merge: (state, current) => {
            const value =
              state === undefined
                ? options.initial
                : options.parse((state as { value?: unknown })?.value);
            hydratedValue = { value };
            return { ...current, value };
          },
          onRehydrateStorage: () => {
            hydrationError = undefined;
            hydratedValue = undefined;
            const previous = get();
            return (_state, error) => {
              hydrationError = error;
              if (error) set({ ...previous, ...hydratedValue, ready: true, available: false });
              else set({ ready: true, available: true });
            };
          },
        },
      )(bufferedSet, () => pending ?? get(), api);
    },
  );
  return {
    store,
    read() {
      if (typeof window === "undefined") return store.getInitialState();
      void store.persist.rehydrate();
      if (hydrationError) throw hydrationError;
      return store.getState();
    },
    save(value: T) {
      if (typeof window === "undefined") throw new Error("Browser storage required");
      const validated = options.parse(value);
      const previous = store.getState();
      saving = true;
      pending = undefined;
      try {
        store.setState({ value: validated });
        pending = undefined;
        saving = false;
        restore({ value: validated, ready: true, available: true });
      } catch (error) {
        pending = undefined;
        saving = false;
        restore({ ...previous, available: false });
        throw error;
      }
    },
  };
}
