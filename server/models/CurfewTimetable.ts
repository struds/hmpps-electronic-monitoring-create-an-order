import { z } from 'zod'

export const CurfewTimetableModel = z.object({
  day: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  locations: z.array(z.string()),
})

export type CurfewTimetable = z.infer<typeof CurfewTimetableModel>

export default CurfewTimetableModel
