import OutsideDragBlock from './OutsideDragBlock.vue'

OutsideDragBlock.install = (app) => {
  app.component(OutsideDragBlock.name, OutsideDragBlock)
  return app
}

export default OutsideDragBlock