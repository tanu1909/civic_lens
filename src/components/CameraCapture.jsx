import React, { useState } from 'react';
import { ImageAnalysis } from '../services/gemini';
import { uploadImageToStorage, saveReport } from '../services/reportService';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import { MapPin, Edit2, CheckCircle, AlertTriangle, X } from 'lucide-react'; 

const CameraCapture = () => {
    const navigate = useNavigate();

    // --- STATES ---
    const [image, setImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [report, setReport] = useState(null);
    const [manualSeverity, setManualSeverity] = useState(0);
    
    // UI States
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);
    
    // LOCATION STATES
    const [locationMode, setLocationMode] = useState('auto'); 
    const [manualAddress, setManualAddress] = useState("");

    // --- HANDLE IMAGE UPLOAD ---
    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1280, useWebWorker: true };
        setLoadingText("Analyzing...");
        setLoading(true);

        try {
            const compressedFile = await imageCompression(file, options);
            setImage(URL.createObjectURL(compressedFile));
            setImageFile(compressedFile);
            
            // AI Analysis
            const data = await ImageAnalysis(compressedFile);
            if (!data || !data.issue || data.issue === "Unclear") {
                alert("⚠️ Image Unclear. Please try again.");
                setLoading(false);
                return;
            }
            setReport(data);
            setManualSeverity(data.severity || 5);
            
            // STARTING GPS DETECTION IMMEDIATELY
            detectLocation();

        } catch (error) {
            console.error(error);
            alert("Analysis Failed.");
        }
        setLoading(false);
    };

    // --- ISOLATED LOCATION FUNCTION ---
    const detectLocation = () => {
        if (!("geolocation" in navigator)) {
            setLocationMode('manual');
            return;
        }
        setLocationMode('detecting');
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocationMode('success');
            },
            (error) => {
                console.warn("GPS Fail:", error);
                setLocationMode('manual'); 
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    };

    // --- HANDLE SUBMIT ---
    const handleSubmit = async () => {
        if (!auth.currentUser) return alert("Please Login!");
        
        // 1. SEVERITY CHECKS (Do this FIRST)
        if (manualSeverity < 4) return alert("Severity must be 4+ to report.");

        const aiScore = report?.severity || 0;
        const mismatch = Math.abs(aiScore - manualSeverity);
        
        // 2. SUSPICIOUS CHECK (The Alert you wanted)
        if (mismatch > 4) {
             const confirmSubmit = window.confirm(
                `⚠️ SUSPICIOUS REPORT WARNING ⚠️\n\n AI Rated: ${aiScore}/10\n You Rated: ${manualSeverity}/10\n\nThis large difference flags your report as suspicious. Admins will review it manually.\n\nDo you still want to submit?`
            );
            if (!confirmSubmit) return; // Stop if user cancels
        }

        // 3. LOCATION VALIDATION (Do this LAST)
        if (locationMode === 'manual' && manualAddress.length < 3) {
            return alert("⚠️ Location Missing: Please type a valid location/landmark in the box.");
        }

        setIsSubmitting(true);
        setLoadingText("Submitting...");

        try {
            const imageUrl = await uploadImageToStorage(imageFile);
            
            // Get Final Location Data
            let finalLocation = null;
            if (locationMode === 'manual') {
                finalLocation = { lat: 0, lng: 0, address: manualAddress };
            } else {
                 const position = await new Promise((resolve, reject) => 
                    navigator.geolocation.getCurrentPosition(resolve, reject)
                 );
                 finalLocation = { lat: position.coords.latitude, lng: position.coords.longitude, address: "GPS Detected" };
            }

            await saveReport({
                userId: auth.currentUser.uid,
                imageUrl,
                issue: report.issue,
                description: report.description,
                severity: manualSeverity,
                location: finalLocation,
                status: 'Pending',
                isSuspicious: mismatch > 4 // Mark it in DB too
            });

            setShowToast(true);
            setTimeout(() => navigate('/history'), 2000);

        } catch (e) {
            alert("Error: " + e.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6">
            
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in-up">
                
                {/* HEADER */}
                <div className="bg-blue-600 p-4 flex justify-between items-center shrink-0">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        📸 New Report
                    </h2>
                    <button onClick={() => navigate('/')} className="bg-white/20 p-2 rounded-full hover:bg-white/30 text-white transition">
                        <X size={18} />
                    </button>
                </div>

                {/* SCROLLABLE BODY */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                    
                    {/* Image Preview */}
                    <div className="relative w-full h-56 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group">
                        {image ? (
                            <img src={image} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                            <label className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-gray-50 transition">
                                <span className="text-4xl mb-2">📷</span>
                                <span className="text-sm text-gray-500 font-medium">Tap to Snap Photo</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                            </label>
                        )}
                        {loading && (
                            <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
                                <p className="text-blue-600 font-bold mt-3 text-sm animate-pulse">{loadingText}</p>
                            </div>
                        )}
                    </div>

                    {report && (
                        <>
                            {/* AI Findings */}
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-gray-900">{report.issue}</h3>
                                    <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-md font-bold uppercase">
                                        AI Detected
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{report.description}</p>
                            </div>

                            {/* SEVERITY SLIDER (Improved Visibility) */}
                            <div className="pb-2">
                                <div className="flex justify-between items-end mb-2">
                                    <label className="text-xs font-bold uppercase text-gray-500">Severity Level</label>
                                    
                                    {/* VISIBLE AI SCORE BADGE */}
                                    <div className="text-right">
                                        <span className="text-[10px] text-gray-500 block">AI Recommended</span>
                                        <span className="text-blue-600 font-bold text-lg">{report.severity}/10</span>
                                    </div>
                                </div>
                                
                                <div className="relative h-6 flex items-center">
                                    <input 
                                        type="range" min="1" max="10" 
                                        value={manualSeverity} 
                                        onChange={(e) => setManualSeverity(parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg accent-blue-600 cursor-pointer z-10 relative"
                                    />
                                    {/* AI Marker on the slider track (Visual Guide) */}
                                    <div 
                                        className="absolute top-[-5px] w-1 h-2 bg-blue-400 z-0"
                                        style={{ left: `${(report.severity - 1) * 11}%` }} 
                                        title="AI Suggestion"
                                    >
                                        <span className="absolute -top-4 -left-1 text-[10px] text-blue-400">🤖</span>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between mt-1">
                                    <span className="text-xs text-gray-400">Low Priority</span>
                                    <span className={`font-bold ${manualSeverity > 7 ? "text-red-500" : "text-blue-600"}`}>
                                        Your Rating: {manualSeverity}
                                    </span>
                                    <span className="text-xs text-gray-400">High Priority</span>
                                </div>
                            </div>

                            {/* Location Bar */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Location</label>
                                
                                {locationMode === 'detecting' && (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-500 animate-pulse">
                                        <MapPin size={18} />
                                        <span className="text-sm font-medium">Acquiring GPS...</span>
                                    </div>
                                )}

                                {locationMode === 'success' && (
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div className="flex items-center gap-3 text-green-700">
                                            <CheckCircle size={18} />
                                            <span className="text-sm font-bold">GPS Locked</span>
                                        </div>
                                        <button 
                                            onClick={() => setLocationMode('manual')}
                                            className="text-xs text-gray-500 hover:text-blue-600 underline flex items-center gap-1"
                                        >
                                            <Edit2 size={12} /> Edit
                                        </button>
                                    </div>
                                )}

                                {locationMode === 'manual' && (
                                    <div className="relative animate-fade-in">
                                        <MapPin size={18} className="absolute left-3 top-3.5 text-red-400" />
                                        <input 
                                            type="text"
                                            value={manualAddress}
                                            onChange={(e) => setManualAddress(e.target.value)}
                                            placeholder="Enter location (e.g. Civil Lines, Market)"
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm shadow-sm"
                                            autoFocus
                                        />
                                        <p className="text-[10px] text-red-400 mt-1 ml-1">* GPS failed. Please type location.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* FOOTER */}
                {report && (
                    <div className="p-4 border-t border-gray-100 bg-white shrink-0">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                                ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.02]'}
                            `}
                        >
                            {isSubmitting ? 'Sending...' : '🚀 Submit Report'}
                        </button>
                    </div>
                )}
            </div>

            {/* Success Toast */}
            {showToast && (
                <div className="absolute top-10 bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-bounce z-50">
                    <CheckCircle size={20} /> Report Submitted!
                </div>
            )}
        </div>
    );
};

export default CameraCapture;