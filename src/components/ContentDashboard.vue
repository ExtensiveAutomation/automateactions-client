<template>
    <v-container fluid>
      <v-row dense>
        <v-col cols=6>
          <v-card > 
            <v-card-title>JOB</v-card-title>
            <v-card-text>
              <v-card-subtitle>RUNNING</v-card-subtitle>
              <p class="display-1 text--primary">{{running}}</p>
            </v-card-text>
          </v-card>
         </v-col>
         <v-col cols=6>
           <v-card > 
            <v-card-title>JOB</v-card-title>
            <v-card-text>
              <v-card-subtitle>SCHEDULED</v-card-subtitle>
              <p class="display-1 text--primary">{{scheduled}}</p>
            </v-card-text>
          </v-card>
       </v-col>
      </v-row>

      <v-row dense>
        <v-col cols=6>
          <v-card > 
            <v-card-title>EXECUTION</v-card-title>
            <v-card-text>
              <v-card-subtitle>SUCCESS</v-card-subtitle>
              <p class="display-1 text--primary">{{success}}</p>
            </v-card-text>
          </v-card>
         </v-col>
         <v-col cols=6>
           <v-card > 
            <v-card-title>EXECUTION</v-card-title>
            <v-card-text>
              <v-card-subtitle>FAILURE</v-card-subtitle>
              <p class="display-1 text--primary">{{failure}}</p>
            </v-card-text>
          </v-card>
       </v-col>
      </v-row>
    </v-container>
</template>

<script>
  import { BackendApi } from '@/backend.js'
  import { EventBus } from '@/main'

  export default {
      props: {
        current_workspace: String
      },
      data() {
          return {
              running: 0,
              scheduled: 0,
              success: 0,
              failure: 0,
              polling: null,
              refresh_select: 5000,
          }
      },
      watch: {
        current_workspace(){
          // get from server tasks and runs
          this.getJobsListing()
          this.getExecutionsListing()
        }
      },
      methods: {
        // get tasks listing from server
        async getJobsListing(){
          var running = 0
          var scheduled = 0
          await BackendApi.getJobsListing(this.current_workspace).then(resp => {
            if ( resp != undefined) {
              for (var i = 0; i < resp["jobs"].length; i++) {
                if ( resp["jobs"][i]["job-state"] == "RUNNING" ) {
                  running += 1
                } else if ( resp["jobs"][i]["job-state"] == "WAITING" ) {
                  scheduled += 1
                }
              }
            }
          })
          this.running = running
          this.scheduled = scheduled
        },
        // get executions listing from server
        async getExecutionsListing(){
          var success = 0
          var failure = 0
          await BackendApi.getExecutionsListing(this.current_workspace).then(resp => {
              if ( resp != undefined) {
                for (var j=0; j < resp.listing.length; j++) {
                  if (resp.listing[j]["job-state"] == "SUCCESS"){
                    success += 1
                  } else {
                    failure += 1
                  }
                }
              }
            })
          this.success = success
          this.failure = failure
        },
        onRefreshEvent(){
          // get from server tasks and runs
          this.getJobsListing()
          this.getExecutionsListing()
        },
        pollData () {
          this.polling = setInterval(() => {
              this.onRefreshEvent()
          }, this.refresh_select )
        },
      },
    beforeDestroy () {
      // disable event
      EventBus.$off('ManualRefresh', this.onRefreshEvent)

      // disable the automatic refresh when we leave the page
      clearInterval(this.polling)
    },
    created () {
      // update the name of the current page
      EventBus.$emit('CurrentPageChanged', { name: "Dashboard", position: 0 } )

      // enable event
      EventBus.$on('ManualRefresh', this.onRefreshEvent)

      // get from server tasks and runs
      this.onRefreshEvent()

       this.pollData()
    }
  }
</script>