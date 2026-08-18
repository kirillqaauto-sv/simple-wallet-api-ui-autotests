import pytest
import allure
from faker import Faker

fake = Faker()

INCORRECT_REG_DATA = [
    ("", "valid_passw1", 400, "Missing username or password"),
    ("valid_name", "", 400, "Missing username or password"),
    ("", "", 400, "Missing username or password"),
    ("correct_user", None, 400, "Missing username or password"),
    (None, "correct_passw", 400, "Missing username or password")
]


@pytest.mark.smoke
@pytest.mark.api
@allure.feature("Registration of a new user")
def test_successful_new_user_registration(registration_client, db_connect):
    username = fake.user_name()
    password = fake.password()

    try:
        response = registration_client.registration_user(username, password)
        assert response.status_code == 201, f"Unexpected status code {response.status_code}"
        json_response = response.json()
        assert "message" in json_response, f"Key 'message' in not found in response"
        assert json_response[
            'message'] == 'User created', f'Message "User created" expected, but got {json_response["message"]}'
    finally:
        db_connect.execute_query(
            "DELETE FROM users WHERE username = %s", (username,))


@pytest.mark.smoke
@pytest.mark.api
@pytest.mark.parametrize("username, password, expected_status, expected_error", INCORRECT_REG_DATA)
def test_register_with_incorrect_data(registration_client, username, password, expected_status, expected_error):
    response = registration_client.registration_user(username, password)
    assert response.status_code == expected_status, f"Expecting status {expected_status}, but got {response.status_code}"
    json_response = response.json()
    assert "error" in json_response, "There's no 'error' in response"
    assert json_response['error'] == expected_error, "Unexpected error message"
