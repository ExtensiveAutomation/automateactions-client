<template>
    <v-container>
        <v-dialog v-model="dialog_logs" max-width="1000px" persistent transition="" no-click-animation scrollable>
            <v-card dark>
                <v-card-title>
                    <span class="headline">Job Logs</span>
                    <v-spacer></v-spacer>
                    <span>
                        <v-progress-circular v-if="loader_logs==true" indeterminate color="primary" ></v-progress-circular>
                    </span>
                </v-card-title>
                <v-card-text  style="height: 600px;">
                    <div v-for="(log, index) in raw_logs" :key="index">
                       <span>{{log.timestamp}} </span><span> {{log.index}} </span><span>{{log.snippet}}</span><span :class="log.color">{{ log.value }}</span>
                    </div>
                    <div v-if="loader_logs==true"><strong>{{loading_str}}</strong></div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="close_dialog_logs">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-card>
            
            <v-card-text>
                <v-data-table v-model="selected"
                              :headers="headers"
                              :items="datamodel"
                              :items-per-page="10"
                              :loading="loader_table"
                              loading-text="Loading... Please wait"
                              show-select >
                    <template v-slot:item.jobid="{ item }">{{ getJobId(item["job-id"]) }}...</template>
                    <template v-slot:item.datetime="{ item }">{{ item.datehuman }}</template>
                    <template v-slot:item.durationhuman="{ item }">
                        <v-chip color="grey" small text-color="white">{{ item.durationhuman }}</v-chip>
                    </template>
                    <template v-slot:item.script="{ item }">
                        <v-chip color="grey" small text-color="white">{{ item["job-name"] }}</v-chip>
                    </template>
                    <template v-slot:item.user="{ item }">{{ item["user"]["login"] }}</template>
                    <template v-slot:item.state="{ item }">
                        <v-chip small :color="getRunColor(item['job-state'])" dark>{{ item["job-state"] }}</v-chip>
                    </template>
                    <template v-slot:item.logs="{ item }">
                        <v-btn text icon class="mx-0" @click="getRunLogs(item)" :loading="item.loader">
                            <v-icon >view_list</v-icon>
                        </v-btn>
                    </template>
                </v-data-table>
                <div>
                    <v-btn v-if="selected.length != 0" dark color="red" @click="deleteExecutions" >Remove</v-btn>
                </div>
            </v-card-text>
        </v-card> 
    </v-container>
</template>

