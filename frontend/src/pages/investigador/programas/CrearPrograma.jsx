import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ArrowLeft, BookOpen, HelpCircle, AlertTriangle, FileText, BookMarked, Loader2 } from 'lucide-react';
import api from '../../../config/axios';
import ErrorAlert from '../../../components/ErrorAlert';
import { TipoContexto, EnfoqueMetodologico, EstadoPublicacion, getEnumArray } from '../../../constants/enums';

const CrearPrograma = () => {
    const navigate = useNavigate();
    const { user, error: authError } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        tipo_contexto: '',
        enfoque_metodologico: '',
        duracion_semanas: '',
        poblacion_objetivo: '',
        tiene_cuestionarios: true,
        tiene_diarios: true,
        creado_por: user.id,
        estado_publicacion: EstadoPublicacion.BORRADOR.value
    });

    const tiposContexto = getEnumArray(TipoContexto);
    const enfoquesMetodologicos = getEnumArray(EnfoqueMetodologico);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            // Si se está desmarcando un checkbox, verificar que al menos uno quede marcado
            if (!checked && name === 'tiene_cuestionarios' && !formData.tiene_diarios) {
                setError('Debes seleccionar al menos un método de evaluación');
                return;
            }
            if (!checked && name === 'tiene_diarios' && !formData.tiene_cuestionarios) {
                setError('Debes seleccionar al menos un método de evaluación');
                return;
            }
            setError(null);
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validar que al menos un método de evaluación esté seleccionado
        if (!formData.tiene_cuestionarios && !formData.tiene_diarios) {
            setError('Debes seleccionar al menos un método de evaluación');
            setLoading(false);
            return;
        }

        const dataToSend = {
            ...formData,
        };

        try {
            await api.post('programas', dataToSend);
            navigate('/programas');
        } catch (error) {
            console.error('Error al crear el programa:', error);
            if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else {
                setError('Ha ocurrido un error al crear el programa');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-violet-900 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-2xl">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-violet-500/20 to-indigo-500/20 blur-2xl rounded-3xl"></div>
                    <div className="relative bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-xl">
                        <button
                            onClick={() => navigate('/programas')}
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
                                Crear Nuevo Programa
                            </h2>
                            <p className="text-purple-200">
                                Completa los detalles del programa de mindfulness
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

                            <div className="mt-8 border-t border-white/10 pt-6">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                    <span className="bg-purple-500/20 p-2 rounded-xl mr-2 border border-purple-500/30">
                                        <FileText className="h-5 w-5 text-purple-300" />
                                    </span>
                                    Métodos de Evaluación
                                </h3>
                                <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl p-4 mb-6">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <AlertTriangle className="h-5 w-5 text-amber-300" />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-white">Importante</h3>
                                            <div className="mt-2 text-sm text-amber-200">
                                                <p>Los métodos de evaluación seleccionados no podrán ser modificados después de crear el programa. Esta decisión afectará a la estructura y evaluación del programa.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 space-y-6 border border-white/10">
                                    <div className="flex items-start space-x-4">
                                        <div className="flex items-center h-5">
                                            <input
                                                type="checkbox"
                                                id="tiene_cuestionarios"
                                                name="tiene_cuestionarios"
                                                checked={formData.tiene_cuestionarios}
                                                onChange={handleChange}
                                                className="w-5 h-5 text-purple-500 border-white/20 rounded transition duration-200 bg-white/10"
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label htmlFor="tiene_cuestionarios" className="text-base font-medium text-white">
                                                Cuestionarios Pre/Post
                                            </label>
                                            <p className="mt-1 text-sm text-purple-200">
                                                Los participantes completarán cuestionarios al inicio y al final del programa para evaluar su progreso
                                            </p>
                                        </div>
                                        <div className="group relative">
                                            <HelpCircle className="h-5 w-5 text-purple-300 cursor-help hover:text-purple-200 transition-colors duration-200" />
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 p-3 bg-gray-900/90 backdrop-blur-sm text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg border border-white/10">
                                                <div className="font-medium mb-1">Cuestionarios Pre/Post</div>
                                                <p className="text-gray-200">Evaluación completa al inicio y final del programa para medir el progreso y los cambios en los participantes.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="flex items-center h-5">
                                            <input
                                                type="checkbox"
                                                id="tiene_diarios"
                                                name="tiene_diarios"
                                                checked={formData.tiene_diarios}
                                                onChange={handleChange}
                                                className="w-5 h-5 text-purple-500 border-white/20 rounded transition duration-200 bg-white/10"
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label htmlFor="tiene_diarios" className="text-base font-medium text-white">
                                                Diarios Post-Sesión
                                            </label>
                                            <p className="mt-1 text-sm text-purple-200">
                                                Los participantes completarán un breve diario después de cada sesión para registrar su experiencia
                                            </p>
                                        </div>
                                        <div className="group relative">
                                            <HelpCircle className="h-5 w-5 text-purple-300 cursor-help hover:text-purple-200 transition-colors duration-200" />
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 p-3 bg-gray-900/90 backdrop-blur-sm text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg border border-white/10">
                                                <div className="font-medium mb-1">Diarios Post-Sesión</div>
                                                <p className="text-gray-200">Registro inmediato después de cada sesión para capturar la experiencia y el impacto en el momento.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/programas')}
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
                                    ) : 'Crear borrador de Programa'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrearPrograma;