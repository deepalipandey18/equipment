import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { getIllustrationForEquipment } from '../components/common/EquipmentIllustration';
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
  Tag,
  Phone,
  MessageSquare,
  Clock,
  FileCheck,
} from 'lucide-react';

const photoCategories = [
  'All',
  'Earthmoving',
  'Lifting & Cranes',
  'Hauling & Trucks',
  'Power & Generators',
  'Concrete',
  'Material Handling',
  'Farm & Agricultural',
  'Road & Compaction',
];

// STORENT 3D Cartoon Illustrations for Step 4 Machinery Photo Presets
const sampleMachineryPhotos = [
  {
    id: 'jcb-3dx',
    name: 'JCB 3DX Super Backhoe Loader',
    category: 'Earthmoving',
    badge: '3D Cartoon • Most Popular',
    url: '/images/illustrations/jcb-excavator.svg',
  },
  {
    id: 'heavy-excavator',
    name: 'Caterpillar 320D Crawler Excavator',
    category: 'Earthmoving',
    badge: '3D Cartoon • Heavy Digging',
    url: '/images/illustrations/jcb-excavator.svg',
  },
  {
    id: 'mobile-crane',
    name: 'ACE 25X Mobile Telescopic Crane',
    category: 'Lifting & Cranes',
    badge: '3D Cartoon • 25-Ton Boom',
    url: '/images/illustrations/crane.svg',
  },
  {
    id: 'heavy-crane',
    name: 'Hydraulic Mobile Crane 40-Ton',
    category: 'Lifting & Cranes',
    badge: '3D Cartoon • High Reach',
    url: '/images/illustrations/crane.svg',
  },
  {
    id: 'dump-truck',
    name: 'BharatBenz 3528C Heavy Tipper',
    category: 'Hauling & Trucks',
    badge: '3D Cartoon • High Payload',
    url: '/images/illustrations/dump-truck.svg',
  },
  {
    id: 'mining-dumper',
    name: 'Multi-Axle Heavy Mining Haul Dumper',
    category: 'Hauling & Trucks',
    badge: '3D Cartoon • Heavy Haul',
    url: '/images/illustrations/dump-truck.svg',
  },
  {
    id: 'silent-generator',
    name: 'Kirloskar 125 kVA Silent DG Set',
    category: 'Power & Generators',
    badge: '3D Cartoon • Prime Power',
    url: '/images/illustrations/generator.svg',
  },
  {
    id: 'heavy-generator',
    name: 'Acoustic Soundproof Diesel Generator',
    category: 'Power & Generators',
    badge: '3D Cartoon • Low Noise',
    url: '/images/illustrations/generator.svg',
  },
  {
    id: 'concrete-mixer',
    name: 'Schwing Stetter 6 Cu.M Transit Mixer',
    category: 'Concrete',
    badge: '3D Cartoon • High Output',
    url: '/images/illustrations/concrete-mixer.svg',
  },
  {
    id: 'batching-plant',
    name: 'Self Loading Mobile Concrete Mixer',
    category: 'Concrete',
    badge: '3D Cartoon • On-Site Mix',
    url: '/images/illustrations/concrete-mixer.svg',
  },
  {
    id: 'forklift',
    name: 'Godrej 3-Ton Diesel Forklift',
    category: 'Material Handling',
    badge: '3D Cartoon • Warehouse Pro',
    url: '/images/illustrations/forklift.svg',
  },
  {
    id: 'electric-stacker',
    name: 'Heavy Duty Electric Reach Truck',
    category: 'Material Handling',
    badge: '3D Cartoon • High Mast',
    url: '/images/illustrations/forklift.svg',
  },
  {
    id: 'farm-tractor',
    name: 'Mahindra 575 DI Heavy Farm Tractor',
    category: 'Farm & Agricultural',
    badge: '3D Cartoon • High Torque',
    url: '/images/illustrations/tractor.svg',
  },
  {
    id: 'commercial-tractor',
    name: 'John Deere 5310 4WD Heavy Tractor',
    category: 'Farm & Agricultural',
    badge: '3D Cartoon • 4x4 Haulage',
    url: '/images/illustrations/tractor.svg',
  },
  {
    id: 'road-roller',
    name: 'L&T 1190 Soil Compactor Roller',
    category: 'Road & Compaction',
    badge: '3D Cartoon • Highway Grade',
    url: '/images/illustrations/road-roller.svg',
  },
  {
    id: 'tandem-roller',
    name: 'Vibratory Tandem Asphalt Roller',
    category: 'Road & Compaction',
    badge: '3D Cartoon • Dual Drum',
    url: '/images/illustrations/road-roller.svg',
  },
];

