import globalSetup from './globalSetup.js'

export default async function setup() {
  await globalSetup()

  return async () => {}
}
