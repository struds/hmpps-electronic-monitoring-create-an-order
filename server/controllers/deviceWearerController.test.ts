import { getMockOrder } from '../../test/mocks/mockOrder'
import { createMockRequest, createMockResponse } from '../../test/mocks/mockExpress'
import HmppsAuditClient from '../data/hmppsAuditClient'
import RestClient from '../data/restClient'
import AuditService from '../services/auditService'
import DeviceWearerService from '../services/deviceWearerService'
import DeviceWearerController from './deviceWearerController'
import TaskListService from '../services/taskListService'

jest.mock('../services/auditService')
jest.mock('../services/orderService')
jest.mock('../services/deviceWearerService')
jest.mock('../data/hmppsAuditClient')
jest.mock('../data/restClient')

const mockOrder = getMockOrder({
  deviceWearer: {
    nomisId: null,
    pncId: null,
    deliusId: null,
    prisonNumber: null,
    homeOfficeReferenceNumber: null,
    firstName: 'tester',
    lastName: 'testington',
    alias: 'test',
    dateOfBirth: '1980-01-01T00:00:00.000Z',
    adultAtTimeOfInstallation: false,
    sex: 'male',
    gender: 'male',
    disabilities: ['Vision', 'Mobilitiy'],
    noFixedAbode: null,
    interpreterRequired: true,
    language: 'British Sign',
  },
})

