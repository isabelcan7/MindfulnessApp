import { useCallback, useEffect, useState } from 'react';
import { Check, ClipboardList, Minus } from 'lucide-react';
import api from '../../config/axios';
import AdminLayout from '../../components/layout/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminDataTable from '../../components/admin/AdminDataTable';
import AdminExportButton from '../../components/admin/AdminExportButton';
import AdminBadge from '../../components/admin/AdminBadge';
import AdminUsuarioModal from '../../components/admin/AdminUsuarioModal';
import ErrorAlert from '../../components/ErrorAlert';
import { formatearFecha } from '../../utils/adminUtils';

const Marca = ({ activo }) =>
    activo ? <Check className="h-4 w-4 text-emerald-400 inline" /> : <Minus className="h-4 w-4 text-slate-500 inline" />;

const columnas = [
    {
        clave: 'participante',
        titulo: 'Participante',
        valor: (fila) => fila.participante.nombre,
        render: (fila) => (
            <div className="min-w-0">
                <p className="font-medium text-white truncate">{fila.participante.nombre}</p>
                <p className="text-xs text-slate-400 truncate">
                    {fila.participante.id_anonimo} · {fila.participante.email}
                </p>
            </div>
        ),
    },
    {
        clave: 'programa',
        titulo: 'Programa',
        valor: (fila) => fila.programa.nombre,
        render: (fila) => (
            <div className="min-w-0 max-w-xs">
                <p className="text-slate-100 truncate">{fila.programa.nombre}</p>
                <p className="text-xs text-slate-400 truncate">{fila.programa.investigador}</p>
            </div>
        ),
    },
    {
        clave: 'estado',
        titulo: 'Estado',
        render: (fila) => <AdminBadge valor={fila.estado} texto={fila.estado_display} />,
    },
    {
        clave: 'progreso',
        titulo: 'Progreso',
        alineacion: 'derecha',
        render: (fila) => (
            <div className="w-32 ml-auto">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>{fila.sesiones_completadas}/{fila.total_sesiones}</span>
                    <span>{fila.progreso}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-2 rounded-full transition-all"
                        style={{ width: `${fila.progreso}%` }}
                    ></div>
                </div>
            </div>
        ),
    },
    {
        clave: 'cuestionario_pre_respondido',
        titulo: 'Pre',
        alineacion: 'derecha',
        render: (fila) => <Marca activo={fila.cuestionario_pre_respondido} />,
    },
    {
        clave: 'cuestionario_post_respondido',
        titulo: 'Post',
        alineacion: 'derecha',
        render: (fila) => <Marca activo={fila.cuestionario_post_respondido} />,
    },
    {
        clave: 'fecha_inicio',
        titulo: 'Inicio',
        alineacion: 'derecha',
        render: (fila) => <span className="text-slate-300 whitespace-nowrap">{formatearFecha(fila.fecha_inicio)}</span>,
    },
];

const estados = [
    { valor: '', etiqueta: 'Todos los estados' },
    { valor: 'en_progreso', etiqueta: 'En progreso' },
    { valor: 'completado', etiqueta: 'Completadas' },
    { valor: 'abandonado', etiqueta: 'Abandonadas' },
];

const AdminInscripciones = () => {
    const [inscripciones, setInscripciones] = useState([]);
    const [programas, setProgramas] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [estado, setEstado] = useState('');
    const [programa, setPrograma] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [usuarioId, setUsuarioId] = useState(null);

    useEffect(() => {
        const cargarProgramas = async () => {
            try {
                const response = await api.get('/admin/programas/');
                setProgramas(response.data.map((item) => ({ id: item.id, nombre: item.nombre })));
            } catch (err) {
                console.error('Error al cargar los programas para el filtro:', err);
            }
        };
        cargarProgramas();
    }, []);

    const cargar = useCallback(async (texto, filtroEstado, filtroPrograma) => {
        setLoading(true);
        try {
            const params = {};
            if (texto) params.search = texto;
            if (filtroEstado) params.estado = filtroEstado;
            if (filtroPrograma) params.programa = filtroPrograma;

            const response = await api.get('/admin/inscripciones/', { params });
            setInscripciones(response.data);
            setError(null);
        } catch (err) {
            console.error('Error al cargar inscripciones:', err);
            setError('Error al cargar el listado de inscripciones');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const temporizador = setTimeout(() => cargar(busqueda, estado, programa), busqueda ? 350 : 0);
        return () => clearTimeout(temporizador);
    }, [busqueda, estado, programa, cargar]);

    return (
        <AdminLayout>
            <AdminPageHeader
                titulo="Inscripciones"
                descripcion="Quién está enrolado en qué programa, en qué estado y con cuánto progreso."
                icono={ClipboardList}
            />

            <ErrorAlert message={error} onClose={() => setError(null)} />

            <AdminDataTable
                columnas={columnas}
                filas={inscripciones}
                loading={loading}
                busqueda={busqueda}
                onBusquedaChange={setBusqueda}
                placeholderBusqueda="Buscar por participante o programa..."
                mensajeVacio="No hay inscripciones que coincidan con los filtros"
                filtros={
                    <div className="flex flex-col sm:flex-row gap-3">
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

                        <select
                            value={programa}
                            onChange={(e) => setPrograma(e.target.value)}
                            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400/50 transition-all max-w-xs"
                        >
                            <option value="" className="bg-slate-800">Todos los programas</option>
                            {programas.map((item) => (
                                <option key={item.id} value={item.id} className="bg-slate-800">
                                    {item.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                }
                acciones={<AdminExportButton tipo="inscripciones" onError={setError} />}
                onFilaClick={(fila) => setUsuarioId(fila.participante.usuario_id)}
            />

            <AdminUsuarioModal usuarioId={usuarioId} onClose={() => setUsuarioId(null)} />
        </AdminLayout>
    );
};

export default AdminInscripciones;
