<template>
  <v-container >
    <v-layout >
      <v-flex  >
        <v-card>
          <v-card-title>
            <v-toolbar flat color="blue" dense >
              <v-btn :disabled="! is_modified" color="white" text class="my-2" @click="saveChanges">
                  <v-icon>save</v-icon>
              </v-btn>
            </v-toolbar>
          </v-card-title>
          <v-card-text>
            <editor ref='editor' v-model="globals_content" lang="yaml" theme="chrome" width="100%" height="500px" @init="init_editor"></editor>
          </v-card-text>
        </v-card> 
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import { EventBus } from '@/main'
  import { BackendApi } from '@/backend.js'
  const aceeditor = require('vue2-ace-editor')

  export default {
    props: {
        current_workspace: String
    },
    components: {
        editor: aceeditor
    },
    data: () => ({
      globals_content: "",
      is_modified: false,
      is_ready: false
    }),
    beforeDestroy () {
        // enable event
        EventBus.$off('ManualRefresh', this.refreshGlobals)
    },
    async created () {
      // update the name of the current page
      EventBus.$emit('CurrentPageChanged', { name: "Globals", position: 3} )

      // enable event
      EventBus.$on('ManualRefresh', this.refreshGlobals)

      // enable the progress bar
      this.refreshGlobals()
    },
    watch: {
      current_workspace(){
        this.refreshGlobals()
      }
    },
    methods: {
      onEditorChanged(){
          if (this.is_ready == true){
              this.is_ready = false
              return
          }
          this.is_modified = true
      },
      // init the python editor
      init_editor:function (editor) {
          editor.getSession().setUseWrapMode(true)
          editor.setFontSize("14px");
          require('brace/mode/yaml')
          require('brace/theme/chrome')

          editor.session.on('change', this.onEditorChanged)

          editor.commands.addCommand({
              name: 'save',
              bindKey: {win: "Ctrl-S", "mac": "Cmd-S"},
              exec: this.saveChanges
          })
      },

      refreshGlobals(){
        this.loadGlobals()
      },
      async saveChanges(){
        // save file
        await BackendApi.saveGlobals(this.current_workspace, this.globals_content).then(resp => {
            if ( resp != undefined) {
              EventBus.$emit('AppWarning', "Changes successfully saved")
              this.is_modified = false
            }
        })

      },
      // load entries from server
      loadGlobals(){
        // get all entries according to the provided project id
        BackendApi.getGlobals(this.current_workspace).then(resp => {
          if ( resp != undefined) {
            this.globals_content = resp.globals
            this.is_ready = true
          }
        })
      }
    }
 }
</script>