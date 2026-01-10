import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import ReportCard from '../components/ReportCard';
import { MapPin, Filter, RefreshCw, Zap, Search, X, Globe } from 'lucide-react';

const CommunityFeed = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // --- FILTER STATES ---
    const [userLocation, setUserLocation] = useState(null);
    const [detectedAddress, setDetectedAddress] = useState(""); 
    const [filterMode, setFilterMode] = useState('global'); 
    const [statusFilter, setStatusFilter] = useState('all'); 
    const [sortBySeverity, setSortBySeverity] = useState(false);
    const [sortByVotes, setSortByVotes] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);

    // --- SEARCH STATES ---
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);

    // --- 1. Helper: Get Detailed Address ---
    const getAddressFromCoordinates = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            const addr = data.address;
            const area = addr.suburb || addr.neighbourhood || addr.road || addr.village || "";
            const city = addr.city || addr.town || addr.state_district || "";
            const pincode = addr.postcode || "";
            
            let final = "";
            if (area) final += area;
            if (area && city) final += ", ";
            if (city) final += city;
            if (pincode) final += ` - ${pincode}`;
            
            return final || data.display_name.split(',')[0];
        } catch (error) { return "Selected Location"; }
    };

    // --- 2. Distance Calc ---
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; 
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // --- 3. Fetch Reports ---
    const fetchReports = async () => {
        setLoading(true);
        try {
            const { data } = await supabase
                .from('reports')
                .select('*')
                .order('created_at', { ascending: false });
            if (data) setReports(data);
        } catch (error) { console.error("Error fetching feed:", error); }
        setLoading(false);
    };

    useEffect(() => { fetchReports(); }, []);

    // --- 4. DEBOUNCED SEARCH ---
    useEffect(() => {
        if (searchQuery.length < 3) { setSuggestions([]); return; }
        const delaySearch = setTimeout(async () => {
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&limit=5&countrycodes=in`
                );
                const data = await response.json();
                setSuggestions(data);
            } catch (error) { console.error("Search error:", error); }
        }, 800); 
        return () => clearTimeout(delaySearch);
    }, [searchQuery]);

    // --- 5. ACTIONS ---
    const handleSelectLocation = (item) => {
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        setUserLocation({ lat, lng });
        setDetectedAddress(item.display_name.split(',').slice(0, 2).join(',')); 
        setFilterMode('nearby');
        setIsSearchOpen(false);
        setSearchQuery("");
        setSuggestions([]);
    };

    const clearLocation = () => {
        setFilterMode('global');
        setUserLocation(null);
        setDetectedAddress("");
    };

    const toggleGPSLocation = () => {
        if (filterMode === 'nearby') return;
        setLocationLoading(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setUserLocation({ lat, lng });
                    const address = await getAddressFromCoordinates(lat, lng);
                    setDetectedAddress(address);
                    setFilterMode('nearby');
                    setLocationLoading(false);
                },
                () => {
                    alert("GPS signal weak. Please use the Search button.");
                    setLocationLoading(false);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
            );
        } else {
            alert("GPS not supported.");
            setLocationLoading(false);
        }
    };

    // --- 6. FILTER LOGIC ---
    const processedReports = reports
        .filter(report => {
            if (filterMode === 'global') return true;
            if (!userLocation) return false;
            let rLat, rLng;
            try {
                if (typeof report.location === 'string') {
                    const l = JSON.parse(report.location);
                    rLat = l.lat; rLng = l.lng;
                } else {
                    rLat = report.location?.lat; rLng = report.location?.lng;
                }
            } catch (e) { return false; }
            if (!rLat || !rLng) return false;
            return calculateDistance(userLocation.lat, userLocation.lng, rLat, rLng) <= 15;
        })
        .filter(report => statusFilter === 'all' ? true : report.status?.toLowerCase() === statusFilter)
        .sort((a, b) => {
            if (sortBySeverity) return b.severity - a.severity;
            if (sortByVotes) return (b.votes || 0) - (a.votes || 0);
            return 0;
        });

    return (
        //  dark mode background
        <div className="min-h-screen bg-[#ACCFFA]  dark:bg-gray-500 pb-20 transition-colors duration-300">
            {/* HEADER */}
            <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-16 z-10 shadow-sm transition-all">
                <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
                    
                    {/* TOP ROW */}
                    <div className="flex flex-col gap-4">
                        {!isSearchOpen && (
                            <div className="flex justify-between items-start sm:items-center animate-in fade-in slide-in-from-top-2 duration-300">
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        {filterMode === 'nearby' ? <MapPin className="text-green-600 dark:text-green-400"/> : <Globe className="text-blue-600 dark:text-blue-400"/>}
                                        {filterMode === 'nearby' ? "Nearby Issues" : "Global Feed"}
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                                        {filterMode === 'nearby' 
                                            ? <span>Near <b className="text-gray-900 dark:text-white">{detectedAddress}</b></span>
                                            : "Viewing reports from all locations"}
                                    </p>
                                </div>
                                
                                <div className="flex gap-2 items-center">
                                    {/* SEARCH BUTTON */}
                                    <button onClick={() => setIsSearchOpen(true)} className="p-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-full transition-all" title="Search Area">
                                        <Search size={18} />
                                    </button>
                                    
                                    {/* GPS / CLEAR BUTTON */}
                                    {filterMode === 'global' ? (
                                        <button 
                                            onClick={toggleGPSLocation}
                                            disabled={locationLoading}
                                            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-all"
                                        >
                                            {locationLoading ? <RefreshCw size={16} className="animate-spin" /> : <MapPin size={16} />}
                                            Use GPS
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={clearLocation}
                                            className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-bold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                                            title="Clear Location"
                                        >
                                            <X size={18} />
                                            <span className="hidden sm:inline">Clear</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* SEARCH BAR */}
                        {isSearchOpen && (
                            <div className="relative animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                                        <input 
                                            type="text" 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Type complete area name..." 
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                                            autoFocus
                                        />
                                        {suggestions.length > 0 && (
                                            <div className="absolute top-full left-0 w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto mt-2">
                                                {suggestions.map((item, index) => (
                                                    <div key={index} onClick={() => handleSelectLocation(item)} className="p-3 hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer border-b border-gray-100 dark:border-slate-800 flex items-start gap-3 last:border-0">
                                                        <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{item.name || item.address.road || "Location"}</p>
                                                            <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-1">{item.display_name}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={() => setIsSearchOpen(false)} className="p-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-full transition-all"><X size={18} /></button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* FILTERS & SORT */}
                    <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
                            {['all', 'pending', 'resolved'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-1.5 rounded-md text-xs font-bold capitalize transition-all
                                        ${statusFilter === status 
                                            ? "bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-300 shadow-sm" 
                                            : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                        <div className="w-px h-6 bg-gray-300 dark:bg-slate-700 mx-2 hidden sm:block"></div>
                        
                        <button onClick={() => { setSortBySeverity(!sortBySeverity); setSortByVotes(false); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${sortBySeverity ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800" : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"}`}>
                            <Zap size={14} className={sortBySeverity ? "fill-red-600" : ""} /> Critical
                        </button>
                        
                        <button onClick={() => { setSortByVotes(!sortByVotes); setSortBySeverity(false); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${sortByVotes ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800" : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"}`}>
                            🔥 Popular
                        </button>
                    </div>
                </div>
            </div>

            {/* FEED GRID */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="text-center py-20 text-gray-400 dark:text-slate-500 animate-pulse">Loading feed...</div>
                ) : processedReports.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 dark:text-slate-400">
                        <Filter className="mx-auto mb-3 opacity-30 h-12 w-12" />
                        <h3 className="text-lg font-bold">No reports found nearby</h3>
                        <p className="text-sm">Try increasing search range or clearing filters.</p>
                        <button onClick={clearLocation} className="mt-4 text-blue-600 dark:text-blue-400 hover:underline text-sm font-bold">
                            Show Global Feed
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {processedReports.map((report) => (
                            <ReportCard key={report.id} report={report} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityFeed;