<template>
  <AdaptiveRegion :width="1920">
    <div class="item boxItem0">boxItem0</div>
    <div class="item boxItem1">boxItem1</div>
    <div class="item boxItem2">boxItem2</div>
  </AdaptiveRegion>
</template>

<script>
import AdaptiveRegion from '@/components/adaptiveRegion'
export default {
  props: {

  },
  data() {
    return {

    }
  },
  computed: {

  },
  created() {

  },
  mounted() {

  },
  watch: {

  },
  methods: {

  },
  components: {
    AdaptiveRegion
  }
}
</script>

<style scoped lang="scss">
.item {
  display: inline-block;
  font-size: 100px;
  text-align: center;
}

.boxItem0 {
  width: 1920px;
  height: 400px;
  background: #CCC;
}
.boxItem1 {
  background: #991;
  width: 960px;
  height: 400px;
}
.boxItem2 {
  background: #911;
  width: 960px;
  height: 400px;
}
</style>
