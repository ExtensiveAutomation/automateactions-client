import axios from 'axios'
import Vue from 'vue'
import { EventBus } from '@/main'

export const BackendApi = new Vue({
    methods: {
      execute(method, resource, data){
        // prepare the basic auth
        var user = localStorage.getItem('user_session')
        if(user === null || user === undefined) {
          EventBus.$emit('ApiAuthenticationError', "error to reach backend")
          return null
        }

        const user_json =  JSON.parse(user)
        var basic_auth = btoa( `${user_json.api_login}:${user_json.api_secret}`)

        var http_client = axios.create({
          baseURL: `${user_json.api_url}${user_json.api_path}`,
          json: true
         })

        // execute the request
        return http_client({
          method,
          url: resource,
          data,
          headers: {
           Authorization: `Basic ${basic_auth}`
          }
        }).then(resp => { 
          return resp.data
        }).catch(error => {
          if ( error.response != undefined ) {
            if ( error.response.status == 401 ) {
              EventBus.$emit('ApiAuthenticationError', error)
            } else {
              EventBus.$emit('ApiError', error)
            }
          } else {
            EventBus.$emit('ApiFatal', error)
          }
        })
      },
      loginUser(apiurl, apipath, login, password){
        var body = { 'login': login, 'password': password }
        return axios.post(`${apiurl}${apipath}v1/session`, body)
                    .then(response => {
                      if (response.data.session_id && response.data.api_secret && response.data.api_login) {
                        // append the initial url in response
                        response.data["api_url"] = apiurl
                        response.data["api_path"] = apipath

                        // return response
                        return response.data
                      } else {
                        EventBus.$emit('ApiError', "server not supported ")
                      }

                    }
                    ).catch(error => {
                      if ( error.response != undefined ) {
                        if ( error.response.status == 401 ) {
                          EventBus.$emit('ApiAuthenticationError', error)
                        } else {
                          EventBus.$emit('ApiError', error)
                        }
                      } else {
                        EventBus.$emit('ApiFatal', error)
                      }
                    })
      },
      getGlobals(workspace){
        return this.execute('get', '/v1/globals?workspace=' + encodeURIComponent(workspace))
      },
      saveGlobals(workspace, content){
        var body = { "value": content }
        return this.execute('post', '/v1/globals?workspace=' + encodeURIComponent(workspace), body)
      },
      getUser(login){
        return this.execute('get', '/v1/users/' + encodeURIComponent(login) )
      },
      getUsers(){
        return this.execute('get', '/v1/users')
      },
      deleteUser(login){
        return this.execute('delete', '/v1/users/' + encodeURIComponent(login))
      },
      addUser(login, password, role, projects){
        var body = {"login": login, "password": password, 
                    "role": role}
        return this.execute('post', '/v1/users', body)            
      },
      updateUser(login, role){
        var body = {"role": role}
        return this.execute('patch', '/v1/users/' + encodeURIComponent(login), body)
      },
      resetUserPassword(login){
        return this.execute('delete', '/v1/users/' + encodeURIComponent(login) + '/password')
      },
      updatePassword(login, currentpassword, newpassword){
        var body = {"current-password": currentpassword, "new-password": newpassword}
        return this.execute('patch', '/v1/users/' + encodeURIComponent(login) + '/password', body)
      },
      getWorkspaces() {
        return this.execute('get', '/v1/workspaces')
      },
      addWorkspace(name) {
        var body = {"name": name}
        return this.execute('post', '/v1/workspaces', body)
      },
      deleteWorkspace(name){
        return this.execute('delete', '/v1/workspaces/' + encodeURIComponent(name) )
      },
      getJobsListing(workspace){
        return this.execute('get', '/v1/jobs?workspace=' + encodeURIComponent(workspace))
      },
      deleteJob(id){
        return this.execute('delete', '/v1/jobs/' + id)
      },
      scheduleJob(testprjid, yamlfile, schedid, y, m, d, h, mn, s){
        var body = { "project-id": testprjid, "yaml-file": yamlfile,
                     "mode": schedid, "schedule-at": [y, m, d, h, mn, s] }
        return this.execute('post', '/v1/jobs', body)
      },
      scheduleJobContent(testprjid, yamlcontent){
        var body = { "project-id": testprjid, "yaml-content": yamlcontent}
        return this.execute('post', '/v1/jobs', body)
      },
      getSnippetsListing(workspace){
        return this.execute('get', '/v1/snippets?workspace=' + encodeURIComponent(workspace))
      },
      getSnippetFile(filename, workspace){
        return this.execute('get', '/v1/snippets/' + encodeURIComponent(filename) + '?workspace=' + encodeURIComponent(workspace))
      },
      deleteSnippet(scriptpath, workspace){
        return this.execute('delete', '/v1/snippets/' + encodeURIComponent(scriptpath) + '?workspace=' + encodeURIComponent(workspace))
      },
      duplicateSnippet(scriptpath, workspace){
        return this.execute('put', '/v1/snippets/' + encodeURIComponent(scriptpath) + '?workspace=' + encodeURIComponent(workspace))
      },
      renameSnippet(scriptpath, workspace, new_name){
        var body = {"name": new_name}
        return this.execute('patch', '/v1/snippets/' + encodeURIComponent(scriptpath) + '?workspace=' + encodeURIComponent(workspace), body)
      },
      addSnippet(scriptpath, workspace, content){
        var body = {"content": content}
        return this.execute('post', '/v1/snippets/' + encodeURIComponent(scriptpath) + '?workspace=' + encodeURIComponent(workspace), body)
      },
      getActionsListing(workspace){
        return this.execute('get', '/v1/actions?workspace=' + encodeURIComponent(workspace))
      },
      getActionFile(filename, workspace){
        return this.execute('get', '/v1/actions/' + encodeURIComponent(filename) + '?workspace=' + encodeURIComponent(workspace))
      },
      deleteAction(actionpath, workspace){
        return this.execute('delete', '/v1/actions/' + encodeURIComponent(actionpath) + '?workspace=' + encodeURIComponent(workspace))
      },
      duplicateAction(actionpath, workspace){
        return this.execute('put', '/v1/actions/' + encodeURIComponent(actionpath) + '?workspace=' + encodeURIComponent(workspace))
      },
      renameAction(actionpath, workspace, new_name){
        var body = {"name": new_name}
        return this.execute('patch', '/v1/actions/' + encodeURIComponent(actionpath) + '?workspace=' + encodeURIComponent(workspace), body)
      },
      addAction(actionpath, workspace, content){
        var body = {"content": content}
        return this.execute('post', '/v1/actions/' + encodeURIComponent(actionpath) + '?workspace=' + encodeURIComponent(workspace), body)
      },
      getExecutionsListing(workspace){
        return this.execute('get', '/v1/executions?workspace=' + encodeURIComponent(workspace))
      },
      deleteExecution(id){
        return this.execute('delete', '/v1/executions/' + id)
      },
      executionDetails(id, log_index){
        return this.execute('get', '/v1/executions/' + id + '?log_index=' + log_index)
      }
    }
})