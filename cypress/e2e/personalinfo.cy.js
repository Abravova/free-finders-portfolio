describe('Personal info', function () {
	beforeEach(function () {
		cy.request('POST', '/login', {
			email: 'ryan.lauderbach@gmail.com',
			password: 'password',
		})
			.then((response) => {
				expect(response.body).to.have.property('token');
			})
			.its('body')
			.as('user');
	});

	it('should show personal info', function () {
		const { token } = this.user;

		cy.request({
			method: 'GET',
			url: '/user/me',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}).then((response) => {
			expect(response.body).to.have.property('email', 'ryan.lauderbach@gmail.com');
			expect(response.body).to.have.property('phone', 8312000000);
		});
	});

	it('should update the name with a random number', function () {
		const { token } = this.user;

		const randomNumber = Math.floor(Math.random() * 20);
		const newName = 'Ryan ' + randomNumber;

		cy.request({
			method: 'POST',
			url: '/user/update-name',
			headers: {
				Authorization: `Bearer ${token}`,
			},
			body: {
				newName: newName,
			},
		}).then((response) => {
			expect(response.body.user).to.have.property('email', 'ryan.lauderbach@gmail.com');
			expect(response.body.user).to.have.property('name', newName);
		});
	});
});
