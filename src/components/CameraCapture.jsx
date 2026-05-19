import React, { useState, useRef } from 'react';
import { supabase } from '../supabaseClient'; 
import { uploadImageToStorage, saveReport } from '../services/reportService';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import { CheckCircle, RotateCcw, X } from 'lucide-react'; 

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
    const [isSuspicious, setIsSuspicious] = useState(false);
    
    // LOCATION STATES
    const [locationMode, setLocationMode] = useState('auto'); 
    const [manualAddress, setManualAddress] = useState("");

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    // --- HANDLE IMAGE UPLOAD & ANALYSIS ---
    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        isAnalysisActive.current = true;
        setLoadingText("Optimizing...");
        setLoading(true);
        setReport(null); 

        try {
            const options = { maxSizeMB: 0.1, maxWidthOrHeight: 800, useWebWorker: true };
            const compressedFile = await imageCompression(file, options);
            const fileType = compressedFile.type;
            if (!isAnalysisActive.current) return;

            setImage(URL.createObjectURL(compressedFile));
            setImageFile(compressedFile);
            
            setLoadingText("AI Analysis...");
            const base64Data = await fileToBase64(compressedFile);

            const { data, error } = await supabase.functions.invoke('analyze-image', {
                body: { imageBase64: base64Data, mimeType: fileType }
            });

            if (error) throw new Error(error.message);

            const rawText = data.analysis;
            const cleanJson = rawText.replace(/```json|```/g, "").trim();
            const aiResult = JSON.parse(cleanJson);

            if (!isAnalysisActive.current) return;

            if (aiResult.issue === "Image Unclear") {
                alert("⚠️ Image Unclear. Please try again with better lighting.");
                handleRetake();
                return;
            }

            setReport(aiResult);
            setManualSeverity(aiResult.severity || 0);
            detectLocation();

        } catch (error) {
            console.error("Analysis Error:", error);
            alert("Analysis Failed: " + error.message);
            handleRetake();
        } finally {
            loading && setLoading(false);
        }
    };

    const handleRetake = () => {
        isAnalysisActive.current = false;
        setImage(null);
        setImageFile(null);
        setReport(null);         
        setManualSeverity(0);
        setLocationMode('auto');
        setManualAddress("");
        setLoading(false);       
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const detectLocation = () => {
        if (!("geolocation" in navigator)) {
            setLocationMode('manual');
            return;
        }
        setLocationMode('detecting');
        navigator.geolocation.getCurrentPosition(
            () => setLocationMode('success'),
            () => setLocationMode('manual'),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleSubmit = async () => {
        if (!auth.currentUser) return alert("Please Login!");
        
        // Block submission if severity is 0 (Non-Civic / Technical Data Plot)
        if (manualSeverity === 0) {
            return alert("⚠️ Submission Denied: This image does not contain a valid public infrastructure hazard.");
        }
        if (manualSeverity < 4) return alert("Severity must be 4+ to report.");
         
        if( Math.abs((report.severity || 0) - manualSeverity) > 4){
            setIsSuspicious(true);
            return alert("⚠️ Submission Denied: This report is found suspicious.");
            navigate('/home');
        }


        setIsSubmitting(true);
        setLoadingText("Submitting...");

        try {
            const imageUrl = await uploadImageToStorage(imageFile);
            
            let finalLocationString = manualAddress || "Manual Location";
            if (locationMode === 'success') {
                 const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
                 finalLocationString = `Lat: ${pos.coords.latitude}, Lng: ${pos.coords.longitude}`;
            }

            // Exactly matching existing database table schema names
            const { error: dbError } = await supabase
                .from('reports')
                .insert([
                    {
                        userId: auth.currentUser.uid,
                        imageUrl: imageUrl,
                        issue: report.issue,
                        description: report.description,
                        severity: manualSeverity,
                        location: finalLocationString,
                        status: 'pending',
                        aiAnalysis: JSON.stringify(report),
                        isSuspicious: Math.abs((report.severity || 0) - manualSeverity) > 4,
                        isSafetyHazard: manualSeverity >= 8,
                        votes: 0
                    }
                ]);

            if (dbError) throw dbError;

            alert("🚀 Report submitted successfully!");
            navigate('/history');

        } catch (e) {
            alert("Submission Error: " + e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        // z-[9999] layer shifts modal overlay over standard application layouts
        <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
            
            {/* Clamped height card bounds container with unified flex wrapper */}
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl flex flex-col my-auto max-h-[85vh] overflow-hidden">
                
                {/* Header Context Bar */}
                <div className="bg-blue-600 p-4 flex justify-between items-center shrink-0">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">📸 New Civic Report</h2>
                    <button onClick={() => navigate('/')} className="text-white hover:opacity-70 transition-opacity p-1">
                        <X size={20} />
                    </button>
                </div>

                {/* Content Track Container */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    <div className="relative w-full h-56 bg-gray-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 shrink-0">
                        {image ? (
                            <>
                                <img src={image} className="w-full h-full object-cover" alt="Preview" />
                                <button onClick={handleRetake} className="absolute top-2 right-2 bg-black/60 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                                    <RotateCcw size={12} /> Retake
                                </button>
                            </>
                        ) : (
                            <label className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 conversion-colors">
                                <span className="text-4xl mb-2">📷</span>
                                <span className="text-sm text-gray-500 font-medium">Click to capture issue</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} ref={fileInputRef} />
                            </label>
                        )}
                        
                        {loading && (
                            <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex flex-col items-center justify-center z-30">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
                                <p className="text-blue-600 font-bold mt-3 text-sm">{loadingText}</p>
                            </div>
                        )}
                    </div>

                    {report && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 dark:bg-slate-800 p-4 rounded-xl border border-blue-100 dark:border-slate-700">
                                <h3 className="font-bold text-gray-900 dark:text-white">{report.issue}</h3>
                                <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">{report.description}</p>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Severity: {manualSeverity}/10</label>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="10" 
                                    value={manualSeverity} 
                                    onChange={(e) => setManualSeverity(parseInt(e.target.value))} 
                                    className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg accent-blue-600 mt-2" 
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Location Status</label>
                                {locationMode === 'success' ? (
                                    <div className="p-3 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-bold flex items-center gap-2">
                                        <CheckCircle size={16} /> GPS Location Verified
                                    </div>
                                ) : (
                                    <input type="text" value={manualAddress} onChange={(e) => setManualAddress(e.target.value)} placeholder="Type location address..." className="w-full p-3 bg-red-50 dark:bg-slate-800 border border-red-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white" />
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Submit Action Block */}
                {report && (
                    <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                        <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg disabled:bg-gray-400 dark:disabled:bg-slate-700 transition-colors">
                            {isSubmitting ? 'Sending...' : '🚀 Submit Report'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CameraCapture;