from ui_framework.base_page import BasePage

class DashboardPage(BasePage):
    def __init__(self, page):
        super().__init__(page)
        self.greeting_message = page.locator("h2[class^='greeting']")
        self.topup_button = page.locator("#topup-button")
        self.username_field = page.locator("p[class^='username']")
        self.exit_button = page.get_by_role("button", name='Выйти')
        self.balance_value = page.locator("span[class^='balance-value']")
        self.search_write_off_field = page.locator("#transaction-search")
        self.search_filter_button = page.locator("#toggle-filters")
