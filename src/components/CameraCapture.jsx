import React, { useState, useRef,useEffect } from 'react';
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

    const [suggestions, setSuggestions] = useState([]); // Stores search results
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [pincode, setPincode] = useState("");
 
    const [detectedAddress, setDetectedAddress] = useState("Fetching location...");

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

    // --- SMART ADDRESS SEARCH FUNCTION ---
// --- 1. HANDLE TYPING ONLY (Update text immediately) ---
    const handleManualInputChange = (e) => {
        setManualAddress(e.target.value);
    };

    // --- 2. DEBOUNCED SEARCH EFFECT (Wait 1s before calling API) ---
    useEffect(() => {
        // Stop if text is too short or empty
        if (!manualAddress || manualAddress.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        // Set a timer: "Call API in 1000ms"
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
        }, 1000); // 1000ms = 1 second delay

        // Cleanup: If user types again before 1s, cancel the previous timer
        return () => clearTimeout(delaySearch);

    }, [manualAddress]); // Run this whenever manualAddress changes

// --- WHEN USER CLICKS A SUGGESTION ---
    const selectSuggestion = (item) => {
     // 1. Set the visible text
        setManualAddress(item.display_name);
    
        // 2. Hide the list
        setShowSuggestions(false);
        if (item.address && item.address.postcode) {
            setPincode(item.address.postcode);
        } else {
            setPincode(""); // Clear it if not found so user can type
        }
    
        // 3. MAGIC: We now have the EXACT Lat/Lng from the API!
        // We update the report state immediately so we don't need to look it up later.
        setReport(prev => ({
            ...prev,
            location: {
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
                address: item.display_name
            }
        }));
    
        // 4. Mark location as successful (Green Checkmark UI)
        setLocationMode('manual_success'); 
    };
    // --- MISSING DETECT LOCATION FUNCTION ---
    const detectLocation = () => {
        // 1. Check browser support
        if (!("geolocation" in navigator)) {
            setLocationMode('manual');
            return;
        }
        
        setLocationMode('detecting');
        
        // 2. Start GPS Scan
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                // Success! We have coordinates.
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                // 3. Immediately fetch the text address
                const address = await getAddressFromCoordinates(lat, lng);
                
                // 4. Save it to state and update UI
                setDetectedAddress(address);
                setLocationMode('success');
            },
            (error) => {
                console.warn("GPS Error:", error);
                // Simple error handling: switch to manual
                setLocationMode('manual');
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // --- NEW HELPER: Convert Lat/Lng to Text Address ---
    const getAddressFromCoordinates = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            return data.display_name || "GPS Location Captured";
        } catch (error) {
            console.error("Reverse Geocoding failed:", error);
            return "GPS Location Captured"; // Fallback if API fails
        }
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

        if (locationMode === 'manual') {
            if (manualAddress.length < 3) return alert("Please enter a valid address");
            if (pincode.length < 6) return alert("Please enter a valid 6-digit Pincode");

    
        }

        setIsSubmitting(true);
        setLoadingText("Submitting...");

        try {
            const imageUrl = await uploadImageToStorage(imageFile);
            
// ... inside handleSubmit ...

        // --- SMART LOCATION LOGIC ---
        let finalLocation = null;
        let locationPrecision = 'manual_text'; // Default to low precision

        // CASE 1: Manual Text Only (User typed but didn't pick suggestion)
        if (locationMode === 'manual') {
            const proceed = window.confirm(
                "⚠️ GPS Warning\n\nWe cannot verify the exact location coordinates for this address.\n" +
                "The validation check will be disabled for this report.\n\n" +
                "Proceed anyway?"
            );
            if (!proceed) { setIsSubmitting(false); return; }

            finalLocation = { 
                lat: 0, 
                lng: 0, 
                address: manualAddress + (pincode ? `, ${pincode}` : "") 
            };
            locationPrecision = 'manual_text'; // Flag for Admin to skip check
        }
        
        // CASE 2: Valid Suggestion Selected (High Quality)
        else if (locationMode === 'manual_success') {
             finalLocation = {
                lat: report.location.lat, 
                lng: report.location.lng,
                address: manualAddress + (pincode ? `, ${pincode}` : "") 
            };
            locationPrecision = 'precise'; // Admin should enforce check
        }

        // CASE 3: GPS Auto-Detect (High Quality)
        // ... inside handleSubmit ...
        else {
             try {
                 // 1. Ask for GPS
                 const position = await new Promise((resolve, reject) => 
                    navigator.geolocation.getCurrentPosition(
                        resolve, 
                        reject,
                        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                    )
                );

                // --- NEW: CHECK ACCURACY ---
                // accuracy is measured in meters.
                // If accuracy is worse than 2000 meters (2km), it's definitely an IP address guess.
                const accuracy = position.coords.accuracy;
                console.log(`GPS Accuracy: ${accuracy} meters`);

                if (accuracy > 2000) {
                    alert(`⚠️ GPS Signal Weak (Accuracy: ±${Math.round(accuracy)}m).\n\nYour device is using a rough location (likely IP-based).\n\nPlease search for your address manually.`);
                    setIsSubmitting(false);
                    setLocationMode('manual'); // Switch to manual mode immediately
                    return;
                }
                // ---------------------------
                
                // If accuracy is good (e.g., on a phone), continue as normal
                const realAddress = await getAddressFromCoordinates(
                    position.coords.latitude, 
                    position.coords.longitude
                );

                finalLocation = { 
                    lat: position.coords.latitude, 
                    lng: position.coords.longitude, 
                    address: realAddress 
                };
                
                // Since accuracy is good, we trust this location
                locationPrecision = 'precise';

            } catch (gpsError) {
                console.error("GPS Error:", gpsError);
                alert("GPS Failed. Please enter location manually.");
                setIsSubmitting(false);
                setLocationMode('manual');
                return;
            }
        }

            await saveReport({
                userId: auth.currentUser.uid,
                imageUrl,
                issue: report.issue,
                description: report.description,
                severity: manualSeverity,
                location: finalLocation,
                location_precision: locationPrecision,
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

                    {/* REPORT DETAILS SECTION */}
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

                            {/* LOCATION SECTION */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Location Details</label>
                                
                                {/* 1. DETECTING STATE */}
                                {locationMode === 'detecting' && (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-500 animate-pulse">
                                        <MapPin size={18} />
                                        <span className="text-sm font-medium">Acquiring GPS...</span>
                                    </div>
                                )}

                                {/* 2. SUCCESS GPS STATE */}
                                {locationMode === 'success' && (
                                    <div className="p-3 bg-green-50 rounded-lg border border-green-200 shadow-sm flex items-center justify-between">
                                        <div className="overflow-hidden">
                                            {/* Header */}
                                            <div className="flex items-center gap-2 text-green-700 mb-0.5">
                                                <CheckCircle size={14} />
                                                <span className="text-xs font-bold uppercase">GPS Locked</span>
                                            </div>
                                            
                                            {/* THE NEW PART: Showing the address text */}
                                            <p className="text-xs text-gray-600 font-medium truncate max-w-[200px]" title={detectedAddress}>
                                                {detectedAddress}
                                            </p>
                                        </div>

                                        <button 
                                            onClick={() => setLocationMode('manual')}
                                            className="text-xs text-blue-600 underline shrink-0 font-medium px-2 py-1 hover:bg-blue-50 rounded"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                )}

                                {/* 3. MANUAL INPUT STATE (Redesigned with Pincode) */}
                                {locationMode === 'manual' && (
                                    <div className="relative animate-fade-in space-y-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                                        
                                        {/* Address Search */}
                                        <div className="relative">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Address / Landmark</label>
                                            <div className="relative">
                                                <MapPin size={16} className="absolute left-3 top-3 text-blue-500" />
                                                <input 
                                                    type="text"
                                                    value={manualAddress}
                                                    onChange={handleManualInputChange}
                                                    placeholder="Search area (e.g. Civil Lines)"
                                                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm shadow-sm"
                                                    autoFocus
                                                />
                                                {/* Suggestions Dropdown */}
                                                {showSuggestions && suggestions.length > 0 && (
                                                    <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto mt-1">
                                                        {suggestions.map((item, index) => (
                                                            <div 
                                                                key={index}
                                                                onClick={() => selectSuggestion(item)}
                                                                className="p-2.5 hover:bg-blue-50 cursor-pointer border-b border-gray-100 flex items-start gap-2"
                                                            >
                                                                <MapPin size={14} className="text-gray-400 mt-1 shrink-0" />
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-800 line-clamp-1">
                                                                        {item.name || item.address.road || "Location"}
                                                                    </p>
                                                                    <p className="text-[10px] text-gray-500 line-clamp-1">{item.display_name}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Pincode Field */}
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Pincode</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-gray-400 text-xs font-bold">#</span>
                                                <input 
                                                    type="tel" 
                                                    maxLength="6"
                                                    value={pincode}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/\D/g, ''); // Only numbers
                                                        if (val.length <= 6) setPincode(val);
                                                    }}
                                                    placeholder="226001"
                                                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm shadow-sm font-mono tracking-wide"
                                                />
                                            </div>
                                        </div>
                                        
                                        <p className="text-[10px] text-gray-400 text-center pt-1">
                                            *Address & Pincode required when GPS fails.
                                        </p>
                                    </div>
                                )}

                                {/* 4. MANUAL SUCCESS STATE */}
                                {locationMode === 'manual_success' && (
                                    <div className="p-3 bg-green-50 rounded-lg border border-green-200 shadow-sm flex items-center justify-between">
                                        <div className="overflow-hidden">
                                            <div className="flex items-center gap-2 text-green-700 mb-0.5">
                                                <CheckCircle size={14} />
                                                <span className="text-xs font-bold uppercase">Location Set</span>
                                            </div>
                                            <p className="text-xs text-gray-600 truncate max-w-[200px] font-medium">{manualAddress}</p>
                                            {pincode && <p className="text-[10px] text-gray-500">Pincode: {pincode}</p>}
                                        </div>
                                        <button 
                                            onClick={() => { setLocationMode('manual'); setManualAddress(''); setPincode(''); }}
                                            className="text-xs text-blue-600 underline shrink-0 font-medium px-2 py-1 hover:bg-blue-50 rounded"
                                        >
                                            Change
                                        </button>
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