describe('DeviceWearerController', () => {
  let mockRestClient: jest.Mocked<RestClient>
  let mockAuditClient: jest.Mocked<HmppsAuditClient>
  let mockAuditService: jest.Mocked<AuditService>
  let mockDeviceWearerService: jest.Mocked<DeviceWearerService>
  let deviceWearerController: DeviceWearerController
  const taskListService = new TaskListService()

  beforeEach(() => {
    mockAuditClient = new HmppsAuditClient({
      queueUrl: '',
      enabled: true,
      region: '',
      serviceName: '',
    }) as jest.Mocked<HmppsAuditClient>
    mockRestClient = new RestClient('cemoApi', {
      url: '',
      timeout: { response: 0, deadline: 0 },
      agent: { timeout: 0 },
    }) as jest.Mocked<RestClient>
    mockAuditService = new AuditService(mockAuditClient) as jest.Mocked<AuditService>
    mockDeviceWearerService = new DeviceWearerService(mockRestClient) as jest.Mocked<DeviceWearerService>
    deviceWearerController = new DeviceWearerController(mockAuditService, mockDeviceWearerService, taskListService)

    jest.useFakeTimers()
    jest.setSystemTime(new Date('2020-01-01'))
  })

  describe('view', () => {
    it('should render the form using the saved device wearer data', async () => {
      // Given
      const req = createMockRequest({ order: mockOrder, flash: jest.fn().mockReturnValue([]) })
      const res = createMockResponse()
      const next = jest.fn()

      // When
      await deviceWearerController.view(req, res, next)

      // Then
      expect(res.render).toHaveBeenCalledWith(
        'pages/order/about-the-device-wearer/device-wearer',
        expect.objectContaining({
          nomisId: { value: '' },
          pncId: { value: '' },
          deliusId: { value: '' },
          prisonNumber: { value: '' },
          firstName: { value: 'tester' },
          lastName: { value: 'testington' },
          alias: { value: 'test' },
          dateOfBirth_day: { value: '1' },
          dateOfBirth_month: { value: '1' },
          dateOfBirth_year: { value: '1980' },
          dateOfBirth: { value: '' },
          adultAtTimeOfInstallation: { value: 'false' },
          sex: { value: 'male' },
          gender: { value: 'male' },
          disabilities: { values: ['Vision', 'Mobilitiy'] },
          interpreterRequired: { value: 'true' },
          language: { value: 'British Sign' },
        }),
      )
    })

    it('should render the form using submitted data when there are validation errors', async () => {
      // Given
      const req = createMockRequest({
        order: mockOrder,
        flash: jest
          .fn()
          .mockReturnValueOnce([{ error: 'Date of birth must be in the past', field: 'dateOfBirth' }])
          .mockReturnValueOnce([
            {
              nomisId: 'nomis',
              pncId: 'pnc',
              deliusId: 'delius',
              prisonNumber: 'prison',
              firstName: 'new',
              lastName: 'name',
              alias: 'new',
              'dateOfBirth-day': '02',
              'dateOfBirth-month': '03',
              'dateOfBirth-year': '1990',
              adultAtTimeOfInstallation: 'true',
              sex: 'female',
              gender: 'female',
              disabilities: ['Vision', 'Hearing'],
              interpreterRequired: 'true',
              language: 'British Sign',
            },
          ]),
      })
      const res = createMockResponse()
      const next = jest.fn()

      // When
      await deviceWearerController.view(req, res, next)

      // Then
      expect(res.render).toHaveBeenCalledWith(
        'pages/order/about-the-device-wearer/device-wearer',
        expect.objectContaining({
          nomisId: { value: 'nomis' },
          pncId: { value: 'pnc' },
          deliusId: { value: 'delius' },
          prisonNumber: { value: 'prison' },
          firstName: { value: 'new' },
          lastName: { value: 'name' },
          alias: { value: 'new' },
          dateOfBirth_day: { value: '02' },
          dateOfBirth_month: { value: '03' },
          dateOfBirth_year: { value: '1990' },
          dateOfBirth: { value: '', error: { text: 'Date of birth must be in the past' } },
          adultAtTimeOfInstallation: { value: 'true' },
          sex: { value: 'female' },
          gender: { value: 'female' },
          disabilities: { values: ['Vision', 'Hearing'] },
          interpreterRequired: { value: 'true' },
          language: { value: 'British Sign' },
        }),
      )
    })
  })

  describe('update', () => {
    it('should persist data and redirect to the form when the user submits invalid values', async () => {
      // Given
      const order = getMockOrder()
      const req = createMockRequest({
        order,
        body: {
          action: 'continue',
          nomisId: 'nomis',
          pncId: 'pnc',
          deliusId: 'delius',
          prisonNumber: 'prison',
          homeOfficeReferenceNumber: 'homeoffice',
          firstName: 'new',
          lastName: 'name',
          alias: 'new',
          'dateOfBirth-day': '02',
          'dateOfBirth-month': '03',
          'dateOfBirth-year': '1990',
          adultAtTimeOfInstallation: 'true',
          sex: 'female',
          gender: 'self-identify',
          selfIdentifyGender: 'Gender anarchist',
          disabilities: 'Vision',
          otherDisabilities: 'Broken arm',
          interpreterRequired: 'true',
          language: 'British Sign',
        },
        params: {
          orderId: order.id,
        },
        flash: jest.fn(),
      })
      const res = createMockResponse()
      const next = jest.fn()
      mockDeviceWearerService.updateDeviceWearer.mockResolvedValue([
        { error: 'Date of birth must be in the past', field: 'dateOfBirth' },
      ])

      // When
      await deviceWearerController.update(req, res, next)

      // Then
      expect(req.flash).toHaveBeenCalledTimes(2)
      expect(req.flash).toHaveBeenNthCalledWith(1, 'formData', {
        nomisId: 'nomis',
        pncId: 'pnc',
        deliusId: 'delius',
        prisonNumber: 'prison',
        homeOfficeReferenceNumber: 'homeoffice',
        firstName: 'new',
        lastName: 'name',
        alias: 'new',
        'dateOfBirth-day': '02',
        'dateOfBirth-month': '03',
        'dateOfBirth-year': '1990',
        adultAtTimeOfInstallation: 'true',
        sex: 'female',
        gender: 'self-identify',
        selfIdentifyGender: 'Gender anarchist',
        disabilities: ['Vision'],
        otherDisabilities: 'Broken arm',
        interpreterRequired: 'true',
        language: 'British Sign',
      })
      expect(req.flash).toHaveBeenNthCalledWith(2, 'validationErrors', [
        {
          error: 'Date of birth must be in the past',
          field: 'dateOfBirth',
        },
      ])
      expect(res.redirect).toHaveBeenCalledWith(`/order/${order.id}/about-the-device-wearer`)
    })

    it('should save and redirect to the contact details page if the device wearer is an adult', async () => {
      // Given
      const order = getMockOrder()
      const req = createMockRequest({
        order,
        body: {
          action: 'continue',
          nomisId: 'nomis',
          pncId: 'pnc',
          deliusId: 'delius',
          prisonNumber: 'prison',
          homeOfficeReferenceNumber: 'homeoffice',
          firstName: 'new',
          lastName: 'name',
          alias: 'new',
          'dateOfBirth-day': '02',
          'dateOfBirth-month': '03',
          'dateOfBirth-year': '1990',
          adultAtTimeOfInstallation: 'true',
          sex: 'female',
          gender: 'female',
          disabilities: ['Vision', 'Hearing'],
          interpreterRequired: 'true',
          language: 'British Sign',
        },
        flash: jest.fn(),
      })
      const res = createMockResponse()
      const next = jest.fn()
      mockDeviceWearerService.updateDeviceWearer.mockResolvedValue({
        nomisId: null,
        pncId: null,
        deliusId: null,
        prisonNumber: null,
        homeOfficeReferenceNumber: null,
        firstName: 'tester',
        lastName: 'testington',
        alias: 'test',
        dateOfBirth: '1980-01-01T00:00:00.000Z',
        adultAtTimeOfInstallation: true,
        sex: 'male',
        gender: 'male',
        disabilities: ['Vision', 'Mobilitiy'],
        noFixedAbode: null,
        interpreterRequired: true,
        language: 'British Sign',
      })

      // When
      await deviceWearerController.update(req, res, next)

      // Then
      expect(req.flash).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith(`/order/${order.id}/contact-information/contact-details`)
    })

    it('should save and redirect to the responsible adult page if the device wearer is not an adult', async () => {
      // Given
      const order = getMockOrder()
      const req = createMockRequest({
        order,
        body: {
          action: 'continue',
          nomisId: 'nomis',
          pncId: 'pnc',
          deliusId: 'delius',
          prisonNumber: 'prison',
          homeOfficeReferenceNumber: 'homeoffice',
          firstName: 'new',
          lastName: 'name',
          alias: 'new',
          'dateOfBirth-day': '02',
          'dateOfBirth-month': '03',
          'dateOfBirth-year': '1990',
          adultAtTimeOfInstallation: 'true',
          sex: 'female',
          gender: 'female',
          disabilities: ['Vision', 'Hearing'],
          interpreterRequired: 'true',
          language: 'British Sign',
        },
        flash: jest.fn(),
      })
      const res = createMockResponse()
      const next = jest.fn()
      mockDeviceWearerService.updateDeviceWearer.mockResolvedValue({
        nomisId: null,
        pncId: null,
        deliusId: null,
        prisonNumber: null,
        homeOfficeReferenceNumber: null,
        firstName: 'tester',
        lastName: 'testington',
        alias: 'test',
        dateOfBirth: '1980-01-01T00:00:00.000Z',
        adultAtTimeOfInstallation: false,
        sex: 'male',
        gender: 'male',
        disabilities: ['Vision', 'Mobilitiy'],
        noFixedAbode: null,
        interpreterRequired: true,
        language: 'British Sign',
      })

      // When
      await deviceWearerController.update(req, res, next)

      // Then
      expect(req.flash).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith(`/order/${order.id}/about-the-device-wearer/responsible-adult`)
    })

    it('should save and redirect to the order summary page if the user chooses', async () => {
      // Given
      const order = getMockOrder()
      const req = createMockRequest({
        order,
        body: {
          action: 'back',
          nomisId: 'nomis',
          pncId: 'pnc',
          deliusId: 'delius',
          homeOfficeReferenceNumber: 'homeoffice',
          prisonNumber: 'prison',
          firstName: 'new',
          lastName: 'name',
          alias: 'new',
          'dateOfBirth-day': '02',
          'dateOfBirth-month': '03',
          'dateOfBirth-year': '1990',
          adultAtTimeOfInstallation: 'true',
          sex: 'female',
          gender: 'female',
          disabilities: ['Vision', 'Hearing'],
          interpreterRequired: 'true',
          language: 'British Sign',
        },
        params: {
          orderId: order.id,
        },
        flash: jest.fn(),
      })
      const res = createMockResponse()
      const next = jest.fn()
      mockDeviceWearerService.updateDeviceWearer.mockResolvedValue({
        nomisId: null,
        pncId: null,
        deliusId: null,
        prisonNumber: null,
        homeOfficeReferenceNumber: null,
        firstName: 'tester',
        lastName: 'testington',
        alias: 'test',
        dateOfBirth: '1980-01-01T00:00:00.000Z',
        adultAtTimeOfInstallation: true,
        sex: 'male',
        gender: 'male',
        disabilities: ['Vision', 'Mobilitiy'],
        noFixedAbode: null,
        interpreterRequired: true,
        language: 'British Sign',
      })

      // When
      await deviceWearerController.update(req, res, next)

      // Then
      expect(req.flash).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith(`/order/${order.id}/summary`)
    })
  })
})
