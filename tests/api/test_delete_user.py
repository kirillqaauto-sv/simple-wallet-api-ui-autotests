import pytest
import allure


@pytest.mark.api
@pytest.mark.smoke
@allure.feature("Delete user")
def test_delete_user(registered_user, authorized_admin_client):
    register_response = registered_user
    user_id = register_response["id"]
    response = authorized_admin_client.delete_user(user_id)
    assert response.status_code == 200, 'Не удалось удалить пользователя'
    json_response = response.json()
    assert 'message' in json_response
    assert json_response["message"] == 'User deleted successfully', "Сообщение об успешном удалении пользователя не получено"


INCORRECT_DELETE_DATA = [
    ("incorrect_id", 500, "error", "Failed to delete user"),
    (None, 500, "error", "Failed to delete user"),
    (999, 200, "message", "User deleted successfully"),
]
@pytest.mark.api
@pytest.mark.smoke
@allure.feature("Try to delete user with incorrect data")
@pytest.mark.parametrize("user_id, status_code, key, expected_text", INCORRECT_DELETE_DATA)
def test_try_to_delete_user_with_incorrect_data( authorized_admin_client, user_id, status_code, key, expected_text):
    response = authorized_admin_client.delete_user(user_id)
    assert response.status_code == status_code, f'Ожидали статус код "500", но получили {response.status_code}'
    json_response = response.json()
    assert key in json_response
    assert json_response[key] == expected_text