<template>
    <div id="app">
        <Header/>
        <router-view/>
    </div>
</template>

<script lang="ts">
    import Header from "@/components/Header.vue";
    import {Component, Vue} from "vue-property-decorator";

    @Component({
        components: {
            Header,
        },
    })
    export default class App extends Vue {
    }
</script>

<style lang="scss">
    body {
        padding: 0;
        margin: 0;
        height: 100vh;
        width: 100vw;
    }

    #app {
        height: calc(100% - 80px);
        width: 100%;
    }
</style>
