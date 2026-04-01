import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { loginPersistent, getPersistentTokenRemainingDays } from "@/utils/persistentAuth";

/**
 * AdminLoginPersistent - Login con sesión persistente (7 días sin caída)
 * 
 * Uso:
 * <AdminLoginPersistent />
 * 
 * Características:
 * - Sesión que no se cae por 7 días
 * - Sin necesidad de refrescar token cada 30 minutos
 * - Mismo formulario que el login normal pero con sesión extendida
 */
export default function AdminLoginPersistent() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState(null); // 'success' o 'error'
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (message) setMessage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setMessage("Email y contraseña son requeridos");
            setMessageType("error");
            return;
        }

        setLoading(true);

        try {
            const result = await loginPersistent(formData.email, formData.password);

            if (result.success) {
                setMessage(
                    `Login exitoso! Sesión válida por ${result.expires_in_days} días`
                );
                setMessageType("success");

                // Redirigir al admin después de 1.5 segundos
                setTimeout(() => {
                    navigate("/admin/products");
                }, 1500);
            } else {
                setMessage(result.message);
                setMessageType("error");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-xl shadow-2xl p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 font-serif text-center">
                        Panel Admin
                    </h1>
                    <p className="text-gray-600 text-sm text-center mb-8">
                        Sesión persistente (7 días sin expiración)
                    </p>

                    {/* Mensaje de éxito o error */}
                    {message && (
                        <div
                            className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${messageType === "success"
                                    ? "bg-green-50 border border-green-200"
                                    : "bg-red-50 border border-red-200"
                                }`}
                        >
                            {messageType === "success" ? (
                                <CheckCircle
                                    size={20}
                                    className="text-green-600 mt-0.5 flex-shrink-0"
                                />
                            ) : (
                                <AlertCircle
                                    size={20}
                                    className="text-red-600 mt-0.5 flex-shrink-0"
                                />
                            )}
                            <p
                                className={`text-sm ${messageType === "success"
                                        ? "text-green-800"
                                        : "text-red-800"
                                    }`}
                            >
                                {message}
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="admin@example.com"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Contraseña */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? (
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
                            className={`w-full py-2 px-4 rounded-lg font-medium text-white transition-colors mt-6 ${loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                                }`}
                        >
                            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                        </button>
                    </form>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-800">
                            <strong>✓ Sesión mejorada:</strong> Tu sesión se mantendrá activa por 7 días sin
                            necesidad de revalidar cada 30 minutos.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
