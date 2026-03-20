import { useEffect, useMemo, useRef, useState } from "react";
import { formatPrice } from "../../utils/price.js";

const PRICE_MODE_RETAIL = "retail";
const PRICE_MODE_WHOLESALE = "wholesale";

const getBasePrice = (item, priceMode) => {
    if (priceMode === PRICE_MODE_WHOLESALE) {
        return Number.isFinite(Number(item?.wholesalePrice)) && Number(item.wholesalePrice) > 0
            ? Number(item.wholesalePrice)
            : 0;
    }

    return Number.isFinite(Number(item?.retailPrice)) && Number(item.retailPrice) > 0
        ? Number(item.retailPrice)
        : 0;
};

const normalizeDigits = (value = "") => String(value || "").replace(/[^\d]/g, "");
const normalizePriceDraft = (value = "") => {
    const raw = String(value || "").replace(/[^\d,.\s]/g, "").replace(/\s+/g, "");
    if (!raw) return "";

    const lastComma = raw.lastIndexOf(",");
    const lastDot = raw.lastIndexOf(".");
    const separatorIndex = Math.max(lastComma, lastDot);

    if (separatorIndex === -1) {
        return raw.replace(/[.,]/g, "");
    }

    const integerPart = raw.slice(0, separatorIndex).replace(/[.,]/g, "") || "0";
    const decimalPart = raw.slice(separatorIndex + 1).replace(/[.,]/g, "").slice(0, 2);
    return decimalPart.length > 0 ? `${integerPart},${decimalPart}` : `${integerPart},`;
};

const parsePriceDraft = (value = "") => {
    const normalized = normalizePriceDraft(value);
    if (!normalized) return 0;
    const parsed = Number(normalized.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
};

const formatEditablePrice = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return "";
    return formatPrice(num);
};

const buildBudgetMessage = ({
    customerName = "",
    items = [],
    prices = {},
    priceMode = PRICE_MODE_RETAIL,
}) => {
    const safeName = String(customerName || "").trim();
    const title = priceMode === PRICE_MODE_WHOLESALE ? "presupuesto mayorista" : "presupuesto";
    const greeting = safeName ? `Hola ${safeName},` : "Hola,";

    const lines = items.map((item) => {
        const price = Number(prices[item.id] ?? 0);
        const mlSuffix = item.mlLabel ? ` ${item.mlLabel}` : "";
        const currency = priceMode === PRICE_MODE_WHOLESALE ? "US$" : "$";
        const totalLine = price > 0 ? ` - ${currency} ${formatPrice(price)}` : " - Consultar";
        return `- ${item.quantity}x ${item.name}${mlSuffix}${totalLine}`;
    });

    const total = items.reduce((acc, item) => acc + (Number(prices[item.id] ?? 0) * Number(item.quantity || 0)), 0);
    const currency = priceMode === PRICE_MODE_WHOLESALE ? "US$" : "$";

    return [
        greeting,
        "",
        `Aca va el ${title} solicitado:`,
        "",
        ...lines,
        "",
        `Total: ${currency} ${formatPrice(total)}`,
        "",
        "Cualquier ajuste que necesites, te lo preparo.",
    ].join("\n");
};

