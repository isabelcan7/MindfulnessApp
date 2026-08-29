import { useEffect, useState } from 'react';
import { Loader2, Mail, MapPin, Briefcase, Phone, Calendar, X } from 'lucide-react';
import api from '../../config/axios';
import AdminBadge from './AdminBadge';
import { formatearFecha, formatearFechaHora } from '../../utils/adminUtils';

const Dato = ({ icono: Icono, etiqueta, valor }) => (
    <div className="flex items-start gap-3">
        <div className="mt-0.5 text-slate-400">
            {Icono && <Icono className="h-4 w-4" />}
        </div>
        <div>
            <p className="text-xs text-slate-400">{etiqueta}</p>
            <p className="text-sm text-slate-100">{valor || '—'}</p>
        </div>
    </div>
);

const AdminUsuarioModal = ({ usuarioId, onClose }) => {
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!usuarioId) return;

        const cargar = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`/admin/usuarios/${usuarioId}/`);
                setUsuario(response.data);
            } catch (err) {
                console.error('Error al cargar el usuario:', err);
                setError('No se ha podido cargar la ficha del usuario');
            } finally {
                setLoading(false);
            }
        };

        cargar();
    }, [usuarioId]);

    if (!usuarioId) return null;

    const investigador = usuario?.perfil_investigador;
    const participante = usuario?.perfil_participante;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-900 to-teal-950 border border-white/10 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl px-6 py-4 border-b border-white/10 flex items-start justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-white">
                            {loading ? 'Cargando...' : usuario?.nombre_completo || 'Ficha de usuario'}
                        </h3>
                        {usuario && (
                            <div className="mt-2 flex items-center gap-2">
                                <AdminBadge valor={usuario.role} texto={usuario.role_display} />
                                {!usuario.is_active && <AdminBadge valor="abandonado" texto="Inactivo" />}
                            </div>
                        )}
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {loading && (
                        <div className="py-12 flex justify-center">
                            <Loader2 className="h-8 w-8 text-cyan-300 animate-spin" />
                        </div>
                    )}

                    {error && <p className="text-rose-300 text-sm">{error}</p>}

                    {usuario && !loading && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/5 border border-white/10 rounded-xl p-5">
                                <Dato icono={Mail} etiqueta="Email" valor={usuario.email} />
                                <Dato icono={Phone} etiqueta="Teléfono" valor={usuario.telefono} />
                                <Dato icono={MapPin} etiqueta="Ubicación" valor={usuario.ubicacion} />
                                <Dato icono={Briefcase} etiqueta="Ocupación" valor={usuario.ocupacion} />
                                <Dato
                                    icono={Calendar}
                                    etiqueta="Registro"
                                    valor={formatearFechaHora(usuario.date_joined)}
                                />
                                <Dato
                                    icono={Calendar}
                                    etiqueta="Último acceso"
                                    valor={formatearFechaHora(usuario.last_login)}
                                />
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                                    <p className="text-xs text-slate-400">Usuario</p>
                                    <p className="text-sm font-semibold text-white truncate">{usuario.username}</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                                    <p className="text-xs text-slate-400">Edad</p>
                                    <p className="text-sm font-semibold text-white">{usuario.edad ?? '—'}</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                                    <p className="text-xs text-slate-400">Género</p>
                                    <p className="text-sm font-semibold text-white">{usuario.genero_display}</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                                    <p className="text-xs text-slate-400">Estudios</p>
                                    <p className="text-sm font-semibold text-white">{usuario.nivel_educativo_display}</p>
                                </div>
                            </div>

                            {investigador && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-cyan-200 uppercase tracking-wide">
                                        Perfil de investigador
                                    </h4>
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-2">
                                        <p className="text-sm text-slate-300">
                                            Experiencia en investigación:{' '}
                                            <span className="text-white">{investigador.experiencia_investigacion_display}</span>
                                        </p>
                                        <p className="text-sm text-slate-300">
                                            Áreas de interés:{' '}
                                            <span className="text-white">
                                                {(investigador.areas_interes || []).join(', ') || '—'}
                                            </span>
                                        </p>
                                    </div>

                                    <h4 className="text-sm font-semibold text-cyan-200 uppercase tracking-wide">
                                        Programas creados ({investigador.programas.length})
                                    </h4>
                                    {investigador.programas.length === 0 ? (
                                        <p className="text-sm text-slate-400">Todavía no ha creado ningún programa.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {investigador.programas.map((programa) => (
                                                <div
                                                    key={programa.id}
                                                    className="flex items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-white truncate">{programa.nombre}</p>
                                                        <p className="text-xs text-slate-400">
                                                            {programa.inscritos} inscritos · {programa.total_sesiones} sesiones ·{' '}
                                                            {formatearFecha(programa.fecha_creacion)}
                                                        </p>
                                                    </div>
                                                    <AdminBadge valor={programa.estado} texto={programa.estado_display} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {participante && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-cyan-200 uppercase tracking-wide">
                                        Perfil de participante ({participante.id_anonimo})
                                    </h4>
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-2">
                                        <p className="text-sm text-slate-300">
                                            Experiencia en mindfulness:{' '}
                                            <span className="text-white">{participante.experiencia_mindfulness_display}</span>
                                        </p>
                                        <p className="text-sm text-slate-300">
                                            Condiciones de salud:{' '}
                                            <span className="text-white">{participante.condiciones_salud || '—'}</span>
                                        </p>
                                    </div>

                                    <h4 className="text-sm font-semibold text-cyan-200 uppercase tracking-wide">
                                        Inscripciones ({participante.inscripciones.length})
                                    </h4>
                                    {participante.inscripciones.length === 0 ? (
                                        <p className="text-sm text-slate-400">No está enrolado en ningún programa.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {participante.inscripciones.map((inscripcion) => (
                                                <div
                                                    key={inscripcion.id}
                                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                                                >
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-white truncate">
                                                                {inscripcion.programa}
                                                            </p>
                                                            <p className="text-xs text-slate-400">
                                                                {inscripcion.investigador} · desde{' '}
                                                                {formatearFecha(inscripcion.fecha_inicio)}
                                                            </p>
                                                        </div>
                                                        <AdminBadge
                                                            valor={inscripcion.estado}
                                                            texto={inscripcion.estado_display}
                                                        />
                                                    </div>
                                                    <div className="mt-3">
                                                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                                                            <span>Sesiones completadas</span>
                                                            <span>
                                                                {inscripcion.sesiones_completadas}/{inscripcion.total_sesiones}
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-white/10 rounded-full h-2">
                                                            <div
                                                                className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-2 rounded-full transition-all"
                                                                style={{
                                                                    width: `${inscripcion.total_sesiones
                                                                        ? (inscripcion.sesiones_completadas / inscripcion.total_sesiones) * 100
                                                                        : 0}%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <h4 className="text-sm font-semibold text-cyan-200 uppercase tracking-wide">
                                        Cuestionarios respondidos ({participante.respuestas_cuestionario.length})
                                    </h4>
                                    {participante.respuestas_cuestionario.length === 0 ? (
                                        <p className="text-sm text-slate-400">No ha respondido ningún cuestionario.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {participante.respuestas_cuestionario.map((respuesta) => (
                                                <div
                                                    key={respuesta.id}
                                                    className="flex items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                                                >
                                                    <p className="text-sm text-white truncate">{respuesta.cuestionario}</p>
                                                    <p className="text-xs text-slate-400 whitespace-nowrap">
                                                        {respuesta.momento} · {formatearFecha(respuesta.fecha_respuesta)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {!investigador && !participante && (
                                <p className="text-sm text-slate-400">
                                    Este usuario no tiene perfil de investigador ni de participante asociado.
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminUsuarioModal;
