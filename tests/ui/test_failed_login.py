import pytest
from ui_framework.login_page import LoginPage
from playwright.sync_api import expect


@pytest.mark.ui
def test_failed_login_with_incorrect_data(page, base_url):
    login_page = LoginPage(page)
    login_page.go_to(f'{base_url}/login')
    login_page.login("wrong_usr", "wrong_passw")
    error_message = login_page.get_error_message()
    expect(login_page.error_message, f"Ожидали ошибку 'Invalid credentials', а получили {error_message}").to_have_text("Invalid credentials")
    page.pause()
