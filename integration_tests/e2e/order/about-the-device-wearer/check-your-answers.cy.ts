import { v4 as uuidv4 } from 'uuid'
import { NotFoundErrorPage } from '../../../pages/error'
import Page from '../../../pages/page'
import CheckYourAnswersPage from '../../../pages/order/about-the-device-wearer/check-your-answers'

const mockOrderId = uuidv4()
const pagePath = '/about-the-device-wearer/check-your-answers'

context('Device wearer - check your answers', () => {
  context('Draft order', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { name: 'john smith', roles: ['ROLE_EM_CEMO__CREATE_ORDER'] })

      cy.task('stubCemoGetOrder', { httpStatus: 200, id: mockOrderId, status: 'IN_PROGRESS' })

      cy.signIn()
    })

    it('Should display the user name visible in header', () => {
      const page = Page.visit(CheckYourAnswersPage, { orderId: mockOrderId })
      page.header.userName().should('contain.text', 'J. Smith')
    })

    it('Should display the phase banner in header', () => {
      const page = Page.visit(CheckYourAnswersPage, { orderId: mockOrderId })
      page.header.phaseBanner().should('contain.text', 'dev')
    })

    it('Should render the save and continue, and return buttons', () => {
      const page = Page.visit(CheckYourAnswersPage, { orderId: mockOrderId })

      page.continueButton().should('exist')
      page.returnButton().should('exist')
    })

    it('Should be accessible', () => {
      const page = Page.visit(CheckYourAnswersPage, { orderId: mockOrderId })
      page.checkIsAccessible()
    })
  })

  context('Device Wearer is 18 or over', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { name: 'john smith', roles: ['ROLE_EM_CEMO__CREATE_ORDER'] })

      cy.task('stubCemoGetOrder', {
        httpStatus: 200,
        id: mockOrderId,
        status: 'IN_PROGRESS',
        order: {
          deviceWearer: {
            nomisId: 'nomis',
            pncId: 'pnc',
            deliusId: 'delius',
            prisonNumber: 'prison',
            homeOfficeReferenceNumber: 'ho',
            firstName: 'test',
            lastName: 'tester',
            alias: 'tes',
            dateOfBirth: '2000-01-01T00:00:00Z',
            adultAtTimeOfInstallation: true,
            sex: 'MALE',
            gender: 'male',
            otherGender: null,
            disabilities: 'MENTAL_HEALTH',
            otherDisability: null,
            noFixedAbode: null,
            interpreterRequired: false,
          },
          DeviceWearerResponsibleAdult: null,
        },
      })

      cy.signIn()
    })

    it('should not show responsible adult section', () => {
      const page = Page.visit(CheckYourAnswersPage, { orderId: mockOrderId })

      page.personDetailsSection.shouldExist()
      page.personDetailsSection.shouldHaveItems([
        { key: "What is the device wearer's first name?", value: 'test' },
        { key: "What is the device wearer's last name?", value: 'tester' },
        { key: "What is the device wearer's preferred name or names? (optional)", value: 'tes' },
        { key: "What is the device wearer's date of birth?", value: '01/01/2000' },
        { key: 'Is a responsible adult required?', value: 'Yes' },
        { key: 'What is the sex of the device wearer?', value: 'Male' },
        { key: "What is the device wearer's gender?", value: 'Male' },
        {
          key: 'Does the device wearer have any of the disabilities or health conditions listed? (optional)',
          value: 'Mental health',
        },
        { key: 'What language does the interpreter need to use? (optional)', value: '' },
        { key: 'Is an interpreter needed?', value: 'No' },
      ])
      page.personDetailsSection.shouldNotHaveItems([
        "What is the device wearer's disability or health condition? (optional)",
        "What is the device wearer's chosen identity?",
      ])
      page.identityNumbersSection.shouldExist()
      page.identityNumbersSection.shouldHaveItems([
        { key: 'National Offender Management Information System (NOMIS) ID (optional)', value: 'nomis' },
        { key: 'Police National Computer (PNC) ID (optional)', value: 'pnc' },
        { key: 'Delius ID (optional)', value: 'delius' },
        { key: 'Prison number (optional)', value: 'prison' },
        { key: 'Home Office Reference Number (optional)', value: 'ho' },
      ])
      page.responsibleAdultSection.shouldNotExist()
    })
  })

  context('Device wearer has an unlisted disability and gender', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { name: 'john smith', roles: ['ROLE_EM_CEMO__CREATE_ORDER'] })

      cy.task('stubCemoGetOrder', {
        httpStatus: 200,
        id: mockOrderId,
        status: 'IN_PROGRESS',
        order: {
          deviceWearer: {
            nomisId: 'nomis',
            pncId: 'pnc',
            deliusId: 'delius',
            prisonNumber: 'prison',
            homeOfficeReferenceNumber: 'ho',
            firstName: 'test',
            lastName: 'tester',
            alias: 'tes',
            dateOfBirth: '2000-01-01T00:00:00Z',
            adultAtTimeOfInstallation: true,
            sex: 'FEMALE',
            gender: 'self-identify',
            otherGender: 'Furby',
            disabilities: 'OTHER',
            otherDisability: 'Broken arm',
            noFixedAbode: null,
            interpreterRequired: false,
          },
          DeviceWearerResponsibleAdult: null,
        },
      })

      cy.signIn()
    })

    it('should show otherDisability and otherGender questions and answers', () => {
      const page = Page.visit(CheckYourAnswersPage, { orderId: mockOrderId })

      page.personDetailsSection.shouldExist()
      page.personDetailsSection.shouldHaveItems([
        { key: "What is the device wearer's first name?", value: 'test' },
        { key: "What is the device wearer's last name?", value: 'tester' },
        { key: "What is the device wearer's preferred name or names? (optional)", value: 'tes' },
        { key: "What is the device wearer's date of birth?", value: '01/01/2000' },
        { key: 'Is a responsible adult required?', value: 'Yes' },
        { key: 'What is the sex of the device wearer?', value: 'Female' },
        { key: "What is the device wearer's gender?", value: 'Self identify' },
        { key: "What is the device wearer's chosen identity?", value: 'Furby' },
        {
          key: 'Does the device wearer have any of the disabilities or health conditions listed? (optional)',
          value: 'Other',
        },
        { key: "What is the device wearer's disability or health condition? (optional)", value: 'Broken arm' },
        { key: 'What language does the interpreter need to use? (optional)', value: '' },
        { key: 'Is an interpreter needed?', value: 'No' },
      ])
      page.identityNumbersSection.shouldExist()
      page.identityNumbersSection.shouldHaveItems([
        { key: 'National Offender Management Information System (NOMIS) ID (optional)', value: 'nomis' },
        { key: 'Police National Computer (PNC) ID (optional)', value: 'pnc' },
        { key: 'Delius ID (optional)', value: 'delius' },
        { key: 'Prison number (optional)', value: 'prison' },
        { key: 'Home Office Reference Number (optional)', value: 'ho' },
      ])
      page.responsibleAdultSection.shouldNotExist()
    })
  })

  context('Device Wearer is under 18', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { name: 'john smith', roles: ['ROLE_EM_CEMO__CREATE_ORDER'] })

      cy.task('stubCemoGetOrder', {
        httpStatus: 200,
        id: mockOrderId,
        status: 'IN_PROGRESS',
        order: {
          deviceWearer: {
            nomisId: 'nomis',
            pncId: 'pnc',
            deliusId: 'delius',
            prisonNumber: 'prison',
            homeOfficeReferenceNumber: 'ho',
            firstName: 'test',
            lastName: 'tester',
            alias: 'tes',
            dateOfBirth: '2000-01-01T00:00:00Z',
            adultAtTimeOfInstallation: false,
            sex: 'PREFER_NOT_TO_SAY',
            gender: 'male',
            otherGender: null,
            disabilities: 'MENTAL_HEALTH',
            otherDisability: null,
            noFixedAbode: null,
            interpreterRequired: false,
          },
          deviceWearerResponsibleAdult: {
            relationship: 'parent',
            otherRelationshipDetails: '',
            fullName: 'Audrey Taylor',
            contactNumber: '07101 123 456',
          },
        },
      })

      cy.signIn()
    })

    it('should show responsible adult section', () => {
      const page = Page.visit(CheckYourAnswersPage, { orderId: mockOrderId })

      page.personDetailsSection.shouldExist()
      page.personDetailsSection.shouldHaveItems([
        { key: "What is the device wearer's first name?", value: 'test' },
        { key: "What is the device wearer's last name?", value: 'tester' },
        { key: "What is the device wearer's preferred name or names? (optional)", value: 'tes' },
        { key: "What is the device wearer's date of birth?", value: '01/01/2000' },
        { key: 'Is a responsible adult required?', value: 'No' },
        { key: 'What is the sex of the device wearer?', value: 'Prefer not to say' },
        { key: "What is the device wearer's gender?", value: 'Male' },
        {
          key: 'Does the device wearer have any of the disabilities or health conditions listed? (optional)',
          value: 'Mental health',
        },
        { key: 'What language does the interpreter need to use? (optional)', value: '' },
        { key: 'Is an interpreter needed?', value: 'No' },
      ])
      page.identityNumbersSection.shouldExist()
      page.identityNumbersSection.shouldHaveItems([
        { key: 'National Offender Management Information System (NOMIS) ID (optional)', value: 'nomis' },
        { key: 'Police National Computer (PNC) ID (optional)', value: 'pnc' },
        { key: 'Delius ID (optional)', value: 'delius' },
        { key: 'Prison number (optional)', value: 'prison' },
        { key: 'Home Office Reference Number (optional)', value: 'ho' },
      ])
      page.responsibleAdultSection.shouldExist()
      page.responsibleAdultSection.shouldHaveItems([
        { key: "What is the responsible adult's relationship to the device wearer?", value: 'Parent' },
        { key: "What is the responsible adult's full name?", value: 'Audrey Taylor' },
        { key: "What is the responsible adult's telephone number? (optional)", value: '07101 123 456' },
      ])
      page.responsibleAdultSection.shouldNotHaveItems(['Relationship to device wearer'])
    })
  })

  context('Device Wearer is under 18 and the responsible adult has an unlisted relationship', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { name: 'john smith', roles: ['ROLE_EM_CEMO__CREATE_ORDER'] })

      cy.task('stubCemoGetOrder', {
        httpStatus: 200,
        id: mockOrderId,
        status: 'IN_PROGRESS',
        order: {
          deviceWearer: {
            nomisId: 'nomis',
            pncId: 'pnc',
            deliusId: 'delius',
            prisonNumber: 'prison',
            homeOfficeReferenceNumber: 'ho',
            firstName: 'test',
            lastName: 'tester',
            alias: 'tes',
            dateOfBirth: '2000-01-01T00:00:00Z',
            adultAtTimeOfInstallation: false,
            sex: 'UNKNOWN',
            gender: 'male',
            otherGender: null,
            disabilities: 'MENTAL_HEALTH',
            otherDisability: null,
            noFixedAbode: null,
            interpreterRequired: false,
          },
          deviceWearerResponsibleAdult: {
            relationship: 'other',
            otherRelationshipDetails: 'Sibling',
            fullName: 'Audrey Taylor',
            contactNumber: '07101 123 456',
          },
        },
      })

      cy.signIn()
    })

    it('should show responsible adult section and otherRelationshipDeatils question and answer', () => {
      const page = Page.visit(CheckYourAnswersPage, { orderId: mockOrderId })

      page.personDetailsSection.shouldExist()
      page.personDetailsSection.shouldHaveItems([
        { key: "What is the device wearer's first name?", value: 'test' },
        { key: "What is the device wearer's last name?", value: 'tester' },
        { key: "What is the device wearer's preferred name or names? (optional)", value: 'tes' },
        { key: "What is the device wearer's date of birth?", value: '01/01/2000' },
        { key: 'Is a responsible adult required?', value: 'No' },
        { key: 'What is the sex of the device wearer?', value: 'Not able to provide this information' },
        { key: "What is the device wearer's gender?", value: 'Male' },
        {
          key: 'Does the device wearer have any of the disabilities or health conditions listed? (optional)',
          value: 'Mental health',
        },
        { key: 'What language does the interpreter need to use? (optional)', value: '' },
        { key: 'Is an interpreter needed?', value: 'No' },
      ])
      page.identityNumbersSection.shouldExist()
      page.identityNumbersSection.shouldHaveItems([
        { key: 'National Offender Management Information System (NOMIS) ID (optional)', value: 'nomis' },
        { key: 'Police National Computer (PNC) ID (optional)', value: 'pnc' },
        { key: 'Delius ID (optional)', value: 'delius' },
        { key: 'Prison number (optional)', value: 'prison' },
        { key: 'Home Office Reference Number (optional)', value: 'ho' },
      ])
      page.responsibleAdultSection.shouldExist()
      page.responsibleAdultSection.shouldHaveItems([
        { key: "What is the responsible adult's relationship to the device wearer?", value: 'Other' },
        { key: 'Relationship to device wearer', value: 'Sibling' },
        { key: "What is the responsible adult's full name?", value: 'Audrey Taylor' },
        { key: "What is the responsible adult's telephone number? (optional)", value: '07101 123 456' },
      ])
    })
  })

  context('Unhealthy backend', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { name: 'john smith', roles: ['ROLE_EM_CEMO__CREATE_ORDER'] })

      cy.task('stubCemoGetOrder', { httpStatus: 404 })
    })

    it('Should indicate to the user that there was an error', () => {
      cy.signIn().visit(`/order/${mockOrderId}${pagePath}`, { failOnStatusCode: false })

      Page.verifyOnPage(NotFoundErrorPage)
    })
  })
})
