// 用来导出所有的组件
import DragTargetArea from './components/DragTargetArea/index'
import OutsideDragBlock from './components/OutsideDragBlock/index'

const components = [
  DragTargetArea,
  OutsideDragBlock
]

const install = (Vue) => {
  components.forEach(component => {
    Vue.component(component.name, component)
  })
  return Vue
}

export default {
  install
}
