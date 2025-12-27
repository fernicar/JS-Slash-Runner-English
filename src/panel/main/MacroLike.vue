<template>
  <Item type="box">
    <template #title>{{ t`Disable Tavern Helper Macros` }}</template>
    <template #description>
      {{ t`When writing variable character cards instead of testing/playing character cards, turn on this switch to avoid macros like \{\{get_message_variable::variable\}\} being replaced` }}
    </template>
    <template #content>
      <Toggle :id="`TH-macro-disabled`" v-model="disabled" />
    </template>
  </Item>
</template>

<script setup lang="ts">
import { useGlobalSettingsStore } from '@/store/settings';

const enabled = toRef(useGlobalSettingsStore().settings.macro, 'enabled');
const disabled = useNegate(enabled);
</script>
