
describe('Restaurant Reservation', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/'); // Adjust the URL to match your application
  });

  it('verifies location filter components are visible', () => {
    cy.get('div#state').should('be.visible'); // Verify the State dropdown is present
    cy.get('div#city').should('be.visible'); // Verify the City dropdown is present
  });

  it('displays restaurant search results after selecting location', () => {
    cy.intercept('GET', 'https://restaurantdata.onrender.com/restaurants?state=Texas&city=Austin', {
      fixture: 'restaurants.json',
    }).as('getRestaurants');
  
    cy.get('div#state').click(); // Open state dropdown
    cy.contains('li', 'Texas', { timeout: 5000 }).click(); // Wait for state options to load and select Texas
  
    cy.get('div#city').click(); // Open city dropdown
    cy.contains('li', 'Austin', { timeout: 5000 }).click(); // Wait for city options to load and select Austin
  
    cy.get('button[type="submit"]').should('contain.text', 'Search').click({multiple: true});
    cy.wait('@getRestaurants');
    cy.get('h1').should('contain.text', '2 restaurants available in Austin');
  });
  

  it('shows reservation button on restaurant cards', () => {
    cy.intercept('GET', 'https://restaurantdata.onrender.com/restaurants?state=Texas&city=Austin', {
      fixture: 'restaurants.json', // Use a mock JSON response file
    }).as('getRestaurants');

    cy.get('div#state') // Replace with the selector for the state dropdown
    .click();
    cy.contains('li', 'Texas') // Replace with a valid state option
    .click();
    cy.get('div#city')
    .click();
    cy.contains('li', 'Austin') // Replace with a valid city option
    .click();

    cy.get('button[type="submit"]').should('contain.text', 'Search').click({multiple: true});

    cy.wait('@getRestaurants');
    cy.get('button').contains('Book FREE Reservation').should('be.visible');
  });
  
  it('displays time slots and date options when booking a restaurant', () => {
    cy.intercept('GET', 'https://restaurantdata.onrender.com/restaurants?state=Texas&city=Austin', {
      fixture: 'restaurants.json', // Use a mock JSON response file
    }).as('getRestaurants');

    cy.get('div#state') // Replace with the selector for the state dropdown
    .click();
    cy.contains('li', 'Texas') // Replace with a valid state option
    .click();
    cy.get('div#city')
    .click();
    cy.contains('li', 'Austin') // Replace with a valid city option
    .click();

    cy.get('button[type="submit"]').should('contain.text', 'Search').click({multiple: true});

    cy.wait('@getRestaurants');
    cy.get('button').contains('Book FREE Reservation')
    .click();
    cy.get('p').contains('Today')
    cy.get('p').contains('Morning')
    cy.get('p').contains('Afternoon')
    cy.get('p').contains('Evening')
  });
  
  it('should render the My Bookings page with header correctly', () => {
    // Navigate to the "My Bookings" page
    cy.visit('http://localhost:3000/my-bookings'); // Replace with the actual URL for the My Bookings page
    cy.get('h1').contains('My Bookings')
  });


  it('should maintain restaurant booking data in localStorage across page refreshes', () => {
    const mockBookings = [
      {
        "restaurantName": "Austin Food Expo",
        "rating": 4,
        "address": "555 Main St, Austin, Texas",
        "city": "Austin",
        "state": "Texas",
        "bookingDate": "2025-03-27T18:30:00.000Z",
        "bookingTime": "10:00 AM",
        "bookingEmail": "hello@gmail.com"
      },
    ];
  
    cy.window().then((win) => {
      win.localStorage.setItem('bookings', JSON.stringify(mockBookings));
    });
  
    cy.visit('http://localhost:3000/my-bookings'); // Replace with actual My Bookings URL
  
    cy.get('h3')
      .contains('Austin Food Expo', { timeout: 5000 })
      .should('be.visible');
  
    cy.reload();
    cy.get('h3')
      .contains('Austin Food Expo', { timeout: 5000 })
      .should('be.visible');
  });
  

  
});

