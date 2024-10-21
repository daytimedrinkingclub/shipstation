import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import onboardingReducer from "./onboardingSlice";
import fileUploadReducer from "./fileUploadSlice";
import deploymentReducer from "./deploymentSlice";
import shipReducer from "./shipSlice";
const persistConfig = {
  key: "root",
  storage,
  // You can add a custom serializer if needed
  // serialize: (state) => JSON.stringify(state),
  // deserialize: (state) => JSON.parse(state),
};

const persistedReducer = persistReducer(persistConfig, onboardingReducer);

export const store = configureStore({
  reducer: {
    onboarding: persistedReducer,
    fileUpload: fileUploadReducer,
    deployment: deploymentReducer,
    ship: shipReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        // Ignore these paths in the state
        ignoredPaths: ["onboarding.register"], // Adjust this path based on your state structure
      },
    }),
});

export const persistor = persistStore(store);
