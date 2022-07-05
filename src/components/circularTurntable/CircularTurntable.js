export default class DrawCircularTurntable {
  /**
   * @param element 元素
   * @param option  配置项
   *    option.width:       转盘宽, 不填自动使用传入元素的宽
   *    option.height:      转盘高, 不填自动使用传入元素的高
   *    option.className:   为渲染转盘的Canvas设置一个样式
   *    option.lineColor:   渲染的线颜色, 默认#ccc
   *    option.lineWidth:   渲染的线宽度, 默认1
   *    option.backColor:   默认的背景颜色, 默认#66635c
   *    option.activeBackColor:   选中的背景颜色, 默认#fff7e7
   *    option.contentList: 转盘的内容, 也可以通过后续使用 drawTurnTable 函数进行渲染
   *        option.contentList.span:          占位大小, 默认为1, 值越大, 所占用的区域越大
   *        option.contentList.title:         名称
   *        option.contentList.dataUrl:       图片地址
   *        option.contentList.color:         默认背景色, 不填写则使用option.backColor
   *        option.contentList.activeColor:   选中背景色, 不填写则使用option.activeBackColor
   * 
   *    option.rotateCallback(angle, data, index):   每次旋转的回调函数, 包含指针角度信息, 商品信息, 商品下标
   *                                                 也可以后续使用 onRotateCallback 函数进行注册 TODO: 未开发
   * 
   * */
  constructor(element, option = {}) {
    // 初始化一些参数
    this.element = element
    this.lineColor = option?.lineColor || '#ccc'
    this.lineWidth = option?.lineWidth || 1
    this.backColor = option?.backColor || '#66635c'
    this.activeBackColor = option?.activeBackColor || '#fff7e7'
    this.contentList = option?.contentList || []

    // 当前选中的商品
    this.activeId = ''

    // 初始化元素
    this.resize(option)

    // 初始化轮盘
    if (this.contentList.length) {
      this.drawTurnTable(this.contentList)
    }
  }

  // 页面发生变化可调用该函数
  resize(option) {
    this.canvasWidth = option?.width || this.element.offsetWidth
    this.canvasHeight = option?.height || this.element.offsetHeight
    this.centerPointX = this.canvasWidth / 2
    this.centerPointY = this.canvasHeight / 2
    
    const canvasElement = this.canvasElement || document.createElement('canvas')  
    canvasElement.width = this.canvasWidth
    canvasElement.height = this.canvasHeight
    canvasElement.className = option?.className
    
    this.canvas2d = canvasElement.getContext('2d')
    this.canvas2d.lineColor = this.lineColor
    this.canvas2d.lineWidth = this.lineWidth

    this.canvasElement || this.element.appendChild(canvasElement)
    this.canvasElement = canvasElement
  }
  
  // 选中某个面板. * 如果contentList中没有设置ID, 则自动锁定对应的index
  active(id) {
    this.drawTurnTable(null, id)
  }

  // 转盘选中下一个商品
  nextActive() {
    const { contentList, activeId } = this
    const index = contentList.findIndex(item => item.id === activeId)
    if (index === -1) {
      // 如果没有找到指定的ID, 则默认为INDEX下标作为转盘ID
      this.drawTurnTable(null, (activeId || 0) + 1)
    } else {
      let nextId;
      if (contentList[index + 1]) {
        nextId = contentList[index + 1].id
      } else {
        nextId = contentList[0].id
      }
      this.drawTurnTable(null, nextId)
    }
  }

  // 这里渲染轮盘,
  drawTurnTable(list, active) {
    this.activeId = active
    const contentList = list || this.contentList
    // 先计算出总span数, 后面方便计算占位
    let spanSum = 0
    let curSpan = 0
    contentList.forEach((item) => spanSum += (item.span || 1))
    spanSum = spanSum

    const { canvasElement, canvas2d, centerPointX, centerPointY, backColor, activeBackColor } = this
    
    // 渲染轮盘
    contentList.forEach((item, index) => {
      const { id, title, dataUrl, color, activeColor, span = 1 } = item
      const startAngle = ((360 / spanSum) * curSpan) * Math.PI / 180
      const endAngle = ((360 / spanSum) * (curSpan + span)) * Math.PI / 180
      canvas2d.beginPath()
      canvas2d.fillStyle = color || backColor
      if ((id && active === id) || (!id && active === index)) {
        canvas2d.fillStyle = activeColor || activeBackColor
      }
      canvas2d.moveTo(centerPointX, centerPointY)
      canvas2d.arc(centerPointX, centerPointY, centerPointY, startAngle, endAngle)
      canvas2d.fill()

      // 渲染图片
      // canvas2d.
      curSpan += span
    })
  }

  // 开始转盘
  handle(id) {
    
  }
}

