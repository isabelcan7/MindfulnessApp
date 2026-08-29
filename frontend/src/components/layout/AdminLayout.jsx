import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
            <AdminSidebar />
            <main className="flex-1 ml-0 md:ml-64 px-4 py-6 md:px-8 md:py-8">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
