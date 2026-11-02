import React, { createContext, useContext, useEffect, useState } from "react";

export type AppRoute = "browse" | "login" | "mine" | "reports";

interface HashRouterContextType {
  route: AppRoute;
  itemId: string | null;
  navigate: (to: string) => void;
}

const HashRouterContext = createContext<HashRouterContextType | undefined>(undefined);

export const HashRouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const parseHash = () => {
    const raw = window.location.hash || "#/browse";
    let activeRoute: AppRoute = "browse";
    let activeItemId: string | null = null;

    if (raw.startsWith("#/login")) {
      activeRoute = "login";
    } else if (raw.startsWith("#/mine")) {
      activeRoute = "mine";
    } else if (raw.startsWith("#/reports")) {
      activeRoute = "reports";
    }

    if (raw.includes("#item=")) {
      activeItemId = raw.split("#item=")[1] || null;
    }

    return { route: activeRoute, itemId: activeItemId };
  };

  const [state, setState] = useState(parseHash);

  useEffect(() => {
    const handleHashChange = () => {
      setState(parseHash());
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigate = (to: string) => {
    window.location.hash = to.startsWith("#") ? to : `#${to}`;
  };

  return (
    <HashRouterContext.Provider value={{ route: state.route, itemId: state.itemId, navigate }}>
      {children}
    </HashRouterContext.Provider>
  );
};

export const useHashRouter = () => {
  const context = useContext(HashRouterContext);
  if (!context) {
    throw new Error("useHashRouter must be used within a HashRouterProvider");
  }
  return context;
};
