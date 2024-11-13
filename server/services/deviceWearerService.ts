import RestClient from '../data/restClient'
import { AuthenticatedRequestInput } from '../interfaces/request'
import DeviceWearerModel, { DeviceWearer } from '../models/DeviceWearer'
import { ValidationResult, ValidationResultModel } from '../models/Validation'
import { SanitisedError } from '../sanitisedError'
import { serialiseDate } from '../utils/utils'
import DateValidator from '../utils/validators/dateValidator'

type UpdateDeviceWearerRequestInput = AuthenticatedRequestInput & {
  orderId: string
  data: {
    nomisId: string
    pncId: string
    deliusId: string
    prisonNumber: string
    firstName: string
    lastName: string
    alias: string
    'dateOfBirth-day': string
    'dateOfBirth-month': string
    'dateOfBirth-year': string
    adultAtTimeOfInstallation: string
    sex: string
    gender: string
    selfIdentifyGender: string
    disabilities: Array<string>
    otherDisabilities: string
  }
}

type UpdateNoFixedAbodeRequest = AuthenticatedRequestInput & {
  orderId: string
  data: {
    noFixedAbode: string
  }
}

export default class DeviceWearerService {
  constructor(private readonly apiClient: RestClient) {}

  async updateDeviceWearer(input: UpdateDeviceWearerRequestInput): Promise<DeviceWearer | ValidationResult> {
    const isDateOfBirthValid = DateValidator.isValidDateFormat(
      input.data['dateOfBirth-day'],
      input.data['dateOfBirth-month'],
      input.data['dateOfBirth-year'],
      'dateOfBirth',
    )
    if (isDateOfBirthValid.result === false) {
      return ValidationResultModel.parse([isDateOfBirthValid.error])
    }

    const selfIdentifyGender = () => (input.data.gender === 'self-identify' ? input.data.selfIdentifyGender : '')

    const otherDisabilities = () => (input.data.disabilities.includes('Other') ? input.data.otherDisabilities : '')

    try {
      const {
        'dateOfBirth-day': dobDay,
        'dateOfBirth-month': dobMonth,
        'dateOfBirth-year': dobYear,
        disabilities,
        ...data
      } = input.data

      const result = await this.apiClient.put({
        path: `/api/orders/${input.orderId}/device-wearer`,
        data: {
          ...data,
          dateOfBirth: serialiseDate(dobYear, dobMonth, dobDay),
          selfIdentifyGender: selfIdentifyGender(),
          disabilities: disabilities.join(','),
          otherDisabilities: otherDisabilities(),
        },
        token: input.accessToken,
      })

      return DeviceWearerModel.parse(result)
    } catch (e) {
      const sanitisedError = e as SanitisedError

      if (sanitisedError.status === 400) {
        return ValidationResultModel.parse((e as SanitisedError).data)
      }

      throw e
    }
  }

  async updateNoFixedAbode(input: UpdateNoFixedAbodeRequest): Promise<DeviceWearer | ValidationResult> {
    try {
      const result = await this.apiClient.put({
        path: `/api/orders/${input.orderId}/device-wearer/no-fixed-abode`,
        data: input.data,
        token: input.accessToken,
      })

      return DeviceWearerModel.parse(result)
    } catch (e) {
      const sanitisedError = e as SanitisedError

      if (sanitisedError.status === 400) {
        return ValidationResultModel.parse((e as SanitisedError).data)
      }

      throw e
    }
  }
}
