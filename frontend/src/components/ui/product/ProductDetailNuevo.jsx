import React, { useContext, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Context } from "../../../js/store/appContext.jsx";
import sinImagen from "@/assets/sin_imagen.jpg";

/* =========================
   HELPERS
========================= */

const normalizeFlavor = (s) =>
    s.replace(/\s+/g, " ").trim().replace(/^[-•·]+/, "").trim();

const extractFlavorsFromDescription = (txt = "") => {
    const m = txt.match(/sabor\s*:\s*(.+)$/i);
    if (!m) return [];
    return [...new Set(
        m[1]
            .split(/,|\||\/|\n/)
            .map(normalizeFlavor)
            .filter(Boolean)
            .filter(f => !/^peso\b|^dimensiones\b/i.test(f))
    )];
};

const getFlavors = (product) => {
    if (!product) return [];

    if (Array.isArray(product.flavor_catalog) && product.flavor_catalog.length) {
        return product.flavor_catalog
            .filter(f => (f.stock ?? 0) > 0)
            .map(f => f.name);
    }

    if (Array.isArray(product.flavors) && product.flavors.length)
        return product.flavors;

    return extractFlavorsFromDescription(product.description || "");
};

const NAME_TO_SLUG = {
    "Perfumes masculinos": "perfumes-masculinos",
    "Femeninos": "femeninos",
    "Unisex": "unisex",
    "Cremas": "cremas",
    "Body splash victoria secret": "body-splash-victoria-secret",
    // compatibilidad nombres viejos
    "Vapes Desechables": "perfumes-masculinos",
    "Pods Recargables": "femeninos",
    "Líquidos": "unisex",
    "Resistencias": "cremas",
    "Celulares": "body-splash-victoria-secret",
    "Perfumes": "perfumes-masculinos",
};

const API = import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, "") || "";

const normalizeImagePath = (u = "") => {
    if (!u) return "";
    if (u.startsWith("/admin/uploads/")) u = u.replace("/admin", "/public");
    if (u.startsWith("/uploads/")) u = `/public${u}`;
    return u;
};

const toAbsUrl = (u = "") => {
    u = normalizeImagePath(u);
    if (!u) return "";
    if (/^https?:\/\//i.test(u)) return u;
    if (u.startsWith("/public/")) return `${API}${u}`;
    if (u.startsWith("/")) return u;
    return `${API}/${u}`;
};

const parseMl = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === "number" && Number.isFinite(value)) return Math.floor(value);
    const text = String(value).trim();
    if (!text) return null;
    const match = text.match(/\d+/);
    if (!match) return null;
    const n = Number(match[0]);
    return Number.isFinite(n) ? Math.floor(n) : null;
};

const parsePrice = (value) => {
    if (value === null || value === undefined || value === "") return null;
    if (typeof value === "number" && Number.isFinite(value)) return value;
    const normalized = String(value).replace(/\./g, "").replace(",", ".").trim();
    const n = Number(normalized);
    return Number.isFinite(n) ? n : null;
};

/* =========================
   COMPONENT
========================= */

