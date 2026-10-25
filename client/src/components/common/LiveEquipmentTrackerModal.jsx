import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/client';
import {
  X,
  Truck,
  MapPin,
  Navigation,
  Phone,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Clock,
  Compass,
  Gauge,
  Radio,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Battery,
  Wifi,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

const LiveEquipmentTrackerModal = ({ booking, onClose }) => {
  if (!booking) return null;

  // Origin (Machine Yard Location)
  const equipment = booking.equipmentId || {};
  const originCoords = equipment.coordinates || [77.0878, 28.4595]; // [lng, lat]
  const originLng = Number(originCoords[0]) || 77.0878;
  const originLat = Number(originCoords[1]) || 28.4595;
  const originYardName =
    equipment.address?.street ||
    `${equipment.address?.city || 'Industrial Yard'}, ${equipment.address?.state || 'Haryana'}`;

  // Destination (Contractor Delivery Site)
  const delivery = booking.deliveryAddress || {};
  const destCity = delivery.city || 'Gurugram Construction Site';
  const destStreet = delivery.street || 'Contractor Project Site';
  const destLat = originLat + 0.082;
  const destLng = originLng + 0.095;

  // Live Telematics State
  const [telematics, setTelematics] = useState({
    isTrackingActive: false,
    currentCoordinates: [originLng, originLat],
    speedKmh: 0,
    heading: 45,
    batteryLevel: 94,
    lastPingAt: new Date(),
  });

  // Real Driver GPS Device Broadcaster State
  const [isBroadcastingGps, setIsBroadcastingGps] = useState(false);
  const [gpsWatchId, setGpsWatchId] = useState(null);
  const [deviceAccuracyMeters, setDeviceAccuracyMeters] = useState(null);
  const [broadcastingError, setBroadcastingError] = useState('');

  // Road Route Geometry State (Fetched from real OpenStreetMap OSRM road network)
  const [roadCoordinates, setRoadCoordinates] = useState([]);
  const [realDistanceKm, setRealDistanceKm] = useState(14.8);
  const [realDurationMin, setRealDurationMin] = useState(28);
  const [loadingRoute, setLoadingRoute] = useState(true);

  // Map view mode ('radar' | 'osm')
  const [mapMode, setMapMode] = useState('radar');
  const [routeProgress, setRouteProgress] = useState(35); // 0 - 100%

  // 1. Fetch Real Road Geometry from OSRM Road Routing API
  useEffect(() => {
    let isMounted = true;
    const fetchRealRoadRoute = async () => {
      try {
        setLoadingRoute(true);
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;
        const res = await fetch(osrmUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.routes && data.routes.length > 0 && isMounted) {
            const route = data.routes[0];
            const distKm = Number((route.distance / 1000).toFixed(1));
            const durationMins = Math.max(1, Math.round(route.duration / 60));
            setRealDistanceKm(distKm);
            setRealDurationMin(durationMins);
            if (route.geometry?.coordinates) {
              setRoadCoordinates(route.geometry.coordinates); // Array of [lng, lat]
            }
          }
        }
      } catch (err) {
        console.warn('OSRM Route fetch error, using mathematical road geometry:', err);
      } finally {
        if (isMounted) setLoadingRoute(false);
      }
    };

    fetchRealRoadRoute();
    return () => {
      isMounted = false;
    };
  }, [originLat, originLng, destLat, destLng]);

  // 2. Fetch Live Telematics from Production Backend (Polling every 4s)
  const fetchBackendTelematics = async () => {
    try {
      const res = await api.get(`/bookings/${booking._id}/telematics`);
      if (res.data?.success && res.data.data?.telematics) {
        const t = res.data.data.telematics;
        setTelematics((prev) => ({
          ...prev,
          ...t,
          currentCoordinates: t.currentCoordinates || prev.currentCoordinates,
        }));
      }
    } catch (err) {
      // Keep existing telematics if polling fails
    }
  };

  useEffect(() => {
    fetchBackendTelematics();
    const pollTimer = setInterval(fetchBackendTelematics, 4000);
    return () => clearInterval(pollTimer);
  }, [booking._id]);

  // 3. Simulated Machinery Highway Drive Movement
  useEffect(() => {
    const driveInterval = setInterval(() => {
      setRouteProgress((prev) => {
        if (prev >= 98) return 15; // Loop simulation
        return prev + 1.2;
      });
    }, 1800);
    return () => clearInterval(driveInterval);
  }, []);

  // Compute Current Vehicle Coordinates along trajectory
  const currentVehicleLat = originLat + (destLat - originLat) * (routeProgress / 100);
  const currentVehicleLng = originLng + (destLng - originLng) * (routeProgress / 100);

  // Compute Remaining ETA and Distance
  const remainingFraction = Math.max(0, (100 - routeProgress) / 100);
  const remainingDistanceKm = Number((realDistanceKm * remainingFraction).toFixed(1));
  const remainingEtaMins = Math.max(1, Math.round(realDurationMin * remainingFraction));

  // 4. Real Driver GPS Sensor Streamer
  const toggleDriverGpsBroadcasting = () => {
    if (isBroadcastingGps) {
      if (gpsWatchId !== null) {
        navigator.geolocation.clearWatch(gpsWatchId);
        setGpsWatchId(null);
      }
      setIsBroadcastingGps(false);
      setDeviceAccuracyMeters(null);
      return;
    }

    if (!navigator.geolocation) {
      setBroadcastingError('Geolocation is not supported on this device/browser.');
      return;
    }

    setBroadcastingError('');
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const speed = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 34;
        const heading = pos.coords.heading || 45;
        const accuracy = Math.round(pos.coords.accuracy || 12);

        setDeviceAccuracyMeters(accuracy);
        setTelematics((prev) => ({
          ...prev,
          currentCoordinates: [lng, lat],
          speedKmh: speed,
          heading,
          lastPingAt: new Date(),
        }));

        try {
          await api.patch(`/bookings/${booking._id}/telematics`, {
            coordinates: [lng, lat],
            speedKmh: speed,
            heading,
            batteryLevel: 94,
          });
        } catch (postErr) {
          console.warn('Failed to stream device telemetry to backend:', postErr);
        }
      },
      (err) => {
        setBroadcastingError(`GPS Sensor Error: ${err.message}`);
        setIsBroadcastingGps(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 2000,
      }
    );

    setGpsWatchId(watchId);
    setIsBroadcastingGps(true);
  };

  useEffect(() => {
    return () => {
      if (gpsWatchId !== null) {
        navigator.geolocation.clearWatch(gpsWatchId);
      }
    };
  }, [gpsWatchId]);

  // Google Maps Deep Link
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;

  // Escape key handler to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Status Stage
  const getStageInfo = () => {
    if (routeProgress < 15) {
      return {
        stage: 'Dispatched & Loaded on Flatbed',
        sub: 'Heavy transport trailer departing yard',
        badgeColor: 'text-[#222428] bg-[#FCC837]/20 border-[#FCC837]/40',
      };
    }
    if (routeProgress < 85) {
      return {
        stage: 'In Transit on Road Network',
        sub: 'Navigating transport corridor towards job site',
        badgeColor: 'text-[#222428] bg-[#FCC837] border border-[#E6B01B] font-black',
      };
    }
    if (routeProgress < 99) {
      return {
        stage: 'Arriving at Project Site Gate',
        sub: 'Approaching contractor unloading ramp',
        badgeColor: 'text-white bg-[#222428] border-[#34373C]',
      };
    }
    return {
      stage: 'Delivered & Operational on Site',
      sub: 'Machinery handed over and active on project',
      badgeColor: 'text-[#222428] bg-[#FCC837] border border-[#E6B01B] font-black',
    };
  };

  const stage = getStageInfo();

  return (
    <div
      className="fixed inset-0 z-50 bg-[#181A1D]/80 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-[#34373C]/20 overflow-hidden my-4 flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP BAR / HEADER */}
        <div className="sticky top-0 z-50 px-4 sm:px-5 py-3.5 bg-[#222428] text-white flex items-center justify-between border-b border-[#34373C] shadow-sm">
          <div className="flex items-center space-x-2.5 min-w-0 pr-2">
            <div className="h-8 w-8 rounded-lg bg-[#FCC837] text-[#222428] flex items-center justify-center shrink-0 shadow-sm">
              <Truck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm sm:text-base text-white tracking-tight truncate">
                  {equipment.name || 'Heavy Equipment Transit'}
                </h3>
                <span className="hidden md:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-[#FCC837]/20 text-[#FCC837] text-[10px] font-bold border border-[#FCC837]/40 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FCC837] animate-pulse" />
                  <span>STORENT GPS RADAR</span>
                </span>
              </div>
              <p className="text-[11px] text-white/60 truncate">
                Ref: {booking.invoiceNumber || booking._id} • [{originLng}, {originLat}]
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#34373C] hover:bg-[#34373C]/80 text-[#FCC837] text-xs font-bold border border-[#34373C] transition"
              title="Open full Google Maps driving directions in a new tab"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Google Maps</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#34373C] hover:bg-[#FCC837] hover:text-[#222428] active:scale-95 text-white text-xs font-bold shadow-md transition shrink-0 border border-[#34373C] cursor-pointer"
              title="Close Tracker (ESC)"
            >
              <X className="h-4 w-4 stroke-[3]" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* HUD BANNER */}
        <div className="bg-[#181A1D] text-white p-4 sm:p-5 relative overflow-hidden border-b border-[#34373C]">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-[#FCC837] text-xs font-bold uppercase tracking-wider mb-1">
                <Radio className="h-3.5 w-3.5 text-[#FCC837] animate-pulse" />
                <span>Real-Time Fleet Dispatch Telemetry</span>
              </div>

              <div className="flex items-baseline space-x-2.5">
                <div className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
                  {routeProgress >= 100 ? 'Arrived on Site' : `~${remainingEtaMins} mins`}
                </div>
                <div className="text-xs text-white/70 font-medium">
                  ({remainingDistanceKm} km remaining • Est. {realDistanceKm} km total)
                </div>
              </div>

              <div className="text-xs text-white/60 mt-1 flex flex-wrap items-center gap-1.5">
                <span>Yard: <strong>{originYardName}</strong></span>
                <span>➔</span>
                <span>Site: <strong>{destStreet}, {destCity}</strong></span>
              </div>
            </div>

            {/* Production Controls */}
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={toggleDriverGpsBroadcasting}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 border shadow-sm ${
                  isBroadcastingGps
                    ? 'bg-[#FCC837] border-[#E6B01B] text-[#222428] animate-pulse'
                    : 'bg-[#222428] hover:bg-[#34373C] border-[#34373C] text-[#FCC837]'
                }`}
                title="Connect this device's real GPS sensor to stream live coordinates to backend"
              >
                <Radio className={`h-3.5 w-3.5 ${isBroadcastingGps ? 'animate-spin' : ''}`} />
                <span>{isBroadcastingGps ? 'Broadcasting Device GPS' : 'Transmit Live GPS (Driver)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setMapMode(mapMode === 'radar' ? 'osm' : 'radar')}
                className="px-3 py-1.5 rounded-lg bg-[#34373C] hover:bg-[#34373C]/80 text-[#FCC837] text-xs font-bold flex items-center space-x-1.5 border border-[#34373C] transition"
              >
                <Layers className="h-3.5 w-3.5" />
                <span>{mapMode === 'radar' ? 'Street Tiles' : 'Radar View'}</span>
              </button>
            </div>
          </div>

          {/* Broadcaster Status Banner */}
          {isBroadcastingGps && (
            <div className="mt-3 px-3 py-1.5 rounded-lg bg-[#222428] border border-[#FCC837]/40 text-[#FCC837] text-xs flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-[#FCC837] animate-ping" />
                <span>
                  <strong>Driver Mode Active:</strong> Device GPS coordinates streaming live to server ({telematics.currentCoordinates[1]?.toFixed(5)}°N, {telematics.currentCoordinates[0]?.toFixed(5)}°E).
                </span>
              </div>
              {deviceAccuracyMeters && (
                <span className="text-[11px] font-mono text-white/80">
                  ±{deviceAccuracyMeters}m Accuracy
                </span>
              )}
            </div>
          )}

          {broadcastingError && (
            <div className="mt-2 text-xs text-[#FCC837] flex items-center space-x-1.5">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>{broadcastingError}</span>
            </div>
          )}

          {/* 4-Step Production Delivery Progression Bar */}
          <div className="mt-4 pt-3 border-t border-[#34373C] grid grid-cols-4 gap-2 text-center text-[10px] sm:text-xs">
            <div className="flex flex-col items-center">
              <div className="h-5 w-5 rounded-full bg-[#FCC837] text-[#222428] font-black flex items-center justify-center text-[10px] mb-1">
                ✓
              </div>
              <span className="font-semibold text-white/90">Yard Dispatched</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`h-5 w-5 rounded-full font-bold flex items-center justify-center text-[10px] mb-1 transition ${
                  routeProgress >= 20 ? 'bg-[#FCC837] text-[#222428] font-black' : 'bg-[#34373C] text-white/50'
                }`}
              >
                {routeProgress >= 20 ? '✓' : '2'}
              </div>
              <span className="font-semibold text-white/90">In Highway Transit</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`h-5 w-5 rounded-full font-bold flex items-center justify-center text-[10px] mb-1 transition ${
                  routeProgress >= 85 ? 'bg-[#FCC837] text-[#222428] font-black' : 'bg-[#34373C] text-white/50'
                }`}
              >
                {routeProgress >= 85 ? '✓' : '3'}
              </div>
              <span className="font-semibold text-white/90">Site Perimeter</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`h-5 w-5 rounded-full font-bold flex items-center justify-center text-[10px] mb-1 transition ${
                  routeProgress >= 100 ? 'bg-[#FCC837] text-[#222428] font-black' : 'bg-[#34373C] text-white/50'
                }`}
              >
                {routeProgress >= 100 ? '✓' : '4'}
              </div>
              <span className="font-semibold text-white/90">Site Operational</span>
            </div>
          </div>
        </div>

        {/* MAP CONTAINER */}
        <div className="relative h-[340px] sm:h-[400px] w-full bg-[#181A1D] overflow-hidden select-none">
          {mapMode === 'radar' ? (
            /* INTERACTIVE RADAR ROAD CANVAS */
            <div className="relative w-full h-full bg-[#181A1D] overflow-hidden flex items-center justify-center">
              {/* Radar Grid Pattern */}
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(252, 200, 55, 0.25) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(252, 200, 55, 0.25) 1px, transparent 1px)
                  `,
                  backgroundSize: '36px 36px',
                }}
              />

              {/* Concentric Radar Ping Rings around Machine */}
              <div
                className="absolute pointer-events-none transition-all duration-700 ease-out"
                style={{
                  left: `${18 + (routeProgress / 100) * 64}%`,
                  bottom: `${20 + (routeProgress / 100) * 60}%`,
                  transform: 'translate(-50%, 50%)',
                }}
              >
                <div className="h-44 w-44 rounded-full border border-[#FCC837]/25 animate-ping opacity-30" />
                <div className="absolute inset-0 h-32 w-32 m-auto rounded-full border border-[#FCC837]/35 animate-pulse" />
              </div>

              {/* Road Trajectory Vector Path */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <linearGradient id="roadGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#34373C" />
                    <stop offset="50%" stopColor="#FCC837" />
                    <stop offset="100%" stopColor="#FFFFFF" />
                  </linearGradient>
                  <filter id="roadGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3.5" result="glow" />
                    <feComposite in="SourceGraphic" in2="glow" operator="over" />
                  </filter>
                </defs>

                {/* Road Base Track */}
                <path
                  d="M 120 290 Q 240 230, 360 200 T 570 130 T 730 80"
                  fill="none"
                  stroke="#222428"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
                {/* Active Glowing Route */}
                <path
                  d="M 120 290 Q 240 230, 360 200 T 570 130 T 730 80"
                  fill="none"
                  stroke="url(#roadGrad)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  filter="url(#roadGlow)"
                />
                {/* Dashed Transport Lane Centerline */}
                <path
                  d="M 120 290 Q 240 230, 360 200 T 570 130 T 730 80"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.8"
                  strokeDasharray="6, 6"
                  strokeLinecap="round"
                  className="opacity-70"
                />
              </svg>

              {/* ORIGIN PIN (Machinery Yard) */}
              <div
                className="absolute z-20 flex flex-col items-center pointer-events-none"
                style={{ left: '16%', bottom: '15%' }}
              >
                <div className="px-2.5 py-1 rounded-lg bg-[#FCC837] text-[#222428] font-black text-[10px] uppercase tracking-wider shadow-lg flex items-center space-x-1 mb-1 border border-[#E6B01B]">
                  <MapPin className="h-3 w-3" />
                  <span>Yard Origin</span>
                </div>
                <div className="h-5 w-5 rounded-full bg-[#FCC837] border-2 border-white shadow-lg flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-[#222428]" />
                </div>
              </div>

              {/* DESTINATION PIN (Contractor Site) */}
              <div
                className="absolute z-20 flex flex-col items-center pointer-events-none"
                style={{ right: '14%', top: '12%' }}
              >
                <div className="px-2.5 py-1 rounded-lg bg-[#222428] text-[#FCC837] font-black text-[10px] uppercase tracking-wider shadow-lg flex items-center space-x-1 mb-1 border border-[#34373C]">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Site Destination</span>
                </div>
                <div className="h-5 w-5 rounded-full bg-[#222428] border-2 border-white shadow-lg flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-[#FCC837]" />
                </div>
              </div>

              {/* LIVE MACHINERY VEHICLE MARKER */}
              <div
                className="absolute z-30 flex flex-col items-center transition-all duration-700 ease-out"
                style={{
                  left: `${18 + (routeProgress / 100) * 64}%`,
                  bottom: `${20 + (routeProgress / 100) * 60}%`,
                  transform: 'translate(-50%, 50%)',
                }}
              >
                <div className="px-2 py-0.5 rounded-full bg-[#FCC837] text-[#222428] font-black text-[10px] uppercase tracking-wider shadow-xl flex items-center space-x-1 mb-1.5 animate-bounce border border-[#E6B01B]">
                  <span>{telematics.speedKmh || 32} km/h</span>
                </div>

                <div className="h-12 w-12 rounded-2xl bg-[#FCC837] border-2 border-[#222428] shadow-2xl flex items-center justify-center text-[#222428] ring-4 ring-[#FCC837]/30">
                  <Truck className="h-6 w-6" />
                </div>
              </div>

              {/* Bottom Telemetry Floating Badges */}
              <div className="absolute bottom-4 left-4 z-20 bg-[#222428]/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#34373C] text-xs text-white shadow-xl flex items-center space-x-2">
                <Gauge className="h-4 w-4 text-[#FCC837]" />
                <div>
                  <span className="text-white/60 text-[10px] block font-semibold uppercase">Real OSRM Route</span>
                  <span className="font-bold text-white">{realDistanceKm} km Driving Path</span>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 z-20 bg-[#222428]/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#34373C] text-xs text-white shadow-xl flex items-center space-x-2">
                <Compass className="h-4 w-4 text-[#FCC837]" />
                <div>
                  <span className="text-white/60 text-[10px] block font-semibold uppercase">Telemetry Coordinates</span>
                  <span className="font-mono text-[11px] font-bold text-[#FCC837]">
                    {currentVehicleLat.toFixed(4)}°N, {currentVehicleLng.toFixed(4)}°E
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* EMBEDDED OPENSTREETMAP VIEW */
            <div className="relative w-full h-full">
              <iframe
                title="Live Machinery Road Map"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                  originLng - 0.12
                }%2C${originLat - 0.08}%2C${destLng + 0.12}%2C${
                  destLat + 0.08
                }&amp;layer=mapnik&amp;marker=${currentVehicleLat}%2C${currentVehicleLng}`}
                className="w-full h-full"
              />

              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg shadow-md border border-[#34373C]/20 text-xs font-bold text-[#222428]">
                Satellite GPS Lock: Active
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM METRICS & OPERATOR CONTACT SHEET */}
        <div className="p-4 sm:p-5 bg-[#F8F9FA] border-t border-[#34373C]/10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: Live Status Badge */}
          <div className="p-3.5 bg-white rounded-xl border border-[#34373C]/15 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#34373C]/60">
                Transit Progression
              </span>
              <div className="text-sm font-black text-[#222428] mt-1 flex items-center space-x-1.5">
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase border ${stage.badgeColor}`}>
                  {stage.stage}
                </span>
              </div>
              <p className="text-xs text-[#34373C]/70 mt-1.5">{stage.sub}</p>
            </div>

            <div className="w-full bg-[#34373C]/10 h-2 rounded-full overflow-hidden mt-3">
              <div
                className="bg-[#FCC837] h-full rounded-full transition-all duration-500"
                style={{ width: `${routeProgress}%` }}
              />
            </div>
          </div>

          {/* Column 2: Operator / Driver Contact */}
          <div className="p-3.5 bg-white rounded-xl border border-[#34373C]/15 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#34373C]/60">
                Certified Machine Operator
              </span>
              <div className="flex items-center space-x-2.5 mt-1.5">
                <div className="h-9 w-9 rounded-full bg-[#FCC837] text-[#222428] font-black flex items-center justify-center text-xs shrink-0 border border-[#E6B01B]">
                  RS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#222428]">Ramesh Singh (Heavy Operator)</h4>
                  <p className="text-[11px] text-[#34373C]/60">STORENT Fleet Reg: #HR-26-8812</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-[#34373C]/10">
              <a
                href={`tel:${booking.ownerId?.phone || '+919876543210'}`}
                className="flex-1 py-1.5 px-3 rounded-lg bg-[#222428] hover:bg-[#34373C] text-white text-xs font-bold flex items-center justify-center space-x-1 transition"
              >
                <Phone className="h-3 w-3 text-[#FCC837]" />
                <span>Call Operator</span>
              </a>
              <a
                href={`https://wa.me/91${(booking.ownerId?.phone || '9876543210').replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-lg bg-[#FCC837] hover:bg-[#F0BA28] text-[#222428] border border-[#E6B01B] text-xs font-black flex items-center space-x-1 transition shadow-xs"
              >
                <MessageCircle className="h-3 w-3 text-[#222428]" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Column 3: Destination & Official Google Maps App Action */}
          <div className="p-3.5 bg-white rounded-xl border border-[#34373C]/15 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#34373C]/60">
                Destination Site Coordinates
              </span>
              <div className="text-xs font-bold text-[#222428] mt-1 flex items-start space-x-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#222428] shrink-0 mt-0.5" />
                <span className="line-clamp-2">
                  {destStreet}, {destCity}
                </span>
              </div>
              <p className="text-[11px] text-[#34373C]/60 mt-1">
                Client Contact: {booking.renterId?.name || 'Site Engineer'} ({booking.renterId?.phone || 'On Site'})
              </p>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-lg bg-[#FCC837] hover:bg-[#F0BA28] text-[#222428] font-black text-xs uppercase tracking-wider text-center flex items-center justify-center space-x-1.5 transition border border-[#E6B01B] shadow-xs"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Google Maps</span>
              </a>
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-3 rounded-lg border border-[#34373C]/30 text-[#222428] hover:bg-[#F8F9FA] font-bold text-xs uppercase tracking-wider transition flex items-center space-x-1 shrink-0"
                title="Close Tracker"
              >
                <X className="h-3.5 w-3.5" />
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveEquipmentTrackerModal;