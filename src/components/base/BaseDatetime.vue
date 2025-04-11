<script setup lang="ts">
import {
  IonButton,
  IonButtons,
  IonItem,
  IonLabel,
  IonDatetime,
  IonIcon,
  IonModal,
  IonText,
  // IonDatetimeButton,
} from "@ionic/vue";

import { calendar } from "ionicons/icons";

import { v4 as uuidv4 } from "uuid";
import useDateFormatter from "../../tools/useDateFormatter";
import { DateTime } from "luxon";
import { defineProps, defineEmits, withDefaults, ref } from "vue";

const { formatDate } = useDateFormatter();
const props = withDefaults(
  defineProps<{
    label?: string;
    modelValue?: string;
    min?: string;
    max?: string;
    perQuarter?: boolean;
    disabled?: boolean;
    invalid?: boolean;
    clearable?: boolean;
  }>(),
  {
    label: "",
    min: "",
    max: "",
    perQuarter: false,
    disabled: false,
    invalid: false,
    clearable: false,
  }
);

const openModal = ref(false);
const emit = defineEmits(["update:modelValue"]);

const input = ref();

const confirm = () => {
  input.value.$el.confirm();
  openModal.value = false;
};

const clear = () => {
  openModal.value = false;
  emit("update:modelValue", "");
};

const reset = () => {
  input.value.$el.reset();
};

function updateValue(value: string) {
  if (!openModal.value) {
    return;
  }
  const formattedDate = value
    ? DateTime.fromISO(value || "")
        ?.toSQL({ includeOffset: false })
        ?.slice(0, 16)
    : "";
  emit("update:modelValue", formattedDate);
}

const dateTimeId = uuidv4();
</script>

<template>
  <ion-item @click="openModal = !openModal">
    <ion-label :color="props.invalid ? 'primary' : ''">
      <slot>{{ props.label }}</slot>
    </ion-label>
    <ion-text
      id="open-modal"
      slot="end"
    >
      {{
        props.modelValue ? formatDate(props.modelValue, "dd.LL.yy HH:mm") : ""
      }}
    </ion-text>
    <ion-button
      slot="end"
      fill="clear"
    >
      <ion-icon
        slot="end"
        :icon="calendar"
        :aria-label="props.label"
      />
    </ion-button>
    <ion-modal
      :id="dateTimeId"
      :is-open="openModal"
    >
      <ion-datetime
        ref="input"
        presentation="time-date"
        :min="DateTime.fromSQL(props.min).toISO() ?? undefined"
        :max="DateTime.fromSQL(props.max).toISO() ?? undefined"
        :minute-values="props.perQuarter ? '0,15,30,45' : undefined"
        :disabled="props.disabled"
        :value="DateTime.fromSQL(props.modelValue ?? '').toISO()"
        @ion-change="(ev: any) => updateValue(ev.detail.value)"
      >
        <ion-buttons slot="buttons">
          <ion-button
            v-if="props.clearable"
            @click.prevent="clear()"
          >
            Vide
          </ion-button>
          <ion-button @click.prevent="confirm()">
            Valider
          </ion-button>
          <ion-button @click.prevent="reset()">
            Reset
          </ion-button>
        </ion-buttons>
      </ion-datetime>
    </ion-modal>
  </ion-item>
</template>

<style scoped>
ion-modal {
  --width: auto;
  --height: auto;
}
</style>
