<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    name:
      | 'teacher'
      | 'student'
      | 'graduation-cap'
      | 'books'
      | 'school'
      | 'bulb'
      | 'calendar'
      | 'backpack'
      | 'memo'
      | 'pencil'
      | 'bell'
      | 'clipboard';
    size?: number | string;
    alt?: string;
    floating?: boolean;
    reverseFloating?: boolean;
  }>(),
  {
    size: 24,
    alt: '',
    floating: false,
    reverseFloating: false,
  },
);

const iconMap: Record<string, string> = {
  teacher: '/images/fluent-3d/teacher-3d.png',
  student: '/images/fluent-3d/student-3d.png',
  'graduation-cap': '/images/fluent-3d/graduation-cap-3d.png',
  books: '/images/fluent-3d/books-3d.png',
  school: '/images/fluent-3d/school-3d.png',
  bulb: '/images/fluent-3d/light-bulb-3d.png',
  calendar: '/images/fluent-3d/calendar-3d.png',
  backpack: '/images/fluent-3d/backpack-3d.png',
  memo: '/images/fluent-3d/memo-3d.png',
  pencil: '/images/fluent-3d/pencil-3d.png',
  bell: '/images/fluent-3d/bell-3d.png',
  clipboard: '/images/fluent-3d/clipboard-3d.png',
};

const src = computed(() => iconMap[props.name] || '/images/fluent-3d/books-3d.png');

const formattedSize = computed(() => {
  if (typeof props.size === 'number') {
    return `${props.size}px`;
  }
  const raw = String(props.size ?? '').trim();
  if (!raw) return '24px';
  if (/^\d+(\.\d+)?$/.test(raw)) {
    return `${raw}px`;
  }
  return raw;
});

const sizeStyle = computed(() => {
  const s = formattedSize.value;
  return {
    width: s,
    height: s,
    minWidth: s,
    minHeight: s,
    maxWidth: s,
    maxHeight: s,
  };
});
</script>

<template>
  <img
    :src="src"
    :alt="alt || name"
    :style="sizeStyle"
    class="tw-inline-block tw-align-middle tw-object-contain tw-drop-shadow-sm tw-pointer-events-none tw-select-none tw-shrink-0"
    :class="{
      'fc-popout-float': floating,
      'fc-popout-float-reverse': reverseFloating,
    }"
    loading="lazy"
    decoding="async"
  />
</template>
