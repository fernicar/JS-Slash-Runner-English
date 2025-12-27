<template>
  <Item type="box">
    <template #title>{{ t`Live Monitoring` }}</template>
    <template #description>{{ t`Connect to authoring templates to sync code changes to SillyTavern in real-time` }}</template>
    <template #content>
      <i class="fa-solid fa-wifi mr-0.5" :style="{ color: connected ? 'green' : 'rgb(170, 0, 0)' }" />
    </template>
    <template #detail>
      <div class="flex flex-wrap items-center justify-between gap-0.5">
        <div class="flex-container">
          <div class="flex items-center">
            <input v-model="enabled" type="checkbox" style="margin: 0 5px 0 1px" />
            <span style="margin-right: 10px">{{ t`Enable Monitoring` }}</span>
          </div>
          <div class="flex items-center">
            <input v-model="enable_echo" type="checkbox" style="margin: 0 5px 0 1px" />
            <span>{{ t`Enable Error Popups` }}</span>
          </div>
        </div>
        <div class="menu_button menu_button_icon interactable">
          <a
            href="https://n0vi028.github.io/JS-Slash-Runner-Doc/guide/基本用法/如何正确使用酒馆助手.html"
            target="_blank"
          >
            <small><i class="fa-solid fa-book" style="margin-right: 5px" />{{ t`Usage Guide` }}</small>
          </a>
        </div>
      </div>
      <div class="flex flex-col flex-wrap gap-0.5">
        <div class="flex flex-col">
          <b>{{ t`Refresh Interval (ms)` }}</b>
          <input v-model="duration" class="text_pole" type="number" min="1" />
        </div>
      </div>
    </template>
  </Item>
</template>

<script setup lang="ts">
import { useListener } from '@/panel/main/listener';
import { useGlobalSettingsStore } from '@/store/settings';

const { enabled, enable_echo, url, duration } = toRefs(useGlobalSettingsStore().settings.listener);
const connected = useListener(enabled, enable_echo, url, duration);
</script>
