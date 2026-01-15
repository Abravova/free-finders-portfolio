describe('Search test', function () {
	it('searches and finds a watch', function () {
		cy.visit('http://localhost:5173');

		cy.get('.search-bar').type('watch');
		cy.contains('Search').click();
		cy.contains('watch', { matchCase: false }).should('be.visible');
	});

	it("searches and doesn't find winning lottery ticket", function () {
		cy.visit('http://localhost:5173');

		cy.get('.search-bar').type('winning lottery ticket');
		cy.contains('Search').click();
		cy.contains('no listings found', { matchCase: false }).should('be.visible');
	});
});
