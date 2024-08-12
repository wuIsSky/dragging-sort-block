import DragTargetArea from './DragTargetArea.vue'

DragTargetArea.install = (app) => {
  app.component(DragTargetArea.name, DragTargetArea)
  return app
}

export default DragTargetArea