import { useEffect, useState } from 'react';
import {
    Activity, AlertTriangle, BarChart3, ClipboardList, FileText, GraduationCap,
    LayoutDashboard, Loader2, TrendingUp, UserPlus, Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../config/axios';
import AdminLayout from '../../components/layout/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminStatCard from '../../components/admin/AdminStatCard';
import AdminBadge from '../../components/admin/AdminBadge';
import ErrorAlert from '../../components/ErrorAlert';
import { formatearFechaHora, formatearMes } from '../../utils/adminUtils';

const acentosPanel = {
    cyan: 'bg-cyan-500/20 text-cyan-300',
    emerald: 'bg-emerald-500/20 text-emerald-300',
    violet: 'bg-violet-500/20 text-violet-300',
    amber: 'bg-amber-500/20 text-amber-300',
};

const Panel = ({ titulo, icono: Icono, acento = 'cyan', enlace, children }) => (
    <div className="relative h-full">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-teal-500/10 to-emerald-500/10 blur-2xl rounded-3xl"></div>
        <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 shadow-lg h-full flex flex-col">
            <div className="p-5 border-b border-white/10 flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-3">
                    <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${acentosPanel[acento] || acentosPanel.cyan}`}>
                        {Icono && <Icono className="h-5 w-5" />}
                    </div>
                    {titulo}
                </h2>
                {enlace && (
                    <Link to={enlace.to} className="text-cyan-300 hover:text-white text-sm font-medium transition-colors whitespace-nowrap">
                        {enlace.texto}
                    </Link>
                )}
            </div>
            <div className="p-5 flex-1">{children}</div>
        </div>
    </div>
);

const BarraDistribucion = ({ etiqueta, valor, maximo, sufijo }) => (
    <div>
        <div className="flex justify-between text-sm mb-1.5">
            <span className="text-slate-300">{etiqueta}</span>
            <span className="text-white font-medium">{valor}{sufijo}</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2.5">
            <div
                className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${maximo ? (valor / maximo) * 100 : 0}%` }}
            ></div>
        </div>
    </div>
);

const GraficoRegistros = ({ serie }) => {
    const maximo = Math.max(...serie.map((punto) => punto.total), 1);

    return (
        <div className="flex items-end justify-between gap-3 h-48">
            {serie.map((punto) => (
                <div key={punto.mes} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-xs text-slate-300 font-medium">{punto.total}</span>
                    <div className="w-full flex flex-col justify-end gap-0.5 h-full">
                        <div
                            className="w-full bg-gradient-to-t from-violet-500 to-violet-400 rounded-t-md transition-all duration-500"
                            style={{ height: `${(punto.investigadores / maximo) * 100}%` }}
                            title={`${punto.investigadores} investigadores`}
                        ></div>
                        <div
                            className="w-full bg-gradient-to-t from-cyan-500 to-cyan-400 transition-all duration-500"
                            style={{ height: `${(punto.participantes / maximo) * 100}%` }}
                            title={`${punto.participantes} participantes`}
                        ></div>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">{formatearMes(punto.mes)}</span>
                </div>
            ))}
        </div>
    );
};

