import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import ReportCard from '../components/ReportCard';
import { MapPin, Filter } from 'lucide-react';

const CommunityFeed = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);

    // --- 1. Haversine Formula for Distance (KM) ---
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth radius in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    useEffect(() => {
        // --- 2. Get User Location ---
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            });
        }

        // --- 3. Fetch ALL Reports (No User Filter) ---
        const fetchReports = async () => {
            try {
                const { data, error } = await supabase
                    .from('reports')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (data) setReports(data);
            } catch (error) {
                console.error("Error fetching feed:", error);
            }
            setLoading(false);
        };

        fetchReports();
    }, []);

    // --- 4. Filter Logic (Show only within 10km) ---
    const nearbyReports = reports.filter(report => {
        if (!userLocation || !report.location) return true; // Show all if location missing
        const dist = calculateDistance(
            userLocation.lat, userLocation.lng, 
            report.location.lat, report.location.lng
        );
        return dist <= 10; // Only show if within 10km
    });

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <MapPin className="text-green-600" />
                        Community Feed
                    </h1>
                    <p className="text-sm text-gray-500">
                        Showing issues within {userLocation ? "10km of you" : "your area"}.
                    </p>
                </div>
            </div>

            {/* Feed Grid */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="text-center py-10">Loading nearby issues...</div>
                ) : nearbyReports.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        <Filter className="mx-auto mb-2 opacity-50" />
                        No reports found nearby.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {nearbyReports.map((report) => (
                            // Use your existing ReportCard component
                            <ReportCard key={report.id} report={report} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityFeed;