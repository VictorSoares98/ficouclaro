<script setup lang="ts">
const currentYear = new Date().getFullYear();
</script>

<template>
  <!-- AppFooter: Exibido apenas em viewports gt-sm (>=1024px) -->
  <q-footer class="tw-bg-gray-100 dark:tw-bg-dark tw-text-gray-600 dark:tw-text-gray-400 tw-py-4 gt-sm">
    <div class="tw-container tw-mx-auto tw-px-4 tw-flex tw-justify-between tw-items-center">
      <div class="tw-text-sm">
        &copy; {{ currentYear }} Ficou Claro? Todos os direitos reservados.
      </div>
      <div class="tw-flex tw-space-x-6 tw-text-sm">
        <!-- Links para as novas páginas institucionais -->
        <router-link to="/sobre" class="hover:tw-text-primary tw-transition-colors">Sobre</router-link>
        <router-link to="/ajuda" class="hover:tw-text-primary tw-transition-colors">Ajuda</router-link>
        <router-link to="/termos" class="hover:tw-text-primary tw-transition-colors">Termos</router-link>
        <router-link to="/privacidade" class="hover:tw-text-primary tw-transition-colors">Privacidade</router-link>
      </div>
    </div>
  </q-footer>
</template>
