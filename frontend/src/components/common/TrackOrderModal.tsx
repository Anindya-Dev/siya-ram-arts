import React, { useState } from 'react';
import {
  X,
  Search,
  Package,
  Truck,
  MapPin,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { fetchApi } from '../../lib/api';

interface TrackingEvent {
  timestamp: string;
  location: string;
  description: string;
}

interface TrackingInfo {
  order_id: string;
  order_number: string;
  courier: string | null;
  awb: string | null;
  status: string;
  status_label: string;
  estimated_delivery: string | null;
  tracking_url: string | null;
  timeline: TrackingEvent[];
  live_tracking: boolean;
}

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_CONFIG: Record<string, { icon: React.FC<any>; color: string; bg: string }> = {
  pending:           { icon: Clock,        color: 'text-[#A67C52]', bg: 'bg-[#FDF6E9]' },
  in_transit:        { icon: Truck,        color: 'text-blue-600',  bg: 'bg-blue-50'   },
  out_for_delivery:  { icon: MapPin,       color: 'text-orange-600',bg: 'bg-orange-50'  },
  delivered:         { icon: CheckCircle,  color: 'text-green-600', bg: 'bg-green-50'   },
  failed:            { icon: AlertCircle,  color: 'text-red-600',   bg: 'bg-red-50'     },
};

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({ isOpen, onClose }) => {
  const [inputValue, setInputValue] = useState('');
  const [searchType, setSearchType] = useState<'order' | 'awb'>('order');
  const [loading, setLoading] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setLoading(true);
    setError(null);
    setTrackingInfo(null);

    try {
      const endpoint =
        searchType === 'order'
          ? `/tracking/${encodeURIComponent(inputValue.trim())}`
          : `/tracking/awb/${encodeURIComponent(inputValue.trim())}`;
      const data = await fetchApi<TrackingInfo>(endpoint);
      setTrackingInfo(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cfg = trackingInfo ? (STATUS_CONFIG[trackingInfo.status] || STATUS_CONFIG.pending) : null;

  const formatDate = (ts: string) => {
    if (!ts) return '';
    try {
      return new Date(ts).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return ts;
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#1C1410]/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg mx-4 bg-[#FFFDF5] rounded-sm shadow-2xl border border-[#D4AF37]/30 overflow-hidden animate-[fadeInUp_0.25s_ease] max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="bg-[#8B5A2B] px-6 py-5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-serif text-xl text-white font-bold">Track Your Order</h2>
            <p className="text-[#D5C2A8] text-xs mt-0.5">Enter your order ID or tracking number</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#D5C2A8] hover:text-white hover:bg-[#724923] rounded-sm transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Form */}
        <div className="px-6 py-4 border-b border-[#D4AF37]/20 shrink-0">
          {/* Toggle */}
          <div className="flex bg-[#F5F2ED] rounded-sm p-0.5 mb-3 border border-[#D4AF37]/20">
            {(['order', 'awb'] as const).map((type) => (
              <button
                key={type}
                onClick={() => { setSearchType(type); setTrackingInfo(null); setError(null); }}
                className={`flex-1 py-1.5 text-xs font-serif rounded-xs transition-colors ${
                  searchType === type
                    ? 'bg-[#8B5A2B] text-white font-semibold'
                    : 'text-[#7A6A5A] hover:text-[#8B5A2B]'
                }`}
              >
                {type === 'order' ? 'Order ID' : 'Tracking Number (AWB)'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              id="track-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={searchType === 'order' ? 'e.g. SRA/2026-27/00042' : 'e.g. 1234567890'}
              className="flex-1 px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D4AF37]/40 rounded-sm focus:outline-none focus:border-[#8B5A2B] text-[#241F1C] placeholder:text-[#BDB0A0]"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#8B5A2B] hover:bg-[#724923] text-white rounded-sm text-sm font-serif flex items-center gap-1.5 transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Track
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1 px-6 py-5">

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-sm">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-serif">{error}</p>
            </div>
          )}

          {trackingInfo && cfg && (
            <div className="space-y-4">
              {/* Status Card */}
              <div className={`p-4 rounded-sm border ${cfg.bg} border-[#D4AF37]/20`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${cfg.bg} border border-current/20`}>
                    <cfg.icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold font-serif text-sm ${cfg.color}`}>{trackingInfo.status_label}</p>
                    <p className="text-[11px] text-[#7A6A5A] mt-0.5">
                      Order: <span className="font-semibold">{trackingInfo.order_number}</span>
                    </p>
                  </div>
                  {trackingInfo.live_tracking && (
                    <span className="text-[10px] text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-serif">
                      Live
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-[#D4AF37]/15 grid grid-cols-2 gap-2 text-[11px]">
                  {trackingInfo.courier && (
                    <div>
                      <span className="text-[#A09080]">Courier</span>
                      <p className="font-semibold text-[#3A2D20] font-serif">{trackingInfo.courier}</p>
                    </div>
                  )}
                  {trackingInfo.awb && (
                    <div>
                      <span className="text-[#A09080]">Tracking No.</span>
                      <p className="font-semibold text-[#3A2D20] font-serif">{trackingInfo.awb}</p>
                    </div>
                  )}
                  {trackingInfo.estimated_delivery && (
                    <div>
                      <span className="text-[#A09080]">Est. Delivery</span>
                      <p className="font-semibold text-[#3A2D20] font-serif">{trackingInfo.estimated_delivery}</p>
                    </div>
                  )}
                </div>

                {trackingInfo.tracking_url && (
                  <a
                    href={trackingInfo.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center gap-1.5 text-xs text-[#8B5A2B] hover:underline font-serif"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Track on {trackingInfo.courier || 'courier'} website
                  </a>
                )}
              </div>

              {/* Timeline */}
              {trackingInfo.timeline.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7A6A5A] mb-3 font-serif">
                    Shipment Timeline
                  </h3>
                  <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[#D4AF37]/30" />

                    <div className="space-y-4">
                      {trackingInfo.timeline.map((event, i) => (
                        <div key={i} className="flex gap-3 pl-1">
                          <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 mt-0.5 ${
                            i === 0
                              ? 'bg-[#8B5A2B] border-[#8B5A2B]'
                              : 'bg-white border-[#D4AF37]/50'
                          }`} />
                          <div className="flex-1 pb-2">
                            <p className="text-xs font-semibold text-[#3A2D20] font-serif">{event.description}</p>
                            {event.location && (
                              <p className="text-[11px] text-[#8B6A52] flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </p>
                            )}
                            {event.timestamp && (
                              <p className="text-[10px] text-[#A09080] mt-0.5">{formatDate(event.timestamp)}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* No timeline yet */}
              {trackingInfo.timeline.length === 0 && (
                <div className="text-center py-6 text-[#A09080] text-xs font-serif">
                  <Package className="w-8 h-8 mx-auto mb-2 text-[#D4AF37]/50" />
                  <p>Detailed tracking updates will appear here once your order is dispatched.</p>
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!loading && !trackingInfo && !error && (
            <div className="text-center py-10 text-[#A09080]">
              <Truck className="w-10 h-10 mx-auto mb-3 text-[#D4AF37]/40" />
              <p className="text-xs font-serif">Enter your Order ID or Tracking Number above to see live shipping updates.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
