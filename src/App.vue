<template>
  <div id="app">
    <div>
      <outside-drag-block
        v-for="item in outsideDragBlockList"
        :key="item"
        :text="item"
        :disabled="isOutsideDragBlockDisabled(item)"
        :target-area-name="areaName"
      />
    </div>
    <drag-target-area
      :init-area-height="32"
      :area-block-list.sync="areaBlockList"
      :area-name="areaName"
    />
  </div>
</template>

<script>

export default {
  name: 'App',
  data () {
    return {
      areaName: 'target',
      outsideDragBlockList: [
        'Vue',
        'React',
        'Angular'
      ],
      areaBlockList: [
        {
          text: 'C++',
          sort: 0,
          isSorting: false
        },
        {
          text: 'Python',
          sort: 2,
          isSorting: false
        },
        {
          text: 'Java',
          sort: 1,
          isSorting: false
        },
        {
          text: 'GoLang',
          sort: 4,
          isSorting: false
        },
        {
          text: 'C#',
          sort: 3,
          isSorting: false
        }
      ],
    }
  },
  methods: {
    isOutsideDragBlockDisabled(text) {
      return this.areaBlockList.some(item => item.text === text)
    }
  }
}
</script>

<style>
body {
  padding: 0;
  margin: 0;
  overflow: hidden;
}
#app {
  display: flex;
  width: 100vw;
  padding: 100px 20px 0;
  box-sizing: border-box;
}
</style>
