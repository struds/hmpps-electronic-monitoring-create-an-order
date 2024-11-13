import { Request, RequestHandler, Response } from 'express'
import z from 'zod'
import paths from '../constants/paths'
import { DeviceWearer } from '../models/DeviceWearer'
import { isValidationResult, ValidationResult } from '../models/Validation'
import { MultipleChoiceField, TextField } from '../models/view-models/utils'
import { AuditService, DeviceWearerService } from '../services'
import { deserialiseDate, getError } from '../utils/utils'
import TaskListService from '../services/taskListService'

// Basic validation of user submitted form data
const DeviceWearerFormDataModel = z.object({
  action: z.string(),
  nomisId: z.string(),
  pncId: z.string(),
  deliusId: z.string(),
  prisonNumber: z.string(),
  homeOfficeReferenceNumber: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  alias: z.string(),
  'dateOfBirth-day': z.string(),
  'dateOfBirth-month': z.string(),
  'dateOfBirth-year': z.string(),
  language: z.string(),
  interpreterRequired: z.string().default(''),
  adultAtTimeOfInstallation: z.string().default(''),
  sex: z.string().default(''),
  gender: z.string().default(''),
  selfIdentifyGender: z.string().optional(),
  disabilities: z
    .union([z.string(), z.array(z.string()).default([])])
    .transform(val => (Array.isArray(val) ? val : [val])),
  otherDisabilities: z.string().optional(),
})

type DeviceWearerFormData = z.infer<typeof DeviceWearerFormDataModel>

type DeviceWearerViewModel = {
  formActionUri: string
  orderSummaryUri: string
  nomisId: TextField
  pncId: TextField
  deliusId: TextField
  prisonNumber: TextField
  homeOfficeReferenceNumber: TextField
  firstName: TextField
  lastName: TextField
  alias: TextField
  dateOfBirth_day: TextField
  dateOfBirth_month: TextField
  dateOfBirth_year: TextField
  dateOfBirth: TextField
  adultAtTimeOfInstallation: TextField
  sex: TextField
  gender: TextField
  selfIdentifyGender: TextField
  disabilities: MultipleChoiceField
  otherDisabilities: TextField
  language: TextField
  interpreterRequired: TextField
}

export default class DeviceWearerController {
  constructor(
    private readonly auditService: AuditService,
    private readonly deviceWearerService: DeviceWearerService,
    private readonly taskListService: TaskListService,
  ) {}

  private createViewModelFromFormData(
    formData: DeviceWearerFormData,
    validationErrors: ValidationResult,
    orderId: string,
  ): DeviceWearerViewModel {
    return {
      formActionUri: paths.ABOUT_THE_DEVICE_WEARER.DEVICE_WEARER.replace(':orderId', orderId),
      orderSummaryUri: paths.ORDER.SUMMARY.replace(':orderId', orderId),
      nomisId: { value: formData.nomisId, error: getError(validationErrors, 'nomisId') },
      pncId: { value: formData.pncId, error: getError(validationErrors, 'pncId') },
      deliusId: { value: formData.deliusId, error: getError(validationErrors, 'deliusId') },
      prisonNumber: { value: formData.prisonNumber, error: getError(validationErrors, 'prisonNumber') },
      homeOfficeReferenceNumber: {
        value: formData.homeOfficeReferenceNumber,
        error: getError(validationErrors, 'homeOfficeReferenceNumber'),
      },
      firstName: { value: formData.firstName, error: getError(validationErrors, 'firstName') },
      lastName: { value: formData.lastName, error: getError(validationErrors, 'lastName') },
      alias: { value: formData.alias, error: getError(validationErrors, 'alias') },
      dateOfBirth_day: { value: formData['dateOfBirth-day'] },
      dateOfBirth_month: { value: formData['dateOfBirth-month'] },
      dateOfBirth_year: { value: formData['dateOfBirth-year'] },
      dateOfBirth: { value: '', error: getError(validationErrors, 'dateOfBirth') },
      adultAtTimeOfInstallation: {
        value: formData.adultAtTimeOfInstallation || '',
        error: getError(validationErrors, 'adultAtTimeOfInstallation'),
      },
      sex: { value: formData.sex || '', error: getError(validationErrors, 'sex') },
      gender: { value: formData.gender || '', error: getError(validationErrors, 'gender') },
      selfIdentifyGender: {
        value: formData.selfIdentifyGender || '',
        error: getError(validationErrors, 'selfIdentifyGender'),
      },
      disabilities: { values: formData.disabilities || '', error: getError(validationErrors, 'disabilities') },
      otherDisabilities: {
        value: formData.otherDisabilities || '',
        error: getError(validationErrors, 'otherDisabilities'),
      },
      language: { value: formData.language || '', error: getError(validationErrors, 'language') },
      interpreterRequired: {
        value: formData.interpreterRequired || '',
        error: getError(validationErrors, 'interpreterRequired'),
      },
    }
  }

