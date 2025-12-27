<template>
  <Item v-model="is_expanded" type="box">
    <template #title>{{ t`Player` }}</template>
    <template #description>{{ t`Global Audio Player` }}</template>
    <template #content>
      <Toggle id="TH-toolbox-audio-player-enabled" v-model="enabled" @click.stop />
    </template>
    <template #detail>
      <div class="flex max-w-full flex-col gap-1" :class="{ 'opacity-50': !enabled }">
        <Controller v-model="bgm" :title="t`Music`" :enabled="enabled" :audio-type="'bgm'" />
        <Controller v-model="ambient" :title="t`Sound Effect`" :enabled="enabled" :audio-type="'ambient'" />
      </div>
    </template>
  </Item>
</template>

<script setup lang="ts">
import Controller from '@/panel/toolbox/audio_player/Controller.vue';
import { useAmbientAudioStore, useBgmAudioStore } from '@/store/audio';
import { useGlobalSettingsStore } from '@/store/settings';

const is_expanded = useLocalStorage('TH-AudioPlayer:is_expanded', false);

const { enabled } = toRefs(useGlobalSettingsStore().settings.audio);
const bgm = useBgmAudioStore();
const ambient = useAmbientAudioStore();
</script>
