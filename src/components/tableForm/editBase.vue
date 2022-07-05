<template>
  <TableForm
    ref="tableForm"
    edit-pattern
    v-bind="$attrs"
    :extend-config="$extendConfig"
    :table-data.sync="innerTableData"
    @__editRowItem="__editRowItem"
    @__saveRowItem="__saveRowItem"
    @__cancelRowItem="__cancelRowItem"
    @__removeRowItem="__removeRowItem"
    @triggerBtn="triggerBtn"
    v-on="$listeners"
  >
    <template #default="option">
      <slot v-bind="option" :name="option.slotName" />
    </template>
  </TableForm>
</template>
<script>
import TableForm from './index'
import editBaseOperation from './mixins/editBase.operation'
/**
 * @MTableEditForm
 * 属性继承 ./index.vue, ./tablePagination 组件
 * 支持双向绑定
 *
 * 新增入参
 * @param { Boolean } isOneEdit 默认true, 是否同一时间只支持一条数据的修改
 * @param { Array<String> } baseOperation 默认 ['edit', 'remove']
 *  目前支持的默认行为:
 *    edit: 编辑功能, 点击编辑, 切换该行到指定的formData数据
 *    remove: 删除功能, 点击删除, 移除改行数据
 * 渲染时将严格按照改属性的顺序渲染
 *
 * 支持函数
 * getTableData()   获取更新之后的数据
 * getTable()       获取tabled ref数据
 * getEditRowList() 获取当前处于编辑模式的数据, 始终返回一个数组
 *
 * 对于编辑的控制提供了以下函数
 * afterSaveRowFn(resolve, reject) 每次保存行之后的行为
 * beforeSaveRowFn(resolve, reject) 每次保存行之前的行为，可以允许控制是否保存
 * beforeEditRowFn(resolve, reject) 每次点击编辑前, 可用控制是否能够打开编辑
 *
 * 变更行数据为编辑模式提供了以下方式
 * setRowEditStatus(row) 设置指定行变更为编辑模式, 需要传入注入组件的tableData的某个数据
 * setIndexEditStatus(index)  设置指定行变更为编辑模式
 * setKeyEditStatus(key) 必须设置了key, 才可以使用, 设置指定key的数据变更为编辑模式
 *
 * setRowEditStatusOff(row) 关闭指定行的编辑模式, 需要传入注入组件的tableData的某个数据
 * setIndexEditStatusOff(index)  关闭指定行的编辑模式
 * setKeyEditStatusOff(key) 必须设置了key, 才可以使用, 关闭指定key的编辑模式
 *
 * 设置指定行取消编辑(同样支持 row, index,  )
 * cancelRowEdit,
 *
 * 支持事件
 * @rowEditChange  行编辑完成的回调函数
 *
 */
