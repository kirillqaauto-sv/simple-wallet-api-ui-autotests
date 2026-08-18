from ui_framework.login_page import LoginPage
from ui_framework.transfer_page import TransferPage
from playwright.sync_api import expect
import pytest


@pytest.mark.ui
def test_successful_transfer(page, base_url, user_factory):
    login_page = LoginPage(page)
    transfer_page = TransferPage(page)
    user = user_factory()
    login_page.go_to(f"{base_url}/login")
    login_page.login(user['username'], user['password'])
    login_page.go_to(f"{base_url}/transfer")
    transfer_page.send_the_transfer("10", "kirsonline91@gmail.com", "other", "present")
    expect(transfer_page.transfer_status_message).to_be_visible()
    expect(transfer_page.transfer_status_message, "Succsessful message expected").to_contain_text("Перевод успешно выполнен!")