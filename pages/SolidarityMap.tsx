import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, MapPin, Home, Building2, AlertTriangle,
  Filter, X, Camera, CheckCircle, Heart, Calendar,
  Target, Flag, Info, ShieldAlert, ArrowRight, Dog
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPoint, MapLayer } from '../types';
import { mapService } from '../services/mapService';
import { messageService } from '../services/messageService';
import { ongService } from '../services/ongService';
import { eventService } from '../services/eventService';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Clean up any existing _getIconUrl
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Custom Icons
const createCustomIcon = (color: string, iconType: 'home' | 'building' | 'alert' | 'heart' | 'calendar') => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              ${iconType === 'home' ? '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>' : ''}
              ${iconType === 'building' ? '<rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22.01"></line><line x1="15" y1="22" x2="15" y2="22.01"></line><line x1="13" y1="6" x2="13" y2="6.01"></line><line x1="13" y1="10" x2="13" y2="10.01"></line><line x1="13" y1="14" x2="13" y2="14.01"></line><line x1="13" y1="18" x2="13" y2="18.01"></line><line x1="9" y1="6" x2="9" y2="6.01"></line><line x1="9" y1="10" x2="9" y2="10.01"></line><line x1="9" y1="14" x2="9" y2="14.01"></line><line x1="9" y1="18" x2="9" y2="18.01"></line>' : ''}
              ${iconType === 'alert' ? '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>' : ''}
              ${iconType === 'heart' ? '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>' : ''}
              ${iconType === 'calendar' ? '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>' : ''}
            </svg>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const MapController = ({ zoom, center }: { zoom?: number, center?: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom || map.getZoom());
  }, [center, zoom, map]);
  return null;
};