const RegisterEquipmentPage = () => {
  const { user, hasActiveSubscription, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Multi-step form step state (1 to 4)
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
      const offset = direction === 'left' ? -280 : 280;
      scrollGalleryRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const filteredPhotos =
    photoCategoryFilter === 'All'
      ? sampleMachineryPhotos
      : sampleMachineryPhotos.filter((p) => p.category === photoCategoryFilter);

  // Form State
  const [formData, setFormData] = useState({
    // Marketplace Listing Mode (Rent vs OLX Sell)
    listingType: 'rent', // 'rent' | 'sale' | 'both'
    salePrice: '',
    isNegotiable: true,
    usageHours: '',
    ownershipType: 'first_owner',
    rcAvailable: true,
    nocAvailable: true,
    sellerContactPhone: user?.phone || '',
    sellerWhatsApp: user?.phone || '',

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

    // Step 4: Media & Specs (Defaults to 3D Cartoon Illustration)
    photos: ['/images/illustrations/jcb-excavator.svg'],
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
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // When name changes, automatically pick the matching 3D cartoon illustration if user hasn't uploaded custom photo
      if (field === 'name' && (!prev.photos[0] || prev.photos[0].startsWith('/images/illustrations/'))) {
        const matchingCat = categories.find((c) => c._id === prev.categoryId);
        updated.photos = [getIllustrationForEquipment(value, matchingCat?.slug || '')];
      }
      return updated;
    });
  };

  const handleCategorySelect = (catId) => {
    const selectedCat = categories.find((c) => c._id === catId);
    setFormData((prev) => {
      const matchingIllustration = getIllustrationForEquipment(prev.name || selectedCat?.name || '', selectedCat?.slug || '');
      return {
        ...prev,
        categoryId: catId,
        photos: (!prev.photos[0] || prev.photos[0].startsWith('/images/illustrations/'))
          ? [matchingIllustration]
          : prev.photos,
      };
    });
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
      if (formData.listingType === 'rent') {
        if (!formData.dailyRate || Number(formData.dailyRate) < 100) {
          setErrorMessage('Daily rental rate is required and must be at least ₹100.');
          return;
        }
      } else if (formData.listingType === 'sale') {
        if (!formData.salePrice || Number(formData.salePrice) < 1000) {
          setErrorMessage('Expected sale price is required for sale listing (min ₹1,000).');
          return;
        }
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
      const defaultIllustration = getIllustrationForEquipment(
        formData.name || 'Machinery',
        categories.find((c) => c._id === formData.categoryId)?.slug || ''
      );
      const finalPhoto =
        formData.photos && formData.photos[0] && formData.photos[0].trim()
          ? formData.photos[0].trim()
          : defaultIllustration;

      // Ensure dailyRate is 0 if pure sale listing and empty
      const payload = {
        ...formData,
        photos: [finalPhoto],
        dailyRate: formData.listingType === 'sale' ? (formData.dailyRate ? Number(formData.dailyRate) : 0) : Number(formData.dailyRate),
        salePrice: formData.salePrice ? Number(formData.salePrice) : 0,
        usageHours: formData.usageHours ? Number(formData.usageHours) : 0,
      };

      const res = await api.post('/equipment', payload);
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
        <Loader2 className="h-8 w-8 animate-spin text-[#222428]" />
        <p className="text-sm text-[#34373C] font-medium">Verifying subscription listing quota...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#34373C] hover:text-[#222428] mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#222428] tracking-tight">
                {formData.listingType === 'sale'
                  ? 'Sell Equipment'
                  : 'Register Equipment for Rent'}
              </h1>
              <p className="text-xs sm:text-sm text-[#34373C]/70 mt-1">
                List your heavy machinery on STORENT with verified rates, 3D cartoon visuals, and direct buyer/renter contact.
              </p>
            </div>

            {quotaInfo && (
              <div className="flex items-center space-x-2 bg-[#FCC837]/20 border border-[#FCC837]/50 px-3.5 py-1.5 rounded-lg text-[#222428] text-xs font-bold self-start sm:self-auto">
                <Crown className="h-4 w-4 text-[#FCC837]" />
                <span>
                  Quota: <strong>{quotaInfo.remaining}</strong> listings remaining on {quotaInfo.planName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Step Indicator */}
        <div className="bg-white p-4 rounded-xl border border-[#34373C]/15 shadow-sm mb-8">
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
            {[
              { num: 1, label: 'Basic Info', icon: Layers },
              { num: 2, label: formData.listingType === 'sale' ? 'Sale Pricing' : 'Pricing & Terms', icon: IndianRupee },
              { num: 3, label: 'Location & GPS', icon: MapPin },
              { num: 4, label: '3D Photos & Review', icon: Camera },
            ].map((s) => {
              const Icon = s.icon;
              const isActive = step === s.num;
              const isPast = step > s.num;
              return (
                <div
                  key={s.num}
                  className={`flex flex-col items-center p-2 rounded-lg transition ${
                    isActive
                      ? 'bg-[#222428] text-[#FCC837]'
                      : isPast
                      ? 'bg-[#FCC837]/20 text-[#222428]'
                      : 'text-[#34373C]/50'
                  }`}
                >
                  <div className="flex items-center space-x-1 mb-1">
                    <Icon className="h-4 w-4" />
                    <span>Step {s.num}</span>
                  </div>
                  <span className="text-[11px] font-medium hidden sm:inline">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center space-x-2 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Multi-step Form Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-[#34373C]/15 shadow-sm">
          <form onSubmit={step === 4 ? handleSubmit : handleNextStep}>
            {/* STEP 1: Basic Machine Info & Listing Purpose */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-[#222428] border-b border-[#34373C]/10 pb-3">
                  Step 1: Machinery Specifications & Listing Purpose
                </h2>

                {/* Listing Purpose 3-Way Selector */}
                <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#34373C]/15 space-y-3">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-[#222428]">
                      Marketplace Listing Purpose *
                    </label>
                    <p className="text-[11px] text-[#34373C]/70">
                      Choose how contractors and buyers interact with your machine on STORENT.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        type: 'rent',
                        title: 'For Rent Only',
                        badge: 'Rental Fleet',
                        desc: 'Earn recurring daily or monthly rental income from project contractors.',
                        icon: Truck,
                      },
                      {
                        type: 'sale',
                        title: 'For Sale',
                        badge: 'Direct Sell',
                        desc: 'Sell used or new heavy machinery directly to buyers with phone & WhatsApp.',
                        icon: Tag,
                      },
                    ].map((opt) => {
                      const isSelected = formData.listingType === opt.type;
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.type}
                          type="button"
                          onClick={() => handleInputChange('listingType', opt.type)}
                          className={`p-3.5 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#FCC837] bg-white ring-2 ring-[#FCC837]/30 shadow-md'
                              : 'border-[#34373C]/15 bg-white/70 hover:border-[#FCC837]/60'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#222428] text-[#FCC837]' : 'bg-slate-100 text-[#34373C]'}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              isSelected ? 'bg-[#FCC837] text-[#222428]' : 'bg-slate-200 text-[#34373C]'
                            }`}>
                              {opt.badge}
                            </span>
                          </div>
                          <div className="mt-3">
                            <h4 className="text-sm font-black text-[#222428]">{opt.title}</h4>
                            <p className="text-[11px] text-[#34373C]/70 mt-0.5 leading-snug">{opt.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                      Equipment Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. JCB 3DX Super Backhoe Loader, ACE 25X Mobile Crane..."
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                      Category *
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => handleCategorySelect(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none bg-white font-medium"
                    >
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                      Condition *
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) => handleInputChange('condition', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none bg-white"
                    >
                      <option value="excellent">Excellent (Like New, Low Hours)</option>
                      <option value="good">Good (Well Maintained, Regularly Serviced)</option>
                      <option value="fair">Fair (Fully Functional)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                      Manufacturer Brand *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. JCB, Caterpillar, ACE, BharatBenz, Kirloskar"
                      value={formData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                      Model Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 3DX Super, 320D2, 25X Mobile"
                      value={formData.model}
                      onChange={(e) => handleInputChange('model', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                      Manufacturing Year
                    </label>
                    <input
                      type="number"
                      min="1990"
                      max={new Date().getFullYear() + 1}
                      value={formData.year}
                      onChange={(e) => handleInputChange('year', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                      Description & Work Capability * (Min 20 characters)
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Specify operating weight, boom reach, bucket capacity, recent servicing, attachments included..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Pricing, Sale Details & Terms */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="border-b border-[#34373C]/10 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-[#222428]">
                      Step 2: {formData.listingType === 'sale' ? 'Equipment Sale Pricing & Documents' : 'Rental Rates & Terms'}
                    </h2>
                    <p className="text-xs text-[#34373C]/70">
                      {formData.listingType === 'sale'
                        ? 'Set your expected sale price, operating hours, RC status, and direct buyer contact numbers.'
                        : 'Configure your rental rates, security deposits, and operator availability.'}
                    </p>
                  </div>
                  <span className="text-[11px] font-black bg-[#222428] text-[#FCC837] px-2.5 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto border border-[#34373C]">
                    Mode: {formData.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                  </span>
                </div>

                {/* SALE SECTION (Rendered if sale) */}
                {formData.listingType === 'sale' && (
                  <div className="p-5 bg-white rounded-2xl border-2 border-[#FCC837] shadow-sm space-y-4">
                    <div className="flex items-center space-x-2 pb-2 border-b border-[#FCC837]/30">
                      <Tag className="h-4 w-4 text-[#222428]" />
                      <h3 className="text-sm font-black text-[#222428] uppercase tracking-wider">
                        Equipment Sale Specifications
                      </h3>
                      <span className="text-[10px] font-bold bg-[#FCC837] text-[#222428] px-2 py-0.5 rounded-full ml-auto">
                        Direct Buyer Connect
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                          Expected Sale Price (₹) *
                        </label>
                        <div className="relative">
                          <IndianRupee className="h-4 w-4 text-[#34373C]/40 absolute left-3 top-3" />
                          <input
                            type="number"
                            required
                            min="1000"
                            placeholder="e.g. 2850000"
                            value={formData.salePrice}
                            onChange={(e) => handleInputChange('salePrice', e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none font-bold"
                          />
                        </div>
                        <p className="text-[11px] text-[#34373C]/60 mt-1 font-medium">
                          {formData.salePrice ? `₹${Number(formData.salePrice).toLocaleString('en-IN')}` : 'Enter full amount in ₹ (e.g. ₹28,50,000)'}
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                          Price Negotiation
                        </label>
                        <div className="flex items-center space-x-4 pt-2">
                          <label className="flex items-center space-x-2 text-xs font-bold text-[#222428] cursor-pointer">
                            <input
                              type="radio"
                              name="isNegotiable"
                              checked={formData.isNegotiable === true}
                              onChange={() => handleInputChange('isNegotiable', true)}
                              className="accent-[#222428]"
                            />
                            <span>Negotiable Price</span>
                          </label>
                          <label className="flex items-center space-x-2 text-xs font-bold text-[#34373C] cursor-pointer">
                            <input
                              type="radio"
                              name="isNegotiable"
                              checked={formData.isNegotiable === false}
                              onChange={() => handleInputChange('isNegotiable', false)}
                              className="accent-[#222428]"
                            />
                            <span>Fixed Price</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                          Operating / Usage Meter Reading (Hours)
                        </label>
                        <div className="relative">
                          <Clock className="h-4 w-4 text-[#34373C]/40 absolute left-3 top-3" />
                          <input
                            type="number"
                            min="0"
                            placeholder="e.g. 2450 (Engine hours)"
                            value={formData.usageHours}
                            onChange={(e) => handleInputChange('usageHours', e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                          Ownership History
                        </label>
                        <select
                          value={formData.ownershipType}
                          onChange={(e) => handleInputChange('ownershipType', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none bg-white font-medium"
                        >
                          <option value="first_owner">1st Owner (Direct First Hand)</option>
                          <option value="second_owner">2nd Owner</option>
                          <option value="third_or_more">3rd Owner or More</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                          Direct Contact Phone (For Buyer Calls)
                        </label>
                        <div className="relative">
                          <Phone className="h-4 w-4 text-[#34373C]/40 absolute left-3 top-3" />
                          <input
                            type="tel"
                            placeholder="e.g. +91 9876543210"
                            value={formData.sellerContactPhone}
                            onChange={(e) => handleInputChange('sellerContactPhone', e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                          WhatsApp Number (For Direct Chats)
                        </label>
                        <div className="relative">
                          <MessageSquare className="h-4 w-4 text-[#34373C]/40 absolute left-3 top-3" />
                          <input
                            type="tel"
                            placeholder="e.g. +91 9876543210"
                            value={formData.sellerWhatsApp}
                            onChange={(e) => handleInputChange('sellerWhatsApp', e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2 flex flex-wrap gap-6 pt-2">
                        <label className="flex items-center space-x-2 text-xs font-bold text-[#222428] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.rcAvailable}
                            onChange={(e) => handleInputChange('rcAvailable', e.target.checked)}
                            className="h-4 w-4 accent-[#222428] rounded"
                          />
                          <span>Original RC Book Available</span>
                        </label>

                        <label className="flex items-center space-x-2 text-xs font-bold text-[#222428] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.nocAvailable}
                            onChange={(e) => handleInputChange('nocAvailable', e.target.checked)}
                            className="h-4 w-4 accent-[#222428] rounded"
                          />
                          <span>RTO NOC Ready for Interstate Sale & Transfer</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* RENTAL RATES SECTION (Rendered if rent) */}
                {formData.listingType === 'rent' && (
                  <div className="space-y-4">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                          Daily Rate (₹) *
                        </label>
                        <div className="relative">
                          <IndianRupee className="h-4 w-4 text-[#34373C]/40 absolute left-3 top-3" />
                          <input
                            type="number"
                            required
                            min="100"
                            placeholder="e.g. 8500"
                            value={formData.dailyRate}
                            onChange={(e) => handleInputChange('dailyRate', e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                          Hourly Rate (₹) (Optional)
                        </label>
                        <div className="relative">
                          <IndianRupee className="h-4 w-4 text-[#34373C]/40 absolute left-3 top-3" />
                          <input
                            type="number"
                            min="0"
                            placeholder="e.g. 1200"
                            value={formData.hourlyRate}
                            onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                          Monthly Rate (₹) (Optional)
                        </label>
                        <div className="relative">
                          <IndianRupee className="h-4 w-4 text-[#34373C]/40 absolute left-3 top-3" />
                          <input
                            type="number"
                            min="0"
                            placeholder="e.g. 180000"
                            value={formData.monthlyRate}
                            onChange={(e) => handleInputChange('monthlyRate', e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                          Security Deposit (₹)
                        </label>
                        <div className="relative">
                          <IndianRupee className="h-4 w-4 text-[#34373C]/40 absolute left-3 top-3" />
                          <input
                            type="number"
                            min="0"
                            placeholder="e.g. 20000"
                            value={formData.securityDeposit}
                            onChange={(e) => handleInputChange('securityDeposit', e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                          Transport / Delivery Charges (₹)
                        </label>
                        <div className="relative">
                          <IndianRupee className="h-4 w-4 text-[#34373C]/40 absolute left-3 top-3" />
                          <input
                            type="number"
                            min="0"
                            placeholder="e.g. 3500 (or 0 if site pickup)"
                            value={formData.deliveryCharges}
                            onChange={(e) => handleInputChange('deliveryCharges', e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                          Operator Option *
                        </label>
                        <select
                          value={formData.operatorOption}
                          onChange={(e) => handleInputChange('operatorOption', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none bg-white font-medium"
                        >
                          <option value="included">Operator Included in Rate</option>
                          <option value="optional">Operator Available at Extra Cost</option>
                          <option value="not_included">No Operator (Dry Hire Only)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Location & Coordinates */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#34373C]/10 gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-[#222428]">
                      Step 3: Yard Location & Geospatial Radar
                    </h2>
                    <p className="text-xs text-[#34373C]/70">
                      Used for MongoDB 2dsphere proximity search so nearby contractors find your machine.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={handleResetLocationDefaults}
                      title="Reset to recommended default yard values"
                      className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-[#222428] text-xs font-semibold hover:bg-slate-200 transition"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Reset Defaults</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      disabled={locating}
                      className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#222428] text-[#FCC837] text-xs font-bold uppercase tracking-wider hover:bg-[#34373C] transition shadow-sm border border-[#34373C]"
                    >
                      <Navigation className={`h-3.5 w-3.5 ${locating ? 'animate-spin' : ''}`} />
                      <span>{locating ? 'Detecting GPS...' : 'Use Device GPS'}</span>
                    </button>
                  </div>
                </div>

                {/* Auto-filled Notification Banner */}
                <div className="flex items-start sm:items-center justify-between p-3.5 bg-[#FCC837]/15 border border-[#FCC837]/40 rounded-xl text-xs text-[#222428] gap-3">
                  <div className="flex items-center space-x-2.5">
                    <Sparkles className="h-4 w-4 text-[#222428] shrink-0" />
                    <span>
                      <strong>All location and GPS fields are pre-filled automatically!</strong> You can proceed directly or edit any field below.
                    </span>
                  </div>
                  <span className="hidden sm:inline-block shrink-0 px-2.5 py-0.5 bg-[#222428] text-[#FCC837] font-bold text-[11px] rounded-full border border-[#34373C]">
                    Ready to Next
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                      Yard / Plot Street Address
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Plot 42, Sector 37 Industrial Area, Pace City"
                      value={formData.address.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                      Area / Industrial Zone
                    </label>
                    <input
                      type="text"
                      placeholder="Sector 37 Industrial Corridor"
                      value={formData.address.area}
                      onChange={(e) => handleAddressChange('area', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                      Landmark / Nearby Hub
                    </label>
                    <input
                      type="text"
                      placeholder="Near Hero Honda Chowk Yard"
                      value={formData.address.landmark}
                      onChange={(e) => handleAddressChange('landmark', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Gurugram"
                      value={formData.address.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Haryana"
                      value={formData.address.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                      Postal Code / PIN *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="122002"
                      value={formData.address.pincode}
                      onChange={(e) => handleAddressChange('pincode', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                      Delivery Radius (km)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.deliveryRadiusKm}
                      onChange={(e) => handleInputChange('deliveryRadiusKm', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none"
                    />
                  </div>

                  {/* Manual Coordinates Tuning */}
                  <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-[#F8F9FA] rounded-xl border border-[#34373C]/15">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                        Latitude (° N)
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={formData.coordinates[1]}
                        onChange={(e) => handleCoordinateChange(1, e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                        Longitude (° E)
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={formData.coordinates[0]}
                        onChange={(e) => handleCoordinateChange(0, e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none bg-white font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 pt-2 border-t border-[#34373C]/10">
                      <div className="flex items-center space-x-2 text-[#34373C]">
                        <MapPin className="h-4 w-4 text-[#222428] shrink-0" />
                        <span>
                          GeoJSON Index: <strong>[{formData.coordinates[0]}, {formData.coordinates[1]}]</strong> [lng, lat]
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-[#222428] bg-[#FCC837]/25 px-2.5 py-0.5 rounded border border-[#FCC837]/40 self-start sm:self-auto">
                        2dsphere Proximity Radar Ready
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Photos, Serial & Final Review with 3D Cartoon Illustrations */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="border-b border-[#34373C]/10 pb-3">
                  <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-[#FCC837]/20 border border-[#FCC837]/40 text-[#222428] text-[10px] font-bold uppercase tracking-wider mb-1.5">
                    <Sparkles className="h-3 w-3 text-[#222428]" />
                    <span>STORENT 3D Cartoon Illustrations Active</span>
                  </div>
                  <h2 className="text-lg font-bold text-[#222428]">
                    Step 4: Machine Photos & Final Review
                  </h2>
                  <p className="text-xs text-[#34373C]/70">
                    Pick from official 3D cartoon illustrations or provide your own custom image URL.
                  </p>
                </div>

                <div>
                  {/* Gallery Header & Navigation Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#222428]">
                        Select 3D Cartoon Preset ({filteredPhotos.length} Available)
                      </label>
                      <p className="text-[11px] text-[#34373C]/70">
                        Choose a 3D cartoon model matching your machinery (JCB, Excavators, Cranes, Rollers, Trucks, DG Sets).
                      </p>
                    </div>

                    {/* Scroll Buttons */}
                    <div className="flex items-center space-x-1.5 self-start sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => scrollGallery('left')}
                        className="p-1.5 rounded-lg border border-[#34373C]/20 bg-white hover:bg-[#F8F9FA] text-[#222428] transition flex items-center justify-center hover:border-[#FCC837]"
                        title="Scroll Left"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollGallery('right')}
                        className="p-1.5 rounded-lg border border-[#34373C]/20 bg-white hover:bg-[#F8F9FA] text-[#222428] transition flex items-center justify-center hover:border-[#FCC837]"
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
                            ? 'bg-[#222428] text-[#FCC837] border border-[#34373C] font-black shadow-sm'
                            : 'bg-slate-100 text-[#34373C] hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Horizontally Scrollable 3D Cartoon Machinery Strip */}
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
                          className={`group cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-300 snap-start shrink-0 w-60 sm:w-64 bg-white flex flex-col ${
                            isSelected
                              ? 'border-[#FCC837] ring-2 ring-[#FCC837]/30 shadow-lg scale-[1.02]'
                              : 'border-[#34373C]/15 hover:border-[#FCC837] hover:shadow-md'
                          }`}
                        >
                          <div className="relative h-36 sm:h-40 w-full bg-gradient-to-b from-[#F8F9FA] to-[#ECEEF0] flex items-center justify-center p-3 overflow-hidden">
                            <img
                              src={photo.url}
                              alt={photo.name}
                              className="h-full w-full object-contain transition duration-300 group-hover:scale-115 drop-shadow-md"
                              loading="lazy"
                            />
                            {/* Badges */}
                            <div className="absolute top-2 left-2 flex flex-col gap-1 items-start pointer-events-none">
                              <span className="text-[10px] font-semibold bg-[#222428]/80 backdrop-blur text-white px-2 py-0.5 rounded-full">
                                {photo.category}
                              </span>
                              {photo.badge && (
                                <span className="text-[9px] font-black bg-[#FCC837] text-[#222428] px-1.5 py-0.2 rounded border border-[#E6B01B]">
                                  {photo.badge}
                                </span>
                              )}
                            </div>

                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-[#222428] text-[#FCC837] p-1 rounded-full shadow-md border border-[#34373C]">
                                <CheckCircle className="h-4 w-4 fill-[#FCC837] text-[#222428]" />
                              </div>
                            )}
                          </div>

                          <div
                            className={`p-3 text-xs text-center truncate ${
                              isSelected
                                ? 'bg-[#FCC837]/15 text-[#222428] font-black border-t border-[#FCC837]/40'
                                : 'text-[#222428] font-bold border-t border-[#34373C]/10'
                            }`}
                          >
                            {photo.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Custom Photo URL Input (Completely Optional) */}
                  <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-[#34373C]/10">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-[#34373C]">
                        Custom Photo URL (Optional):
                      </label>
                      <span className="text-[10px] text-[#34373C]/60 bg-white px-2 py-0.5 rounded border border-[#34373C]/15 font-semibold">
                        Not Required (3D Model Active)
                      </span>
                    </div>
                    <p className="text-[10px] text-[#34373C]/60 mb-2">
                      A high-quality 3D cartoon model is already selected above. Only enter a URL here if you prefer to use your own external photo.
                    </p>
                    <input
                      type="text"
                      placeholder="https://example.com/custom-photo.jpg (Optional)"
                      value={formData.photos[0]?.startsWith('/images/illustrations/') ? '' : (formData.photos[0] || '')}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        if (val) {
                          handleInputChange('photos', [val]);
                        } else {
                          const matchingCat = categories.find((c) => c._id === formData.categoryId);
                          handleInputChange('photos', [getIllustrationForEquipment(formData.name || matchingCat?.name || '', matchingCat?.slug || '')]);
                        }
                      }}
                      className="w-full px-3.5 py-2 rounded-lg border border-[#34373C]/20 bg-white text-xs focus:border-[#FCC837] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#34373C] mb-1.5">
                    Chassis / Serial Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. JCB-IND-2023-88912"
                    value={formData.serialNumber}
                    onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none"
                  />
                </div>

                {/* Summary Card with 3D Cartoon Image Preview */}
                <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#34373C]/15 text-xs space-y-3">
                  <div className="font-bold text-[#222428] text-sm pb-1.5 border-b border-[#34373C]/10 flex items-center justify-between">
                    <span>Listing Summary & Verification</span>
                    <span className="text-[11px] font-black text-[#222428] bg-[#FCC837] px-2.5 py-0.5 rounded-full border border-[#E6B01B] shadow-xs">
                      Mode: {formData.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    {/* Selected 3D Machinery Image Preview */}
                    <div className="sm:col-span-1 rounded-2xl overflow-hidden border border-[#34373C]/15 bg-white shadow-xs">
                      <div className="relative h-36 sm:h-44 w-full bg-gradient-to-b from-[#F8F9FA] to-[#ECEEF0] flex items-center justify-center p-3">
                        <img
                          src={formData.photos[0] || getIllustrationForEquipment(formData)}
                          alt="Selected Machinery Preview"
                          className="h-full w-full object-contain drop-shadow-md"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getIllustrationForEquipment(formData);
                          }}
                        />
                        <span className="absolute bottom-2 left-2 text-[9px] font-black bg-[#222428] text-[#FCC837] px-2 py-0.5 rounded-md border border-[#34373C]">
                          Selected 3D Model
                        </span>
                      </div>
                    </div>

                    {/* Details list */}
                    <div className="sm:col-span-2 grid grid-cols-2 gap-2.5 text-[#34373C]">
                      <div>
                        <strong>Equipment:</strong> {formData.name || 'Unnamed Machine'}
                      </div>
                      <div>
                        <strong>Make & Model:</strong> {formData.brand} {formData.model}
                      </div>

                      {/* Display either or both rates */}
                      {formData.listingType !== 'sale' && (
                        <div>
                          <strong>Daily Rental Rate:</strong> ₹{formData.dailyRate}
                        </div>
                      )}

                      {formData.listingType !== 'rent' && (
                        <div>
                          <strong>Sale Price:</strong> ₹{Number(formData.salePrice || 0).toLocaleString('en-IN')}{' '}
                          {formData.isNegotiable && <span className="text-[10px] text-green-700 font-bold">(Negotiable)</span>}
                        </div>
                      )}

                      {formData.listingType !== 'rent' && formData.usageHours && (
                        <div>
                          <strong>Operating Hours:</strong> {formData.usageHours} hrs
                        </div>
                      )}

                      <div>
                        <strong>City & State:</strong> {formData.address.city}, {formData.address.state}
                      </div>
                      <div>
                        <strong>Yard Address:</strong>{' '}
                        {formData.address.street || `${formData.address.city}, ${formData.address.state}`}
                      </div>
                      {formData.listingType !== 'sale' && (
                        <div>
                          <strong>Operator Option:</strong> {formData.operatorOption}
                        </div>
                      )}
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
            <div className="mt-8 pt-6 border-t border-[#34373C]/10 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2.5 rounded-lg border border-[#34373C]/30 text-xs font-bold text-[#222428] hover:bg-slate-100 flex items-center space-x-1.5 transition"
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
                  className="px-6 py-2.5 rounded-lg bg-[#FCC837] hover:bg-[#F0BA28] text-xs font-black uppercase tracking-wider text-[#222428] border border-[#E6B01B] shadow-sm flex items-center space-x-1.5 transition"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-lg bg-[#FCC837] hover:bg-[#F0BA28] text-xs font-black uppercase tracking-wider text-[#222428] border border-[#E6B01B] shadow-md flex items-center space-x-2 disabled:opacity-60 transition"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#222428]" />
                      <span>Publishing Listing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 text-[#222428]" />
                      <span>
                        {formData.listingType === 'sale'
                          ? 'Publish Machinery for Sale'
                          : 'Publish Equipment Listing'}
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Success Modal */}
        {successData && (
          <div className="fixed inset-0 z-50 bg-[#181A1D]/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl text-center border border-[#34373C]/20">
              <div className="h-14 w-14 rounded-full bg-[#FCC837] text-[#222428] flex items-center justify-center mx-auto mb-4 font-black shadow-md border border-[#E6B01B]">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-[#222428]">
                {successData.listingType === 'sale'
                  ? 'Equipment Listed For Sale!'
                  : 'Equipment Listed Successfully!'}
              </h3>
              <p className="text-xs text-[#34373C]/80 mt-2">
                Your <strong>{successData.name}</strong> is now live on the STORENT marketplace with 3D cartoon visuals and ready to receive buyer inquiries and bookings.
              </p>

              {/* 3D Model Display in Success Modal */}
              <div className="my-4 h-32 w-full rounded-xl bg-gradient-to-b from-[#F8F9FA] to-[#ECEEF0] border border-[#34373C]/10 p-2 flex items-center justify-center">
                <img
                  src={successData.photos?.[0] || getIllustrationForEquipment(successData)}
                  alt={successData.name}
                  className="h-full w-full object-contain drop-shadow"
                />
              </div>

              <div className="mt-4 p-3 rounded-xl bg-[#F8F9FA] border border-[#34373C]/10 text-xs text-[#34373C] text-left space-y-1">
                {successData.listingType !== 'sale' && (
                  <div>
                    <strong>Daily Rate:</strong> ₹{successData.dailyRate}
                  </div>
                )}
                {successData.listingType === 'sale' && (
                  <div>
                    <strong>Sale Price:</strong> ₹{Number(successData.salePrice || 0).toLocaleString('en-IN')}{' '}
                    {successData.isNegotiable && <span className="text-[10px] text-green-700 font-bold">(Negotiable)</span>}
                  </div>
                )}
                <div>
                  <strong>Location:</strong> {successData.address?.city}, {successData.address?.state}
                </div>
                <div>
                  <strong>Marketplace Mode:</strong>{' '}
                  <span className="text-[#222428] font-black uppercase">
                    {successData.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-col space-y-2">
                <Link
                  to="/dashboard"
                  className="w-full py-2.5 rounded-lg bg-[#FCC837] hover:bg-[#F0BA28] font-black text-xs uppercase tracking-wider text-[#222428] border border-[#E6B01B] transition shadow-sm text-center"
                >
                  Manage in Dashboard
                </Link>
                <Link
                  to="/browse"
                  className="w-full py-2.5 rounded-lg border border-[#34373C]/20 text-xs font-bold text-[#222428] hover:bg-[#F8F9FA] transition text-center"
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
