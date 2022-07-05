<template>
  <div id="app">
    <el-select v-model="value">
      <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
    </el-select>
    <component :is="value" />
  </div>
</template>

<script>
import AdaptiveRegionDemo from './views/adaptiveRegionDemo'

export default {
  name: 'App',
  data() {
    return {
      value: 'AdaptiveRegionDemo',
      options: [
        { label: '自适应组件 - AdaptiveRegionDemo', value: 'AdaptiveRegionDemo' }
      ]
    }
  },
  components: { AdaptiveRegionDemo }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  text-align: left;
}

html, body {
  margin: 0;
  padding: 0;
}
</style>
