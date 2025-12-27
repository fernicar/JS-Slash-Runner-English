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
      <div class="flex items-center justify-center gap-0.5">
        <h3>{{ t`Import Audio Links` }}</h3>
      </div>

      <!-- Tab Switch Buttons -->
      <div class="mb-0.5 flex items-center gap-0.25">
        <button
          class="menu_button interactable flex-1"
          :class="{ 'bg-(--SmartThemeQuoteColor)! font-bold filter-none!': active_tab === 'single' }"
          @click="active_tab = 'single'"
        >
          {{ t`Single Add` }}
        </button>
        <button
          class="menu_button interactable flex-1"
          :class="{ 'bg-(--SmartThemeQuoteColor)! font-bold filter-none!': active_tab === 'batch' }"
          @click="active_tab = 'batch'"
        >
          {{ t`Batch Import` }}
        </button>
      </div>

      <!-- Single Add Mode -->
      <div v-if="active_tab === 'single'" class="flex flex-col gap-0.5">
        <div v-for="(item, index) in items" :key="index" class="flex items-center gap-0.25">
          <div class="flex w-full gap-0.25">
            <input v-model="item.title" type="text" :placeholder="t`Title (Optional)`" class="text_pole flex-1" />
            <input v-model="item.url" type="text" :placeholder="t`Audio Link URL`" class="text_pole flex-2" />
          </div>
          <button
            v-if="items.length > 1"
            class="menu_button interactable bg-(--crimson70a)!"
            @click="removeItem(index)"
          >
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
        <button class="menu_button interactable w-full!" @click="addItem">
          <i class="fa-solid fa-plus"></i> {{ t`Add More` }}
        </button>
      </div>

      <!-- Batch Import Mode -->
      <div v-else-if="active_tab === 'batch'" class="flex flex-col gap-0.5">
        <small>
          {{ t`One link per line, optional format: URL or URL,Title` }}
        </small>
        <textarea
          v-model="batch_text"
          :placeholder="
            t`Example:&#10;https://example.com/audio1.mp3&#10;https://example.com/audio2.mp3,My Music&#10;https://example.com/audio3.mp3`
          "
          rows="10"
          class="text_pole font-(family-name:--monoFontFamily)!"
        />
      </div>
    </div>
  </Popup>
</template>

<script setup lang="ts">
import { handle_url_to_title } from '@/function/audio';
import Popup from '@/panel/component/Popup.vue';

const props = defineProps<{
  onSubmit: (items: { title: string; url: string }[]) => void;
}>();

const active_tab = ref<'single' | 'batch'>('single');
const items = ref<{ title: string; url: string }[]>([{ url: '', title: '' }]);
const batch_text = ref('');

const submit = (close: () => void) => {
  let validItems: { title: string; url: string }[] = [];

  if (active_tab.value === 'single') {
    // Single Add Mode: Filter valid items (at least has URL)
    validItems = items.value
      .filter(item => item.url.trim() !== '')
      .map(item => {
        const url = item.url.trim();
        const title = item.title.trim();

        // If title is empty, automatically extract title from URL
        const finalTitle = title || handle_url_to_title(url);

        return {
          url,
          title: finalTitle,
        };
      });
  } else {
    // Batch Import Mode: Parse multiline text
    validItems = batch_text.value
      .split('\n')
      .map(line => line.trim())
      .filter(line => line !== '')
      .map(line => {
        // Use comma to separate URL and title
        const parts = line.split(',').map(part => part.trim());
        const url = parts[0];
        const title = parts[1] || handle_url_to_title(url);

        return {
          url,
          title,
        };
      });
  }

  if (validItems.length > 0) {
    props.onSubmit(validItems);
  }
  close();
};

const addItem = () => {
  items.value.push({ url: '', title: '' });
};

const removeItem = (index: number) => {
  items.value.splice(index, 1);
};
</script>
