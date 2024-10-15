import { v4 as uuidv4 } from 'uuid'
import ErrorPage from '../../../pages/error'
import CurfewDatesPage from '../../../pages/order/curfewDates'
import Page from '../../../pages/page'

const mockOrderId = uuidv4()

context('Curfew monitoring - Dates', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { name: 'john smith', roles: ['ROLE_EM_CEMO__CREATE_ORDER'] })
    cy.task('stubCemoListOrders')
  })

  context('Draft order', () => {
    beforeEach(() => {
      cy.task('stubCemoGetOrder', { httpStatus: 200, id: mockOrderId, status: 'IN_PROGRESS' })
    })

    it('Should display the dates form', () => {
      cy.signIn().visit(`/order/${mockOrderId}/monitoring-conditions/curfew/dates`)
      const page = Page.verifyOnPage(CurfewDatesPage)
      page.subHeader().should('contain.text', 'Curfew with electronic monitoring')
      page.header.userName().should('contain.text', 'J. Smith')
    })
  })

  context('Submitted Order', () => {
    beforeEach(() => {
      cy.task('stubCemoGetOrder', {
        httpStatus: 200,
        id: mockOrderId,
        status: 'SUBMITTED',
        order: mockSubmittedCurfewMonitoring,
      })
    })

    it('Should correctly display the submitted data in disabled fields', () => {
      cy.signIn().visit(`/order/${mockOrderId}/monitoring-conditions/attendance/${mockConditionId}`)
      const page = Page.verifyOnPage(AttendanceMonitoringPage)
      page.submittedBanner().should('contain', 'You are viewing a submitted order.')
      cy.get('input[type="text"]').each($el => {
        cy.wrap($el).should('be.disabled')
      })
      cy.get('input[type="number"]').each($el => {
        cy.wrap($el).should('be.disabled')
      })
      checkFormFields()
      page.saveAndContinueButton().should('not.exist')
      page.saveAndReturnButton().should('not.exist')
      page.backToSummaryButton().should('exist').should('have.attr', 'href', `/order/${mockOrderId}/summary`)
    })
  })

  context('Unhealthy backend', () => {
    beforeEach(() => {
      cy.task('stubCemoGetOrder', { httpStatus: 404 })
    })

    it('Should indicate to the user that there was an error', () => {
      cy.signIn().visit(`/order/${mockOrderId}/monitoring-conditions/curfew-day-of-release`, {
        failOnStatusCode: false,
      })

      Page.verifyOnPage(ErrorPage, 'Not Found')
    })
  })
})
