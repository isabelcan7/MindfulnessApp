import React from 'react';
import { esFormatoEscala } from '../constants/enums';

const TablaCuestionario = ({ titulo, cuestionario }) => {
    if (!cuestionario) return null;

    // Renderizar tabla para cuestionario tipo Likert
    if (esFormatoEscala(cuestionario.tipo)) {
        const respuestasArray = Object.entries(cuestionario.respuestas).map(([id, respuestas]) => ({
            participante_id: id,
            respuestas: respuestas
        }));

        return (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-6 mt-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">{titulo}</h3>
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-purple-200 mb-2">Escala de valoración:</h4>
                    <div className="flex space-x-4">
                        {cuestionario.etiquetas.map((etiqueta, index) => (
                            <div key={index} className="text-sm text-purple-300">
                                {index + 1}: {etiqueta}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="overflow-x-auto bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <table className="min-w-full divide-y divide-white/10">
                        <thead className="bg-white/5">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                                    ID
                                </th>
                                {cuestionario.textos.map((texto, index) => (
                                    <th key={index} scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                                        {texto}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white/5 divide-y divide-white/10">
                            {respuestasArray.map((respuesta, index) => (
                                <tr key={index} className="hover:bg-white/10 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                        {respuesta.participante_id}
                                    </td>
                                    {respuesta.respuestas.map((valor, pIndex) => (
                                        <td key={pIndex} className="px-6 py-4 whitespace-nowrap text-sm text-purple-200">
                                            {valor}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // Renderizar tabla para cuestionario regular
    const respuestasArray = Object.entries(cuestionario.respuestas).map(([id, respuestas]) => ({
        participante_id: id,
        respuestas: Array.isArray(respuestas) ? respuestas : Object.values(respuestas)
    }));

    return (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-6 mt-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">{titulo}</h3>
            <div className="overflow-x-auto bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-white/5">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                                ID
                            </th>
                            {cuestionario.preguntas.map((pregunta, index) => (
                                <th key={index} scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                                    {String(pregunta)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white/5 divide-y divide-white/10">
                        {respuestasArray.map((respuesta, index) => (
                            <tr key={index} className="hover:bg-white/10 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                    {String(respuesta.participante_id)}
                                </td>
                                {respuesta.respuestas.map((valor, pIndex) => (
                                    <td key={pIndex} className="px-6 py-4 whitespace-nowrap text-sm text-purple-200">
                                        {String(valor)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TablaCuestionario; 