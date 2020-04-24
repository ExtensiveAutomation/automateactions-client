<template>
    <v-container >
        <v-dialog v-model="show_dialog_new" max-width="500px" persistent no-click-animation transition="">
            <v-card>
                <v-card-title>
                    <span class="headline">New File</span>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex xs12>
                                <v-text-field label="Name" v-model="new_file"></v-text-field>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="show_dialog_new = false">Cancel</v-btn>
                    <v-btn color="blue darken-1" text @click="addItem" :loading="loader_dialog_new">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="show_dialog_rename" max-width="500px" persistent no-click-animation transition="" >
            <v-card>
                <v-card-title>
                    <span class="headline">Rename</span>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex xs12>
                                <v-text-field  label="Current Name" readonly v-model="item_checkbox.title"></v-text-field>
                                <v-text-field  label="New Name" v-model="rename_new_name"></v-text-field>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="show_dialog_rename = false">Cancel</v-btn>
                    <v-btn color="blue darken-1" text @click="renameItem" :loading="loader_dialog_rename">Rename</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-card>
            <v-card-title>
                <v-icon>storage</v-icon>
                <v-breadcrumbs :items="script_nav">
                    <template v-slot:item="props">
                        <v-breadcrumbs-item @click="onClickNav(props.item.id)" :href="'#navid=' + props.item.id" :disabled="props.item.disabled">
                            {{ props.item.text }}
                        </v-breadcrumbs-item>
                    </template>
                </v-breadcrumbs> 
                <v-toolbar flat dense>
                    <v-spacer></v-spacer>
                    <v-btn v-if="show_listing" color="blue" dark class="mx-2" @click="show_dialog_new=true">new script</v-btn>
                </v-toolbar>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <v-list v-if="show_listing">
                    <v-list-item-group>
                        <v-list-item v-for="(item, i) in items_list" :key="i">
                            <template v-slot:default="{active}">
                                <v-list-item-action @click="onItemSelected(item, i)">
                                    <v-checkbox v-model="item.active"></v-checkbox>
                                </v-list-item-action>
                                <v-list-item-avatar>
                                    <v-icon v-if="item.type === 'folder'" color="orange" @click="onClickFolder(item.id)">folder</v-icon>
                                    <v-icon v-else color="indigo" @click="onClickFile(item.id)">description</v-icon>
                                </v-list-item-avatar>
                                <v-list-item-content v-if="item.type === 'folder'" @click="onClickFolder(item.id)">
                                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                                </v-list-item-content>
                                <v-list-item-content v-else @click="onClickFile(item.id)">
                                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                                </v-list-item-content>
                            </template>
                        </v-list-item>
                    </v-list-item-group>
                </v-list>

                <v-toolbar flat dense v-if="show_toolbar">
                    <v-btn class="mx-2" dark color="green" @click="show_dialog_rename = true">Rename</v-btn>
                    <v-btn class="mx-2" dark color="blue" @click="duplicateItem">Duplicate</v-btn>
                    <v-btn class="mx-2" dark color="red" @click="deleteItem">Delete</v-btn>
                </v-toolbar>

                <v-toolbar flat color="blue" dense v-if="show_editor">
                    <v-btn :disabled="! is_modified" color="white" text class="my-2" @click="saveChanges">
                        <v-icon>save</v-icon>
                    </v-btn>
                    <v-btn :loading="loader_logs" color="white" text class="my-2" @click="runAction">
                        <v-icon>play_arrow</v-icon>
                    </v-btn>
                    <v-btn text :disabled="!is_running" class="my-2" color="red" @click="killJob">
                        <v-icon>stop</v-icon>
                    </v-btn>
                </v-toolbar>

                <v-tabs v-if="show_editor" background-color="white" vertical v-model="current_tab">
                    <v-tab href="#tab-py">Content</v-tab>
                    <v-tab href="#tab-exec">Execution</v-tab>
                    <v-tabs-items v-model="current_tab">
                        <v-tab-item value="tab-py">
                            <v-card flat>
                                <v-card-text>
                                    <editor ref='editor' v-model="file_py" lang="yaml" theme="chrome" width="100%" height="500px" @init="init_editor"></editor>
                                </v-card-text>
                            </v-card>
                        </v-tab-item>
                        <v-tab-item value="tab-exec">
                            <v-card flat>
                                <v-card-text>
                                    <div v-for="(log,index) in raw_logs" :key="index">
                                        <span>{{log.timestamp}}</span>
                                        <span> {{log.index}} </span>
                                        <span>{{log.snippet}}</span>
                                        <span :class="log.color">{{ log.value }}</span>
                                    </div>
                                    <div v-if="loader_logs==true">
                                        <strong>{{loading_str}}</strong>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-tab-item>
                    </v-tabs-items>
                </v-tabs>

            </v-card-text>
        </v-card>
    </v-container>
