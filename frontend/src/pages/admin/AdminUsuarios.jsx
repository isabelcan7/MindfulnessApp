import { useCallback, useEffect, useState } from 'react';
import { UserCog } from 'lucide-react';
import api from '../../config/axios';
import AdminLayout from '../../components/layout/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminDataTable from '../../components/admin/AdminDataTable';
import AdminExportButton from '../../components/admin/AdminExportButton';
import AdminBadge from '../../components/admin/AdminBadge';
import AdminUsuarioModal from '../../components/admin/AdminUsuarioModal';
import ErrorAlert from '../../components/ErrorAlert';
import { ROLES } from '../../config/auth';
import { formatearFecha, formatearFechaHora } from '../../utils/adminUtils';

const columnas = [
    {
        clave: 'nombre_completo',
        titulo: 'Usuario',
        render: (fila) => (
            <div className="min-w-0">
                <p className="font-medium text-white truncate">{fila.nombre_completo || fila.username}</p>
                <p className="text-xs text-slate-400 truncate">{fila.email}</p>
            </div>
        ),
    },
    { clave: 'username', titulo: 'Nombre de usuario' },
    {
        clave: 'role',
        titulo: 'Rol',
        render: (fila) => <AdminBadge valor={fila.role} texto={fila.role_display} />,
    },
    {
        clave: 'tiene_perfil',
        titulo: 'Perfil',
        render: (fila) =>
            fila.tiene_perfil ? (
                <span className="text-emerald-300 text-xs">Completo</span>
            ) : (
                <span className="text-amber-300 text-xs">Sin perfil</span>
            ),
    },
    { clave: 'ubicacion', titulo: 'Ubicación', render: (fila) => fila.ubicacion || '—' },
    {
        clave: 'is_active',
        titulo: 'Activo',
        render: (fila) =>
            fila.is_active ? (
                <span className="text-emerald-300 text-xs">Sí</span>
            ) : (
                <span className="text-rose-300 text-xs">No</span>
            ),
    },
    {
        clave: 'date_joined',
        titulo: 'Alta',
        alineacion: 'derecha',
        render: (fila) => <span className="text-slate-300 whitespace-nowrap">{formatearFecha(fila.date_joined)}</span>,
    },
    {
        clave: 'last_login',
        titulo: 'Último acceso',
        alineacion: 'derecha',
        render: (fila) => (
            <span className="text-slate-300 whitespace-nowrap text-xs">{formatearFechaHora(fila.last_login)}</span>
        ),
    },
];

const roles = [
    { valor: '', etiqueta: 'Todos los roles' },
    { valor: ROLES.INVESTIGADOR, etiqueta: 'Investigadores' },
    { valor: ROLES.PARTICIPANTE, etiqueta: 'Participantes' },
    { valor: ROLES.ADMIN, etiqueta: 'Administradores' },
];

const AdminUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [role, setRole] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [usuarioId, setUsuarioId] = useState(null);

    const cargar = useCallback(async (texto, filtroRole) => {
        setLoading(true);
        try {
            const params = {};
            if (texto) params.search = texto;
            if (filtroRole) params.role = filtroRole;

            const response = await api.get('/admin/usuarios/', { params });
            setUsuarios(response.data);
            setError(null);
        } catch (err) {
            console.error('Error al cargar usuarios:', err);
            setError('Error al cargar el listado de usuarios');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const temporizador = setTimeout(() => cargar(busqueda, role), busqueda ? 350 : 0);
        return () => clearTimeout(temporizador);
    }, [busqueda, role, cargar]);

    return (
        <AdminLayout>
            <AdminPageHeader
                titulo="Todos los usuarios"
                descripcion="Listado completo de cuentas de la plataforma, con su rol, su perfil y su último acceso."
                icono={UserCog}
            />

            <ErrorAlert message={error} onClose={() => setError(null)} />

            <AdminDataTable
                columnas={columnas}
                filas={usuarios}
                loading={loading}
                busqueda={busqueda}
                onBusquedaChange={setBusqueda}
                placeholderBusqueda="Buscar por nombre, email, usuario..."
                mensajeVacio="No hay usuarios que coincidan con los filtros"
                filtros={
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400/50 transition-all"
                    >
                        {roles.map((opcion) => (
                            <option key={opcion.valor} value={opcion.valor} className="bg-slate-800">
                                {opcion.etiqueta}
                            </option>
                        ))}
                    </select>
                }
                acciones={<AdminExportButton tipo="usuarios" onError={setError} />}
                onFilaClick={(fila) => setUsuarioId(fila.id)}
            />

            <AdminUsuarioModal usuarioId={usuarioId} onClose={() => setUsuarioId(null)} />
        </AdminLayout>
    );
};

export default AdminUsuarios;
