import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { rutaInicioPorRol } from '@/config/auth';
import { ArrowLeft } from 'lucide-react';
import ErrorAlert from '../../components/ErrorAlert';
import BackgroundVideo from '../../components/layout/BackgroundVideo';

const Login = () => {
    const { login, loading, error, resetError, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    useEffect(() => {
        if (user && isAuthenticated()) {
            navigate(rutaInicioPorRol(user.role));
        }
    }, [isAuthenticated, user, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        resetError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(formData);
    };

    return (
        <BackgroundVideo videoSrc="/videos/barco.mp4">
            <div className="min-h-screen flex items-center justify-center bg-transparent px-4 sm:px-6 lg:px-8 py-12">
                <div className="w-full max-w-md">
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
                                Inicia sesión
                            </h2>
                            <p className="text-emerald-200 text-sm sm:text-base">
                                Accede a tu cuenta para continuar
                            </p>
                        </div>

                        <ErrorAlert
                            message={error}
                            onClose={() => resetError()}
                        />

                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <label htmlFor="username" className="block text-sm font-medium text-emerald-200">
                                    Nombre de usuario
                                </label>
                                <div className="relative">
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition duration-200 pl-10"
                                        placeholder="Tu nombre de usuario"
                                        value={formData.username}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-sm font-medium text-emerald-200">
                                    Contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition duration-200 pl-10"
                                        placeholder="Tu contraseña"
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 px-4 rounded-xl font-medium text-white shadow-lg transition duration-200 hover:shadow-emerald-500/25 ${loading ? 'bg-emerald-500/50 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 hover:-translate-y-0.5'}`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Procesando...
                                    </span>
                                ) : 'Iniciar sesión'}
                            </button>
                        </form>

                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-950 text-emerald-200">
                                        ¿No tienes cuenta?
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 text-center">
                                <Link
                                    to="/register"
                                    className="inline-flex items-center font-medium text-emerald-300 hover:text-white transition duration-200 hover:scale-105"
                                >
                                    Crea una cuenta ahora
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

export default Login;