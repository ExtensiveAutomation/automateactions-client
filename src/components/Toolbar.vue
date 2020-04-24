<template>
 <div>
    <v-app-bar 
      dark
      fixed
      app
      :clipped-left="$vuetify.breakpoint.mdAndUp" 
    >
       <v-app-bar-nav-icon v-if="user_session != null"  @click.stop="hideNavigation"></v-app-bar-nav-icon>

       <v-toolbar dense dark flat>
    <v-toolbar-title>Automate Actions
        <span class="overline" v-if="user_session != null"> &bull; {{ current_page }}</span></v-toolbar-title>
    <v-spacer></v-spacer>
    <v-toolbar-items>
      <v-btn  
        icon 
        v-if="user_session != null"
        @click="onManualRefresh">
        <v-icon>refresh</v-icon>
      </v-btn>
      <v-select 
                v-if="user_session != null"
                solo-inverted
                flat
                v-model="current_workspace"
                :items="list_workspaces"
                @input="onWorkspaceChanged"
      ></v-select>
      <v-menu v-if="user_session != null"  bottom left offset-y>
        <template v-slot:activator="{ on }">
          <v-btn text v-on="on">
            <v-icon>person</v-icon>
            {{user_session.api_login}}
          </v-btn>
        </template>
        <v-list>
          <v-list-item  @click="userProfile"  >
            <v-list-item-title>
              <v-icon>account_circle</v-icon>
              Account
              </v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item  @click="userLogout" >
            <v-list-item-title>
                <v-icon>exit_to_app</v-icon>
                Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-toolbar-items>
    </v-toolbar>
      </v-app-bar>
  </div>
  
</template>
 
<script>
  import { EventBus } from '@/main'

  export default {
    data () {
      return {
        user_session: null,
        current_page: '',
        current_workspace: "",
        list_workspaces: [],
      }
    },
    methods: {
      onManualRefresh(){
        EventBus.$emit('ManualRefresh')
      },
      onWorkspaceChanged(){
        EventBus.$emit('WorkspaceChanged', this.current_workspace)
      },
      hideNavigation() {
        this.$emit('hideNavigation')
      },
      userProfile(){
        this.$emit('userProfile')
      },
      userLogout(){
        this.$emit('userLogout')
      },
      getWorkspaces(){
        this.list_workspaces = this.user_session.workspaces
        this.current_workspace = this.list_workspaces[0]

        this.onWorkspaceChanged()
      }
   },
   async created() {
      EventBus.$on('CurrentPageChanged', page => {
          this.current_page = page.name        
      });

      EventBus.$on('ApiLogged', obj => {
        this.user_session = obj
        this.getWorkspaces()
      });

      EventBus.$on('ApiLogout', obj => {
        this.user_session = null    
      });

      const user =  localStorage.getItem('user_session');
      if(user != null){
        this.user_session = JSON.parse(user)
        this.getWorkspaces()
      }
    }
  }
</script>