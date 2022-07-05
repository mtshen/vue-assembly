<template>
  <el-pagination
    background
    :current-page="curPageData.currentPage"
    :page-sizes="pageSizes"
    :page-size="curPageData.pageSize"
    :layout="layout"
    :total="curPageData.recordCount"
    @size-change="_handleSizeChange"
    @current-change="_handleCurrentChange"
  />
</template>
<script>

/**
 * 表格的分页组件
 * 支持双向绑定
 *
 * 参数(支持elementUI 中el-pagination的参数)
 * @param currentPage { number } 当前页数, 默认为1
 * @param pageSize { number } 每页展示数据行数, 默认为10
 * @param recordCount { number } 数据总数, 默认为0
 *
 * @param pageSizes { Array<number> } 可选每页展示的条目数
 * @param layout { string } 组件布局，子组件名用逗号分隔
 */
export default {
  name: 'TablePagination',
  props: {
    pageData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      curPageData: {}
    }
  },
  computed: {
    pageSizes() {
      return this.pageData.pageSizes || [10, 20, 30, 40, 50, 100]
    },
    layout() {
      return this.pageData.layout || 'total, sizes, prev, pager, next, jumper'
    }
  },

  watch: {
    pageData: {
      handler() {
        this.curPageData = this.pageData
      },
      deep: true,
      immediate: true
    }
  },

  created() {
  },
  methods: {
    _handleSizeChange(pageSize) {
      const data = {
        ...this.curPageData,
        currentPage: 1,
        pageSize
      }

      this.changeData(data)
    },

    _handleCurrentChange(currentPage) {
      const data = {
        ...this.curPageData,
        currentPage
      }

      this.changeData(data)
    },

    changeData(data) {
      this.curPageData = data
      this.$emit('update:page-data', data)
      this.$emit('update:pageData', data)
      this.$emit('change', data)
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
