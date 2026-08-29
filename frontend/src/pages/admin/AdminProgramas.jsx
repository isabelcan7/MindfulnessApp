import { useCallback, useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import api from '../../config/axios';
import AdminLayout from '../../components/layout/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminDataTable from '../../components/admin/AdminDataTable';
import AdminExportButton from '../../components/admin/AdminExportButton';
import AdminBadge from '../../components/admin/AdminBadge';
import ErrorAlert from '../../components/ErrorAlert';
import { formatearFecha } from '../../utils/adminUtils';

const columnas = [
    {
        clave: 'nombre',
        titulo: 'Programa',
        render: (fila) => (
            <div className="min-w-0 max-w-xs">
                <p className="font-medium text-white truncate">{fila.nombre}</p>
                <p className="text-xs text-slate-400 truncate">
                    {fila.tipo_contexto_display} · {fila.enfoque_metodologico_display}
                </p>
            </div>
        ),
    },
    {
        clave: 'investigador',
        titulo: 'Investigador',
        valor: (fila) => fila.investigador.nombre,
        render: (fila) => (
            <div className="min-w-0">
                <p className="text-slate-100 truncate">{fila.investigador.nombre}</p>
                <p className="text-xs text-slate-400 truncate">{fila.investigador.email}</p>
            </div>
        ),
    },
    {
        clave: 'estado',
        titulo: 'Estado',
        render: (fila) => <AdminBadge valor={fila.estado} texto={fila.estado_display} />,
    },
    {
        clave: 'total_sesiones',
        titulo: 'Sesiones',
        alineacion: 'derecha',
        render: (fila) => (
            <span className={fila.total_sesiones < fila.sesiones_esperadas ? 'text-amber-300' : 'text-slate-200'}>
                {fila.total_sesiones}/{fila.sesiones_esperadas}
            </span>
        ),
    },
    { clave: 'inscritos', titulo: 'Inscritos', alineacion: 'derecha' },
    {
        clave: 'en_progreso',
        titulo: 'Progreso inscripciones',
        alineacion: 'derecha',
        render: (fila) => (
            <span className="text-xs text-slate-300 whitespace-nowrap">
                {fila.en_progreso} en curso · {fila.completados} fin · {fila.abandonados} baja
            </span>
        ),
    },
    {
        clave: 'tasa_completado',
        titulo: 'Completado',
        alineacion: 'derecha',
        render: (fila) => <span className="text-slate-200">{fila.tasa_completado}%</span>,
    },
    { clave: 'diarios', titulo: 'Diarios', alineacion: 'derecha' },
    {
        clave: 'respuestas_pre',
        titulo: 'Cuestionarios',
        alineacion: 'derecha',
        render: (fila) => (
            <span className="text-xs text-slate-300 whitespace-nowrap">
                {fila.tiene_cuestionarios ? `${fila.respuestas_pre} pre · ${fila.respuestas_post} post` : 'No usa'}
            </span>
        ),
    },
    {
        clave: 'fecha_creacion',
        titulo: 'Creado',
        alineacion: 'derecha',
        render: (fila) => <span className="text-slate-300 whitespace-nowrap">{formatearFecha(fila.fecha_creacion)}</span>,
    },
];

const estados = [
    { valor: '', etiqueta: 'Todos los estados' },
    { valor: 'publicado', etiqueta: 'Publicados' },
    { valor: 'borrador', etiqueta: 'Borradores' },
];

const AdminProgramas = () => {
    const [programas, setProgramas] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [estado, setEstado] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const cargar = useCallback(async (texto, filtroEstado) => {
        setLoading(true);
        try {
            const params = {};
            if (texto) params.search = texto;
            if (filtroEstado) params.estado = filtroEstado;

            const response = await api.get('/admin/programas/', { params });
            setProgramas(response.data);
            setError(null);
        } catch (err) {
            console.error('Error al cargar programas:', err);
            setError('Error al cargar el listado de programas');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const temporizador = setTimeout(() => cargar(busqueda, estado), busqueda ? 350 : 0);
        return () => clearTimeout(temporizador);
    }, [busqueda, estado, cargar]);

    return (
        <AdminLayout>
            <AdminPageHeader
                titulo="Programas"
                descripcion="Todos los programas de la plataforma, con su responsable, su estado de publicación y su actividad."
                icono={FileText}
            />

            <ErrorAlert message={error} onClose={() => setError(null)} />

            <AdminDataTable
                columnas={columnas}
                filas={programas}
                loading={loading}
                busqueda={busqueda}
                onBusquedaChange={setBusqueda}
                placeholderBusqueda="Buscar por programa, investigador, población..."
                mensajeVacio="No hay programas que coincidan con los filtros"
                filtros={
                    <select
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                        className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400/50 transition-all"
                    >
                        {estados.map((opcion) => (
                            <option key={opcion.valor} value={opcion.valor} className="bg-slate-800">
                                {opcion.etiqueta}
                            </option>
                        ))}
                    </select>
                }
                acciones={<AdminExportButton tipo="programas" onError={setError} />}
            />
        </AdminLayout>
    );
};

export default AdminProgramas;
