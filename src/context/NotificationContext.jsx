import { useState, useCallback, useMemo, useContext, useRef } from "react";
import { NotificationContext } from "./notification-context.js";
import { UiPreferencesContext } from "./ui-preferences-context.js";
import { motion, AnimatePresence } from "motion/react";

export function NotificationProvider({ children }) {
    const [notification, setNotification] = useState(null);
    const timeoutRef = useRef(null);
    const uiPrefs = useContext(UiPreferencesContext);

    const showNotification = useCallback((message, type = "success") => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setNotification({ message, type });
        
        if (uiPrefs && uiPrefs.playUiSound) {
            uiPrefs.playUiSound(type === "success" ? "success" : "action");
        }

        timeoutRef.current = setTimeout(() => {
            setNotification(null);
            timeoutRef.current = null;
        }, 3000);
    }, [uiPrefs]);

    const value = useMemo(() => ({
        showNotification
    }), [showNotification]);

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <AnimatePresence>
                {notification && (
                    <div className="fixed top-4 left-0 right-0 z-[100] flex justify-center pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`px-6 py-2 rounded-full shadow-lg text-white font-medium ${
                                notification.type === "success" ? "bg-green-500" : "bg-red-500"
                            }`}
                        >
                            {notification.message}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </NotificationContext.Provider>
    );
}
