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
        const data = await fetchAllReports();
        setReports(data);
        setLoading(false);
    };

    const handleStatusChange = async (id, newStatus) => {
        setReports(reports.map(r => r.id === id ? { ...r, status: newStatus } : r));
        await updateReportStatus(id, newStatus);
    };

    if (loading) return <div className="p-10 text-center text-xl"> 🔄 Loading Government Portal...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800"> 🏛️ CivicLens Admin Portal</h1>
                    <p className="text-slate-500">Government Dashboard for Issue Tracking</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow text-sm font-semibold text-slate-700">
                    Total Reports: {reports.length}
                </div>
            </header>

            {/*  MAP SECTION (Member 2's Work)  */}
            <div className="mb-8 bg-white p-4 rounded-xl shadow-md">
                <h2 className="text-xl font-bold mb-4 text-slate-700"> 📍 Live Incident Map</h2>
                {/* We pass the reports data to the map */}
                <MapView reports={reports} />
            </div>

            {/* --- REPORTS TABLE SECTION --- */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800 text-white">
                                <th className="p-4">Evidence</th>
                                <th className="p-4">Issue Details</th>
                                <th className="p-4">Location</th>
                                <th className="p-4">Severity</th>
                                <th className="p-4">AI Verification</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report) => (
                                <tr
                                    key={report.id}
                                    className={`border-b hover:bg-gray-50 transition-colors
                                    ${report.isSuspicious ? 'bg-red-50 border-l-4 border-red-500' : ''}
                                    `}
                                >
                                    {/* Image */}
                                    <td className="p-4">
                                        <a href={report.imageUrl} target="_blank" rel="noreferrer">
                                            <img
                                                src={report.imageUrl}
                                                alt="Evidence"
                                                className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform"
                                            />
                                        </a>
                                    </td>

                                    {/* Details */}
                                    <td className="p-4 max-w-xs">
                                        <p className="font-bold text-slate-800 text-lg">{report.issue || "Report Details"}</p>
                                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{report.description}</p>
                                        <p className="text-xs text-slate-400 mt-2">ID: {report.id}</p>
                                    </td>

                                    {/* Location */}
                                    <td className="p-4 text-sm text-slate-600 font-mono">
                                        {report.location ? report.location : "Unknown"}
                                    </td>

                                    {/* Severity Badge */}
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold
                                        ${report.severity >= 8 ? 'bg-red-100 text-red-700' :
                                                report.severity >= 5 ? 'bg-orange-100 text-orange-700' :
                                                    'bg-green-100 text-green-700'}`}>
                                            {report.severity}/10
                                        </span>
                                    </td>

                                    {/* AI Suspicious Flag */}
                                    <td className="p-4">
                                        {report.isSuspicious ? (
                                            <div className="flex items-center gap-2 text-red-600 bg-red-100 px-3 py-2 rounded-lg">
                                                <span> ⚠️ </span>
                                                <div className="text-xs font-bold">
                                                    FLAGGED<br />
                                                    <span className="font-normal opacity-75">Spam Check Failed</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                                                <span> ✅ </span>
                                                <span className="text-xs font-bold">Verified</span>
                                            </div>
                                        )}
                                    </td>

                                    {/* Status Dropdown */}
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

                    {reports.length === 0 && (
                        <div className="p-10 text-center text-slate-400">
                            No reports found. Good job! 🎉
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default AdminDashboard;