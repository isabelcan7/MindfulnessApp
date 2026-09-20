import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Type, List, CheckSquare, ChevronDown, Star, BarChart2, Heart, ThumbsUp } from 'lucide-react';
import api from '../../../config/axios';
import ErrorAlert from '../../../components/ErrorAlert';
import { cuestionariosPredefinidos } from '../../../constants/cuestionarioPredefinidos';

const EditarCuestionario = () => {
    const { id, cuestionarioId } = useParams();
    const navigate = useNavigate();
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [preguntas, setPreguntas] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [tipoCuestionario, setTipoCuestionario] = useState('personalizado');
    const [cuestionarioPredefinidoSeleccionado, setCuestionarioPredefinidoSeleccionado] = useState(null);

    const tiposCuestionario = [
        { id: 'personalizado', nombre: 'Cuestionario Personalizado' },
        { id: 'likert', nombre: 'Likert Personalizado' },
        { id: 'predefinido', nombre: 'Cuestionario Predefinido' }
    ];

    const tiposPregunta = [
        { id: 'texto', nombre: 'Texto Libre', icono: <Type className="h-5 w-5" /> },
        { id: 'select', nombre: 'Selección Única', icono: <List className="h-5 w-5" /> },
        { id: 'checkbox', nombre: 'Múltiple Opción', icono: <CheckSquare className="h-5 w-5" /> },
        { id: 'calificacion', nombre: 'Calificación', icono: <Star className="h-5 w-5" /> }
    ];

    const iconosCalificacion = [
        { id: 'star', nombre: 'Estrella', icono: <Star className="h-5 w-5" /> },
        { id: 'heart', nombre: 'Corazón', icono: <Heart className="h-5 w-5" /> },
        { id: 'thumbsup', nombre: 'Me gusta', icono: <ThumbsUp className="h-5 w-5" /> }
    ];

    const opcionesLikert5Puntos = {
        acuerdo: [
            "Totalmente en desacuerdo",
            "En desacuerdo",
            "Ni de acuerdo ni en desacuerdo",
            "De acuerdo",
            "Totalmente de acuerdo"
        ],
        frecuencia: [
            "Nunca",
            "Rara vez",
            "A veces",
            "Frecuentemente",
            "Siempre"
        ]
    };

    useEffect(() => {
        const fetchCuestionario = async () => {
            try {
                const response = await api.get(`/cuestionario/${cuestionarioId}/`);
                const cuestionario = response.data;
                setTitulo(cuestionario.titulo);
                setDescripcion(cuestionario.descripcion);
                setTipoCuestionario(cuestionario.tipo_cuestionario);

                if (cuestionario.tipo_cuestionario === 'likert') {
                    // Convertir la estructura del backend al formato que espera el frontend
                    const preguntasFormateadas = cuestionario.preguntas[0].textos.map((texto) => ({
                        id: Date.now() + Math.random(), // Generamos un ID único
                        tipo: 'likert-5-puntos',
                        texto: texto,
                        likert5Puntos: {
                            tipo: cuestionario.preguntas[0].etiquetas[0] === "Totalmente en desacuerdo" ? 'acuerdo' :
                                cuestionario.preguntas[0].etiquetas[0] === "Nunca" ? 'frecuencia' : 'personalizado',
                            filas: cuestionario.preguntas[0].textos,
                            etiquetas: cuestionario.preguntas[0].etiquetas
                        }
                    }));
                    setPreguntas(preguntasFormateadas);
                } else {
                    setPreguntas(cuestionario.preguntas);
                }

                if (cuestionario.tipo_cuestionario === 'predefinido') {
                    const predefinido = cuestionariosPredefinidos.find(c => c.id === cuestionario.cuestionario_predefinido);
                    if (predefinido) {
                        setCuestionarioPredefinidoSeleccionado(predefinido);
                    }
                }
            } catch (err) {
                setError('Error al cargar el cuestionario');
                console.error('Error:', err);
            } finally {
                setInitialLoading(false);
            }
        };

        fetchCuestionario();
    }, [cuestionarioId]);

    const handleTipoCuestionarioChange = (nuevoTipo) => {
        setTipoCuestionario(nuevoTipo);
        setPreguntas([]);
        setTitulo('');
        setDescripcion('');
        setCuestionarioPredefinidoSeleccionado(null);
    };

    const handleCuestionarioPredefinidoSelect = (cuestionario) => {
        setCuestionarioPredefinidoSeleccionado(cuestionario);
        setTitulo(cuestionario.nombre);
        setDescripcion(cuestionario.descripcion);
    };

    const validarCuestionario = () => {
        if (!titulo.trim()) {
            setError('Por favor, ingrese un título');
            return false;
        }
        if (!descripcion.trim()) {
            setError('Por favor, ingrese una descripción');
            return false;
        }
        if (!tipoCuestionario) {
            setError('Por favor, seleccione un tipo de cuestionario');
            return false;
        }
        if (preguntas.length === 0) {
            setError('Debe añadir al menos una pregunta');
            return false;
        }

        // Validaciones específicas según el tipo de cuestionario
        if (tipoCuestionario === 'likert') {
            if (!preguntas[0]?.likert5Puntos?.tipo) {
                setError('Debe seleccionar un tipo de escala para el cuestionario Likert');
                return false;
            }
            if (preguntas[0]?.likert5Puntos?.filas.length === 0) {
                setError('Debe añadir al menos una fila al cuestionario Likert');
                return false;
            }
        }

        for (const pregunta of preguntas) {
            if (!pregunta.texto.trim()) {
                setError('Todas las preguntas deben tener un texto');
                return false;
            }

            if ((pregunta.tipo === 'select' || pregunta.tipo === 'checkbox') &&
                (pregunta.opciones.length < 2 || pregunta.opciones.some(op => !op.trim()))) {
                setError('Las preguntas de opción múltiple deben tener al menos 2 opciones válidas');
                return false;
            }
        }

        setError('');
        return true;
    };

    const agregarPregunta = (tipo) => {
        const nuevaPregunta = {
            id: Date.now(),
            tipo,
            texto: '',
            opciones: tipo === 'select' || tipo === 'checkbox' ? [''] : [],
            estrellas: tipo === 'calificacion' ? {
                cantidad: 5,
                icono: 'star'
            } : null,
            escala: tipo === 'likert' ? {
                inicio: 1,
                fin: 5,
                etiquetas: Array(5).fill('').map((_, i) => `Opción ${i + 1}`)
            } : null,
            likert5Puntos: tipo === 'likert-5-puntos' ? {
                tipo: 'acuerdo',
                filas: ['']
            } : null
        };
        setPreguntas([...preguntas, nuevaPregunta]);
    };

    const eliminarPregunta = (id) => {
        setPreguntas(preguntas.filter(p => p.id !== id));
    };

    const actualizarPregunta = (id, campo, valor) => {
        setPreguntas(preguntas.map(p =>
            p.id === id ? { ...p, [campo]: valor } : p
        ));
    };

    const actualizarOpcion = (preguntaId, opcionIndex, valor) => {
        setPreguntas(preguntas.map(p => {
            if (p.id === preguntaId) {
                const nuevasOpciones = [...p.opciones];
                nuevasOpciones[opcionIndex] = valor;
                return { ...p, opciones: nuevasOpciones };
            }
            return p;
        }));
    };

    const agregarOpcion = (preguntaId) => {
        setPreguntas(preguntas.map(p => {
            if (p.id === preguntaId) {
                return { ...p, opciones: [...p.opciones, ''] };
            }
            return p;
        }));
    };

    const eliminarOpcion = (preguntaId, opcionIndex) => {
        setPreguntas(preguntas.map(p => {
            if (p.id === preguntaId) {
                const nuevasOpciones = p.opciones.filter((_, index) => index !== opcionIndex);
                return { ...p, opciones: nuevasOpciones };
            }
            return p;
        }));
    };

    const actualizarEscalaLikert = (preguntaId, campo, valor) => {
        setPreguntas(preguntas.map(p => {
            if (p.id === preguntaId) {
                const nuevaEscala = { ...p.escala };
                if (campo === 'inicio' || campo === 'fin') {
                    const inicio = campo === 'inicio' ? valor : p.escala.inicio;
                    const fin = campo === 'fin' ? valor : p.escala.fin;
                    const numOpciones = fin - inicio + 1;
                    nuevaEscala.etiquetas = Array(numOpciones).fill('').map((_, i) =>
                        p.escala.etiquetas[i] || `Opción ${i + 1}`
                    );
                }
                nuevaEscala[campo] = valor;
                return { ...p, escala: nuevaEscala };
            }
            return p;
        }));
    };

    const actualizarEtiquetaLikert = (preguntaId, index, valor) => {
        setPreguntas(preguntas.map(p => {
            if (p.id === preguntaId) {
                const nuevasEtiquetas = [...p.escala.etiquetas];
                nuevasEtiquetas[index] = valor;
                return {
                    ...p,
                    escala: { ...p.escala, etiquetas: nuevasEtiquetas }
                };
            }
            return p;
        }));
    };

    const actualizarLikert5Puntos = (preguntaId, campo, valor) => {
        setPreguntas(preguntas.map(p => {
            if (p.id === preguntaId) {
                return {
                    ...p,
                    likert5Puntos: {
                        ...p.likert5Puntos,
                        [campo]: valor
                    }
                };
            }
            return p;
        }));
    };

    const agregarFilaLikert5Puntos = (preguntaId) => {
        setPreguntas(preguntas.map(p => {
            if (p.id === preguntaId) {
                return {
                    ...p,
                    likert5Puntos: {
                        ...p.likert5Puntos,
                        filas: [...p.likert5Puntos.filas, '']
                    }
                };
            }
            return p;
        }));
    };

    const eliminarFilaLikert5Puntos = (preguntaId, index) => {
        setPreguntas(preguntas.map(p => {
            if (p.id === preguntaId) {
                const nuevasFilas = p.likert5Puntos.filas.filter((_, i) => i !== index);
                return {
                    ...p,
                    likert5Puntos: {
                        ...p.likert5Puntos,
                        filas: nuevasFilas
                    }
                };
            }
            return p;
        }));
    };

    const actualizarFilaLikert5Puntos = (preguntaId, index, valor) => {
        setPreguntas(preguntas.map(p => {
            if (p.id === preguntaId) {
                const nuevasFilas = [...p.likert5Puntos.filas];
                nuevasFilas[index] = valor;
                return {
                    ...p,
                    likert5Puntos: {
                        ...p.likert5Puntos,
                        filas: nuevasFilas
                    }
                };
            }
            return p;
        }));
    };

    const handleGuardar = async () => {
        if (!validarCuestionario()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            let preguntasFormateadas = preguntas;

            // Si es un cuestionario Likert, convertimos al formato que espera el backend
            if (tipoCuestionario === 'likert') {
                preguntasFormateadas = [{
                    etiquetas: preguntas[0].likert5Puntos.tipo === 'personalizado'
                        ? preguntas[0].likert5Puntos.etiquetas
                        : opcionesLikert5Puntos[preguntas[0].likert5Puntos.tipo],
                    textos: preguntas.map(p => p.texto)
                }];
            }

            const cuestionario = {
                titulo,
                descripcion,
                preguntas: preguntasFormateadas,
                tipo_cuestionario: tipoCuestionario,
                cuestionario_predefinido: tipoCuestionario === 'predefinido' ? cuestionarioPredefinidoSeleccionado?.id : undefined
            };

            await api.put(`/cuestionario/${cuestionarioId}/`, cuestionario);
            navigate(`/programas/${id}`);
        } catch (err) {
            console.error('Error al guardar el cuestionario:', err);
            setError(err.response?.data?.error || 'Error al guardar el cuestionario');
        } finally {
            setLoading(false);
        }
    };

    const getIconoPregunta = (tipo) => {
        return tiposPregunta.find(t => t.id === tipo)?.icono;
    };

    if (initialLoading) {
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
                        {/* Encabezado */}
                        <div className="flex items-center justify-between mb-8">
                            <button
                                onClick={() => navigate(`/programas/${id}`)}
                                className="flex items-center text-purple-200 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                Volver
                            </button>
                            <div className="flex items-center space-x-4">
                                <span className="text-lg font-semibold text-white">
                                    Editando Cuestionario
                                </span>
                                <button
                                    onClick={handleGuardar}
                                    disabled={loading}
                                    className={`flex items-center px-4 py-2 bg-emerald-500/20 text-emerald-100 rounded-xl transition-all duration-200 border border-emerald-400/30 backdrop-blur-sm ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-500/30'}`}
                                >
                                    {loading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    ) : (
                                        <Save className="h-5 w-5 mr-2" />
                                    )}
                                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </div>

                        <ErrorAlert
                            message={error}
                            onClose={() => setError(null)}
                        />

                        {/* Selector de tipo de cuestionario */}
                        <div className="mb-8">
                            <h3 className="text-lg font-medium text-white mb-4">Tipo de cuestionario</h3>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center py-6">
                                    <div className="bg-transparent px-4">
                                        <div className="flex space-x-8">
                                            {tiposCuestionario.map((tipo) => (
                                                <button
                                                    key={tipo.id}
                                                    onClick={() => handleTipoCuestionarioChange(tipo.id)}
                                                    className={`
                                                        group relative flex flex-col items-center
                                                        ${tipoCuestionario === tipo.id ? 'text-emerald-300' : 'text-purple-200 hover:text-white'}
                                                    `}
                                                >
                                                    <div className={`
                                                        mb-3 rounded-full p-3 transition-all duration-200
                                                        ${tipoCuestionario === tipo.id
                                                            ? 'bg-white/30 ring-4 ring-white/20'
                                                            : 'bg-white/10 group-hover:bg-white/20'
                                                        }
                                                    `}>
                                                        {tipo.id === 'personalizado' && <Type className="h-6 w-6" />}
                                                        {tipo.id === 'likert' && <BarChart2 className="h-6 w-6" />}
                                                        {tipo.id === 'predefinido' && <List className="h-6 w-6" />}
                                                    </div>
                                                    <span className="text-sm font-medium">{tipo.nombre}</span>
                                                    <span className="absolute -bottom-8 text-xs ${tipoCuestionario === tipo.id ? 'text-emerald-300' : 'text-purple-200 hover:text-white'}">
                                                        {tipo.id === 'personalizado' && 'Crea un cuestionario con diferentes tipos de preguntas'}
                                                        {tipo.id === 'likert' && 'Crea una escala Likert de 5 puntos'}
                                                        {tipo.id === 'predefinido' && 'Selecciona un cuestionario validado'}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contenido según el tipo seleccionado */}
                        {tipoCuestionario === 'predefinido' ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {cuestionariosPredefinidos.map((cuestionario) => (
                                        <div
                                            key={cuestionario.id}
                                            onClick={() => handleCuestionarioPredefinidoSelect(cuestionario)}
                                            className={`
                                                p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                                                ${cuestionarioPredefinidoSeleccionado?.id === cuestionario.id
                                                    ? 'bg-white/30 border-white/40 text-white'
                                                    : 'bg-white/10 border-white/20 hover:bg-white/20 text-purple-200 hover:text-white'
                                                }
                                            `}
                                        >
                                            <h3 className="font-medium mb-2">{cuestionario.nombre}</h3>
                                            <p className="text-sm opacity-80">{cuestionario.descripcion}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : tipoCuestionario === 'likert' ? (
                            <div className="space-y-6">
                                {/* Información básica */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Título del Cuestionario <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={titulo}
                                        onChange={(e) => setTitulo(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-1 text-white placeholder-purple-200 outline-none"
                                        placeholder="Ingrese el título del cuestionario"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Descripción <span className="text-red-400">*</span>
                                    </label>
                                    <textarea
                                        value={descripcion}
                                        onChange={(e) => setDescripcion(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-1 text-white placeholder-purple-200 outline-none"
                                        rows="3"
                                        placeholder="Ingrese una descripción del cuestionario"
                                    />
                                </div>

                                {/* Selección de tipo de escala */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Tipo de escala
                                    </label>
                                    <div className="grid grid-cols-3 gap-4">
                                        <button
                                            onClick={() => {
                                                const tipo = 'acuerdo';
                                                if (preguntas.length === 0) {
                                                    const nuevaPregunta = {
                                                        id: Date.now(),
                                                        tipo: 'likert-5-puntos',
                                                        texto: '',
                                                        likert5Puntos: {
                                                            tipo,
                                                            filas: ['']
                                                        }
                                                    };
                                                    setPreguntas([nuevaPregunta]);
                                                } else {
                                                    setPreguntas(preguntas.map(p => ({
                                                        ...p,
                                                        likert5Puntos: {
                                                            ...p.likert5Puntos,
                                                            tipo
                                                        }
                                                    })));
                                                }
                                            }}
                                            className={`flex items-center justify-center p-4 border-2 rounded-xl transition-all duration-200 ${preguntas[0]?.likert5Puntos?.tipo === 'acuerdo'
                                                ? 'bg-white/30 border-white/40 text-emerald-300'
                                                : 'bg-white/10 border-white/20 hover:bg-white/20 text-white'
                                                }`}
                                        >
                                            <span className="text-sm">Escala de Acuerdo</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                const tipo = 'frecuencia';
                                                if (preguntas.length === 0) {
                                                    const nuevaPregunta = {
                                                        id: Date.now(),
                                                        tipo: 'likert-5-puntos',
                                                        texto: '',
                                                        likert5Puntos: {
                                                            tipo,
                                                            filas: ['']
                                                        }
                                                    };
                                                    setPreguntas([nuevaPregunta]);
                                                } else {
                                                    setPreguntas(preguntas.map(p => ({
                                                        ...p,
                                                        likert5Puntos: {
                                                            ...p.likert5Puntos,
                                                            tipo
                                                        }
                                                    })));
                                                }
                                            }}
                                            className={`flex items-center justify-center p-4 border-2 rounded-xl transition-all duration-200 ${preguntas[0]?.likert5Puntos?.tipo === 'frecuencia'
                                                ? 'bg-white/30 border-white/40 text-emerald-300'
                                                : 'bg-white/10 border-white/20 hover:bg-white/20 text-white'
                                                }`}
                                        >
                                            <span className="text-sm">Escala de Frecuencia</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                const tipo = 'personalizado';
                                                if (preguntas.length === 0) {
                                                    const nuevaPregunta = {
                                                        id: Date.now(),
                                                        tipo: 'likert-5-puntos',
                                                        texto: '',
                                                        likert5Puntos: {
                                                            tipo,
                                                            filas: [''],
                                                            etiquetas: ['', '', '', '', '']
                                                        }
                                                    };
                                                    setPreguntas([nuevaPregunta]);
                                                } else {
                                                    setPreguntas(preguntas.map(p => ({
                                                        ...p,
                                                        likert5Puntos: {
                                                            ...p.likert5Puntos,
                                                            tipo,
                                                            etiquetas: ['', '', '', '', '']
                                                        }
                                                    })));
                                                }
                                            }}
                                            className={`flex items-center justify-center p-4 border-2 rounded-xl transition-all duration-200 ${preguntas[0]?.likert5Puntos?.tipo === 'personalizado'
                                                ? 'bg-white/30 border-white/40 text-emerald-300'
                                                : 'bg-white/10 border-white/20 hover:bg-white/20 text-white'
                                                }`}
                                        >
                                            <span className="text-sm">Personalizado</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Configuración de Likert 5 puntos */}
                                <div className="mt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-white">
                                            Filas de la escala
                                        </label>
                                        <button
                                            onClick={() => {
                                                const nuevaPregunta = {
                                                    id: Date.now(),
                                                    tipo: 'likert-5-puntos',
                                                    texto: '',
                                                    likert5Puntos: {
                                                        tipo: preguntas[0]?.likert5Puntos?.tipo || 'acuerdo',
                                                        filas: [''],
                                                        etiquetas: preguntas[0]?.likert5Puntos?.tipo === 'personalizado'
                                                            ? ['', '', '', '', '']
                                                            : undefined
                                                    }
                                                };
                                                setPreguntas([...preguntas, nuevaPregunta]);
                                            }}
                                            className="flex items-center text-sm text-emerald-300 hover:text-emerald-200"
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Agregar fila
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-white/10">
                                            <thead className="bg-white/5">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-sm font-medium text-white">
                                                        Pregunta
                                                    </th>
                                                    {preguntas[0]?.likert5Puntos?.tipo === 'personalizado' ? (
                                                        preguntas[0]?.likert5Puntos?.etiquetas.map((etiqueta, index) => (
                                                            <th key={index} className="px-4 py-2 text-center text-sm font-medium text-white">
                                                                <input
                                                                    type="text"
                                                                    value={etiqueta}
                                                                    onChange={(e) => {
                                                                        const nuevasEtiquetas = [...preguntas[0].likert5Puntos.etiquetas];
                                                                        nuevasEtiquetas[index] = e.target.value;
                                                                        setPreguntas(preguntas.map(p => ({
                                                                            ...p,
                                                                            likert5Puntos: {
                                                                                ...p.likert5Puntos,
                                                                                etiquetas: nuevasEtiquetas
                                                                            }
                                                                        })));
                                                                    }}
                                                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-1 text-white placeholder-purple-200 outline-none"
                                                                    placeholder={`Etiqueta ${index + 1}`}
                                                                />
                                                            </th>
                                                        ))
                                                    ) : (
                                                        opcionesLikert5Puntos[preguntas[0]?.likert5Puntos?.tipo || 'acuerdo'].map((opcion, index) => (
                                                            <th key={index} className="px-4 py-2 text-center text-sm font-medium text-purple-200">
                                                                {opcion}
                                                            </th>
                                                        ))
                                                    )}
                                                    <th className="w-10"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/10">
                                                {preguntas.map((pregunta, index) => (
                                                    <tr key={index} className="bg-white/5">
                                                        <td className="px-4 py-2">
                                                            <input
                                                                type="text"
                                                                value={pregunta.texto}
                                                                onChange={(e) => actualizarPregunta(pregunta.id, 'texto', e.target.value)}
                                                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-1 text-white placeholder-purple-200 outline-none"
                                                                placeholder={`Fila ${index + 1}`}
                                                            />
                                                        </td>
                                                        {Array.from({ length: 5 }, (_, i) => (
                                                            <td key={i} className="px-4 py-2 text-center">
                                                                <input
                                                                    type="radio"
                                                                    name={`likert-${pregunta.id}-${index}`}
                                                                    className="h-4 w-4 text-emerald-500 focus:ring-emerald-500/50 border-white/20 bg-white/10"
                                                                />
                                                            </td>
                                                        ))}
                                                        <td className="px-4 py-2 text-right">
                                                            <button
                                                                onClick={() => eliminarFilaLikert5Puntos(pregunta.id, index)}
                                                                className="p-1 text-purple-200 hover:text-red-400 transition-colors"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Información básica */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Título del Cuestionario <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={titulo}
                                        onChange={(e) => setTitulo(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-1 text-white placeholder-purple-200 outline-none"
                                        placeholder="Ingrese el título del cuestionario"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Descripción <span className="text-red-400">*</span>
                                    </label>
                                    <textarea
                                        value={descripcion}
                                        onChange={(e) => setDescripcion(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-1 text-white placeholder-purple-200 outline-none"
                                        rows="3"
                                        placeholder="Ingrese una descripción del cuestionario"
                                    />
                                </div>

                                {/* Botones de tipo de pregunta */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-medium text-white mb-4">Agregar Pregunta</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {tiposPregunta.map((tipo) => (
                                            <button
                                                key={tipo.id}
                                                onClick={() => agregarPregunta(tipo.id)}
                                                className="flex flex-col items-center justify-center p-4 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 hover:border-emerald-500/30 transition-all duration-200"
                                            >
                                                <div className="text-emerald-300 mb-2">{tipo.icono}</div>
                                                <span className="text-sm text-white">{tipo.nombre}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Lista de preguntas */}
                                <div className="space-y-6">
                                    {preguntas.map((pregunta, index) => (
                                        <div key={pregunta.id} className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-violet-500/10 blur-xl rounded-xl"></div>
                                            <div className="relative bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                                                <div className="flex items-start">
                                                    <div className="flex-shrink-0 mr-4 mt-2">
                                                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                                                            {getIconoPregunta(pregunta.tipo)}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-medium text-emerald-300">
                                                                Pregunta {index + 1} - {tiposPregunta.find(t => t.id === pregunta.tipo)?.nombre}
                                                            </span>
                                                            <button
                                                                onClick={() => eliminarPregunta(pregunta.id)}
                                                                className="p-2 text-purple-200 hover:text-red-400 transition-colors"
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={pregunta.texto}
                                                            onChange={(e) => actualizarPregunta(pregunta.id, 'texto', e.target.value)}
                                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-1 text-white placeholder-purple-200 outline-none"
                                                            placeholder="Ingrese la pregunta"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Opciones según el tipo de pregunta */}
                                                {(pregunta.tipo === 'select' || pregunta.tipo === 'checkbox') && (
                                                    <div className="ml-14 space-y-2 mt-4">
                                                        {pregunta.opciones.map((opcion, index) => (
                                                            <div key={index} className="flex items-center space-x-2">
                                                                <input
                                                                    type="text"
                                                                    value={opcion}
                                                                    onChange={(e) => actualizarOpcion(pregunta.id, index, e.target.value)}
                                                                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-1 text-white placeholder-purple-200 outline-none"
                                                                    placeholder={`Opción ${index + 1}`}
                                                                />
                                                                <button
                                                                    onClick={() => eliminarOpcion(pregunta.id, index)}
                                                                    className="p-2 text-purple-200 hover:text-red-400 transition-colors"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <button
                                                            onClick={() => agregarOpcion(pregunta.id)}
                                                            className="flex items-center text-sm text-emerald-300 hover:text-emerald-200"
                                                        >
                                                            <Plus className="h-4 w-4 mr-1" />
                                                            Agregar opción
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Configuración de calificación */}
                                                {pregunta.tipo === 'calificacion' && (
                                                    <div className="ml-14 space-y-4 mt-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-white mb-2">
                                                                Número de iconos
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={pregunta.estrellas.cantidad}
                                                                onChange={(e) => {
                                                                    let valor = parseInt(e.target.value);
                                                                    if (isNaN(valor)) valor = 2;
                                                                    if (valor < 2) valor = 2;
                                                                    if (valor > 10) valor = 10;

                                                                    actualizarPregunta(pregunta.id, 'estrellas', {
                                                                        ...pregunta.estrellas,
                                                                        cantidad: valor
                                                                    });
                                                                }}
                                                                min="2"
                                                                max="10"
                                                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-1 text-white placeholder-purple-200 outline-none"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-white mb-2">
                                                                Tipo de icono
                                                            </label>
                                                            <div className="grid grid-cols-3 gap-4">
                                                                {iconosCalificacion.map((icono) => (
                                                                    <button
                                                                        key={icono.id}
                                                                        onClick={() => actualizarPregunta(pregunta.id, 'estrellas', {
                                                                            ...pregunta.estrellas,
                                                                            icono: icono.id
                                                                        })}
                                                                        className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-colors ${pregunta.estrellas.icono === icono.id
                                                                            ? 'bg-white/40 border-white text-white'
                                                                            : 'border-white/20 hover:bg-white/20 hover:border-emerald-300'
                                                                            }`}
                                                                    >
                                                                        <div className="mb-2 text-white">
                                                                            {icono.icono}
                                                                        </div>
                                                                        <span className="text-sm text-white">{icono.nombre}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="mt-4 p-4 bg-white/10 border border-white/20 rounded-xl">
                                                            <label className="block text-sm font-medium text-white mb-2">
                                                                Vista previa
                                                            </label>
                                                            <div className="flex items-center space-x-2">
                                                                {Array.from({ length: pregunta.estrellas.cantidad }, (_, i) => (
                                                                    <div key={i} className="text-2xl">
                                                                        {pregunta.estrellas.icono === 'star' && <Star className="h-6 w-6 text-yellow-500" />}
                                                                        {pregunta.estrellas.icono === 'heart' && <Heart className="h-6 w-6 text-red-500" />}
                                                                        {pregunta.estrellas.icono === 'thumbsup' && <ThumbsUp className="h-6 w-6 text-blue-500" />}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditarCuestionario; 