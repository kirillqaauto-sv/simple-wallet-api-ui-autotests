from playwright.sync_api import expect
from ui_framework.base_page import BasePage
import allure

class SavingPage(BasePage):
    def __init__(self, page):
        super().__init__(page)
        self.create_saving_button = page.locator("#create-savings-btn")
        self.create_first_button = page.get_by_role("button", name="Создать первую")
        self.modal_window = page.locator(".modal-content")
        self.saving_name_field = page.locator("#savings-name")
        self.saving_target_field = page.locator("#savings-target")
        self.creation_button = page.get_by_role('button', name='Создать', exact=True)
        self.new_saving_area = page.locator(".savings-card")
        self.displayed_saving_name = page.locator("h4[class^='account-name']")

    @allure.step("Saving creation...")
    def create_the_saving(self, name: str, target:str = None):
        self.create_saving_button.click()
        expect(self.modal_window, "Modal window for creation saving is not detected").to_be_visible()
        self.saving_name_field.fill(name)
        if target:
            self.saving_target_field.fill(target)
        self.creation_button.click()

