import { useEffect, useMemo } from "react";
import ThemeContext from "./themeContext";
import useLocalStorage from "../hooks/useLocalStorage";

const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useLocalStorage("theme", "dark");

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
    }, [theme]);

    const value = useMemo(
        () => ({
            theme,
            toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark"))
        }),
        [theme, setTheme]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeProvider;