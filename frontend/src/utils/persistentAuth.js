/**
 * Módulo de autenticación persistente para admin
 * Proporciona funciones para login con sesión que NO se cae
 * 
 * Uso:
 * import { loginPersistent, getPersistentToken, refreshTokenIfNeeded } from "@/utils/persistentAuth"
 */

const PERSISTENT_TOKEN_KEY = "persistent_token";
const TOKEN_EXPIRY_KEY = "token_expiry";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Login con sesión persistente (7 días sin caída)
 * 
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<Object>} { success, token, role, user_id, message }
 */
export async function loginPersistent(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login-persistent`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok && data.access_token) {
            // Guardar token con duración extendida
            localStorage.setItem(PERSISTENT_TOKEN_KEY, data.access_token);
            // Guardar tiempo de expiración (7 días desde ahora)
            const expiryTime = new Date().getTime() + (data.expires_in_days * 24 * 60 * 60 * 1000);
            localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
            // También guardar en el token regular para compatibilidad
            localStorage.setItem("token", data.access_token);

            // Obtener datos de usuario para saber si es admin
            let isAdmin = false;
            let userData = null;
            const userRes = await fetch(`${API_URL}/user/me`, {
                headers: { "Authorization": `Bearer ${data.access_token}` }
            });
            if (userRes.ok) {
                userData = await userRes.json();
                isAdmin = !!userData.is_admin;
                // Actualiza el store global si existe Context
                const appContext = window.__appContext;
                if (appContext && appContext.setStore) {
                    appContext.setStore(prev => ({ ...prev, user: userData }));
                }
            }

            return {
                success: true,
                token: data.access_token,
                role: data.role,
                user_id: data.user_id,
                expires_in_days: data.expires_in_days,
                isAdmin,
                message: "Login exitoso",
            };
        } else {
            return {
                success: false,
                message: data.error || "Error en el login",
            };
        }
    } catch (error) {
        console.error("Error en loginPersistent:", error);
        return {
            success: false,
            message: "Error de conexión con el servidor",
        };
    }
}

/**
 * Obtiene el token persistente guardado
 * 
 * @returns {string|null} Token si existe y es válido, null si no
 */
export function getPersistentToken() {
    const token = localStorage.getItem(PERSISTENT_TOKEN_KEY);
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (!token || !expiryTime) {
        return null;
    }

    // Verificar si el token ha expirado
    const now = new Date().getTime();
    if (now > parseInt(expiryTime)) {
        // Token expirado, limpiar
        localStorage.removeItem(PERSISTENT_TOKEN_KEY);
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
        localStorage.removeItem("token");
        return null;
    }

    return token;
}

/**
 * Verifica si existe un token persistente válido
 * 
 * @returns {boolean} true si hay token válido
 */
export function hasPersistentToken() {
    return getPersistentToken() !== null;
}

/**
 * Obtiene los días restantes de sesión
 * 
 * @returns {number} Días restantes (0 si sin token o expirado)
 */
export function getPersistentTokenRemainingDays() {
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (!expiryTime) {
        return 0;
    }

    const now = new Date().getTime();
    const remaining = parseInt(expiryTime) - now;

    if (remaining <= 0) {
        return 0;
    }

    return Math.ceil(remaining / (24 * 60 * 60 * 1000));
}

/**
 * Limpia la sesión persistente (logout)
 */
export function clearPersistentToken() {
    localStorage.removeItem(PERSISTENT_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    localStorage.removeItem("token");
}

/**
 * Hook para React que maneja sesión persistente
 * Verifica si el token está próximo a expirar y notifica
 * 
 * @returns {Object} { token, remainingDays, isExpiringSoon }
 */
export function usePersistentAuth() {
    const token = getPersistentToken();
    const remainingDays = getPersistentTokenRemainingDays();
    const isExpiringSoon = remainingDays > 0 && remainingDays <= 3; // Alerta en últimos 3 días

    return {
        token,
        remainingDays,
        isExpiringSoon,
        isAuthenticated: token !== null,
    };
}
