<template>
  <div
    :class="['inside-drag-block', blockInfo.isSorting ? 'is-sorting' : '']"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
  >
    <span>{{ blockInfo.text }}</span>
    <img
      ref="closeRef"
      :src="require('../assets/remove.png')"
      @click.stop.prevent="handleClickRemove"
      alt=""
    >
  </div>
</template>

<script>

export default {
  name: 'InsideDragBlock',
  props: {
    blockInfo: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      isMouseDown: false,
      mousedownPosition: [0, 0]
    }
  },
  mounted() {
  },
  methods: {
    handleMouseDown(e) {
      // 如果点击的是 关闭图标
      if (e.target === this.$refs.closeRef) {
        // 则跳过该方法，让事件捕获到 关闭图标dom 的 click 事件上
        return
      }
      this.isMouseDown = true
      this.$set(this, 'mousedownPosition', [e.offsetX, e.offsetY])
      document.removeEventListener('mouseup', this.handleMouseUp)
      document.removeEventListener('mousemove', this.handleDragging)
      document.addEventListener('mouseup', this.handleMouseUp)
      document.addEventListener('mousemove', this.handleDragging)
      // 内部块 mousedown 时，立即触发拖动
      this.handleDragging(e)
    },
    handleMouseUp(e) {
      if (!this.isMouseDown) {
        return
      }
      this.isMouseDown = false
      document.removeEventListener('mouseup', this.handleMouseUp)
      document.removeEventListener('mousemove', this.handleDragging)
      // 如果鼠标移动了
      if (
          e.offsetX !== this.mousedownPosition[0] ||
          e.offsetY !== this.mousedownPosition[1]
      ) {
        this.$emit('dragEnd', [e.clientX, e.clientY])
      }
    },
    handleDragging(e) {
      if (!this.isMouseDown) {
        return
      }
      this.$emit('dragging', {
        mousePosition: [e.clientX, e.clientY],
        movingPosition: [e.clientX - this.$el.offsetWidth / 2, e.clientY - this.$el.offsetHeight / 2]
      })
    },
    // 点击删除按钮
    handleClickRemove() {
      this.$emit('remove')
    }
  }
}
</script>

<style scoped>
.inside-drag-block {
  position: absolute;
  min-width: 100px;
  height: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  box-sizing: border-box;
  border-radius: 3px;
  background-color: #EFF7FF;
  border: 1px solid rgba(52,145,250,0.3);
  cursor: all-scroll;
  transition-property: top, left, transform;
  transition-duration: 0.3s;
  user-select: none;
  -webkit-user-select: none;
  font-size: 14px;
  color: #333333;
}

.inside-drag-block.is-sorting {
  background-color: #0D57BC;
  color: #fff;
}

img {
  width: 10px;
  height: 10px;
  margin-left: 10px;
  cursor: pointer;
}
</style>
