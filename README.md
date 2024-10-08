# dragging-sort-block
Vue2 组件，支持拖拽排序

## 本地运行
`npm install`

`npm run serve`

## 组件安装
`npm install @orange_cat/dragging-sort-block`

## 组件使用
```html
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
```

```js
export default {
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
```