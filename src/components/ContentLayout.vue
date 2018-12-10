<template>
    <div class="content-wrapper">
        <router-view></router-view>
    </div>
</template>

<script>
    export default {
        name: "ContentLayout"
    }
</script>

<style scoped lang="scss">
    .content-wrapper {
        width: 100%;
        height: 100%;
        background: #F9F9F9;
    }
</style>
