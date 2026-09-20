import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Users, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { rutaInicioPorRol } from '@/config/auth';
import { useEffect } from 'react';
import BackgroundVideo from '../../components/layout/BackgroundVideo';

const Register = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        if (isAuthenticated()) {
            navigate(rutaInicioPorRol(user.role));
        }
    }, [isAuthenticated, user, navigate]);

    return (
        <BackgroundVideo videoSrc="/videos/barco.mp4">
            <div className="min-h-screen flex items-center justify-center bg-transparent px-4 sm:px-6 lg:px-8 py-12">
                <div className="w-full max-w-lg">
                    <div className="bg-gradient-to-br from-emerald-800 to-teal-800 p-6 sm:p-8 rounded-3xl shadow-2xl relative border border-white/10 backdrop-blur-sm">
                        <button
                            onClick={() => navigate('/')}
                            className="absolute top-4 sm:top-6 left-4 sm:left-6 p-2 rounded-full transition-all duration-200 text-emerald-200 hover:text-white border border-white/10 hover:border-emerald-300 bg-white/10 hover:bg-white/20 focus:outline-none shadow-sm hover:scale-110"
                            aria-label="Volver atrás"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>

                        <div className="text-center mt-4 sm:mt-2">
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-200">
                                Crear una nueva cuenta
                            </h2>
                            <p className="text-emerald-200 text-sm sm:text-base">
                                Selecciona tu tipo de cuenta para continuar
                            </p>
                        </div>

                        <div className="mt-8 space-y-4 sm:space-y-6">
                            <Link
                                to="/register/investigador"
                                className="group relative block w-full bg-gradient-to-r from-purple-800 to-violet-800 rounded-2xl shadow-lg p-5 sm:p-6 hover:shadow-xl transition-all duration-300 border border-white/10 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-emerald-950 hover:-translate-y-1"
                            >
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 bg-white/10 p-3 rounded-xl group-hover:bg-white/20 transition-colors duration-200 group-hover:scale-110">
                                        <BookOpen className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-semibold text-white group-hover:text-purple-200 transition-colors duration-200">
                                            Soy Investigador/a
                                        </h3>
                                        <p className="mt-1 text-sm text-white/80 group-hover:text-white/90">
                                            Quiero crear y gestionar programas de mindfulness para investigación
                                        </p>
                                    </div>
                                </div>
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:via-purple-500/5 group-hover:to-purple-500/0 transition-all duration-300"></div>
                            </Link>

                            <Link
                                to="/register/participante"
                                className="group relative block w-full bg-gradient-to-r from-indigo-800 via-sky-800 to-blue-900 rounded-2xl shadow-lg p-5 sm:p-6 hover:shadow-xl transition-all duration-300 border border-white/10 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-emerald-950 hover:-translate-y-1"
                            >
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 bg-white/10 p-3 rounded-xl group-hover:bg-white/20 transition-colors duration-200 group-hover:scale-110">
                                        <Users className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-200 transition-colors duration-200">
                                            Soy Participante
                                        </h3>
                                        <p className="mt-1 text-sm text-white/80 group-hover:text-white/90">
                                            Quiero participar en programas de mindfulness y meditación
                                        </p>
                                    </div>
                                </div>
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:via-blue-500/5 group-hover:to-blue-500/0 transition-all duration-300"></div>
                            </Link>
                        </div>

                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-950 text-emerald-200">
                                        ¿Ya tienes una cuenta?
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 text-center">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center font-medium text-emerald-300 hover:text-white transition duration-200 hover:scale-105"
                                >
                                    Inicia sesión aquí
                                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BackgroundVideo>
    );
};

export default Register;