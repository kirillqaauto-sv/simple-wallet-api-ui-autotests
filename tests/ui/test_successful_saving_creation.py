from playwright.sync_api import expect
from ui_framework.login_page import LoginPage
from ui_framework.saving_page import SavingPage
import pytest

@pytest.mark.ui
def test_successful_saving_creation(page, base_url,user_factory):
    login_page = LoginPage(page)
    saving_page = SavingPage(page)
    user = user_factory()
    login_page.go_to(f"{base_url}/login")
    login_page.login(user['username'], user['password'])
    login_page.go_to(f'{base_url}/savings')
    saving_page.create_the_saving("MyTestSaving", "5000")
    expect(saving_page.new_saving_area, "New saving area is not detected").to_be_visible()
    expect(saving_page.displayed_saving_name).to_have_text("MyTestSaving")

