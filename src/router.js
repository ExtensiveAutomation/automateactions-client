import Vue from 'vue'
import Router from 'vue-router'

import ContentUsers from './components/ContentUsers.vue';
import ContentWorkspaces from './components/ContentWorkspaces.vue'
import ContentGlobals from './components/ContentGlobals.vue'
import ContentLogin from './components/ContentLogin.vue'
import ContentDashboard from './components/ContentDashboard.vue'
import ContentJobs from './components/ContentJobs.vue'
import ContentExecutions from './components/ContentExecutions.vue'
import ContentActions from './components/ContentActions.vue'
import ContentSnippets from './components/ContentSnippets.vue'

Vue.use(Router)

const router = new Router({
    mode: 'history',
    routes: [
        { path: '/login', component: ContentLogin },
        { path: '/users', component: ContentUsers },
        { path: '/workspaces', component: ContentWorkspaces },
        { path: '/globals', component: ContentGlobals },
        { path: '/dashboard', component: ContentDashboard },
        { path: '/jobs', component: ContentJobs },
        { path: '/executions', component: ContentExecutions },
        { path: '/actions', component: ContentActions },
        { path: '/snippets', component: ContentSnippets },
        { path: '/*', redirect: '/login' } // otherwise redirect to home
      ]
});

router.beforeEach((to, from, next) => {
    const publicPages = ['/login']
    const authRequired = !publicPages.includes(to.path)
    const loggedIn = localStorage.getItem('user_session')

    if (authRequired && !loggedIn) {
        return next('/login')
    }
    next()
})

export default router;
