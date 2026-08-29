const acentos = {
    cyan: {
        halo: 'from-cyan-500/20 to-sky-500/20',
        icono: 'bg-cyan-500/20 text-cyan-300',
    },
    emerald: {
        halo: 'from-emerald-500/20 to-teal-500/20',
        icono: 'bg-emerald-500/20 text-emerald-300',
    },
    violet: {
        halo: 'from-violet-500/20 to-purple-500/20',
        icono: 'bg-violet-500/20 text-violet-300',
    },
    amber: {
        halo: 'from-amber-500/20 to-orange-500/20',
        icono: 'bg-amber-500/20 text-amber-300',
    },
    rose: {
        halo: 'from-rose-500/20 to-pink-500/20',
        icono: 'bg-rose-500/20 text-rose-300',
    },
};

const AdminStatCard = ({ titulo, valor, detalle, icono: Icono, acento = 'cyan' }) => {
    const estilo = acentos[acento] || acentos.cyan;

    return (
        <div className="relative group">
            <div className={`absolute inset-0 bg-gradient-to-r ${estilo.halo} blur-xl rounded-2xl`}></div>
            <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-slate-300 text-sm font-medium mb-2">{titulo}</p>
                        <p className="text-3xl font-bold text-white">{valor}</p>
                        {detalle && <p className="text-sm text-slate-400 mt-2">{detalle}</p>}
                    </div>
                    {Icono && (
                        <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${estilo.icono}`}>
                            <Icono className="h-6 w-6" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminStatCard;
