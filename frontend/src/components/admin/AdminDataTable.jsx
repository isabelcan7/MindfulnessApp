import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Inbox, Loader2, Search } from 'lucide-react';

const AdminDataTable = ({
    columnas,
    filas,
    loading = false,
    busqueda = '',
    onBusquedaChange,
    placeholderBusqueda = 'Buscar...',
    filtros = null,
    acciones = null,
    mensajeVacio = 'No hay datos que mostrar',
    onFilaClick = null,
    claveFila = (fila) => fila.id,
}) => {
    const [orden, setOrden] = useState({ campo: null, ascendente: true });

    const filasOrdenadas = useMemo(() => {
        if (!orden.campo) return filas;

        const columna = columnas.find((col) => col.clave === orden.campo);
        const valorDe = columna?.valor || ((fila) => fila[orden.campo]);

        return [...filas].sort((a, b) => {
            const valorA = valorDe(a);
            const valorB = valorDe(b);

            if (valorA === valorB) return 0;
            if (valorA === null || valorA === undefined) return 1;
            if (valorB === null || valorB === undefined) return -1;

            const comparacion = typeof valorA === 'number' && typeof valorB === 'number'
                ? valorA - valorB
                : String(valorA).localeCompare(String(valorB), 'es', { sensitivity: 'base' });

            return orden.ascendente ? comparacion : -comparacion;
        });
    }, [filas, orden, columnas]);

    const alternarOrden = (columna) => {
        if (columna.ordenable === false) return;
        setOrden((previo) => ({
            campo: columna.clave,
            ascendente: previo.campo === columna.clave ? !previo.ascendente : true,
        }));
    };

    return (
        <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-teal-500/10 to-emerald-500/10 blur-2xl rounded-3xl"></div>
            <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 shadow-lg overflow-hidden">
                <div className="p-5 border-b border-white/10 flex flex-col md:flex-row md:items-center gap-4">
                    {onBusquedaChange && (
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                value={busqueda}
                                onChange={(e) => onBusquedaChange(e.target.value)}
                                placeholder={placeholderBusqueda}
                                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all"
                            />
                        </div>
                    )}
                    {filtros}
                    {acciones}
                </div>

                {loading ? (
                    <div className="py-16 flex flex-col items-center justify-center">
                        <Loader2 className="h-8 w-8 text-cyan-300 animate-spin" />
                        <p className="mt-3 text-sm text-slate-300">Cargando datos...</p>
                    </div>
                ) : filasOrdenadas.length === 0 ? (
                    <div className="py-16 flex flex-col items-center justify-center text-center px-6">
                        <div className="bg-white/5 rounded-full p-4 mb-4">
                            <Inbox className="h-7 w-7 text-slate-400" />
                        </div>
                        <p className="text-slate-300">{mensajeVacio}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10">
                                    {columnas.map((columna) => (
                                        <th
                                            key={columna.clave}
                                            onClick={() => alternarOrden(columna)}
                                            className={`px-5 py-3 font-semibold text-slate-300 whitespace-nowrap ${columna.alineacion === 'derecha' ? 'text-right' : 'text-left'
                                                } ${columna.ordenable === false ? '' : 'cursor-pointer hover:text-white select-none'}`}
                                        >
                                            <span className="inline-flex items-center gap-1.5">
                                                {columna.titulo}
                                                {orden.campo === columna.clave && (
                                                    orden.ascendente
                                                        ? <ArrowUp className="h-3.5 w-3.5 text-cyan-300" />
                                                        : <ArrowDown className="h-3.5 w-3.5 text-cyan-300" />
                                                )}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filasOrdenadas.map((fila) => (
                                    <tr
                                        key={claveFila(fila)}
                                        onClick={onFilaClick ? () => onFilaClick(fila) : undefined}
                                        className={`border-b border-white/5 last:border-0 transition-colors ${onFilaClick ? 'cursor-pointer hover:bg-white/10' : 'hover:bg-white/5'
                                            }`}
                                    >
                                        {columnas.map((columna) => (
                                            <td
                                                key={columna.clave}
                                                className={`px-5 py-3.5 text-slate-200 ${columna.alineacion === 'derecha' ? 'text-right' : 'text-left'
                                                    }`}
                                            >
                                                {columna.render ? columna.render(fila) : fila[columna.clave]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && filasOrdenadas.length > 0 && (
                    <div className="px-5 py-3 border-t border-white/10 text-xs text-slate-400">
                        {filasOrdenadas.length} {filasOrdenadas.length === 1 ? 'registro' : 'registros'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDataTable;
