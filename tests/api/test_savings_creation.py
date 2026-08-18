import pytest
import allure
from api_framework.savings_api import SavingsApi
from faker import Faker
from jsonschema import validate

fake = Faker()
schema = {
    "type":"object",
    "properties":{
        "id":{"type":"integer"},
        "userId":{"type":"integer"},
        "name":{"type":"string"},
        "balance":{"type":"string"},
        "target":{"type":["string", "null"]},
        "createdAt":{"type":"string"}
    },
    "required": ["id", "userId", "name", "balance", "createdAt"],
    "additionalProperties": False
}


@pytest.mark.api
@pytest.mark.smoke
@allure.step("Savings creation")
def test_savings_creation(base_url, login_client, user_factory):
    ready_user = user_factory()
    login_user = login_client.login_user(ready_user["username"], ready_user["password"])
    assert login_user.status_code == 200, f"Не удалось залогиниться"
    user_token = login_user.json()["token"]
    savings_client = SavingsApi(base_url, user_token)
    savings_name = fake.name_nonbinary()

    response = savings_client.create_new_saving(savings_name)
    assert response.status_code == 201, f"Ожидался статус-код '201', но получен '{response.status_code}'"
    json_response = response.json()
    validate(instance=json_response, schema = schema)
    assert json_response['name'] == savings_name, f"Название копилки должно было быть {savings_name}, но в ответе пришло {json_response['name']}"
    assert json_response['userId'] == ready_user['id'], f'Копилка должна принадлежать пользователю с id: {ready_user['id']}, но в ответе id: {json_response['user_id']}'