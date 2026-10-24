import { defineBoot } from '#q-app';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';

// Registra os plugins gratuitos essenciais do GSAP
gsap.registerPlugin(Draggable);

export default defineBoot(({ app }) => {
  // Disponibiliza o GSAP globalmente para o ecossistema Vue
  app.config.globalProperties.$gsap = gsap;
});

// Exporta as instâncias configuradas para uso tipado nos módulos
export { gsap, Draggable };