  private createViewModelFromDeviceWearer(deviceWearer: DeviceWearer, orderId: string): DeviceWearerViewModel {
    const [year, month, day] = deserialiseDate(deviceWearer.dateOfBirth || '')

    return {
      formActionUri: paths.ABOUT_THE_DEVICE_WEARER.DEVICE_WEARER.replace(':orderId', orderId),
      orderSummaryUri: paths.ORDER.SUMMARY.replace(':orderId', orderId),
      nomisId: { value: deviceWearer.nomisId || '' },
      pncId: { value: deviceWearer.pncId || '' },
      deliusId: { value: deviceWearer.deliusId || '' },
      prisonNumber: { value: deviceWearer.prisonNumber || '' },
      homeOfficeReferenceNumber: { value: deviceWearer.homeOfficeReferenceNumber || '' },
      firstName: { value: deviceWearer.firstName || '' },
      lastName: { value: deviceWearer.lastName || '' },
      alias: { value: deviceWearer.alias || '' },
      dateOfBirth_day: { value: day },
      dateOfBirth_month: { value: month },
      dateOfBirth_year: { value: year },
      dateOfBirth: {
        value: '',
      },
      adultAtTimeOfInstallation: { value: String(deviceWearer.adultAtTimeOfInstallation) },
      sex: { value: deviceWearer.sex || '' },
      gender: { value: deviceWearer.gender || '' },
      selfIdentifyGender: { value: deviceWearer.selfIdentifyGender || '' },
      disabilities: { values: deviceWearer.disabilities ?? [] },
      otherDisabilities: { value: deviceWearer.otherDisabilities || '' },
      language: { value: deviceWearer.language || '' },
      interpreterRequired: { value: String(deviceWearer.interpreterRequired) || '' },
    }
  }

  private constructViewModel(
    deviceWearer: DeviceWearer,
    validationErrors: ValidationResult,
    formData: [DeviceWearerFormData],
    orderId: string,
  ): DeviceWearerViewModel {
    if (validationErrors.length > 0 && formData.length > 0) {
      return this.createViewModelFromFormData(formData[0], validationErrors, orderId)
    }

    return this.createViewModelFromDeviceWearer(deviceWearer, orderId)
  }

  view: RequestHandler = async (req: Request, res: Response) => {
    const { orderId } = req.params
    const { deviceWearer } = req.order!
    const errors = req.flash('validationErrors')
    const formData = req.flash('formData')
    const viewModel = this.constructViewModel(deviceWearer, errors as never, formData as never, orderId)

    res.render(`pages/order/about-the-device-wearer/device-wearer`, viewModel)
  }

  update: RequestHandler = async (req: Request, res: Response) => {
    const { orderId } = req.params
    const { action, ...formData } = DeviceWearerFormDataModel.parse(req.body)

    const updateDeviceWearerResult = await this.deviceWearerService.updateDeviceWearer({
      accessToken: res.locals.user.token,
      orderId,
      data: formData,
    })

    if (isValidationResult(updateDeviceWearerResult)) {
      req.flash('formData', formData)
      req.flash('validationErrors', updateDeviceWearerResult)

      res.redirect(paths.ABOUT_THE_DEVICE_WEARER.DEVICE_WEARER.replace(':orderId', orderId))
    } else if (action === 'continue') {
      res.redirect(
        this.taskListService.getNextPage('DEVICE_WEARER', {
          ...req.order!,
          deviceWearer: updateDeviceWearerResult,
        }),
      )
    } else {
      res.redirect(paths.ORDER.SUMMARY.replace(':orderId', orderId))
    }
  }
}
