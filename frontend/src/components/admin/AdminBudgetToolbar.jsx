export default function AdminBudgetToolbar({
    isActive = false,
    selectedCount = 0,
    budgetFilter = "all",
    onBudgetFilterChange = () => { },
    onStart = () => { },
    onConfirm = () => { },
    onCancel = () => { },
}) {
    return (
        <>
            {isActive && (
                <div className="flex flex-col min-w-0">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
                        Presupuesto
                    </label>
                    <select
                        value={budgetFilter}
                        onChange={(e) => onBudgetFilterChange(e.target.value)}
                        className="border rounded px-3 py-2 sm:w-56"
                    >
                        <option value="all">Presupuesto</option>
                        <option value="selected">Ver presupuesto seleccionado</option>
                    </select>
                </div>
            )}

            <div className="flex items-end gap-2 ml-auto">
                {isActive && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 rounded border border-stone-300 text-stone-700 hover:bg-stone-50"
                    >
                        Cancelar
                    </button>
                )}

                <button
                    type="button"
                    onClick={isActive ? onConfirm : onStart}
                    disabled={isActive && selectedCount === 0}
                    className={`px-4 py-2 rounded text-white transition-colors whitespace-nowrap ${isActive
                        ? "bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300"
                        : "bg-slate-800 hover:bg-slate-900"
                        }`}
                >
                    {isActive ? `Confirmar presupuesto${selectedCount > 0 ? ` (${selectedCount})` : ""}` : "Generar presupuesto"}
                </button>
            </div>
        </>
    );
}
