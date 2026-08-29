import { Link, useLocation } from 'react-router-dom';
import { LogOut, ShieldCheck, LayoutDashboard, Users, GraduationCap, FileText, ClipboardList, UserCog, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const enlaces = [
    { to: '/admin', label: 'Resumen', icon: LayoutDashboard, exact: true },
    { to: '/admin/investigadores', label: 'Investigadores', icon: GraduationCap },
    { to: '/admin/participantes', label: 'Participantes', icon: Users },
    { to: '/admin/programas', label: 'Programas', icon: FileText },
    { to: '/admin/inscripciones', label: 'Inscripciones', icon: ClipboardList },
    { to: '/admin/usuarios', label: 'Todos los usuarios', icon: UserCog },
];

const AdminSidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const getNavClass = (enlace) => {
        const isActive = enlace.exact
            ? location.pathname === enlace.to
            : location.pathname.startsWith(enlace.to);
        return `group relative flex items-center space-x-3 w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
            ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/20'
            : 'text-cyan-100/70 hover:text-white hover:bg-white/10 hover:backdrop-blur-sm'
            }`;
    };

    const SidebarContent = () => (
        <>
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-500 shadow-lg">
                        <ShieldCheck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Mindfluence</h2>
                        <p className="text-sm font-semibold text-cyan-200">Administración</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {enlaces.map((enlace) => {
                    const Icono = enlace.icon;
                    return (
                        <Link
                            key={enlace.to}
                            to={enlace.to}
                            className={getNavClass(enlace)}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <Icono size={20} />
                            <span>{enlace.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/10 space-y-2">
                {user && (
                    <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-sm font-semibold text-white truncate">{user.nombre} {user.apellidos}</p>
                        <p className="text-xs text-cyan-200/80 truncate">{user.email}</p>
                    </div>
                )}

                <button
                    onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-sm font-medium text-rose-300 hover:text-white hover:bg-rose-500/20 rounded-xl transition-all duration-200"
                >
                    <LogOut size={20} />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </>
    );

    return (
        <>
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden fixed top-4 left-4 z-50 flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full text-white shadow-lg border border-white/20"
            >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 shadow-2xl transition-transform duration-300 z-40 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:translate-x-0 flex flex-col`}
            >
                <SidebarContent />
            </aside>
        </>
    );
};

export default AdminSidebar;
