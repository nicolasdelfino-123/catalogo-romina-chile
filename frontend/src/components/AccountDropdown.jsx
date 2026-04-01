import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";   // 👈 importá useNavigate
import { Context } from "../js/store/appContext.jsx";

export default function AccountDropdown() {
    const { store, actions } = useContext(Context);
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const navigate = useNavigate();  // 👈 inicializá navigate

    useEffect(() => {
        const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("click", onClick);
        return () => document.removeEventListener("click", onClick);
    }, []);

    // Si NO hay usuario -> mostrar "Ingresar"
    console.log("USER:", store.user);
    if (!store.user) return null;

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 bg-transparent text-gray-200 px-3 py-2 rounded-lg shadow-none hover:bg-white/10 focus:outline-none focus:ring-0"
                title="Mi cuenta"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0v.75H4.5v-.75z" />
                </svg>
                <span className="hidden md:inline text-sm">Hola, Administrador</span>
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0f0f10] text-gray-200 rounded-xl shadow-2xl border border-yellow-500/20 p-2 z-50">

                    <div className="px-3 py-2 text-sm text-gray-400">
                        Hola Administrador
                    </div>

                    <button
                        onClick={() => {
                            setOpen(false);
                            navigate("/admin/products");
                        }}
                        className="block w-full text-left px-3 py-2 text-gray-300 bg-transparent rounded-md hover:bg-[#1c1c1c] hover:text-amber-300 transition-all duration-200"
                    >
                        Panel Admin
                    </button>

                    <button
                        onClick={() => {
                            actions.logoutUser();
                            setOpen(false);
                            navigate("/");
                        }}
                        className="block w-full text-left px-3 py-2 text-gray-300 bg-transparent rounded-md hover:bg-[#1c1c1c] hover:text-amber-300 transition-all duration-200"
                    >
                        Cerrar sesión
                    </button>

                </div>
            )}
        </div>
    );
}

function MenuItem({ to, text, onClick }) {
    return (
        <Link to={to} className="block px-3 py-2 rounded-md hover:bg-gray-100" onClick={onClick}>
            {text}
        </Link>
    );
}
