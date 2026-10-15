import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAsyncOperation } from '@/core/composables/useAsyncOperation';
import { studyGroupService } from '../services/study-group.service';
import type {
  StudyGroupPublic,
  StudyGroupFilterState,
  StudyGroupType,
} from '../types/study-group.types';

export const useStudyGroupStore = defineStore('studyGroup', () => {
  const groups = ref<StudyGroupPublic[]>([]);
  const selectedGroup = ref<StudyGroupPublic | null>(null);

  const filters = ref<StudyGroupFilterState>({
    search: '',
    type: 'all',
  });

  const { isLoading, error, execute } = useAsyncOperation();

  /**
   * Grupos filtrados com base na busca textual e tipo de grupo
   */
  const filteredGroups = computed(() => {
    const searchLower = filters.value.search.trim().toLowerCase();
    const typeFilter = filters.value.type;

    return groups.value.filter((group) => {
      // Filtro por tipo
      if (typeFilter !== 'all' && group.tipo !== typeFilter) {
        return false;
      }

      // Filtro textual (Nome, Instituição, Campus)
      if (searchLower) {
        const matchName = group.nome.toLowerCase().includes(searchLower);
        const matchInst = group.instituicao.toLowerCase().includes(searchLower);
        const matchCampus = (group.campus || '').toLowerCase().includes(searchLower);
        if (!matchName && !matchInst && !matchCampus) {
          return false;
        }
      }

      return true;
    });
  });

  /**
   * Carrega todos os grupos públicos da view do banco de dados
   */
  async function loadPublicGroups() {
    await execute(async () => {
      groups.value = await studyGroupService.getPublicStudyGroups();
    }, 'Erro ao carregar grupos de estudo.');
  }

  /**
   * Seleciona um grupo de estudo ativo para foco no mapa
   */
  function selectGroup(group: StudyGroupPublic | null) {
    selectedGroup.value = group;
  }

  /**
   * Atualiza o termo de busca
   */
  function setSearch(search: string) {
    filters.value.search = search;
  }

  /**
   * Atualiza o filtro de tipo de grupo
   */
  function setTypeFilter(type: 'all' | StudyGroupType) {
    filters.value.type = type;
  }

  return {
    groups,
    selectedGroup,
    filters,
    filteredGroups,
    isLoading,
    error,
    loadPublicGroups,
    selectGroup,
    setSearch,
    setTypeFilter,
  };
});
