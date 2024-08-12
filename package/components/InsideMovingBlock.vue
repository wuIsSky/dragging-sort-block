<template>
  <div
    class="inside-moving-block"
    :style="{ left: `${movingPosition[0]}px`, top: `${movingPosition[1]}px` }"
  >
    <span>{{ text }}</span>
    <img
      :src="require('../assets/remove.png')"
      alt=""
    >
  </div>
</template>

<script>

export default {
  name: 'InsideMovingBlock',
  props: {
    text: {
      type: String,
      required: true
    },
    movingPosition: {
      type: Array,
      required: true
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.inside-moving-block {
  position: absolute;
  z-index: 9999;
  min-width: 100px;
  height: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 3px;
  white-space: nowrap;
  background-color: #EFF7FF;
  border: 1px solid rgba(52,145,250,0.3);
  cursor: all-scroll;
  user-select: none;
  -webkit-user-select: none;
  padding: 0 12px;
  box-sizing: border-box;
  font-size: 14px;
  color: #333333;
}

img {
  width: 10px;
  height: 10px;
  margin-left: 10px;
  cursor: pointer;
}
</style>
