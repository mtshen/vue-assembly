<template>
  <el-form v-bind="$attrs" :model="innerFormData" :size="size">
    <el-row :gutter="gutter">
      <!-- 查询内容 -->
      <el-col v-for="item in innerFormItem" :key="item.prop" :span="item.span || 24">
        <el-form-item :label="item.label" :prop="item.prop">
          <template v-if="item.hasOwnProperty('slotName') && item.slotName">
            <slot :name="item.slotName" v-bind="item" />
          </template>
          <QueryFormItem v-else :item="item" :size="size" :cur-item-value="innerFormData[item.prop]" @update="formItemUpdate" />
        </el-form-item>
      </el-col>

      <!-- buttons -->
      <QueryFormExtend
        v-if="!isCustomBtn"
        :size="size"
        :form-attrs="$attrs"
        :extend-config="extendConfig"
        :inner-form-item="innerFormItem"
        @click="handelClickBtn"
      />
    </el-row>
    <div v-if="isCustomBtn">
      <slot />
    </div>
  </el-form>
</template>

<script>
/**
 * 用于表单查询与添加
 * @param { Array } formItem 表头, 具体参见 queryFormItem
 * @param { Object } formData 表单内容
 * @param { String } size 组件大小
 * @param { Object } extendConfig 按钮相关 详见 queryFormExtend.vue
 * ... 集成elementUI el-form组件相关属性
 * slot: 如果自定义了按钮, 则组件自带的按钮将不可用, 自定义和按钮配置只能二选一
 */
import QueryFormItem from './queryFormItem.vue'
import QueryFormExtend from './queryFormExtend.vue'
export default {
  components: {
    QueryFormItem,
    QueryFormExtend
  },
  props: {
    formItem: {
      type: Array,
      default() {
        return []
      }
    },
    formData: {
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
      innerFormData: {}
    }
  },
  computed: {
    innerFormItem() {
      return this.formItem.filter((item) => {
        return 'isShow' in item ? item.isShow : true
      })
    },
    gutter() {
      return this.extendConfig.gutter || 20
    },
    isCustomBtn() {
      const { $slots, extendConfig } = this
      if ($slots.default) {
        return true
      }
      return !!extendConfig.hidden
    }
  },
  watch: {
    formData: {
      handler(value) {
        this.innerFormData = { ...value }
      },
      immediate: true,
      deep: true
    }
  },
  created() {
  },
  mounted() {

  },
  methods: {
    formItemUpdate({ attr, value }) {
      const { innerFormData } = this
      const newFormData = { ...innerFormData, [attr.prop]: value }
      this.innerFormData = newFormData
      this.$emit('update:form-data', newFormData)
    },

    handelClickBtn(type) {
      switch (type) {
        case 'reset':
          this.resetFormData()
          break
        default:
          this.$emit(type, { ...this.innerFormData })
          break
      }
    },

    // 重置
    resetFormData() {
      this.$emit('reset')
      this.innerFormData = {}
      this.$emit('update:form-data', {})
    }
  }
}
</script>

<style>
.queryFormOperation .el-form-item__label {
  opacity: 0;
}
</style>
