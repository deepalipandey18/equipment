import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  Truck,
  MapPin,
  IndianRupee,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Loader2,
  Navigation,
  ArrowRight,
  ArrowLeft,
  Camera,
  Layers,
  FileText,
  Crown,
  Sparkles,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const photoCategories = [
  'All',
  'Earthmoving',
  'Lifting & Cranes',
  'Hauling & Trucks',
  'Concrete',
  'Road & Compaction',
  'Material Handling',
  'Access & Aerial',
  'Power & Towing',
];

const sampleMachineryPhotos = [
  {
    id: 'jcb-3dx',
    name: 'JCB 3DX Backhoe Loader',
    category: 'Earthmoving',
    badge: 'Most Popular',
    url: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'heavy-excavator',
    name: 'Heavy Hydraulic Excavator (CAT/Komatsu)',
    category: 'Earthmoving',
    badge: 'Heavy Duty',
    url: 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'crawler-excavator',
    name: 'Crawler Track Excavator 20-Ton',
    category: 'Earthmoving',
    badge: 'CPCB IV+',
    url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'crawler-bulldozer',
    name: 'Caterpillar D6 Heavy Bulldozer',
    category: 'Earthmoving',
    badge: 'Grading Pro',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'wheel-loader',
    name: 'Front-End Wheel Loader / Payloader',
    category: 'Earthmoving',
    badge: 'Fast Cycle',
    url: 'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'mobile-crane',
    name: 'Hydraulic Mobile Telescopic Crane 40T',
    category: 'Lifting & Cranes',
    badge: 'Certified',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'tower-crane',
    name: 'High-Rise Construction Tower Crane',
    category: 'Lifting & Cranes',
    badge: 'Skyline Lift',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'dump-truck',
    name: 'Multi-Axle Heavy Dump Tipper 16m³',
    category: 'Hauling & Trucks',
    badge: 'High Payload',
    url: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'mining-dumper',
    name: 'Off-Highway Heavy Mining Haul Truck',
    category: 'Hauling & Trucks',
    badge: 'Mega Fleet',
    url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'concrete-mixer',
    name: 'Transit Concrete RMC Drum Mixer 7m³',
    category: 'Concrete',
    badge: 'Batching',
    url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'road-roller',
    name: 'Vibratory Soil Compactor / Road Roller',
    category: 'Road & Compaction',
    badge: 'Paving Pro',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'motor-grader',
    name: 'Precision Road Leveling Motor Grader',
    category: 'Road & Compaction',
    badge: 'Grade Master',
    url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'asphalt-paver',
    name: 'Tracked Bitumen Asphalt Paver',
    category: 'Road & Compaction',
    badge: 'Highway Spec',
    url: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'forklift',
    name: 'Industrial Heavy Diesel Forklift 5-Ton',
    category: 'Material Handling',
    badge: 'Yard Pro',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'telehandler',
    name: 'All-Terrain Reach Telehandler 17m',
    category: 'Material Handling',
    badge: 'Multi-Reach',
    url: 'https://images.unsplash.com/photo-1586528116493-a029325540fa?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'skid-steer',
    name: 'Compact Skid Steer Loader (Bobcat)',
    category: 'Material Handling',
    badge: 'Agile 360°',
    url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'boom-lift',
    name: 'Articulated Hydraulic Aerial Boom Lift',
    category: 'Access & Aerial',
    badge: 'Aerial 28m',
    url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'scissor-lift',
    name: 'Self-Propelled Rough Terrain Scissor Lift',
    category: 'Access & Aerial',
    badge: 'Platform Access',
    url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'heavy-tractor',
    name: '4WD Heavy Haulage / Site Tractor',
    category: 'Power & Towing',
    badge: 'High Torque',
    url: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'silent-generator',
    name: 'Acoustic Silent Diesel Generator 125 kVA',
    category: 'Power & Towing',
    badge: 'Site Power',
    url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'lighting-tower',
    name: 'Mobile High-Mast LED Lighting Tower',
    category: 'Power & Towing',
    badge: 'Night Shift',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&auto=format&fit=crop&q=80',
  },
];

