(function () {
    const storageKey = "northwind.theme.v5";

    function preferredTheme() {
        const saved = localStorage.getItem(storageKey);
        if (saved === "dark" || saved === "light") return saved;
        return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    function apply(theme, persist) {
        const safeTheme = theme === "dark" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", safeTheme);
        document.documentElement.style.colorScheme = safeTheme;
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute("content", safeTheme === "dark" ? "#07111f" : "#0b1b35");
        if (persist !== false) localStorage.setItem(storageKey, safeTheme);
        return safeTheme;
    }

    const initialTheme = preferredTheme();
    apply(initialTheme, false);

    window.northWindTheme = {
        get: function () {
            return document.documentElement.getAttribute("data-theme") || preferredTheme();
        },
        set: function (theme) {
            return apply(theme, true);
        },
        toggle: function () {
            return apply(this.get() === "dark" ? "light" : "dark", true);
        }
    };
})();
