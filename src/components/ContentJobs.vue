<template>
    <v-container>
        <v-dialog  
            v-model="dialog" 
            max-width="900px"
            persistent
            transition=""
            no-click-animation
            scrollable 
        >
            <v-card >
                <v-card-title>
                    <span class="headline">Job</span>
                </v-card-title>
                <v-divider></v-divider>
                <v-stepper v-model="e1" style="height: 500px;" >
                    <v-stepper-header>
                        <v-stepper-step step="1"  editable >Select your action</v-stepper-step>
                        <v-divider></v-divider>
                        <v-stepper-step step="2" editable>Schedule your job</v-stepper-step>    
                    </v-stepper-header>
                    <v-stepper-items>
                        <v-stepper-content step="1"  >
                            <v-breadcrumbs :items="script_nav">
                                <template v-slot:item="props">
                                    <a @click="onClickNav(props.item.id)" >{{props.item.text}}</a>
                                </template>
                            </v-breadcrumbs>
                            <v-list subheader>
                                <v-list-item
                                    v-for="item in items_list"
                                    :key="item.title" 
                                    @click="onClickFolder(item.id)"
                                >
                                    <v-list-item-avatar>
                                        <v-icon >{{ item.icon }}</v-icon>
                                    </v-list-item-avatar>
                                    <v-list-item-content>
                                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                                    </v-list-item-content>
                                </v-list-item>
                                <v-list-item
                                    v-for="item in items2_list"
                                    :key="item.id"
                                    @click="onClickFile(item.id)"
                                >
                                    <v-list-item-avatar>
                                        <v-icon>{{ item.icon }}</v-icon>
                                    </v-list-item-avatar>
                                    <v-list-item-content>
                                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                                    </v-list-item-content>
                                </v-list-item>
                            </v-list>
                        </v-stepper-content>
                        <v-stepper-content step="2">
                            <v-layout row>
                                <v-flex xs4>
                                    <v-subheader>Script</v-subheader>
                                </v-flex>
                                <v-flex xs8>
                                    <v-text-field
                                        :value="selected_script_path + selected_script.name"
                                        readonly
                                        ></v-text-field>
                                </v-flex>
                            </v-layout>
                            <v-layout row>
                                <v-flex xs4>
                                    <v-subheader>Run Mode</v-subheader>
                                </v-flex>
                                <v-flex xs8>
                                    <v-radio-group v-model="runmode" row>
                                        <v-radio label="Now" value="0"></v-radio>
                                        <v-radio label="At" value="1"></v-radio>
                                        <v-radio label="Hourly" value="2"></v-radio>
                                        <v-radio label="Daily" value="3"></v-radio>
                                        <v-radio label="Weekly" value="4"></v-radio>  
                                        <v-radio label="Every" value="5"></v-radio>    
                                    </v-radio-group>
                                </v-flex>
                            </v-layout>
                             <v-layout row>
                                <v-flex xs4>
                                </v-flex>
                                <v-flex xs8>
                                        <v-layout align-center>
                                                <v-text-field 
                                                    v-if="runmode == '5'"
                                                    v-model="every_hour" 
                                                    mask="##" 
                                                    prepend-icon="timelapse"
                                                    label="Hour(s)">
                                                </v-text-field>
                                                <v-text-field 
                                                    v-if="runmode == '2' || runmode == '5'"
                                                    v-model="every_min" 
                                                    mask="##" 
                                                    prepend-icon="timelapse"
                                                    :rules="rule_minute"
                                                    label="Minute(s)">
                                                </v-text-field>
                                                <v-select
                                                    v-if="runmode == '4'"
                                                    v-model="day_selected"
                                                    :items="items_day"
                                                    prepend-icon="calendar_today"
                                                    label="Day"
                                                ></v-select>
                                                <v-menu
                                                    v-if="runmode == '1'"
                                                    ref="menu1"
                                                    v-model="menu1"
                                                    :close-on-content-click="false"
                                                    :nudge-right="40"
                                                    transition="scale-transition"
                                                    offset-y
                                                    max-width="290px"
                                                    min-width="290px"
                                                    >
                                                    <template v-slot:activator="{ on }">
                                                        <v-text-field
                                                        v-model="dateFormatted"
                                                        label="Date"
                                                        readonly
                                                        persistent-hint
                                                        prepend-icon="event"
                                                        
                                                        v-on="on"
                                                        ></v-text-field>
                                                    </template>
                                                    <v-date-picker v-model="date" no-title @input="menu1 = false"></v-date-picker>
                                                    </v-menu>
                                                    <v-menu
                                                        ref="menu"
                                                        v-if="runmode == '1' || runmode == '3' || runmode == '4'"
                                                        v-model="menu2"
                                                        :close-on-content-click="false"
                                                        :nudge-right="40"
                                                        :return-value.sync="time"
                                                        transition="scale-transition"
                                                        offset-y
                                                        max-width="290px"
                                                        min-width="290px"
                                                    >
                                                        <template v-slot:activator="{ on }">
                                                        <v-text-field
                                                            v-model="time"
                                                            label="Time"
                                                            prepend-icon="access_time"
                                                            readonly
                                                            v-on="on"
                                                        ></v-text-field>
                                                        </template>
                                                        <v-time-picker
                                                            v-if="menu2"
                                                            v-model="time"
                                                            @click:minute="$refs.menu.save(time)"
                                                        ></v-time-picker>
                                                    </v-menu>
                                                    
                                                </v-layout>
                                </v-flex>
                            </v-layout>
                        </v-stepper-content>
                    </v-stepper-items>
                </v-stepper>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeDialog">Cancel</v-btn>
                    <v-btn color="blue darken-1" text 
                            @click="scheduleJob"
                            :loading="loader_dialog"
                            >CREATE</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
         <v-layout >
              <v-flex  >
        <v-card>
          <v-card-title>
            <v-btn color="blue" dark class="mb-2" @click="addTask">Schedule JOB</v-btn>           
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="search"
              label="Search"
            ></v-text-field>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-container fluid>
            <v-layout row>
             <v-flex>
                <v-data-table :headers="headers"
                              :items="datamodel"
                              :items-per-page="10"
                              :search="search"
                              :loading="loader_table"
                  >
                    <template v-slot:item.id="{ item }">
                        {{getJobId(item['job-id'])}}...
                    </template>

                     <template v-slot:item.user="{ item }">
                        {{item.user.login}}
                    </template>

                    <template v-slot:item.runmode="{ item }">
                        <v-chip color="grey" small text-color="white">{{getTaskMode(item)}}</v-chip>
                    </template>

                    <template v-slot:item.script="{ item }">
                        <v-chip color="grey" small text-color="white">{{ item["job-name"] }}</v-chip>
                    </template>

                    <template v-slot:item.state="{ item }">
                        <v-speed-dial
                            direction="left"
                            >
                            <template v-slot:activator>
                                <v-btn
                                    rounded
                                    :color="getTaskColor(item['job-state'])"
                                    dark 
                                    small>
                                    {{item['job-state']}}
                                </v-btn>
                            </template>
                            <v-btn v-if="item['job-state'] == 'WAITING'" 
                                dark
                                small
                                rounded
                                color="black"
                                @click="deleteJob(item['job-id'])" >
                                Cancel
                            </v-btn>
                            <v-btn v-if="item['job-state'] == 'RUNNING'" 
                                dark
                                small
                                rounded
                                color="red"
                                @click="deleteJob(item['job-id'])" >
                                Kill
                            </v-btn>
                        </v-speed-dial>
                    </template>
                </v-data-table>
            </v-flex>
            </v-layout>
              </v-container>
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
      props: {
        current_workspace: String
      },
      data() {
          return {
              polling: null,
              refresh_select: 5000,
              datamodel: [],
              headers: [
                  { text: 'Id', align: 'left', value: 'id' },
                  { text: 'Script', align: 'left', value: 'script' },
                  { text: 'User', align: 'left', value: 'user' },
                  { text: 'Run mode', align: 'left', value: 'runmode' },
                  { text: '', align: 'left', value: 'state'}
                ],
             search: '',
             loader_table: false,
             loader_dialog: false,
             editedItem: {},
             dialog: false,
             items_list: [],
            items2_list: [],
            script_listing: [],
            script_nav: [  {text: 'Actions', id: "00"} ],
            e1: 0,
            selected_script: {},
            selected_script_path: '',
            runmode: "0",
            menu1: false,
            date: new Date().toISOString().substr(0, 10),
            dateFormatted: this.formatDate(new Date().toISOString().substr(0, 10)),
            menu2: false,
            modal2: false,
            time: new Date().getHours() + ":" + new Date().getMinutes(),
            items_day: [ { text: 'Monday', value: 0}, 
                         { text: 'Tuesday', value:1}, 
                         { text: 'Wednesday', value:2}, 
                         { text: 'Thursday', value:3},
                         { text: 'Friday', value: 4 }, 
                         { text: 'Saturday', value:5}, 
                         { text: 'Sunday', value: 6 } ],
            day_selected: 0,
            every_min: '',
            every_hour: '',
            rule_minute: [ v => v >0 && v < 60 || 'Exceed time interval' ]
          }
      },
      watch: {
        date (val) {
            this.dateFormatted = this.formatDate(val)
        },
        current_workspace(){
            this.onRefreshEvent()
        }
      },
      methods: {
        closeDialog(){
            this.dialog = false
        },
        async scheduleJob(){
            // enable progress
            this.loader_dialog = true

            if ( !this.selected_script_path.length  ){
                EventBus.$emit('AppWarning', "No script selected"); 
                // disable progress
                this.loader_dialog = false
                return;  
            }

            // get all parameters to schedule the task
            var yamlfile = this.selected_script_path + this.selected_script.name + "." + this.selected_script.extension

            var schedid = parseInt(this.runmode)
            var y = 0; var m = 0; var d = 0 
            var h = 0; var mn = 0; var s = 0

            // schedule at
            if ( schedid == 1) {
                const [ year, month, day ] = this.date.split('-')
                y = parseInt(year); m = parseInt(month); d = parseInt(day)
                const [ hours, minutes ] = this.time.split(':')
                h = parseInt(hours)
                mn = parseInt(minutes)
            }

            // hourly
            if ( schedid == 2) {
                if ( this.every_min.length > 0) {
                    mn = parseInt( this.every_min )
                }
            }

            // daily
            if ( schedid == 3) {
                const [ hours, minutes ] = this.time.split(':')
                h = parseInt(hours)
                mn = parseInt(minutes)
            }

            // weekly
            if ( schedid == 4) {
                const [ hours, minutes ] = this.time.split(':')
                h = parseInt(hours)
                mn = parseInt(minutes)

               d = this.day_selected
            }

            // every
            if ( schedid == 5) {
                if ( this.every_min.length > 0) {
                    mn = parseInt( this.every_min )
                }
                if ( this.every_hour.length > 0) {
                    h = parseInt( this.every_hour )
                }
            }

            // schedule the task on server side
            await BackendApi.scheduleJob(this.current_workspace, yamlfile, schedid, 
                                        y, m, d, h, mn, s)

            // refresh jobs listing
            this.getJobsListing()

            // disable progress
            this.loader_dialog = false

            // close the dialog
            this.dialog = false

        },
        getTaskMode(item){
            const [ y, m, d, h, mn ] = item["sched-at"]
            var d_str = ''
            for (var i = 0; i < this.items_day.length; ++i) {
                if (this.items_day[i].value == d){
                    d_str = this.items_day[i].text
                    break
                }
            }

            if ( item["sched-mode"] == 0 ){
                return 'Now'
            }
            if ( item["sched-mode"] == 1 ){
                return 'On ' + y + '/' + m + '/' + d + ' at ' + h + ':' + mn
            }
            if ( item["sched-mode"] == 2 ){
                return 'Every hour at ' + mn + ' minute(s)'
            }
            if ( item["sched-mode"] == 3 ){
                return 'Every day at ' + h + ':' + mn
            }
            if ( item["sched-mode"] == 4 ){
                return 'Every ' + d_str + ' at ' + h + ':' + mn
            }
            if ( item["sched-mode"] == 5 ){
                return 'Every ' + h + ' hour(s) and ' +  mn + ' minute(s)'
            }
        },
        getJobId(id){
            return id.substring(0,15)
        },
        getTaskColor(state){
            if (state == 'RUNNING'){
                return "blue"
            } else if (state == 'WAITING'){
                return "grey"
            } else {
                return "black"
            }
        },
        addTask(){
          // reset stepper and some parameters
          this.e1 = 1
          this.selected_script_path = ''
          this.selected_script = { name: ''}

          // show the form
          this.dialog = true
        },
        deleteJob(id){
            BackendApi.deleteJob(id).then(resp => {
                if ( resp != undefined) {
                    this.getJobsListing()
                }
            })
        },
        onClickFile(id){
            // move the stepper to next step
            this.e1 = 2

            //save the current item 
            this.selected_script = this.script_listing[id]

            // construct the path of the script
            var path_tmp_list = []
            var item_tmp = this.script_listing[id]
            while( item_tmp["parent-id"] != "00"){
                if (item_tmp.type == "folder") {
                    path_tmp_list.push( item_tmp.name )
                } 
                item_tmp = this.script_listing[item_tmp["parent-id"]]
            }
            if (item_tmp.type == "folder") {
                path_tmp_list.push( item_tmp.name )
            } 
            path_tmp_list = path_tmp_list.reverse()

            // conver path to string
            var path_str = "/"
            for (var i = 0; i < path_tmp_list.length; ++i) {
                path_str += path_tmp_list[i]
                path_str += "/"
            }
            this.selected_script_path = path_str
        },
        onClickNav(id){
            // clear the navigation menu of the tree
            var new_nav = []
            for (var i = 0; i < this.script_nav.length; ++i) {
                if ( this.script_nav[i].id != id ){
                    new_nav.push( this.script_nav[i] )
                } else {
                    break
                }
            }

            // apply the new navigation menu
            this.script_nav = new_nav

            // reload the tree
            this.onClickFolder(id)
        },
        onClickFolder(id){
            // clear the tree (folders and files)
            this.items_list = []
            this.items2_list = []

            // update the navigation menu of the tree
            this.script_nav.push( {text: this.script_listing[id].name, id: id}  )

            // load the tree
            for (var key in this.script_listing){
                if ( this.script_listing[key]["parent-id"] == id && this.script_listing[key].type == "folder" ) {
                    this.items_list.push( { icon: "folder",
                                            title: this.script_listing[key].name, 
                                            id: key } )
                }

                if ( this.script_listing[key]["parent-id"] == id && this.script_listing[key].type == "file" ) {
                    this.items2_list.push( { icon: "description",
                                            title: this.script_listing[key].name, 
                                            id: key } )
                }
            }
        },
        getActionsListing(){
            BackendApi.getActionsListing(this.current_workspace).then(resp => {
                if ( resp != undefined) {
                    this.script_listing = resp.actions
                    this.script_listing["00"] = {"name": "Actions", "type": "root"}
                    for (var key in this.script_listing){
                        if ( this.script_listing[key]["parent-id"] == "00" && this.script_listing[key].type == "folder" ) {
                            this.items_list.push( { icon: "folder",
                                                    title: this.script_listing[key].name, 
                                                    id: key } )
                        }

                        if ( this.script_listing[key]["parent-id"] == "00" && this.script_listing[key].type == "file" ) {
                            this.items2_list.push( { icon: "description",
                                                    title: this.script_listing[key].name, 
                                                    id: key } )
                        }
                    }
                }
            })
        },
        getJobsListing(){
            this.loader_table = true
            BackendApi.getJobsListing(this.current_workspace).then(resp => {
              if ( resp != undefined) {
                this.test  = resp["jobs"].reverse()
                this.datamodel = resp["jobs"]
              }
              this.loader_table = false
            })
        },
        pollData () {
          this.polling = setInterval(() => {
              this.getJobsListing()
          }, this.refresh_select )
        },
        onRefreshEvent(){
            this.items_list = []
            this.items2_list = []
            this.script_nav =[  {text: 'Actions', id: "00"} ]

            // retrieve all scripts
            this.getActionsListing()

            // retrieve all tasks
            this.getJobsListing()
        },
        formatDate (date) {
            if (!date) return null

            const [year, month, day] = date.split('-')
            return `${month}/${day}/${year}`
        },
        allowedHours: v => v > 12
      },
      beforeDestroy () {
          // enable event
        EventBus.$off('ManualRefresh', this.onRefreshEvent)

        // disable the automatic refresh
        clearInterval(this.polling)
      },

      async created () {
          // update the name of the current page
        EventBus.$emit('CurrentPageChanged',  { name: "Jobs", position: 5} )

          // enable event
         EventBus.$on('ManualRefresh', this.onRefreshEvent)

        this.onRefreshEvent()

        // automatic refresh to get jobs ?
        this.pollData()
     },
     

  }
</script>

<style scoped>
.v-list {
  height: 250px;
  overflow-y: auto;
}
</style>