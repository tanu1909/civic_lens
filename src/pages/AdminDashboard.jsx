import React, { useEffect, useState } from 'react';
import { fetchAllReports, updateReportStatus, uploadResolutionImage } from '../services/adminService';
import { VerifyIssueResolved } from '../services/aiServices'; 
import MapView from '../components/MapView'; 
import exifr from 'exifr';

const AdminDashboard = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- VERIFICATION STATE ---
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
        const data = await fetchAllReports();
        // Sort by Severity first, then by Date (Newest first)
        const sortedData = data.sort((a, b) => {
            if (b.severity !== a.severity) return b.severity - a.severity;
            return new Date(b.created_at) - new Date(a.created_at);
        });
        setReports(sortedData);
        setLoading(false);
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
                setVerifyFile(null);
                setVerifyError("");
                setVerifyStatus("");
            } catch (e) {
                alert("Error: Report location invalid.");
            }
            return; 
        }
        updateLocalReportStatus(id, newStatus);
    };

    const updateLocalReportStatus = async (
        id,
        newStatus,
        resolvedDate = null,
        resolutionImage = null
    ) => {
        setReports(prev =>
            prev.map(r =>
                r.id === id
                    ? {
                        ...r,
                        status: newStatus,
                        timestamptz: resolvedDate,
                        resolutionImage
                    }
                    : r
            )
        );

        await updateReportStatus(
            id,
            newStatus,
            resolvedDate,
            resolutionImage
        );
    };

    // --- HELPER: GPS Math ---
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

    // --- VERIFY FUNCTION ---
    const handleVerifySubmit = async () => {
        if (!verifyFile) return setVerifyError("Please upload a photo.");

        setVerifying(true);
        setVerifyError("");
        setVerifyStatus("🛰️ Checking GPS Data...");

        try {
            // 1. EXTRACT GPS
            const gps = await exifr.gps(verifyFile);

            if (!gps || !gps.latitude || !gps.longitude) {
                setVerifying(false);
                setVerifyError("❌ REJECTED: Image has no GPS data. Please use an original camera photo.");
                return;
            }

            // 2. CHECK DISTANCE
            const distance = getDistanceFromLatLonInMeters(
                gps.latitude,
                gps.longitude,
                selectedReportLocation.lat,
                selectedReportLocation.lng
            );

            if (distance > 200) {
                setVerifying(false);
                setVerifyError(`❌ Location Mismatch! Photo taken ${distance.toFixed(0)}m away.`);
                return;
            }

            // 3. AI CONTENT CHECK
            setVerifyStatus("🧠 AI Analyzing Repair Quality...");
            const aiResult = await VerifyIssueResolved(verifyFile);

            if (aiResult && aiResult.isResolved) {
                const resolvedDate = new Date().toISOString();

                // 🔹 Upload verified image to Supabase Storage
                const resolutionImage = await uploadResolutionImage(
                    verifyFile,
                    selectedReportId
                );

                // 🔹 Update UI + Database with image + timestamp
                await updateLocalReportStatus(
                    selectedReportId,
                    'Resolved',
                    resolvedDate,
                    resolutionImage
                );
                setShowVerifyModal(false);
                alert("✅ Verified, image saved, timestamp recorded.");
            } else {
                setVerifyError(
                    `❌ AI Rejection: ${aiResult?.verificationNotes || "Image does not show a valid repair."}`
                );
            }
        } catch (error) {
            console.error("Verification Error", error);
            setVerifyError("⚠️ Verification Service Error. Please try again.");
        } finally {
            setVerifying(false);
            setVerifyStatus("");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return <span className="text-gray-400 font-normal">-</span>;
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) return <div className="p-10 text-center text-xl"> 🔄 Loading Government Portal...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6 relative">
             <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800"> 🏛️ CivicLens Admin Portal</h1>
                    <p className="text-slate-500">Government Dashboard for Issue Tracking</p>
                </div>
                <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-lg shadow text-sm font-semibold text-slate-700">
                    Total Reports: {reports.length}
                </div>
            </header>

            <div className="mb-8 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-md">
                <h2 className="text-xl font-bold mb-4 text-slate-700"> 📍 Live Incident Map</h2>
                <MapView reports={reports} />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800 text-white">
                                <th className="p-4">Evidence</th>
                                <th className="p-4">Issue Details</th>
                                <th className="p-4">Reported On</th>
                                <th className="p-4">Resolved On</th>
                                <th className="p-4">Resolution Proof</th>
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
                                    className={`border-b hover:bg-gray-50 transition-colors ${
                                        report.isSuspicious ? 'bg-red-50 border-l-4 border-red-500' : ''
                                    }`}
                                >
                                    {/* Evidence Image */}
                                    <td className="p-4">
                                        <a href={report.imageUrl} target="_blank" rel="noreferrer">
                                            <img
                                                src={report.imageUrl}
                                                alt="Evidence"
                                                className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform"
                                            />
                                        </a>
                                    </td>

                                    {/* Issue & Description */}
                                    <td className="p-4 max-w-xs">
                                        <p className="font-bold text-slate-800 text-lg">
                                            {report.issue || "Report Details"}
                                        </p>
                                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                                            {report.description}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-2">ID: {report.id}</p>
                                    </td>

                                    {/* Created Date */}
                                    <td className="p-4 text-sm text-slate-600 whitespace-nowrap">
                                        {formatDate(report.created_at || report.timestamp || report.createdAt)}
                                    
                                    {/* 🔥 FIXED: Now checking 'created_at' to match Supabase */}
                                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                        {formatDate(report.created_at || report.timestamp)}
                                    </td>

                                    {/* Resolved Date */}
                                    <td className="p-4 text-sm text-blue-600 font-bold whitespace-nowrap bg-blue-50/50">
                                        {report.status === 'Resolved' && report.timestamptz ? (
                                            formatDate(report.timestamptz)
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>

                                    {/* 🔥 MODIFIED: Resolution Image Column (Timestamp Removed) */}
                                    <td className="p-4">
                                        {report.resolutionImage ? (
                                            <div className="flex flex-col gap-1 items-center">
                                                <img
                                                    src={report.resolutionImage}
                                                    alt="Resolution"
                                                    className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform"
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </td>

                                    {/* Location */}
                                    <td className="p-4 text-sm text-slate-600 font-mono">
                                        {(() => {
                                            if (!report.location) return "Unknown";
                                            if (typeof report.location === 'string' && report.location.includes('{')) {
                                                try {
                                                    const parsedLoc = JSON.parse(report.location);
                                                    return parsedLoc.address
                                                        ? parsedLoc.address.substring(0, 20) + "..."
                                                        : "GPS Detected";
                                                } catch {
                                                    return "Invalid Data";
                                                }
                                            }
                                            return "Unknown";
                                        })()}
                                    </td>

                                    {/* Severity */}
                                    <td className="p-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                report.severity >= 8
                                                    ? 'bg-red-100 text-red-700'
                                                    : report.severity >= 5
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : 'bg-green-100 text-green-700'
                                            }`}
                                        >
                                            {report.severity}/10
                                        </span>
                                    </td>

                                    {/* Flagged / Verified */}
                                    <td className="p-4">
                                        {report.isSuspicious ? (
                                            <div className="flex items-center gap-2 text-red-600 bg-red-100 px-3 py-2 rounded-lg">
                                                <span>⚠️</span>
                                                <span className="text-xs font-bold">FLAGGED</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                                                <span>✅</span>
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
                                            ${
                                                report.status === 'Resolved'
                                                    ? 'border-green-500 text-green-700 bg-green-50'
                                                    : report.status === 'In Progress'
                                                    ? 'border-blue-500 text-blue-700 bg-blue-50'
                                                    : 'border-orange-400 text-orange-700 bg-orange-50'
                                            }`}
                                        >
                                            <option value="Pending">⏳ Pending</option>
                                            <option value="In Progress">🚧 In Progress</option>
                                            <option value="Resolved">✅ Resolved</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {reports.length === 0 && <div className="p-10 text-center text-slate-400">No reports found.</div>}
                </div>
            </div>

            {/* VERIFICATION MODAL */}
            {showVerifyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full animate-fade-in">
                        <h2 className="text-2xl font-bold mb-2 text-slate-800">📸 Verification Required</h2>
                        <p className="text-slate-600 mb-6">
                            System will verify <b>GPS Location</b> and use <b>AI</b> to confirm the repair.
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-bold mb-2 text-slate-700">Upload Evidence</label>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => setVerifyFile(e.target.files[0])}
                                className="w-full p-2 border border-slate-300 rounded-lg"
                            />
                        </div>

                        {verifyStatus && <div className="mb-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg font-semibold animate-pulse border border-blue-200">{verifyStatus}</div>}
                        {verifyError && <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg font-semibold border border-red-200">{verifyError}</div>}

                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setShowVerifyModal(false)}
                                className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg"
                                disabled={verifying}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleVerifySubmit}
                                disabled={verifying || !verifyFile}
                                className={`px-6 py-2 rounded-lg font-bold text-white transition-all
                                ${verifying ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg'}`}
                            >
                                {verifying ? 'Verifying...' : 'Verify & Resolve'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default AdminDashboard;