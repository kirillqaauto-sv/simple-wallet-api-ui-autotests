import pytest
import allure
from api_framework.savings_api import SavingsApi


@pytest.mark.api
@pytest.mark.smoke
@allure.feature("Successful getting the list of users savings")
def test_get_list_of_savings(base_url, login_client, user_factory):
    ready_user = user_factory()
    login_user = login_client.login_user(ready_user["username"], ready_user["password"])
    assert login_user.status_code == 200, f"Не удалось залогиниться под пользователем {ready_user['username']}"
    token = login_user.json()["token"]
    savings = SavingsApi(base_url, token)
    response = savings.get_savings_list()
    assert response.status_code == 200, f"Неожиданный статус-код: {response.status_code}. 'Ожидался статус-код '200'"
    json_response = response.json()
    assert isinstance(json_response, list), f"В ответе ожидался список, но получен {type(json_response)}"
    assert len(json_response) == 0, f"Список копилок должен быть пуст у нового пользователя"
