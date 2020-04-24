<template>

<v-content>
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4>
            
            <v-card class="elevation-12">
              <v-card-text>
                
                 <div class="text-xs-center">
            </div>
                <v-form>
                  
                  <v-text-field 
                            prepend-icon="cloud" 
                            name="apiurl" 
                            v-model="apiurl" 
                            label="Api URL" 
                            type="text"
                            placeholder="https://"
                            >  </v-text-field>
                   <v-text-field 
                            prepend-icon="http" 
                            name="apipath" 
                            v-model="apipath" 
                            label="Api Path" 
                            type="text"
                            placeholder="/"
                            >  </v-text-field>
                  <v-text-field 
                            prepend-icon="person" 
                            name="login" 
                            v-model="username" 
                            label="Login" 
                            type="text"
                            placeholder="admin"
                            > </v-text-field>
                  <v-text-field 
                            prepend-icon="lock" 
                            name="password" 
                            v-model="password"  
                            label="Password" 
                            type="password"
                            > </v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                 
                <v-spacer></v-spacer>
                <v-btn 
                    color="green" dark 
                    @click="loginUser" 
                    :loading="loader">Login</v-btn>
              </v-card-actions>
            </v-card>
            <div class="text-xs-center">
                <v-alert
                  v-if="welcome_message"
                  :value="true"
                  color="warning"
                  icon="priority_high"
                  outline
                >{{welcome_message}}</v-alert>
            </div>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>

</template>

<script>
    import { BackendApi } from '@/backend.js'
    import { EventBus } from '@/main'
    import axios from 'axios'

    export default {
        data() {
            return {
                apiurl: '',
                apipath: '',
                username: '',
                password: '',
                welcome_message: '',
                loader: false
            }
        },
        methods: {
            async loginUser() {
                var app = this;

                // enable progress
                this.loader = true

                // backend call 
                await BackendApi.loginUser(this.apiurl, this.apipath, this.username, this.password).then(resp => {
                  if ( resp != undefined) {

                    // store user session in local storage
                    var user_session = Object.assign({}, resp)
                    localStorage.setItem('user_session', JSON.stringify(user_session))

                  }  
               })
                            
              var user = localStorage.getItem('user_session')
              if(user != null){
                const user_session =  JSON.parse(user)

                await BackendApi.getWorkspaces().then(resp2 => {
                  if ( resp2 != undefined) {
                    user_session["workspaces"] = resp2.workspaces
                    localStorage.setItem('user_session', JSON.stringify(user_session))

                      // emit signal to others components
                      EventBus.$emit('ApiLogged', user_session)

                      // redirect to the welcome page
                      // eslint-disable-next-line
                      app.$router.push('/dashboard').catch(err => {})  
                    
                  }
                })
              }
               


                // disable progress
                this.loader = false
            }
        },
        created:function() {
            var app = this;

            axios.get("/config.json").then(response => {
                this.welcome_message = response.data.WELCOME_MESSAGE
                this.apiurl = response.data.API_URL
                this.apipath = response.data.API_PATH
                this.username = response.data.API_LOGIN
                this.password = response.data.API_PASSWORD
            })

            // if a user session exists then redirect to the dashboard page
            if(localStorage.getItem('user_session') != null) {
              // eslint-disable-next-line
              app.$router.push('/dashboard').catch(err => {})
            }

        }  
    }
</script>
