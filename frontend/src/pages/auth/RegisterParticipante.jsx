import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { rutaInicioPorRol } from '@/config/auth';
import { ArrowLeft, Users, LinkIcon } from 'lucide-react';
import ErrorAlert from '../../components/ErrorAlert';
import { Genero, NivelEducativo, ExperienciaMindfulness } from '../../constants/enums';
import BackgroundVideo from '../../components/layout/BackgroundVideo';

const RegisterParticipante = () => {
    const { register, loading, error, resetError, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        email: '',
        username: '',
        password: '',
        fechaNacimiento: '',
        genero: '',
        ocupacion: '',
        nivelEducativo: '',
        experienciaMindfulness: '',
        condicionesSalud: '',
        telefono: '',
        ubicacion: '',
        role: 'PARTICIPANTE',
        aceptaTerminos: false
    });

    const [errorEdad, setErrorEdad] = useState('');
    const [errorTerminos, setErrorTerminos] = useState('');

    const validarEdad = (fechaNacimiento) => {
        const hoy = new Date();
        const fechaNac = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - fechaNac.getFullYear();
        const mes = hoy.getMonth() - fechaNac.getMonth();

        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
            edad--;
        }

        return edad >= 18;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'fechaNacimiento') {
            if (!validarEdad(value)) {
                setErrorEdad('Debes ser mayor de 18 años para registrarte');
            } else {
                setErrorEdad('');
            }
        }

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (errorEdad) {
            return;
        }
        if (!formData.aceptaTerminos) {
            setErrorTerminos('Debes aceptar los términos y condiciones para continuar');
            return;
        }
        await register(formData);
    };

    useEffect(() => {
        if (isAuthenticated()) {
            navigate(rutaInicioPorRol(user.role));
        }
    }, [isAuthenticated, user, navigate]);

    return (
        <BackgroundVideo videoSrc="/videos/barco.mp4">
            <div className="h-screen overflow-y-auto">
                <div className="min-h-screen flex items-center justify-center bg-transparent px-4 sm:px-6 lg:px-8">
                    <div className="w-full max-w-2xl">
                        <div className="bg-gradient-to-bl from-indigo-950 via-sky-800 to-blue-900 p-8 rounded-2xl shadow-xl relative border border-white/10">
                            <button
                                onClick={() => navigate(-1)}
                                className="absolute top-6 left-6 p-2 rounded-full transition-all duration-200 text-indigo-200 hover:text-white border border-white/10 hover:border-indigo-300 bg-white/10 hover:bg-white/20 focus:outline-none shadow-sm"
                                aria-label="Volver atrás"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>

                            <div className="text-center mt-2">
                                <div className="flex justify-center mb-3">
                                    <div className="bg-indigo-500/20 p-3 rounded-lg">
                                        <Users className="h-6 w-6 text-indigo-300" />
                                    </div>
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    Registro de Participante
                                </h2>
                                <p className="text-indigo-200">
                                    Completa tus datos para crear una cuenta de participante
                                </p>
                            </div>

                            <ErrorAlert
                                message={error}
                                onClose={() => resetError()}
                            />

                            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="nombre" className="block text-sm font-medium text-indigo-200 mb-1">
                                            Nombre *
                                        </label>
                                        <input
                                            id="nombre"
                                            name="nombre"
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition duration-200"
                                            placeholder="Tu nombre"
                                            value={formData.nombre}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="apellidos" className="block text-sm font-medium text-indigo-200 mb-1">
                                            Apellidos *
                                        </label>
                                        <input
                                            id="apellidos"
                                            name="apellidos"
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition duration-200"
                                            placeholder="Tus apellidos"
                                            value={formData.apellidos}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="username" className="block text-sm font-medium text-indigo-200 mb-1">
                                            Nombre de usuario *
                                        </label>
                                        <input
                                            id="username"
                                            name="username"
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition duration-200"
                                            placeholder="Tu nombre de usuario"
                                            value={formData.username}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-indigo-200 mb-1">
                                            Contraseña *
                                        </label>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition duration-200"
                                            placeholder="Tu contraseña"
                                            value={formData.password}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-indigo-200 mb-1">
                                            Correo electrónico *
                                        </label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition duration-200"
                                            placeholder="Tu correo electrónico"
                                            value={formData.email}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="telefono" className="block text-sm font-medium text-indigo-200 mb-1">
                                            Teléfono *
                                        </label>
                                        <input
                                            id="telefono"
                                            name="telefono"
                                            type="tel"
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition duration-200"
                                            placeholder="Tu teléfono"
                                            value={formData.telefono}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="genero" className="block text-sm font-medium text-indigo-200 mb-1">
                                            Género *
                                        </label>
                                        <select
                                            id="genero"
                                            name="genero"
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition duration-200 appearance-none"
                                            value={formData.genero}
                                            onChange={handleChange}
                                            disabled={loading}
                                        >
                                            <option value="" className="bg-indigo-950 text-white">Selecciona tu género</option>
                                            {Object.values(Genero).map(({ value, label }) => (
                                                <option key={value} value={value} className="bg-indigo-950 text-white">{label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-indigo-200 mb-1">
                                            Fecha de nacimiento *
                                        </label>
                                        <input
                                            id="fechaNacimiento"
                                            name="fechaNacimiento"
                                            type="date"
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition duration-200"
                                            value={formData.fechaNacimiento}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                        {errorEdad && (
                                            <p className="mt-1 text-sm text-red-400">{errorEdad}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="ubicacion" className="block text-sm font-medium text-indigo-200 mb-1">
                                            Ubicación *
                                        </label>
                                        <input
                                            id="ubicacion"
                                            name="ubicacion"
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition duration-200"
                                            placeholder="País o ciudad"
                                            value={formData.ubicacion}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="experienciaMindfulness" className="block text-sm font-medium text-indigo-200 mb-1">
                                            Experiencia en Mindfulness *
                                        </label>
                                        <select
                                            id="experienciaMindfulness"
                                            name="experienciaMindfulness"
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition duration-200 appearance-none"
                                            value={formData.experienciaMindfulness}
                                            onChange={handleChange}
                                            disabled={loading}
                                        >
                                            <option value="" className="bg-indigo-950 text-white">Selecciona tu experiencia</option>
                                            {Object.values(ExperienciaMindfulness).map(({ value, label }) => (
                                                <option key={value} value={value} className="bg-indigo-950 text-white">
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="ocupacion" className="block text-sm font-medium text-indigo-200 mb-1">
                                            Ocupación *
                                        </label>
                                        <input
                                            id="ocupacion"
                                            name="ocupacion"
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition duration-200"
                                            placeholder="Tu ocupación"
                                            value={formData.ocupacion}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="nivelEducativo" className="block text-sm font-medium text-indigo-200 mb-1">
                                            Nivel Educativo *
                                        </label>
                                        <select
                                            id="nivelEducativo"
                                            name="nivelEducativo"
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition duration-200 appearance-none"
                                            value={formData.nivelEducativo}
                                            onChange={handleChange}
                                            disabled={loading}
                                        >
                                            <option value="" className="bg-indigo-950 text-white">Selecciona tu nivel educativo</option>
                                            {Object.values(NivelEducativo).map(({ value, label }) => (
                                                <option key={value} value={value} className="bg-indigo-950 text-white">
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label htmlFor="condicionesSalud" className="block text-sm font-medium text-indigo-200 mb-1">
                                            Condiciones de salud relevantes
                                        </label>
                                        <textarea
                                            id="condicionesSalud"
                                            name="condicionesSalud"
                                            rows="3"
                                            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition duration-200"
                                            placeholder="Describe cualquier condición de salud relevante (opcional)"
                                            value={formData.condicionesSalud}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="md:col-span-2 mt-6">
                                        <div className="flex items-start space-x-3">
                                            <input
                                                type="checkbox"
                                                id="aceptaTerminos"
                                                name="aceptaTerminos"
                                                checked={formData.aceptaTerminos}
                                                onChange={(e) => {
                                                    setFormData({
                                                        ...formData,
                                                        aceptaTerminos: e.target.checked
                                                    });
                                                    if (e.target.checked) {
                                                        setErrorTerminos('');
                                                    }
                                                }}
                                                className="mt-1 h-4 w-4 text-indigo-500 focus:ring-indigo-500 border-white/20 rounded bg-white/5"
                                            />
                                            <div>
                                                <label htmlFor="aceptaTerminos" className="text-sm text-white font-medium">
                                                    Acepto los términos, condiciones y el consentimiento informado *
                                                </label>
                                                <p className="text-sm text-indigo-200 mt-1">
                                                    Al registrarme, confirmo que he leído y acepto los términos y condiciones, y doy mi consentimiento informado para participar en la plataforma.
                                                </p>
                                                <Link
                                                    to="/terminos-servicio"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center text-sm text-indigo-300 hover:text-white mt-2"
                                                >
                                                    <LinkIcon className="h-4 w-4 mr-1" />
                                                    Ver términos y condiciones completos
                                                </Link>
                                                {errorTerminos && (
                                                    <p className="mt-1 text-sm text-red-400">{errorTerminos}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 mt-6">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                        >
                                            {loading ? 'Registrando...' : 'Registrarme'}
                                        </button>
                                    </div>
                                </div>
                            </form>

                            <div className="mt-6">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-gradient-to-bl from-indigo-950 via-sky-800 to-blue-900 text-indigo-200">
                                            ¿Ya tienes una cuenta?
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 text-center">
                                    <Link
                                        to="/login"
                                        className="font-medium text-indigo-300 hover:text-white transition duration-200"
                                    >
                                        Inicia sesión aquí
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BackgroundVideo>
    );
};

export default RegisterParticipante;