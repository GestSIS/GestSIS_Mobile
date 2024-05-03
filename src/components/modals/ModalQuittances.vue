<script lang="ts" setup>
import { defineProps } from "vue";
import {
  IonToolbar,
  IonTitle,
  IonButtons,
  IonHeader,
  IonList,
  IonContent,
  IonButton,
  IonItem,
  modalController,
  IonLabel,
  IonItemGroup,
  IonItemDivider,
  IonBadge,
} from "@ionic/vue";
import { Alarme } from "../../models/alarme";
import useAuth from "../../store/useAuth";
const { activeSisKey } = useAuth();
const props = defineProps<{ alarme: Alarme }>();

const dismiss = () => {
  modalController.dismiss(null);
};

const groupes = props.alarme.groups
  .filter((g) => g.sis === activeSisKey.value)
  .sort((g1, g2) => g1.number.localeCompare(g2.number));
</script>

<template>
  <ion-header>
    <ion-toolbar>
      <ion-title
        >Quittances
        <ion-badge
          >{{
            props.alarme.firefighters.filter((f) => f.sis === activeSisKey)
              .length +
            props.alarme.unresolved.filter((f) => f.sis == activeSisKey).length
          }}
        </ion-badge></ion-title
      >
      <ion-buttons slot="primary">
        <ion-button @click="dismiss()">Annuler</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-list>
      <ion-item-group v-for="g in groupes" :key="g.sis">
        <ion-item-divider>
          <ion-label
            >{{ g.sis.toUpperCase() }} : {{ g.number }} -
            {{ g.name }}</ion-label
          ><ion-badge slot="end"
            >{{
              props.alarme.firefighters.filter((f) => f.group_name == g.name)
                .length +
              props.alarme.unresolved.filter((f) => f.group_name == g.name)
                .length
            }}
            quittances</ion-badge
          >
        </ion-item-divider>
        <ion-item
          v-for="s in props.alarme.firefighters.filter(
            (f) => f.group_name == g.name
          )"
          :key="s.id"
        >
          {{ s.fullname }}
        </ion-item>
        <ion-item
          v-for="s in props.alarme.unresolved.filter(
            (f) => f.group_name == g.name
          )"
          :key="s.fullname"
        >
          {{ s.fullname }}
        </ion-item>
      </ion-item-group>
    </ion-list>
  </ion-content>
</template>

<style></style>
