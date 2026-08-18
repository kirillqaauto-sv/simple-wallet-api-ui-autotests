from ui_framework.base_page import BasePage
import allure

class LoginPage(BasePage):
    def __init__(self, page):
        super().__init__(page)
        self.username_input = page.get_by_placeholder("ivan_ivanov")
        self.password_input = page.get_by_placeholder("••••••••")
        self.enter_button = page.locator("button[class*='inline-flex']")
        self.error_message = page.locator("p[class^='message']")


    @allure.step("Авторизация пользователя {username}")
    def login(self, username, password):
        self.username_input.fill(username)
        self.password_input.fill(password)
        self.enter_button.click()

    def get_error_message(self):
        return self.error_message.inner_text()