</template>

<script>
    import { BackendApi } from '@/backend.js'
    import { EventBus } from '@/main'

    const aceeditor = require('vue2-ace-editor')
    const jsyaml = require('js-yaml')

    export default {
        components: {
            editor: aceeditor
        },
        props: {
            current_workspace: String
        },
        data: () => ({
            show_dialog_new: false,
            show_dialog_rename: false,
            loader_dialog_rename: false,
            loader_dialog_new: false,
            rename_new_name : '',
            new_file: '',
            item_selected: undefined,
            item_checkbox: {title: ''},
            script_nav: [  {text: 'Snippets', id: "00", disabled: false, type: "root"} ],
            items_list: [],
            script_listing: [],
            show_listing: true,
            show_editor: false,
            show_toolbar: false,
            raw_logs: [],
            is_running: false,
            job_id: null,
            logs_index: 0,
            loader_logs: false,
            loading_str: "",
            loading_polling: null,
            is_modified: false,
            is_ready: false,
            file_py: "",
            current_tab:  'tab-py'
        }),
        watch: {
            current_workspace(){
                this.show_listing = true
                this.show_editor = false

                // reset the tree
                this.items_list = []
                this.script_nav =[  {text: 'Snippets', id: "00", disabled:false, type: "root"} ]

                //  reload
                this.getSnippetsListing()
            }
        },
        methods: {
            onItemSelected(item, index){
                var active = item.active

                for (var i = 0; i < this.items_list.length; ++i) {
                    this.items_list[i].active = false
                }

                if (active) {
                    item.active = true
                    this.item_selected  = index
                    this.item_checkbox = item
                    this.show_toolbar = true
                } else {
                    this.item_checkbox = {title: ''}
                    this.item_selected = undefined
                    this.show_toolbar = false
                }
            },
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
            update_log_loader(){
                if (this.loading_str.length == 5){
                    this.loading_str = ""
                }
                this.loading_str += "."
            },
            killJob(){
                BackendApi.deleteJob(this.job_id).then(resp => {
                    if ( resp != undefined) {
                        this.is_running = false
                        this.job_id = null
                        this.logs_index = 0
                        this.loader_logs = false

                        clearInterval(this.loading_polling)
                    }
                })
            },
            async runAction(){
                if (this.is_running == true){
                    return
                }

                await BackendApi.scheduleJobContent(this.current_workspace, this.file_py).then(resp => {
                    if ( resp != undefined) {
                        this.job_id = null,
                        this.logs_index = 0
                        this.raw_logs = []
                        
                        this.loader_logs = true
                        this.current_tab = "tab-exec"

                        this.is_running = true
                        this.job_id = resp.id

                        this.loading_polling = setInterval(() => {
                            this.update_log_loader()
                        }, 500 )

                        this.detailsRun()
                        
                    }
                })

            },
            async detailsRun(){
                if (this.job_id == null){
                    return
                }
                await BackendApi.executionDetails(this.job_id, this.logs_index).then(resp => {
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
                                        text_color = "black--text"
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
                            setTimeout(() => { this.detailsRun(this.job_id) }, 1000)
                        } else {
                            this.is_running = false
                            this.loader_logs = false
                            clearInterval(this.loading_polling)
                        }
                    }
                })
            },
            async saveChanges(){
                if (this.is_modified == false){
                    return
                }

                var path_str = ""
                for (var i = 0; i < this.script_nav.length; ++i) {
                    if (this.script_nav[i].id != "00"){
                        
                        path_str += "/"
                        path_str += this.script_nav[i].text
                    }
                }

                // save file
                await BackendApi.addSnippet(path_str, this.current_workspace, this.file_py).then(resp => {
                    if ( resp != undefined) {
                         EventBus.$emit('AppWarning', "Changes successfully saved")
                         this.is_modified = false
                    }
                })

            },
            async addItem(){
                if ( !this.new_file.length  ){ 
                    EventBus.$emit('AppWarning', "Name is required")
                    return;  
                }

                var path_str = ""
                for (var i = 0; i < this.script_nav.length; ++i) {
                    if (this.script_nav[i].id != "00"){
                        path_str += this.script_nav[i].text
                        path_str += "/"
                    }
                }

                path_str += "/" + this.new_file

                var content_file = ""

                // rename item
                await BackendApi.addSnippet(path_str, this.current_workspace, content_file)

                this.getSnippetsListing()

                this.new_file = ''
                this.show_dialog_new = false

            },
            async duplicateItem(){
                // construct the path of the script
                var path_tmp_list = []

                var item_tmp = this.script_listing[this.items_list[this.item_selected].id]

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

                // convert to string
                var path_str = ""
                for (var i = 0; i < path_tmp_list.length; ++i) {
                    path_str += path_tmp_list[i]
                    path_str += "/"
                }
                
                if (this.items_list[this.item_selected].type != "folder") {
                    path_str += this.script_listing[this.items_list[this.item_selected].id].name 
                    path_str += "." 
                    path_str += this.script_listing[this.items_list[this.item_selected].id].extension
                }

                // delete item
                await BackendApi.duplicateSnippet(path_str, this.current_workspace)

                this.getSnippetsListing()
            },
            async renameItem(){
                if ( !this.rename_new_name.length  ){ 
                    EventBus.$emit('AppWarning', "Name is required")
                    return;  
                }
                
                // construct the path of the script
                var path_tmp_list = []

                var item_tmp = this.script_listing[this.items_list[this.item_selected].id]

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

                // convert to string
                var path_str = ""
                for (var i = 0; i < path_tmp_list.length; ++i) {
                    path_str += path_tmp_list[i]
                    path_str += "/"
                }

                if (this.items_list[this.item_selected].type != "folder") {
                    path_str += this.script_listing[this.items_list[this.item_selected].id].name 
                    path_str += "." 
                    path_str += this.script_listing[this.items_list[this.item_selected].id].extension
                }

                // rename item
                await BackendApi.renameSnippet(path_str, this.current_workspace, this.rename_new_name)

                this.getSnippetListing()

                this.rename_new_name = ''
                this.show_dialog_rename = false
                
            },
            async deleteItem(){
                // construct the path of the snippet
                var path_tmp_list = []

                var item_tmp = this.script_listing[this.items_list[this.item_selected].id]

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

                // convert to string
                var path_str = ""
                for (var i = 0; i < path_tmp_list.length; ++i) {
                    path_str += path_tmp_list[i]
                    path_str += "/"
                }
                
                if (this.items_list[this.item_selected].type != "folder") {
                    path_str += this.script_listing[this.items_list[this.item_selected].id].name 
                    path_str += "." 
                    path_str += this.script_listing[this.items_list[this.item_selected].id].extension
                }

                // delete item
                await BackendApi.deleteSnippet(path_str, this.current_workspace)

                this.getSnippetListing()
            },
            onClickNav(id){
                this.show_listing = true
                this.show_editor = false

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
            async onClickFile(id){
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

                // converts path to string
                var path_str = ""
                for (var i = 0; i < path_tmp_list.length; ++i) {
                    path_str += path_tmp_list[i]
                    path_str += "/"
                }
                path_str += this.script_listing[id].name + "." + this.script_listing[id].extension


                // load the file
                await BackendApi.getSnippetFile(path_str, this.current_workspace).then(resp => {
                    if ( resp != undefined) {
                            this.file_py = resp.snippets.file.content

                            // update the navigation menu of the tree
                            this.script_nav.push( {text: this.script_listing[id].name + "." + this.script_listing[id].extension, 
                                                id: id, disabled: true, type: "file"}  )
                                                
                             // reset some vars
                            this.show_listing = false
                            this.show_editor = true
                            this.show_toolbar = false
                            this.current_tab = "tab-py"
                    }
                })



            },
            onClickFolder(id){
                // clear the tree (folders and files)
                this.items_list = []

                var folders_list = []
                var files_list = []

                // update the navigation menu of the tree
                this.script_nav.push( {text: this.script_listing[id].name, id: id, disabled:false, type: "folder"}  )

                // load the tree
                for (var key in this.script_listing){
                    if ( this.script_listing[key]["parent-id"] == id && this.script_listing[key].type == "folder" ) {
                        folders_list.push( { type: "folder",
                                                title: this.script_listing[key].name, 
                                                id: key,
                                                active: false } )
                    }

                    if ( this.script_listing[key]["parent-id"] == id && this.script_listing[key].type == "file" ) {
                        files_list.push( { type: "file",
                                                title: this.script_listing[key].name+ "." + this.script_listing[key].extension, 
                                                id: key,
                                                active: false } )
                    }

                    
                }

                for (var i = 0; i < folders_list.length; i++) {
                   this.items_list.push(folders_list[i]);
                }

                for (var j = 0; j < files_list.length; j++) {
                    this.items_list.push(files_list[j]);
                }

            },
            getSnippetsListing(){
                // clear the tree (folders and files)
                this.show_toolbar = false

                this.script_nav = [ {text: 'Snippets', id: "00", disabled: false, type: "root"} ]
                this.items_list = []

                var folders_list = []
                var files_list = []

                BackendApi.getSnippetsListing(this.current_workspace).then(resp => {
                    if ( resp != undefined) {
                        this.script_listing = resp.snippets
                        this.script_listing["00"] = {"name": "Snippets", "type": "root"}
                        for (var key in this.script_listing){
                            if ( this.script_listing[key]["parent-id"] == "00" && this.script_listing[key].type == "folder" ) {
                                folders_list.push( { type: "folder",
                                                        title: this.script_listing[key].name, 
                                                        id: key,
                                                        active: false } )
                            }

                            if ( this.script_listing[key]["parent-id"] == "00" && this.script_listing[key].type == "file" ) {
                                files_list.push( { type: "file",
                                                        title: this.script_listing[key].name + "." + this.script_listing[key].extension, 
                                                        id: key,
                                                        active: false } )
                            }
                        }

                        for (var i = 0; i < folders_list.length; i++) {
                            this.items_list.push(folders_list[i]);
                        }

                        for (var j = 0; j < files_list.length; j++) {
                            this.items_list.push(files_list[j]);
                        }
                    }
                })
            },
            onRefreshEvent(){
                this.getSnippetsListing()
            }
         },
        created () {
            // emit signal to update the name of the 
            // current page on the toolbar
            EventBus.$emit('CurrentPageChanged', { name: "Snippets", position: 1} )

            // enable refresh event
            // this event is received when the user clicks 
            // on the refresh button from the toolbar
            EventBus.$on('ManualRefresh', this.onRefreshEvent)

            

            // initial loading of snippets listing
            this.getSnippetsListing()
        },
        beforeDestroy () {
            // disable event
            EventBus.$off('ManualRefresh', this.onRefreshEvent)

            // log loader
            clearInterval(this.loading_polling)
        }
    }
</script>