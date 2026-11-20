import useTheme from "../../hooks/useTheme";
import Button from "./Button";

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <Button variant="ghost" onClick={toggleTheme} aria-pressed={theme === "dark"}>
            {theme === "dark" ? "Giao diện sáng" : "Giao diện tối"}
        </Button>
    );
};

export default ThemeToggle;