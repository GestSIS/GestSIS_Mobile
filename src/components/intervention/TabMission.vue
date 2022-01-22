<template>
  <ion-grid>
    <ion-row>
      <ion-col size="8">
        <h1>Missions</h1>
      </ion-col>
      <ion-row size="4">
        <ion-button expand="block" @click="addMission()" :disabled="!intervention.en_creation">
          <ion-icon slot="start" name="add"></ion-icon>Nouvelle mission
        </ion-button>
      </ion-row>
    </ion-row>
  </ion-grid>

  <ion-list>
    <button
      ion-item
      v-for="(mission, i) in intervention.missions"
      :key="i"
      @click="editMission(mission)"
      :disabled="!intervention.en_creation"
    >
      <ion-icon slot="start" :name="mission.date_fin ? 'checkmark' : 'time'"></ion-icon>
      {{ mission.titre }} - {{ mission.sapeur.nom }}
      {{ mission.sapeur.prenom }}
      <p>{{ formatDate(mission.date_debut, "HH:mm 'le' dd.MM.yyyy") }}</p>
      <p>{{ mission.resume }}</p>
    </button>
  </ion-list>
</template>

<script lang="ts" setup>

</script>