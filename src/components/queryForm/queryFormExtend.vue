<template>
  <el-col :offset="operationOffset" :span="span" class="queryFormOperation">
    <el-form-item label="_" label-width="0px" :class="(formAttrs['label-position'] || 'top') === 'top' && 'topFromItem_style'">
      <div class="btnItem" :style="{ textAlign: extendConfig.align || 'right' }">
        <template v-for="(buttonItem, index) in operate">
          <template v-if="buttonItem.confirm">
            <el-popconfirm
              v-if="!buttonItem.hasOwnProperty('condition') || buttonItem.condition(scope)"
              :key="index"
              :title="buttonItem.confirmMessage"
              @confirm="() => $emit('click', buttonItem.event)"
            >
              <el-button slot="reference" :size="extendConfig.size || size" v-bind="buttonItem">{{ buttonItem.label }}</el-button>
            </el-popconfirm>
          </template>
          <template v-else>
            <el-button
              v-if="!buttonItem.hasOwnProperty('condition') || buttonItem.condition(scope)"
              :key="index"
              v-bind="buttonItem"
              :size="extendConfig.size || size"
              @click="() => $emit('click', buttonItem.event)"
            >
              {{ buttonItem.label }}
            </el-button>
          </template>
        </template>
      </div>
    </el-form-item>
  </el-col>
</template>

<script>
/**
 * extendConfig 说明
 * @param { Boolean } hidden: 是否隐藏按钮组
 * @param { Boolean } isLineFeed 是否换行展示按钮组, 默认为false, 但如果最后行无法容纳按钮组, 则还是会进行换行处理
 * @param { Number } span 按钮租占用的span, 默认为4
 * @param { String } size 按钮组按钮大小, 默认集成form的size
 * @param { String } align 按钮位置, 默认 right
 * @param { Object } operate 自定义的按钮组 [{ label, confirm, confirmMessage, event, condition, ... }]
 *     @param { String } operate.label 按钮名称
 *     @param { String } operate.event 按钮点击事件
 *     @param { Boolean } operate.confirm 是否二次点击
 *     @param { String } operate.confirmMessage 二次点击提示信息
 *     @param { Function } operate.condition  是否显示
 *     @param { ... } 集成elementUI button 按钮相关属性
 */
export default {
  components: {

  },
  props: {
    innerFormItem: {
      type: Array,
      default() {
        return []
      }
    },
    formAttrs: {
      type: Object,
      default() {
        return {}
      }
    },
    extendConfig: {
      type: Object,
      default() {
        return {}
      }
    },
    size: {
      type: String,
      default() {
        return 'small'
      }
    }
  },
  data() {
    return {

    }
  },
  computed: {
    labelWidth() {
      const { formAttrs } = this
      if (formAttrs.labelPosition === 'top') {
        return ''
      }
      return '0px'
    },
    span() {
      return this.extendConfig.span || 4
    },
    operationOffset() {
      const { innerFormItem, span, extendConfig } = this
      if (extendConfig.isLineFeed) {
        return 24 - span
      }

      const operSpan = span
      let spanSum = 0;
      (innerFormItem || []).forEach(item => {
        let span = item.span || 0
        const appendAttrsFn = item.appendAttrsFn
        if (appendAttrsFn) {
          span = appendAttrsFn(item.span).span || 0
        }
        spanSum += span
      })

      if (24 - (spanSum % 24) >= operSpan) {
        return 24 - operSpan - (spanSum % 24)
      }

      return 24 - operSpan
    },
    operate() {
      const { operate } = this.extendConfig
      if (!operate) {
        return [
          { label: '查询', event: 'query', type: 'primary' },
          { label: '重置', event: 'reset' }
        ]
      }
      return operate
    }
  },
  watch: {

  },
  created() {

  },
  mounted() {

  },
  methods: {

  }
}
</script>

<style>
.queryFormOperation .topFromItem_style .el-form-item__label {
  width: 100% !important;
}
</style>
