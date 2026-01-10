import React, { useEffect, useState } from 'react';
import { fetchAllReports, updateReportStatus, uploadResolutionImage } from '../services/adminService';
import { VerifyIssueResolved } from '../services/aiServices.js'; 
import MapView from '../components/MapView'; 
import exifr from 'exifr';

const AdminDashboard = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    // Verification Modal State
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [selectedReportId, setSelectedReportId] = useState(null);
    const [selectedReportLocation, setSelectedReportLocation] = useState(null);
    const [verifyFile, setVerifyFile] = useState(null);
    const [verifying, setVerifying] = useState(false);
    const [verifyStatus, setVerifyStatus] = useState(""); 
    const [verifyError, setVerifyError] = useState("");

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        try {
            const data = await fetchAllReports();
            const sortedData = data.sort((a, b) => {
                if (b.severity !== a.severity) return b.severity - a.severity;
                return new Date(b.created_at) - new Date(a.created_at);
            });
            setReports(sortedData);
        } catch (e) {
            console.error("Failed to load reports:", e);
        } finally {
            setLoading(false);
        }
    };

    // --- GPS DISTANCE LOGIC ---
    const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const handleStatusChange = async (id, newStatus) => {
        if (newStatus === 'Resolved') {
            const report = reports.find(r => r.id == id);
            try {
                const locObj = typeof report.location === 'string' 
                    ? JSON.parse(report.location) 
                    : report.location;
                setSelectedReportLocation(locObj);
                setSelectedReportId(id);
                setShowVerifyModal(true);
            } catch (e) {
                alert("Error: Report has invalid location data.");
            }
            return; 
        }
        updateLocalReportStatus(id, newStatus);
    };

    const updateLocalReportStatus = async (id, newStatus, resolvedDate = null, resolutionImage = null) => {
        setReports(prev => prev.map(r => r.id === id ? {
            ...r, 
            status: newStatus, 
            resolvedAt: resolvedDate, // Standardized key
            resolutionImage 
        } : r));

        await updateReportStatus(id, newStatus, resolvedDate, resolutionImage);
    };

    const handleVerifySubmit = async () => {
        if (!verifyFile) return setVerifyError("Please upload a photo.");
        setVerifying(true);
        setVerifyStatus("🛰️ Validating GPS Data...");

        try {
            const gps = await exifr.gps(verifyFile);
            if (!gps || !gps.latitude) {
                setVerifyError("❌ REJECTED: No GPS metadata found.");
                return;
            }

            const distance = getDistanceFromLatLonInMeters(
                gps.latitude, gps.longitude,
                selectedReportLocation.lat, selectedReportLocation.lng
            );

            if (distance > 300) { // Increased threshold to 300m
                setVerifyError(`❌ Mismatch: Photo taken ${distance.toFixed(0)}m away.`);
                return;
            }

            setVerifyStatus("🧠 AI Checking Repair...");
            const aiResult = await VerifyIssueResolved(verifyFile);

            if (aiResult?.isResolved) {
                const resolvedDate = new Date().toISOString();
                const resolutionImage = await uploadResolutionImage(verifyFile, selectedReportId);
                await updateLocalReportStatus(selectedReportId, 'Resolved', resolvedDate, resolutionImage);
                setShowVerifyModal(false);
                alert("✅ Success: Issue resolved and verified.");
            } else {
                setVerifyError(`❌ AI Rejected: ${aiResult?.feedback || "No repair detected."}`);
            }
        } catch (error) {
            setVerifyError("⚠️ Verification Service Error.");
        } finally {
            setVerifying(false);
            setVerifyStatus("");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return <span className="text-gray-400">-</span>;
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    if (loading) return <div className="p-10 text-center">🔄 Loading Admin Portal...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 pt-24"> {/* Added padding for Sticky Nav */}
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-800">🏛️ CivicLens Admin</h1>
                    <div className="bg-white px-4 py-2 rounded-lg shadow text-sm">Total: {reports.length}</div>
                </header>

                <div className="mb-8 bg-white p-4 rounded-xl shadow-md h-96">
                    <MapView reports={reports} />
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-800 text-white text-sm">
                            <tr>
                                <th className="p-4">Evidence</th>
                                <th className="p-4">Issue</th>
                                <th className="p-4">Reported</th>
                                <th className="p-4">Resolved</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report) => (
                                <tr key={report.id} className="border-b hover:bg-slate-50">
                                    <td className="p-4">
                                        <img src={report.imageUrl} className="w-16 h-16 rounded object-cover" alt="issue" />
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold">{report.issue}</div>
                                        <div className="text-xs text-slate-400">ID: {report.id}</div>
                                    </td>
                                    <td className="p-4 text-sm">{formatDate(report.created_at)}</td>
                                    <td className="p-4 text-sm">{formatDate(report.resolvedAt)}</td>
                                    <td className="p-4">
                                        <select 
                                            value={report.status}
                                            onChange={(e) => handleStatusChange(report.id, e.target.value)}
                                            className="p-1 rounded border font-bold text-sm"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Resolved">Resolved</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL OVERLAY */}
            {showVerifyModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000]">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full">
                        <h2 className="text-xl font-bold mb-4">📸 Verify Resolution</h2>
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => setVerifyFile(e.target.files[0])}
                            className="w-full mb-4"
                        />
                        {verifyStatus && <div className="text-blue-600 text-sm mb-2 animate-pulse">{verifyStatus}</div>}
                        {verifyError && <div className="text-red-600 text-sm mb-2">{verifyError}</div>}
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowVerifyModal(false)} className="px-4 py-2 text-slate-400">Cancel</button>
                            <button onClick={handleVerifySubmit} disabled={verifying} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Verify</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;