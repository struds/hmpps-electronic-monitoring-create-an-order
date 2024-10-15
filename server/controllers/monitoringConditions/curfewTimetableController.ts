// Remove this eslint config once this controller is implemented
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, RequestHandler, Response } from 'express'
import { z } from 'zod'
import paths from '../../constants/paths'
import { CurfewTimetable } from '../../models/CurfewTimetable'
import { ValidationResult } from '../../models/Validation'
import { MultipleChoiceField, TimeField } from '../../models/view-models/utils'
import { AuditService, CurfewTimetableService } from '../../services'
import { deserialiseTime } from '../../utils/utils'

const curfewTimetableFormDataModel = z.object({
  action: z.string().default('continue'),
})

type CurfewTimetableFormData = z.infer<typeof curfewTimetableFormDataModel>

type Timetable = {
  startTime: TimeField
  endTime: TimeField
  location: MultipleChoiceField
}

type CurfewTimetableViewModel = {
  monday: Timetable[]
  tuesday: Timetable[]
  wednesday: Timetable[]
  thursday: Timetable[]
  friday: Timetable[]
  saturday: Timetable[]
  sunday: Timetable[]
}

export default class CurfewTimetableController {
  constructor(
    private readonly auditService: AuditService,
    private readonly curfewTimetableService: CurfewTimetableService,
  ) {}

  private constructViewModel(
    curfewTimetable: CurfewTimetable[] | undefined,
    validationErrors: ValidationResult,
    formData: [CurfewTimetableFormData],
  ): CurfewTimetableViewModel {
    if (validationErrors.length > 0 && formData.length > 0) {
      return this.createViewModelFromFormData(formData[0], validationErrors)
    }

    return this.createViewModelFromCurfewTimetable(curfewTimetable)
  }

  private createViewModelFromCurfewTimetable(curfewTimetable?: CurfewTimetable[]): CurfewTimetableViewModel {
    const getTimetablesForDay = (day: string, timetables?: CurfewTimetable[]): Timetable[] =>
      timetables
        ?.filter(t => t.day === day)
        .map(t => {
          const [startTimeHours, startTimeMinutes] = deserialiseTime(t.startTime)
          const [endTimeHours, endTimeMinutes] = deserialiseTime(t.endTime)
          return {
            startTime: { value: { hours: startTimeHours, minutes: startTimeMinutes } },
            endTime: { value: { hours: endTimeHours, minutes: endTimeMinutes } },
            location: { values: t.locations },
          }
        }) ?? []

    return {
      monday: getTimetablesForDay('monday', curfewTimetable),
      tuesday: getTimetablesForDay('tuesday', curfewTimetable),
      wednesday: getTimetablesForDay('wednesday', curfewTimetable),
      thursday: getTimetablesForDay('thursday', curfewTimetable),
      friday: getTimetablesForDay('friday', curfewTimetable),
      saturday: getTimetablesForDay('saturday', curfewTimetable),
      sunday: getTimetablesForDay('sunday', curfewTimetable),
    }
  }

  private createViewModelFromFormData(
    formData: CurfewTimetableFormData,
    validationErrors: ValidationResult,
  ): CurfewTimetableViewModel {
    return {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    }
  }

  view: RequestHandler = async (req: Request, res: Response) => {
    const { orderId } = req.params
    const { monitoringConditionsCurfewTimetable: timetable } = req.order!
    const errors = req.flash('validationErrors')
    const formData = req.flash('formData')
    const viewModel = this.constructViewModel(timetable, errors as never, formData as never, orderId)

    res.render(`pages/order/monitoring-conditions/curfew/timetable`, viewModel)
  }

  update: RequestHandler = async (req: Request, res: Response) => {
    const { orderId } = req.params
    const formData = curfewTimetableFormDataModel.parse(req.body)
    console.log(formData)

    res.redirect(paths.ORDER.SUMMARY.replace(':orderId', orderId))
  }
}
