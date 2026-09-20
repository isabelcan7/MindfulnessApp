import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Heart, ThumbsUp } from 'lucide-react';
import api from '../../../config/axios';
import { useAuth } from '../../../context/AuthContext';
import ErrorAlert from '../../../components/ErrorAlert';
import PageHeader from '../../../components/layout/PageHeader';
import LikertTable from '../../../components/LikertTable';
import { esFormatoEscala } from '../../../constants/enums';

const VistaPreviaCuestionario = () => {
    const { id, cuestionarioId } = useParams();
    const navigate = useNavigate();
    const [cuestionario, setCuestionario] = useState(null);
    const [respuestas, setRespuestas] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [enviando, setEnviando] = useState(false);
    const { isParticipante } = useAuth();

    useEffect(() => {
        const fetchCuestionario = async () => {
            try {
                const response = await api.get(`/cuestionario/${cuestionarioId}/`);
                setCuestionario(response.data);

                // Solo inicializamos respuestas si no es un cuestionario Likert
                if (!esFormatoEscala(response.data.tipo_cuestionario)) {
                    const respuestasIniciales = {};
                    response.data.preguntas.forEach(pregunta => {
                        if (pregunta.tipo === 'checkbox') {
                            respuestasIniciales[pregunta.id] = [];
                        } else {
                            respuestasIniciales[pregunta.id] = '';
                        }
                    });
                    setRespuestas(respuestasIniciales);
                } else {
                    // Para cuestionarios Likert, inicializamos un objeto vacío
                    setRespuestas({});
                }
            } catch (err) {
                setError('Error al cargar el cuestionario');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCuestionario();
    }, [cuestionarioId]);

    const handleRespuestaChange = (preguntaId, valor, tipo) => {
        if (tipo === 'checkbox') {
            setRespuestas(prev => ({
                ...prev,
                [preguntaId]: prev[preguntaId].includes(valor)
                    ? prev[preguntaId].filter(v => v !== valor)
                    : [...prev[preguntaId], valor]
            }));
        } else {
            setRespuestas(prev => ({
                ...prev,
                [preguntaId]: valor
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        setError('');

        try {
            // Si es un cuestionario Likert, enviamos las respuestas en el formato correcto
            const respuestasAEnviar = esFormatoEscala(cuestionario.tipo_cuestionario)
                ? { respuestas: Object.values(respuestas) }
                : { respuestas };

            await api.post(`/cuestionario/${cuestionarioId}/respuestas/`, respuestasAEnviar);
            navigate(`/programas/${id}`);
        } catch (err) {
            console.error('Error al enviar las respuestas:', err);
            setError(err.response?.data?.error || 'Error al enviar las respuestas');
        } finally {
            setEnviando(false);
        }
    };

    const renderPregunta = (pregunta) => {
        // Si es un cuestionario Likert, renderizamos la tabla especial
        if (esFormatoEscala(cuestionario.tipo_cuestionario)) {
            return (
                <LikertTable
                    textos={pregunta.textos}
                    etiquetas={pregunta.etiquetas}
                    respuestas={respuestas}
                    onRespuestaChange={handleRespuestaChange}
                />
            );
        }

        // Para otros tipos de cuestionarios, mantenemos el renderizado original
        switch (pregunta.tipo) {
            case 'texto':
                return (
                    <textarea
                        value={respuestas[pregunta.id]}
                        onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-1 text-white placeholder-purple-200 outline-none"
                        rows="3"
                        placeholder="Escribe tu respuesta aquí..."
                    />
                );

            case 'select':
                return (
                    <select
                        value={respuestas[pregunta.id]}
                        onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-1 text-white placeholder-purple-200 outline-none"
                    >
                        <option value="" className="bg-slate-900 text-white">Selecciona una opción</option>
                        {pregunta.opciones.map((opcion, index) => (
                            <option key={index} value={opcion} className="bg-slate-900 text-white">
                                {opcion}
                            </option>
                        ))}
                    </select>
                );

            case 'checkbox':
                return (
                    <div className="space-y-2">
                        {pregunta.opciones.map((opcion, index) => (
                            <label key={index} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={respuestas[pregunta.id].includes(opcion)}
                                    onChange={() => handleRespuestaChange(pregunta.id, opcion, 'checkbox')}
                                    className="h-4 w-4 bg-white/10 border-white/20 text-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                                />
                                <span className="text-white">{opcion}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'calificacion':
                return (
                    <div className="flex items-center space-x-4">
                        {Array.from({ length: pregunta.estrellas.cantidad }, (_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => handleRespuestaChange(pregunta.id, i + 1)}
                                className="text-3xl transition-all duration-200 hover:scale-110"
                            >
                                {pregunta.estrellas.icono === 'star' && (
                                    <Star className={`h-10 w-10 ${respuestas[pregunta.id] >= i + 1 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 fill-gray-300'}`} />
                                )}
                                {pregunta.estrellas.icono === 'heart' && (
                                    <Heart
                                        className={`h-10 w-10 ${respuestas[pregunta.id] >= i + 1 ? 'text-red-500 fill-red-500' : 'text-gray-300 fill-gray-300'}`}
                                    />
                                )}
                                {pregunta.estrellas.icono === 'thumbsup' && (
                                    <ThumbsUp className={`h-10 w-10 ${respuestas[pregunta.id] >= i + 1 ? 'text-blue-500 fill-blue-500' : 'text-gray-300 fill-gray-300'}`} />
                                )}
                            </button>
                        ))}
                    </div>
                );

            case 'likert-5-puntos':
                return (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/10">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-white">
                                        Pregunta
                                    </th>
                                    {pregunta.etiquetas.map((etiqueta, index) => (
                                        <th key={index} className="px-4 py-2 text-center text-sm font-medium text-purple-200">
                                            {etiqueta}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                <tr className="bg-white/5">
                                    <td className="px-4 py-2">
                                        <span className="text-white">{pregunta.texto}</span>
                                    </td>
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <td key={i} className="px-4 py-2 text-center">
                                            <input
                                                type="radio"
                                                name={`likert-${pregunta.id}`}
                                                value={i + 1}
                                                checked={respuestas[pregunta.id] === i + 1}
                                                onChange={(e) => handleRespuestaChange(pregunta.id, parseInt(e.target.value))}
                                                className="h-4 w-4 bg-white/10 border-white/20 text-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                                            />
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                );

            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-violet-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-violet-500/10 blur-xl rounded-2xl"></div>
                    <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-lg">
                        <PageHeader
                            title={cuestionario?.titulo}
                            subtitle={cuestionario?.descripcion}
                            backUrl={`/programas/${id}`}
                            titleClassName="text-white"
                            subtitleClassName="text-purple-200"
                        />

                        <ErrorAlert
                            message={error}
                            onClose={() => setError(null)}
                        />

                        <form onSubmit={handleSubmit}>
                            {/* Preguntas */}
                            <div className="space-y-8">
                                {cuestionario?.preguntas.map((pregunta, index) => (
                                    <div key={pregunta.id || index} className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-violet-500/10 blur-xl rounded-xl"></div>
                                        <div className="relative bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                                            <div className="mb-4">
                                                <h3 className="text-lg font-medium text-white">
                                                    {esFormatoEscala(cuestionario.tipo_cuestionario) ? (
                                                        'Completa la siguiente escala Likert'
                                                    ) : (
                                                        `${index + 1}. ${pregunta.texto}`
                                                    )}
                                                </h3>
                                            </div>
                                            <div className="mt-4">
                                                {renderPregunta(pregunta)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Botón de envío */}
                            {isParticipante() && (
                                <div className="mt-8 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={enviando}
                                        className={`flex items-center px-6 py-3 bg-emerald-500/20 text-emerald-100 rounded-xl transition-all duration-200 border border-emerald-400/30 backdrop-blur-sm ${enviando ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-500/30'}`}
                                    >
                                        {enviando ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                Enviando...
                                            </>
                                        ) : (
                                            'Enviar Respuestas'
                                        )}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VistaPreviaCuestionario; 