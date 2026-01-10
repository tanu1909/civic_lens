import React, { useState, useRef, useEffect } from 'react';
import { ImageAnalysis } from '../services/gemini';
import { uploadImageToStorage, saveReport } from '../services/reportService';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import { MapPin, CheckCircle, RotateCcw, X, AlertTriangle, Search } from 'lucide-react'; 

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
    const [suggestions, setSuggestions] = useState([]); 
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [pincode, setPincode] = useState("");
    const [detectedAddress, setDetectedAddress] = useState("Fetching location...");
    
    // --- STRICT VALIDATION STATE ---
    const [isAddressVerified, setIsAddressVerified] = useState(false); 
    const [finalCoords, setFinalCoords] = useState({ lat: 0, lng: 0 });

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
            if (!isAnalysisActive.current) return;

            setImage(URL.createObjectURL(compressedFile));
            setImageFile(compressedFile);
            
            const data = await ImageAnalysis(compressedFile);
            
            if (!isAnalysisActive.current) { setLoading(false); return; }

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

    const handleRetake = () => {
        isAnalysisActive.current = false;
        setImage(null);
        setImageFile(null);
        setReport(null);        
        setManualSeverity(0);
        setLocationMode('auto');
        setManualAddress("");
        setIsAddressVerified(false); 
        setLoading(false);       
        if (fileInputRef.current) fileInputRef.current.value = "";
    };


    // --- ADDRESS SEARCH FUNCTIONS ---
    const handleManualInputChange = (e) => {
        setManualAddress(e.target.value);
        setLocationMode('manual'); 
        setIsAddressVerified(false); 
        setFinalCoords({ lat: 0, lng: 0 });
    };

    useEffect(() => {
        if (!manualAddress || manualAddress.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);

    // --- LOCATION FUNCTION ---
    const detectLocation = () => {
        if (!("geolocation" in navigator)) {
            setLocationMode('manual');

            return;
        }
        if(isAddressVerified) return;

        const delaySearch = setTimeout(async () => {
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualAddress)}&addressdetails=1&limit=5&countrycodes=in`
                );
                const data = await response.json();
                setSuggestions(data);
                setShowSuggestions(true);
            } catch (error) {
                console.error("Search failed:", error);
            }
        }, 800);
        return () => clearTimeout(delaySearch);
    }, [manualAddress, isAddressVerified]);

    const selectSuggestion = (item) => {
        setManualAddress(item.display_name);
        setShowSuggestions(false);
        if (item.address && item.address.postcode) {
            setPincode(item.address.postcode);
        } else {
            setPincode("");
        }
        
        setFinalCoords({
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
        });

        setIsAddressVerified(true);
        setLocationMode('manual_success'); 
    };

    // --- GPS Logic ---
    const detectLocation = () => {
        if (!("geolocation" in navigator)) { setLocationMode('manual'); return; }
        setLocationMode('detecting');
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const address = await getAddressFromCoordinates(lat, lng);
                setDetectedAddress(address);
                setFinalCoords({ lat, lng });
                setLocationMode('success');
            },
            (error) => {
                console.warn("GPS Error:", error);
                setLocationMode('manual');
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };


    const getAddressFromCoordinates = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            return data.display_name || "GPS Location Captured";
        } catch (error) {
            return "GPS Location Captured";
        }
    };

    // --- SUBMIT LOGIC ---

    // --- HANDLE SUBMIT ---

    const handleSubmit = async () => {
        if (!auth.currentUser) return alert("Please Login!");
        if (manualSeverity < 4) return alert("Severity must be 4+ to report.");

        if (locationMode === 'manual' && !isAddressVerified) {
            alert("⚠️ Please select a valid address from the dropdown suggestions.\n\nWe need exact coordinates to map this issue.");
            return;
        }
        if (locationMode === 'manual' && manualAddress.length < 5) {
            alert("Please enter a longer address to search.");
            return;
        }

        setIsSubmitting(true);
        setLoadingText("Submitting...");

        try {
            const imageUrl = await uploadImageToStorage(imageFile);
            
            let submissionLocation = {
                lat: finalCoords.lat,
                lng: finalCoords.lng,
                address: locationMode === 'success' ? detectedAddress : manualAddress + (pincode ? ` - ${pincode}` : "")
            };

            await saveReport({
                userId: auth.currentUser.uid,
                imageUrl,
                issue: report.issue,
                description: report.description,
                severity: manualSeverity,
                location: submissionLocation,
                location_precision: 'precise', 
                status: 'Pending',
                timestamp: new Date().toISOString()
            });

            setShowToast(true);
            setTimeout(() => navigate('/history'), 2000);

        } catch (e) {
            alert("Error: " + e.message);
            setIsSubmitting(false);
        }
    };

    return (

        <div className="fixed top-20 inset-x-0 bottom-0 bg-gray-900/90 backdrop-blur-sm z-[50] flex items-center justify-center p-4">
            

            {/* MODAL CONTAINER */}
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-fade-in-up border dark:border-slate-800">

            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in-up">

                
                {/* 1. FIXED HEADER */}
                <div className="bg-blue-600 p-4 flex justify-between items-center shrink-0">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        📸 New Report
                    </h2>
                    <button onClick={() => navigate('/')} className="bg-white/20 p-2 rounded-full hover:bg-white/30 text-white transition">
                        <X size={18} />
                    </button>
                </div>

                {/* 2. SCROLLABLE BODY */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-white dark:bg-slate-900">
                    
                    {/* Image Preview */}
                    <div className="relative w-full h-56 bg-gray-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 group shrink-0">
                        {image ? (
                            <>
                                <img src={image} className="w-full h-full object-cover" alt="Preview" />
                                <button onClick={handleRetake} className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md transition-all flex items-center gap-1 shadow-md z-20 border border-white/20"><RotateCcw size={12} /> Retake</button>
                            </>
                        ) : (
                            <label className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition active:scale-95">
                                <span className="text-4xl mb-2">📷</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Tap to Snap Photo</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} ref={fileInputRef} />
                            </label>
                        )}
                        {loading && (

                            <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 flex flex-col items-center justify-center z-30">

                            <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-30">

                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
                                <p className="text-blue-600 font-bold mt-3 text-sm animate-pulse">{loadingText}</p>
                            </div>
                        )}
                    </div>

                    {report && (
                        <div className="animate-fade-in space-y-6">
                            {/* AI Findings */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-gray-900 dark:text-blue-100">{report.issue}</h3>
                                    <span className="bg-blue-200 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border border-blue-200 dark:border-blue-500/30">AI Detected</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-blue-200/80 mt-2 leading-relaxed">{report.description}</p>
                            </div>

                            {/* Severity */}
                            <div className="pb-2">
                                <div className="flex justify-between items-end mb-2">
                                    <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Severity Level</label>
                                    <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">{manualSeverity}<span className="text-gray-400 dark:text-gray-600 text-sm">/10</span></span>
                                </div>
                                <input type="range" min="1" max="10" value={manualSeverity} onChange={(e) => setManualSeverity(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg accent-blue-600 cursor-pointer z-10 relative" />
                                <div className="flex justify-between mt-1"><span className="text-[10px] text-gray-400">Low</span><span className="text-[10px] text-gray-400">High</span></div>
                            </div>

                            {/* Location Section */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Location Details</label>
                                
                                {locationMode === 'detecting' && (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 animate-pulse"><MapPin size={18} /><span className="text-sm font-medium">Acquiring GPS...</span></div>
                                )}

                                {locationMode === 'success' && (
                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/30 shadow-sm flex items-center justify-between">
                                        <div className="overflow-hidden">
                                            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-0.5"><CheckCircle size={14} /><span className="text-xs font-bold uppercase">GPS Locked</span></div>
                                            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium truncate max-w-[200px]">{detectedAddress}</p>
                                        </div>
                                        <button onClick={() => setLocationMode('manual')} className="text-xs text-blue-600 dark:text-blue-400 underline font-medium px-2 py-1">Edit</button>
                                    </div>
                                )}


                                {(locationMode === 'manual' || locationMode === 'manual_success') && (
                                    <div className="relative animate-fade-in space-y-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                                        <div className="relative">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Search Address</label>
                                            <div className="relative">
                                                <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                                                <input 
                                                    type="text" 
                                                    value={manualAddress} 
                                                    onChange={handleManualInputChange} 
                                                    placeholder="e.g. MNNIT, Teliyarganj" 
                                                    className={`w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border rounded-lg focus:ring-2 outline-none text-sm shadow-sm dark:text-white
                                                        ${!isAddressVerified && manualAddress.length > 2 
                                                            ? 'border-red-300 focus:ring-red-200 dark:border-red-800 dark:focus:ring-red-900' 
                                                            : 'border-gray-300 focus:ring-blue-500 dark:border-slate-600 dark:focus:ring-blue-500'}`}
                                                    autoFocus 
                                                />
                                                {/* Suggestions List */}
                                                {showSuggestions && suggestions.length > 0 && (
                                                    <div className="absolute top-full left-0 w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto mt-1">
                                                        {suggestions.map((item, index) => (
                                                            <div key={index} onClick={() => selectSuggestion(item)} className="p-3 hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer border-b border-gray-100 dark:border-slate-800 flex items-start gap-2">
                                                                <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 line-clamp-1">{item.name || item.address.road || "Location"}</p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{item.display_name}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            {/* Validation Message */}
                                            {locationMode === 'manual' && !isAddressVerified && manualAddress.length > 0 && (
                                                <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-semibold flex items-center gap-1">
                                                    <AlertTriangle size={10}/> Please select an option from the list to verify coordinates.
                                                </p>
                                            )}
                                        </div>
                                        {isAddressVerified && <div className="text-xs text-green-600 dark:text-green-400 font-bold flex items-center gap-1 mt-1"><CheckCircle size={12}/> Address Verified</div>}
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

                {/* 3. FIXED FOOTER */}
                {report && (

                    <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">

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


            {showToast && (
                <div className="fixed top-50 left-1/2 transform -translate-x-1/2 
                                bg-white dark:bg-slate-800 
                                text-gray-900 dark:text-white 
                                px-6 py-3 rounded-full shadow-2xl 
                                border border-gray-200 dark:border-slate-700
                                flex items-center gap-3 animate-fade-in-up 
                                z-[10000]">
                    <CheckCircle size={16} className="text-green-500" /> 
                    <span className="font-medium">Report Submitted!</span>
                </div>
            )}
        </div>
    );
};

export default CameraCapture;