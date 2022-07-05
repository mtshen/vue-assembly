<template>
  <!-- 操作按钮 -->
  <el-table-column
    label="操作"
    :width="operateWidth"
    fixed="right"
  >
    <template slot-scope="scope">
      <template v-for="(item, index) in operateList">
        <template v-if="item.confirm">
          <el-popconfirm
            v-if="!item.hasOwnProperty('condition') || item.condition(scope)"
            :key="index"
            :title="item.confirmMessage"
            @confirm="() => _operateClick(item.event, scope)"
          >
            <el-button slot="reference" v-bind="item" class="m5" type="text">{{ item.label }}</el-button>
          </el-popconfirm>
        </template>
        <template v-else>
          <el-button
            v-if="!item.hasOwnProperty('condition') || item.condition(scope)"
            :key="index"
            type="text"
            class="m5"
            v-bind="item"
            @click="() => _operateClick(item.event, scope)"
          >
            {{ item.label }}
          </el-button>
        </template>
      </template>
    </template>
  </el-table-column>
</template>
<script>

/**
 * extendConfig 说明
 * @param { String | Number } operateWidth 附加操作列宽度
 * @param { Boolean } sortCondition table是否支持排序, 默认为false
 * @param { Object } operate 自定义的按钮组 [{ label, confirm, confirmMessage, event, condition, ... }]
 *     @param { String } operate.label 按钮名称
 *     @param { String } operate.event 按钮点击事件
 *     @param { Boolean } operate.confirm 是否二次点击
 *     @param { String } operate.confirmMessage 二次点击提示信息
 *     @param { Function } operate.condition  是否显示
 *     @param { ... } 集成elementUI button 按钮相关属性
 */
export default {
  props: {
    extendConfig: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {}
  },
  computed: {
    operateList() {
      const { operate = [], sortCondition } = this.extendConfig
      const list = [...operate]
      if (sortCondition) {
        list.unshift(
          { event: 'asc_order', label: '上移' },
          { event: 'des_order', label: '下移' },
        )
      }
      return list
    },

    // 自适应宽度
    operateWidth() {
      const { operate = [], sortCondition, operateWidth } = this.extendConfig
      return operateWidth || operate.length * 70 + Number(!!sortCondition) * 110
    }
  },

  watch: {},

  created() {
  },
  methods: {
    // 操作按钮
    _operateClick(event, scope) {
      this.$emit('triggerBtn', { event, scope })
    }
  }
}
</script>
<style lang="less" scoped>
.m5 {
  margin: 0 5px;
}
</style>
