<template>
  <el-form-item :prop="item.prop" :rules="curBindAttrs.rules">
    <template v-if="curItemComponentName">

      <component
        :is="curItemComponentName"
        v-model.trim="value"
        class="queryFormItemStyle"
        autocomplete="off"
        v-bind="curBindAttrs"
        :size="item.size || size"
        v-on="item"
        @change="updateValue"
        @input="_inputOut"
        @keyup.native="(val) => _handleKeyUp(val, item)"
      >
        <!-- 针对select组件 -->
        <template v-if="componentNameisSelect" #default>
          <el-option v-for="(children, num) in curBindAttrs.data" :key="num" v-bind="children" :label="children.label" :value="children.value" />
        </template>

        <!-- 针对checkboxgroup组件 -->
        <template v-else-if="componentNameisCheckboxGroup" #default>
          <el-checkbox v-for="(children, num) in curBindAttrs.data" :key="num" v-bind="children" :label="children.value">
            {{ children.label }}
          </el-checkbox>
        </template>

        <!-- 针对radiogroup组件 -->
        <template v-else-if="componentNameisRadioGroup" #default>
          <el-radio v-for="(children, num) in curBindAttrs.data" :key="num" v-bind="children" :label="children.value">
            {{ children.label }}
          </el-radio>
        </template>
      </component>
    </template>
    <template v-else>
      {{ curItemValue }}
    </template>
  </el-form-item>
</template>
<script>
/**
 * tableItem 属性可配置内容
 * prop: 数据key
 * span: 1 - 24
 * component: 组件
 * label: 表头
 * isShow: 默认false, 不展示
 *
 * 调整:
 *  component 支持函数的方式进行动态渲染
 *
 * 新增 sersync
 * 默认为开启, 设置为false关闭, 关闭后input将不会触发数据绑定 从而降低table渲染性能, 当table性能无法满足需求时可关闭该参数
 *
 * 新增:
 *  appendAttrsFn(row, index, item) 支持函数的方式进行属性动态渲染
 *    @params row { Object } 本行数据
 *    @params index { Number } 本行行号
 *    @params item { Object } 当前行配置
 *
 *  例:
 *  appendAttrsFn(row, index, item) {
 *    return { disabled: index <= 3 }
 *  }
 *
 *  watch(value, rowData, $index, tableRef) 与原mchang类似, 在之前的基础上扩展了可用性
 *    @params value { any } 当前变更后的值
 *    @params rowData { Object } 当前行数据
 *    @params $index { Number } 本行行号
 *    @params tableRef { Vue } 当前Table组件实例, 可用使用组件中的所有属性和方法
 *
 *  例:
 *  watch(value, rowData, $index, tableRef) {
 *    tableRef.setRowItemDataByIndex(index, { defaultValue: 100 })
 *  }
 *
 */
export default {
  name: 'MTableForm',
  props: {
    item: {
      type: Object,
      required: true
    },
    // form表单组件的尺寸
    size: {
      type: String,
      default: 'small'
    },
    curItemValue: {
      type: [Object, Array, String, Number],
      default() { return '' }
    }
  },

  data() {
    return {
      value: ''
    }
  },

  computed: {
    curItemComponentName() {
      const { item } = this
      return this.__getComponent(item.component)
    },
    curBindAttrs() {
      const { item } = this
      return this.__getAppendBind(item)
    },
    componentNameisSelect() {
      return this.curItemComponentName === 'elSelect'
    },
    componentNameisCheckboxGroup() {
      return this.curItemComponentName === 'elCheckboxGroup'
    },
    componentNameisRadioGroup() {
      return this.curItemComponentName === 'elRadioGroup'
    }
  },

  watch: {
    curItemValue: {
      handler() {
        this.value = this.curItemValue
      },
      deep: true,
      immediate: true
    }
  },
  created() {},
  methods: {
    /**
     * 获取传入的item种的component内容
     * @param component { string | Function }
     * @param row { Object }
     */
    __getComponent(component = '') {
      return typeof component === 'string' ? component : component()
    },
    /**
     *  代理change方法
     */
    _handleKeyUp(keyEvent, formItem) {
      const { keyup, prop, type } = formItem
      // textarea 需要处理分行功能，tirm会过滤分行
      if (keyEvent.keyCode === 13 && type === 'textarea') {
        this.formModel[prop] = `${this.formModel[prop]}\n`
      }
      keyup && keyup(keyEvent, formItem)
    },

    __getAppendBind(item) {
      const { appendAttrsFn, data, ...option } = item
      if (appendAttrsFn) {
        const opt = { ...option, data, ...appendAttrsFn(item) }
        return opt
      }
      const newData = typeof data === 'function' ? data() : data || []
      return {
        ...option,
        data: newData
      }
    },

    // 数据变化更新, 目前仅绑定了change事件进行监听
    updateValue() {
      const { item } = this
      this.$emit('update', { item, value: this.value })
    },

    // 当输入框检测到输入, 且存在校验规则, 此时将置空校验规则
    _inputOut() {
      this.$emit('update', {
        value: this.value,
        attr: this.curBindAttrs
      })
    }
  }
}
</script>
<style scoped lang="less">
.queryFormItemStyle {
  width: 100%;
}
</style>
