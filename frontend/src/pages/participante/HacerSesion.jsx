import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, ExternalLink } from 'lucide-react';
import api from '../../config/axios';
import DiarioForm from '../../components/DiarioForm';
import ErrorAlert from '../../components/ErrorAlert';
import MobileNavBar from '../../components/layout/MobileNavBar';
import PageHeader from '../../components/layout/PageHeader';
import BackgroundVideo from '../../components/layout/BackgroundVideo';

const HacerSesion = ({ completado }) => {
    const navigate = useNavigate();
    const { sesionId } = useParams();
    const [sesion, setSesion] = useState(null);
    const [programa, setPrograma] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tiempoRestante, setTiempoRestante] = useState(null);
    const [tiempoOriginal, setTiempoOriginal] = useState(null);
    const [completada, setCompletada] = useState(false);
    const [temporizadorActivo, setTemporizadorActivo] = useState(false);
    const [mostrarDiario, setMostrarDiario] = useState(false);
    const [diarioCompletado, setDiarioCompletado] = useState(false);
    const [esSesionCompletada, setEsSesionCompletada] = useState(false);
    const [isLastSession, setIsLastSession] = useState(false);

    useEffect(() => {
        const fetchSesion = async () => {
            try {
                /*
                if (completado) {
                    // Verificar si el usuario tiene acceso a este programa completado
                    const completadosResponse = await api.get('/programas/mis-completados/');
                    const tieneAcceso = completadosResponse.data.some(prog => prog.id === parseInt(sesion.programa));

                    if (!tieneAcceso) {
                        navigate('/forbidden');
                        return;
                    }
                }*/

                const response = await api.get(`/sesiones/${sesionId}/`);
                setSesion(response.data);
                if (response.data.tipo_contenido === 'temporizador') {
                    setTiempoRestante(response.data.contenido_temporizador * 60);
                    setTiempoOriginal(response.data.contenido_temporizador * 60);
                }

                // Obtener información del programa
                const programaResponse = await api.get(`/programas/${response.data.programa}/`);
                setPrograma(programaResponse.data)

                // Verificar si es la última sesión
                const todasSesiones = programaResponse.data.sesiones || [];
                const ultimaSesion = todasSesiones[todasSesiones.length - 1];
                setIsLastSession(response.data.id === ultimaSesion.id);

                // Verificar si ya existe un diario para esta sesión
                const diarioResponse = await api.get(`/sesiones/${sesionId}/diario_info/`);
                if (diarioResponse.data) {
                    setDiarioCompletado(true);
                    setCompletada(true);
                    setEsSesionCompletada(true);
                }

            } catch (err) {
                if (err.response?.status === 404) {
                    // No hay diario, continuar normalmente
                } else if (err.response?.status === 403) {
                    navigate('/miprograma', { replace: true });
                } else {
                    console.error('Error al cargar la sesión:', err);
                    setError('Error al cargar la sesión. Por favor, intenta nuevamente.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchSesion();
    }, [sesionId, navigate, completado]);

    useEffect(() => {
        let timer;
        if (sesion?.tipo_contenido === 'temporizador' && !completada && temporizadorActivo) {
            timer = setInterval(() => {
                setTiempoRestante(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setCompletada(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [sesion?.tipo_contenido, temporizadorActivo, completada]);

    const marcarComoCompletada = async () => {
        if (diarioCompletado) {
            if (esSesionCompletada) {
                navigate(`/completados/${sesion.programa}`);
            } else {
                navigate('/miprograma');
            }
            return;
        }

        // Si el programa tiene diarios, mostrar el formulario de diario
        if (programa?.tiene_diarios) {
            setMostrarDiario(true);
            return;
        }

        // Si no tiene diarios, marcar como completada directamente
        await handleDiarioCompletado();
    };

    const reiniciarSesion = () => {
        setTiempoRestante(tiempoOriginal);
        setCompletada(false);
        setTemporizadorActivo(false);
    };

    const handleDiarioCompletado = async () => {
        setDiarioCompletado(true);
        setMostrarDiario(false);

        try {
            // Si tiene cuestionarios pero no tiene diarios, enviar un diario vacío
            if (programa?.tiene_cuestionarios && !programa?.tiene_diarios) {
                await api.post(`/sesiones/diario/`, {
                    sesion_id: sesionId,
                    valoracion: -1,
                    comentario: ""
                });
            }

            navigate('/miprograma');
        } catch (error) {
            console.error('Error al verificar estado del programa:', error);
            navigate('/miprograma');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-bl from-indigo-950 via-sky-800 to-blue-900 pb-16 md:pb-0">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-300"></div>
                <p className="mt-4 text-indigo-200">Cargando sesión...</p>
                <MobileNavBar />
            </div>
        );
    }

    if (!sesion) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-bl from-indigo-950 via-sky-800 to-blue-900 px-4 pb-16 md:pb-0">
                <div className="w-full max-w-md">
                    <ErrorAlert
                        message={error || 'No se ha podido cargar la sesión.'}
                        onClose={() => setError(null)}
                    />
                    <button
                        onClick={() => navigate('/miprograma')}
                        className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver a mi programa
                    </button>
                </div>
                <MobileNavBar />
            </div>
        );
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getMediaUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }
        return `${import.meta.env.VITE_MEDIA_URL}${path}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-bl from-indigo-950 via-sky-800 to-blue-900 py-8 px-4 sm:px-6 lg:px-8 pb-20 md:pb-10 flex items-center justify-center">
            {sesion?.tipo_contenido === 'temporizador' && sesion?.video_fondo ? (
                <BackgroundVideo videoSrc={`/videos/${sesion.video_fondo}`}>
                    <div className="w-full max-w-4xl mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)]">
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-6 md:p-8 border border-white/10 w-full">
                            <PageHeader
                                title={sesion.titulo}
                                subtitle={sesion.descripcion}
                                className="mb-6"
                                titleClassName="bg-gradient-to-r from-white via-indigo-200 to-indigo-400"
                                subtitleClassName="text-indigo-200"
                            />

                            {sesion.tipo_contenido === 'temporizador' && !esSesionCompletada && (
                                <div className="flex items-center justify-center text-indigo-200 mb-8">
                                    <Clock className="h-6 w-6 mr-2 text-indigo-300" />
                                    <span className="font-medium text-lg">{formatTime(tiempoOriginal)}</span>
                                </div>
                            )}

                            <ErrorAlert
                                message={error}
                                onClose={() => setError(null)}
                            />

                            <div className="space-y-8">
                                {sesion.tipo_contenido === 'temporizador' && (
                                    <div className="text-center p-8 rounded-xl">
                                        <div className="text-6xl font-bold text-indigo-300 mb-6 font-mono">
                                            {formatTime(tiempoRestante)}
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                            <button
                                                onClick={() => setTemporizadorActivo(!temporizadorActivo)}
                                                disabled={completada}
                                                className={`px-8 py-4 rounded-xl text-white font-medium text-lg transition-all duration-300 transform hover:scale-105 ${temporizadorActivo
                                                    ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600'
                                                    : completada
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600'
                                                    } shadow-lg hover:shadow-xl`}
                                            >
                                                {temporizadorActivo ? 'Pausar' : completada ? 'Completado' : 'Iniciar'}
                                            </button>
                                            {!completada && !temporizadorActivo && (
                                                <button
                                                    onClick={() => setCompletada(true)}
                                                    className="px-8 py-4 rounded-xl text-white font-medium text-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 shadow-lg hover:shadow-xl"
                                                >
                                                    Saltar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {sesion.tipo_contenido === 'enlace' && (
                                    <div className="text-center p-8 rounded-xl">
                                        <a
                                            href={sesion.contenido_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                        >
                                            Abrir enlace
                                            <ExternalLink className="ml-2 h-5 w-5" />
                                        </a>
                                    </div>
                                )}

                                {sesion.tipo_contenido === 'video' && (
                                    <div className="aspect-w-16 aspect-h-9 bg-black/50 rounded-xl overflow-hidden shadow-lg">
                                        <video
                                            src={getMediaUrl(sesion.contenido_video)}
                                            controls
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                )}

                                {sesion.tipo_contenido === 'audio' && (
                                    <div className="p-8 rounded-xl">
                                        <audio
                                            src={getMediaUrl(sesion.contenido_audio)}
                                            controls
                                            className="w-full"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-center mt-12">
                                {!esSesionCompletada && (
                                    <button
                                        onClick={marcarComoCompletada}
                                        disabled={sesion.tipo_contenido === 'temporizador' && !completada}
                                        className={`inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl transition-all duration-300 transform hover:scale-105 ${sesion.tipo_contenido === 'temporizador' && !completada
                                            ? 'bg-gray-400 cursor-not-allowed text-white'
                                            : diarioCompletado
                                                ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl'
                                                : 'bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white shadow-lg hover:shadow-xl'
                                            }`}
                                    >
                                        <CheckCircle2 className="h-6 w-6 mr-2" />
                                        {diarioCompletado ? 'Volver al programa' : 'Marcar como completada'}
                                    </button>
                                )}
                                {esSesionCompletada && sesion.tipo_contenido === 'temporizador' && (
                                    <button
                                        onClick={reiniciarSesion}
                                        className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                    >
                                        Repetir sesión
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </BackgroundVideo>
            ) : (
                <div className="w-full max-w-4xl mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)]">
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-6 md:p-8 border border-white/10 w-full">
                        <PageHeader
                            title={sesion.titulo}
                            subtitle={sesion.descripcion}
                            className="mb-6"
                            titleClassName="bg-gradient-to-r from-white via-indigo-200 to-indigo-400"
                            subtitleClassName="text-indigo-200"
                        />

                        {sesion.tipo_contenido === 'temporizador' && !esSesionCompletada && (
                            <div className="flex items-center justify-center text-indigo-200 mb-8">
                                <Clock className="h-6 w-6 mr-2 text-indigo-300" />
                                <span className="font-medium text-lg">{formatTime(tiempoOriginal)}</span>
                            </div>
                        )}

                        <ErrorAlert
                            message={error}
                            onClose={() => setError(null)}
                        />

                        <div className="space-y-8">
                            {sesion.tipo_contenido === 'temporizador' && (
                                <div className="text-center p-8 rounded-xl">
                                    <div className="text-6xl font-bold text-indigo-300 mb-6 font-mono">
                                        {formatTime(tiempoRestante)}
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <button
                                            onClick={() => setTemporizadorActivo(!temporizadorActivo)}
                                            disabled={completada}
                                            className={`px-8 py-4 rounded-xl text-white font-medium text-lg transition-all duration-300 transform hover:scale-105 ${temporizadorActivo
                                                ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600'
                                                : completada
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600'
                                                } shadow-lg hover:shadow-xl`}
                                        >
                                            {temporizadorActivo ? 'Pausar' : completada ? 'Completado' : 'Iniciar'}
                                        </button>
                                        {!completada && !temporizadorActivo && (
                                            <button
                                                onClick={() => setCompletada(true)}
                                                className="px-8 py-4 rounded-xl text-white font-medium text-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 shadow-lg hover:shadow-xl"
                                            >
                                                Saltar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {sesion.tipo_contenido === 'enlace' && (
                                <div className="text-center p-8 rounded-xl">
                                    <a
                                        href={sesion.contenido_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                    >
                                        Abrir enlace
                                        <ExternalLink className="ml-2 h-5 w-5" />
                                    </a>
                                </div>
                            )}

                            {sesion.tipo_contenido === 'video' && (
                                <div className="aspect-w-16 aspect-h-9 bg-black/50 rounded-xl overflow-hidden shadow-lg">
                                    <video
                                        src={getMediaUrl(sesion.contenido_video)}
                                        controls
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            )}

                            {sesion.tipo_contenido === 'audio' && (
                                <div className="p-8 rounded-xl">
                                    <audio
                                        src={getMediaUrl(sesion.contenido_audio)}
                                        controls
                                        className="w-full"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-center mt-12">
                            {!esSesionCompletada && (
                                <button
                                    onClick={marcarComoCompletada}
                                    disabled={sesion.tipo_contenido === 'temporizador' && !completada}
                                    className={`inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl transition-all duration-300 transform hover:scale-105 ${sesion.tipo_contenido === 'temporizador' && !completada
                                        ? 'bg-gray-400 cursor-not-allowed text-white'
                                        : diarioCompletado
                                            ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl'
                                            : 'bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white shadow-lg hover:shadow-xl'
                                        }`}
                                >
                                    <CheckCircle2 className="h-6 w-6 mr-2" />
                                    {diarioCompletado ? 'Volver al programa' : 'Marcar como completada'}
                                </button>
                            )}
                            {esSesionCompletada && sesion.tipo_contenido === 'temporizador' && (
                                <button
                                    onClick={reiniciarSesion}
                                    className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                >
                                    Repetir sesión
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {mostrarDiario && !diarioCompletado && !esSesionCompletada && (
                <DiarioForm
                    programa={programa}
                    sesion={sesion}
                    onClose={() => setMostrarDiario(false)}
                    onSuccess={handleDiarioCompletado}
                    isLastSession={isLastSession}
                />
            )}
            <MobileNavBar />
        </div>
    );
};

export default HacerSesion; 