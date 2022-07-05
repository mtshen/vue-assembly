<template>
  <el-form ref="tableForm" class="table-form" v-bind="$attrs" :style="{width}" :model="formModel">
    <el-table
      :key="tableKey"
      class="table-form"
      border
      :data="formModel.innerTableData"
      v-bind="extendConfig"
      tooltip-effect="dark gles-table"
      v-on="$listeners"
      @cell-mouse-enter="showTooltip"
      @cell-mouse-leave="hiddenTooltip"
    >
      <template #empty>
        <div class="tc mt20 mb20">
          <p class="noData">
            暂无数据
          </p>
        </div>
      </template>
      <!-- 支持多选 -->
      <el-table-column v-if="isCheckBox" type="selection" fixed :selectable="_handleRowSelect" />
      <!-- 支持下标 -->
      <el-table-column v-if="isSortNum" type="index" width="80">
        <template #header>
          <div>行号</div>
        </template>
      </el-table-column>
      <!-- 主体功能区 -->
      <el-table-column
        v-for="(item, i) in innerTableItem"
        :key="`${item.prop}-${i}`"
        v-bind="item"
        :prop="item.prop"
        :label="item.label"
        :formatter="null"
        :render-header="_labelFunction"
      >
        <template slot-scope="option">
          <template v-if="item.hasOwnProperty('slotName') && item.slotName">
            <!-- 支持自定义slot -->
            <template v-if="editPattern">
              <!-- 默认插槽 -->
              <slot v-bind="option" :slot-name="item.slotName" />
            </template>
            <template v-else>
              <slot :name="item.slotName" v-bind="option" />
            </template>
          </template>
          <TableFormItem v-else-if="isComponent(item, option)" :option="option" :item="item" :size="size" :g-sersync="sersync" @update="tableFormItemUpdate" />
          <span v-else> {{ _formatterCellValue(item, option) }} </span>
        </template>
        <!-- 扩展添加 -->
        <slot v-if="item.appendSlotName" :name="item.appendSlotName" />
      </el-table-column>
      <!-- 操作按钮 -->
      <tableFormOperate v-if="isOperate" :extend-config="extendConfig" @triggerBtn="triggerBtn" />
    </el-table>

    <!-- 支持分页 -->
    <TablePagination v-if="pageData" class="pagination" :page-data="pageData" @change="pageChange" />
  </el-form>
</template>
<script>
import TableFormItem from './tableFormItem'
import tableFormOperate from './tableFormOperate'
import TablePagination from './tablePagination'

/**
 * 表单组件
 *
 * 入参
 * @param { Array } tableItem 表单表头及列设置, 详见 .tableFormItem.vue, 必填
 * @param { Array } tableData 表单数据, 必填
 * @param { Object } extendConfig  行操作按钮配置
 *  * extendConfig配置新增可配置内容
 *  * @param { Function } sortCondition 启用排序的行规则, 会传入 { row, $index }, 不传入默认不可排序
 *
 * @param { String } rowKey  主键, 如果设置该值, 将可以使用 getRowItemDataByKey, setRowItemDataByKey, delRowItemDataByKey 进行表单数据的操作
 * @param { Object } pageData 分页相关数据, 选填, 不填写将不展示分页
 * @param { Boolean } editPattern 是否是编辑模式 非必要不要加这个参数, 这个参数是对editBase模块进行额外校验的
 * @param { Boolean } sersync 是否开启实时同步, 开启后input输入内容也会进行双绑定, 默认开启
 *
 * 事件：
 *
 * 可用属性
 * isCheckBox: 当前表单是否开启了多选
 * isSortNum:  当前表单是否开启了展示行号
 * innerTableItem: 当前表单展示的tableItem
 * innerTableData: 当前表单的数据
 *
 * 方法
 * getRowItemDataByIndex(index) 查询某行数据, index为行号
 * delRowItemDataByIndex(index) 删除某行数据, index为行号
 * setRowItemDataByIndex(index, data) 修改某行数据, index为行号, data为数据
 * getRowItemDataByKey(value) 查询某行数据, value为设置的rowKey对应值
 * delRowItemDataByKey(value) 删除某行数据, value为设置的rowKey对应值
 * setRowItemDataByKey(value, data) 修改某行数据, value为设置的rowKey对应值, data为数据
 * updateTabel()  手动刷新当前组件, 当组件数据变更后组件没有进行实时更新, 可用利用该功能触发一次重绘, *慎用
 */
