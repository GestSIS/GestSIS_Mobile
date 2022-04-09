<script setup lang="ts">
import useDateFormatter from '@/tools/useDateFormatter';
import { DateTime } from 'luxon';
import { defineProps, defineEmits, ref } from 'vue'

const { formatDate } = useDateFormatter();
const props = defineProps<{
  min: number,
  max: number,
  perQuarter: boolean,
  label: string,
  modelValue: string,
}>();

const openModal = ref(false);
const emit = defineEmits(['update:modelValue'])

function updateValue(value: string) {
  DateTime.fromISO(value || '').toSQL({ includeOffset: false }).slice(0, 16) || ''
  emit('update:modelValue', value)
}
</script>

<template>
  <ion-item @click="openModal = !openModal">
    <ion-label>{{ props.label }}</ion-label>
    <ion-text
      slot="end"
      id="open-modal"
    >{{ modelValue ? formatDate(modelValue, 'dd.LL.yy HH:mm') : '' }}</ion-text>
    <ion-button fill="clear" slot="end">
      <ion-icon slot="end" name="calendar" />
    </ion-button>
    <ion-modal :is-open="openModal">
      <ion-datetime
        presentation="time-date"
        :minuteValues="perQuarter ? '0,15,30,45' : ''"
        :value="DateTime.fromSQL(modelValue).toISO()"
        @ionChange="(ev: any) => updateValue(ev.detail.value)"
      />
    </ion-modal>
  </ion-item>
</template>