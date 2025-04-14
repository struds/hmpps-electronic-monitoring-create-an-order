import { v4 as uuidv4 } from 'uuid'

import Page from '../../../pages/page'
import IndexPage from '../../../pages/index'
import OrderSummaryPage from '../../../pages/order/summary'
import AboutDeviceWearerPage from '../../../pages/order/about-the-device-wearer/device-wearer'
import ResponsibleAdultDetailsPage from '../../../pages/order/about-the-device-wearer/responsible-adult-details'
import {
  createFakeYouthDeviceWearer,
  createFakeInterestedParties,
  createFakeResponsibleAdult,
  createKnownAddress,
} from '../../../mockApis/faker'
import ContactDetailsPage from '../../../pages/order/contact-information/contact-details'
import NoFixedAbodePage from '../../../pages/order/contact-information/no-fixed-abode'
import PrimaryAddressPage from '../../../pages/order/contact-information/primary-address'
import InterestedPartiesPage from '../../../pages/order/contact-information/interested-parties'
import MonitoringConditionsPage from '../../../pages/order/monitoring-conditions'
import InstallationAddressPage from '../../../pages/order/monitoring-conditions/installation-address'
import EnforcementZonePage from '../../../pages/order/monitoring-conditions/enforcement-zone'
import SubmitSuccessPage from '../../../pages/order/submit-success'
import InstallationAndRiskPage from '../../../pages/order/installationAndRisk'
import AttachmentSummaryPage from '../../../pages/order/attachments/summary'
import { formatAsFmsDateTime, formatAsFmsPhoneNumber } from '../../utils'
import DeviceWearerCheckYourAnswersPage from '../../../pages/order/about-the-device-wearer/check-your-answers'
import MonitoringConditionsCheckYourAnswersPage from '../../../pages/order/monitoring-conditions/check-your-answers'
import ContactInformationCheckYourAnswersPage from '../../../pages/order/contact-information/check-your-answers'
import IdentityNumbersPage from '../../../pages/order/about-the-device-wearer/identity-numbers'

