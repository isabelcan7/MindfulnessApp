import React from 'react';
import { ArrowLeft, Calendar, Clock, Shield, Heart, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TerminosPrograma = () => {
    const navigate = useNavigate();

    return (
        <div data-page-bg="light" className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Volver
                </button>

                <div className="bg-white shadow-xl rounded-2xl p-8 md:p-12">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Términos y Condiciones del Programa
                        </h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Última actualización: {new Date().toLocaleDateString()}
                        </p>
                    </div>

                    <div className="space-y-12 text-gray-600">
                        <section className="bg-indigo-50 p-6 rounded-xl">
                            <div className="flex items-center mb-4">
                                <CheckCircle className="h-8 w-8 text-indigo-600 mr-3" />
                                <h2 className="text-2xl font-semibold text-gray-900">1. Compromiso de Participación</h2>
                            </div>
                            <div className="space-y-4">
                                <p className="text-gray-700">
                                    Al unirte a este programa, aceptas y te comprometes a:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                    <li>Participar activamente en todas las sesiones programadas</li>
                                    <li>Completar las actividades y ejercicios asignados</li>
                                    <li>Mantener una actitud respetuosa y constructiva</li>
                                    <li>Seguir las recomendaciones proporcionadas por los instructores</li>
                                    <li>Proporcionar retroalimentación honesta sobre tu experiencia</li>
                                    <li>Mantener la confidencialidad sobre el contenido del programa</li>
                                </ul>
                            </div>
                        </section>

                        <section className="bg-blue-50 p-6 rounded-xl">
                            <div className="flex items-center mb-4">
                                <Calendar className="h-8 w-8 text-blue-600 mr-3" />
                                <h2 className="text-2xl font-semibold text-gray-900">2. Duración y Dedicación</h2>
                            </div>
                            <div className="space-y-4">
                                <p className="text-gray-700">
                                    El programa requiere una dedicación constante durante su duración. Deberás:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                    <li>Asistir regularmente a las sesiones programadas</li>
                                    <li>Dedicar tiempo diario a la práctica personal</li>
                                    <li>Completar las evaluaciones y cuestionarios requeridos</li>
                                    <li>Notificar con anticipación cualquier ausencia programada</li>
                                    <li>Mantener un registro de tu progreso y práctica</li>
                                </ul>
                                <div className="bg-blue-100 p-4 rounded-lg mt-4">
                                    <p className="text-sm text-blue-800">
                                        Nota: La consistencia en la práctica es fundamental para obtener los beneficios del programa.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="bg-green-50 p-6 rounded-xl">
                            <div className="flex items-center mb-4">
                                <Shield className="h-8 w-8 text-green-600 mr-3" />
                                <h2 className="text-2xl font-semibold text-gray-900">3. Privacidad y Confidencialidad</h2>
                            </div>
                            <div className="space-y-4">
                                <p className="text-gray-700">
                                    Nos comprometemos a proteger tu privacidad y datos personales. La información recopilada será:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                    <li>Utilizada únicamente con fines de investigación y mejora del programa</li>
                                    <li>Tratada de manera confidencial y no compartida con terceros</li>
                                    <li>Almacenada de forma segura según las normativas vigentes</li>
                                    <li>Anonimizada antes de ser compartida con terceros</li>
                                </ul>
                            </div>
                        </section>

                        <section className="bg-red-50 p-6 rounded-xl">
                            <div className="flex items-center mb-4">
                                <Heart className="h-8 w-8 text-red-600 mr-3" />
                                <h2 className="text-2xl font-semibold text-gray-900">4. Beneficios y Limitaciones</h2>
                            </div>
                            <div className="space-y-4">
                                <p className="text-gray-700">
                                    El programa está diseñado para promover el bienestar, pero es importante entender que:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                    <li>Los resultados pueden variar según el individuo y su compromiso</li>
                                    <li>No sustituye ningún tratamiento médico o psicológico</li>
                                    <li>Se recomienda consultar con profesionales de la salud en caso de dudas</li>
                                    <li>El progreso requiere tiempo y práctica constante</li>
                                </ul>
                                <div className="bg-yellow-50 p-4 rounded-lg mt-4 flex items-start">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-1" />
                                    <p className="text-sm text-yellow-800">
                                        Importante: Si experimentas malestar durante las prácticas, detente inmediatamente y consulta con un profesional de la salud.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="bg-purple-50 p-6 rounded-xl">
                            <div className="flex items-center mb-4">
                                <Clock className="h-8 w-8 text-purple-600 mr-3" />
                                <h2 className="text-2xl font-semibold text-gray-900">5. Cancelación y Modificaciones</h2>
                            </div>
                            <div className="space-y-4">
                                <p className="text-gray-700">
                                    La participación en el programa implica entender que:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                    <li>El programa puede sufrir modificaciones para mejorar su calidad</li>
                                    <li>Se notificarán los cambios importantes con al menos 7 días de anticipación</li>
                                    <li>Las ausencias no justificadas pueden afectar tu participación</li>
                                    <li>Se puede solicitar una pausa temporal por razones justificadas</li>
                                </ul>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default TerminosPrograma; 