export default {
  name: 'MTableForm',
  components: {
    TableFormItem, tableFormOperate, TablePagination
  },
  props: {
    tableItem: {
      type: Array,
      default: () => []
    },
    tableData: {
      type: Array,
      default: () => []
    },
    extendConfig: {
      type: Object,
      default: () => ({})
    },
    rowKey: {
      type: String,
      default: () => ''
    },
    size: {
      type: String,
      default: 'small'
    },
    width: {
      type: String,
      default: '100%'
    },
    pageData: {
      type: [Object],
      default: () => undefined
    },
    sersync: {
      type: Boolean,
      default: () => true
    },
    editPattern: {
      type: Boolean
    }
  },
  data() {
    return {
      tableKey: 'tableKey',
      formModel: {
        innerTableData: []
      },
      tableCellMouse: {
        cellDom: null, // 鼠标移入的cell-dom
        hidden: null, // 是否移除单元格
        row: null // 行数据
      }
    }
  },
  computed: {
    innerTableItem() {
      return this.tableItem.filter((item) => {
        return 'isShow' in item ? item.isShow : true
      })
    },
    isCheckBox() {
      return this.extendConfig.checkBox
    },
    isSortNum() {
      return this.extendConfig.sortNum
    },
    isOperate() {
      const { extendConfig } = this
      return ((extendConfig || {}).operate || {}).length || (extendConfig || {}).sortCondition
    }
  },

  watch: {
    tableData: {
      handler() {
        this.formModel.innerTableData = this._.cloneDeep(this.tableData)
      },
      deep: true,
      immediate: true
    },

    tableItem: {
      handler() {
        this.formModel.innerTableData = this._.cloneDeep(this.tableData)
      },
      deep: true,
      immediate: true
    }
  },

  created() {},
  mounted() {
    // this.initDragSort()
  },
  methods: {
    // 鼠标移入cell
    showTooltip(row, column, cell) {
      if (!column.showOverflowTooltip) {
        return
      }
      this.tableCellMouse.cellDom = cell
      this.tableCellMouse.row = row
      this.tableCellMouse.hidden = false
    },

    // 鼠标移出cell
    hiddenTooltip() {
      this.tableCellMouse.hidden = true
    },

    // 选择当前select
    _handleRowSelect(row) {
      // eslint-disable-next-line no-prototype-builtins
      return row.hasOwnProperty('isSelection') ? row.isSelection : true
    },

    _computeWidth(str) {
      let width = 0
      for (let i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 255) {
          // 中文
          width += 16
        } else {
          // 英文
          width += 8
        }
      }
      if (this.extendConfig.columnMinWidth && width < this.extendConfig.columnMinWidth) {
        width = this.extendConfig.columnMinWidth
      }
      return width
    },

    _labelFunction(h, { column, $index }) {
      const bufferWidth = column.sortable ? 40 : 20
      const minWidth = column.minWidth !== 80 ? column.minWidth : null
      column.minWidth = minWidth || this._computeWidth(column.label) + bufferWidth
      return h('div', { class: 'table-head', style: { width: '100%' }}, [column.label])
    },

    triggerBtn({ event, scope }) {
      switch (event) {
        case 'asc_order':
          this.upOrderToItem(scope)
          break
        case 'des_order':
          this.downOrderToItem(scope)
          break
      }

      this.$emit(event, scope)
      this.$emit('triggerBtn', { event, scope })
    },

    // 数据顺序上升一位
    upOrderToItem({ $index }) {
      // 如果位置是第一位, 则不做操作
      if ($index <= 0) {
        this.$message({
          type: 'warning',
          message: '当前已经是第一行了'
        })
        return
      }

      const { innerTableData } = this.formModel;
      [innerTableData[$index], innerTableData[$index - 1]] = [innerTableData[$index - 1], innerTableData[$index]]
      this.updateTabel()
      this.updateBindTableData(this.formModel.innerTableData)
    },

    // 数据顺序下降一位
    downOrderToItem({ $index }) {
      const { innerTableData } = this.formModel
      // 如果是最好一位, 则不做任何操作
      if ($index >= innerTableData.length - 1) {
        this.$message({
          type: 'warning',
          message: '当前已经是最后一行了'
        })
        return
      }
      [innerTableData[$index], innerTableData[$index + 1]] = [innerTableData[$index + 1], innerTableData[$index]]
      this.updateTabel()
      this.updateBindTableData(this.formModel.innerTableData)
    },

    // 数据更新回调函数
    tableFormItemUpdate({ value, option, item }) {
      const { $index } = option
      const rowData = this.formModel.innerTableData[$index]
      rowData[item.prop] = value

      item.watch && item.watch(value, rowData, $index, this)

      // 更新数据
      this.updateTabel()
      // 是否尝试双向绑定(伪)
      this.updateBindTableData(this.formModel.innerTableData)
    },

    // 取某行数据
    getRowItemDataByIndex(index) {
      return this.formModel.innerTableData[index]
    },

    // 修改某行数据
    setRowItemDataByIndex(index, changeData) {
      this.formModel.innerTableData[index] = { ...this.formModel.innerTableData[index], ...changeData }
      this.updateBindTableData(this.formModel.innerTableData)
    },

    updateBindTableData(innerTableData) {
      this.$emit('update:table-data', innerTableData)
    },

    // 删除某行数据
    delRowItemDataByIndex(index) {
      this.formModel.innerTableData.splice(index, 1)
      this.updateBindTableData(this.formModel.innerTableData)
    },

    // 更新table数据, 并返回最新数据
    updateTabel() {
      this.formModel.innerTableData = this._.cloneDeep(this.formModel.innerTableData)
      return this.formModel.innerTableData
    },
    // 获取更新后的数据
    getUpdateTableData() {
      return this.formModel.innerTableData
    },
    getRowItemDataByKey(value) {
      const { innerTableData, rowKey } = this
      return innerTableData.find((tableDataItem) => innerTableData[rowKey] === value)
    },
    delRowItemDataByKey(value) {
      const { innerTableData, rowKey } = this
      const index = innerTableData.findIndex((tableDataItem) => innerTableData[rowKey] === value)
      index > -1 && this.delRowItemDataByIndex(index)
    },
    setRowItemDataByKey(value, data) {
      const { innerTableData, rowKey } = this
      const index = innerTableData.findIndex((tableDataItem) => innerTableData[rowKey] === value)
      index > -1 && this.setRowItemDataByIndex(index, data)
    },
    /**
     * 清空当前表单校验
     */
    clearValidate() {
      this.$refs.tableForm.resetFields()
    },
    /**
     * 校验表单
     */
    async validateTableForm() {
      const len = ((this.formModel || {}).innerTableData || {}).length
      try {
        for (let i = 0; i < len; i++) {
          const valid = this.validateField(i)
          if (!valid) {
            return Promise.reject()
          }
        }
        return Promise.resolve(this.formModel.innerTableData)
      } catch (e) {
        return Promise.reject()
      }
    },
    /**
     * 对表单字段进行校验
     * @param {*} form
     * @param {*} index
     */
    validateField(index) {
      let result = true
      for (const item of this.$refs.tableForm.fields) {
        if (parseInt(item.prop.split('.')[1]) === index) {
          this.$refs.tableForm.validateField(item.prop, (error) => {
            if (error) {
              result = false
            }
          })
        }
        if (!result) break
      }
      return result
    },

    // 格式化当前
    _formatterCellValue({ formatter = null, prop }, { row, $index }) {
      if (formatter) {
        // 存在formatter
        if (typeof formatter === 'function') {
          return formatter(row, prop, row[prop], $index)
        }
      }
      return row[prop] || ''
    },

    pageChange(data) {
      this.$emit('pageChange', data)
    },

    isComponent(item, { row, $index }) {
      const { editPattern } = this
      const { component } = item
      const { $isRowEdit } = row
      const isEdit = editPattern ? $isRowEdit : true
      if (typeof component === 'function') {
        return isEdit && component(row, $index)
      }
      return isEdit && component
    },

    // 校验某一行的数据
    validateIndexRow(index) {
      const { $isRowEdit, $originalRowData, ...row } = this.formModel.innerTableData[index]
      void ($isRowEdit)
      void ($originalRowData)
      return new Promise((resolve, reject) => {
        const keys = Object.keys(row).map((key) => `innerTableData.${index}.${key}`)

        this.$refs.tableForm.validateField(keys, (errorMessage) => {
          if (errorMessage) {
            reject(errorMessage)
          }
        })

        resolve()
      })
    }
  }
}
</script>
<style lang="scss">
.table-form {
  .el-form-item {
    margin-bottom: 0;
  }
  .el-input {
    width: auto;
  }
  .el-form-item {
    &.is-error {
      height: 48px;
    }
    .el-form-item__error {
      z-index: 100;
    }
  }
  td {
    padding: 2px 0 !important;
  }
  .el-select__tags {
    max-width: 260px !important;
  }

  .pagination {
    text-align: right;
    background: #fff;
    padding-top: 20px;
    padding-bottom: 10px;
  }
}
</style>
