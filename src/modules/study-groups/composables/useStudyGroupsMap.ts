import { shallowRef } from 'vue';
import L from 'leaflet';
import 'leaflet.markercluster';
import type { StudyGroupPublic, StudyGroupMarker } from '../types/study-group.types';

export function useStudyGroupsMap() {
  // Instâncias blindadas com shallowRef para evitar reatividade intrusiva do Vue 3 Proxy
  const mapInstanceRef = shallowRef<L.Map | null>(null);
  const clusterGroupRef = shallowRef<L.MarkerClusterGroup | null>(null);
  const currentTileLayer = shallowRef<L.TileLayer | null>(null);

  /**
   * Alterna a camada de mapa (Tiles) de acordo com o modo de iluminação do Quasar
   */
  function applyThemeLayer(isDark: boolean) {
    const map = mapInstanceRef.value;
    if (!map) return;

    if (currentTileLayer.value) {
      map.removeLayer(currentTileLayer.value);
    }

    const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const tileLayer = L.tileLayer(tileUrl, {
      subdomains: 'abc',
      minZoom: 3,
      maxZoom: 19,
      keepBuffer: 3,
      updateWhenZooming: false,
      updateWhenIdle: true,
      className: isDark ? 'map-tiles-dark' : '',
    });

    tileLayer.addTo(map);
    currentTileLayer.value = tileLayer;
  }

  /**
   * Inicializa o mapa Leaflet no contêiner HTML indicado com maxZoom obrigatório
   */
  function initMap(
    containerId: string,
    isDark = false,
    initialLat = -14.235,
    initialLng = -51.9253,
    initialZoom = 4,
  ): L.Map {
    if (mapInstanceRef.value) {
      mapInstanceRef.value.remove();
      mapInstanceRef.value = null;
    }

    const map = L.map(containerId, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      minZoom: 3,
      maxZoom: 19,
      zoomControl: false,
      attributionControl: false,
    });

    // Reposiciona o controle de zoom no canto inferior direito
    L.control
      .zoom({
        position: 'bottomright',
      })
      .addTo(map);

    mapInstanceRef.value = map;

    // Aplica o tema de tiles antes de adicionar os clusters
    applyThemeLayer(isDark);

    // Cria o grupo de clusters nativo
    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      zoomToBoundsOnClick: true,
      disableClusteringAtZoom: 18,
    });

    map.addLayer(clusterGroup);
    clusterGroupRef.value = clusterGroup;

    return map;
  }

  /**
   * Limpa todos os marcadores existentes
   */
  function clearMarkers() {
    if (clusterGroupRef.value) {
      clusterGroupRef.value.clearLayers();
    }
  }

  /**
   * Renderiza os grupos de estudo no mapa com ícones semânticos customizados
   */
  function renderMarkers(
    groups: StudyGroupPublic[],
    onSelectGroup: (group: StudyGroupPublic) => void,
  ) {
    if (!clusterGroupRef.value || !mapInstanceRef.value) return;

    clearMarkers();

    const markers: L.Marker[] = [];

    for (const group of groups) {
      if (!group.lat || !group.lng) continue;

      const isMonitoria = group.tipo === 'monitoria';
      const isProjeto = group.tipo === 'projeto';
      const badgeColor = isMonitoria ? '#10b981' : isProjeto ? '#f59e0b' : 'var(--q-primary, #1976d2)';
      const iconName = isMonitoria ? 'school' : isProjeto ? 'architecture' : 'groups';

      // Ícone SVG moderno embutido como divIcon
      const customHtml = `
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${badgeColor};
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          border: 2px solid white;
          cursor: pointer;
          transition: transform 0.2s ease;
        " class="hover:tw-scale-110">
          <span class="material-icons" style="font-size: 18px;">${iconName}</span>
        </div>
      `;

      const customIcon = L.divIcon({
        html: customHtml,
        className: 'custom-study-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([group.lat, group.lng], {
        icon: customIcon,
      }) as StudyGroupMarker;

      marker.studyGroupId = group.id;

      // Popup informativo elegante no padrão Find My Pockets
      const schedulePopup = group.dia_reuniao || group.dia_semana || '';
      const timePopup = group.horario_reuniao || group.horario || '';
      const localPopup = group.local_especifico || group.sala ? `Local: ${group.local_especifico || ('Sala ' + group.sala)}` : '';
      const criadorPopup = group.criador_nome ? `Monitor: ${group.criador_nome}` : '';

      marker.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; padding: 6px; min-width: 200px; line-height: 1.4;">
          <strong style="display: block; font-size: 14px; margin-bottom: 2px;">${group.nome}</strong>
          <span style="font-size: 12px; color: #64748b; display: block;">${group.instituicao}${group.campus ? ' · ' + group.campus : ''}</span>
          ${localPopup ? `<span style="font-size: 11px; color: #475569; display: block; margin-top: 2px;">${localPopup}</span>` : ''}
          ${schedulePopup || timePopup ? `<span style="font-size: 11px; color: #475569; display: block; margin-top: 2px;">📅 ${schedulePopup} ${timePopup ? 'às ' + timePopup : ''}</span>` : ''}
          ${criadorPopup ? `<span style="font-size: 11px; color: #64748b; display: block; margin-top: 2px;">👤 ${criadorPopup}</span>` : ''}
          <div style="margin-top: 6px; font-size: 11px; font-weight: bold; color: ${badgeColor};">
            ${isMonitoria ? 'Monitoria' : isProjeto ? 'Projeto' : group.tipo === 'reforco' ? 'Reforço' : 'Grupo de Estudos'}
          </div>
        </div>
      `);

      marker.on('click', () => {
        onSelectGroup(group);
      });

      markers.push(marker);
    }

    clusterGroupRef.value.addLayers(markers);
  }

  /**
   * Move suavemente a câmera para as coordenadas do grupo selecionado
   */
  function flyToGroup(group: StudyGroupPublic, zoom = 15) {
    if (!mapInstanceRef.value || !group.lat || !group.lng) return;

    mapInstanceRef.value.flyTo([group.lat, group.lng], zoom, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }

  /**
   * Força o Leaflet a recalcular suas dimensões (prevenção do bug de tiles cinzas)
   */
  function invalidateSize() {
    if (mapInstanceRef.value) {
      mapInstanceRef.value.invalidateSize();
    }
  }

  return {
    mapInstanceRef,
    clusterGroupRef,
    initMap,
    applyThemeLayer,
    clearMarkers,
    renderMarkers,
    flyToGroup,
    invalidateSize,
  };
}
