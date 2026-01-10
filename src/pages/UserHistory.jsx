import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { auth } from '../services/firebase';
import ReportCard from '../components/ReportCard';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Plus, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const UserHistory = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All'); 
    
    
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const { data, error } = await supabase
                        .from('reports') 
                        .select('*')
                        .eq('userId', user.uid) 
                        .order('created_at', { ascending: false });

                    if (!error) setReports(data || []);
                } catch (error) {
                    console.error("Fetch error:", error);
                }
            }
            setLoading(false); 
        });
        return () => unsubscribe();
    }, []);

    // --- NEW: Helper Function to Count Reports ---
    const getCount = (status) => {
        if (status === 'All') return reports.length;
        return reports.filter(r => (r.status || 'Pending').toLowerCase() === status.toLowerCase()).length;
    };
    // ---------------------------------------------

    const filteredReports = filter === 'All' 
        ? reports 
        : reports.filter(r => (r.status || 'Pending').toLowerCase() === filter.toLowerCase());

    const handleDelete = async (reportId) => {
        if (!window.confirm("Are you sure you want to delete this report?")) return;

        const reportToDelete = reports.find(r => r.id === reportId);
        
        // Optimistic Update
        const previousReports = [...reports];
        setReports(reports.filter(r => r.id !== reportId));

        try {
            
            if (reportToDelete && reportToDelete.imageUrl) {
                const fileName = reportToDelete.imageUrl.split('/').pop();
                const { error: storageError } = await supabase.storage
                    .from('images') 
                    .remove([fileName]);
                
                if (storageError) console.warn("Image delete warning:", storageError);
            }

            
            const { error } = await supabase
                .from('reports')
                .delete()
                .eq('id', reportId);

            if (error) throw error;

        
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);

        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete. Please check connection.");
            setReports(previousReports);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <LayoutDashboard className="text-blue-600" />
                                Citizen Dashboard
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">Track your contributions.</p>
                        </div>
                        
                        <Link to="/scan" className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md active:scale-95">
                            <Plus size={18} />
                            New Report
                        </Link>
                    </div>

                    {/* Filter Buttons with COUNTS */}
                    {!loading && reports.length > 0 && (
                        <div className="flex gap-4 mt-6 overflow-x-auto pb-2">
                            <button onClick={() => setFilter('All')} className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${filter === 'All' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600'}`}>
                                All Reports ({getCount('All')})
                            </button>
                            
                            <button onClick={() => setFilter('Pending')} className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${filter === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-white text-gray-600'}`}>
                                Pending ({getCount('Pending')}) ⏳
                            </button>
                            
                            <button onClick={() => setFilter('In Progress')} className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${filter === 'In Progress' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-white text-gray-600 hover:bg-blue-50'}`}>
                                In Progress ({getCount('In Progress')}) 🚧
                            </button>                             
                            
                            <button onClick={() => setFilter('Resolved')} className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${filter === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-white text-gray-600'}`}>
                                Resolved ({getCount('Resolved')}) ✅
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-500 text-sm">Loading...</p>
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                        <Filter size={32} className="text-blue-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900">No reports found</h3>
                        {filter === 'All' && (
                            <Link to="/scan" className="text-blue-600 font-semibold hover:underline mt-2 block">
                                Start Scanning Now →
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredReports.map((report) => (
                            <ReportCard key={report.id} report={report} onDelete={() => handleDelete(report.id)} />
                        ))}
                    </div>
                )}
            </div>

            {/* Success Toast */}
{showToast && (
    // CHANGED z-50 to z-[9999]
    <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce-up z-[9999]">
        <div className="bg-red-500 rounded-full p-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
        </div>
        <span className="font-medium">Report Deleted Successfully</span>
    </div>
)}
        </div>
    );
};

export default UserHistory;