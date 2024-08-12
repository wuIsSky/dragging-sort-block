<template>
  <div
    class="drag-target-area"
    :style="{ height: `${areaHeight}px` }"
  >
    <inside-drag-block
      v-for="(item) in areaBlockList"
      :key="item.text"
      :ref="item.text"
      :block-info="item"
      @dragging="handleInsideBlockDragging(item, $event)"
      @dragEnd="handleInsideBlockDragEnd($event, item)"
      @remove="handleRemoveInsideBlock(item)"
    />
    <tip-block ref="tipBlockRef" :translate="tipBlockTranslate" />
  </div>
</template>

<script>
import Vue from 'vue'
import InsideDragBlock from '../InsideDragBlock.vue';
import InsideMovingBlock from '../InsideMovingBlock.vue'
import TipBlock from '../TipBlock.vue'
import ResizeListener from 'element-resize-detector'
import { throttle } from 'throttle-debounce'
import PubSub from 'pubsub-js'

export default {
  name: 'DragTargetArea',
  components: {
    InsideDragBlock,
    TipBlock
  },
  props: {
    areaName: {
      type: String,
      required: true
    },
    areaBlockList: {
      type: Array,
      required: true
    },
    // 初始的区域高度
    initAreaHeight: {
      type: Number,
      required: true
    }
    
  },
  data() {
    const { areaName, initAreaHeight } = this
    return {
      tipBlockTranslate: [0, 0],
      // 本组件在页面中的绝对位置
      domPosition: [0, 0],
      vm: null,
      movingPosition: [0, 0],
      resizeListener: null,
      areaHeight: initAreaHeight,
      // areaBlockList 以 map 的形式保存的值
      areaBlockMap: {},
      outsideBlockClickEventChannel: `outsideBlockClick_${areaName}`,
      outsideBlockDragEndEventChannel: `outsideBlockDragEnd_${areaName}`,
      outsideBlockDraggingEventChannel: `outsideBlockDragging_${areaName}`
    }
  },
  watch: {
    areaBlockList: {
      deep: true,
      handler() {
        this.$nextTick(this.handleAreaResize)
      }
    }
  },
  mounted() {
    /* 以下代码仅为自测使用
    setTimeout(() => {
      this.changeBlockSort(this.areaBlockList[2], 3)
      setTimeout(() => {
        this.changeBlockSort(this.areaBlockList[2], 0)
        setTimeout(() => {
          this.changeBlockSort(this.areaBlockList[2], 2)
          setTimeout(() => {
            this.changeBlockSort(this.areaBlockList[2], 4)
          }, 1000);
        }, 1000);
      }, 1000);
    }, 1000);*/
    // 监听外部块的拖拽事件
    PubSub.subscribe(this.outsideBlockDraggingEventChannel, (_msg, { mousePosition, outsideMovingBlockSize, movingPosition, text }) => {
      const [blockClientX, blockClientY] = movingPosition
      const [blockWidth, blockHeight] = outsideMovingBlockSize
      // 如果内部块中已经有该外部块，且已经排好序了
      // 如果外部块和当前组件碰撞了
      if (
          blockClientX + blockWidth >= this.domPosition[0] &&
          blockClientY + blockHeight >= this.domPosition[1] &&
          this.domPosition[0] + this.$el.offsetWidth >= blockClientX &&
          this.domPosition[1] + this.$el.offsetHeight >= blockClientY
        ) {
        // 如果内部块中还没有该外部块
        if (this.areaBlockList.every(item => item.text !== text)) {
          // 则将该外部块以最后一个的排序，加入内部块，且状态为排序中
          this.$emit('update:areaBlockList', [
            ...this.areaBlockList,
            {
              text,
              sort: this.areaBlockList.length,
              isSorting: true
            }
          ])
        }
        this.$nextTick(() => {
          // 找到正在排序的内部块
          const sortingInsideBlock = this.areaBlockList.find(item => item.isSorting)
          if (!sortingInsideBlock) {
            return
          }
          this.areaBlockList.find(item => {
            // 不对与当前块相同的内部块进行碰撞检测
            if (item.text === text) {
              return false
            }
            const { translate, blockDom } = this.areaBlockMap[item.sort]
            // 如果鼠标和某个内部块碰撞
            if(
              !item.isSorting &&
              mousePosition[0] <= this.domPosition[0] + translate[0] + blockDom.offsetWidth &&
              mousePosition[0] >= this.domPosition[0] + translate[0] &&
              mousePosition[1] <= this.domPosition[1] + translate[1] + blockDom.offsetHeight &&
              mousePosition[1] >= this.domPosition[1] + translate[1]
            ) {
              // 调整当前被拖动的内部块的排序
              this.changeBlockSort(sortingInsideBlock, item.sort)
              return true
            }
          })
        })
      } else {  // 否则如果外部块没和当前组件碰撞
        // 找该外部块对应的正在排序中的块
        const sortingInsideBlock = this.areaBlockList.find(item => item.isSorting && item.text === text)
        // 如果没找到
        if (!sortingInsideBlock) {
          // 结束方法
          return
        }
        // 删除该外部块对应的正在排序中的块
        const copyBlockList = this.areaBlockList.map(item => {
          return { ...item }
        })
        const newBlockList = copyBlockList.filter(item => {
          // 如果该块的排序在被删除的块的后面
          if (item.sort > sortingInsideBlock.sort) {
            // 则将该块的排序向前 1 位
            item.sort--
          }
          if (item.text !== text) {
            return true
          }
          return item.text !== text || !item.isSorting
        })
        this.$emit('update:areaBlockList', newBlockList)
      }
    })
    // 监听外部块的拖拽结束事件
    PubSub.subscribe(this.outsideBlockDragEndEventChannel, (_msg, { text }) => {
      const dragEndBlock = this.areaBlockList.find(item => item.text === text)
      if (dragEndBlock) {
        this.$set(dragEndBlock, 'isSorting', false)
      }
    })
    // 监听外部块的点击事件
    PubSub.subscribe(this.outsideBlockClickEventChannel, (_msg, text) => {
      // 如果当前区域中已经有该块了
      if (this.areaBlockList.some(item => item.text === text)) {
        return
      }
      // 否则追加一个内部块
      this.$emit('update:areaBlockList', [
        ...this.areaBlockList,
        {
          text,
          sort: this.areaBlockList.length,
          isSorting: false
        }
      ])
    })
    // 监听当前组件的尺寸变化
    this.resizeListener = ResizeListener({
      strategy: 'scroll',
      callOnAdd: true
    })
    // 加上节流，防止频繁调用
    // 每 0.05s 内最多只能触发一次自适应方法
    const resizeHandler = throttle(50, () => {
      this.handleAreaResize()
    })
    this.resizeListener.listenTo(this.$el, resizeHandler)
    const { x, y } = this.$el.getBoundingClientRect()
    this.$set(this, 'domPosition', [x, y])
  },
  beforeDestroy() {
    PubSub.unsubscribe(this.outsideBlockDraggingEventChannel)
    PubSub.unsubscribe(this.outsideBlockDragEndEventChannel)
    PubSub.unsubscribe(this.outsideBlockClickEventChannel)
    this.resizeListener.removeAllListeners(this.$el)
  },
  methods: {
    updateBlockMap() {
      const newBlockMap = {}
      this.areaBlockList.forEach((item) => {
        newBlockMap[item.sort] = {
          block: item,
          blockDom: this.$refs[item.text][0].$el,
          translate: undefined
        }
      })
      this.$set(this, 'areaBlockMap', newBlockMap)
    },
    changeBlockSort(block, newSort) {
      if(!block || newSort == null) {
        return
      }
      // 获取该块当前的排序号
      const oldSort = block.sort
      // 如果排序号没变, 则结束方法
      if (oldSort === newSort) {
        return
      }
      // 如果要将该块向前移动
      if(newSort < oldSort) {
        // 所有小于该排序号, 且大于等于新序号的块的排序都要加一
        const newBlockList = this.areaBlockList.map(item => {
          const { sort, text, isSorting } = item
          if (sort < oldSort && sort >= newSort) {
            return {
              text: text,
              sort: sort + 1,
              isSorting
            }
          } else if(sort === oldSort) {
            return {
              text: text,
              sort: newSort,
              isSorting
            }
          } else {
            return item
          }
        })
        this.$emit('update:areaBlockList', newBlockList)
      } else { // 如果要将该块向后移动
        // 所有大于该排序号, 且小于等于新序号的块的排序都要减一
        const newBlockList = this.areaBlockList.map(item => {
          const { sort, text, isSorting } = item
          if (sort > oldSort && sort <= newSort) {
            return {
              text: text,
              sort: sort - 1,
              isSorting
            }
          } else if(sort === oldSort) {
            return {
              text: text,
              sort: newSort,
              isSorting
            }
          } else {
            return item
          }
        })
        this.$emit('update:areaBlockList', newBlockList)
      }
    },
    // 处理内部块的拖动
    handleInsideBlockDragging(block, { mousePosition, movingPosition }) {
      // 如果还没创建可移动的块
      if (!this.vm) {
        // 创建一个跟随鼠标拖动的内部块
        this.createInsideMovingBlock(block)
        this.$set(block, 'isSorting', true)
      }
      this.$set(this, 'movingPosition', movingPosition)
      // 找要被 交换排序值 的内部块
      this.areaBlockList.find(item => {
        const { translate, blockDom } = this.areaBlockMap[item.sort]
        // 鼠标是否和某个已完成排序排序，且非该被拖动的内部块的其他内部块碰撞
        if(
          !item.isSorting &&
          item.text !== block.text &&
          mousePosition[0] <= this.domPosition[0] + translate[0] + blockDom.offsetWidth &&
          mousePosition[0] >= this.domPosition[0] + translate[0] &&
          mousePosition[1] <= this.domPosition[1] + translate[1] + blockDom.offsetHeight &&
          mousePosition[1] >= this.domPosition[1] + translate[1]
        ) {
          // 调整当前被拖动的内部块的排序
          this.changeBlockSort(block, item.sort)
          return true
        }
      })
    },
    // 处理内部块结束拖动
    handleInsideBlockDragEnd(dragEndPosition, block) {
      // 如果创建了可移动的块
      if (this.vm) {
        this.vm.remove()
        this.vm = null
        this.$set(block, 'isSorting', false)
      }
    },
    // 处理内部块的删除事件
    handleRemoveInsideBlock(block) {
      const copyBlockList = this.areaBlockList.map(item => {
        return { ...item }
      })
      const newBlockList = copyBlockList.filter(item => {
        // 如果该块的排序在被删除的块的后面
        if (item.sort > block.sort) {
          // 则将该块的排序向前 1 位
          item.sort--
        }
        return item.text != block.text
      })
      this.$emit('update:areaBlockList', newBlockList)
    },
    // 处理当前组件的尺寸或者块列表发生变化后的自适应
    handleAreaResize() {
      this.updateBlockMap()
      const { areaBlockMap } = this
      // 获取容器的宽度
      const areaWidth = this.$el.offsetWidth
      // 按照排序，计算每个 areaBlock 的位置
      for (let i = 0; i < this.areaBlockList.length; i++) {
        const { blockDom } = areaBlockMap[i];
        // 如果是第一个元素
        if (i === 0) {
          areaBlockMap[i].translate = [0, 0]
        } else {  // 否则如果不是第一个元素
          // 获取上一个元素 dom 和 位置
          const { blockDom: previousBlockDom, translate: previousBlockDomTranslate } = areaBlockMap[i - 1];
          const curBlockNewTranslate = [
            previousBlockDomTranslate[0] + previousBlockDom.offsetWidth + 10,
            previousBlockDomTranslate[1]
          ]
          // 如果计算出的本元素X轴的位置加上本元素的宽度，超过了容器的宽度
          if (curBlockNewTranslate[0] + blockDom.offsetWidth > areaWidth) {
            curBlockNewTranslate[0] = 0
            curBlockNewTranslate[1] = previousBlockDomTranslate[1] + blockDom.offsetHeight + 10
          }
          areaBlockMap[i].translate = curBlockNewTranslate
        }
        const [translateX, translateY] = areaBlockMap[i].translate
        blockDom.setAttribute('style', `transform: translate(${translateX}px, ${translateY}px)`)
      }
      // 如果只有一个内部块
      if (this.areaBlockList.length === 0) {
        // 提示块位置在最开始
        this.$set(this, 'tipBlockTranslate', [0, 0])
        // 区域使用初始高度
        this.areaHeight = this.initAreaHeight
        return
      }
      // 获取最后一个内部块
      const lastBlock = areaBlockMap[this.areaBlockList.length - 1]
      // 计算最后一个提示块的位置
      // 如果提示块X轴位置加上提示块的宽度 超过了容器的宽度
      if (lastBlock.translate[0] + lastBlock.blockDom.offsetWidth + 10 + this.$refs.tipBlockRef.$el.offsetWidth > areaWidth) {
        // 则提示块的位置在下一行最开始
        this.$set(this, 'tipBlockTranslate', [0, lastBlock.translate[1] + lastBlock.blockDom.offsetHeight + 10])
      } else {  // 否则提示块的位置在最后一个元素的右边
        this.$set(this, 'tipBlockTranslate', [
          lastBlock.translate[0] + lastBlock.blockDom.offsetWidth + 10,
          lastBlock.translate[1]
        ])
      }
      // 计算当前可拖拽区域的高度
      this.areaHeight = this.tipBlockTranslate[1] + this.$refs.tipBlockRef.$el.offsetHeight
    },
    // 创建一个跟随鼠标拖动的内部块
    createInsideMovingBlock(block) {
      if (this.vm) return
      this.vm = new Vue({
        // h是createElement函数，它可以返回虚拟dom
        render: (h) => {
          // 将Component作为根组件渲染出来
          // h(标签名称或组件配置对象，传递属性、事件等，孩子元素)
          return h(InsideMovingBlock, {
            props: {
              text: block.text,
              // 用于实时修改 InsideMovingBlock 的位置
              movingPosition: this.movingPosition
            }
          })
        }
      }).$mount() // 挂载是为了把虚拟dom变成真实dom
      this.vm.remove = () => {
        document.body.removeChild(this.vm.$el)
        this.vm.$destroy()
      }
      document.body.appendChild(this.vm.$el)
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.drag-target-area {
  position: relative;
  overflow: hidden;
  transition: height .3s;
  
  margin-left: 50px;
  flex: 1;
}
</style>
