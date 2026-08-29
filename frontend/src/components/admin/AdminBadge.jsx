const estilos = {
    publicado: 'bg-emerald-500/20 text-emerald-300',
    borrador: 'bg-amber-500/20 text-amber-300',
    en_progreso: 'bg-cyan-500/20 text-cyan-300',
    completado: 'bg-emerald-500/20 text-emerald-300',
    abandonado: 'bg-rose-500/20 text-rose-300',
    INVESTIGADOR: 'bg-violet-500/20 text-violet-300',
    PARTICIPANTE: 'bg-cyan-500/20 text-cyan-300',
    ADMIN: 'bg-amber-500/20 text-amber-300',
    neutro: 'bg-slate-500/20 text-slate-300',
};

const AdminBadge = ({ valor, texto }) => (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${estilos[valor] || estilos.neutro}`}>
        {texto || valor}
    </span>
);

export default AdminBadge;
