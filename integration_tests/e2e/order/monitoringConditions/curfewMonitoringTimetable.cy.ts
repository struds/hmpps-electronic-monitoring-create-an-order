import { v4 as uuidv4 } from 'uuid'
import ErrorPage from '../../../pages/error'
import CurfewDatesPage from '../../../pages/order/curfewDates'
import CurfewTimetablePage from '../../../pages/order/curfewTimetable'
import Page from '../../../pages/page'

const mockOrderId = uuidv4()

context('Curfew monitoring - Timetable', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { name: 'john smith', roles: ['ROLE_EM_CEMO__CREATE_ORDER'] })
    cy.task('stubCemoListOrders')
  })

  context('Draft order', () => {
    beforeEach(() => {
      cy.task('stubCemoGetOrder', { httpStatus: 200, id: mockOrderId, status: 'IN_PROGRESS' })
    })

    it.only('Should display the timetable form', () => {
      cy.signIn().visit(`/order/${mockOrderId}/monitoring-conditions/curfew/timetable`)
      const page = Page.verifyOnPage(CurfewDatesPage)
      page.subHeader().should('contain.text', 'Timetable for curfew with electronic monitoring')
      page.header.userName().should('contain.text', 'J. Smith')
    })
  })

  context('Submitted Order', () => {
    beforeEach(() => {
      cy.task('stubCemoGetOrder', {
        httpStatus: 200,
        id: mockOrderId,
        status: 'SUBMITTED',
        order: mockSubmittedTimetable,
      })
    })

    it('Should correctly display the submitted data in disabled fields', () => {
      cy.signIn().visit(`/order/${mockOrderId}/monitoring-conditions/curfew/timetable`)
      const page = Page.verifyOnPage(CurfewTimetablePage)
      page.submittedBanner().should('contain', 'You are viewing a submitted order.')
      cy.get('input[type="text"]').each($el => {
        cy.wrap($el).should('be.disabled')
      })
      cy.get('input[type="checkbox"]').each($el => {
        cy.wrap($el).should('be.disabled')
      })
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
