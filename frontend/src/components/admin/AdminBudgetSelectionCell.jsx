import { useEffect, useState } from "react";

const CUSTOM_VALUE = "__custom__";

export default function AdminBudgetSelectionCell({
    checked = false,
    quantity = 1,
    onCheckedChange = () => { },
    onQuantityChange = () => { },
}) {
    const [mode, setMode] = useState(() => (quantity > 10 ? CUSTOM_VALUE : String(quantity)));
    const [customQty, setCustomQty] = useState(() => String(quantity > 10 ? quantity : ""));
    const [draftQty, setDraftQty] = useState(() => String(quantity > 10 ? quantity : ""));
    const [isEditingCustom, setIsEditingCustom] = useState(false);

    useEffect(() => {
        if (quantity > 10) {
            setMode(CUSTOM_VALUE);
            setCustomQty(String(quantity));
            setDraftQty(String(quantity));
            setIsEditingCustom(false);
            return;
        }

        setMode(String(Math.max(1, quantity || 1)));
        setCustomQty("");
        setDraftQty("");
        setIsEditingCustom(false);
    }, [quantity]);

    const confirmCustomQuantity = () => {
        const nextQty = Math.max(1, Number(draftQty) || 1);
        setCustomQty(String(nextQty));
        onQuantityChange(nextQty);
        setIsEditingCustom(false);
        if (nextQty <= 10) {
            setMode(String(nextQty));
        }
    };

    return (
        <>
            <td className="p-2 text-center align-middle">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onCheckedChange(e.target.checked)}
                    className="h-4 w-4"
                />
            </td>

            <td className="p-2 text-center align-middle">
                <div className="flex flex-col items-center gap-1">
                    <select
                        value={mode}
                        disabled={!checked}
                        onChange={(e) => {
                            const next = e.target.value;
                            setMode(next);
                            if (next === CUSTOM_VALUE) {
                                const fallback = Math.max(1, quantity || 1);
                                setDraftQty(String(fallback));
                                setCustomQty(String(fallback));
                                setIsEditingCustom(true);
                                return;
                            }
                            setIsEditingCustom(false);
                            onQuantityChange(Math.max(1, Number(next) || 1));
                        }}
                        className="w-24 border rounded px-2 py-1 text-xs sm:text-sm disabled:bg-gray-100"
                    >
                        {Array.from({ length: 10 }).map((_, idx) => {
                            const value = idx + 1;
                            return (
                                <option key={value} value={String(value)}>
                                    {value}
                                </option>
                            );
                        })}
                        {mode === CUSTOM_VALUE && !isEditingCustom && (
                            <option value={CUSTOM_VALUE}>{customQty || quantity}</option>
                        )}
                        <option value={CUSTOM_VALUE}>Elegir otra cantidad</option>
                    </select>

                    {checked && mode === CUSTOM_VALUE && isEditingCustom && (
                        <div className="flex items-center gap-1">
                            <input
                                type="number"
                                min={1}
                                step={1}
                                value={draftQty}
                                onChange={(e) => {
                                    const raw = e.target.value.replace(/[^\d]/g, "");
                                    setDraftQty(raw);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        confirmCustomQuantity();
                                    }
                                }}
                                className="w-16 border rounded px-2 py-1 text-xs sm:text-sm text-center"
                                placeholder="Cantidad"
                            />
                            <button
                                type="button"
                                onClick={confirmCustomQuantity}
                                className="px-2 py-1 border rounded text-xs sm:text-sm hover:bg-green-50"
                                title="Confirmar cantidad"
                            >
                                OK
                            </button>
                        </div>
                    )}

                    {checked && mode === CUSTOM_VALUE && !isEditingCustom && (
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setDraftQty(String(customQty || quantity || 1));
                                    setIsEditingCustom(true);
                                }}
                                className="px-2 py-1 border rounded text-xs sm:text-sm hover:bg-gray-50"
                            >
                                Editar
                            </button>
                        </div>
                    )}
                </div>
            </td>
        </>
    );
}
