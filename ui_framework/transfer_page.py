from ui_framework.base_page import BasePage
import allure

class TransferPage(BasePage):
    def __init__(self, page):
        super().__init__(page)
        self.recipient_name_field = page.locator("#transfer-receiver")
        self.amount_field = page.locator("#transfer-amount")
        self.category_list = page.locator("#transfer-category")
        self.transfer_comment = page.locator("#transfer-comment")
        self.send_transfer_button = page.get_by_role('button', name="Отправить перевод")
        self.transfer_status_message = page.locator("#transfer-status-message")

    @allure.step("Отправка перевода: {amount}, пользователю {recipient_name}")
    def send_the_transfer(self, amount: str, recipient_name: str, category: str = "general", comment: str = None):
            self.recipient_name_field.fill(recipient_name)
            self.amount_field.fill(amount)
            self.category_list.select_option(category)
            if comment:
                self.transfer_comment.fill(comment)
            self.send_transfer_button.click()
