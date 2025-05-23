import { Request, RequestHandler, Response } from 'express'
import { z } from 'zod'
import { AuditService } from '../../services'
import createViewModel from '../../models/view-models/deviceWearerCheckAnswers'
import TaskListService from '../../services/taskListService'
import paths from '../../constants/paths'

const CheckYourAnswersFormModel = z.object({
  action: z.string().default('continue'),
})

export default class DeviceWearerCheckAnswersController {
  constructor(
    private readonly auditService: AuditService,
    private readonly taskListService: TaskListService,
  ) {}

  view: RequestHandler = async (req: Request, res: Response) => {
    const order = req.order!

    res.render(`pages/order/about-the-device-wearer/check-your-answers`, createViewModel(order, res.locals.content!))
  }

  update: RequestHandler = async (req: Request, res: Response) => {
    const order = req.order!
    const { action } = CheckYourAnswersFormModel.parse(req.body)

    if (action === 'continue') {
      if (order.status === 'SUBMITTED' || order.status === 'ERROR') {
        res.redirect(this.taskListService.getNextCheckYourAnswersPage('CHECK_ANSWERS_DEVICE_WEARER', order))
      } else {
        res.redirect(this.taskListService.getNextPage('CHECK_ANSWERS_DEVICE_WEARER', order))
      }
    } else {
      res.redirect(paths.ORDER.SUMMARY.replace(':orderId', order.id))
    }
  }
}
