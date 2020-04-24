<template>
  <v-container >
    <v-dialog v-model="dialog" max-width="600px" persistent no-click-animation transition="">
      <v-card>
        <v-card-title>
          <span class="headline">User Account</span>
          <v-spacer></v-spacer>
          <v-menu bottom left offset-y>
          <template v-slot:activator="{ on }">
            <v-btn icon v-on="on"  >
              <v-icon>more_vert</v-icon>
            </v-btn>
          </template>
          <v-list   v-if="this.edited_user != null" >
            <v-list-item @click="resetPassword">
              <v-list-item-title>
                <v-icon>clear</v-icon>Reset password
              </v-list-item-title>
            </v-list-item>
          </v-list>
          </v-menu>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
          <v-layout wrap>
            <v-flex  xs12>
              <v-text-field v-model="user_login" :disabled="this.edited_user != null" label="Login"  ></v-text-field>
            </v-flex>
            <v-flex xs12 >
              <v-text-field v-if="this.edited_user == null" v-model="user_pwd" label="Password" :type="show1 ? 'text' : 'password'" @click:append="show1 = !show1"  :append-icon="show1 ? 'visibility_off' : 'visibility'" ></v-text-field>
            </v-flex>
            <v-flex xs12 sm6 md4>
              <v-select v-model="user_role" :items="role_users" chips label="Role" required dense ></v-select>
            </v-flex>
            <v-flex xs12>
              <v-text-field v-if="this.edited_user != null" v-model="user_apikey" :readonly=true label="API Key" ></v-text-field>
            </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="close">Close</v-btn>
            <v-btn color="blue darken-1" text @click="validate" :loading="loader_dialog">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-layout >
      <v-flex>
        <v-card>
          <v-card-title>
            <v-btn @click="addUser" color="blue" dark class="mb-2">New User</v-btn>
            <v-spacer></v-spacer>
            <v-text-field v-model="search" append-icon="search" label="Search" ></v-text-field>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
                  <v-data-table :headers="headers" :items="datamodel" :items-per-page="10" :search="search" :loading="loader" show-select v-model="selected">
                    <template v-slot:item.actions="{ item }">
                      <v-btn icon class="mx-0" @click="editUser(item)" >
                        <v-icon >edit</v-icon>
                      </v-btn>
                    </template>
                  </v-data-table>
                  <div>
                    <v-btn v-if="selected.length != 0" dark color="red" @click="deleteUsers">
                      <v-icon>delete</v-icon> Delete
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
      dialog: false,
      loader: false,
      loader_dialog: false,
      search: '',
      headers: [
        { text: 'Login', align: 'left', value: 'login' },
        { text: 'Role', align: 'left', value: 'role' },
        { text: '', align: 'left', value: 'actions', 'sortable': false }
      ],
      datamodel: [],
      edited_user: null,
      role_users: [
          { "text": 'Administrator', "value": "admin" },
          { "text": 'Operator', "value": "operator" }
        ],
      show1: false,
      user_login: "",
      user_pwd: "",
      user_role: "",
      user_apikey: "",
      selected: [],
    }),
    computed: {
    },
    created () {
      // update the name of the current page
      EventBus.$emit('CurrentPageChanged', { name: "Users", position: 6} )

      // get users listing
      this.getUsersListing()
    },
    methods: {
      getUsersListing(){
        this.datamodel = []
        this.loader = true

        // get all users from backend
        BackendApi.getUsers().then(resp => {
          if ( resp != undefined) {
            for (var i = 0; i < resp.users.length; ++i) {
                var login = Object.keys(resp.users[i])[0]
                this.datamodel.push( {"login": login, 
                                      "role": resp.users[i][login].role,
                                      "password": "",
                                      "apikey_secret":  resp.users[i][login].secrets.basic,
                                      "id": i } )
              }
          }
          this.loader = false
        })
      },
      // open the dialog to create a new user
      addUser() {
        this.user_login = ""
        this.user_pwd = ""
        this.user_role = ""
        this.user_apikey = ""

        // show the form
        this.dialog = true
      },

      // open the dialog to edit the user
      editUser (user) {
        // save user
        this.edited_user = user

        this.user_login = user.login
        this.user_pwd = user.password
        this.user_role = user.role
        this.user_apikey = user.apikey_secret

        // show the dialog to edit the item
        this.dialog = true
      },

      // close the dialog (cancel)
      close () {
        // hide the dialog
        this.dialog = false

        this.edited_user = null
      },

      // delete selected users
      deleteUsers(){
        for (var i = 0; i < this.selected.length; ++i) {
          this.deleteUser(this.selected[i].login)
        }
        // reset selected items
        this.selected = []
      },

      // delete user in server side
      deleteUser (login) {
        // call the backend to delete the user
        BackendApi.deleteUser(login).then(resp => {
            if ( resp != undefined) {
              this.getUsersListing()
            } 
        })
      },

      // reset the password of a user in server side
      async resetPassword(){
        // enable progress
        this.loader_dialog = true

        // call the backend to reset the password of the user
        await BackendApi.resetUserPassword(this.edited_user.login).then(resp => {
          if ( resp != undefined) {
            EventBus.$emit('AppWarning', "Password cleared")
          }  
        })

        // disable progress
        this.loader_dialog = false
      },

      // save/edit the user in server side
      async validate () {
        // enable progress
        this.loader_dialog = true

        // call the backend api to update the user
        if (this.edited_user != null) {
          await BackendApi.updateUser(this.user_login, this.user_role).then(resp => {
            if ( resp != undefined) {
              // refresh user list
              this.getUsersListing()
            }
          })

        // call the backend api to add a new user
        } else {
          await BackendApi.addUser(this.user_login, this.user_pwd, this.user_role).then(resp => {
            if ( resp != undefined) {
              // refresh user list
              this.getUsersListing()
            }
          })
        }

        

        // disable progress
        this.loader_dialog = false

        // close and reset the form
        this.close()
      }
    }
  }
</script>