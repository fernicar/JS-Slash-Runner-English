<template>
  <Popup width="wide" :buttons="[{ name: 'Update', shouldEmphasize: true, onClick: onConfirm }, { name: 'Cancel' }]">
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="p-1.5 text-left" v-html="changelog" />
  </Popup>
</template>

<script setup lang="ts">
import { getChangelogHtml, update } from '@/panel/main/update';

const changelog = ref<string>(t`<div>Changelog loading...</div>`);
onMounted(async () => {
  changelog.value = await getChangelogHtml();
});

async function onConfirm(close: () => void) {
  await update();
  close();
}
</script>
