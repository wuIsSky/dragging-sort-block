<template>
  <div
    :class="['outside-drag-block', disabled ? 'disabled' : '']"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
  >
    <span>{{ text }}</span>
    <img :src="disabled ? require('../../assets/plus-gray.png') : require('../../assets/plus.png')" alt="">
  </div>
</template>

<script>
import Vue from 'vue'
import OutsideMovingBlock from '../OutsideMovingBlock.vue'
import PubSub from 'pubsub-js'

export default {
  name: 'OutsideDragBlock',
  props: {
    text: String,
    targetAreaName: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      required: true
    }
  },
  data() {
    const { targetAreaName } = this
    return {
      isMouseDown: false,
      mousedownPosition: [0, 0],
      movingPosition: [0, 0],
      vm: null,
      outsideBlockClickEventChannel: `outsideBlockClick_${targetAreaName}`,
      outsideBlockDragEndEventChannel: `outsideBlockDragEnd_${targetAreaName}`,
      outsideBlockDraggingEventChannel: `outsideBlockDragging_${targetAreaName}`
    }
  },
  methods: {
    handleMouseDown({ offsetX, offsetY }) {
      if (this.disabled) {
        return
      }
      this.isMouseDown = true
      this.$set(this, 'mousedownPosition', [offsetX, offsetY])
      document.removeEventListener('mouseup', this.handleMouseUp)
      document.removeEventListener('mousemove', this.handleDragging)
      document.addEventListener('mouseup', this.handleMouseUp)
      document.addEventListener('mousemove', this.handleDragging)
    },
    handleMouseUp(e) {
      // 如果鼠标还没按下
      if (!this.isMouseDown) {
        // 则结束该方法
        return
      }
      this.isMouseDown = false
      document.removeEventListener('mouseup', this.handleMouseUp)
      document.removeEventListener('mousemove', this.handleDragging)
      // 如果此时还没创建跟随鼠标移动的块
      if (!this.vm) {
        // 则认为此次触发的是 点击事件
        PubSub.publish(this.outsideBlockClickEventChannel, this.text)
      } else { // 否则就认为触发的是 拖拽结束事件
        this.vm.remove()
        this.vm = null
        PubSub.publish(this.outsideBlockDragEndEventChannel, {
          endPosition: [e.clientX, e.clientY],
          text: this.text
        })
      }
    },
    // 处理鼠标按下并开始移动
    handleDragging(e) {
      // 如果鼠标还没按下
      if (!this.isMouseDown) {
        // 则结束该方法
        return
      }
      // 如果还没创建可移动的块
      if (!this.vm) {
        // 并且如果当前拖拽的点和down的点之间的距离不超过 触发拖动的鼠标移动距离阈值
        if (
          Math.pow(e.offsetX - this.mousedownPosition[0], 2) + 
          Math.pow(e.offsetY - this.mousedownPosition[1], 2) < 100
        ) {
          // 则认为当前还没触发 块的拖动
          return
        }
        // 否则就认为已经触发了块的拖动, 创建一个 跟随鼠标移动的块
        this.createMovingBlock()
      }
      // 实时记录鼠标移动的位置
      this.$nextTick(() => {
        // 要想获取 this.vm.$el, 必须用 nextTick
        this.$set(this, 'movingPosition', [e.clientX - this.vm.$el.offsetWidth / 2, e.clientY - this.vm.$el.offsetHeight / 2])
        PubSub.publish(this.outsideBlockDraggingEventChannel, {
          // 鼠标的坐标
          mousePosition: [e.clientX, e.clientY],
          // vm 的宽高
          outsideMovingBlockSize: [this.vm.$el.offsetWidth, this.vm.$el.offsetHeight],
          // 左上角的坐标
          movingPosition: this.movingPosition,
          text: this.text
        })
      })
    },
    createMovingBlock() {
      if (this.vm) return
      this.vm = new Vue({
        // h是createElement函数，它可以返回虚拟dom
        render: (h) => {
          // 将Component作为根组件渲染出来
          // h(标签名称或组件配置对象，传递属性、事件等，孩子元素)
          return h(OutsideMovingBlock, {
            props: {
              text: this.text,
              // 用于实时修改 OutsideMovingBlock 的位置
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
.outside-drag-block {
  position: relative;
  width: 100px;
  height: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 3px;
  background-color: #fff;
  border: 1px solid #DCDFE6;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  padding: 0 12px;
  box-sizing: border-box;
  color: #4F4F4F;
  font-size: 14px;
  margin-bottom: 10px;
}

span {
  flex: 1;
  width: 0;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

img {
  width: 10px;
  height: 10px;
}

.outside-drag-block.disabled {
  opacity: 0.7;
  cursor: no-drop;
}

</style>
