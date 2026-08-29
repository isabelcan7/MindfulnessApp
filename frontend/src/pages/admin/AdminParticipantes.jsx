import { useCallback, useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import api from '../../config/axios';
import AdminLayout from '../../components/layout/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminDataTable from '../../components/admin/AdminDataTable';
import AdminExportButton from '../../components/admin/AdminExportButton';
import AdminUsuarioModal from '../../components/admin/AdminUsuarioModal';
import ErrorAlert from '../../components/ErrorAlert';
import { formatearFecha } from '../../utils/adminUtils';

const columnas = [
    {
        clave: 'nombre_completo',
        titulo: 'Participante',
        render: (fila) => (
            <div className="min-w-0">
                <p className="font-medium text-white truncate">{fila.nombre_completo}</p>
                <p className="text-xs text-slate-400 truncate">{fila.email}</p>
            </div>
        ),
    },
    { clave: 'id_anonimo', titulo: 'ID anónimo' },
    { clave: 'edad', titulo: 'Edad', alineacion: 'derecha', render: (fila) => fila.edad ?? '—' },
    { clave: 'genero_display', titulo: 'Género' },
    { clave: 'experiencia_mindfulness_display', titulo: 'Experiencia' },
    { clave: 'total_inscripciones', titulo: 'Inscripciones', alineacion: 'derecha' },
    {
        clave: 'inscripciones_completadas',
        titulo: 'Estado',
        alineacion: 'derecha',
        render: (fila) => (
            <span className="text-xs text-slate-300 whitespace-nowrap">
                {fila.inscripciones_en_progreso} en curso · {fila.inscripciones_completadas} fin ·{' '}
                {fila.inscripciones_abandonadas} baja
            </span>
        ),
    },
    { clave: 'sesiones_completadas', titulo: 'Sesiones', alineacion: 'derecha' },
    { clave: 'cuestionarios_respondidos', titulo: 'Cuestionarios', alineacion: 'derecha' },
    {
        clave: 'date_joined',
        titulo: 'Alta',
        alineacion: 'derecha',
        render: (fila) => <span className="text-slate-300 whitespace-nowrap">{formatearFecha(fila.date_joined)}</span>,
    },
];

const filtrosActividad = [
    { valor: '', etiqueta: 'Todos' },
    { valor: 'con_inscripciones', etiqueta: 'Con inscripciones' },
    { valor: 'sin_inscripciones', etiqueta: 'Sin inscripciones' },
];

const AdminParticipantes = () => {
    const [participantes, setParticipantes] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [actividad, setActividad] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [usuarioId, setUsuarioId] = useState(null);

    const cargar = useCallback(async (texto, filtroActividad) => {
        setLoading(true);
        try {
            const params = {};
            if (texto) params.search = texto;
            if (filtroActividad) params.actividad = filtroActividad;

            const response = await api.get('/admin/participantes/', { params });
            setParticipantes(response.data);
            setError(null);
        } catch (err) {
            console.error('Error al cargar participantes:', err);
            setError('Error al cargar el listado de participantes');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const temporizador = setTimeout(() => cargar(busqueda, actividad), busqueda ? 350 : 0);
        return () => clearTimeout(temporizador);
    }, [busqueda, actividad, cargar]);

    return (
        <AdminLayout>
            <AdminPageHeader
                titulo="Participantes"
                descripcion="Todas las personas registradas como participantes, sus inscripciones y su actividad en las sesiones."
                icono={Users}
            />

            <ErrorAlert message={error} onClose={() => setError(null)} />

            <AdminDataTable
                columnas={columnas}
                filas={participantes}
                loading={loading}
                busqueda={busqueda}
                onBusquedaChange={setBusqueda}
                placeholderBusqueda="Buscar por nombre, email, ubicación..."
                mensajeVacio="No hay participantes que coincidan con los filtros"
                filtros={
                    <select
                        value={actividad}
                        onChange={(e) => setActividad(e.target.value)}
                        className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400/50 transition-all"
                    >
                        {filtrosActividad.map((opcion) => (
                            <option key={opcion.valor} value={opcion.valor} className="bg-slate-800">
                                {opcion.etiqueta}
                            </option>
                        ))}
                    </select>
                }
                acciones={<AdminExportButton tipo="participantes" onError={setError} />}
                onFilaClick={(fila) => setUsuarioId(fila.usuario_id)}
            />

            <AdminUsuarioModal usuarioId={usuarioId} onClose={() => setUsuarioId(null)} />
        </AdminLayout>
    );
};

export default AdminParticipantes;
