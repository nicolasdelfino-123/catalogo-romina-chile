
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../js/store/appContext";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function AdminChangeEmail() {
    const { actions } = useContext(Context);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentPassword: "",
        newEmail: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState(null); // 'success' o 'error'
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (message) setMessage(null);
    };

    const validateForm = () => {
        if (!formData.currentPassword || !formData.newEmail) {
            setMessage("Todos los campos son obligatorios");
            setMessageType("error");
            return false;
        }
        if (!formData.newEmail.includes("@") || formData.newEmail.length < 3) {
            setMessage("El usuario debe tener formato email, aunque sea ficticio");
            setMessageType("error");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/auth/change-email`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({
                        currentPassword: formData.currentPassword,
                        newEmail: formData.newEmail,
                    }),
                }
            );
            const data = await response.json();
            if (response.ok) {
                setMessage("Usuario actualizado correctamente. Por seguridad, vuelve a iniciar sesión.");
                setMessageType("success");
                setFormData({ currentPassword: "", newEmail: "" });
                setTimeout(() => {
                    actions.logoutUser();
                    navigate("/admin/login");
                }, 1800);
            } else {
                setMessage(data.error || "Error al cambiar el usuario");
                setMessageType("error");
            }
        } catch (error) {
            setMessage("Error de conexión con el servidor");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 font-serif">Cambiar Usuario</h2>
            <p className="text-gray-600 text-sm mb-6">Actualiza el usuario/email de acceso</p>
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
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Contraseña Actual
                    </label>
                    <div className="relative">
                        <input
                            id="currentPassword"
                            type={showPassword ? "text" : "password"}
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            placeholder="Ingresa tu contraseña actual"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? "🙈" : "👁"}
                        </button>
                    </div>
                </div>
                <div>
                    <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-2">
                        Nuevo Usuario/Email
                    </label>
                    <input
                        id="newEmail"
                        type="text"
                        name="newEmail"
                        value={formData.newEmail}
                        onChange={handleInputChange}
                        placeholder="Ej: admin@ficticio.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded-lg font-medium text-white transition-colors ${loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                        }`}
                >
                    {loading ? "Actualizando..." : "Cambiar Usuario"}
                </button>
            </form>
        </div>
    );
}
// ...todo el archivo eliminado...
