import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState, useEffect } from 'react';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, Navigation, MapPin, Phone, User, Mail } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { api } from '../../lib/api';
import { useAppSelector } from '../../store/hooks';

// Fix missing marker icon issue in leaflet + react
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Modern pulsing truck icon for live driver tracking
const truckIcon = L.divIcon({
  className: '',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-12 h-12 bg-primary-500 rounded-full opacity-30 animate-ping"></div>
      <div class="absolute w-8 h-8 bg-primary-400 rounded-full opacity-50 animate-pulse"></div>
      <div class="relative text-3xl z-10 drop-shadow-lg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));">🚚</div>
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

// Premium Destination pin icon
const destIcon = L.divIcon({
  className: '',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-6 h-6 bg-red-500 rounded-full opacity-20 animate-pulse"></div>
      <div class="relative text-3xl z-10 drop-shadow-lg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));">📍</div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

// Helper component to auto-pan the map to fit both markers and calculate distance
function MapController({ driverLat, driverLng, destLat, destLng, onDistanceUpdate }: { driverLat?: number, driverLng?: number, destLat: number, destLng: number, onDistanceUpdate: (dist: number) => void }) {
  const map = useMap();

  useEffect(() => {
    if (driverLat && driverLng && destLat && destLng) {
      // Create bounds containing both markers
      const bounds = L.latLngBounds(
        [driverLat, driverLng],
        [destLat, destLng]
      );
      // Determine padding based on window size
      const padding = window.innerWidth < 768 ? [40, 40] as [number, number] : [80, 80] as [number, number];
      
      // Smoothly fly to fit bounds
      map.flyToBounds(bounds, {
        padding,
        duration: 1.5, // 1.5 seconds animation
        easeLinearity: 0.25
      });
      
      // Calculate real-world straight line distance in KM
      const dLat = L.latLng(driverLat, driverLng);
      const dDest = L.latLng(destLat, destLng);
      const distanceMeters = dLat.distanceTo(dDest);
      onDistanceUpdate(distanceMeters / 1000); // km
    }
  }, [driverLat, driverLng, destLat, destLng, map, onDistanceUpdate]);

  return null;
}

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();
  const [simulating, setSimulating] = useState(false);
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // ETA Calculation states
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const avgSpeedKmh = 40; // Simulated average speed

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await api.get(`/orders/${id}`);
      return res as unknown as any;
    },
    enabled: !!id,
    refetchInterval: 5000,   // poll every 5s for live driver location
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="h-4 bg-gray-200 w-24 mb-8 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 w-full mb-8 rounded-2xl animate-pulse"></div>
        <div className="h-96 bg-gray-200 w-full rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  if (!order) return <div className="text-center py-20 text-gray-500 font-medium">Order not found.</div>;

  const isFarmer = user?.role === 'FARMER';
  
  const timelineSteps = [
    { status: 'PENDING', label: 'Order Placed', icon: Package, defaultDesc: 'Your order has been received and verified.' },
    { status: 'PROCESSING', label: 'Processing', icon: Clock, defaultDesc: 'Seller is preparing your order for shipment.' },
    { status: 'SHIPPED', label: 'En Route', icon: Truck, defaultDesc: 'Driver is on the way with your delivery.' },
    { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle, defaultDesc: 'Order has been successfully delivered.' },
  ];

  const currentStatusIndex = timelineSteps.findIndex(s => s.status === order.status);

  // Destination coordinates (from checkout GPS)
  const destLat = order.shippingLat || order.buyer?.geoLat || 20.5937;
  const destLng = order.shippingLng || order.buyer?.geoLng || 78.9629;
  const hasDestCoordinates = !!(order.shippingLat && order.shippingLng) || !!(order.buyer?.geoLat && order.buyer?.geoLng);

  // Live driver coordinates
  const driverLat = order.driverLat;
  const driverLng = order.driverLng;
  const hasDriverLocation = !!(driverLat && driverLng);

  // Map center logic (Fallback if no auto-pan runs)
  const mapCenter: [number, number] = hasDriverLocation ? [driverLat, driverLng] : [destLat, destLng];

  // Simulate the driver moving toward destination
  const startSimulation = async () => {
    if (!id || simulating) return;
    setSimulating(true);
    // Start slightly offset from destination (approx 10km away)
    let curLat = destLat + 0.1;
    let curLng = destLng - 0.1;
    const steps = 60; // Slower, smoother simulation loop
    const dLat = (destLat - curLat) / steps;
    const dLng = (destLng - curLng) / steps;
    let step = 0;
    
    simIntervalRef.current = setInterval(async () => {
      if (step >= steps - 1) { // Stop right before exactly overlapping
        clearInterval(simIntervalRef.current!);
        setSimulating(false);
        return;
      }
      curLat += dLat;
      curLng += dLng;
      step++;
      try {
        await api.patch(`/orders/${id}/location`, { lat: curLat, lng: curLng });
        queryClient.invalidateQueries({ queryKey: ['order', id] });
      } catch (e) {
        clearInterval(simIntervalRef.current!);
        setSimulating(false);
      }
    }, 1000); // Poll every 1 second during simulation for silky smooth map panning
  };

  const stopSimulation = () => {
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    setSimulating(false);
  };

  // Helper for gradient badges
  const getStatusBadgeColors = (status: string) => {
    switch(status) {
      case 'DELIVERED': return 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-green-500/30';
      case 'SHIPPED': return 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-blue-500/30';
      case 'PROCESSING': return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-orange-500/30';
      default: return 'bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-gray-500/30';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-gray-50/50">
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <Link to="/dashboard/orders" className="flex items-center text-sm font-medium text-gray-500 hover:text-primary-600 mb-6 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Orders
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
              Order #{order.id.substring(0,8)}
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-1">
              Placed on {new Date(order.createdAt).toLocaleString(undefined, {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
          <motion.div 
             initial={{ scale: 0.9 }} animate={{ scale: 1 }}
             className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold shadow-lg ${getStatusBadgeColors(order.status)}`}
          >
            {order.status}
          </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Glassmorphic Timeline Element */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-white p-6 sm:p-10 relative overflow-hidden"
          >
            {/* Soft background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 rounded-full blur-3xl opacity-50 -z-10 mix-blend-multiply pointer-events-none"></div>

            <h2 className="text-xl font-bold text-gray-900 mb-10 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-primary-500" /> Live Tracking Status
            </h2>
            
            <div className="relative">
              {/* Vertical line connecting steps */}
              <div className="absolute left-6 md:left-[50%] top-4 bottom-4 w-1 flex justify-center transform md:-translate-x-1/2">
                <div className="w-full h-full bg-gray-100 rounded-full overflow-hidden">
                  {/* Active progress fill */}
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(currentStatusIndex / (timelineSteps.length - 1)) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="w-full bg-gradient-to-b from-primary-400 to-primary-600"
                  />
                </div>
              </div>
              
              <div className="space-y-12 md:space-y-16 relative z-10">
                {timelineSteps.map((step, idx) => {
                  const isCompleted = currentStatusIndex >= idx;
                  const isCurrent = currentStatusIndex === idx;
                  const Icon = step.icon;
                  const event = order.deliveryEvents?.find((e: any) => e.status === step.status);

                  return (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + (idx * 0.1) }}
                      className={`relative flex items-center md:grid md:grid-cols-2 gap-6 md:gap-12 md:min-h-[72px] ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}
                    >
                      {/* Left side content (desktop only) */}
                      <div className="hidden md:flex flex-col justify-end text-right py-2">
                        {event && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <h4 className="text-base font-bold text-gray-900">{step.label}</h4>
                            <p className="text-sm font-medium text-gray-500 mt-0.5">{new Date(event.createdAt).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-400">{new Date(event.createdAt).toLocaleTimeString()}</p>
                          </motion.div>
                        )}
                      </div>

                      {/* Timeline Icon Node */}
                      <div className="absolute left-0 md:left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                        <div className="relative">
                          {/* Pulsing ring for current step */}
                          {isCurrent && order.status !== 'DELIVERED' && (
                            <div className="absolute inset-0 bg-primary-400 rounded-full animate-ping opacity-30 scale-150"></div>
                          )}
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-4 border-white shadow-md relative z-10 transition-colors duration-500 ${
                            isCompleted 
                              ? 'bg-gradient-to-br from-primary-500 to-indigo-600 text-white shadow-primary-500/40' 
                              : 'bg-gray-100 text-gray-300 shadow-sm'
                          }`}>
                            <Icon className="w-6 h-6" />
                          </div>
                        </div>
                      </div>

                      {/* Right side content */}
                      <div className="pl-20 md:pl-0 flex flex-col justify-center min-h-[56px] py-2">
                        <h4 className={`text-lg font-bold md:hidden ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</h4>
                        {event ? (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <p className="text-sm md:text-base font-semibold text-gray-700 mt-1">{event.location || (isCurrent ? 'Current Location' : '')}</p>
                            <p className="text-sm text-gray-500 leading-snug max-w-xs mt-1">{event.description || (isCurrent && order.status === 'SHIPPED' ? 'Driver is on the way with your order.' : '')}</p>
                            <div className="md:hidden mt-2 flex gap-2 text-xs font-medium text-gray-400">
                               <span>{new Date(event.createdAt).toLocaleDateString()}</span>
                               <span>{new Date(event.createdAt).toLocaleTimeString()}</span>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            {isCompleted ? (
                              <p className={`text-sm font-medium mt-1 hidden md:block ${isCurrent ? 'text-primary-600' : 'text-gray-400'}`}>
                                {step.defaultDesc}
                              </p>
                            ) : null}
                          </motion.div>
                        )}
                        {isCurrent && order.status !== 'DELIVERED' && (
                          <span className="inline-flex mt-3 shadow-sm items-center px-2.5 py-1 rounded-full text-xs font-bold w-fit bg-primary-50 text-primary-700 animate-pulse border border-primary-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-2"></span> Active Stage
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Ordered Items Glass Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden relative"
          >
             <div className="px-8 py-5 border-b border-gray-100 bg-white/50 backdrop-blur-sm z-10 relative">
                <h2 className="text-lg font-bold text-gray-900">Package Contents</h2>
             </div>
             <ul className="divide-y divide-gray-50 bg-white/40">
                {order.items.map((item: any, i: number) => {
                  let quantity, unit, name, image;
                  if (item.type === 'CROP') {
                    quantity = item.quantityKg; unit = 'kg'; name = item.crop?.name || 'Unknown Crop'; image = item.crop?.images?.[0];
                  } else {
                    quantity = item.quantityUnits; unit = 'pcs'; name = item.product?.name || 'Store Product'; image = item.product?.images?.[0];
                  }
                  
                  return (
                    <motion.li 
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + (i * 0.1) }}
                      key={item.id} className="p-6 sm:px-8 flex flex-col sm:flex-row gap-6 hover:bg-gray-50/50 transition-colors"
                    >
                       <div className="relative">
                         <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-md shadow-gray-200 ring-1 ring-gray-900/5">
                           <img src={image || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&h=200&fit=crop'} className="w-full h-full object-cover" alt={name} />
                         </div>
                         <div className="absolute -bottom-2 -right-2 bg-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm border border-gray-100">
                           {quantity}{unit}
                         </div>
                       </div>
                       <div className="flex-1 flex flex-col justify-center">
                         <h3 className="text-lg font-bold text-gray-900">{name}</h3>
                         <span className="inline-flex w-fit items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 mt-1 mb-3">
                           {item.type === 'CROP' ? 'Farm Produce' : 'Farming Supply'}
                         </span>
                         <div className="flex items-end justify-between mt-auto">
                           <p className="text-sm font-medium text-gray-500">
                             ₹{item.unitPrice.toFixed(2)} <span className="text-xs">/ {unit}</span>
                           </p>
                           <p className="text-lg font-extrabold text-gray-900">
                             ₹{item.totalPrice.toFixed(2)}
                           </p>
                         </div>
                       </div>
                    </motion.li>
                  );
                })}
             </ul>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Advanced Live Map Card (Always visible if coordinate exist, previously only Farmer) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white rounded-3xl shadow-2xl shadow-gray-300/60 border border-gray-100 overflow-hidden sticky top-8"
          >
              <div className="px-6 py-4 border-b border-gray-100 bg-white/90 backdrop-blur-md flex justify-between items-center z-10 relative">
                 <h2 className="text-base font-bold text-gray-900 flex items-center">
                   <Navigation className="w-4 h-4 mr-2 text-indigo-500" /> Live GPS Map
                 </h2>
                 <AnimatePresence mode="wait">
                   {hasDriverLocation ? (
                     <motion.span 
                       initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                       className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 shadow-sm"
                     >
                       <span className="relative flex h-2 w-2">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                       </span>
                       Signal Active
                     </motion.span>
                   ) : (
                     <motion.span 
                       initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                       className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-500"
                     >
                       Waiting for signal
                     </motion.span>
                   )}
                 </AnimatePresence>
              </div>

              {/* Stats Overlay widget inside map container */}
              <div className="h-[340px] w-full relative bg-gray-50">
                {hasDriverLocation && (
                  <div className="absolute top-4 left-4 z-[400] bg-white/80 backdrop-blur-lg border border-white p-3 rounded-2xl shadow-lg shadow-gray-900/10">
                    <div className="flex gap-4">
                      <div>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Distance</p>
                         <p className="text-sm font-extrabold text-gray-900">{distanceKm < 0.1 ? 'Arriving' : `${distanceKm.toFixed(1)} km`}</p>
                      </div>
                      <div className="w-px bg-gray-200"></div>
                      <div>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Est. Arrival</p>
                         <p className="text-sm font-extrabold text-indigo-600">
                           {distanceKm < 0.1 ? 'Now' : `${Math.ceil((distanceKm / avgSpeedKmh) * 60)} min`}
                         </p>
                      </div>
                    </div>
                  </div>
                )}

                <MapContainer 
                  center={mapCenter} 
                  zoom={hasDriverLocation ? 13 : (hasDestCoordinates ? 14 : 5)} 
                  scrollWheelZoom={false} 
                  className="h-full w-full z-0"
                  zoomControl={false} // Clean UI
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" // Modern premium map tiles
                  />
                  
                  {/* Map Controller for auto-pan bounding box */}
                  <MapController 
                    driverLat={driverLat} driverLng={driverLng} 
                    destLat={destLat} destLng={destLng}
                    onDistanceUpdate={setDistanceKm}
                  />

                  {/* Destination marker */}
                  {hasDestCoordinates && (
                    <Marker position={[destLat, destLng]} icon={destIcon}>
                      <Popup className="rounded-xl overflow-hidden shadow-xl border-none">
                        <div className="p-1">
                          <strong className="block text-sm font-bold text-gray-900 mb-1">Destination Info</strong>
                          <p className="text-xs text-gray-600">{order.shippingAddressLine1}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{order.shippingDistrict}, {order.shippingState}</p>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Animated Route Line */}
                  {hasDriverLocation && hasDestCoordinates && (
                    // We draw a dashed curved line connecting truck and dest
                    <Polyline 
                      positions={[[driverLat, driverLng], [destLat, destLng]]}
                      pathOptions={{ 
                        color: '#4f46e5', // indigo-600
                        weight: 4, 
                        dashArray: '10, 15', 
                        lineCap: 'round',
                        lineJoin: 'round',
                        className: 'animate-dash' // CSS animation for moving dashes
                      }} 
                    />
                  )}

                  {/* Driver live position marker */}
                  {hasDriverLocation && (
                    <Marker position={[driverLat, driverLng]} icon={truckIcon}>
                      <Popup className="rounded-xl">
                        <strong className="block text-sm font-bold text-indigo-600 mb-1">Live Location</strong>
                        <p className="text-xs text-gray-600">Updated seconds ago</p>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
              
              <div className="p-5 bg-white border-t border-gray-100 z-10 relative">
                 <div className="flex flex-col gap-3">
                   {/* Direction Button */}
                   <a 
                     href={`https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`} 
                     target="_blank" 
                     rel="noreferrer"
                     className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-2.5 px-4 rounded-xl flex justify-center items-center transition-colors border border-gray-200"
                   >
                     <Navigation className="w-4 h-4 mr-2" /> Open in Google Maps
                   </a>
                   
                   {/* Simulate Button (Farmers/Admins) */}
                   {isFarmer && order.status !== 'DELIVERED' && (
                     <button
                       onClick={simulating ? stopSimulation : startSimulation}
                       className={`w-full font-bold py-2.5 px-4 rounded-xl flex justify-center items-center transition-all shadow-md active:scale-95 ${
                         simulating 
                           ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 shadow-rose-200/50' 
                           : 'bg-gradient-to-r from-primary-500 to-indigo-600 text-white shadow-primary-500/30 hover:shadow-primary-600/50 hover:opacity-90'
                       }`}
                     >
                       <Truck className={`w-4 h-4 mr-2 ${simulating ? '' : 'animate-bounce'}`} />
                       {simulating ? 'Stop Live Feed' : 'Start Simulation'}
                     </button>
                   )}
                 </div>
              </div>
          </motion.div>

          {/* Delivery & Payment Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 p-6 sm:p-8"
          >
            <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">Details</h3>
            
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Shipping To</p>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="font-bold text-gray-900">{order.buyer?.name || 'Customer'}</p>
                  <p className="text-sm font-medium text-gray-600 mt-1">{order.shippingAddressLine1 || order.deliveryAddress}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{order.shippingDistrict}{order.shippingState ? `, ${order.shippingState}` : ''} {order.shippingPincode}</p>
                  {order.buyer?.phone && (
                    <a href={`tel:${order.buyer.phone}`} className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-primary-600 hover:text-primary-700">
                      <Phone className="w-3.5 h-3.5" /> {order.buyer.phone}
                    </a>
                  )}
                </div>
              </div>

              {/* Dual Contact Information - Farmer and Buyer */}
              <div className="space-y-6">
                {/* Farmer Contact Card */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">🌿 Farmer Summary</p>
                  <div className={`rounded-2xl p-4 border transition-all ${isFarmer ? 'bg-emerald-50/40 border-emerald-100/50' : 'bg-gradient-to-br from-emerald-50/80 to-green-50/80 border-emerald-100/80 shadow-sm hover:shadow-md'}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${isFarmer ? 'bg-emerald-400 shadow-emerald-400/20' : 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-500/20'}`}>
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{order.farmer?.name || 'Farmer'}</p>
                        <p className="text-xs text-emerald-600 font-bold">{isFarmer ? 'You (Seller)' : 'Seller'}</p>
                      </div>
                    </div>
                    {order.farmer?.phone && (
                      <a href={`tel:${order.farmer.phone}`} className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50 transition-all mb-2 group shadow-sm">
                        <Phone className="w-4 h-4 text-emerald-600 group-hover:animate-pulse" />
                        <span className="text-sm font-bold text-gray-900 tracking-tight">{order.farmer.phone}</span>
                        <span className="ml-auto text-[10px] font-black uppercase text-emerald-600 tracking-wider">Call</span>
                      </a>
                    )}
                    {order.farmer?.email && (
                      <a href={`mailto:${order.farmer.email}`} className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50 transition-all group shadow-sm">
                        <Mail className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-gray-700 truncate">{order.farmer.email}</span>
                        <span className="ml-auto text-[10px] font-black uppercase text-emerald-600 tracking-wider">Email</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Buyer Contact Card */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">🛒 Buyer Summary</p>
                  <div className={`rounded-2xl p-4 border transition-all ${!isFarmer ? 'bg-indigo-50/40 border-indigo-100/50' : 'bg-gradient-to-br from-indigo-50/80 to-blue-50/80 border-indigo-100/80 shadow-sm hover:shadow-md'}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${!isFarmer ? 'bg-indigo-400 shadow-indigo-400/20' : 'bg-gradient-to-br from-indigo-500 to-blue-600 shadow-indigo-500/20'}`}>
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{order.buyer?.name || 'Buyer'}</p>
                        <p className="text-xs text-indigo-600 font-bold">{!isFarmer ? 'You (Buyer)' : 'Customer'}</p>
                      </div>
                    </div>
                    {order.buyer?.phone && (
                      <a href={`tel:${order.buyer.phone}`} className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 border border-gray-100 hover:border-indigo-300 hover:bg-indigo-50 transition-all mb-2 group shadow-sm">
                        <Phone className="w-4 h-4 text-indigo-600 group-hover:animate-pulse" />
                        <span className="text-sm font-bold text-gray-900 tracking-tight">{order.buyer.phone}</span>
                        <span className="ml-auto text-[10px] font-black uppercase text-indigo-600 tracking-wider">Call</span>
                      </a>
                    )}
                    {order.buyer?.email && (
                      <a href={`mailto:${order.buyer.email}`} className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 border border-gray-100 hover:border-indigo-300 hover:bg-indigo-50 transition-all group shadow-sm">
                        <Mail className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm font-medium text-gray-700 truncate">{order.buyer.email}</span>
                        <span className="ml-auto text-[10px] font-black uppercase text-indigo-600 tracking-wider">Email</span>
                      </a>
                    )}
                    {order.buyer?.address && (
                      <p className="text-[11px] text-gray-500 mt-3 flex items-start gap-1.5 leading-relaxed bg-white/50 p-2 rounded-lg border border-gray-100">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 text-gray-400 flex-shrink-0" />
                        {order.buyer.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Amount</p>
                 <div className="flex justify-between items-baseline">
                   <span className="text-sm font-bold text-gray-500">Paid via UPI</span>
                   <span className="text-2xl font-black text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                     ₹{order.totalAmount.toFixed(2)}
                   </span>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Put custom CSS in this component for the animated dash line */}
      <style dangerouslySetInnerHTML={{__html: `
        .animate-dash {
          animation: map-dash 1.5s linear infinite;
        }
        @keyframes map-dash {
          to { stroke-dashoffset: -25; }
        }
      `}} />
    </div>
  );
}

