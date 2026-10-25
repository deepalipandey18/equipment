import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/client';
import { getIllustrationForEquipment } from '../components/common/EquipmentIllustration';
import {
  Search,
  MapPin,
  Filter,
  Truck,
  Eye,
  ArrowUpDown,
  Navigation,
  Loader2,
  SlidersHorizontal,
  X,
  LayoutGrid,
  List,
  Map as MapIcon,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Tag,
  Sparkles,
  Clock,
  Phone,
  ShieldCheck,
} from 'lucide-react';

const GUIDELINE_CATEGORIES = [
  { _id: 'cat_construction', name: 'Construction', slug: 'construction' },
  { _id: 'cat_transport', name: 'Transport', slug: 'transport' },
  { _id: 'cat_industrial', name: 'Industrial', slug: 'industrial' },
  { _id: 'cat_marine', name: 'Marine', slug: 'marine' },
  { _id: 'cat_road_works', name: 'Road Works', slug: 'road-works' },
  { _id: 'cat_warehouse', name: 'Warehouse', slug: 'warehouse' },
  { _id: 'cat_agriculture', name: 'Agriculture', slug: 'agriculture' },
];

const BrowseEquipmentPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state initialized from URL params
  const [keyword, setKeyword] = useState(searchParams.get('search') || '');
  const [locationParam, setLocationParam] = useState(searchParams.get('location') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [listingType, setListingType] = useState(searchParams.get('listingType') || 'all'); // 'all' | 'rent' | 'sale'
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [operatorOption, setOperatorOption] = useState(searchParams.get('operator') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [radiusKm, setRadiusKm] = useState(searchParams.get('radius') || '100');

  // Location state
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  // View mode
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'map'

  // Data & loading
  const [categories, setCategories] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch equipment from backend API with geospatial & filter parameters
  const fetchEquipment = useCallback(
    async (overrideType, overrideSort) => {
      setLoading(true);
      try {
        const activeType = overrideType !== undefined ? overrideType : listingType;
        const activeSort = overrideSort !== undefined ? overrideSort : sortBy;

        const params = {};
        if (keyword.trim()) params.keyword = keyword.trim();
        if (locationParam.trim()) params.location = locationParam.trim();
        if (selectedCategory) params.category = selectedCategory;
        if (activeType && activeType !== 'all') params.listingType = activeType;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (operatorOption) params.operatorOption = operatorOption;
        if (activeSort) params.sortBy = activeSort;

        if (userLocation) {
          params.lat = userLocation.lat;
          params.lng = userLocation.lng;
          params.radiusKm = radiusKm;
        }

        const res = await api.get('/equipment', { params });
        if (res.data?.success) {
          setEquipmentList(res.data.data || []);
          setTotalCount(res.data.total || 0);
        }
      } catch (err) {
        console.warn('Marketplace fetch error:', err);
        setEquipmentList([]);
      } finally {
        setLoading(false);
      }
    },
    [keyword, selectedCategory, listingType, minPrice, maxPrice, operatorOption, sortBy, userLocation, radiusKm]
  );

  // Sync URL params and trigger instant fetch when listingType changes
  const handleListingTypeChange = (type) => {
    setListingType(type);
    let targetSort = sortBy;
    if (type === 'sale' && (sortBy === 'price_asc' || sortBy === 'price_desc')) {
      targetSort = 'newest';
      setSortBy('newest');
    } else if (type === 'rent' && (sortBy === 'sale_asc' || sortBy === 'sale_desc')) {
      targetSort = 'newest';
      setSortBy('newest');
    }

    const newParams = new URLSearchParams(window.location.search);
    if (type === 'all') {
      newParams.delete('listingType');
    } else {
      newParams.set('listingType', type);
    }
    setSearchParams(newParams, { replace: true });

    // Instantly execute search query with the clicked type
    fetchEquipment(type, targetSort);
  };

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  // Fetch machinery categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data?.success && res.data.data?.length > 0) {
          setCategories(res.data.data);
        } else {
          setCategories(GUIDELINE_CATEGORIES);
        }
      } catch (err) {
        console.warn('Could not load categories:', err);
        setCategories(GUIDELINE_CATEGORIES);
      }
    };
    fetchCategories();
  }, []);

  // Auto-request current location on initial mount if supported
  useEffect(() => {
    if (navigator.geolocation && !userLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: Number(position.coords.latitude.toFixed(6)),
            lng: Number(position.coords.longitude.toFixed(6)),
          };
          setUserLocation(coords);
          setSortBy('nearest');
        },
        (err) => {
          console.log('Auto geolocation prompt dismissed or unavailable:', err.message);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  // Real-time client-side distance calculator using Haversine formula
  const getDistanceKm = useCallback(
    (item) => {
      if (item?.distanceKm !== undefined && item?.distanceKm !== null) {
        return Number(item.distanceKm).toFixed(1);
      }
      if (!userLocation) return null;

      let itemLng, itemLat;
      if (Array.isArray(item?.location?.coordinates) && item.location.coordinates.length === 2) {
        [itemLng, itemLat] = item.location.coordinates;
      } else if (item?.location?.lng && item?.location?.lat) {
        itemLng = item.location.lng;
        itemLat = item.location.lat;
      } else {
        return null;
      }

      const lat1 = userLocation.lat;
      const lon1 = userLocation.lng;
      const lat2 = Number(itemLat);
      const lon2 = Number(itemLng);

      if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return null;

      const R = 6371; // Earth's mean radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c;
      return Number(d.toFixed(1));
    },
    [userLocation]
  );

  // Browser Geolocation API handler
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
        };
        setUserLocation(coords);
        setSortBy('nearest'); // automatically sort nearest
        setLocating(false);
      },
      (error) => {
        setLocating(false);
        setLocationError(`Location denied: ${error.message}. You can still search by city keyword.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const clearLocation = () => {
    setUserLocation(null);
    setSortBy('newest');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEquipment();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Marketplace Title & Navigation Mode */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-[#FCC837]/20 border border-[#FCC837]/40 text-[#222428] text-[10px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="h-3 w-3 text-[#222428]" />
              <span>STORENT Heavy Equipment Marketplace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#222428] tracking-tight">
              Machinery Marketplace
            </h1>
            <p className="text-xs sm:text-sm text-[#34373C]/70 mt-1">
              Hire machinery for construction projects or purchase used heavy equipment directly from verified owners.
            </p>
          </div>

          {/* View Mode Controls */}
          <div className="flex items-center space-x-2 bg-white p-1 rounded-xl border border-[#34373C]/15 self-start md:self-auto shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
                viewMode === 'grid'
                  ? 'bg-[#222428] text-[#FCC837] shadow-sm'
                  : 'text-[#34373C] hover:text-[#222428]'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
                viewMode === 'list'
                  ? 'bg-[#222428] text-[#FCC837] shadow-sm'
                  : 'text-[#34373C] hover:text-[#222428]'
              }`}
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
                viewMode === 'map'
                  ? 'bg-[#222428] text-[#FCC837] shadow-sm'
                  : 'text-[#34373C] hover:text-[#222428]'
              }`}
            >
              <MapIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Map View</span>
            </button>
          </div>
        </div>

        {/* Rent & Buy Market Selector Tabs */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Equipment', icon: Truck, badge: null },
            { id: 'rent', label: 'For Rent', icon: Truck, badge: 'Rental Fleet' },
            { id: 'sale', label: 'Buy Equipment', icon: Tag, badge: 'Used & New' },
          ].map((tab) => {
            const isCurrent = listingType === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleListingTypeChange(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center space-x-2 transition border ${
                  isCurrent
                    ? 'bg-[#222428] text-[#FCC837] border-[#34373C] shadow-sm'
                    : 'bg-white text-[#34373C] border-[#34373C]/15 hover:border-[#FCC837] hover:bg-[#F8F9FA]'
                }`}
              >
                <Icon className={`h-4 w-4 ${isCurrent ? 'text-[#FCC837]' : 'text-[#34373C]'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      isCurrent
                        ? 'bg-[#FCC837] text-[#222428]'
                        : 'bg-[#FCC837]/30 text-[#222428]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search & Geospatial Radar Filter Bar */}
        <div className="bg-white p-5 rounded-2xl border border-[#34373C]/15 shadow-sm mb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Keyword Search */}
            <div className="md:col-span-4 relative">
              <Search className="h-4 w-4 text-[#34373C]/40 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search JCB, 25-ton crane, generator, BharatBenz..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none"
              />
            </div>

            {/* Category Dropdown */}
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none bg-white font-medium"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Operator Option */}
            <div className="md:col-span-2">
              <select
                value={operatorOption}
                onChange={(e) => setOperatorOption(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none bg-white font-medium"
              >
                <option value="">Any Operator</option>
                <option value="included">Operator Included</option>
                <option value="optional">Operator Optional</option>
                <option value="not_included">Dry Hire (No Op)</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="md:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[#34373C]/30 text-sm focus:border-[#FCC837] outline-none bg-white font-medium"
              >
                {userLocation && <option value="nearest">Nearest to Me (GPS)</option>}
                <option value="newest">Newest Listed</option>
                <option value="price_asc">Lowest Daily Rate</option>
                <option value="price_desc">Highest Daily Rate</option>
                <option value="sale_asc">Lowest Sale Price (₹)</option>
                <option value="sale_desc">Highest Sale Price (₹)</option>
              </select>
            </div>
          </form>

          {/* Location & Radius Radar Row */}
          <div className="pt-3 border-t border-[#34373C]/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locating}
                className={`px-3.5 py-1.5 rounded-lg font-bold uppercase tracking-wider flex items-center space-x-1.5 transition ${
                  userLocation
                    ? 'bg-[#222428] text-[#FCC837] border border-[#34373C]'
                    : 'bg-[#FCC837] text-[#222428] border border-[#E6B01B] hover:bg-[#F0BA28]'
                }`}
              >
                <Navigation className={`h-3.5 w-3.5 ${locating ? 'animate-spin' : ''}`} />
                <span>
                  {locating
                    ? 'Acquiring GPS...'
                    : userLocation
                    ? 'GPS Radar Active'
                    : 'Use My Current Location'}
                </span>
              </button>

              {userLocation && (
                <>
                  <div className="flex items-center space-x-1 bg-slate-100 px-2.5 py-1.5 rounded-lg text-[#34373C]">
                    <span>Radius:</span>
                    <select
                      value={radiusKm}
                      onChange={(e) => setRadiusKm(e.target.value)}
                      className="bg-transparent font-bold text-[#222428] outline-none cursor-pointer"
                    >
                      <option value="15">Within 15 km</option>
                      <option value="30">Within 30 km</option>
                      <option value="50">Within 50 km</option>
                      <option value="100">Within 100 km</option>
                      <option value="200">Within 200 km</option>
                    </select>
                  </div>

                  <button
                    onClick={clearLocation}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600"
                    title="Clear location filter"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            <div className="text-[#34373C] font-medium">
              Showing <strong>{equipmentList.length}</strong> {listingType === 'sale' ? 'machinery for sale' : 'available machines'}
            </div>
          </div>

          {/* Location notification banner */}
          {userLocation && (
            <div className="p-2.5 bg-[#FCC837]/15 rounded-lg border border-[#FCC837]/40 text-[#222428] text-xs flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-[#222428] shrink-0" />
              <span>
                <strong>GPS Coordinates Active:</strong> [{userLocation.lat}, {userLocation.lng}].
                Distances calculated as straight-line proximity via MongoDB 2dsphere index.
              </span>
            </div>
          )}

          {locationError && (
            <div className="p-2.5 bg-red-50 rounded-lg border border-red-200 text-red-800 text-xs flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <span>{locationError}</span>
            </div>
          )}
        </div>

        {/* Content Display: Grid / List / Map */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3 bg-white rounded-2xl border border-[#34373C]/15">
            <Loader2 className="h-8 w-8 animate-spin text-[#222428]" />
            <p className="text-sm text-[#34373C] font-medium">Scanning equipment fleet & machinery listings...</p>
          </div>
        ) : equipmentList.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-[#34373C]/15">
            <Truck className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#222428]">No Machinery Matches Found</h3>
            <p className="text-xs text-[#34373C]/70 max-w-md mx-auto mt-1 mb-6">
              Try adjusting your search keyword, category, or switching between "For Rent" and "Buy Equipment".
            </p>
            <button
              onClick={() => {
                setKeyword('');
                setSelectedCategory('');
                handleListingTypeChange('all');
                setUserLocation(null);
              }}
              className="px-5 py-2.5 rounded-lg bg-[#FCC837] text-[#222428] font-bold text-xs uppercase tracking-wider hover:bg-[#F0BA28] transition border border-[#E6B01B]"
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === 'map' ? (
          /* MAP VIEW */
          <div className="bg-white rounded-2xl p-4 border border-[#34373C]/15 shadow-sm">
            <div className="relative h-[650px] w-full rounded-xl overflow-hidden border border-[#34373C]/15">
              <iframe
                title="OpenStreetMap Machinery View"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                  userLocation ? userLocation.lng - 0.5 : 76.8
                }%2C${userLocation ? userLocation.lat - 0.4 : 28.2}%2C${
                  userLocation ? userLocation.lng + 0.5 : 77.6
                }%2C${userLocation ? userLocation.lat + 0.4 : 28.8}&amp;layer=mapnik&amp;marker=${
                  userLocation ? `${userLocation.lat}%2C${userLocation.lng}` : '28.4595%2C77.0878'
                }`}
                className="w-full h-full"
              />

              {/* Machinery Overlay list inside map */}
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md bg-white/95 backdrop-blur p-4 rounded-xl shadow-xl border border-[#34373C]/15 max-h-56 overflow-y-auto">
                <div className="text-xs font-bold text-[#222428] mb-2 flex items-center justify-between">
                  <span>Machinery in This Area ({equipmentList.length})</span>
                  <span className="text-[10px] text-slate-400">OpenStreetMap</span>
                </div>
                <div className="space-y-2">
                  {equipmentList.slice(0, 8).map((item) => {
                    const dist = getDistanceKm(item);
                    const isSale = item.listingType === 'sale';
                    return (
                      <Link
                        key={item._id}
                        to={`/equipment/${item._id}`}
                        className="block p-2 rounded-lg bg-slate-50 hover:bg-[#FCC837]/10 border border-slate-200 transition text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#222428] truncate">{item.name}</span>
                          {isSale ? (
                            <span className="text-[9px] font-black bg-[#222428] text-[#FCC837] px-1.5 py-0.5 rounded ml-1 shrink-0">
                              FOR SALE
                            </span>
                          ) : (
                            <span className="text-[9px] font-black bg-[#FCC837] text-[#222428] px-1.5 py-0.2 rounded ml-1 shrink-0">
                              FOR RENT
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center text-[#34373C] text-[11px] mt-0.5">
                          <span>
                            {isSale
                              ? `₹${Number(item.salePrice || 0).toLocaleString('en-IN')}`
                              : `₹${item.dailyRate?.toLocaleString('en-IN')}/day`}
                          </span>
                          <div className="flex items-center space-x-1">
                            <span>{item.address?.city || 'Site'}</span>
                            {dist !== null && (
                              <span className="font-bold text-[#222428] bg-[#FCC837]/20 px-1.5 py-0.2 rounded border border-[#FCC837]/40">
                                • 📍 {dist} km
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : viewMode === 'list' ? (
          /* LIST VIEW */
          <div className="space-y-4">
            {equipmentList.map((item) => {
              const dist = getDistanceKm(item);
              const isSale = item.listingType === 'sale';
              return (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl border border-[#34373C]/15 p-5 shadow-sm hover:border-[#FCC837] hover:shadow-md transition flex flex-col md:flex-row gap-6"
                >
                  <img
                    src={item.photos?.[0] && !item.photos[0].includes('unsplash.com') && !item.photos[0].includes('placeholder') ? item.photos[0] : getIllustrationForEquipment(item)}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getIllustrationForEquipment(item);
                    }}
                    alt={item.name}
                    className="w-full md:w-56 h-44 object-contain p-2 bg-[#F8F9FA] rounded-xl border border-[#34373C]/15 shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#222428] bg-[#FCC837] px-2 py-0.5 rounded">
                              {item.categoryId?.name || 'Heavy Equipment'}
                            </span>
                            {isSale ? (
                              <span className="text-[11px] font-black uppercase tracking-wider bg-[#222428] text-[#FCC837] px-2 py-0.5 rounded border border-[#34373C]">
                                FOR SALE
                              </span>
                            ) : (
                              <span className="text-[11px] font-black uppercase tracking-wider bg-[#FCC837] text-[#222428] px-2 py-0.5 rounded border border-[#E6B01B]">
                                FOR RENT
                              </span>
                            )}
                            {(item.rcAvailable || (item.verificationDocuments && item.verificationDocuments.length > 0)) && (
                              <span className="text-[11px] font-black uppercase tracking-wider bg-[#222428] text-[#FCC837] px-2 py-0.5 rounded border border-[#FCC837]/40 flex items-center space-x-1">
                                <ShieldCheck className="h-3 w-3 text-[#FCC837]" />
                                <span>Verified Owner</span>
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-[#222428] mt-1.5">{item.name}</h3>
                          <p className="text-xs text-[#34373C]/70 mt-0.5">
                            {item.brand} {item.model} {item.year ? `• Year ${item.year}` : ''}
                            {item.usageHours ? ` • ⏱️ ${item.usageHours} hrs` : ''}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          {isSale ? (
                            <div>
                              <div className="text-2xl font-black text-[#222428]">
                                ₹{item.salePrice ? Number(item.salePrice).toLocaleString('en-IN') : 'Contact'}
                              </div>
                              <div className="text-[11px] font-bold text-green-700">
                                {item.isNegotiable ? 'Negotiable Price' : 'Fixed Price'}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="text-2xl font-black text-[#222428]">
                                ₹{item.dailyRate?.toLocaleString('en-IN')}
                              </div>
                              <div className="text-[11px] text-[#34373C]/60 font-medium">per day</div>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-[#34373C] mt-2 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#34373C]/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex flex-wrap items-center gap-2 text-[#34373C]">
                        <div className="flex items-center space-x-1 font-semibold text-[#222428]">
                          <MapPin className="h-3.5 w-3.5 text-[#222428]" />
                          <span>{item.address?.city || 'Local Site'}{item.address?.state ? `, ${item.address.state}` : ''}</span>
                        </div>

                        {/* Distance Badge */}
                        {dist !== null ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#FCC837]/20 text-[#222428] font-bold text-[11px] border border-[#FCC837]/50">
                            <Navigation className="h-2.5 w-2.5 text-[#222428] fill-[#222428] rotate-45" />
                            <span>{dist} km away</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleUseCurrentLocation();
                            }}
                            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-100 hover:bg-[#FCC837]/20 text-[#34373C] text-[10px] font-medium border border-slate-200 transition"
                          >
                            <Navigation className="h-2.5 w-2.5" />
                            <span>Get distance</span>
                          </button>
                        )}

                        {isSale ? (
                          <span className="text-[#34373C] font-medium">
                            • {item.ownershipType === 'first_owner' ? '1st Owner' : item.ownershipType === 'second_owner' ? '2nd Owner' : '3rd+ Owner'}
                            {item.rcAvailable && ' • RC Book Ready'}
                          </span>
                        ) : (
                          <span className="capitalize text-[#34373C]">
                            • {item.operatorOption === 'included' ? 'Operator Included' : item.operatorOption === 'optional' ? 'Operator Optional' : 'Dry Hire'}
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/equipment/${item._id}`}
                        className="px-4 py-2 rounded-lg bg-[#FCC837] hover:bg-[#F0BA28] text-[#222428] font-bold text-xs uppercase tracking-wider transition border border-[#E6B01B]"
                      >
                        {isSale ? 'View Details & Buy' : 'View Details & Rent'}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* GRID VIEW (Default) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipmentList.map((item) => {
              const dist = getDistanceKm(item);
              const isSale = item.listingType === 'sale';
              return (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl border border-[#34373C]/15 overflow-hidden shadow-sm hover:border-[#FCC837] hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Photo Container */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                      <img
                        src={item.photos?.[0] && !item.photos[0].includes('unsplash.com') && !item.photos[0].includes('placeholder') ? item.photos[0] : getIllustrationForEquipment(item)}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getIllustrationForEquipment(item);
                        }}
                        alt={item.name}
                        className="h-full w-full object-contain p-2 bg-[#F8F9FA] group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                        <span className="bg-white/95 backdrop-blur px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#222428] uppercase tracking-wider shadow-sm">
                          {item.categoryId?.name || 'Machinery'}
                        </span>
                        {isSale ? (
                          <span className="bg-[#222428] text-[#FCC837] px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border border-[#34373C] shadow-sm">
                            FOR SALE
                          </span>
                        ) : (
                          <span className="bg-[#FCC837] text-[#222428] px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border border-[#E6B01B] shadow-sm">
                            FOR RENT
                          </span>
                        )}
                        {(item.rcAvailable || (item.verificationDocuments && item.verificationDocuments.length > 0)) && (
                          <span className="bg-[#222428]/95 text-[#FCC837] px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border border-[#FCC837]/40 shadow-sm flex items-center space-x-1">
                            <ShieldCheck className="h-2.5 w-2.5 text-[#FCC837]" />
                            <span>Verified Owner</span>
                          </span>
                        )}
                      </div>

                      {dist !== null && (
                        <div className="absolute bottom-3 left-3 bg-[#222428]/95 backdrop-blur text-[#FCC837] border border-[#FCC837]/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center space-x-1">
                          <Navigation className="h-3 w-3 fill-[#FCC837] rotate-45" />
                          <span>{dist} km away</span>
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="p-5">
                      <div className="text-xs text-[#34373C]/70 font-semibold uppercase tracking-wider flex items-center justify-between">
                        <span>{item.brand} • {item.model}</span>
                        {item.usageHours > 0 && (
                          <span className="text-[11px] font-bold text-[#222428] bg-slate-100 px-1.5 py-0.5 rounded">
                            ⏱️ {item.usageHours} hrs
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-base text-[#222428] mt-1 line-clamp-1 group-hover:text-black transition">
                        {item.name}
                      </h3>

                      <p className="text-xs text-[#34373C] mt-2 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Address and Distance Side by Side */}
                      <div className="mt-4 pt-3 border-t border-[#34373C]/10 flex flex-wrap items-center justify-between text-xs text-[#34373C] gap-2">
                        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                          <div className="flex items-center space-x-1 font-semibold text-[#222428] shrink-0">
                            <MapPin className="h-3.5 w-3.5 text-[#222428] shrink-0" />
                            <span>
                              {item.address?.city || 'Local Site'}
                              {item.address?.state ? `, ${item.address.state}` : ''}
                            </span>
                          </div>
                        </div>

                        <span className="text-[11px] font-medium text-[#34373C]/80 shrink-0">
                          {isSale
                            ? (item.rcAvailable ? 'RC Ready' : 'Direct Sale')
                            : (item.operatorOption === 'included' ? 'Operator Inc.' : 'Dry Hire')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer with Rate / Price & Action */}
                  <div className="p-5 pt-0 flex items-center justify-between">
                    <div>
                      {isSale ? (
                        <>
                          <span className="text-xs text-[#34373C]/70">Sale Price</span>
                          <div className="text-lg font-black text-[#222428]">
                            ₹{item.salePrice ? Number(item.salePrice).toLocaleString('en-IN') : 'Contact'}
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-xs text-[#34373C]/70">Daily Rate</span>
                          <div className="text-lg font-black text-[#222428]">
                            ₹{item.dailyRate?.toLocaleString('en-IN')}
                          </div>
                        </>
                      )}
                    </div>

                    <Link
                      to={`/equipment/${item._id}`}
                      className="px-4 py-2 rounded-lg bg-[#FCC837] hover:bg-[#F0BA28] text-[#222428] font-black text-xs uppercase tracking-wider transition border border-[#E6B01B]"
                    >
                      {isSale ? 'View & Buy' : 'Details & Rent'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseEquipmentPage;
