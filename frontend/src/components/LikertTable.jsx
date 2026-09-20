import React from 'react';

const LikertTable = ({
    textos,
    etiquetas,
    respuestas,
    onRespuestaChange,
    className = ""
}) => {
    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-indigo-500/20">
                    <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-indigo-200">
                            Pregunta
                        </th>
                        {etiquetas.map((etiqueta, index) => (
                            <th key={index} className="px-4 py-2 text-center text-sm font-medium text-indigo-200">
                                {etiqueta}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-indigo-500/10 divide-y divide-white/10">
                    {textos.map((texto, index) => (
                        <tr key={index}>
                            <td className="px-4 py-2">
                                <span className="text-indigo-200">{texto}</span>
                            </td>
                            {Array.from({ length: etiquetas.length }, (_, i) => (
                                <td key={i} className="px-4 py-2 text-center">
                                    <input
                                        type="radio"
                                        name={`likert-${index}`}
                                        value={i + 1}
                                        checked={respuestas[index] === i + 1}
                                        onChange={(e) => onRespuestaChange(index, parseInt(e.target.value))}
                                        className="bg-white/10 border border-white/20 rounded-xl focus:ring-1 text-white placeholder-purple-200 outline-none"
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LikertTable; 