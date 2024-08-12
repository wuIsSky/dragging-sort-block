<template>
  <div
    class="tip-block"
    :style="{ left: `${translate[0]}px`, top: `${translate[1]}px` }"
  >
    <img src="../assets/file-add.png" alt="">
    <span>可拖入左侧字段</span>
  </div>
</template>

<script>

export default {
  name: 'TipBlock',
  props: {
    translate: {
      type: Array,
      required: true
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.tip-block {
  position: absolute;
  z-index: 9999;
  min-width: 100px;
  height: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition-property: top, left, transform;
  transition-duration: 0.3s;
  border-radius: 3px;
  background-color: #F8F8F8;
  border: 1px solid #DCDFE6;
  user-select: none;
  -webkit-user-select: none;
  padding: 0 12px;
  box-sizing: border-box;
  font-size: 14px;
  color: #757575;
  white-space: nowrap;
}

img {
  width: 16px;
  height: 16px;
  margin-right: 8px;
}
</style>
