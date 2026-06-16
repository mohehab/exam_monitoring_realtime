import { configureStore } from "@reduxjs/toolkit";
import sessionsReducer from "./slices/sessions-slice";
import eventsReducer from "./slices/events-slice";
import uiReducer from "./slices/ui-slice";
import connectionReducer from "./slices/connection-slice";

/**
 * A fresh store per client mount. Using a factory (rather than a shared
 * singleton) keeps SSR-safe and avoids cross-request state leakage.
 */
export function makeStore() {
  return configureStore({
    reducer: {
      sessions: sessionsReducer,
      events: eventsReducer,
      ui: uiReducer,
      connection: connectionReducer,
    },
    // High-frequency event batches carry only plain serializable data; the
    // default serializability check is pure overhead at this throughput.
    middleware: (getDefault) =>
      getDefault({ serializableCheck: false, immutableCheck: false }),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
