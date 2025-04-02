import { v4 as uuidv4 } from 'uuid'
import { NotFoundErrorPage } from '../../../pages/error'
import Page from '../../../pages/page'
import ContactInformationCheckYourAnswersPage from '../../../pages/order/contact-information/check-your-answers'

const mockOrderId = uuidv4()
const pagePath = '/contact-information/check-your-answers'

context('Contact Information - check your answers', () => {
  context('Draft order', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { name: 'john smith', roles: ['ROLE_EM_CEMO__CREATE_ORDER'] })

      cy.task('stubCemoGetOrder', { httpStatus: 200, id: mockOrderId, status: 'IN_PROGRESS' })

      cy.signIn()
    })

    it('Should display the user name visible in header', () => {
      const page = Page.visit(ContactInformationCheckYourAnswersPage, { orderId: mockOrderId })
      page.header.userName().should('contain.text', 'J. Smith')
    })

    it('Should display the phase banner in header', () => {
      const page = Page.visit(ContactInformationCheckYourAnswersPage, { orderId: mockOrderId })
      page.header.phaseBanner().should('contain.text', 'dev')
    })

    it('Should render the save and continue, and return buttons', () => {
      const page = Page.visit(ContactInformationCheckYourAnswersPage, { orderId: mockOrderId })

      page.continueButton().should('exist')
      page.returnButton().should('exist')
    })

    it('Should be accessible', () => {
      const page = Page.visit(ContactInformationCheckYourAnswersPage, { orderId: mockOrderId })
      page.checkIsAccessible()
    })
  })

  context('Device Wearer has no fixed address', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { name: 'john smith', roles: ['ROLE_EM_CEMO__CREATE_ORDER'] })

     

      cy.signIn()
    })

    it('should not show addresses section', () => {
      cy.task('stubCemoGetOrder', {
        httpStatus: 200,
        id: mockOrderId,
        status: 'IN_PROGRESS',
        order: {
          contactDetails: {
            contactNumber: '01234567890'            
          },
          deviceWearer: {
            nomisId: null,
            pncId: null,
            deliusId: null,
            prisonNumber: null,
            homeOfficeReferenceNumber: null,
            firstName: null,
            lastName: null,
            alias: null,
            adultAtTimeOfInstallation: null,
            sex: null,
            gender: null,
            dateOfBirth: null,
            disabilities: null,
            noFixedAbode: true,
            interpreterRequired: null,
          },
          addresses: [{
              addressType: 'RESPONSIBLE_ORGANISATION',
              addressLine1: 'line1',
              addressLine2: 'line2',
              addressLine3: 'line3',
              addressLine4: 'line4',
              postcode: 'postcode',
            }],
          interestedParties:{
            notifyingOrganisation: 'HOME_OFFICE',
            notifyingOrganisationName: '',
            notifyingOrganisationEmail: 'notifying@organisation',
            responsibleOrganisation: 'POLICE',
            responsibleOrganisationPhoneNumber: '01234567890',
            responsibleOrganisationEmail: 'responsible@organisation',
            responsibleOrganisationRegion: '',
            responsibleOrganisationAddress: {
              addressType: 'RESPONSIBLE_ORGANISATION',
              addressLine1: 'line1',
              addressLine2: 'line2',
              addressLine3: 'line3',
              addressLine4: 'line4',
              postcode: 'postcode',
            },
            responsibleOfficerName: 'name',
            responsibleOfficerPhoneNumber: '01234567891',
          }
        },
      })
      const page = Page.visit(ContactInformationCheckYourAnswersPage, { orderId: mockOrderId })

      page.contactDetailsSection.shouldExist()
      page.contactDetailsSection.shouldHaveItems([
        { key: "What is the device wearer's telephone number? (optional)", value: '01234567890' },       
      ])
      
      page.deviceWearerAddressesSection.shouldExist()
      page.deviceWearerAddressesSection.shouldHaveItems([
        { key: 'Does the device wearer have a fixed address?', value: 'No' },        
      ])

      page.deviceWearerAddressesSection.shouldNotHaveItems([
        "What is the device wearer's main address?",
        "What is the device wearer's second address?",
        "What is the device wearer's third address?",
      ])
      page.organisationDetailsSection.shouldExist()
      page.organisationDetailsSection.shouldHaveItems([
        { key: 'What organisation or related organisation are you part of?', value: 'Home Office' },    
        { key: "What is your team's contact email address?", value: 'notifying@organisation' }, 
        { key: "What is the Responsible Officer's full name?", value: 'name' }, 
        { key: "What is the Responsible Officer's telephone number?", value: '01234567891' }, 
        { key: "What is the Responsible Officer's organisation?", value: 'Police' }, 
        { key: "What is the Responsible Organisation's address? (optional)", value: 'line1, line2, postcode' }, 
        { key: "What is the Responsible Organisation's telephone number? (optional)", value: '01234567890' }, 
        { key: "What is the Responsible Organisation's email address? (optional)", value: 'responsible@organisation' },     
      ])
      page.deviceWearerAddressesSection.shouldNotHaveItems([
        "Select the name of the Crown Court",
        "Select the name of the Court",
        "Select the name of the Prison",
        "Select the Probation region",
      ])

    })

    it('should show prison name', () => {
      cy.task('stubCemoGetOrder', {
        httpStatus: 200,
        id: mockOrderId,
        status: 'IN_PROGRESS',
        order: {
          contactDetails: {
            contactNumber: '01234567890'            
          },
          deviceWearer: {
            nomisId: null,
            pncId: null,
            deliusId: null,
            prisonNumber: null,
            homeOfficeReferenceNumber: null,
            firstName: null,
            lastName: null,
            alias: null,
            adultAtTimeOfInstallation: null,
            sex: null,
            gender: null,
            dateOfBirth: null,
            disabilities: null,
            noFixedAbode: true,
            interpreterRequired: null,
          },
          addresses: [{
              addressType: 'RESPONSIBLE_ORGANISATION',
              addressLine1: 'line1',
              addressLine2: 'line2',
              addressLine3: 'line3',
              addressLine4: 'line4',
              postcode: 'postcode',
            }],
          interestedParties:{
            notifyingOrganisation: 'PRISON',
            notifyingOrganisationName: 'BEDFORD_PRISON',
            notifyingOrganisationEmail: 'notifying@organisation',
            responsibleOrganisation: 'POLICE',
            responsibleOrganisationPhoneNumber: '01234567890',
            responsibleOrganisationEmail: 'responsible@organisation',
            responsibleOrganisationRegion: '',
            responsibleOrganisationAddress: {
              addressType: 'RESPONSIBLE_ORGANISATION',
              addressLine1: 'line1',
              addressLine2: 'line2',
              addressLine3: 'line3',
              addressLine4: 'line4',
              postcode: 'postcode',
            },
            responsibleOfficerName: 'name',
            responsibleOfficerPhoneNumber: '01234567891',
          }
        },
      })
      const page = Page.visit(ContactInformationCheckYourAnswersPage, { orderId: mockOrderId })

      
      page.organisationDetailsSection.shouldExist()
      page.organisationDetailsSection.shouldHaveItems([
        { key: 'What organisation or related organisation are you part of?', value: 'Prison' },    
        { key: 'Select the name of the Prison', value: 'Bedford Prison' },         
      ])
      page.deviceWearerAddressesSection.shouldNotHaveItems([
        "Select the name of the Crown Court",
        "Select the name of the Court",       
        "Select the Probation region",
      ])

    })

    it('should show Crown court name', () => {
      cy.task('stubCemoGetOrder', {
        httpStatus: 200,
        id: mockOrderId,
        status: 'IN_PROGRESS',
        order: {
          contactDetails: {
            contactNumber: '01234567890'            
          },
          deviceWearer: {
            nomisId: null,
            pncId: null,
            deliusId: null,
            prisonNumber: null,
            homeOfficeReferenceNumber: null,
            firstName: null,
            lastName: null,
            alias: null,
            adultAtTimeOfInstallation: null,
            sex: null,
            gender: null,
            dateOfBirth: null,
            disabilities: null,
            noFixedAbode: true,
            interpreterRequired: null,
          },
          addresses: [{
              addressType: 'RESPONSIBLE_ORGANISATION',
              addressLine1: 'line1',
              addressLine2: 'line2',
              addressLine3: 'line3',
              addressLine4: 'line4',
              postcode: 'postcode',
            }],
          interestedParties:{
            notifyingOrganisation: 'CROWN_COURT',
            notifyingOrganisationName: 'YORK_CROWN_COURT',
            notifyingOrganisationEmail: 'notifying@organisation',
            responsibleOrganisation: 'POLICE',
            responsibleOrganisationPhoneNumber: '01234567890',
            responsibleOrganisationEmail: 'responsible@organisation',
            responsibleOrganisationRegion: '',
            responsibleOrganisationAddress: {
              addressType: 'RESPONSIBLE_ORGANISATION',
              addressLine1: 'line1',
              addressLine2: 'line2',
              addressLine3: 'line3',
              addressLine4: 'line4',
              postcode: 'postcode',
            },
            responsibleOfficerName: 'name',
            responsibleOfficerPhoneNumber: '01234567891',
          }
        },
      })
      const page = Page.visit(ContactInformationCheckYourAnswersPage, { orderId: mockOrderId })

      
      page.organisationDetailsSection.shouldExist()
      page.organisationDetailsSection.shouldHaveItems([
        { key: 'What organisation or related organisation are you part of?', value: 'Crown Court' },    
        { key: 'Select the name of the Crown Court', value: 'York Crown Court' },         
      ])
      page.deviceWearerAddressesSection.shouldNotHaveItems([
        "Select the name of the Prison",
        "Select the name of the Court",       
        "Select the Probation region",
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
