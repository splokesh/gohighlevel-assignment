import React from "react";
import "./App.css"
import ThemeSelector from "./components/ThemeSelector";
import SiteSelector from "./components/SiteSelector";
import { useTheme } from "./context/ThemeContext";
import { SiteProvider } from "./context/SiteContext";

function App() {
    const { theme } = useTheme();

    return (
        <div className={`text-${theme === 'dark' ? 'white' : 'black'} ${theme === 'dark' ? 'dark-theme' : 'light-theme'} px-20 py-4 h-screen`}>
            <ThemeSelector >
                <div className="my-4 ">
                    <SiteProvider>
                        <SiteSelector />
                    </SiteProvider>
                </div>
            </ThemeSelector>
        </div>
    )

}

export default App;