context('Scenarios', () => {
  const fmsCaseId: string = uuidv4()
  const hmppsDocumentId: string = uuidv4()
  const uploadFile = {
    contents: 'cypress/fixtures/test.pdf',
    fileName: 'test.pdf',
  }
  let orderId: string

  const cacheOrderId = () => {
    cy.url().then((url: string) => {
      const parts = url.replace(Cypress.config().baseUrl, '').split('/')
      ;[, , orderId] = parts
    })
  }

  beforeEach(() => {
    cy.task('resetDB')
    cy.task('reset')

    cy.task('stubSignIn', {
      name: 'Cemor Stubs',
      roles: ['ROLE_EM_CEMO__CREATE_ORDER', 'PRISON_USER'],
    })

    cy.task('stubFMSCreateDeviceWearer', {
      httpStatus: 200,
      response: { result: [{ id: fmsCaseId, message: '' }] },
    })

    cy.task('stubFMSCreateMonitoringOrder', {
      httpStatus: 200,
      response: { result: [{ id: uuidv4(), message: '' }] },
    })

    cy.task('stubFmsUploadAttachment', {
      httpStatus: 200,
      fileName: uploadFile.fileName,
      deviceWearerId: fmsCaseId,
      response: {
        status: 200,
        result: {},
      },
    })

    cy.task('stubUploadDocument', {
      id: '(.*)',
      httpStatus: 200,
      response: {
        documentUuid: hmppsDocumentId,
        documentFilename: uploadFile.fileName,
        filename: uploadFile.fileName,
        fileExtension: uploadFile.fileName.split('.')[1],
        mimeType: 'application/pdf',
      },
    })

    cy.readFile(uploadFile.contents, 'base64').then(content => {
      cy.task('stubGetDocument', {
        id: '(.*)',
        httpStatus: 200,
        contextType: 'application/pdf',
        fileBase64Body: content,
      })
    })
  })

  context(
    'Location Monitoring (Inclusion/Exclusion) (Post Release) with GPS Tag (Location - Fitted) (Inclusion/Exclusion zone). Excluded from Football Grounds, document attachment',
    () => {
      const deviceWearerDetails = {
        ...createFakeYouthDeviceWearer('CEMO014'),
        interpreterRequired: false,
        hasFixedAddress: 'Yes',
      }
      const responsibleAdultDetails = createFakeResponsibleAdult()
      const fakePrimaryAddress = createKnownAddress()
      const primaryAddressDetails = {
        ...fakePrimaryAddress,
        hasAnotherAddress: 'No',
      }
      const installationAddressDetails = fakePrimaryAddress
      const interestedParties = createFakeInterestedParties(
        'Prison',
        'YJS',
        'Feltham Young Offender Institution',
        'London',
      )
      const monitoringConditions = {
        startDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 1), // 1 days
        endDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 120), // 120 days
        orderType: 'Post Release',
        conditionType: 'License Condition of a Custodial Order',
        monitoringRequired: 'Exclusion zone monitoring',
      }
      const enforcementZoneDetails = {
        zoneType: 'Exclusion zone',
        startDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 10), // 10 days
        endDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 100), // 100 days
        uploadFile,
        description: 'Excluded from Football Grounds',
        duration: '90 days',
        anotherZone: 'No',
      }

      it('Should successfully submit the order to the FMS API', () => {
        cy.signIn()

        let indexPage = Page.verifyOnPage(IndexPage)
        indexPage.newOrderFormButton.click()

        let orderSummaryPage = Page.verifyOnPage(OrderSummaryPage)
        cacheOrderId()
        orderSummaryPage.deviceWearerTask.click()

        const aboutDeviceWearerPage = Page.verifyOnPage(AboutDeviceWearerPage)
        aboutDeviceWearerPage.form.fillInWith(deviceWearerDetails)
        aboutDeviceWearerPage.form.saveAndContinueButton.click()

        const responsibleAdultDetailsPage = Page.verifyOnPage(ResponsibleAdultDetailsPage)
        responsibleAdultDetailsPage.form.fillInWith(responsibleAdultDetails)
        responsibleAdultDetailsPage.form.saveAndContinueButton.click()

        const identityNumbersPage = Page.verifyOnPage(IdentityNumbersPage)
        identityNumbersPage.form.fillInWith(deviceWearerDetails)
        identityNumbersPage.form.saveAndContinueButton.click()

        const deviceWearerCheckYourAnswersPage = Page.verifyOnPage(DeviceWearerCheckYourAnswersPage)
        deviceWearerCheckYourAnswersPage.continueButton().click()

        const contactDetailsPage = Page.verifyOnPage(ContactDetailsPage)
        contactDetailsPage.form.fillInWith(deviceWearerDetails)
        contactDetailsPage.form.saveAndContinueButton.click()

        const noFixedAbode = Page.verifyOnPage(NoFixedAbodePage)
        noFixedAbode.form.fillInWith(deviceWearerDetails)
        noFixedAbode.form.saveAndContinueButton.click()

        const primaryAddressPage = Page.verifyOnPage(PrimaryAddressPage)
        primaryAddressPage.form.fillInWith(primaryAddressDetails)
        primaryAddressPage.form.saveAndContinueButton.click()

        const interestedPartiesPage = Page.verifyOnPage(InterestedPartiesPage)
        interestedPartiesPage.form.fillInWith(interestedParties)
        interestedPartiesPage.form.saveAndContinueButton.click()

        const contactInformationCheckYourAnswersPage = Page.verifyOnPage(ContactInformationCheckYourAnswersPage)
        contactInformationCheckYourAnswersPage.continueButton().click()

        const installationAndRiskPage = Page.verifyOnPage(InstallationAndRiskPage)
        installationAndRiskPage.form.saveAndContinueButton.click()

        const monitoringConditionsPage = Page.verifyOnPage(MonitoringConditionsPage)
        monitoringConditionsPage.form.fillInWith(monitoringConditions)
        monitoringConditionsPage.form.saveAndContinueButton.click()

        const installationAddress = Page.verifyOnPage(InstallationAddressPage)
        installationAddress.form.fillInWith(installationAddressDetails)
        installationAddress.form.saveAndContinueButton.click()

        const enforcementZonePage = Page.verifyOnPage(EnforcementZonePage)
        enforcementZonePage.form.fillInWith(enforcementZoneDetails)
        enforcementZonePage.form.saveAndContinueButton.click()

        const monitoringConditionsCheckYourAnswersPage = Page.verifyOnPage(MonitoringConditionsCheckYourAnswersPage)
        monitoringConditionsCheckYourAnswersPage.continueButton().click()

        const attachmentPage = Page.verifyOnPage(AttachmentSummaryPage)
        attachmentPage.backToSummaryButton.click()

        orderSummaryPage = Page.verifyOnPage(OrderSummaryPage)
        orderSummaryPage.submitOrderButton.click()

        cy.task('verifyFMSCreateDeviceWearerRequestReceived', {
          responseRecordFilename: 'CEMO014',
          httpStatus: 200,
          body: {
            title: '',
            first_name: deviceWearerDetails.firstNames,
            middle_name: '',
            last_name: deviceWearerDetails.lastName,
            alias: deviceWearerDetails.alias,
            date_of_birth: deviceWearerDetails.dob.toISOString().split('T')[0],
            adult_child: 'child',
            sex: deviceWearerDetails.sex
              .replace('Not able to provide this information', 'Prefer Not to Say')
              .replace('Prefer not to say', 'Prefer Not to Say'),
            gender_identity: deviceWearerDetails.genderIdentity
              .toLocaleLowerCase()
              .replace('not able to provide this information', 'unknown')
              .replace('self identify', 'self-identify')
              .replace('non binary', 'non-binary'),
            disability: [],
            address_1: fakePrimaryAddress.line1,
            address_2: fakePrimaryAddress.line2 === '' ? 'N/A' : fakePrimaryAddress.line2,
            address_3: fakePrimaryAddress.line3,
            address_4: fakePrimaryAddress.line4 === '' ? 'N/A' : fakePrimaryAddress.line4,
            address_post_code: primaryAddressDetails.postcode,
            secondary_address_1: '',
            secondary_address_2: '',
            secondary_address_3: '',
            secondary_address_4: '',
            secondary_address_post_code: '',
            phone_number: formatAsFmsPhoneNumber(deviceWearerDetails.contactNumber),
            risk_serious_harm: '',
            risk_self_harm: '',
            risk_details: '',
            mappa: null,
            mappa_case_type: null,
            risk_categories: [],
            responsible_adult_required: 'true',
            parent: responsibleAdultDetails.fullName,
            guardian: '',
            parent_address_1: '',
            parent_address_2: '',
            parent_address_3: '',
            parent_address_4: '',
            parent_address_post_code: '',
            parent_phone_number: formatAsFmsPhoneNumber(responsibleAdultDetails.contactNumber),
            parent_dob: '',
            pnc_id: deviceWearerDetails.pncId,
            nomis_id: deviceWearerDetails.nomisId,
            delius_id: deviceWearerDetails.deliusId,
            prison_number: deviceWearerDetails.prisonNumber,
            home_office_case_reference_number: deviceWearerDetails.homeOfficeReferenceNumber,
            interpreter_required: 'false',
            language: '',
          },
        }).should('be.true')

        cy.wrap(orderId).then(() => {
          return cy
            .task('verifyFMSCreateMonitoringOrderRequestReceived', {
              responseRecordFilename: 'CEMO014',
              httpStatus: 200,
              body: {
                case_id: fmsCaseId,
                allday_lockdown: '',
                atv_allowance: '',
                condition_type: monitoringConditions.conditionType,
                court: '',
                court_order_email: '',
                device_type: '',
                device_wearer: deviceWearerDetails.fullName,
                enforceable_condition: [
                  {
                    condition: 'EM Exclusion / Inclusion Zone',
                    start_date: formatAsFmsDateTime(monitoringConditions.startDate),
                    end_date: formatAsFmsDateTime(monitoringConditions.endDate),
                  },
                ],
                exclusion_allday: '',
                interim_court_date: '',
                issuing_organisation: '',
                media_interest: '',
                new_order_received: '',
                notifying_officer_email: '',
                notifying_officer_name: '',
                notifying_organization: interestedParties.notifyingOrganisation,
                no_post_code: '',
                no_address_1: '',
                no_address_2: '',
                no_address_3: '',
                no_address_4: '',
                no_email: '',
                no_name: interestedParties.notifyingOrganisationName,
                no_phone_number: '',
                offence: '',
                offence_date: '',
                order_end: formatAsFmsDateTime(monitoringConditions.endDate),
                order_id: orderId,
                order_request_type: 'New Order',
                order_start: formatAsFmsDateTime(monitoringConditions.startDate),
                order_type: monitoringConditions.orderType,
                order_type_description: null,
                order_type_detail: '',
                order_variation_date: '',
                order_variation_details: '',
                order_variation_req_received_date: '',
                order_variation_type: '',
                pdu_responsible: '',
                pdu_responsible_email: '',
                planned_order_end_date: '',
                responsible_officer_details_received: '',
                responsible_officer_email: '',
                responsible_officer_phone: formatAsFmsPhoneNumber(interestedParties.responsibleOfficerContactNumber),
                responsible_officer_name: interestedParties.responsibleOfficerName,
                responsible_organization: interestedParties.responsibleOrganisation,
                ro_post_code: interestedParties.responsibleOrganisationAddress.postcode,
                ro_address_1: interestedParties.responsibleOrganisationAddress.line1,
                ro_address_2: interestedParties.responsibleOrganisationAddress.line2,
                ro_address_3: interestedParties.responsibleOrganisationAddress.line3,
                ro_address_4: interestedParties.responsibleOrganisationAddress.line4,
                ro_email: interestedParties.responsibleOrganisationEmailAddress,
                ro_phone: formatAsFmsPhoneNumber(interestedParties.responsibleOrganisationContactNumber),
                ro_region: interestedParties.responsibleOrganisationRegion,
                sentence_date: '',
                sentence_expiry: '',
                sentence_type: '',
                tag_at_source: '',
                tag_at_source_details: '',
                technical_bail: '',
                trial_date: '',
                trial_outcome: '',
                conditional_release_date: '',
                reason_for_order_ending_early: '',
                business_unit: '',
                service_end_date: monitoringConditions.endDate.toISOString().split('T')[0],
                curfew_description: '',
                curfew_start: '',
                curfew_end: '',
                curfew_duration: [],
                trail_monitoring: 'No',
                exclusion_zones: [
                  {
                    description: enforcementZoneDetails.description,
                    duration: enforcementZoneDetails.duration,
                    start: enforcementZoneDetails.startDate.toISOString().split('T')[0],
                    end: enforcementZoneDetails.endDate.toISOString().split('T')[0],
                  },
                ],
                inclusion_zones: [],
                abstinence: '',
                schedule: '',
                checkin_schedule: [],
                revocation_date: '',
                revocation_type: '',
                installation_address_1: installationAddressDetails.line1,
                installation_address_2: installationAddressDetails.line2,
                installation_address_3: installationAddressDetails.line3 ?? '',
                installation_address_4: installationAddressDetails.line4 ?? '',
                installation_address_post_code: installationAddressDetails.postcode,
                crown_court_case_reference_number: '',
                magistrate_court_case_reference_number: '',
                issp: 'No',
                hdc: 'No',
                order_status: 'Not Started',
              },
            })
            .should('be.true')
        })

        // Verify the attachments were sent to the FMS API
        cy.readFile(uploadFile.contents, 'base64').then(contentAsBase64 => {
          cy.task('verifyFMSAttachmentRequestReceived', {
            responseRecordFilename: 'CEMO001',
            httpStatus: 200,
            fileContents: contentAsBase64,
          })
        })

        const submitSuccessPage = Page.verifyOnPage(SubmitSuccessPage)
        submitSuccessPage.backToYourApplications.click()

        indexPage = Page.verifyOnPage(IndexPage)
        indexPage.SubmittedOrderFor(deviceWearerDetails.fullName).should('exist')
      })
    },
  )
})
