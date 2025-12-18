import React, { createContext, useContext, useEffect, useState } from "react";

type Page = "login" | "dashboard";

interface RouteContextValue {
	page: Page;
	navigate: (p: Page) => void;
	login: (token: string) => void;
	logout: () => void;
}

const RouteContext = createContext<RouteContextValue | undefined>(undefined);

export function RouteProvider({ children }: { children?: React.ReactNode }) {
	const [page, setPage] = useState<Page>("login");

	useEffect(() => {
		const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
		if (token) setPage("dashboard");
		else setPage("login");
	}, []);

	const navigate = (p: Page) => setPage(p);
	const login = (token: string) => {
		localStorage.setItem("token", token);
		setPage("dashboard");
	};
	const logout = () => {
		localStorage.removeItem("token");
		setPage("login");
	};

	// return without JSX to keep this file a valid .ts module
	return React.createElement(RouteContext.Provider, { value: { page, navigate, login, logout } }, children);
}

export function useRoute(): RouteContextValue {
	const ctx = useContext(RouteContext);
	if (!ctx) throw new Error("useRoute must be used within RouteProvider");
	return ctx;
}
