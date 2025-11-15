import { ParameterStore } from 'scripts/workflows/lib/ParameterStore.js'
import {
  AWS,
  REQUIRED_DEVELOPMENT_PARAMETERS,
} from 'scripts/workflows/shared/constants.js'

export async function initialize(): Promise<{
  parameterStore: ParameterStore
}> {
  const parameterStore = await ParameterStore.create(
    AWS.PARAMETER_PATH.DEVELOPMENT,
    REQUIRED_DEVELOPMENT_PARAMETERS
  )

  return {
    parameterStore,
  }
}
