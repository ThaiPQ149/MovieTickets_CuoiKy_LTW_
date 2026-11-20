import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../api/axios";
import AuthContext from "./authContext";

const TOKEN_KEY = "token";

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

    useEffect(() => {
        if (!localStorage.getItem(TOKEN_KEY)) {
            return undefined;
        }

        let cancelled = false;

        const loadUser = async () => {
            try {
                const { data } = await api.get("/auth/me");
                if (!cancelled) {
                    setUser(data.user);
                }
            } catch {
                localStorage.removeItem(TOKEN_KEY);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadUser();

        return () => {
            cancelled = true;
        };
    }, []);

    const saveSession = useCallback(({ token, user: nextUser }) => {
        localStorage.setItem(TOKEN_KEY, token);
        setUser(nextUser);
        return nextUser;
    }, []);

    const login = useCallback(async (credentials) => {
        const { data } = await api.post("/auth/login", credentials);
        return saveSession(data);
    }, [saveSession]);

    const register = useCallback(async (payload) => {
        const { data } = await api.post("/auth/register", payload);
        return saveSession(data);
    }, [saveSession]);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
    }, []);

    const value = useMemo(
        () => ({ user, loading, login, register, logout }),
        [user, loading, login, register, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;