const RegisterEquipmentPage = () => {
  const { user, hasActiveSubscription, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [checkingQuota, setCheckingQuota] = useState(true);
  const [quotaInfo, setQuotaInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [locating, setLocating] = useState(false);
  const [photoCategoryFilter, setPhotoCategoryFilter] = useState('All');
  const scrollGalleryRef = useRef(null);

  const scrollGallery = (direction) => {
    if (scrollGalleryRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollGalleryRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const filteredPhotos =
    photoCategoryFilter === 'All'
      ? sampleMachineryPhotos
      : sampleMachineryPhotos.filter((p) => p.category === photoCategoryFilter);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Basic
    name: '',
    categoryId: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    condition: 'good',
    description: '',

    // Step 2: Rates & Terms
    dailyRate: '',
    hourlyRate: '',
    monthlyRate: '',
    securityDeposit: '',
    deliveryCharges: '',
    operatorOption: 'optional',
    minRentalDurationDays: 1,

    // Step 3: Location (Pre-filled by default, fully editable)
    address: {
      street: 'Plot 42, Sector 37 Industrial Area, Pace City',
      area: 'Sector 37 Industrial Corridor',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
      landmark: 'Near Hero Honda Chowk Yard',
    },
    coordinates: [77.0878, 28.4595], // Default [lng, lat] Delhi-NCR
    locationSource: 'gps',
    deliveryRadiusKm: 50,

    // Step 4: Media & Specs
    photos: [sampleMachineryPhotos[0].url],
    serialNumber: '',
  });

  // Verify Subscription and Quota on mount
  useEffect(() => {
    const verifyQuota = async () => {
      try {
        const res = await api.get('/subscriptions/check-quota');
        if (res.data?.success) {
          setQuotaInfo(res.data.quota);
          if (!res.data.quota.allowed) {
            navigate('/plans?reason=subscription_required');
          }
        }
      } catch (err) {
        console.warn('Quota check error:', err);
        if (!hasActiveSubscription) {
          navigate('/plans?reason=subscription_required');
        }
      } finally {
        setCheckingQuota(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data?.success && res.data.data.length > 0) {
          setCategories(res.data.data);
          setFormData((prev) => ({
            ...prev,
            categoryId: res.data.data[0]._id,
          }));
        }
      } catch (err) {
        console.warn('Categories fetch error:', err);
      }
    };

    verifyQuota();
    fetchCategories();
  }, [hasActiveSubscription, navigate]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  // Browser Geolocation API + Reverse Geocoding
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lng = Number(position.coords.longitude.toFixed(6));
        const lat = Number(position.coords.latitude.toFixed(6));
        setFormData((prev) => ({
          ...prev,
          coordinates: [lng, lat],
          locationSource: 'gps',
        }));

        // Attempt reverse-geocoding to automatically update address from device location
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          if (res.ok) {
            const data = await res.json();
            if (data?.address) {
              const a = data.address;
              const detectedStreet = [a.road, a.suburb || a.neighbourhood].filter(Boolean).join(', ');
              const detectedArea = a.suburb || a.neighbourhood || a.county || '';
              const detectedCity = a.city || a.town || a.village || a.state_district || 'Gurugram';
              const detectedState = a.state || 'Haryana';
              const detectedPin = a.postcode || '122002';

              setFormData((prev) => ({
                ...prev,
                coordinates: [lng, lat],
                locationSource: 'gps',
                address: {
                  ...prev.address,
                  street: detectedStreet || prev.address.street,
                  area: detectedArea || prev.address.area,
                  city: detectedCity,
                  state: detectedState,
                  pincode: detectedPin,
                },
              }));
            }
          }
        } catch (geoErr) {
          console.warn('Reverse geocoding warning:', geoErr);
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        setLocating(false);
        alert(`Location permission denied or unavailable: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCoordinateChange = (index, value) => {
    const num = parseFloat(value);
    setFormData((prev) => {
      const coords = [...prev.coordinates];
      coords[index] = isNaN(num) ? value : num;
      return {
        ...prev,
        coordinates: coords,
        locationSource: 'manual',
      };
    });
  };

  const handleResetLocationDefaults = () => {
    setFormData((prev) => ({
      ...prev,
      address: {
        street: 'Plot 42, Sector 37 Industrial Area, Pace City',
        area: 'Sector 37 Industrial Corridor',
        city: 'Gurugram',
        state: 'Haryana',
        pincode: '122002',
        landmark: 'Near Hero Honda Chowk Yard',
      },
      coordinates: [77.0878, 28.4595],
      deliveryRadiusKm: 50,
      locationSource: 'gps',
    }));
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (step === 1) {
      if (!formData.name || !formData.categoryId || !formData.brand || !formData.model) {
        setErrorMessage('Please fill in all basic equipment details.');
        return;
      }
      if (formData.description.length < 20) {
        setErrorMessage('Description must be at least 20 characters long.');
        return;
      }
    }

    if (step === 2) {
      if (!formData.dailyRate || Number(formData.dailyRate) < 100) {
        setErrorMessage('Daily rental rate is required and must be at least ₹100.');
        return;
      }
    }

    if (step === 3) {
      if (!formData.address.city || !formData.address.state || !formData.address.pincode) {
        setErrorMessage('City, State, and Pincode are required.');
        return;
      }
      if (!formData.coordinates || formData.coordinates.length !== 2) {
        setErrorMessage('GPS coordinates are required for geospatial discovery.');
        return;
      }
    }

    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setErrorMessage('');
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      const res = await api.post('/equipment', formData);
      if (res.data?.success) {
        await refreshUser();
        setSuccessData(res.data.data);
      } else {
        throw new Error(res.data?.message || 'Failed to register machinery.');
      }
    } catch (err) {
      setErrorMessage(
        err.userMessage || err.response?.data?.message || err.message || 'Registration failed.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingQuota) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        <p className="text-sm text-slate-500 font-medium">Verifying subscription listing quota...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Register Equipment for Rent
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                List your machinery on India's network with verified rates and GPS discovery.
              </p>
            </div>

            {quotaInfo && (
              <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-lg text-emerald-800 text-xs font-medium self-start sm:self-auto">
                <Crown className="h-4 w-4 text-amber-500" />
                <span>
                  Quota: <strong>{quotaInfo.remaining}</strong> listings remaining on {quotaInfo.planName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Step Indicator */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8">
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
            {[
              { num: 1, label: 'Basic Info', icon: Layers },
              { num: 2, label: 'Pricing & Terms', icon: IndianRupee },
              { num: 3, label: 'Location & GPS', icon: MapPin },
              { num: 4, label: 'Photos & Specs', icon: Camera },
            ].map((s) => {
              const Icon = s.icon;
              const isCurrent = step === s.num;
              const isPassed = step > s.num;
              return (
                <div
                  key={s.num}
                  className={`flex items-center justify-center space-x-1.5 py-2 px-1 rounded-lg transition ${
                    isCurrent
                      ? 'bg-brand-50 text-brand-700 border border-brand-200'
                      : isPassed
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-slate-400'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden sm:inline">
                    Step {s.num}: {s.label}
                  </span>
                  <span className="sm:hidden">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Multi-step Form Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm">
          <form onSubmit={step === 4 ? handleSubmit : handleNextStep}>
            {/* STEP 1: Basic Machine Info */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Step 1: Machinery Specifications
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Equipment Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. JCB 3DX Super Backhoe Loader"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Category *
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => handleInputChange('categoryId', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-500 outline-none bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Condition *
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) => handleInputChange('condition', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-500 outline-none bg-white"
                    >
                      <option value="excellent">Excellent (Like New, Low Hours)</option>
                      <option value="good">Good (Well Maintained, Regularly Serviced)</option>
                      <option value="fair">Fair (Fully Functional)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Manufacturer Brand *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. JCB, Caterpillar, Tata Hitachi"
                      value={formData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Model Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 3DX Plus, 320D2"
                      value={formData.model}
                      onChange={(e) => handleInputChange('model', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Manufacturing Year
                    </label>
                    <input
                      type="number"
                      min="1990"
                      max={new Date().getFullYear() + 1}
                      value={formData.year}
                      onChange={(e) => handleInputChange('year', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-500 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Description & Work Capability * (Min 20 characters)
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Specify operating weight, bucket capacity, recent servicing, attachments included..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Pricing & Operator */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Step 2: Rental Rates & Terms
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Daily Rate (₹) *
                    </label>
                    <div className="relative">
                      <IndianRupee className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="number"
                        required
                        min="100"
                        placeholder="e.g. 8500"
                        value={formData.dailyRate}
                        onChange={(e) => handleInputChange('dailyRate', e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Hourly Rate (₹) (Optional)
                    </label>
                    <div className="relative">
                      <IndianRupee className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 1200"
                        value={formData.hourlyRate}
                        onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Monthly Rate (₹) (Optional)
                    </label>
                    <div className="relative">
                      <IndianRupee className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 180000"
                        value={formData.monthlyRate}
                        onChange={(e) => handleInputChange('monthlyRate', e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Security Deposit (₹)
                    </label>
                    <div className="relative">
                      <IndianRupee className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 20000"
                        value={formData.securityDeposit}
                        onChange={(e) => handleInputChange('securityDeposit', e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Transport / Delivery Charges (₹)
                    </label>
                    <div className="relative">
                      <IndianRupee className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 3500 (or 0 if pickup)"
                        value={formData.deliveryCharges}
                        onChange={(e) => handleInputChange('deliveryCharges', e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Operator Option *
                    </label>
                    <select
                      value={formData.operatorOption}
                      onChange={(e) => handleInputChange('operatorOption', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-500 outline-none bg-white"
                    >
                      <option value="included">Operator Included in Rate</option>
                      <option value="optional">Operator Available at Extra Cost</option>
                      <option value="not_included">No Operator (Dry Hire Only)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Location & Coordinates */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Step 3: Yard Location & Geospatial Radar
                    </h2>
                    <p className="text-xs text-slate-500">
                      Used for MongoDB 2dsphere proximity search so nearby contractors find your machine.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={handleResetLocationDefaults}
                      title="Reset to recommended default yard values"
                      className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Reset Defaults</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      disabled={locating}
                      className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-brand-50 border border-brand-300 text-brand-800 text-xs font-bold uppercase tracking-wider hover:bg-brand-100 transition shadow-sm"
                    >
                      <Navigation className={`h-3.5 w-3.5 ${locating ? 'animate-spin' : ''}`} />
                      <span>{locating ? 'Detecting GPS...' : 'Use Current Device GPS'}</span>
                    </button>
                  </div>
                </div>

                {/* Auto-filled Notification Banner */}
                <div className="flex items-start sm:items-center justify-between p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 gap-3">
                  <div className="flex items-center space-x-2.5">
                    <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>All location and GPS fields are pre-filled automatically!</strong> You can proceed directly or edit any field below.
                    </span>
                  </div>
                  <span className="hidden sm:inline-block shrink-0 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-semibold text-[11px] rounded-full border border-emerald-300">
                    Ready to Next
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Yard / Plot Street Address
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Plot 42, Sector 37 Industrial Area, Pace City"
                      value={formData.address.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Area / Industrial Zone
                    </label>
                    <input
                      type="text"
                      placeholder="Sector 37 Industrial Corridor"
                      value={formData.address.area}
                      onChange={(e) => handleAddressChange('area', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Landmark / Nearby Hub
                    </label>
                    <input
                      type="text"
                      placeholder="Near Hero Honda Chowk Yard"
                      value={formData.address.landmark}
                      onChange={(e) => handleAddressChange('landmark', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Gurugram"
                      value={formData.address.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Haryana"
                      value={formData.address.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Postal Code / PIN *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="122002"
                      value={formData.address.pincode}
                      onChange={(e) => handleAddressChange('pincode', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Delivery Radius (km)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.deliveryRadiusKm}
                      onChange={(e) => handleInputChange('deliveryRadiusKm', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-500 outline-none"
                    />
                  </div>

                  {/* Manual Coordinates Tuning */}
                  <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Latitude (° N)
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={formData.coordinates[1]}
                        onChange={(e) => handleCoordinateChange(1, e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-500 outline-none bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Longitude (° E)
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={formData.coordinates[0]}
                        onChange={(e) => handleCoordinateChange(0, e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-500 outline-none bg-white font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 pt-2 border-t border-slate-200/60">
                      <div className="flex items-center space-x-2 text-slate-600">
                        <MapPin className="h-4 w-4 text-brand-600 shrink-0" />
                        <span>
                          GeoJSON Index: <strong>[{formData.coordinates[0]}, {formData.coordinates[1]}]</strong> [lng, lat]
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 self-start sm:self-auto">
                        2dsphere Proximity Radar Ready
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Photos, Serial & Review */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-lg font-bold text-slate-900">
                    Step 4: Machine Photos & Final Review
                  </h2>
                  <p className="text-xs text-slate-500">
                    Choose from comprehensive machinery photo presets or provide a custom image URL.
                  </p>
                </div>

                <div>
                  {/* Gallery Header & Navigation Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                        Select Machinery Preset ({filteredPhotos.length} Available)
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Scroll horizontally to browse all machinery types (JCB, Excavators, Cranes, Rollers, Trucks, DG Sets).
                      </p>
                    </div>

                    {/* Scroll Buttons */}
                    <div className="flex items-center space-x-1.5 self-start sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => scrollGallery('left')}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition shadow-xs flex items-center justify-center hover:border-slate-300"
                        title="Scroll Left"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollGallery('right')}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition shadow-xs flex items-center justify-center hover:border-slate-300"
                        title="Scroll Right"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center space-x-1.5 overflow-x-auto pb-2.5 scrollbar-none mb-2">
                    {photoCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setPhotoCategoryFilter(cat)}
                        className={`text-xs px-3 py-1 rounded-full whitespace-nowrap font-medium transition ${
                          photoCategoryFilter === cat
                            ? 'bg-brand-600 text-white shadow-xs font-semibold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Horizontally Scrollable Machinery Strip */}
                  <div
                    ref={scrollGalleryRef}
                    className="flex space-x-3.5 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x snap-mandatory focus:outline-none"
                    style={{ scrollbarWidth: 'thin' }}
                  >
                    {filteredPhotos.map((photo) => {
                      const isSelected = formData.photos[0] === photo.url;
                      return (
                        <div
                          key={photo.id}
                          onClick={() => handleInputChange('photos', [photo.url])}
                          className={`group cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200 snap-start shrink-0 w-60 sm:w-64 bg-white flex flex-col ${
                            isSelected
                              ? 'border-brand-600 ring-2 ring-brand-500/30 shadow-md scale-[1.01]'
                              : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                          }`}
                        >
                          <div className="relative h-32 sm:h-36 w-full bg-slate-100 overflow-hidden">
                            <img
                              src={photo.url}
                              alt={photo.name}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                            {/* Badges */}
                            <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                              <span className="text-[10px] font-semibold bg-black/65 backdrop-blur-xs text-white px-2 py-0.5 rounded-full">
                                {photo.category}
                              </span>
                              {photo.badge && (
                                <span className="text-[9px] font-bold bg-amber-500/90 text-white px-1.5 py-0.2 rounded">
                                  {photo.badge}
                                </span>
                              )}
                            </div>

                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-brand-600 text-white p-1 rounded-full shadow-md animate-in fade-in">
                                <CheckCircle className="h-4 w-4 fill-white text-brand-600" />
                              </div>
                            )}
                          </div>

                          <div
                            className={`p-2.5 text-xs text-center truncate ${
                              isSelected
                                ? 'bg-brand-50/80 text-brand-900 font-bold'
                                : 'text-slate-800 font-semibold'
                            }`}
                          >
                            {photo.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Custom Photo URL Input */}
                  <div className="mt-3">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Or paste a custom machinery photo URL:
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/my-machinery-image.jpg"
                      value={formData.photos[0]}
                      onChange={(e) => handleInputChange('photos', [e.target.value])}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:border-brand-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Chassis / Serial Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. JCB-IND-2023-88912"
                    value={formData.serialNumber}
                    onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-500 outline-none"
                  />
                </div>

                {/* Summary Card with Image Preview */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
                  <div className="font-bold text-slate-900 text-sm pb-1.5 border-b border-slate-200 flex items-center justify-between">
                    <span>Listing Summary & Verification</span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Ready to Publish
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Selected Machinery Image Preview */}
                    <div className="sm:col-span-1 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs">
                      <div className="relative h-32 sm:h-full min-h-[120px] w-full bg-slate-100">
                        <img
                          src={formData.photos[0] || sampleMachineryPhotos[0].url}
                          alt="Selected Machinery Preview"
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute bottom-2 left-2 text-[9px] font-bold bg-black/70 backdrop-blur-xs text-white px-2 py-0.5 rounded-md">
                          Selected Machinery
                        </span>
                      </div>
                    </div>

                    {/* Details list */}
                    <div className="sm:col-span-2 grid grid-cols-2 gap-2.5 text-slate-600">
                      <div>
                        <strong>Equipment:</strong> {formData.name || 'Unnamed Machine'}
                      </div>
                      <div>
                        <strong>Make & Model:</strong> {formData.brand} {formData.model}
                      </div>
                      <div>
                        <strong>Daily Rental Rate:</strong> ₹{formData.dailyRate}
                      </div>
                      <div>
                        <strong>City & State:</strong> {formData.address.city}, {formData.address.state}
                      </div>
                      <div>
                        <strong>Yard Address:</strong>{' '}
                        {formData.address.street || `${formData.address.city}, ${formData.address.state}`}
                      </div>
                      <div>
                        <strong>Operator Option:</strong> {formData.operatorOption}
                      </div>
                      <div>
                        <strong>Delivery Radius:</strong> {formData.deliveryRadiusKm} km
                      </div>
                      <div>
                        <strong>GPS Coordinates:</strong> [{formData.coordinates.join(', ')}]
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step Navigation Buttons */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Previous Step</span>
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-xs font-bold uppercase tracking-wider text-white shadow-sm flex items-center space-x-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-emerald-600/30 flex items-center space-x-2 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Publishing Listing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Publish Equipment Listing</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Success Modal */}
        {successData && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl text-center border border-slate-200">
              <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Equipment Listed Successfully!</h3>
              <p className="text-xs text-slate-600 mt-2">
                Your <strong>{successData.name}</strong> is now live on the EquipmentHub network and ready to receive rental bookings from nearby contractors.
              </p>

              <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 text-left space-y-1">
                <div>
                  <strong>Daily Rate:</strong> ₹{successData.dailyRate}
                </div>
                <div>
                  <strong>Location:</strong> {successData.address?.city}, {successData.address?.state}
                </div>
                <div>
                  <strong>Status:</strong>{' '}
                  <span className="text-emerald-700 font-bold uppercase">
                    {successData.approvalStatus}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-col space-y-2">
                <Link
                  to="/dashboard"
                  className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 font-bold text-xs uppercase tracking-wider text-white transition"
                >
                  Manage in Dashboard
                </Link>
                <Link
                  to="/browse"
                  className="w-full py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  View in Marketplace
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterEquipmentPage;