export default function ProductDetailNuevo() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { store, actions } = useContext(Context);

    const productId = Number(id);
    const product = Number.isFinite(productId)
        ? store.products?.find(p => Number(p.id) === productId)
        : null;

    const [quantity, setQuantity] = useState(1);
    const [selectedFlavor, setSelectedFlavor] = useState("");
    const [selectedSizeMl, setSelectedSizeMl] = useState("");
    const [flavorError, setFlavorError] = useState("");
    const [activeTab, setActiveTab] = useState("desc");
    const [descExpanded, setDescExpanded] = useState(false);

    const flavors = getFlavors(product);

    const gallery =
        Array.isArray(product?.image_urls) && product.image_urls.length
            ? product.image_urls
            : product?.image_url
                ? [product.image_url]
                : [sinImagen];

    const [activeImg, setActiveImg] = useState(gallery[0]);

    const isWholesale = location.pathname.startsWith("/mayorista");
    const prefix = isWholesale ? "/mayorista" : "";

    const sizeOptions = useMemo(() => {
        const rows = [];
        const baseMl = parseMl(product?.volume_ml);
        const basePrice = parsePrice(product?.price);
        const baseWholesale = parsePrice(product?.price_wholesale);

        if (baseMl && baseMl > 0) {
            rows.push({
                ml: baseMl,
                price: basePrice && basePrice > 0 ? basePrice : null,
                price_wholesale: baseWholesale && baseWholesale > 0 ? baseWholesale : null,
            });
        }

        const rawVolumeOptions = (() => {
            if (Array.isArray(product?.volume_options)) return product.volume_options;
            if (Array.isArray(product?.volumeOptions)) return product.volumeOptions;
            if (typeof product?.volume_options === "string") {
                try {
                    const parsed = JSON.parse(product.volume_options);
                    return Array.isArray(parsed) ? parsed : [];
                } catch {
                    return [];
                }
            }
            if (typeof product?.volumeOptions === "string") {
                try {
                    const parsed = JSON.parse(product.volumeOptions);
                    return Array.isArray(parsed) ? parsed : [];
                } catch {
                    return [];
                }
            }
            if (product?.volume_options && typeof product.volume_options === "object") {
                return Object.values(product.volume_options);
            }
            if (product?.volumeOptions && typeof product.volumeOptions === "object") {
                return Object.values(product.volumeOptions);
            }
            return [];
        })();

        for (const opt of rawVolumeOptions) {
            const ml = parseMl(
                opt?.ml ??
                opt?.volume_ml ??
                opt?.size_ml ??
                opt?.volumeMl ??
                opt?.sizeMl ??
                opt?.label ??
                opt?.name
            );
            const price = parsePrice(opt?.price ?? opt?.retail_price ?? opt?.retailPrice);
            const priceWholesale = parsePrice(
                opt?.price_wholesale ??
                opt?.wholesale_price ??
                opt?.wholesalePrice
            );
            if (!ml || ml <= 0) continue;

            rows.push({
                ml,
                price: price && price > 0 ? price : (basePrice && basePrice > 0 ? basePrice : null),
                price_wholesale:
                    priceWholesale && priceWholesale > 0
                        ? priceWholesale
                        : (baseWholesale && baseWholesale > 0 ? baseWholesale : null),
            });
        }

        const byMl = new Map();
        for (const row of rows) byMl.set(row.ml, row);
        return Array.from(byMl.values()).sort((a, b) => a.ml - b.ml);
    }, [product]);

    const selectedSize =
        sizeOptions.find((opt) => String(opt.ml) === String(selectedSizeMl)) ||
        sizeOptions[0] ||
        null;

    const retailPrice = Number(selectedSize?.price ?? product?.price);
    const wholesalePrice = Number(selectedSize?.price_wholesale ?? product?.price_wholesale);
    const finalPrice = isWholesale
        ? (wholesalePrice > 0 ? wholesalePrice : null)
        : (retailPrice > 0 ? retailPrice : null);

    /* =========================
       EFFECTS
    ========================= */

    useEffect(() => window.scrollTo(0, 0), [id]);

    useEffect(() => {
        if (!store.products?.length) actions?.fetchProducts?.();
    }, []);

    useEffect(() => {
        setActiveImg(gallery[0]);
    }, [product?.id]);

    useEffect(() => {
        if (sizeOptions.length > 0) setSelectedSizeMl(String(sizeOptions[0].ml));
        else setSelectedSizeMl("");
    }, [product?.id, sizeOptions.length]);

    /* =========================
       STOCK
    ========================= */

    const getMaxStock = () => {
        if (selectedFlavor && product?.flavor_catalog) {
            const found = product.flavor_catalog.find(f => f.name === selectedFlavor);
            if (found) return found.stock;
        }
        return product?.stock ?? 0;
    };

    const getAvailableStock = () => {
        const key = selectedFlavor || "";
        const inCart = store.cart?.find(
            i => i.id === product.id && (i.selectedFlavor || "") === key
        );
        return getMaxStock() - (inCart?.quantity || 0);
    };

    /* =========================
       HANDLERS
    ========================= */

    const handleAddToCart = () => {
        if (flavors.length && !selectedFlavor) {
            setFlavorError("Elegí un sabor");
            return;
        }

        const available = getAvailableStock();

        if (available <= 0) {
            setFlavorError("Stock máximo alcanzado");
            return;
        }

        if (quantity > available) {
            setFlavorError(`Solo podés agregar ${available}`);
            return;
        }

        const productForCart = {
            ...product,
            volume_ml: selectedSize?.ml ?? product?.volume_ml,
            selected_size_ml: selectedSize?.ml ?? product?.volume_ml,
            price: selectedSize?.price ?? product?.price,
            price_wholesale: selectedSize?.price_wholesale ?? product?.price_wholesale,
        };

        actions?.addToCart(
            selectedFlavor ? { ...productForCart, selectedFlavor } : productForCart,
            quantity
        );
    };

    const handleBack = () => {

        if (product?.id) {
            sessionStorage.setItem("lastProductId", String(product.id));
        }

        // Si venimos desde un grid, preferimos retroceder en el historial
        // para preservar filtros/página y permitir que el grid restaure
        // la posición exacta mediante la ancla `lastProductId`.
        if (location.state?.fromGrid) {
            // Si hay historial, volvemos atrás; si no, usamos returnTo si existe.
            if (window.history.length > 1) {
                navigate(-1);
                return;
            }
            if (location.state?.returnTo) {
                navigate(location.state.returnTo);
                return;
            }
        }

        // Si no venimos del grid, usamos returnTo si se proporcionó, sino /products
        if (location.state?.returnTo) {
            navigate(location.state.returnTo);
            return;
        }

        navigate("/products");
    };

    // Evita crash mientras carga productos o si el ID no existe.
    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        {store.loading ? "Cargando producto..." : "Producto no encontrado"}
                    </h2>
                    <button
                        onClick={() => navigate("/products")}
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Volver a productos
                    </button>
                </div>
            </div>
        );
    }
    /* =========================
       UI
    ========================= */

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">

                {/* VOLVER */}
                <button
                    onClick={handleBack}
                    className="mb-6 text-purple-600 hover:text-purple-700"
                >
                    ← Volver
                </button>

                <div className="bg-white rounded-lg shadow-lg p-8 grid md:grid-cols-2 gap-8">

                    {/* IMAGEN */}
                    <div>
                        <img
                            src={toAbsUrl(activeImg) || sinImagen}
                            className="w-full rounded-lg"
                            onError={e => (e.currentTarget.src = sinImagen)}
                        />

                        {gallery.length > 1 && (
                            <div className="flex gap-2 mt-3">
                                {gallery.map((u, i) => (
                                    <img
                                        key={i}
                                        src={toAbsUrl(u)}
                                        onClick={() => setActiveImg(u)}
                                        className="w-16 h-16 object-contain border cursor-pointer"
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* INFO */}
                    <div>
                        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
                        {product.brand && (
                            <p className="text-lg text-purple-600 mb-4">Marca: {product.brand}</p>
                        )}


                        <div className="text-4xl font-bold text-purple-600 mb-4">
                            {finalPrice !== null
                                ? `$${Number(finalPrice).toLocaleString("es-AR")}`
                                : "Consultar"}
                        </div>
                        {sizeOptions.length > 0 && (
                            <div className="mb-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                    Tamaño: {selectedSize?.ml}ml
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {sizeOptions.map((opt) => {
                                        const active = String(opt.ml) === String(selectedSizeMl);
                                        return (
                                            <button
                                                key={opt.ml}
                                                type="button"
                                                onClick={() => setSelectedSizeMl(String(opt.ml))}
                                                className={`px-3 py-1 rounded-full text-xs border ${active
                                                    ? "border-gray-900 text-gray-900 font-semibold"
                                                    : "border-gray-300 text-gray-600 hover:border-gray-400"
                                                    }`}
                                            >
                                                {opt.ml}ml
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        <div className="mb-6">
                            <p className="text-sm text-gray-500">Categoría: {product.category_name}</p>
                        </div>
                        {product.description && (
                            <p className="text-gray-700 mb-4 leading-relaxed">
                                {product.description}
                            </p>
                        )}

                        {/* selector sabores */}
                        {flavors.length > 0 && (
                            <select
                                className="w-full border rounded px-3 py-2 mb-4"
                                value={selectedFlavor}
                                onChange={(e) => {
                                    setSelectedFlavor(e.target.value);
                                    setFlavorError("");
                                }}
                            >
                                <option value="">Elegir sabor</option>
                                {flavors.map(f => (
                                    <option key={f}>{f}</option>
                                ))}
                            </select>
                        )}

                        {flavorError && (
                            <p className="text-red-500 text-sm mb-2">{flavorError}</p>
                        )}

                        {/* cantidad */}
                        <div className="flex items-center gap-3 mb-4">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                            <span>{quantity}</span>
                            <button
                                onClick={() =>
                                    setQuantity(Math.min(getAvailableStock(), quantity + 1))
                                }
                            >
                                +
                            </button>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={getAvailableStock() <= 0}
                            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold"
                        >
                            {getAvailableStock() <= 0 ? "Sin stock" : "Agregar al carrito"}
                        </button>

                        {/* TABS */}
                        <div className="mt-8 border-b flex gap-6">
                            <button
                                onClick={() => setActiveTab("desc")}
                                className={activeTab === "desc" ? "font-semibold border-b-2 border-purple-600 pb-2" : ""}
                            >
                                Descripción
                            </button>
                            <button
                                onClick={() => setActiveTab("info")}
                                className={activeTab === "info" ? "font-semibold border-b-2 border-purple-600 pb-2" : ""}
                            >
                                Información adicional
                            </button>
                        </div>

                        {activeTab === 'desc' ? (
                            <div className="pt-4">
                                <div className="relative">
                                    <p
                                        className={`text-gray-700 whitespace-pre-line`}
                                        style={
                                            descExpanded
                                                ? { maxHeight: 'none', overflow: 'visible', display: 'block' }
                                                : { maxHeight: '12em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 8, WebkitBoxOrient: 'vertical' }
                                        }
                                    >
                                        {product.short_description || 'Sin descripción.'}
                                    </p>
                                    {(product.short_description?.length ?? 0) > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setDescExpanded((v) => !v)}
                                            className="mt-2 text-purple-600 hover:text-purple-800 text-sm flex items-center gap-1"
                                        >
                                            {descExpanded ? (
                                                <>
                                                    Ver menos
                                                    <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </>
                                            ) : (
                                                <>
                                                    Ver más
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="pt-4 space-y-3">
                                {getFlavors(product).length > 0 ? (
                                    <div>
                                        <h4 className="font-medium mb-2">Sabores disponibles</h4>
                                        <ul className="list-disc pl-5 space-y-1 text-gray-700">
                                            {getFlavors(product).map((f) => (
                                                <li key={f}>{f}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Sin información adicional.</p>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
