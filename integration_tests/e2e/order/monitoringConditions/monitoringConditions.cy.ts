import { v4 as uuidv4 } from 'uuid'
import ErrorPage from '../../../pages/error'
import InstallationAndRiskPage from '../../../pages/order/installationAndRisk'
import Page from '../../../pages/page'

const mockOrderId = uuidv4()

context('Monitoring conditions main section', () => {
  context('Draft order', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { name: 'john smith', roles: ['ROLE_EM_CEMO__CREATE_ORDER'] })
      cy.task('stubCemoListOrders')
      cy.task('stubCemoGetOrder', { httpStatus: 200, id: mockOrderId, status: 'IN_PROGRESS' })
    })

    it('Should display the form', () => {
      cy.signIn().visit(`/order/${mockOrderId}/monitoring-conditions`)
      const page = Page.verifyOnPage(InstallationAndRiskPage)
      page.headerUserName().should('contain.text', 'J. Smith')
    })
  })

  context('Submitted Order', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { name: 'john smith', roles: ['ROLE_EM_CEMO__CREATE_ORDER'] })
      cy.task('stubCemoListOrders')
      cy.task('stubCemoGetOrder', { httpStatus: 200, id: mockOrderId, status: 'SUBMITTED' })
    })

    it('Should display the form', () => {
      // Implement once persistence is in place
      // cy.signIn().visit(`/order/${mockOrderId}/monitoring-conditions`)
      // const page = Page.verifyOnPage(InstallationAndRiskPage)
      // page.saveAndContinueButton().should('not.exist')
      // page.saveAndReturnButton().should('not.exist')
      // page.backToSummaryButton().should('exist').should('have.attr', 'href', `/order/${mockOrderId}/summary`)
    })
  })

  context('Unhealthy backend', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { name: 'john smith', roles: ['ROLE_EM_CEMO__CREATE_ORDER'] })
      cy.task('stubCemoListOrders')
      cy.task('stubCemoGetOrder', { httpStatus: 404 })
    })

    it('Should indicate to the user that there was an error', () => {
      cy.signIn().visit(`/order/${mockOrderId}/monitoring-conditions`, { failOnStatusCode: false })

      Page.verifyOnPage(ErrorPage, 'Not Found')
    })
  })
})
