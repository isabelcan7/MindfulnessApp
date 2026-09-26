import React from 'react';
import { ArrowLeft, Shield, Lock, UserCheck, Heart, Copyright, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TerminosServicio = () => {
    const navigate = useNavigate();

    return (
        <div data-page-bg="light" className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
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
                            Términos y Condiciones del Servicio
                        </h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Última actualización: {new Date().toLocaleDateString()}
                        </p>
                    </div>

                    <div className="space-y-12 text-gray-600">
                        <section className="bg-indigo-50 p-6 rounded-xl">
                            <div className="flex items-center mb-4">
                                <Shield className="h-8 w-8 text-indigo-600 mr-3" />
                                <h2 className="text-2xl font-semibold text-gray-900">1. Consentimiento Informado</h2>
                            </div>
                            <div className="space-y-4">
                                <p className="text-gray-700">
                                    Al registrarte en nuestra plataforma, das tu consentimiento informado para:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                    <li>Participar en programas de mindfulness y meditación</li>
                                    <li>Proporcionar información personal y de salud relevante</li>
                                    <li>Permitir el uso anónimo de tus datos para fines de investigación</li>
                                    <li>Recibir comunicaciones relacionadas con los programas en los que participes</li>
                                    <li>Ser contactado para seguimiento y evaluación de resultados</li>
                                </ul>
                            </div>
                        </section>

                        <section className="bg-blue-50 p-6 rounded-xl">
                            <div className="flex items-center mb-4">
                                <Lock className="h-8 w-8 text-blue-600 mr-3" />
                                <h2 className="text-2xl font-semibold text-gray-900">2. Privacidad y Protección de Datos</h2>
                            </div>
                            <div className="space-y-4">
                                <p className="text-gray-700">
                                    Nos comprometemos a proteger tu privacidad y datos personales. Tu información será:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                    <li>Almacenada de forma segura y encriptada</li>
                                    <li>Utilizada solo para los fines específicos del servicio</li>
                                    <li>Nunca compartida con terceros sin tu consentimiento explícito</li>
                                    <li>Tratada según las normativas de protección de datos vigentes (GDPR, CCPA)</li>
                                    <li>Accesible para su modificación o eliminación a tu solicitud</li>
                                </ul>
                            </div>
                        </section>

                        <section className="bg-green-50 p-6 rounded-xl">
                            <div className="flex items-center mb-4">
                                <UserCheck className="h-8 w-8 text-green-600 mr-3" />
                                <h2 className="text-2xl font-semibold text-gray-900">3. Responsabilidades del Usuario</h2>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-medium text-gray-900 mb-3">3.1 Para Participantes</h3>
                                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                        <li>Proporcionar información veraz y actualizada</li>
                                        <li>Seguir las recomendaciones y pautas de los programas</li>
                                        <li>Mantener la confidencialidad de tu cuenta</li>
                                        <li>Respetar los derechos de propiedad intelectual</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-medium text-gray-900 mb-3">3.2 Para Investigadores</h3>
                                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                        <li>Mantener la confidencialidad de los datos de los participantes</li>
                                        <li>Diseñar programas seguros y basados en evidencia científica</li>
                                        <li>Proporcionar información clara y precisa sobre los programas</li>
                                        <li>Seguir los protocolos éticos de investigación y obtener las aprobaciones necesarias de comités éticos</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section className="bg-red-50 p-6 rounded-xl">
                            <div className="flex items-center mb-4">
                                <Heart className="h-8 w-8 text-red-600 mr-3" />
                                <h2 className="text-2xl font-semibold text-gray-900">4. Seguridad y Salud</h2>
                            </div>
                            <div className="space-y-4">
                                <p className="text-gray-700">
                                    Para garantizar tu seguridad y bienestar:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                    <li>Consulta con un profesional de la salud antes de comenzar cualquier programa</li>
                                    <li>Informa sobre condiciones médicas relevantes</li>
                                    <li>Sigue las instrucciones y recomendaciones proporcionadas</li>
                                    <li>No sustituyas tratamientos médicos por los programas de la plataforma</li>
                                    <li>Mantén un ambiente seguro durante las prácticas</li>
                                </ul>
                                <div className="bg-yellow-50 p-4 rounded-lg mt-4 flex items-start">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-1" />
                                    <p className="text-sm text-yellow-800">
                                        Advertencia: Si experimentas malestar durante cualquier práctica, detente inmediatamente y busca ayuda profesional si es necesario.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="bg-purple-50 p-6 rounded-xl">
                            <div className="flex items-center mb-4">
                                <Copyright className="h-8 w-8 text-purple-600 mr-3" />
                                <h2 className="text-2xl font-semibold text-gray-900">5. Propiedad Intelectual</h2>
                            </div>
                            <div className="space-y-4">
                                <p className="text-gray-700">
                                    Todo el contenido de la plataforma está protegido por derechos de autor:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                    <li>No está permitida la reproducción sin autorización</li>
                                    <li>El contenido es para uso personal y no comercial</li>
                                    <li>Los investigadores mantienen los derechos de sus programas</li>
                                    <li>Las marcas y logos están registrados</li>
                                    <li>Se prohíbe el uso no autorizado de materiales</li>
                                </ul>
                            </div>
                        </section>

                        <section className="bg-gray-50 p-6 rounded-xl">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Modificaciones y Terminación</h2>
                            <div className="space-y-4">
                                <p className="text-gray-700">
                                    Nos reservamos el derecho a:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                    <li>Modificar estos términos y condiciones</li>
                                    <li>Actualizar o discontinuar servicios</li>
                                    <li>Suspender cuentas que violen estos términos</li>
                                    <li>Realizar cambios en la plataforma</li>
                                    <li>Actualizar políticas de privacidad</li>
                                </ul>
                                <p className="text-sm text-gray-600 mt-4">
                                    Los usuarios serán notificados de cambios significativos en los términos con al menos 30 días de anticipación.
                                </p>
                            </div>
                        </section>

                        <section className="border-t border-gray-200 pt-8">
                            <div className="bg-gray-50 p-6 rounded-xl">
                                <p className="text-gray-700 mb-4">
                                    Al registrarte o usar nuestra plataforma, confirmas que has leído, entendido y aceptado estos términos y condiciones.
                                    Para cualquier duda o aclaración, contacta con nuestro equipo de soporte.
                                </p>
                                <div className="flex flex-col sm:flex-row justify-between items-center mt-6">
                                    <p className="text-sm text-gray-500">
                                        © {new Date().getFullYear()} Mindfulness App. Todos los derechos reservados.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TerminosServicio; 