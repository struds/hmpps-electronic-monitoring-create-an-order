import { z } from 'zod'

const CurfewConditionsModel = z.object({})

export type CurfewConditions = z.infer<typeof CurfewConditionsModel>

export default CurfewConditionsModel
