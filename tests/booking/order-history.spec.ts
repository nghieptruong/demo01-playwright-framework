import { expect, test } from "../../fixtures/custom-fixtures";
import { AccountPage } from "../../pages/AccountPage";
import { ShowtimePage } from "../../pages/ShowtimePage";
import { getSampleShowtimesWithAvailableSeats } from "../utils/bookingSampleProvider";
import { AccountDataApi } from "../../api/users/accounts.types";
import { createTestUserForAccountFormTest, deleteTestUser } from "../utils/testUserProvider";
import { loginAndGoToHomePage } from "../utils/shared.helpers";
import { pickRandomNumberBetween } from "../utils/dataManipulation.helpers";

test.describe('Order History Verification', () => {

  let accountPage: AccountPage;
  let testUser: AccountDataApi;
  let showtimePage: ShowtimePage;
  let sampleShowtimeId: string;
  let initialOrderCount: number;
  let newOrder: { movieTitle: string; bookedSeats: string[]; price: string };

  test.beforeEach(async ({ page, loginPage }) => {
    await test.step('Find sample showtimes with available seats to run test', async () => {
      showtimePage = new ShowtimePage(page);
      const numSeatsRequired = pickRandomNumberBetween(1, 8);

      // Default if not specified: 1 sample
      const sampleShowtimeIds = await getSampleShowtimesWithAvailableSeats({ seatQuantity: numSeatsRequired });
      test.skip(sampleShowtimeIds.length === 0, 'Test skipped: No showtimes with available seats found.');
      sampleShowtimeId = sampleShowtimeIds[0];
    });

    await test.step('Login as new test user and navigate to account page', async () => {
      // Using specific user generator due to known issue with special characters and spaces in name field
      testUser = await createTestUserForAccountFormTest();
      await loginAndGoToHomePage(loginPage, testUser);

      accountPage = new AccountPage(page);
      await accountPage.navigateToAccountPage();
      await accountPage.waitForOrderHistoryPanel();
    });
  });

  test('Order History displays new booking data correctly @regression', async () => {

    await test.step('Get initial order count', async () => {
      initialOrderCount = await accountPage.orderHistory.countOrders();
    });

    await test.step(`Go to booking page of showtime ${sampleShowtimeId} and complete a booking`, async () => {
      await showtimePage.navigateToShowtimePageAndWaitForSeatMap(sampleShowtimeId);

      newOrder = await showtimePage.selectSeatsAndCollectOrderDetails();  // default: 2 seats
      await showtimePage.clickBookTickets();
      await showtimePage.exitSuccessAlert();
    });

    await test.step('Verify order history updated correctly', async () => {
      const { movieTitle, bookedSeats, price } = newOrder;

      // Go to account page to verify order history update
      await accountPage.navigateToAccountPage();

      // Assertion 1: Order count increased by 1
      await expect.poll(async () => {
        return await accountPage.orderHistory.countOrders();
      }, { timeout: 5000 }
      ).toBe(initialOrderCount + 1);

      // Assertion 2: Last displayed order match the booking details
      const uiLastOrder = await accountPage.orderHistory.getLastOrderDetails();

      expect.soft(uiLastOrder.movieTitle, 'Incorrect movie title').toBe(movieTitle);
      expect.soft(uiLastOrder.bookedSeats, 'Incorrect seat numbers').toEqual(bookedSeats);
      expect.soft(uiLastOrder.price, 'Incorrect price').toBe(price);
    });
  })
})
