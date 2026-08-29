import { useCallback, useEffect, useState } from 'react';
import { GraduationCap } from 'lucide-react';
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
        titulo: 'Investigador',
        render: (fila) => (
            <div className="min-w-0">
                <p className="font-medium text-white truncate">{fila.nombre_completo}</p>
                <p className="text-xs text-slate-400 truncate">{fila.email}</p>
            </div>
        ),
    },
    {
        clave: 'experiencia_investigacion_display',
        titulo: 'Experiencia',
    },
    {
        clave: 'areas_interes',
        titulo: 'Áreas de interés',
        ordenable: false,
        render: (fila) => (
            <span className="block max-w-[200px] truncate text-slate-300 text-xs" title={(fila.areas_interes || []).join(', ')}>
                {(fila.areas_interes || []).join(', ') || '—'}
            </span>
        ),
    },
    { clave: 'total_programas', titulo: 'Programas', alineacion: 'derecha' },
    { clave: 'programas_publicados', titulo: 'Publicados', alineacion: 'derecha' },
    { clave: 'total_inscritos', titulo: 'Inscritos', alineacion: 'derecha' },
    { clave: 'total_sesiones', titulo: 'Sesiones', alineacion: 'derecha' },
    {
        clave: 'date_joined',
        titulo: 'Alta',
        alineacion: 'derecha',
        render: (fila) => <span className="text-slate-300 whitespace-nowrap">{formatearFecha(fila.date_joined)}</span>,
    },
];

const AdminInvestigadores = () => {
    const [investigadores, setInvestigadores] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [usuarioId, setUsuarioId] = useState(null);

    const cargar = useCallback(async (texto) => {
        setLoading(true);
        try {
            const response = await api.get('/admin/investigadores/', {
                params: texto ? { search: texto } : {},
            });
            setInvestigadores(response.data);
            setError(null);
        } catch (err) {
            console.error('Error al cargar investigadores:', err);
            setError('Error al cargar el listado de investigadores');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const temporizador = setTimeout(() => cargar(busqueda), busqueda ? 350 : 0);
        return () => clearTimeout(temporizador);
    }, [busqueda, cargar]);

    return (
        <AdminLayout>
            <AdminPageHeader
                titulo="Investigadores"
                descripcion="Todas las personas registradas como investigadoras, con los programas que han creado y los participantes que han alcanzado."
                icono={GraduationCap}
            />

            <ErrorAlert message={error} onClose={() => setError(null)} />

            <AdminDataTable
                columnas={columnas}
                filas={investigadores}
                loading={loading}
                busqueda={busqueda}
                onBusquedaChange={setBusqueda}
                placeholderBusqueda="Buscar por nombre, email, ubicación..."
                mensajeVacio="No hay investigadores que coincidan con la búsqueda"
                acciones={<AdminExportButton tipo="investigadores" onError={setError} />}
                onFilaClick={(fila) => setUsuarioId(fila.usuario_id)}
            />

            <AdminUsuarioModal usuarioId={usuarioId} onClose={() => setUsuarioId(null)} />
        </AdminLayout>
    );
};

export default AdminInvestigadores;
