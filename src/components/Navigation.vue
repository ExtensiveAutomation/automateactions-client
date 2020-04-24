<template>   
  <v-navigation-drawer 
    v-if="user_logged != null" 
    fixed
    clipped
    app
    v-model="drawer"
    color="blue"
    dark
  >

      <v-list dense >
        <v-list-item-group  v-model="current_page">
            <v-list-item @click="load_dashboard_p">
              <v-list-item-action>
              <v-icon>apps</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Dashboard</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

          <v-divider></v-divider>
          <v-subheader> Workspace  </v-subheader>

          <v-list-item @click="load_snippets_p">
            <v-list-item-action>
              <v-icon>code</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Snippets</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item @click="load_actions_p">
            <v-list-item-action>
              <v-icon>amp_stories</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Actions</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item @click="load_datastore_p">
            <v-list-item-action>
              <v-icon>settings_applications</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Globals</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-divider></v-divider>
          <v-subheader> Automation  </v-subheader>

          <v-list-item @click="load_history_p">
            <v-list-item-action>
              <v-icon>history</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Executions</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item @click="load_jobs_p">
            <v-list-item-action>
              <v-icon>view_headline</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Jobs</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

        <v-divider v-if="user_logged == 'admin'"></v-divider>
        <v-subheader v-if="user_logged == 'admin'"> Administration  </v-subheader>

        <v-list-item v-if="user_logged == 'admin'" @click="load_users_p">
          <v-list-item-action>
            <v-icon>people_outline</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Users</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-if="user_logged == 'admin'" @click="load_workspaces_p">
          <v-list-item-action>
            <v-icon>dashboard</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Workspaces</v-list-item-title>
          </v-list-item-content>
        </v-list-item> 
        
        </v-list-item-group >
    </v-list>
  <v-divider></v-divider>
    
  </v-navigation-drawer>
</template>
 
<script>
  import { EventBus } from '@/main'

  export default {
    props: {
      nav: Boolean
    },
    data () {
      return {
        user_logged: null,
        drawer: true,
        current_page: 0
      }
    },
      watch: {
        nav: function () {
          this.drawer = !this.drawer
        }
      },
     methods: {
       load_snippets_p() {
        // eslint-disable-next-line
        this.$router.push('/snippets').catch(err => {})
      },
       load_actions_p() {
        // eslint-disable-next-line
        this.$router.push('/actions').catch(err => {})
      },
      load_history_p() {
        // eslint-disable-next-line
        this.$router.push('/executions').catch(err => {})
      },
      load_jobs_p() {
        // eslint-disable-next-line
        this.$router.push('/jobs').catch(err => {})
      },
      load_datastore_p() {
        // eslint-disable-next-line
        this.$router.push('/globals').catch(err => {})
      },
      load_users_p() {
        // eslint-disable-next-line
        this.$router.push('/users').catch(err => {})
      },
      load_workspaces_p() {
        // eslint-disable-next-line
        this.$router.push('/workspaces').catch(err => {})
      },
      load_dashboard_p() {
        // eslint-disable-next-line
        this.$router.push('/dashboard').catch(err => {})
      },
     },
    created:function() {
      EventBus.$on('ApiLogged', user => {
        this.user_logged = user.role;  
      });

      // eslint-disable-next-line
      EventBus.$on('ApiLogout', user => {
        this.user_logged = null
      });

      EventBus.$on('CurrentPageChanged', page => {
          this.current_page = page.position        
      });

      const user =  localStorage.getItem('user_session');
      if(user != null){
        var user_json = JSON.parse(user)
        this.user_logged = user_json.role
      }

    }
  }
</script>