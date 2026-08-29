import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../config/axios';
import { ROLES, PERMISSIONS, ROLE_PERMISSIONS } from '../config/auth';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const resetError = () => setError(null);

    // Verificar si el usuario tiene un permiso específico
    const hasPermission = (permission) => {
        if (!user) return false;
        return ROLE_PERMISSIONS[user.role]?.includes(permission) || false;
    };

    // Verificar si el usuario tiene un rol específico
    const hasRole = (role) => {
        if (!user) return false;
        return user.role === role;
    };

    // Verificar si el usuario es un investigador
    const isInvestigador = () => {
        if (!user) return false;
        return user.role === ROLES.INVESTIGADOR;
    };

    // Verificar si el usuario es un participante
    const isParticipante = () => {
        if (!user) return false;
        return user.role === ROLES.PARTICIPANTE;
    };

    // Verificar si el usuario es un administrador
    const isAdministrador = () => {
        if (!user) return false;
        return user.role === ROLES.ADMIN;
    };

    // Verificar si el usuario está autenticado
    const isAuthenticated = () => {
        return !!user;
    };

    useEffect(() => {
        setError(null);
    }, [location.pathname]);

    // Cargar el estado de autenticación al iniciar
    useEffect(() => {
        const loadUser = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                if (!token) {
                    setLoading(false);
                    return;
                }

                const response = await api.get('/auth/me');
                setUser(response.data);
            } catch (err) {
                localStorage.removeItem('token');
                setError(err.response?.data?.message || 'Error al cargar el usuario');
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    // Función de login
    const login = async (credentials) => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.post('/auth/login', credentials);
            const { access, refresh, user } = response.data;

            localStorage.setItem('token', access);
            localStorage.setItem('refresh', refresh);

            setUser(user);

            // Redirigir según el rol
            if (user.role === ROLES.ADMIN) {
                navigate('/admin');
            } else if (user.role === ROLES.INVESTIGADOR) {
                navigate('/dashboard');
            } else {
                navigate('/home');
            }
        } catch (err) {
            console.error("Error en el login: ", err);
            setError(err.response?.data?.error || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    // Función de registro
    const register = async (userData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.post('/auth/register', userData);
            const { access, refresh, user } = response.data;

            localStorage.setItem('token', access);
            localStorage.setItem('refresh', refresh);

            setUser(user);
            setError(null);

            // Redirigir según el rol
            if (user.role === ROLES.INVESTIGADOR) {
                navigate('/dashboard');
            } else {
                navigate('/home');
            }
        } catch (error) {
            console.error('Error en el registro:', error);
            if (error.response?.data?.error) {
                setError(error.response?.data?.error);
            } else if (error.response?.data) {
                setError(error.response?.data);
            } else {
                setError('Error al registrarse');
            }
        } finally {
            setLoading(false);
        }
    };

    // Función de logout
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    // Función para actualizar el perfil del usuario
    const updateProfile = async (profileData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.put('/auth/profile', profileData);
            setUser(response.data);
            // setUser(prev => ({ ...prev, ...response.data }));
        } catch (err) {
            setError(err.response?.data?.message || 'Error al actualizar perfil');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Función para cambiar la contraseña
    const changePassword = async (oldPassword, newPassword) => {
        try {
            const response = await api.post('/auth/password', {
                old_password: oldPassword,
                new_password: newPassword
            });

            localStorage.setItem('token', response.data.access);
            localStorage.setItem('refresh', response.data.refresh);

            return response.data;
        } catch (error) {
            console.error('Error al cambiar la contraseña:', error);
            if (error.response?.data?.error) {
                throw new Error(error.response?.data?.error);
            } else if (error.response?.data) {
                throw new Error(error.response?.data);
            } else {
                throw new Error('Error al cambiar la contraseña');
            }
        }
    };

    // Función para eliminar la cuenta
    const deleteAccount = async () => {
        try {
            await api.delete('/auth/delete');
            logout();
        } catch (error) {
            console.error('Error al eliminar la cuenta:', error);
            if (error.response?.data?.error) {
                throw new Error(error.response?.data?.error);
            } else if (error.response?.data) {
                throw new Error(error.response?.data);
            } else {
                throw new Error('Error al eliminar la cuenta');
            }
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        deleteAccount,
        hasPermission,
        hasRole,
        resetError,
        isAuthenticated,
        isInvestigador,
        isParticipante,
        isAdministrador
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
