<template>
  <div class="__adaptiveRegionSty" ref="adaptiveRegionRef" :style="{ transform, width: `${width}px` }">
    <slot />
  </div>
</template>

<script>
/**
 * @param { width } 宽, 设计图的宽度
 */
export default {
  props: {
    width: {
      type: Number,
      default() {
        return 1920
      }
    }
  },
  data() {
    return {
      transform: 'scale(1)'
    }
  },
  mounted() {
    this.autoSize()
  },
  methods: {
    autoSize() {
      const { adaptiveRegionRef } = this.$refs
      if (adaptiveRegionRef) {
        const parentNode = adaptiveRegionRef.parentNode
        this.transform = `scale(${parentNode.offsetWidth / this.width})`
      }
      requestAnimationFrame(() => this.autoSize())
    }
  }
}
</script>

<style scoped lang="scss">
.__adaptiveRegionSty {
  transform-origin: left top;
  font-size: 0;
}
</style>
