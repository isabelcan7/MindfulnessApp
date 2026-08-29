import api from '../config/axios';

export const exportarAdmin = async (tipo) => {
    const response = await api.get('/admin/exportar/', {
        params: { tipo },
        responseType: 'blob',
    });

    const fecha = new Date().toISOString().split('T')[0];
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${tipo}_${fecha}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

export const formatearFecha = (valor) => {
    if (!valor) return '—';
    return new Date(valor).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

export const formatearFechaHora = (valor) => {
    if (!valor) return '—';
    return new Date(valor).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const formatearMes = (valor) => {
    if (!valor) return '—';
    const [anio, mes] = valor.split('-');
    const fecha = new Date(Number(anio), Number(mes) - 1, 1);
    return fecha.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
};
