<template>
  <v-app >

    <navigation :nav="nav"></navigation>

    <toolbar @hideNavigation="hideNavigation" @userProfile="userProfile" @userLogout="userLogout"></toolbar>

    <v-content>
      <router-view :current_workspace="current_workspace"></router-view>
    </v-content>

    <v-footer app padless class="caption" >
      <div class="flex-grow-1"></div>
      <div><strong>Automate Actions {{app_version}}</strong> powered by Extensive Automation -- &copy; 2010-{{ new Date().getFullYear() }} -- Denis MACHARD</div>
    </v-footer> 

    <v-snackbar v-model="snackbar" :timeout="snackbar_timeout" top :color="snackbar_color">{{ snackbar_text }}</v-snackbar>

    <v-dialog  v-model="dialog_profile" max-width="600px" persistent no-click-animation transition="">
        <v-card>
          <v-card-title>
            <span class="headline">User Profile</span>
            <v-spacer></v-spacer>
            <v-menu bottom left>
              <template v-slot:activator="{ on }">
                <v-btn icon v-on="on"  >
                  <v-icon>more_vert</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="updatePassword">
                  <v-list-item-title>Update password</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>

          </v-card-title>

          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex  xs12>
                  <v-text-field label="Login" v-model="userprofile.login" readonly></v-text-field>
                  <v-text-field label="Api KEY" v-model="userprofile.secret" readonly></v-text-field>
                  <v-text-field v-model="userprofile.role" label="Role" readonly></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text  @click="closeProfile" :loading="loader">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    <v-dialog  v-model="dialog_password" max-width="600px" persistent no-click-animation transition="">
        <v-card>
          <v-card-title>
            <span class="headline">User Password</span>
          </v-card-title>

          <v-card-text>
            <v-container grid-list-md>
            <v-layout wrap>
            <v-flex  xs12>
              <v-text-field 
                  label="Current password"
                  v-model="current_password"
                  :type="show_password_current ? 'text' : 'password'"
                  @click:append="show_password_current = !show_password_current"
                  :append-icon="show_password_current ? 'visibility_off' : 'visibility'"
              ></v-text-field>
              <v-text-field 
                  label="New password"
                  v-model="new_password"
                  :type="show_password_new ? 'text' : 'password'"
                  @click:append="show_password_new = !show_password_new"
                  :append-icon="show_password_new ? 'visibility_off' : 'visibility'"
              ></v-text-field>
              </v-flex>
                </v-layout>
              </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="closePassword" :loading="loader">Close</v-btn>
            <v-btn color="blue darken-1" text @click="validatePassword" :loading="loader_password">Update</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

  </v-app>
</template>
 
<script>
  import Toolbar from './components/Toolbar.vue'
  import Navigation from './components/Navigation.vue'
  
  import { BackendApi } from '@/backend.js'
  import { EventBus } from './main'

  var pkg_json = require('./../package.json')

  export default {
    components: {
      Toolbar,
      Navigation
    },
    data () {
      return {
        current_workspace: "",
        app_version: pkg_json.version,
        error_auth: false,
        msg: '',
        nav: false,
        dialog_profile: false,
        userprofile: { secret: '', login: '', level: "" },
        loader: false,
        projects_list: [],
        loader_password: false,
        dialog_password: false,
        current_password: '',
        new_password: '',
        show_password_current: false,
        show_password_new: false,
        snackbar: false,
        snackbar_text: 'My timeout is set to 2000.',
        snackbar_timeout: 10000,
        snackbar_color: "error"
      }
    },
    created() {
        EventBus.$on('ApiAuthenticationError', obj => {
          this.snackbar = true
          this.snackbar_color = "error"
          this.error_auth = true
          this.snackbar_text = this.sentenceCase(obj.response.data.error)   

          // redirect to the login page
          // eslint-disable-next-line
          this.userLogout()
        });
        
        EventBus.$on('ApiError', obj => {
            this.snackbar = true
            this.snackbar_color = "error"
            this.snackbar_text = this.sentenceCase(obj.response.data.error) 
        });

        EventBus.$on('ApiFatal', obj => {
          this.snackbar = true
          this.snackbar_color = "error"
          this.error_auth = true
          this.snackbar_text = obj
        });

        EventBus.$on('AppWarning', obj => {
          this.snackbar = true
          this.snackbar_color = "warning"
          this.snackbar_text = obj
        });

        EventBus.$on('WorkspaceChanged', name => {
          this.current_workspace = name
        });
    },
    methods: {
      sentenceCase (str) {
        return str.replace(/[a-z]/i, function (letter) {
           return letter.toUpperCase();
        }).trim();
      },
      updatePassword(){
        this.dialog_profile = false
        this.dialog_password = true

        this.current_password = ""
        this.new_password = ""
      },
      userLogout() {
        // backend call
        // todo

        // remove user from local storage to log user out
        localStorage.removeItem('user_session');

        // emit signal to others components
        EventBus.$emit('ApiLogout', 'success')

        // update the name of the current page
        EventBus.$emit('CurrentPageChanged', "Login")

        // redirect to the login page
        // eslint-disable-next-line
        this.$router.push('/login').catch(err => {})
      },
      hideNavigation() {
         this.nav = !this.nav
      },
      closeError() {
        this.dialog = false
        this.msg = ''
        
        this.error_auth = false
      },
      closeWarning() {
        this.dialog_warning = false
        this.msg = ''
      },
      closeProfile(){
        this.dialog_profile = false
      },
      closePassword(){
        this.dialog_password = false
      },
      async userProfile() {
        // show the user profile
        this.dialog_profile = true
        this.loader = true
        this.projects_list = []
        this.userprofile = { secret: '', login: '', role: "" }

        // retrieve user session from local storage
        const user =  localStorage.getItem('user_session')
        const user_json =  JSON.parse(user)

        // call the backend to get the user profile
        await BackendApi.getUser(user_json.login).then(resp => {
          if ( resp != undefined) {
            this.userprofile = resp.users[0]
          } 
          // disable loader
          this.loader = false
        })
      },
      async validatePassword () {
        // enable progress
        this.loader_password = true

        // retrieve user session from local storage
        const user =  localStorage.getItem('user_session')
        const user_json =  JSON.parse(user)

        await BackendApi.updatePassword(user_json.login, this.current_password, this.new_password).then(resp => {
            if ( resp != undefined) {
              EventBus.$emit('AppWarning', "Password updated")
            } 
         })


        // disable progress
        this.loader_password = false
      }
   }
  }
</script>