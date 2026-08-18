import pytest
from faker import Faker
import os
from dotenv import load_dotenv

from api_framework.login_api import LoginAPI
from api_framework.registration_api import RegistrationApi
from api_framework.user_actions_api import UserActionsApi
from api_framework.admin_api import AdminApi
from api_framework.transactions_api import TransactionsApi
from api_framework.savings_api import SavingsApi
from helpers.db_helper import DbHelper

load_dotenv()
fake = Faker()


@pytest.fixture(scope="session")
def db_connect():
    return DbHelper()


@pytest.fixture(scope="session")
def base_url():
    url = os.getenv('BASE_URL')
    if not url:
        raise ValueError("В файле .env отсутствует переменная 'BASE_URL'!")
    return url


@pytest.fixture
def registration_client(base_url):
    return RegistrationApi(base_url)


@pytest.fixture
def login_client(base_url):
    return LoginAPI(base_url)


@pytest.fixture
def user_actions_client(base_url):
    return UserActionsApi(base_url)


@pytest.fixture
def get_info_user(user_actions_client):
    return user_actions_client.get_user_info().json()["id"]


@pytest.fixture
def admin_client(base_url):
    return AdminApi(base_url)


@pytest.fixture
def deleting_user(admin_client, get_info_user):
    id = get_info_user
    return admin_client.delete_user(id)


@pytest.fixture
def registered_user(registration_client, db_connect):
    username = fake.user_name()
    password = fake.password()

    response = registration_client.registration_user(username, password)
    assert response.status_code == 201, 'Не удалось зарегистрировть пользователя'
    user_row = db_connect.fetch_one("SELECT id FROM users WHERE username = %s;", (username,))
    user_id = user_row[0]
    json_response = response.json()
    assert "message" in json_response, "В ответе отсутствует необходимый ключ 'message'"
    assert json_response["message"] == "User created", "Сообщение об успешной регистрации не получено"

    yield {"username": username, "password": password, "id": user_id}
    db_connect.execute_query(
        "DELETE FROM users WHERE id = %s;", (user_id,))


@pytest.fixture
def authorized_user(base_url, login_client, registered_user):
    response = login_client.login_user(
        registered_user["username"],
        registered_user["password"]
    )

    assert response.status_code == 200, "Не удалось войти в систему"

    token = response.json()["token"]
    return UserActionsApi(base_url, token)

@pytest.fixture
def login_admin_user(login_client):
    admin_username = "SuperUser"
    admin_password = "111111"

    response = login_client.login_user(admin_username, admin_password)
    assert response.status_code == 200, "Не удалось войти в систему как администратор"
    token = response.json()["token"]
    return token

@pytest.fixture
def authorized_admin_client(base_url, login_admin_user):
    return AdminApi(base_url, login_admin_user)

@pytest.fixture
def transactions_client(base_url):
    return TransactionsApi(base_url)

@pytest.fixture
def user_factory(base_url, registration_client, db_connect):
    created_user_ids = []
    def make_user():
        username = fake.user_name()
        password = fake.password()
        response = registration_client.registration_user(username, password)
        assert response.status_code == 201, "Не удалось зарегистрировать пользователя"
        user_row = db_connect.fetch_one("SELECT id FROM users WHERE username=%s;", (username,))
        user_id = user_row[0]
        created_user_ids.append(user_id)
        ready_user = {"username": username, "password": password, "id": user_id}
        return  ready_user
    yield make_user
    for user_id in created_user_ids:
        db_connect.execute_query(
            "DELETE FROM transactions WHERE sender_id = %s OR receiver_id = %s;",
            (user_id, user_id)
        )
        db_connect.execute_query(
            "DELETE FROM savings_accounts WHERE user_id = %s;",
            (user_id,)
        )
        db_connect.execute_query("DELETE FROM users WHERE id = %s;", (user_id,))
