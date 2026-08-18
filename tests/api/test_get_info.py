import allure
import pytest

@pytest.mark.smoke
@pytest.mark.api
@allure.feature("get user info")
def test_get_current_user_info(authorized_user, registered_user):
    response = authorized_user.get_user_info()
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["username"] == registered_user["username"], f"Ожидалоси имя {registered_user['username']}, но получили {json_response['username']}"
    assert "id" in json_response
    assert "balance" in json_response