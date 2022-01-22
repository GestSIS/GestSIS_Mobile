<template>
  <ion-grid>
    <ion-row>
      <ion-col size="8">
        <h1>Appels</h1>
      </ion-col>
      <ion-col size="4">
        <ion-button expand="block" @click="addCall()" :disabled="!intervention.en_creation">
          <ion-icon name="add" slot="start"></ion-icon>Nouvel appel
        </ion-button>
      </ion-col>
    </ion-row>
  </ion-grid>

  <ion-list>
    <button
      ion-item
      v-for="(appel, i) in intervention.appels"
      :key="i"
      @click="editCall(appel)"
      :disabled="!intervention.en_creation"
    >
      {{ appel.nom }} - {{ appel.numero }}
      <p>Appelé à {{ formatDate(appel.date, "HH:mm 'le' dd.MM.yyyy") }}</p>
      <p>{{ appel.commentaire }}</p>
      <ion-button @click="removeCall(i, $event)" fill="clear" color="dark">
        <ion-icon slot="icon-only" name="close"></ion-icon>
      </ion-button>
    </button>
  </ion-list>
</template>

<script lang="ts" setup>

</script>