export default function AdminBudgetModal({
    open = false,
    items = [],
    onClose = () => { },
    onRemoveItem = () => { },
}) {
    const [priceMode, setPriceMode] = useState(PRICE_MODE_RETAIL);
    const [prices, setPrices] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [editingDraft, setEditingDraft] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [phone, setPhone] = useState("");
    const [showPreview, setShowPreview] = useState(false);
    const previewRef = useRef(null);

    useEffect(() => {
        if (!open) return;

        setPriceMode(PRICE_MODE_RETAIL);
        setCustomerName("");
        setPhone("");
        setShowPreview(false);
        setEditingId(null);
        setEditingDraft("");
    }, [open, items]);

    useEffect(() => {
        if (!open) return;

        const nextPrices = {};
        for (const item of items) {
            nextPrices[item.id] = getBasePrice(item, priceMode);
        }
        setPrices(nextPrices);
    }, [items, open, priceMode]);

    const total = useMemo(
        () => items.reduce((acc, item) => acc + (Number(prices[item.id] ?? 0) * Number(item.quantity || 0)), 0),
        [items, prices]
    );

    const messagePreview = useMemo(
        () => buildBudgetMessage({ customerName, items, prices, priceMode }),
        [customerName, items, prices, priceMode]
    );

    useEffect(() => {
        if (!showPreview) return;

        requestAnimationFrame(() => {
            previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }, [showPreview, messagePreview]);

    if (!open) return null;

    const canSend = items.length > 0 && customerName.trim() && normalizeDigits(phone).length >= 8;

    return (
        <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="p-5 border-b flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-stone-900">Confirmar presupuesto</h2>
                        <p className="text-sm text-stone-500 mt-1">
                            Revisá productos, cantidades y ajustá precios solo para este mensaje.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3 py-2 border rounded-lg text-stone-700 hover:bg-stone-50"
                    >
                        Cerrar
                    </button>
                </div>

                <div className="p-5 space-y-5">
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setPriceMode(PRICE_MODE_RETAIL)}
                            className={`px-4 py-2 rounded-lg border ${priceMode === PRICE_MODE_RETAIL
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                }`}
                        >
                            Presupuesto minorista
                        </button>
                        <button
                            type="button"
                            onClick={() => setPriceMode(PRICE_MODE_WHOLESALE)}
                            className={`px-4 py-2 rounded-lg border ${priceMode === PRICE_MODE_WHOLESALE
                                ? "bg-amber-600 text-white border-amber-600"
                                : "bg-white text-amber-700 border-amber-300 hover:bg-amber-50"
                                }`}
                        >
                            Presupuesto mayorista
                        </button>
                    </div>

                    <div className="border rounded-xl overflow-hidden">
                        <div className="grid grid-cols-[minmax(0,1fr)_150px] bg-stone-50 border-b text-xs font-semibold uppercase tracking-wide text-stone-500">
                            <div className="px-4 py-3">Producto</div>
                            <div className="px-4 py-3 text-right">Precio</div>
                        </div>

                        {items.map((item) => {
                            const priceValue = Number(prices[item.id] ?? 0);
                            const isEditing = editingId === item.id;
                            const currency = priceMode === PRICE_MODE_WHOLESALE ? "US$" : "$";

                            return (
                                <div
                                    key={item.id}
                                    className="grid grid-cols-[minmax(0,1fr)_150px] border-b last:border-b-0 items-center"
                                >
                                    <div className="px-4 py-3">
                                        <div className="font-medium text-stone-900">
                                            {item.quantity}x {item.name}
                                        </div>
                                        <div className="text-sm text-stone-500">
                                            {item.mlLabel || "Sin ML"}
                                        </div>
                                    </div>

                                    <div className="px-4 py-3 text-right">
                                        {isEditing ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    autoFocus
                                                    value={editingDraft}
                                                    onChange={(e) => setEditingDraft(normalizePriceDraft(e.target.value))}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            setPrices((prev) => ({
                                                                ...prev,
                                                                [item.id]: parsePriceDraft(editingDraft),
                                                            }));
                                                            setEditingId(null);
                                                            setEditingDraft("");
                                                        }
                                                        if (e.key === "Escape") {
                                                            setEditingId(null);
                                                            setEditingDraft("");
                                                        }
                                                    }}
                                                    className="w-24 border rounded px-2 py-1 text-right"
                                                />
                                                <button
                                                    type="button"
                                                    className="px-2 py-1 border rounded hover:bg-green-50"
                                                    onClick={() => {
                                                        setPrices((prev) => ({
                                                            ...prev,
                                                            [item.id]: parsePriceDraft(editingDraft),
                                                        }));
                                                        setEditingId(null);
                                                        setEditingDraft("");
                                                    }}
                                                >
                                                    ✅
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="tabular-nums">
                                                    {currency} {formatPrice(priceValue)}
                                                </span>
                                                <button
                                                    type="button"
                                                    className="px-2 py-1 border rounded hover:bg-stone-50"
                                                    onClick={() => {
                                                        setEditingId(item.id);
                                                        setEditingDraft(formatEditablePrice(Math.max(0, priceValue)));
                                                    }}
                                                    title="Editar precio para este presupuesto"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    type="button"
                                                    className="px-2 py-1 border rounded hover:bg-red-50"
                                                    onClick={() => onRemoveItem(item.id)}
                                                    title="Quitar del presupuesto"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <label className="block">
                            <span className="block text-sm font-medium text-stone-700 mb-1">Nombre del cliente</span>
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2"
                                placeholder="Ej: Juli"
                            />
                        </label>

                        <label className="block">
                            <span className="block text-sm font-medium text-stone-700 mb-1">WhatsApp del cliente</span>
                            <div className="flex items-center border rounded-lg overflow-hidden">
                                <span className="px-3 py-2 bg-stone-50 text-stone-600 border-r">+54</span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={phone}
                                    onChange={(e) => setPhone(normalizeDigits(e.target.value))}
                                    className="w-full px-3 py-2 outline-none"
                                    placeholder="35334793366"
                                />
                            </div>
                        </label>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border rounded-xl bg-stone-50 px-4 py-3">
                        <div>
                            <div className="text-sm text-stone-500">Total estimado</div>
                            <div className="text-lg font-semibold text-stone-900">
                                {priceMode === PRICE_MODE_WHOLESALE ? "US$" : "$"} {formatPrice(total)}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setShowPreview((prev) => !prev)}
                                className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-white"
                            >
                                {showPreview ? "Ocultar preview de msj" : "Ver preview de msj"}
                            </button>

                            <button
                                type="button"
                                disabled={!canSend}
                                onClick={() => {
                                    const fullPhone = `54${normalizeDigits(phone)}`;
                                    const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(messagePreview)}`;
                                    window.open(url, "_blank", "noopener,noreferrer");
                                }}
                                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300"
                            >
                                Enviar presupuesto
                            </button>
                        </div>
                    </div>

                    {showPreview && (
                        <div ref={previewRef} className="border rounded-xl bg-white">
                            <div className="px-4 py-3 border-b text-sm font-medium text-stone-700">
                                Preview del mensaje
                            </div>
                            <pre className="px-4 py-4 text-sm whitespace-pre-wrap font-sans text-stone-700">
                                {messagePreview}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
