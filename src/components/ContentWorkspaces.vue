<template>
  <v-container >

    <v-dialog v-model="dialog" max-width="500px" persistent no-click-animation transition="">
      <v-card>
        <v-card-title>
          <span class="headline">Workspace</span>
        </v-card-title>
        <v-card-text>
          <v-text-field  v-model="name" label="Name" ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="validate" :loading="loader_dialog" >Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-layout >
      <v-flex>
        <v-card>
          <v-card-title>
            <v-btn dark color="blue" @click="addWorkspace">New Workspace</v-btn>
            <v-spacer></v-spacer>
            <v-text-field v-model="search" append-icon="search" label="Search" ></v-text-field>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
                <v-data-table :headers="headers" :items="datamodel" :items-per-page="10" :search="search" :loading="loader" loading-text="Loading... Please wait" show-select v-model="selected" ></v-data-table>
                <div>
                    <v-btn v-if="selected.length != 0" dark color="red" @click="deleteWorkspaces">
                      <v-icon>delete</v-icon> Remove
                    </v-btn>
                </div>
        </v-card-text>
      </v-card> 
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import { BackendApi } from '@/backend.js'
  import { EventBus } from '@/main'

  export default {
    data: () => ({
      selected: [],
      dialog: false,
      loader: false,
      loader_dialog: false,
      search: '',
      headers: [   { text: 'Name', align: 'left', value: 'name' } ],
      datamodel: [],
      name: ""
    }),
    created () {
      // update the name of the current page
      EventBus.$emit('CurrentPageChanged', { name: "Workspaces", position: 7} )

      // get workspace list from server
      this.getWorkspacesListing()
    },
    methods: {
      // get workspaces
      getWorkspacesListing(){
        this.loader = true
        this.datamodel = []
        BackendApi.getWorkspaces().then(resp => {
          if ( resp != undefined) {
              for (var i = 0; i < resp.workspaces.length; ++i) {
                this.datamodel.push( {"name": resp.workspaces[i], "id": i} )
              }
          }
          this.loader = false
        })
      },

      // delete selected workspaces
      deleteWorkspaces(){
        for (var i = 0; i < this.selected.length; ++i) {
          this.deleteWorkspace(this.selected[i].name)
        }
        // reset selected items
        this.selected = []
      },

      // delete a workspace in the server
      deleteWorkspace (workspace) {
        BackendApi.deleteWorkspace(workspace).then(resp => {
            if ( resp != undefined) {
              this.getWorkspacesListing()
            }  
        })
      },

      // create a new workspace
      addWorkspace() {
        // show the dialog
        this.dialog = true
      },

      // close the dialog
      close () {
        // hide the dialog
        this.dialog = false
      },

      // create/edit a workspace to the server
      async validate () {
        // enable progress
        this.loader_dialog = true
          await BackendApi.addWorkspace(this.name).then(resp => {
            if ( resp != undefined) {
              // reload the list
              this.getWorkspacesListing()
            }  
          })

        // disable progress
        this.loader_dialog = false

        // close and reset the form
        this.close()
      }
    }
  }
</script>