const AdminDashboard = () => {
    const [resumen, setResumen] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const cargar = async () => {
        try {
            const response = await api.get('/admin/resumen/');
            setResumen(response.data);
            setError(null);
        } catch (err) {
            console.error('Error al cargar el resumen:', err);
            setError('Error al cargar el resumen de la plataforma');
        }
    };

    useEffect(() => {
        const inicial = async () => {
            await cargar();
            setLoading(false);
        };
        inicial();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 flex flex-col items-center justify-center">
                <Loader2 className="h-16 w-16 text-cyan-300 animate-spin mb-6" />
                <p className="text-lg text-cyan-100 font-medium animate-pulse">Recopilando datos de la plataforma...</p>
            </div>
        );
    }

    const usuarios = resumen?.usuarios || {};
    const programas = resumen?.programas || {};
    const inscripciones = resumen?.inscripciones || {};
    const actividad = resumen?.actividad || {};
    const avisos = resumen?.avisos || {};
    const demografia = resumen?.demografia || {};

    const listaAvisos = [
        { clave: 'participantes_sin_inscripcion', texto: 'participantes registrados sin ninguna inscripción', enlace: '/admin/participantes' },
        { clave: 'investigadores_sin_programas', texto: 'investigadores que no han creado ningún programa', enlace: '/admin/investigadores' },
        { clave: 'programas_borrador', texto: 'programas siguen en borrador', enlace: '/admin/programas' },
        { clave: 'programas_publicados_sin_inscritos', texto: 'programas publicados sin participantes', enlace: '/admin/programas' },
        { clave: 'inscripciones_sin_actividad', texto: 'inscripciones en progreso sin actividad en 30 días', enlace: '/admin/inscripciones' },
        { clave: 'usuarios_sin_perfil', texto: 'usuarios sin perfil asociado', enlace: '/admin/usuarios' },
    ].filter((aviso) => (avisos[aviso.clave] || 0) > 0);

    return (
        <AdminLayout>
            <AdminPageHeader
                titulo="Panel de administración"
                descripcion="Estado global de la plataforma: registros, programas, inscripciones y actividad."
                icono={LayoutDashboard}
            />

            <ErrorAlert message={error} onClose={() => setError(null)} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <AdminStatCard
                    titulo="Usuarios registrados"
                    valor={usuarios.total || 0}
                    detalle={`${usuarios.nuevos_30_dias || 0} en los últimos 30 días`}
                    icono={Users}
                    acento="cyan"
                />
                <AdminStatCard
                    titulo="Investigadores"
                    valor={usuarios.investigadores || 0}
                    detalle={`${usuarios.perfiles_investigador || 0} con perfil completo`}
                    icono={GraduationCap}
                    acento="violet"
                />
                <AdminStatCard
                    titulo="Participantes"
                    valor={usuarios.participantes || 0}
                    detalle={`${usuarios.perfiles_participante || 0} con perfil completo`}
                    icono={UserPlus}
                    acento="emerald"
                />
                <AdminStatCard
                    titulo="Programas"
                    valor={programas.total || 0}
                    detalle={`${programas.publicados || 0} publicados · ${programas.borradores || 0} en borrador`}
                    icono={FileText}
                    acento="amber"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <AdminStatCard
                    titulo="Inscripciones"
                    valor={inscripciones.total || 0}
                    detalle={`${inscripciones.en_progreso || 0} en progreso`}
                    icono={ClipboardList}
                    acento="cyan"
                />
                <AdminStatCard
                    titulo="Tasa de completado"
                    valor={`${inscripciones.tasa_completado || 0}%`}
                    detalle={`${inscripciones.completadas || 0} completadas · ${inscripciones.abandonadas || 0} abandonadas`}
                    icono={TrendingUp}
                    acento="emerald"
                />
                <AdminStatCard
                    titulo="Diarios de sesión"
                    valor={actividad.diarios_completados || 0}
                    detalle={`${actividad.diarios_30_dias || 0} en los últimos 30 días`}
                    icono={Activity}
                    acento="violet"
                />
                <AdminStatCard
                    titulo="Cuestionarios respondidos"
                    valor={actividad.cuestionarios_respondidos || 0}
                    detalle={`${actividad.respuestas_pre || 0} pre · ${actividad.respuestas_post || 0} post`}
                    icono={BarChart3}
                    acento="rose"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
                <div className="lg:col-span-3">
                    <Panel titulo="Altas de usuarios por mes" icono={TrendingUp}>
                        <GraficoRegistros serie={resumen?.registros_por_mes || []} />
                        <div className="mt-4 flex items-center gap-5 text-xs text-slate-300">
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-sm bg-violet-400"></span>
                                Investigadores
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-sm bg-cyan-400"></span>
                                Participantes
                            </span>
                        </div>
                    </Panel>
                </div>

                <div className="lg:col-span-2">
                    <Panel titulo="Avisos" icono={AlertTriangle} acento="amber">
                        {listaAvisos.length === 0 ? (
                            <p className="text-sm text-slate-300">Sin avisos: no se detectan datos incompletos ni inactividad.</p>
                        ) : (
                            <div className="space-y-3">
                                {listaAvisos.map((aviso) => (
                                    <Link
                                        key={aviso.clave}
                                        to={aviso.enlace}
                                        className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                                    >
                                        <span className="text-sm font-bold text-amber-200 shrink-0">{avisos[aviso.clave]}</span>
                                        <span className="text-sm text-amber-100/90">{aviso.texto}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </Panel>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Panel
                    titulo="Programas con más inscritos"
                    icono={FileText}
                    enlace={{ to: '/admin/programas', texto: 'Ver todos' }}
                >
                    {(resumen?.top_programas || []).length === 0 ? (
                        <p className="text-sm text-slate-300">Todavía no hay programas creados.</p>
                    ) : (
                        <div className="space-y-3">
                            {resumen.top_programas.map((programa) => (
                                <div
                                    key={programa.id}
                                    className="flex items-center justify-between gap-4 p-3 bg-white/5 rounded-xl border border-white/10"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{programa.nombre}</p>
                                        <p className="text-xs text-slate-400 truncate">
                                            {programa.investigador} · {programa.inscritos} inscritos · {programa.completados} completados
                                        </p>
                                    </div>
                                    <AdminBadge valor={programa.estado} texto={programa.estado_display} />
                                </div>
                            ))}
                        </div>
                    )}
                </Panel>

                <Panel
                    titulo="Investigadores más activos"
                    icono={GraduationCap}
                    enlace={{ to: '/admin/investigadores', texto: 'Ver todos' }}
                >
                    {(resumen?.investigadores_activos || []).length === 0 ? (
                        <p className="text-sm text-slate-300">Todavía no hay investigadores registrados.</p>
                    ) : (
                        <div className="space-y-3">
                            {resumen.investigadores_activos.map((investigador) => (
                                <div
                                    key={investigador.id}
                                    className="flex items-center justify-between gap-4 p-3 bg-white/5 rounded-xl border border-white/10"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{investigador.nombre}</p>
                                        <p className="text-xs text-slate-400 truncate">{investigador.email}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-semibold text-white">{investigador.total_programas} programas</p>
                                        <p className="text-xs text-slate-400">{investigador.total_inscritos} inscritos</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Panel>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Panel titulo="Últimos registros" icono={UserPlus} acento="emerald">
                    {(resumen?.ultimos_registros || []).length === 0 ? (
                        <p className="text-sm text-slate-300">Sin registros recientes.</p>
                    ) : (
                        <div className="space-y-2">
                            {resumen.ultimos_registros.map((usuario) => (
                                <div
                                    key={usuario.id}
                                    className="flex items-center justify-between gap-3 p-3 bg-white/5 rounded-xl border border-white/10"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{usuario.nombre}</p>
                                        <p className="text-xs text-slate-400 truncate">{usuario.email}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <AdminBadge valor={usuario.role} texto={usuario.role_display} />
                                        <p className="text-xs text-slate-400 mt-1">{formatearFechaHora(usuario.date_joined)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Panel>

                <Panel
                    titulo="Últimas inscripciones"
                    icono={ClipboardList}
                    enlace={{ to: '/admin/inscripciones', texto: 'Ver todas' }}
                >
                    {(resumen?.ultimas_inscripciones || []).length === 0 ? (
                        <p className="text-sm text-slate-300">Nadie se ha enrolado todavía.</p>
                    ) : (
                        <div className="space-y-2">
                            {resumen.ultimas_inscripciones.map((inscripcion) => (
                                <div
                                    key={inscripcion.id}
                                    className="flex items-center justify-between gap-3 p-3 bg-white/5 rounded-xl border border-white/10"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{inscripcion.participante}</p>
                                        <p className="text-xs text-slate-400 truncate">{inscripcion.programa}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <AdminBadge valor={inscripcion.estado} texto={inscripcion.estado_display} />
                                        <p className="text-xs text-slate-400 mt-1">{formatearFechaHora(inscripcion.fecha_inicio)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Panel>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[
                    { titulo: 'Género', datos: demografia.genero },
                    { titulo: 'Nivel educativo', datos: demografia.nivel_educativo },
                    { titulo: 'Experiencia en mindfulness', datos: demografia.experiencia_mindfulness },
                ].map((bloque) => {
                    const datos = (bloque.datos || []).filter((dato) => dato.total > 0);
                    const maximo = Math.max(...datos.map((dato) => dato.total), 1);

                    return (
                        <Panel key={bloque.titulo} titulo={bloque.titulo} icono={BarChart3} acento="violet">
                            {datos.length === 0 ? (
                                <p className="text-sm text-slate-300">Sin datos de participantes.</p>
                            ) : (
                                <div className="space-y-4">
                                    {datos.map((dato) => (
                                        <BarraDistribucion
                                            key={dato.valor}
                                            etiqueta={dato.label}
                                            valor={dato.total}
                                            maximo={maximo}
                                            sufijo=""
                                        />
                                    ))}
                                </div>
                            )}
                        </Panel>
                    );
                })}
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
