<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useStudyGroupsMap } from '../composables/useStudyGroupsMap';
import { useStudyGroupStore } from '../stores/study-group.store';

const $q = useQuasar();
const store = useStudyGroupStore();

const {
  initMap,
  applyThemeLayer,
  renderMarkers,
  flyToGroup,
  invalidateSize,
  mapInstanceRef,
} = useStudyGroupsMap();

onMounted(async () => {
  try {
    // Inicializa o mapa com centro no Brasil e camada de tiles correspondente ao tema
    initMap('study-map-container', $q.dark.isActive);

    // Carrega os dados se ainda não tiverem sido carregados
    if (store.groups.length === 0) {
      await store.loadPublicGroups();
    }

    // Renderiza marcadores iniciais
    renderMarkers(store.filteredGroups, (group) => {
      store.selectGroup(group);
    });
  } catch (err) {
    console.error('[LeafletMapCore] Erro durante a montagem do mapa:', err);
  } finally {
    // Garante que o Leaflet calcule as dimensões corretas após o mount
    setTimeout(() => {
      invalidateSize();
    }, 250);
  }
});

onUnmounted(() => {
  if (mapInstanceRef.value) {
    mapInstanceRef.value.remove();
  }
});

// Reage a mudanças de tema do Quasar (Dark / Light)
watch(
  () => $q.dark.isActive,
  (isDark) => {
    applyThemeLayer(isDark);
  },
);

// Re-renderiza marcadores quando o filtro ou a lista mudar
watch(
  () => store.filteredGroups,
  (newGroups) => {
    renderMarkers(newGroups, (group) => {
      store.selectGroup(group);
    });
  },
  { deep: true },
);

// Centraliza a câmera no grupo selecionado
watch(
  () => store.selectedGroup,
  (group) => {
    if (group) {
      flyToGroup(group);
    }
  },
);

// Mantém o mapa responsivo a rotação e redimensionamento de tela
watch(
  () => [$q.screen.width, $q.screen.height],
  () => {
    invalidateSize();
  },
);

defineExpose({
  invalidateSize,
});
</script>

<template>
  <div
    id="study-map-container"
    class="tw-w-full tw-h-full tw-absolute tw-top-0 tw-left-0 tw-z-0"
  ></div>
</template>

<style>
/* Fundo neutro enquanto os tiles do mapa carregam */
#study-map-container {
  background: var(--q-dark-page, #f8f9fa);
}

/* Inversão elegante e calibrada para Dark Mode nos tiles do OpenStreetMap */
.map-tiles-dark {
  filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
}

/* Oculta completamente a barra de créditos de contribuidores do Leaflet */
.leaflet-control-attribution {
  display: none !important;
}

/* Customização para integrar os clusters ao Design System do Ficou Claro */
.marker-cluster-small,
.marker-cluster-medium,
.marker-cluster-large {
  background-color: rgba(2, 132, 199, 0.2) !important;
}

.marker-cluster-small div,
.marker-cluster-medium div,
.marker-cluster-large div {
  background-color: var(--q-primary, #0284c7) !important;
  color: #ffffff !important;
  font-family: 'Inter', sans-serif !important;
  font-weight: 700 !important;
}

.custom-study-marker {
  background: transparent;
  border: none;
}
</style>