<script>
  import moment from 'moment'
  import { BackendApi } from '@/backend.js'
  import { EventBus } from '@/main'

  export default {
    props: {
        current_workspace: String
    },
    data() {
        return {
            selected: [],
            dialog_logs: false,
            polling: null,
            refresh_select: 5000,
            headers: [
                    { text: 'Id', align: 'left', value: 'jobid' },
                    { text: 'Date', align: 'left', value: 'datetime' },
                    { text: 'Name', align: 'left', value: 'script' },
                    { text: 'Duration', align: 'left', value: 'durationhuman' },
                    { text: 'User', align: 'left', value: 'user' },
                    { text: 'State', align: 'left', value: 'state' },
                    { text: 'Logs', align: 'left', value: 'logs' }
                ],
             loader_table: false,
             datamodel: [],
             logs_items: [],
             logs_index: 0,
             log_current: null,
             loader_logs: false,
             raw_logs: [],
             loading_str: "",
             loading_polling: null
        }
    },   
    watch: {
      current_workspace(){
        this.onRefreshEvent()
      }
    },
    beforeDestroy () {
        // enable event
        EventBus.$off('ManualRefresh', this.onRefreshEvent)

        // disable the automatic refresh when we leave the page
        clearInterval(this.polling)

        // log loader
        clearInterval(this.loading_polling)
    },
    async created () {
        // update the name of the current page
        EventBus.$emit('CurrentPageChanged',  { name: "Executions", position: 4} )

      // enable event
      EventBus.$on('ManualRefresh', this.onRefreshEvent)

      this.onRefreshEvent()
    
      this.pollData()
    },
    methods: {
        onRefreshEvent(){
            // enable the progress bar
            this.loader_table = true

            // retrieve results
            this.getExecutionsListing(this.current_workspace)

            // disable the progress bar
            this.loader_table = false
        },
        update_log_loader(){
            if (this.loading_str.length == 5){
                this.loading_str = ""
            }
            this.loading_str += "."
        },
        // get run logs according to the item selected
        async getRunLogs(item){
            //activate the loader of the item
            item.loader=true

            // active the loader of the dialog
            this.loader_logs = true
            this.loading_polling = setInterval(() => {
                this.update_log_loader()
            }, 500 )
            
            // reset logs items
            this.logs_items = []
            this.logs_index = 0
            this.log_current = null
            this.raw_logs = []

            //call to the server to get details
            await this.getExecutionDetails(item["job-id"])

            // disable the loader
            item.loader=false

            // show the form
            this.dialog_logs = true
        },
        getJobId(jobid){
            return jobid.substring(0,15)
        },
        // get run details from server
        async getExecutionDetails(id){
            await BackendApi.executionDetails(id, this.logs_index).then(resp => {
                if ( resp != undefined) {
                    this.logs_index = resp["index"]
                    var logs = resp["logs"].split("\n")
                    var text_color = "white--text"
                    for (var i = 0; i < logs.length; ++i) {
                        if (logs[i].length > 1) {
                            
                            var regex_logs = /^(\d+:\d+:\d+.\d+) (\d+) (job-started|job-stopped|job-log|job-error|snippet-log|snippet-error|snippet-begin|snippet-ending)(.*)$/g
                            var ret = regex_logs.exec(logs[i])
                            if(ret == null) {
                                this.raw_logs.push({"timestamp": "",
                                                    "value": logs[i],
                                                    "color": text_color,
                                                    "snippet": ""})
                            } else {
                                if (ret[3]== "job-error" || ret[3]== "snippet-error"){
                                    text_color = "red--text text--lighten-1"
                                } else {
                                    text_color = "white--text"
                                }
                                this.raw_logs.push({"timestamp": ret[1],
                                                    "value": ret[4],
                                                    "color": text_color,
                                                    "snippet": ret[3],
                                                    "index": ret[2]})
                            }
                        }
                    }

                    if (resp["job-state"] == "RUNNING"){
                        setTimeout(() => { this.getRunDetails(id) }, 1000)
                    } else {
                        // disable the loader, no more data to get from server
                        this.loader_logs = false

                        clearInterval(this.loading_polling)
                    }
                }
            })

        },

        // delete only selected and terminated runs 
        deleteExecutions(){
            for (var i = 0; i < this.selected.length; ++i) {
                this.deleteExecution(this.selected[i]["job-id"])
            }

            // reset selected items
            this.selected = []
        },

        // delete a specific run according to the id provided
        deleteExecution(id){
            BackendApi.deleteExecution(id, this.current_workspace).then(resp => {
                if ( resp != undefined) {
                    this.getExecutionsListing(this.current_workspace)
                }
            })
        },

        // get a listing of all runs 
        getExecutionsListing(projectid){
            // enable the progress bar
            this.loader_table = true

            BackendApi.getExecutionsListing(projectid).then(resp => {
                if ( resp != undefined) {

                    for (var i = 0; i < resp["listing"].length; ++i) {

                        // add internal id for show select function in table
                        resp["listing"][i].id = i

                        resp["listing"][i]["loader"] = false

                        var human_date = moment.unix(resp["listing"][i]["sched-timestamp"]).format("YYYY-MM-DD HH:mm:ss")
                        resp["listing"][i].datehuman = human_date

                        var human_duration = '...'
                        if (resp["listing"][i]['job-duration'] > 0) {
                            human_duration = moment.duration( resp["listing"][i]['job-duration'] , "seconds").humanize()
                        }
                        resp["listing"][i].durationhuman = human_duration
                    }

                    this.datamodel = resp.listing
                }
            })

            // disable the progress bar
            this.loader_table = false
        },

        // automatic refresh of the runs listing every xx seconds
        pollData () {
          this.polling = setInterval(() => {
              this.getExecutionsListing(this.current_workspace)
          }, this.refresh_select )
        },

        // return color according item state
        getRunColor(state){
            if (state == 'SUCCESS'){
                return "green"
            } else if (state == 'RUNNING'){
                return "blue"
            } else if (state == 'FAILURE'){
                return "red"
            } else {
                return "grey"
            }
        },

        // hide the dialog for logs
        close_dialog_logs(){
            this.dialog_logs = false
        }
    }
  }
</script>