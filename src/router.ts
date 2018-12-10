import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            name: 'root',
            component: () => import('./components/ContentLayout.vue'),
            redirect: 'field/122/operations',
            children: [
                {
                    path: 'field/:id/operations',
                    name: 'fieldOperations',
                    props: (route) => ({
                        id: Number(route.params.id),
                    }),
                    component: () => import('./views/FieldOperations.vue'),
                },
            ],
        },
    ],
});