export default {
  name: 'MTableEditForm',
  components: { TableForm },
  mixins: [editBaseOperation],
  props: {
    baseOperation: {
      type: Array,
      default: () => ['edit', 'remove']
    },
    isOneEdit: {
      type: Boolean,
      default: () => true
    },
    tableData: {
      type: Array,
      default: () => []
    },
    extendConfig: {
      type: Object,
      default: () => ({})
    },
    afterSaveRowFn: {
      type: Function,
      default: null
    },
    beforeSaveRowFn: {
      type: Function,
      default: null
    },
    beforeEditRowFn: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      innerTableData: []
    }
  },

  computed: {
    $extendConfig() {
      const { baseOperation, extendConfig } = this
      const { operate = [], ...itConf } = extendConfig
      const baseoperate = [
        ...this.parseOperate(baseOperation),
        ...(operate || [])
      ]

      return {
        ...itConf,
        operate: baseoperate
      }
    }
  },

  watch: {
    tableData: {
      handler() {
        this.innerTableData = this.tableData
      },
      deep: true,
      immediate: true
    }
  },

  created() {},

  methods: {
    pageChange(data) {
      this.$emit('pageChange', data)
    },

    // 编辑当前行
    __editRowItem(item) {
      const { beforeEditRowFn, isOneEdit } = this
      const editRowLength = this.getEditRowList().length

      // 检查是否能够进行编辑
      if (isOneEdit && editRowLength) {
        return this.$message.error('请先保存当前编辑的内容！')
      }

      if (beforeEditRowFn) {
        return new Promise((resolve, reject) => {
          beforeEditRowFn(resolve, reject)
        }).then(() => {
          this.setRowEditStatus(item.row)
          this.$emit('editRowItem', item)
        })
      }
      this.setRowEditStatus(item.row)
      this.$emit('editRowItem', item)
    },

    // 保存当前行
    __saveRowItem({ row, $index }) {
      const { beforeSaveRowFn } = this
      if (beforeSaveRowFn) {
        return new Promise((resolve, reject) => {
          this.validateIndexRow($index).then(() => {
            beforeSaveRowFn(resolve, reject)
          })
        }).then(() => {
          this.setRowEditStatusOff(row)
          this.afterSaveRowFn && this.afterSaveRowFn()
          this.$emit('rowEditChange', { row, $index })
          this.$emit('saveRowItem', { row, $index })
          this.updateBindTableData()
        })
      }
      this.validateIndexRow($index).then(() => {
        this.setRowEditStatusOff(row)
        this.afterSaveRowFn && this.afterSaveRowFn()
        this.$emit('rowEditChange', { row, $index })
        this.$emit('saveRowItem', { row, $index })
        this.updateBindTableData()
      })
    },

    // 取消当前行
    __cancelRowItem(item) {
      this.cancelRowEdit(item.row)
      this.$emit('cancelRowItem', item)
    },

    // 新增数据
    addRowItem() {
      // 检查当前编辑列表是否能够进行新增
      if (this.getEditRowList().length && this.isOneEdit) {
        return this.$message.error('请先保存当前编辑的内容！')
      }

      const { tableItem } = this.$attrs
      const newRowData = {}
      tableItem.forEach((item) => {
        newRowData[item.prop] = item.value || ''
      })
      newRowData.$isRowEdit = true
      this.innerTableData.push(newRowData)
    },

    // 删除数据
    __removeRowItem(item) {
      this.removeIndexData(item.$index)
      this.$emit('removeRowItem', item)
    },
    // 保存当前正在编辑的数据(尝试保存, 会走校验, 返回一个Promise)
    // 获取当前正在编辑的数据, 返回一个list
    getEditRowList() {
      return this.innerTableData.filter((item) => item.$isRowEdit)
    },

    getTable() {
      return this.$refs.tableForm
    },

    getTableData() {
      const dataList = this._.cloneDeep(this.innerTableData)
      dataList.forEach((row) => {
        delete row.$isRowEdit
        delete row.$originalRowData
      })
      return dataList
    },

    // 事件透传
    triggerBtn({ event, scope }) {
      if (
        ![
          '__editRowItem',
          '__saveRowItem',
          '__cancelRowItem',
          '__removeRowItem'
        ].includes(event)
      ) {
        this.$emit(event, scope)
      }
    },

    updateBindTableData() {
      this.$emit('update:table-data', this.innerTableData)
    },

    parseOperate(list) {
      const operate = [];
      (list || []).forEach((listItem) => {
        switch (listItem) {
          case 'edit':
            operate.push(
              {
                event: '__editRowItem',
                label: '编辑',
                condition({ row }) {
                  return !row.$isRowEdit
                }
              },
              {
                event: '__saveRowItem',
                label: '保存',
                condition({ row }) {
                  return row.$isRowEdit
                }
              },
              {
                event: '__cancelRowItem',
                label: '取消',
                confirm: true,
                confirmMessage: '是否确认取消',
                condition({ row }) {
                  return row.$isRowEdit
                }
              },
            )
            break
          case 'remove':
            operate.push({
              event: '__removeRowItem',
              label: '删除',
              confirm: true,
              confirmMessage: '是否确认删除',
              customClass: 'danger',
              condition({ row }) {
                return !row.$isRowEdit
              }
            })
        }
      })

      return operate
    }
  }
}
</script>
<style lang="scss">
.table-form {
  .el-form-item {
    margin-bottom: 0;
  }
}
</style>
