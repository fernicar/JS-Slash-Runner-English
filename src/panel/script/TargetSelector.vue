<template>
  <Popup :buttons="[{ name: t`Confirm`, shouldEmphasize: true, onClick: submit }, { name: t`Cancel` }]" width="fit">
    <Selector v-model="target" :title="t`Select creation target`" :options="options" />
  </Popup>
</template>

<script setup lang="ts">
import { useCharacterSettingsStore } from '@/store/settings';

const emit = defineEmits<{
  submit: [target: 'global' | 'character' | 'preset'];
}>();
function submit(close: () => void) {
  emit('submit', target.value);
  close();
}

const props = withDefaults(
  defineProps<{
    target?: 'global' | 'character' | 'preset';
  }>(),
  {
    target: 'global',
  },
);

const target = ref<'global' | 'character' | 'preset'>(props.target);

const character_name = toRef(useCharacterSettingsStore(), 'name');
const options = computed(() => {
  let result = _<{ label: string; value: 'global' | 'character' | 'preset' }>([]);
  result = result.push({ label: t`Global Script Library`, value: 'global' });
  if (character_name.value !== undefined) {
    result = result.push({ label: t`Character Script Library`, value: 'character' });
  }
  result = result.push({ label: t`Preset Script Library`, value: 'preset' });
  return result.value();
});
</script>
