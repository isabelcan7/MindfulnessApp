const AdminPageHeader = ({ titulo, descripcion, icono: Icono, acciones = null }) => {
    return (
        <div className="mb-8">
            <div className="bg-gradient-to-r from-cyan-500/20 via-teal-500/20 to-emerald-500/20 p-[2px] rounded-2xl shadow-xl overflow-hidden backdrop-blur-xl">
                <div className="bg-white/10 backdrop-blur-xl p-6 md:p-8 rounded-2xl relative overflow-hidden border border-white/10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full -mt-10 -mr-10 z-0 hidden md:block"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            {Icono && (
                                <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/20 shrink-0">
                                    <Icono className="h-6 w-6 text-cyan-300" />
                                </div>
                            )}
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                                    {titulo}
                                </h1>
                                {descripcion && (
                                    <p className="mt-2 text-slate-300 max-w-2xl">{descripcion}</p>
                                )}
                            </div>
                        </div>
                        {acciones}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPageHeader;
