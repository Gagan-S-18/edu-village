import React from "react";
import "./settings-modal.css";

// ✅ ADD THIS FUNCTION (do not move existing code)
const applyTheme = (theme) => {
  document.body.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
};

// const applyFontSize = (size) => {
//     document.body.setAttribute("data-font", size);
//     localStorage.setItem("fontSize", size);
// };

const SettingsModal = ({ open, onClose }) => {
    if (!open) return null;

    // const toggleTheme = () => {
    //     const theme = localStorage.getItem("theme") === "dark" ? "light" : "dark";
    //     localStorage.setItem("theme", theme);
    //     document.body.setAttribute("data-theme", theme);
    // };

    const changeFontSize = (size) => {
        document.documentElement.style.fontSize = size;
        localStorage.setItem("fontSize", size);
    };

    return (
        <div className="settings-backdrop" onClick={onClose}>
            <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
                <h3>Settings</h3>

                <div className="setting-item">
                    <button
                        onClick={() => {
                            const current = document.body.getAttribute("data-theme") || "light";
                            applyTheme(current === "light" ? "dark" : "light");
                        }}
                    >
                        Toggle Dark / Light
                    </button>
                    <button onClick={() => changeFontSize("14px")}>Small</button>
                    <button onClick={() => changeFontSize("16px")}>Medium</button>
                    <button onClick={() => changeFontSize("18px")}>Large</button>
                </div>

                <button className="close-btn" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default SettingsModal;