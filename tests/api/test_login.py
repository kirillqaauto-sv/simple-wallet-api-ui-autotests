import pytest
import allure


@pytest.mark.smoke
@pytest.mark.api
@allure.feature("Successful login")
def test_successful_login(login_client, registered_user):
    username = registered_user["username"]
    password = registered_user["password"]

    response = login_client.login_user(username, password)
    assert response.status_code == 200, f'Unexpected status code: {response.status_code}'
    json_response = response.json()
    assert "token" in json_response, f"There's no any 'token' key in response"
    assert json_response['token'] is not None, 'Token should be non None'
    assert isinstance(json_response['token'],
                      str), "Token should be a string"
