import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../js/store/appContext";
import { AlertCircle, CheckCircle, EyeOff, Eye } from "lucide-react";

/**
 * AdminChangePassword - Componente modularizado para cambiar contraseña
 * 
 * Uso:
 * <AdminChangePassword />
 * 
 * No requiere props, usa el JWT del localStorage para autenticarse
 */
export default function AdminChangePassword() {
    const { actions } = useContext(Context);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        currentPassword: "",
        newPassword: "",
        repeatPassword: "",
    });

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);

    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState(null); // 'success' o 'error'
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Limpiar mensaje cuando el usuario empieza a escribir
        if (message) setMessage(null);
    };

    const validateForm = () => {
        if (!formData.email || !formData.currentPassword || !formData.newPassword || !formData.repeatPassword) {
            setMessage("Todos los campos son obligatorios");
            setMessageType("error");
            return false;
        }

        if (formData.newPassword !== formData.repeatPassword) {
            setMessage("Las nuevas contraseñas no coinciden");
            setMessageType("error");
            return false;
        }

        if (formData.newPassword.length < 6) {
            setMessage("La nueva contraseña debe tener al menos 6 caracteres");
            setMessageType("error");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {

            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/auth/change-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: formData.email,
                        currentPassword: formData.currentPassword,
                        newPassword: formData.newPassword,
                    }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setMessage("Contraseña actualizada. Por seguridad, vuelve a iniciar sesión.");
                setMessageType("success");
                setFormData({
                    email: "",
                    currentPassword: "",
                    newPassword: "",
                    repeatPassword: "",
                });
                setTimeout(() => {
                    actions.logoutUser();
                    navigate("/admin/login");
                }, 1800);
            } else {
                setMessage(data.error || "Error al cambiar la contraseña");
                setMessageType("error");
            }
        } catch (error) {
            console.error("Error:", error);
            setMessage("Error de conexión con el servidor");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 font-serif">
                Cambiar Contraseña
            </h2>
            <p className="text-gray-600 text-sm mb-6">
                Actualiza tu contraseña de acceso
            </p>

            {/* Mensaje de éxito o error */}
            {message && (
                <div
                    className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${messageType === "success"
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                        }`}
                >
                    {messageType === "success" ? (
                        <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                        <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    <p
                        className={`text-sm ${messageType === "success" ? "text-green-800" : "text-red-800"
                            }`}
                    >
                        {message}
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Usuario/Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Ej: attar@attar.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                {/* Contraseña actual */}
                <div>
                    <label
                        htmlFor="currentPassword"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Contraseña Actual
                    </label>
                    <div className="relative">
                        <input
                            id="currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            placeholder="Ingresa tu contraseña actual"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showCurrentPassword ? (
                                <EyeOff size={18} />
                            ) : (
                                <Eye size={18} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Nueva contraseña */}
                <div>
                    <label
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Nueva Contraseña
                    </label>
                    <div className="relative">
                        <input
                            id="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            placeholder="Ingresa una nueva contraseña"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showNewPassword ? (
                                <EyeOff size={18} />
                            ) : (
                                <Eye size={18} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Repetir nueva contraseña */}
                <div>
                    <label
                        htmlFor="repeatPassword"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Repetir Nueva Contraseña
                    </label>
                    <div className="relative">
                        <input
                            id="repeatPassword"
                            type={showRepeatPassword ? "text" : "password"}
                            name="repeatPassword"
                            value={formData.repeatPassword}
                            onChange={handleInputChange}
                            placeholder="Repite tu nueva contraseña"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            type="button"
                            onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showRepeatPassword ? (
                                <EyeOff size={18} />
                            ) : (
                                <Eye size={18} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Botón enviar */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded-lg font-medium text-white transition-colors ${loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                        }`}
                >
                    {loading ? "Actualizando..." : "Cambiar Contraseña"}
                </button>
            </form>
        </div>
    );
}
