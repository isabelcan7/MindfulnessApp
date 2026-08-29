import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { exportarAdmin } from '../../utils/adminUtils';

const AdminExportButton = ({ tipo, onError }) => {
    const [descargando, setDescargando] = useState(false);

    const descargar = async () => {
        setDescargando(true);
        try {
            await exportarAdmin(tipo);
        } catch (error) {
            console.error('Error al exportar:', error);
            if (onError) onError('No se ha podido generar la exportación');
        } finally {
            setDescargando(false);
        }
    };

    return (
        <button
            onClick={descargar}
            disabled={descargando}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50 whitespace-nowrap"
        >
            {descargando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            <span>Exportar CSV</span>
        </button>
    );
};

export default AdminExportButton;
