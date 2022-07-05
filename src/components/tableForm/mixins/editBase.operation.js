/**
 * 这里输出了editBase的相关方法
 */
export default {
  methods: {
    // ======== 设置指定行数据打开编辑 ================
    setRowEditStatus(row) {
      const { $isRowEdit, ...rowData } = row
      if (!$isRowEdit) {
        row.$isRowEdit = true
        row.$originalRowData = this._.cloneDeep(rowData)
        this.innerTableData = this.getTable().updateTabel()
      }
    },

    setIndexEditStatus(index) {
      const indexData = this.innerTableData[index]
      if (indexData) {
        this.setRowEditStatus(indexData)
      } else {
        console.error('setIndexEditStatus() 没有找到指定的index内容 >> ', index)
      }
    },

    setKeyEditStatus(key) {
      const keyName = this.$attrs.key
      const findData = this.innerTableData.find((row) => row[keyName] === key)

      if (findData) {
        this.setRowEditStatus(findData)
      } else {
        console.error('setRowEditStatus() 没有找到指定的key内容 >> ', key)
      }
    },
    // ======== 设置指定行数据关闭编辑 ================
    // 关闭编辑与取消编辑的区别是 关闭编辑会立即触发保存操作, 并且无论是否能够保存 都会保存成功
    setRowEditStatusOff(row) {
      delete row.$isRowEdit
      delete row.$originalRowData
      this.innerTableData = this.getTable().updateTabel()
    },

    setIndexEditStatusOff(index) {
      const indexData = this.innerTableData[index]
      if (indexData) {
        this.setRowEditStatusOff(indexData)
      } else {
        console.error('setIndexEditStatusOff() 没有找到指定的index内容 >> ', index)
      }
    },

    setKeyEditStatusOff(key) {
      const keyName = this.$attrs.key
      const findData = this.innerTableData.find((row) => row[keyName] === key)

      if (findData) {
        this.setRowEditStatusOff(findData)
      } else {
        console.error('setRowEditStatusOff() 没有找到指定的key内容 >> ', key)
      }
    },

    // ======== 设置指定行数据取消编辑 ================
    cancelRowEdit(row) {
      const { $originalRowData } = row
      if ($originalRowData) {
        Object.keys($originalRowData).forEach((keyName) => {
          row[keyName] = $originalRowData[keyName]
        })
      } else {
        this.removeRowData(row)
      }
      this.setRowEditStatusOff(row)
    },

    cancelIndexEdit(index) {
      const indexData = this.innerTableData[index]
      if (indexData) {
        this.cancelRowEdit(indexData)
      } else {
        console.error('cancelIndexEdit() 没有找到指定的index内容 >> ', index)
      }
    },

    cancelKeyEdit(key) {
      const keyName = this.$attrs.key
      const findData = this.innerTableData.find((row) => row[keyName] === key)

      if (findData) {
        this.cancelRowEdit(findData)
      } else {
        console.error('cancelKeyEdit() 没有找到指定的key内容 >> ', key)
      }
    },
    // ======== 设置指定行数据保存编辑 ================
    // 这里的保存会触发保存校验, 并返回一个Promise
    saveRowEdit() {

    },

    // ======== 校验指定行数据 ================
    validateIndexRow(index) {
      return this.getTable().validateIndexRow(index)
    },
    validateRowRow(row) {
      const index = this.innerTableData.findIndex((item) => item === row)
      this.validateIndexRow(index)
    },
    validateKeyRow(key) {
      const keyName = this.$attrs.key
      const index = this.innerTableData.findIndex((row) => row[keyName] === key)

      if (index > -1) {
        this.validateIndexRow(index)
      } else {
        console.error('validateKeyRow() 没有找到指定的key内容 >> ', key)
      }
    },

    // ======== 删除指定行数据 ================
    removeRowData(row) {
      const index = this.innerTableData.findIndex((item) => item === row)
      this.removeIndexData(index)
    },

    removeIndexData(index) {
      this.innerTableData.splice(index, 1)
      this.updateBindTableData()
    },

    removeKeyData(key) {
      const keyName = this.$attrs.key
      const index = this.innerTableData.findIndex((row) => row[keyName] === key)

      if (index > -1) {
        this.cancelRowEdit(index)
      } else {
        console.error('removeKeyData() 没有找到指定的key内容 >> ', key)
      }
    }
  }
}
