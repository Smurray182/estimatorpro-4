import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import App from "./App";
import * as serviceWorkerRegistration from "./registerServiceWorker";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);

// FIX: Change this from .register() to .unregister() to disable the service worker.
serviceWorkerRegistration.unregister();
