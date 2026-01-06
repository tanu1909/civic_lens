import React, { useEffect, useState } from 'react';
import { fetchAllReports, updateReportStatus } from '../services/adminService';
import MapView from '../components/MapView'; 

const AdminDashboard = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        try {
            const data = await fetchAllReports();
            // Sort reports: High Severity first
            const sortedData = (data || []).sort((a, b) => (b.severity || 0) - (a.severity || 0));
            setReports(sortedData);
        } catch (e) {
            console.error("Failed to load reports", e);
        } finally {
            setLoading(false);
        }
    };

    // --- 🛡️ SAFETY SHIELD: Prevents White Screen Crash ---
    const renderLocationSafe = (locationData) => {
        try {
            if (!locationData) return "Unknown Location";
            let parsed = locationData;
            
            if (typeof locationData === 'string') {
                if (!locationData.includes('{')) return "GPS Detected"; 
                parsed = JSON.parse(locationData);
            }

            if (parsed && parsed.address) {
                return parsed.address.length > 20 
                    ? parsed.address.substring(0, 20) + "..." 
                    : parsed.address;
            }

            if (parsed && parsed.lat) {
                return `GPS: ${parsed.lat.toFixed(4)}, ${parsed.lng.toFixed(4)}`;
            }
            return "Location Data Missing";
        } catch (error) {
            return "Data Error"; 
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        updateLocalReportStatus(id, newStatus);
    };

    const updateLocalReportStatus = async (id, newStatus) => {
        const now = new Date().toISOString(); 
        
        setReports(prevReports => prevReports.map(r => {
            if (r.id == id) {
                let updatedResolvedAt = r.resolvedAt; 
                
                if (newStatus === 'Resolved') {
                    updatedResolvedAt = now;
                } else if (r.status === 'Resolved' && newStatus !== 'Resolved') {
                    updatedResolvedAt = null;
                }
                
                return { ...r, status: newStatus, resolvedAt: updatedResolvedAt };
            }
            return r;
        }));
        
        await updateReportStatus(id, newStatus, now);
    };

    // 🔥 DATE FORMATTER
    const formatDate = (dateString) => {
        if (!dateString) return <span className="text-gray-400 font-normal">-</span>;
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return <span className="text-red-400">Invalid Date</span>;

            return (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-700">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-xs text-slate-500">
                        {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </span>
                </div>
            );
        } catch (e) {
            return "-";
        }
    };

    if (loading) return <div className="p-10 text-center text-xl"> 🔄 Loading Government Portal...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6 relative">
             <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800"> 🏛️ CivicLens Admin Portal</h1>
                    <p className="text-slate-500">Government Dashboard for Issue Tracking</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow text-sm font-semibold text-slate-700">
                    Total Reports: {reports.length}
                </div>
            </header>

            <div className="mb-8 bg-white p-4 rounded-xl shadow-md">
                <h2 className="text-xl font-bold mb-4 text-slate-700"> 📍 Live Incident Map</h2>
                <MapView reports={reports} />
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800 text-white">
                                <th className="p-4">Evidence</th>
                                <th className="p-4">Issue Details</th>
                                <th className="p-4">Reported On</th>
                                <th className="p-4">Resolved On</th>
                                <th className="p-4">Location</th>
                                <th className="p-4">Severity</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report) => (
                                <tr key={report.id} className={`border-b hover:bg-gray-50 transition-colors ${report.isSuspicious ? 'bg-red-50 border-l-4 border-red-500' : ''}`}>
                                    <td className="p-4">
                                        <a href={report.imageUrl} target="_blank" rel="noreferrer">
                                            <img src={report.imageUrl} alt="Evidence" className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform" />
                                        </a>
                                    </td>
                                    <td className="p-4 max-w-xs">
                                        <p className="font-bold text-slate-800 text-lg">{report.issue || "Report Details"}</p>
                                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{report.description}</p>
                                        <p className="text-xs text-slate-400 mt-2">ID: {report.id}</p>
                                    </td>
                                    
                                    {/* 🔥 FIXED: Now checking 'created_at' to match Supabase */}
                                    <td className="p-4 text-sm text-slate-600 whitespace-nowrap">
                                        {formatDate(report.created_at || report.timestamp)}
                                    </td>
                                    
                                    <td className="p-4 text-sm whitespace-nowrap bg-blue-50/30 border-l border-blue-100">
                                        {report.resolvedAt ? formatDate(report.resolvedAt) : <span className="text-gray-400">-</span>}
                                    </td>

                                    <td className="p-4 text-sm text-slate-600 font-mono">
                                        {renderLocationSafe(report.location)}
                                    </td>

                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${report.severity >= 8 ? 'bg-red-100 text-red-700' : report.severity >= 5 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                            {report.severity}/10
                                        </span>
                                    </td>
                                    
                                    <td className="p-4">
                                        <select
                                            value={report.status}
                                            onChange={(e) => handleStatusChange(report.id, e.target.value)}
                                            className={`w-full p-2 rounded-lg border-2 font-bold text-sm cursor-pointer outline-none focus:ring-2 focus:ring-blue-400
                                            ${report.status === 'Resolved' ? 'border-green-500 text-green-700 bg-green-50' :
                                                    report.status === 'In Progress' ? 'border-blue-500 text-blue-700 bg-blue-50' :
                                                        'border-orange-400 text-orange-700 bg-orange-50'}`}
                                        >
                                            <option value="Pending"> ⏳ Pending</option>
                                            <option value="In Progress"> 🚧 In Progress</option>
                                            <option value="Resolved"> ✅ Resolved</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {reports.length === 0 && <div className="p-10 text-center text-slate-400">No reports found.</div>}
                </div>
            </div>
        </div>
    );
};
export default AdminDashboard;