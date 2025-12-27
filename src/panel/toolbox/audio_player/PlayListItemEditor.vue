<template>
  <Popup
    :buttons="[
      {
        name: t`Confirm`,
        shouldEmphasize: true,
        onClick: submit,
      },
      { name: t`Cancel` },
    ]"
  >
    <div class="flex flex-col gap-0.5">
      <h3>{{ t`Edit Audio Item` }}</h3>
      <div class="flex flex-col gap-0.5">
        <label>
          <strong>{{ t`Title` }}</strong
          ><small class="block">{{ t`Leave empty to automatically extract filename from link` }}</small>
          <input v-model="title" type="text" class="text_pole" :placeholder="t`Audio title (optional)`" />
        </label>
        <label>
          <strong>{{ t`Link` }}</strong>
          <input v-model="url" type="text" class="text_pole" :placeholder="t`Audio link`" required />
        </label>
      </div>
    </div>
  </Popup>
</template>

<script setup lang="ts">
import { handle_url_to_title } from '@/function/audio';

const props = defineProps<{
  item: { title: string; url: string };
  onSubmit: (item: { title: string; url: string }) => void;
}>();

const url = ref(props.item.url);
const title = ref(props.item.title || '');

const submit = (close: () => void) => {
  if (!url.value.trim()) {
    return;
  }

  // If title is empty, automatically extract title from URL
  const finalTitle = title.value.trim() || handle_url_to_title(url.value);

  props.onSubmit({
    url: url.value,
    title: finalTitle,
  });
  close();
};
</script>
