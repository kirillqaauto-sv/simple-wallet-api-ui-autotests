import pytest
import allure
from jsonschema import validate

schema = {
    "type":"array",
    "items":{
        "type":"object",
        "properties": {
            "id": {"type":"integer"},
            "username":{"type":"string"},
            "balance":{"type":"string"},
            "createdAt":{"type":"string"},
        },
        "required": ["id", "username", "balance", "createdAt"],
        "additionalProperties": False
    }
  }

@pytest.mark.api
@pytest.mark.smoke
@allure.feature("Get list of all users")
def test_get_all_users(authorized_admin_client):
    response = authorized_admin_client.get_list_of_users()
    assert response.status_code == 200, "Не удалось получить список пользователей"
    json_response = response.json()
    validate(instance=json_response, schema=schema)