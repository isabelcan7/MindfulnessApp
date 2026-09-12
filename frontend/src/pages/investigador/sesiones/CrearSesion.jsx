import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ArrowLeft, Clock, Loader2 } from 'lucide-react';
import api from '../../../config/axios';
import { prepareSessionFormData } from '../../../utils/formData';
import ErrorAlert from '../../../components/ErrorAlert';
import { EtiquetaPractica, TipoContenido, Escala, getEnumArray } from '../../../constants/enums';
import VideoFondoSelector from '../../../components/sesiones/VideoFondoSelector';

const CrearSesion = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { error: authError } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [programa, setPrograma] = useState(null);
    const [formData, setFormData] = useState({
        programa: id,
        titulo: '',
        descripcion: '',
        semana: '',
        duracion_estimada: '',
        tipo_practica: '',
        tipo_contenido: '',
        tipo_escala: '',
        contenido_temporizador: 0,
        contenido_url: '',
        contenido_audio: null,
        contenido_video: null,
        video_fondo: ''
    });

    const tiposPractica = getEnumArray(EtiquetaPractica);
    const tiposContenido = getEnumArray(TipoContenido);
    const tiposEscala = getEnumArray(Escala);

    useEffect(() => {
        const fetchPrograma = async () => {
            try {
                const response = await api.get(`/programas/${id}/`);
                setPrograma(response.data);
            } catch (error) {
                console.error('Error al cargar el programa:', error);
                setError('Error al cargar el programa');
            }
        };
        fetchPrograma();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const formDataToSend = prepareSessionFormData(formData);

            // Verificar que el archivo existe si es necesario
            if (formData.tipo_contenido === 'audio' && !formData.contenido_audio) {
                throw new Error('Por favor, selecciona un archivo de audio');
            }
            if (formData.tipo_contenido === 'video' && !formData.contenido_video) {
                throw new Error('Por favor, selecciona un archivo de video');
            }

            if (!programa.tiene_diarios) {
                delete formDataToSend.tipo_escala;
            }

            const response = await api.post('sesiones', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 201) {
                navigate(`/programas/${id}`);
            }
        } catch (error) {
            console.error('Error al crear la sesión:', error);
            if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else if (error.message) {
                setError(error.message);
            } else if (error.response?.data?.contenido_audio) {
                setError(error.response.data.contenido_audio[0]);
            } else {
                setError('Ha ocurrido un error al crear la sesión');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!programa) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-violet-900">
                <div className="text-center">
                    <Loader2 className="h-16 w-16 text-purple-300 animate-spin mx-auto mb-6" />
                    <p className="text-lg text-purple-100 font-medium animate-pulse">Cargando programa...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-violet-900 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-2xl">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-violet-500/20 to-indigo-500/20 blur-2xl rounded-3xl"></div>
                    <div className="relative bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-xl">
                        <button
                            onClick={() => navigate(`/programas/${id}`)}
                            className="absolute top-6 left-6 p-2 rounded-full transition-all duration-200 text-purple-200 hover:text-white border border-white/20 hover:border-purple-300/30 bg-white/10 hover:bg-purple-500/20 focus:outline-none shadow-sm"
                            aria-label="Volver atrás"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>

                        <div className="text-center mt-2">
                            <div className="flex justify-center mb-3">
                                <div className="bg-purple-500/20 p-3 rounded-xl border border-purple-500/30">
                                    <Clock className="h-6 w-6 text-purple-300" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">
                                Crear Nueva Sesión
                            </h2>
                            <p className="text-purple-200">
                                Programa: {programa.nombre}
                            </p>
                        </div>

                        <ErrorAlert
                            message={error || authError}
                            onClose={() => setError(null)}
                        />

                        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="titulo" className="block text-sm font-medium text-white mb-1">
                                    Título de la Sesión *
                                </label>
                                <input
                                    id="titulo"
                                    name="titulo"
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-1 text-white placeholder-purple-200 outline-none"
                                    placeholder="Título de la sesión"
                                    value={formData.titulo}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label htmlFor="descripcion" className="block text-sm font-medium text-white mb-1">
                                    Descripción *
                                </label>
                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    rows={4}
                                    required
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-1 text-white placeholder-purple-200 outline-none"
                                    placeholder="Descripción detallada de la sesión"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="semana" className="block text-sm font-medium text-white mb-1">
                                        Semana *
                                    </label>
                                    <input
                                        id="semana"
                                        name="semana"
                                        type="number"
                                        min="1"
                                        max={programa.duracion_semanas}
                                        required
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-1 text-white placeholder-purple-200 outline-none"
                                        placeholder={`1-${programa.duracion_semanas}`}
                                        value={formData.semana}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="duracion_estimada" className="block text-sm font-medium text-white mb-1">
                                        Duración Estimada (minutos) *
                                    </label>
                                    <input
                                        id="duracion_estimada"
                                        name="duracion_estimada"
                                        type="number"
                                        min="1"
                                        required
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-1 text-white placeholder-purple-200 outline-none"
                                        placeholder="Ej. 10"
                                        value={formData.duracion_estimada}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="tipo_practica" className="block text-sm font-medium text-white mb-1">
                                        Tipo de Práctica *
                                    </label>
                                    <select
                                        id="tipo_practica"
                                        name="tipo_practica"
                                        required
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-1 text-white placeholder-purple-200 outline-none"
                                        value={formData.tipo_practica}
                                        onChange={handleChange}
                                        disabled={loading}
                                    >
                                        <option value="" className="bg-gray-800 text-white">Selecciona un tipo de práctica</option>
                                        {tiposPractica.map((tipo) => (
                                            <option key={tipo.value} value={tipo.value} className="bg-gray-800 text-white">{tipo.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="tipo_contenido" className="block text-sm font-medium text-white mb-1">
                                        Tipo de Contenido *
                                    </label>
                                    <select
                                        id="tipo_contenido"
                                        name="tipo_contenido"
                                        required
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-1 text-white placeholder-purple-200 outline-none"
                                        value={formData.tipo_contenido}
                                        onChange={handleChange}
                                        disabled={loading}
                                    >
                                        <option value="" className="bg-gray-800 text-white">Selecciona un tipo de contenido</option>
                                        {tiposContenido.map((tipo) => (
                                            <option key={tipo.value} value={tipo.value} className="bg-gray-800 text-white">{tipo.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {programa.tiene_diarios && (
                                <div>
                                    <label htmlFor="tipo_escala" className="block text-sm font-medium text-white mb-1">
                                        Escala de Evaluación Post-Sesión *
                                    </label>
                                    <select
                                        id="tipo_escala"
                                        name="tipo_escala"
                                        required
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-1 text-white placeholder-purple-200 outline-none"
                                        value={formData.tipo_escala}
                                        onChange={handleChange}
                                        disabled={loading}
                                    >
                                        <option value="" className="bg-gray-800 text-white">Selecciona una escala de evaluación</option>
                                        {tiposEscala.map((tipo) => (
                                            <option key={tipo.value} value={tipo.value} className="bg-gray-800 text-white">{tipo.label}</option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-sm text-purple-200">
                                        Esta escala se utilizará para evaluar la experiencia de los participantes después de la sesión
                                    </p>
                                </div>
                            )}

                            {formData.tipo_contenido === 'temporizador' && (
                                <>
                                    <div>
                                        <label htmlFor="contenido_temporizador" className="block text-sm font-medium text-white mb-1">
                                            Duración del Temporizador (minutos) *
                                        </label>
                                        <input
                                            id="contenido_temporizador"
                                            name="contenido_temporizador"
                                            type="number"
                                            min="1"
                                            required
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-1 text-white placeholder-purple-200 outline-none"
                                            placeholder="Ej. 15"
                                            value={formData.contenido_temporizador}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="mt-4">
                                        <VideoFondoSelector
                                            value={formData.video_fondo}
                                            onChange={(e) => handleChange({ target: { name: 'video_fondo', value: e.target.value } })}
                                        />
                                    </div>
                                </>
                            )}

                            {formData.tipo_contenido === 'enlace' && (
                                <div>
                                    <label htmlFor="contenido_url" className="block text-sm font-medium text-white mb-1">
                                        URL del Contenido *
                                    </label>
                                    <input
                                        id="contenido_url"
                                        name="contenido_url"
                                        //type="url"
                                        required
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-1 text-white placeholder-purple-200 outline-none"
                                        placeholder="https://..."
                                        value={formData.contenido_url}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </div>
                            )}

                            {formData.tipo_contenido === 'audio' && (
                                <div>
                                    <label htmlFor="contenido_audio" className="block text-sm font-medium text-white mb-1">
                                        Archivo de Audio *
                                    </label>
                                    <input
                                        id="contenido_audio"
                                        name="contenido_audio"
                                        type="file"
                                        accept=".mp3,.m4a,.ogg"
                                        required
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-1 text-white placeholder-purple-200 outline-none"
                                        onChange={handleFileChange}
                                        disabled={loading}
                                    />
                                </div>
                            )}

                            {formData.tipo_contenido === 'video' && (
                                <div>
                                    <label htmlFor="contenido_video" className="block text-sm font-medium text-white mb-1">
                                        Archivo de Video *
                                    </label>
                                    <input
                                        id="contenido_video"
                                        name="contenido_video"
                                        type="file"
                                        accept=".mp4,.webm"
                                        required
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-1 text-white placeholder-purple-200 outline-none"
                                        onChange={handleFileChange}
                                        disabled={loading}
                                    />
                                </div>
                            )}

                            <div className="pt-4 flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/programas/${id}`)}
                                    className="px-6 py-3 rounded-xl font-medium text-purple-200 border border-white/20 bg-white/10 hover:bg-white/20 transition duration-200 shadow-sm"
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-6 py-3 rounded-xl font-medium text-white shadow-lg transition duration-200 transform hover:-translate-y-0.5 ${loading
                                        ? 'bg-white/20 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 hover:shadow-xl'
                                        }`}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                            Creando...
                                        </span>
                                    ) : 'Crear Sesión'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrearSesion; 