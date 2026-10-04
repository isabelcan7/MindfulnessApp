import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ArrowLeft, BookOpen, HelpCircle, AlertTriangle, FileText, BookMarked, Loader2 } from 'lucide-react';
import api from '../../../config/axios';
import ErrorAlert from '../../../components/ErrorAlert';
import { TipoContexto, EnfoqueMetodologico, EstadoPublicacion, getEnumArray } from '../../../constants/enums';

const EditarPrograma = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user, loading: authLoading, error: authError } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        tipo_contexto: TipoContexto.CRECIMIENTO_PERSONAL.value,
        enfoque_metodologico: EnfoqueMetodologico.MBSR.value,
        duracion_semanas: '',
        poblacion_objetivo: '',
        tiene_cuestionarios: true,
        tiene_diarios: true,
        creado_por: user.id,
        estado_publicacion: EstadoPublicacion.BORRADOR.value
    });

    const tiposContexto = getEnumArray(TipoContexto);
    const enfoquesMetodologicos = getEnumArray(EnfoqueMetodologico);

    useEffect(() => {
        const fetchPrograma = async () => {
            try {
                const response = await api.get(`/programas/${id}/`);
                if (response.data.estado_publicacion === 'publicado') {
                    navigate('/programas');
                    return;
                }
                if (response.data.creado_por.id !== user.perfil_investigador.id) {
                    navigate('/unauthorized');
                    return;
                }
                setFormData(response.data);
            } catch (err) {
                setError('Error al cargar el programa');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPrograma();
    }, [id, navigate, user.perfil_investigador.id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Comprobar si el nuevo numero de semanas es menor que el numero de sesiones existentes
        if (formData.duracion_semanas < formData.sesiones.length) {
            setError('El número de semanas no puede ser menor que el número de sesiones existentes');
            setLoading(false);
            return;
        }

        const dataToSend = {
            ...formData,
        };

        try {
            await api.put(`/programas/${id}/`, dataToSend);
            navigate(-1);
        } catch (error) {
            console.error('Error al actualizar el programa:', error);
            if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else {
                setError('Ha ocurrido un error al actualizar el programa');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading || authLoading) {
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
                            onClick={() => navigate(-1)}
                            className="absolute top-6 left-6 p-2 rounded-full transition-all duration-200 text-purple-200 hover:text-white border border-white/20 hover:border-purple-300/30 bg-white/10 hover:bg-purple-500/20 focus:outline-none shadow-sm"
                            aria-label="Volver atrás"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>

                        <div className="text-center mt-2">
                            <div className="flex justify-center mb-3">
                                <div className="bg-purple-500/20 p-3 rounded-xl border border-purple-500/30">
                                    <BookOpen className="h-6 w-6 text-purple-300" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">
                                Editar Programa
                            </h2>
                            <p className="text-purple-200">
                                Modifica los detalles del programa de mindfulness
                            </p>
                        </div>

                        <ErrorAlert
                            message={error || authError}
                            onClose={() => setError(null)}
                        />

                        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="nombre" className="block text-sm font-medium text-white mb-1">
                                    Nombre del Programa *
                                </label>
                                <input
                                    id="nombre"
                                    name="nombre"
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-1 text-white placeholder-purple-200 outline-none"
                                    placeholder="Nombre del programa"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label htmlFor="descripcion" className="block text-sm font-medium text-white mb-1">
                                    Descripción y Objetivos *
                                </label>
                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    rows={4}
                                    required
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-1 text-white placeholder-purple-200 outline-none"
                                    placeholder="Descripción detallada y objetivos principales del programa"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label htmlFor="poblacion_objetivo" className="block text-sm font-medium text-white mb-1">
                                    Población Objetivo *
                                </label>
                                <input
                                    id="poblacion_objetivo"
                                    name="poblacion_objetivo"
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-1 text-white placeholder-purple-200 outline-none"
                                    placeholder="Ej. Estudiantes, empleados, docentes, sanitarios etc."
                                    value={formData.poblacion_objetivo}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="tipo_contexto" className="block text-sm font-medium text-white mb-1">
                                        Tipo de Contexto *
                                    </label>
                                    <select
                                        id="tipo_contexto"
                                        name="tipo_contexto"
                                        required
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-1 text-white placeholder-purple-200 outline-none"
                                        value={formData.tipo_contexto}
                                        onChange={handleChange}
                                        disabled={loading}
                                    >
                                        <option value="" className="bg-gray-800 text-white">Selecciona un tipo de contexto</option>
                                        {tiposContexto.map((tipo) => (
                                            <option key={tipo.value} value={tipo.value} className="bg-gray-800 text-white">{tipo.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="enfoque_metodologico" className="block text-sm font-medium text-white mb-1">
                                        Enfoque Metodológico *
                                    </label>
                                    <select
                                        id="enfoque_metodologico"
                                        name="enfoque_metodologico"
                                        required
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-1 text-white placeholder-purple-200 outline-none"
                                        value={formData.enfoque_metodologico}
                                        onChange={handleChange}
                                        disabled={loading}
                                    >
                                        <option value="" className="bg-gray-800 text-white">Selecciona un enfoque metodológico</option>
                                        {enfoquesMetodologicos.map((enfoque) => (
                                            <option key={enfoque.value} value={enfoque.value} className="bg-gray-800 text-white">{enfoque.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <label htmlFor="duracion_semanas" className="block text-sm font-medium text-white">
                                            Duración en Semanas *
                                        </label>
                                        <div className="group relative">
                                            <HelpCircle className="h-5 w-5 text-purple-300 cursor-help hover:text-purple-200 transition-colors duration-200" />
                                            <div className="absolute bottom-full left-0 mb-2 w-72 p-3 bg-gray-900/90 backdrop-blur-sm text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg border border-white/10">
                                                <div className="font-medium mb-1">Duración del Programa</div>
                                                <p className="text-gray-200">Este número determinará la cantidad de sesiones que deberás crear para el programa. Cada semana corresponde a una sesión.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <input
                                            id="duracion_semanas"
                                            name="duracion_semanas"
                                            type="number"
                                            min="1"
                                            required
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-1 text-white placeholder-purple-200 outline-none"
                                            placeholder="Ej. 8"
                                            value={formData.duracion_semanas}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
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
                                            Guardando...
                                        </span>
                                    ) : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditarPrograma; 