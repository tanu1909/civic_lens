import React, { useState, useRef } from 'react';
import { ImageAnalysis } from '../services/gemini';
import { uploadImageToStorage, saveReport } from '../services/reportService';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import { MapPin, Edit2, CheckCircle, RotateCcw, X } from 'lucide-react'; 

const CameraCapture = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null); 
    const isAnalysisActive = useRef(false); 

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

        isAnalysisActive.current = true;

        const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1280, useWebWorker: true };
        setLoadingText("Analyzing...");
        setLoading(true);
        setReport(null); 

        try {
            const compressedFile = await imageCompression(file, options);
            
            //  if user cancelled while compressing
            if (!isAnalysisActive.current) return;

            setImage(URL.createObjectURL(compressedFile));
            setImageFile(compressedFile);
            
            // AI Analysis
            const data = await ImageAnalysis(compressedFile);
            
            //IF USER CLICKED RETAKE ---
            if (!isAnalysisActive.current) {
                console.log("Analysis ignored because user clicked retake.");
                setLoading(false);
                return; 
            }
            // ------------------------------------------------

            if (!data || !data.issue || data.issue === "Unclear") {
                alert("⚠️ Image Unclear. Please try again.");
                handleRetake(); 
                return;
            }

            setReport(data);
            setManualSeverity(data.severity !== undefined ? data.severity : 5);
            detectLocation();

        } catch (error) {
            console.error(error);
            alert("Analysis Failed. Please try again.");
            handleRetake();
        }
        setLoading(false);
    };

    // --- HANDLE RETAKE (it RESETS EVERYTHING) ---
    const handleRetake = () => {
        
        isAnalysisActive.current = false;

        setImage(null);
        setImageFile(null);
        setReport(null);         
        setManualSeverity(0);
        setLocationMode('auto');
        setManualAddress("");
        setLoading(false);       
        
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // --- LOCATION FUNCTION ---
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
            { enableHighAccuracy: true, timeout:20000, maximumAge:0 }
        );
    };

    // --- HANDLE SUBMIT ---
    const handleSubmit = async () => {
        if (!auth.currentUser) return alert("Please Login!");
        
        if (manualSeverity < 4) return alert("Severity must be 4+ to report.");

        const aiScore = report?.severity || 0;
        const mismatch = Math.abs(aiScore - manualSeverity);
        
        if (mismatch > 4) {
             const confirmSubmit = window.confirm(
                `⚠️ SUSPICIOUS REPORT WARNING ⚠️\n\n🤖 AI Rated: ${aiScore}/10\n👤 You Rated: ${manualSeverity}/10\n\nThis huge difference flags your report as suspicious.\n\nDo you still want to submit?`
            );
            if (!confirmSubmit) return; 
        }

        if (locationMode === 'manual' && manualAddress.length < 3) {
            return alert("⚠️ Location Missing: Please type a valid location/landmark in the box.");
        }

        setIsSubmitting(true);
        setLoadingText("Submitting...");

        try {
            const imageUrl = await uploadImageToStorage(imageFile);
            
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
                isSuspicious: mismatch > 4 
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
                    
                    {/* Image Preview Area */}
                    <div className="relative w-full h-56 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group">
                        {image ? (
                            <>
                                <img src={image} className="w-full h-full object-cover" alt="Preview" />
                                
                                <button 
                                    onClick={handleRetake}
                                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md transition-all flex items-center gap-1 shadow-md z-20 border border-white/20"
                                >
                                    <RotateCcw size={12} /> Retake
                                </button>
                            </>
                        ) : (
                            <label className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-gray-50 transition active:scale-95">
                                <span className="text-4xl mb-2">📷</span>
                                <span className="text-sm text-gray-500 font-medium">Tap to Snap Photo</span>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleUpload} 
                                    ref={fileInputRef} 
                                />
                            </label>
                        )}
                        
                        {loading && (
                            <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-30">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
                                <p className="text-blue-600 font-bold mt-3 text-sm animate-pulse">{loadingText}</p>
                            </div>
                        )}
                    </div>

                    {/* ONLY  IF REPORT EXISTS */}
                    {report && (
                        <div className="animate-fade-in space-y-6">
                            
                            {/* AI Findings */}
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-gray-900">{report.issue}</h3>
                                    <span className="bg-blue-200 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border border-blue-200">
                                        AI Detected
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{report.description}</p>
                            </div>

                            {/* SEVERITY SLIDER */}
                            <div className="pb-2">
                                <div className="flex justify-between items-end mb-2">
                                    <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Severity Level</label>
                                    <div className="text-right">
                                        <span className="text-[10px] text-gray-400 block mb-0.5">AI Recommended</span>
                                        <div className="flex items-center justify-end gap-1">
                                            <span className="text-blue-600 font-bold text-xl">{report.severity}</span>
                                            <span className="text-gray-400 text-sm">/10</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="relative h-8 flex items-center">
                                    <input 
                                        type="range" min="1" max="10" 
                                        value={manualSeverity} 
                                        onChange={(e) => setManualSeverity(parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg accent-blue-600 cursor-pointer z-10 relative"
                                    />
                                    <div 
                                        className="absolute top-0 w-0.5 h-full bg-blue-400/50 z-0 pointer-events-none"
                                        style={{ left: `${(report.severity - 1) * 11}%` }} 
                                    >
                                        <span className="absolute -top-5 -left-1.5 text-xs animate-bounce">🤖</span>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between mt-1">
                                    <span className="text-[10px] text-gray-400 font-medium">Low Priority</span>
                                    <span className={`text-xs font-bold ${manualSeverity > 7 ? "text-red-500" : "text-blue-600"}`}>
                                        Your Rating: {manualSeverity}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-medium">High Priority</span>
                                </div>
                            </div>

                            {/* LOCATION BAR */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Location</label>
                                
                                {locationMode === 'detecting' && (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-500 animate-pulse">
                                        <MapPin size={18} />
                                        <span className="text-sm font-medium">Acquiring GPS...</span>
                                    </div>
                                )}

                                {locationMode === 'success' && (
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 shadow-sm">
                                        <div className="flex items-center gap-3 text-green-700">
                                            <div className="bg-green-100 p-1.5 rounded-full">
                                                <CheckCircle size={16} />
                                            </div>
                                            <span className="text-sm font-bold">GPS Locked</span>
                                        </div>
                                        <button 
                                            onClick={() => setLocationMode('manual')}
                                            className="text-xs text-gray-500 hover:text-blue-600 underline flex items-center gap-1 font-medium"
                                        >
                                            <Edit2 size={12} /> Change
                                        </button>
                                    </div>
                                )}

                                {locationMode === 'manual' && (
                                    <div className="relative animate-fade-in">
                                        <MapPin size={18} className="absolute left-3 top-3.5 text-red-500" />
                                        <input 
                                            type="text"
                                            value={manualAddress}
                                            onChange={(e) => setManualAddress(e.target.value)}
                                            placeholder="Enter location (e.g. Civil Lines, Market)"
                                            className="w-full pl-10 pr-4 py-3 bg-red-50 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:bg-white outline-none text-sm shadow-sm transition-all"
                                            autoFocus
                                        />
                                        <p className="text-[10px] text-red-500 mt-1.5 ml-1 font-medium flex items-center gap-1">
                                            <span className="w-1 h-1 rounded-full bg-red-500 inline-block"></span> 
                                            GPS failed. Please enter manually.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                {report && (
                    <div className="p-4 border-t border-gray-100 bg-white shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                                ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-95'}
                            `}
                        >
                            {isSubmitting ? 'Sending Report...' : '🚀 Submit Report'}
                        </button>
                    </div>
                )}
            </div>

            {/* Success Toast */}
            {showToast && (
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-fade-in-up z-[60]">
                    <div className="bg-green-500 rounded-full p-1">
                        <CheckCircle size={16} className="text-white" />
                    </div>
                    <span className="font-medium">Report Submitted Successfully!</span>
                </div>
            )}
        </div>
    );
};

export default CameraCapture;