<template>
  <div>
    <ion-segment v-model="presencesSegmentPart">
      <ion-segment-button value="GROUPES">Groupes</ion-segment-button>
      <ion-segment-button value="SAPEURS">Sapeurs</ion-segment-button>
    </ion-segment>
  </div>

  <div padding-top>
    <div v-if="presencesSegmentPart == 'GROUPES'">
      <ion-list>
        <ion-item
          button
          v-for="(groupe, i) of groupes"
          :key="i"
          @click="changeGroupeStatus(groupe.id)"
          :disabled="!intervention.en_creation"
        >
          <span>{{ groupe.prefix }}</span>
          {{
            (groupe.numero ? groupe.numero + " - " : "") +
              groupe.designation
          }}
          <ion-icon
            slot="end"
            :name="
              intervention.groupes.indexOf(groupe.id) === -1
                ? 'radio-button-off'
                : 'checkmark-circle'
            "
          ></ion-icon>
        </ion-item>
      </ion-list>
    </div>

    <div v-if="presencesSegmentPart == 'SAPEURS'">
      <ion-grid>
        <ion-row>
          <ion-col size="4">
            <h1>Présences</h1>
          </ion-col>
          <ion-col size="4">
            <ion-button
              ion-button
              expand="block"
              @click="addPresenceExercice('ARRIVEE')"
              :disabled="!intervention.en_creation"
            >
              <ion-icon slot="start" name="log-in"></ion-icon>Arrivée
            </ion-button>
          </ion-col>
          <ion-col size="4">
            <ion-button
              expand="block"
              @click="addPresenceExercice('DEPART')"
              :disabled="
                !intervention.en_creation ||
                sapeursAvecPresenceExercicesIncompletes.length === 0
              "
            >
              <ion-icon slot="start" name="log-out"></ion-icon>Départ
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- Sapeurs dont il manque la présence -->
      <ion-item-group v-for="(sapeur, i) of sapeursSansPresenceExercices" :key="i">
        <ion-item-divider
          color="light"
          class="text-orange"
          @click="addPresenceExercice('ARRIVEE', sapeur.id)"
        >
          <ion-icon name="warning" item-start></ion-icon>
          {{ sapeur.nom }} {{ sapeur.prenom }} - Présence manquante
        </ion-item-divider>
      </ion-item-group>

      <!-- Présences des sapeurs -->
      <ion-item-group v-for="(sapeur, i) in intervention.sapeurs" :key="i">
        <ion-item-divider color="light">{{ sapeur.nom }} {{ sapeur.prenom }}</ion-item-divider>
        <ion-item
          button
          v-for="(presence, j) in sapeur.presences"
          :key="j"
          :disabled="!intervention.en_creation"
          @click="editPresenceExercice(i, j)"
        >
          {{ formatDate(presence.date_debut, "HH:mm") }} -
          {{ formatDate(presence.date_fin, "HH:mm") }}
          <ion-button @click="removePresenceExercice(i, j, $event)" fill="clear" color="dark">
            <ion-icon slot="icon-only" name="close"></ion-icon>
          </ion-button>
        </ion-item>
      </ion-item-group>
    </div>
  </div>
</template>

<script lang="ts" setup>

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </script>