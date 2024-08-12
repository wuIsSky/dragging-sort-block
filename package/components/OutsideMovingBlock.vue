<template>
  <div
    class="outside-moving-block"
    :style="{ left: `${movingPosition[0]}px`, top: `${movingPosition[1]}px` }"
  >
    <span>{{ text }}</span>
    <img :src="require('../assets/remove.png')" alt="">
  </div>
</template>

<script>

export default {
  name: 'OutsideMovingBlock',
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
.outside-moving-block {
  position: absolute;
  z-index: 9999;
  opacity: 0.7;
  min-width: 100px;
  height: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 3px;
  background-color: #fff;
  
  border: 1px solid #DCDFE6;
  cursor: all-scroll;
  user-select: none;
  -webkit-user-select: none;
  padding: 0 12px;
  box-sizing: border-box;
  color: #333333;
  font-size: 14px;
}

img {
  width: 10px;
  height: 10px;
}
</style>
