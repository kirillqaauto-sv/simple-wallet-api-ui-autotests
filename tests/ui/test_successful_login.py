from ui_framework import dashboard_page
from ui_framework.login_page import LoginPage
from ui_framework.dashboard_page import DashboardPage
from playwright.sync_api import expect
import pytest


@pytest.mark.ui
def test_successful_login(page, registered_user, base_url):
    login_page = LoginPage(page)
    board_page = DashboardPage(page)
    login_page.go_to(f"{base_url}/login")
    username = registered_user["username"]
    password = registered_user["password"]
    login_page.login(username, password)
    expect(page, "Полученный URL не соответствует ожидаемому").to_have_url(f"{base_url}/")
    expect(board_page.greeting_message, "Приветственное сообщение не соответствует ожидаемому").to_have_text(f"Привет, {username}!")
    expect(board_page.topup_button, "Не найдена кнопка пополнения баланса").to_be_visible()
    expect(board_page.exit_button, "Кнопка выхода из аккаунта не обнаружена").to_be_visible()
    expect(board_page.username_field, "Имя пользователя не соответствует владельцу аккаунта").to_have_text(f"{username}")

