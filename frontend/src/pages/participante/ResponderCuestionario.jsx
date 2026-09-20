import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Heart, ThumbsUp, AlertCircle } from 'lucide-react';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext';
import ErrorAlert from '../../components/ErrorAlert';
import MobileNavBar from '../../components/layout/MobileNavBar';
import PageHeader from '../../components/layout/PageHeader';
import LikertTable from '../../components/LikertTable';
import { esFormatoEscala } from '../../constants/enums';

const ResponderCuestionario = ({ momento }) => {
    const navigate = useNavigate();
    const [cuestionario, setCuestionario] = useState(null);
    const [respuestas, setRespuestas] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [enviando, setEnviando] = useState(false);
    const { isParticipante } = useAuth();
    const formEndRef = useRef(null);

    const validarRespuestas = () => {
        if (!cuestionario) return false;

        if (esFormatoEscala(cuestionario.tipo_cuestionario)) {
            // Para cuestionarios Likert, verificamos que todas las filas tengan respuesta
            return Object.keys(respuestas).length === cuestionario.preguntas[0].textos.length;
        }

        return cuestionario.preguntas.every(pregunta => {
            const respuesta = respuestas[pregunta.id];

            if (pregunta.tipo === 'checkbox') {
                return respuesta && respuesta.length > 0;
            } else {
                return respuesta !== undefined && respuesta !== '';
            }
        });
    };

    useEffect(() => {
        const fetchCuestionario = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get(`/cuestionario/${momento}/`);
                setCuestionario(response.data);

                // Inicializar respuestas según el tipo de cuestionario
                if (esFormatoEscala(response.data.tipo_cuestionario)) {
                    // Para Likert, inicializamos un objeto vacío
                    setRespuestas({});
                } else {
                    // Para otros tipos, inicializamos como antes
                    const respuestasIniciales = {};
                    response.data.preguntas.forEach(pregunta => {
                        if (pregunta.tipo === 'checkbox') {
                            respuestasIniciales[pregunta.id] = [];
                        } else {
                            respuestasIniciales[pregunta.id] = '';
                        }
                    });
                    setRespuestas(respuestasIniciales);
                }
            } catch (err) {
                console.error('Error al obtener cuestionario:', err);
                if (err.response?.status === 400 && err.response?.data?.error.includes('Ya has respondido este cuestionario')) {
                    setError('Ya has completado este cuestionario. ¡Gracias por tu participación!');
                } else if (err.response?.data?.error) {
                    setError(err.response.data.error);
                } else {
                    setError('Error al cargar el cuestionario. Por favor, intenta más tarde.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCuestionario();
    }, [momento]);

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

        if (!validarRespuestas()) {
            setError('Por favor, responde todas las preguntas antes de enviar el cuestionario.');
            formEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        try {
            setEnviando(true);
            setError(null);

            let respuestasAEnviar;
            if (esFormatoEscala(cuestionario.tipo_cuestionario)) {
                // Para cuestionarios Likert, convertimos el objeto de respuestas a un array
                respuestasAEnviar = {
                    respuestas: Array.from({ length: cuestionario.preguntas[0].textos.length },
                        (_, i) => respuestas[i] || null)
                };
            } else {
                respuestasAEnviar = { respuestas };
            }

            const response = await api.post(`/cuestionario/responder/${momento}/`, respuestasAEnviar);

            // Si es post, navegar a completados con el ID del programa
            if (momento === 'post') {
                navigate(`/completados/${response.data.id}`);
            } else {
                navigate('/miprograma');
            }
        } catch (err) {
            console.error('Error al enviar respuestas:', err);
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError('Error al enviar tus respuestas. Por favor, intenta más tarde.');
            }
            formEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

        // Para otros tipos de preguntas, mantenemos el renderizado original
        switch (pregunta.tipo) {
            case 'texto':
                return (
                    <textarea
                        value={respuestas[pregunta.id] || ''}
                        onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 text-white placeholder-indigo-300 outline-none"
                        rows="3"
                        placeholder="Escribe tu respuesta aquí..."
                    />
                );

            case 'select':
                return (
                    <select
                        value={respuestas[pregunta.id] || ''}
                        onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white"
                    >
                        <option value="" className="bg-indigo-900 text-white">Selecciona una opción</option>
                        {pregunta.opciones.map((opcion, index) => (
                            <option key={index} value={opcion} className="bg-indigo-900 text-white">
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
                                    checked={respuestas[pregunta.id]?.includes(opcion) || false}
                                    onChange={() => handleRespuestaChange(pregunta.id, opcion, 'checkbox')}
                                    className="bg-white/10 border border-white/20 rounded-xl focus:ring-1 text-white placeholder-purple-200 outline-none"
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
                                    <Star className={`h-10 w-10 ${(respuestas[pregunta.id] || 0) >= i + 1 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 fill-gray-300'}`} />
                                )}
                                {pregunta.estrellas.icono === 'heart' && (
                                    <Heart
                                        className={`h-10 w-10 ${(respuestas[pregunta.id] || 0) >= i + 1 ? 'text-red-500 fill-red-500' : 'text-gray-300 fill-gray-300'}`}
                                    />
                                )}
                                {pregunta.estrellas.icono === 'thumbsup' && (
                                    <ThumbsUp className={`h-10 w-10 ${(respuestas[pregunta.id] || 0) >= i + 1 ? 'text-blue-500 fill-blue-500' : 'text-gray-300 fill-gray-300'}`} />
                                )}
                            </button>
                        ))}
                    </div>
                );

            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-bl from-indigo-950 via-sky-800 to-blue-900 pb-16 md:pb-0">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-300"></div>
                <p className="mt-4 text-indigo-200">Cargando cuestionario...</p>
                <MobileNavBar />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-bl from-indigo-950 via-sky-800 to-blue-900 py-8 px-4 sm:px-6 lg:px-8 pb-20 md:pb-10">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-6 md:p-8 border border-white/10">
                    <PageHeader
                        title={cuestionario?.titulo}
                        subtitle={cuestionario?.descripcion}
                        backUrl="/miprograma"
                        className="mb-8"
                        titleClassName="bg-gradient-to-r from-white via-indigo-200 to-indigo-400"
                        subtitleClassName="text-indigo-200"
                    />

                    <form onSubmit={handleSubmit}>
                        {/* Preguntas */}
                        <div className="space-y-8">
                            {cuestionario?.preguntas.map((pregunta, index) => (
                                <div key={pregunta.id || index} className="bg-indigo-500/10 backdrop-blur-xl rounded-xl p-6 md:p-8 shadow-sm border border-white/10">
                                    <div className="mb-6">
                                        <h3 className="text-xl font-semibold text-white">
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
                            ))}
                        </div>

                        {/* Error más visible */}
                        <div ref={formEndRef} className="mt-8">
                            {error && !loading && (
                                <div className="bg-red-500/20 backdrop-blur-xl border-l-4 border-red-500 p-4 mb-6 rounded-xl">
                                    <div className="flex items-start">
                                        <AlertCircle className="h-6 w-6 text-red-300 mt-0.5 mr-2" />
                                        <div>
                                            <h3 className="text-lg font-semibold text-red-200">Error</h3>
                                            <p className="text-red-100">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Botón de envío */}
                        {isParticipante() && (
                            <div className="mt-12 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={enviando}
                                    className={`inline-flex items-center px-8 py-4 text-lg font-medium rounded-xl text-white transition-all duration-300 transform hover:scale-105 ${enviando
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 shadow-lg hover:shadow-xl'
                                        }`}
                                >
                                    {enviando ? (
                                        <>
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
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
            <MobileNavBar />
        </div>
    );
};

export default ResponderCuestionario; 