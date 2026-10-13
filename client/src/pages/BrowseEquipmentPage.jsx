import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/client';
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
} from 'lucide-react';

const BrowseEquipmentPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state initialized from URL params
  const [keyword, setKeyword] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
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

  // Fetch machinery categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data?.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.warn('Could not load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch equipment from backend API with geospatial & filter parameters
  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (keyword.trim()) params.keyword = keyword.trim();
      if (selectedCategory) params.category = selectedCategory;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (operatorOption) params.operatorOption = operatorOption;
      if (sortBy) params.sortBy = sortBy;

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
  }, [keyword, selectedCategory, minPrice, maxPrice, operatorOption, sortBy, userLocation, radiusKm]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

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
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Marketplace Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Machinery Rental Marketplace
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Find verified JCBs, excavators, cranes, generators, and tractors for your job site.
            </p>
          </div>

          {/* View Mode Controls */}
          <div className="flex items-center space-x-2 bg-white p-1 rounded-xl border border-slate-200 self-start md:self-auto shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
                viewMode === 'grid'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
                viewMode === 'list'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
                viewMode === 'map'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Map View</span>
            </button>
          </div>
        </div>

        {/* Search & Geospatial Radar Filter Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Keyword Search */}
            <div className="md:col-span-4 relative">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search JCB, 20-ton crane, generator..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-500 outline-none"
              />
            </div>

            {/* Category Dropdown */}
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-500 outline-none bg-white"
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
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-500 outline-none bg-white"
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
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-500 outline-none bg-white font-medium"
              >
                {userLocation && <option value="nearest">Nearest to Me (GPS)</option>}
                <option value="newest">Newest Listed</option>
                <option value="price_asc">Lowest Daily Rate</option>
                <option value="price_desc">Highest Daily Rate</option>
              </select>
            </div>
          </form>

          {/* Location & Radius Radar Row */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locating}
                className={`px-3.5 py-1.5 rounded-lg font-bold uppercase tracking-wider flex items-center space-x-1.5 transition ${
                  userLocation
                    ? 'bg-emerald-600 text-white'
                    : 'bg-brand-50 text-brand-900 border border-brand-300 hover:bg-brand-100'
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
                  <div className="flex items-center space-x-1 bg-slate-100 px-2.5 py-1.5 rounded-lg text-slate-700">
                    <span>Radius:</span>
                    <select
                      value={radiusKm}
                      onChange={(e) => setRadiusKm(e.target.value)}
                      className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer"
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

            <div className="text-slate-500 font-medium">
              Showing <strong>{equipmentList.length}</strong> available machines
            </div>
          </div>

          {/* Location notification banner */}
          {userLocation && (
            <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                <strong>GPS Coordinates Active:</strong> [{userLocation.lat}, {userLocation.lng}].
                Distances calculated as straight-line proximity via MongoDB 2dsphere index.
              </span>
            </div>
          )}

          {locationError && (
            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-xs flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>{locationError}</span>
            </div>
          )}
        </div>

        {/* Content Display: Grid / List / Map */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3 bg-white rounded-2xl border border-slate-200">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            <p className="text-sm text-slate-500 font-medium">Scanning equipment fleet...</p>
          </div>
        ) : equipmentList.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
            <Truck className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800">No Machinery Matches Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
              Try adjusting your search keyword, category, or expanding your GPS radar radius.
            </p>
            <button
              onClick={() => {
                setKeyword('');
                setSelectedCategory('');
                setOperatorOption('');
                setUserLocation(null);
              }}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold text-xs uppercase tracking-wider"
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === 'map' ? (
          /* MAP VIEW */
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="h-[550px] w-full rounded-xl overflow-hidden relative border border-slate-200 bg-slate-100 flex items-center justify-center">
              {/* Fallback Leaflet Map View Container with Interactive Overlay */}
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
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md bg-white/95 backdrop-blur p-4 rounded-xl shadow-xl border border-slate-200 max-h-48 overflow-y-auto">
                <div className="text-xs font-bold text-slate-900 mb-2 flex items-center justify-between">
                  <span>Machinery in This Area ({equipmentList.length})</span>
                  <span className="text-[10px] text-slate-400">OpenStreetMap</span>
                </div>
                <div className="space-y-2">
                  {equipmentList.slice(0, 5).map((item) => (
                    <Link
                      key={item._id}
                      to={`/equipment/${item._id}`}
                      className="block p-2 rounded-lg bg-slate-50 hover:bg-brand-50 border border-slate-200 transition text-xs"
                    >
                      <div className="font-bold text-slate-800 truncate">{item.name}</div>
                      <div className="flex justify-between text-slate-500 text-[11px] mt-0.5">
                        <span>₹{item.dailyRate?.toLocaleString('en-IN')}/day</span>
                        <span>
                          {item.distanceKm !== undefined ? `📍 ${item.distanceKm} km away` : item.address?.city}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : viewMode === 'list' ? (
          /* LIST VIEW */
          <div className="space-y-4">
            {equipmentList.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-brand-500 hover:shadow-md transition flex flex-col md:flex-row gap-6"
              >
                <img
                  src={item.photos?.[0] || 'https://via.placeholder.com/400x300'}
                  alt={item.name}
                  className="w-full md:w-56 h-44 object-cover rounded-xl bg-slate-100 shrink-0"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                          {item.categoryId?.name || 'Heavy Equipment'}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mt-1">{item.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {item.brand} {item.model} {item.year ? `• Year ${item.year}` : ''}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-black text-slate-900">
                          ₹{item.dailyRate?.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">per day</div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center space-x-3 text-slate-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3.5 w-3.5 text-brand-600" />
                        <span>{item.address?.city}, {item.address?.state}</span>
                      </div>
                      {item.distanceKm !== undefined && (
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          📍 {item.distanceKm} km away
                        </span>
                      )}
                      <span className="capitalize text-slate-500">
                        • {item.operatorOption === 'included' ? 'Operator Included' : item.operatorOption === 'optional' ? 'Operator Optional' : 'Dry Hire'}
                      </span>
                    </div>

                    <Link
                      to={`/equipment/${item._id}`}
                      className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs uppercase tracking-wider transition"
                    >
                      View Details & Rent
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* GRID VIEW (Default) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipmentList.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:border-brand-500 hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={item.photos?.[0] || 'https://via.placeholder.com/400x300'}
                      alt={item.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-800 uppercase tracking-wider shadow-sm">
                      {item.categoryId?.name || 'Machinery'}
                    </div>

                    {item.distanceKm !== undefined && (
                      <div className="absolute bottom-3 left-3 bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{item.distanceKm} km away</span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                      {item.brand} • {item.model}
                    </div>
                    <h3 className="font-bold text-base text-slate-900 mt-1 line-clamp-1 group-hover:text-brand-600 transition">
                      {item.name}
                    </h3>

                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <div className="flex items-center space-x-1 truncate max-w-[150px]">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.address?.city}, {item.address?.state}</span>
                      </div>
                      <span className="text-[11px] font-medium text-slate-500">
                        {item.operatorOption === 'included' ? 'Operator Included' : 'Dry Hire'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer with Rate & Action */}
                <div className="p-5 pt-0 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Daily Rate</span>
                    <div className="text-lg font-black text-slate-900">
                      ₹{item.dailyRate?.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <Link
                    to={`/equipment/${item._id}`}
                    className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider transition"
                  >
                    Details & Rent
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseEquipmentPage;
