import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { AlertTriangle, MapPin, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

// Fix for default marker icons in Leaflet with webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom emergency marker icon
const emergencyIcon = new L.DivIcon({
  className: "custom-emergency-marker",
  html: `<div style="
    background: #ef4444;
    width: 32px;
    height: 32px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  ">
    <svg style="transform: rotate(45deg); width: 16px; height: 16px; color: white;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Custom transport marker icon
const transportIcon = new L.DivIcon({
  className: "custom-transport-marker",
  html: `<div style="
    background: #3b82f6;
    width: 32px;
    height: 32px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  ">
    <svg style="transform: rotate(45deg); width: 16px; height: 16px; color: white;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface EmergencyBooking {
  id: string;
  patient_name: string;
  patient_phone: string;
  pickup_location: string;
  pickup_latitude: number | null;
  pickup_longitude: number | null;
  emergency_type: string;
  status: string | null;
  eta_minutes: number | null;
}

interface TransportBooking {
  id: string;
  patient_name: string;
  patient_phone: string;
  pickup_location: string;
  destination: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string | null;
}

interface DriverMapProps {
  emergencyBookings: EmergencyBooking[];
  transportBookings: TransportBooking[];
  onNavigate: (location: string) => void;
}

// Component to fit bounds to markers
function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [positions, map]);

  return null;
}

export function DriverMap({ emergencyBookings, transportBookings, onNavigate }: DriverMapProps) {
  // Filter bookings with valid coordinates
  const emergencyWithCoords = emergencyBookings.filter(
    (b) => b.pickup_latitude && b.pickup_longitude
  );

  // Default center (will be overridden by FitBounds if there are markers)
  const defaultCenter: [number, number] = [40.7128, -74.006]; // New York

  // Collect all positions for bounds
  const positions: [number, number][] = emergencyWithCoords.map((b) => [
    b.pickup_latitude!,
    b.pickup_longitude!,
  ]);

  const hasMarkers = positions.length > 0;

  return (
    <div className="h-[400px] rounded-xl overflow-hidden border border-border relative">
      <MapContainer
        center={hasMarkers ? positions[0] : defaultCenter}
        zoom={hasMarkers ? 12 : 10}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {hasMarkers && <FitBounds positions={positions} />}

        {/* Emergency Markers */}
        {emergencyWithCoords.map((booking) => (
          <Marker
            key={booking.id}
            position={[booking.pickup_latitude!, booking.pickup_longitude!]}
            icon={emergencyIcon}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="font-semibold text-red-600">Emergency</span>
                </div>
                <h3 className="font-semibold">{booking.patient_name}</h3>
                <p className="text-sm text-gray-600 capitalize mb-2">
                  {booking.emergency_type.replace("_", " ")}
                </p>
                <div className="space-y-1 text-sm mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{booking.pickup_location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <a href={`tel:${booking.patient_phone}`} className="text-blue-600">
                      {booking.patient_phone}
                    </a>
                  </div>
                  {booking.eta_minutes && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>ETA: {booking.eta_minutes} min</span>
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => onNavigate(booking.pickup_location)}
                >
                  Navigate
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}

      </MapContainer>

      {/* Show message if no coordinates - MUST be outside MapContainer */}
      {!hasMarkers && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-background/90 p-4 rounded-lg text-center">
          <MapPin className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            No bookings with GPS coordinates
          </p>
        </div>
      )}
    </div>
  );
}
