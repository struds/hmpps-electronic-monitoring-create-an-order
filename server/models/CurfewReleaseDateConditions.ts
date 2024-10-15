import { z } from 'zod'

const CurfewReleaseDateConditionsModel = z.object({})

export type CurfewReleaseDateConditions = z.infer<typeof CurfewReleaseDateConditionsModel>

export default CurfewReleaseDateConditionsModel
