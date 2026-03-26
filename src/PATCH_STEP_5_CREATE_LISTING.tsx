// =====================================================
// COPY THIS EXACT CODE TO REPLACE CASE 5 IN CreateListingScreen.tsx
// (lines ~374-480)
// =====================================================

      case 5:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-heading mb-2">Location</h2>
              <p className="text-muted text-sm mb-4">Where is the item located?</p>
            </div>

            {/* Global Location Display (Read-Only, Clickable) */}
            {globalLocation && globalLocation.latitude && globalLocation.longitude ? (
              <div>
                <label className="block text-[14px] text-black mb-2" style={{ fontWeight: '700' }}>
                  Your Location
                </label>
                <button
                  type="button"
                  onClick={() => setShowLocationSelector(true)}
                  className="w-full p-4 bg-white border-2 border-gray-200 hover:border-[#CDFF00] transition-colors text-left flex items-start justify-between gap-3"
                  style={{ borderRadius: '8px' }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-5 h-5 text-[#CDFF00] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-[15px] text-black" style={{ fontWeight: '700' }}>
                        {globalLocation.area}, {globalLocation.city}
                      </p>
                    </div>
                    {globalLocation.address && (
                      <p className="text-[13px] text-gray-600 truncate" style={{ fontWeight: '500' }}>
                        {globalLocation.address}
                      </p>
                    )}
                  </div>
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <p className="text-[12px] text-gray-500 mt-1.5" style={{ fontWeight: '600' }}>
                  Tap to change your location
                </p>
              </div>
            ) : (
              <div>
                <div className="p-4 bg-red-50 border-2 border-red-200" style={{ borderRadius: '8px' }}>
                  <p className="text-[14px] text-red-600 mb-3" style={{ fontWeight: '700' }}>
                    ⚠️ Location Not Set
                  </p>
                  <p className="text-[13px] text-red-600 mb-3" style={{ fontWeight: '500' }}>
                    Please set your location from the header first.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowLocationSelector(true)}
                    className="w-full py-2.5 px-4 bg-[#CDFF00] text-black hover:bg-[#b8e600] transition-colors"
                    style={{ 
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '700'
                    }}
                  >
                    Set Location Now
                  </button>
                </div>
                {errors.location && (
                  <p className="text-[12px] text-red-600 mt-1.5" style={{ fontWeight: '600' }}>
                    {errors.location}
                  </p>
                )}
              </div>
            )}

            {/* Full Address Input */}
            {globalLocation && globalLocation.latitude && (
              <div>
                <label className="block text-[14px] text-black mb-2" style={{ fontWeight: '700' }}>
                  Full Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={userAddress}
                  onChange={(e) => setUserAddress(e.target.value)}
                  placeholder="Building name, floor, street details...

E.g., Shop #12, 2nd Floor, 8th Cross, 29th Main Road
Above Cafe Coffee Day"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-[#CDFF00] transition-colors resize-none"
                  style={{ 
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: '500',
                    minHeight: '120px'
                  }}
                  rows={5}
                />
                <p className="text-[12px] text-gray-500 mt-1.5" style={{ fontWeight: '600' }}>
                  Add specific details like building name, floor, nearby landmarks
                </p>
                {errors.address && (
                  <p className="text-[12px] text-red-600 mt-1.5" style={{ fontWeight: '600' }}>
                    {errors.address}
                  </p>
                )}
              </div>
            )}

            {/* View on Google Maps Button */}
            {globalLocation && globalLocation.latitude && (
              <button
                type="button"
                onClick={() => {
                  window.open(
                    `https://www.google.com/maps?q=${globalLocation.latitude},${globalLocation.longitude}`,
                    '_blank'
                  );
                }}
                className="w-full py-2.5 px-4 bg-white border-2 border-gray-200 text-black hover:border-[#CDFF00] hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                style={{ 
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '700'
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>View on Google Maps</span>
              </button>
            )}
          </div>
        );