const SolidarityMap: React.FC = () => {
  const [searchQuery, setSearchTerm] = useState('');
  const [markers, setMarkers] = useState<MapPoint[]>([]);
  const [layers, setLayers] = useState<MapLayer[]>([
    { id: 'ong', name: 'ONGS PARCEIRAS', description: '', icon: 'heart', enabled: true },
    { id: 'abrigo', name: 'ABRIGOS', description: '', icon: 'home', enabled: true },
    { id: 'empresa', name: 'EMPRESAS PARCEIRAS', description: '', icon: 'building', enabled: true },
    { id: 'perdido', name: 'ANIMAIS PERDIDOS', description: '', icon: 'alert', enabled: true },
    { id: 'evento', name: 'EVENTOS DA REDE', description: '', icon: 'calendar', enabled: true },
  ]);

  const [isLostPetModalOpen, setIsLostPetModalOpen] = useState(false);
  const [isAbuseModalOpen, setIsAbuseModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-15.7938, -47.8827]); // Brasília

  const [lostPetForm, setLostPetForm] = useState({
    photo: '',
    locationDesc: '',
    description: '',
    respondsToName: '',
    usingItem: '',
    occurrenceLocal: '',
    lat: -15.7938,
    lng: -47.8827
  });

  const [abuseForm, setAbuseForm] = useState({
    location: '',
    description: '',
    proofPhoto: ''
  });

  const [selectedLostPet, setSelectedLostPet] = useState<MapPoint | null>(null);
  const [gallerySearch, setGallerySearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');

  const [searchParams] = useSearchParams();

  useEffect(() => {
    loadMarkers();
    if (searchParams.get('alert') === 'lost' || searchParams.get('alert') === 'found') {
      setIsLostPetModalOpen(true);
    }
  }, [searchParams]);

  const loadMarkers = async () => {
    try {
      // 1. Fetch & Show Local/Fast Data Immediately
      const ongs = ongService.getAll();
      const events = eventService.getAll();

      const ongMarkers: MapPoint[] = ongs.map(ong => ({
        id: ong.id,
        type: 'ong',
        name: ong.name,
        // Mock coordinates for demo
        lat: -15.7938 + (Math.random() - 0.5) * 0.1,
        lng: -47.8827 + (Math.random() - 0.5) * 0.1,
        description: ong.description,
        imageUrl: ong.imageUrl,
        top: '0', left: '0'
      }));

      const eventMarkers: MapPoint[] = events.filter(e => e.top && e.left).map(e => ({
        id: e.id,
        type: 'evento',
        name: e.title,
        lat: -15.7938 + (Math.random() - 0.5) * 0.1,
        lng: -47.8827 + (Math.random() - 0.5) * 0.1,
        description: e.description,
        imageUrl: e.imageUrl,
        top: '0', left: '0'
      }));

      const localMarkers = [...ongMarkers, ...eventMarkers];
      setMarkers(localMarkers); // <--- Render local data instantly

      // 2. Fetch & Append DB Points (Async)
      const dbPoints = await mapService.getAll();

      // Combine local + remote (re-using local variable to avoid stale state issues if needed, 
      // but here we just want to ensure we don't lose local if user interacted, 
      // though typically we just replace to be safe and consistent)
      setMarkers([...localMarkers, ...dbPoints]);
    } catch (error) {
      console.error("Error loading markers", error);
    }
  };

  const filteredMarkers = useMemo(() => {
    return markers.filter(marker => {
      const layerEnabled = layers.find(l => l.id === marker.type)?.enabled;
      const matchesSearch = marker.name.toLowerCase().includes(searchQuery.toLowerCase());
      return layerEnabled && matchesSearch;
    });
  }, [markers, layers, searchQuery]);

  const lostPetsGallery = useMemo(() => {
    return markers.filter(marker => {
      if (marker.type !== 'perdido') return false;
      const matchesName = marker.name.toLowerCase().includes(gallerySearch.toLowerCase());
      const matchesLocation = marker.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
        (marker.description && marker.description?.toLowerCase().includes(locationSearch.toLowerCase()));
      return matchesName && matchesLocation;
    });
  }, [markers, gallerySearch, locationSearch]);

  const toggleLayer = (id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, enabled: !l.enabled } : l));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, form: 'lost' | 'abuse') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (form === 'lost') {
          setLostPetForm(prev => ({ ...prev, photo: reader.result as string }));
        } else {
          setAbuseForm(prev => ({ ...prev, proofPhoto: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLostPetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalDescription = `Atende por: ${lostPetForm.respondsToName || 'N/A'}. Item: ${lostPetForm.usingItem || 'Nenhum'}. Local: ${lostPetForm.occurrenceLocal}. Obs: ${lostPetForm.description}`;

    try {
      await mapService.save({
        type: 'perdido',
        name: `ALERTA: Pet em ${lostPetForm.locationDesc}`,
        description: finalDescription,
        imageUrl: lostPetForm.photo,
        isAlert: true,
        lat: mapCenter[0], // Use current map center as default if not clicked
        lng: mapCenter[1],
        top: '0',
        left: '0'
      });
      setIsSuccess(true);
      loadMarkers();
      setTimeout(() => {
        setIsLostPetModalOpen(false);
        setIsSuccess(false);
        setLostPetForm({ photo: '', locationDesc: '', description: '', respondsToName: '', usingItem: '', occurrenceLocal: '', lat: -15.7938, lng: -47.8827 });
      }, 2000);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar alerta. Tente novamente.');
    }
  };

  const handleAbuseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    messageService.send({
      petId: 'abuse-report-system',
      petName: 'Denúncia de Maus Tratos',
      petImage: abuseForm.proofPhoto || 'https://cdn-icons-png.flaticon.com/512/595/595067.png',
      userName: 'Denunciante Anônimo',
      userEmail: 'anonimo@petmatch.com.br',
      message: `LOCAL: ${abuseForm.location} | DESCRIÇÃO: ${abuseForm.description}`,
      type: 'abuse_report'
    });
    setIsSuccess(true);
    setTimeout(() => {
      setIsAbuseModalOpen(false);
      setIsSuccess(false);
      setAbuseForm({ location: '', description: '', proofPhoto: '' });
    }, 2500);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ong': return createCustomIcon('#ff6b6b', 'heart');
      case 'abrigo': return createCustomIcon('#8b4513', 'home');
      case 'empresa': return createCustomIcon('#cd7f32', 'building');
      case 'perdido': return createCustomIcon('#ef4444', 'alert');
      case 'evento': return createCustomIcon('#55a630', 'calendar');
      default: return createCustomIcon('#55a630', 'home');
    }
  };

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-700">
      <div className="h-[700px] flex flex-col lg:flex-row gap-6 overflow-hidden relative">
        {/* Sidebar */}
        <aside className="w-full lg:w-72 wood-panel rounded-[40px] p-5 flex flex-col gap-4 shadow-2xl border-4 border-[#c9a688] z-10 flex-shrink-0 order-2 lg:order-1 h-auto lg:h-full overflow-hidden">
          <header>
            <div className="flex items-center justify-between mb-0">
              <h2 className="text-2xl font-black text-[#5d2e0a] uppercase tracking-tighter">Mapa Solidário</h2>
              <div className="bg-[#55a630] text-white text-[7px] font-black px-2 py-0.5 rounded-full border border-white/20">OSM</div>
            </div>
            <p className="text-[10px] text-[#8b4513] font-medium italic opacity-80">Exploração em tempo real.</p>
          </header>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por local ou ONG.."
              className="w-full wood-inner pl-9 pr-3 py-2.5 text-[10px] border-2 border-[#c9a688] focus:outline-none focus:ring-4 focus:ring-[#55a630]/10 rounded-xl placeholder-[#8b4513]/40"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b4513] w-3.5 h-3.5 opacity-40" />
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <p className="text-[9px] font-black text-[#8b4513] uppercase tracking-widest flex items-center gap-2 ml-1">
              <Filter size={10} className="text-[#55a630]" /> Filtros
            </p>
            <div className="space-y-1.5">
              {layers.map(layer => (
                <button
                  key={layer.id}
                  onClick={() => toggleLayer(layer.id)}
                  className={`w-full wood-panel py-1.5 px-2.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between shadow-sm bg-white ${layer.enabled ? 'border-[#55a630] scale-[1.01]' : 'border-transparent opacity-60 grayscale scale-100'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${layer.enabled ? 'grass-bg text-white' : 'wood-inner text-[#8b4513]'}`}>
                      {layer.icon === 'home' && <Home size={14} />}
                      {layer.icon === 'building' && <Building2 size={14} />}
                      {layer.icon === 'alert' && <AlertTriangle size={14} />}
                      {layer.icon === 'heart' && <Heart size={14} />}
                      {layer.icon === 'calendar' && <Calendar size={14} />}
                    </div>
                    <h4 className="text-[9px] font-black text-[#5d2e0a] uppercase tracking-wider text-left leading-tight">{layer.name}</h4>
                  </div>
                  {layer.enabled && <CheckCircle size={12} className="text-[#55a630] flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t-2 border-[#c9a688]/30">
            <button
              onClick={() => setIsLostPetModalOpen(true)}
              className="w-full bg-white py-2.5 rounded-xl text-red-600 font-black text-[10px] uppercase shadow-md border-2 border-red-600 flex items-center justify-center gap-2 hover:bg-red-50 transition-all active:scale-95"
            >
              <AlertTriangle size={14} /> Animal Perdido
            </button>
            <button
              onClick={() => setIsAbuseModalOpen(true)}
              className="w-full bg-[#ef4444] py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2 text-white font-black text-[10px] uppercase border-b-2 border-red-800 hover:brightness-110 active:translate-y-0.5 transition-all"
            >
              <Flag size={14} /> Denunciar
            </button>
          </div>
        </aside>

        {/* Map Container */}
        <div className="flex-1 wood-panel rounded-[40px] border-4 border-[#c9a688] relative overflow-hidden shadow-2xl order-1 lg:order-2 h-[500px] lg:h-full z-0">
          <MapContainer
            center={[-15.7938, -47.8827]}
            zoom={13}
            className="w-full h-full z-0"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController center={mapCenter} />

            {filteredMarkers.map((marker) => (
              <Marker
                key={marker.id}
                position={[marker.lat || -15.7938, marker.lng || -47.8827]}
                icon={getIcon(marker.type)}
                eventHandlers={{
                  click: () => {
                    if (marker.type === 'perdido') setSelectedLostPet(marker);
                  },
                }}
              >
                {marker.type !== 'perdido' && (
                  <Popup>
                    <div className="p-2 min-w-[150px]">
                      <h4 className="font-extrabold text-[#5d2e0a] uppercase text-xs mb-1">{marker.name}</h4>
                      <p className="text-[10px] text-[#8b4513]">{marker.description || 'Ponto verificado PetMatch'}</p>
                    </div>
                  </Popup>
                )}
              </Marker>
            ))}
          </MapContainer>

          <div className="absolute bottom-10 right-10 flex flex-col gap-4 z-[400]">
            <div className="flex flex-col bg-white/90 rounded-2xl border-2 border-[#c9a688] shadow-2xl overflow-hidden backdrop-blur-sm">
              {/* Custom Zoom Controls can be added here if needed, linking to map instance ref */}
            </div>
            <button onClick={() => setMapCenter([-15.7938, -47.8827])} className="bg-white/90 p-4 rounded-2xl border-2 border-[#c9a688] shadow-2xl backdrop-blur-sm text-[#8b4513] hover:bg-white transition-all">
              <Target size={20} />
            </button>
          </div>
        </div>
      </div>

      <section className="max-w-7xl mx-auto space-y-8 px-2 md:px-0">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-600" size={32} />
              <h2 className="text-4xl font-black text-[#5d2e0a] tracking-tighter uppercase">Animais Desaparecidos</h2>
            </div>
            <p className="text-[#8b4513] text-sm font-medium italic ml-11">Acompanhe as últimas ocorrências registradas pela comunidade.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                value={gallerySearch}
                onChange={e => setGallerySearch(e.target.value)}
                placeholder="Buscar por nome/descrição..."
                className="w-full wood-inner pl-12 pr-4 py-3 text-xs border-2 border-[#c9a688] outline-none"
              />
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b4513] opacity-40" />
            </div>
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                value={locationSearch}
                onChange={e => setLocationSearch(e.target.value)}
                placeholder="Filtrar por Cidade ou Bairro..."
                className="w-full wood-inner pl-12 pr-4 py-3 text-xs border-2 border-[#c9a688] outline-none"
              />
              <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-red-500 opacity-60" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {lostPetsGallery.length > 0 ? lostPetsGallery.map(pet => (
            <div
              key={pet.id}
              onClick={() => setSelectedLostPet(pet)}
              className="wood-panel p-3 rounded-[32px] border-2 border-red-500 bg-white overflow-hidden shadow-lg group/card cursor-pointer hover:translate-y-[-4px] transition-all flex flex-col h-full"
            >
              <div className="aspect-square relative overflow-hidden rounded-2xl border-b-2 border-red-100 mb-4">
                <img src={pet.imageUrl || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=400'} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700" alt="" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="border-4 border-red-600 text-red-600 px-2 py-1 font-black text-xl uppercase -rotate-12 tracking-tighter opacity-80 scale-110 whitespace-nowrap bg-white/10 backdrop-blur-[1px]">PROCURA-SE</div>
                </div>
              </div>
              <div className="px-1 space-y-2 flex-1 flex flex-col">
                <h4 className="text-sm font-black text-[#5d2e0a] line-clamp-1 uppercase leading-tight">{pet.name.replace('ALERTA: Pet em ', '')}</h4>
                <div className="flex items-start gap-1 text-[10px] font-bold text-[#8b4513]">
                  <MapPin size={14} className="text-red-500 flex-shrink-0" />
                  <span className="line-clamp-2 italic">Brasília - DF</span>
                </div>
                <p className="text-[10px] text-[#5d2e0a] font-medium leading-relaxed italic line-clamp-3 bg-[#fdf5ed] p-2 rounded-xl border border-red-100 flex-1">
                  {pet.description?.split('. Obs:')[1] || pet.description}
                </p>
                <button className="w-full mt-2 grass-bg py-2 rounded-xl text-[10px] font-black text-white flex items-center justify-center gap-1 hover:brightness-110">
                  DETALHES COMPLETOS <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="w-20 h-20 wood-inner border-4 border-dashed border-[#c9a688] rounded-full mx-auto flex items-center justify-center opacity-30">
                <Dog size={40} className="text-[#8b4513]" />
              </div>
              <h3 className="text-xl font-black text-[#5d2e0a] opacity-40">Nenhum animal encontrado para estes filtros.</h3>
            </div>
          )}
        </div>
      </section>

      {/* POPUP: DETALHES DO PET PERDIDO */}
      {selectedLostPet && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="wood-panel w-full max-w-2xl rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative p-8 md:p-12 animate-in zoom-in-95 duration-300">
            <button onClick={() => setSelectedLostPet(null)} className="absolute top-6 right-6 text-[#5d2e0a] hover:rotate-90 transition-transform bg-[#f1dfcf] p-2 rounded-full border-2 border-[#c9a688] shadow-md"><X size={24} /></button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="aspect-square rounded-[32px] overflow-hidden border-4 border-red-500 shadow-xl bg-white relative">
                <img src={selectedLostPet.imageUrl || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=600'} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="border-8 border-red-600 text-red-600 px-4 py-2 font-black text-4xl md:text-5xl uppercase -rotate-12 tracking-tighter opacity-90 bg-white/5 backdrop-blur-[1px]">PROCURA-SE</div>
                </div>
              </div>

              <div className="flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full border border-white animate-pulse uppercase tracking-widest">Alerta Crítico</span>
                    <h2 className="text-3xl font-black text-[#5d2e0a] mt-2 uppercase leading-tight tracking-tighter">{selectedLostPet.name}</h2>
                  </div>

                  <div className="wood-inner p-5 border border-[#c9a688]/30 space-y-3">
                    <div>
                      <p className="text-[10px] font-black text-[#8b4513] uppercase opacity-60">Ocorrência / Local:</p>
                      <p className="text-xs font-bold text-[#5d2e0a] flex items-center gap-1"><MapPin size={14} className="text-red-500" /> Brasília - DF</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-[#8b4513] uppercase opacity-60">Características e Detalhes:</p>
                      <p className="text-sm font-medium text-[#5d2e0a] leading-relaxed italic">"{selectedLostPet.description}"</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (selectedLostPet.lat && selectedLostPet.lng) {
                      setMapCenter([selectedLostPet.lat, selectedLostPet.lng]);
                    }
                    setSelectedLostPet(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full mt-6 bg-red-600 py-4 rounded-2xl text-white font-black text-lg shadow-xl border-b-6 border-red-800 flex items-center justify-center gap-2 hover:translate-y-[-2px] transition-all"
                >
                  <MapPin size={20} /> FOCAR NO LOCAL DO MAPA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAIS: ANIMAL PERDIDO */}
      {isLostPetModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="wood-panel w-full max-w-lg rounded-[40px] border-4 border-[#c9a688] shadow-2xl relative p-8 animate-in zoom-in-95 duration-300 bg-[#f3e5d8]">
            <button
              onClick={() => setIsLostPetModalOpen(false)}
              className="absolute top-6 right-6 text-[#5d2e0a] hover:rotate-90 transition-transform bg-[#f1dfcf] p-2 rounded-full border-2 border-[#c9a688] shadow-md"
            >
              <X size={20} />
            </button>

            {isSuccess ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-20 h-20 grass-bg rounded-full mx-auto flex items-center justify-center border-4 border-[#3d7a22] shadow-xl animate-bounce">
                  <CheckCircle className="text-white" size={40} />
                </div>
                <h2 className="text-3xl font-black text-[#5d2e0a]">Alerta Publicado!</h2>
              </div>
            ) : (
              <form onSubmit={handleLostPetSubmit} className="space-y-6">
                <h2 className="text-3xl font-black text-[#5d2e0a] text-center uppercase tracking-tighter">
                  {searchParams.get('alert') === 'found' ? 'ENCONTREI UM PET' : 'ANIMAL PERDIDO'}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Foto do Pet */}
                  <div className="space-y-1.5 text-center">
                    <label className="text-[10px] font-black text-[#8b4513] uppercase">FOTO DO PET</label>
                    <div className="aspect-square wood-inner border-2 border-[#c9a688] border-dashed rounded-3xl flex items-center justify-center relative overflow-hidden bg-white/50">
                      {lostPetForm.photo ? (
                        <img src={lostPetForm.photo} className="w-full h-full object-cover" />
                      ) : (
                        <Camera size={40} className="opacity-20 text-[#8b4513]" />
                      )}
                      <input required type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'lost')} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>

                  {/* Inputs Direita */}
                  <div className="space-y-3 flex flex-col justify-end">
                    <input
                      required
                      value={lostPetForm.locationDesc}
                      onChange={e => setLostPetForm({ ...lostPetForm, locationDesc: e.target.value })}
                      className="w-full wood-inner p-3.5 text-xs border-2 border-[#c9a688]/40 outline-none rounded-2xl placeholder:text-[#8b4513]/40"
                      placeholder={searchParams.get('alert') === 'found' ? "Onde você o viu?" : "Onde foi visto pela última vez?"}
                    />
                    <input
                      value={lostPetForm.respondsToName}
                      onChange={e => setLostPetForm({ ...lostPetForm, respondsToName: e.target.value })}
                      className="w-full wood-inner p-3.5 text-xs border-2 border-[#c9a688]/40 outline-none rounded-2xl placeholder:text-[#8b4513]/40"
                      placeholder={searchParams.get('alert') === 'found' ? "Sabe o nome? (Opcional)" : "Atende pelo nome: (Ex: Totó)"}
                    />
                    <input
                      value={lostPetForm.usingItem}
                      onChange={e => setLostPetForm({ ...lostPetForm, usingItem: e.target.value })}
                      className="w-full wood-inner p-3.5 text-xs border-2 border-[#c9a688]/40 outline-none rounded-2xl placeholder:text-[#8b4513]/40"
                      placeholder="Uso de algum item: (Ex: Coleira)"
                    />
                  </div>
                </div>

                {/* Textarea Caracteristicas */}
                <textarea
                  rows={3}
                  required
                  value={lostPetForm.description}
                  onChange={e => setLostPetForm({ ...lostPetForm, description: e.target.value })}
                  className="w-full wood-inner p-4 text-xs border-2 border-[#c9a688]/40 outline-none rounded-2xl placeholder:text-[#8b4513]/40 font-medium italic resize-none"
                  placeholder="Outras características e detalhes..."
                />

                {/* Local da Ocorrencia */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-red-600 uppercase ml-1">LOCAL DA OCORRÊNCIA</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500 opacity-60" size={16} />
                    <input
                      required
                      value={lostPetForm.occurrenceLocal}
                      onChange={e => setLostPetForm({ ...lostPetForm, occurrenceLocal: e.target.value })}
                      placeholder="Endereço, RA ou ponto de referência..."
                      className="w-full wood-inner pl-11 pr-4 py-4 text-sm border-2 border-red-200 outline-none focus:ring-4 focus:ring-red-500/10 font-bold rounded-3xl"
                    />
                  </div>
                </div>

                {/* Botão Estilizado como a Imagem */}
                <button
                  type="submit"
                  className="w-full grass-bg py-5 rounded-[24px] text-white font-black text-xl shadow-xl border-b-8 border-[#3d7a22] flex items-center justify-center relative overflow-hidden group hover:translate-y-[-2px] transition-all"
                >
                  <div className="absolute inset-y-0 left-[20%] border-l border-white/20 border-dashed"></div>
                  <div className="absolute inset-y-0 right-[20%] border-l border-white/20 border-dashed"></div>
                  <span className="relative z-10">
                    {searchParams.get('alert') === 'found' ? 'Publicar Pet Encontrado' : 'Publicar Alerta Solidário'}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: DENUNCIAR MAUS TRATOS */}
      {isAbuseModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="wood-panel w-full max-w-lg rounded-[40px] border-4 border-red-600 shadow-2xl relative p-8 md:p-10 animate-in zoom-in-95 duration-300">
            <button onClick={() => setIsAbuseModalOpen(false)} className="absolute top-6 right-6 text-red-600 hover:rotate-90 transition-transform bg-white p-2 rounded-full border-2 border-red-600 shadow-md z-10"><X size={24} /></button>

            {isSuccess ? (
              <div className="text-center py-12 space-y-6">
                <div className="w-24 h-24 bg-emerald-500 rounded-full mx-auto flex items-center justify-center border-4 border-emerald-700 shadow-xl animate-bounce">
                  <CheckCircle className="text-white" size={48} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-[#5d2e0a]">Denúncia Enviada</h2>
                  <p className="text-[#8b4513] font-bold italic text-sm px-6">Obrigado por sua coragem. Nossa equipe de gestão analisará os dados e acionará os órgãos competentes com sigilo absoluto.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAbuseSubmit} className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="bg-red-600 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg mb-2">
                    <ShieldAlert size={36} />
                  </div>
                  <h2 className="text-3xl font-black text-red-600 uppercase tracking-tighter">Denúncia Segura</h2>
                  <p className="text-[#8b4513] text-[10px] font-black uppercase tracking-widest bg-red-50 py-1 inline-block px-4 border border-red-100 rounded-full">Sigilo Absoluto • Rede PetMatch DF</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-red-600 uppercase ml-4">Local da Ocorrência</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500 opacity-60" size={16} />
                      <input
                        required
                        value={abuseForm.location}
                        onChange={e => setAbuseForm({ ...abuseForm, location: e.target.value })}
                        placeholder="Endereço, RA ou ponto de referência..."
                        className="w-full wood-inner pl-12 pr-4 py-4 text-sm border-2 border-red-200 outline-none focus:ring-4 focus:ring-red-500/10 font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-red-600 uppercase ml-4">Detalhes dos Maus Tratos</label>
                    <textarea
                      required
                      rows={4}
                      value={abuseForm.description}
                      onChange={e => setAbuseForm({ ...abuseForm, description: e.target.value })}
                      placeholder="Descreva a situação, quantidade de animais e estado de saúde aparente..."
                      className="w-full wood-inner p-5 text-sm border-2 border-red-200 outline-none focus:ring-4 focus:ring-red-500/10 font-medium italic"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-red-600 uppercase ml-4">Anexar Prova (Foto/Vídeo)</label>
                    <div className="wood-inner border-4 border-red-200 border-dashed rounded-3xl h-32 flex flex-col items-center justify-center relative overflow-hidden bg-red-50/30 group">
                      {abuseForm.proofPhoto ? (
                        <img src={abuseForm.proofPhoto} className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Camera className="text-red-400 opacity-40 mb-1" size={32} />
                          <p className="text-[9px] font-black text-red-400 uppercase">Enviar Evidência</p>
                        </>
                      )}
                      <input type="file" accept="image/*,video/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'abuse')} />
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex gap-3">
                  <Info size={20} className="text-amber-600 flex-shrink-0" />
                  <p className="text-[9px] font-bold text-amber-800 leading-tight">
                    Falsa denúncia é crime. Suas informações de rede (IP) são registradas apenas para fins legais de segurança, mas seu perfil permanece anônimo para a comunidade.
                  </p>
                </div>

                <button type="submit" className="w-full bg-red-600 py-5 rounded-2xl text-white font-black text-xl shadow-xl border-b-8 border-red-800 hover:translate-y-[-2px] active:scale-95 transition-all flex items-center justify-center gap-3">
                  ENVIAR DENÚNCIA AGORA <Flag size={24} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SolidarityMap;
