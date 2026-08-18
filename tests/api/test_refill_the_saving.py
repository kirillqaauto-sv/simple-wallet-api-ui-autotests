import pytest
import allure
from api_framework.savings_api import SavingsApi
from faker import Faker

fake = Faker()

@pytest.mark.api
@pytest.mark.smoke
@allure.step("Change the savings deposit")
def test_refill_the_saving(base_url, login_client, user_factory):
    ready_user = user_factory()
    login_user = login_client.login_user(ready_user["username"], ready_user["password"])
    assert login_user.status_code == 200, f"Не удалось залогиниться"
    user_token = login_user.json()["token"]
    savings_client = SavingsApi(base_url, user_token)
    savings_name = fake.name_nonbinary()
    created_saving = savings_client.create_new_saving(savings_name)
    assert created_saving.status_code == 201, "Не удалось создат копилку"
    saving_id = created_saving.json()["id"]
    response = savings_client.refill_the_saving(saving_id, 200)
    assert response.status_code == 200, f"Ожидался статус код 200, но получен {response.status_code}"
    json_response = response.json()
    assert "message" in json_response, "В ответе отсутствует необходимый ключ 'message'"
    assert json_response["message"] == 'Deposit successful', f"Не получен ожидаемый ответ 'Deposit successful'"