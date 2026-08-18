import pytest
import allure
from faker import Faker

fake = Faker()
@pytest.mark.smoke
@pytest.mark.api
@allure.feature("Update user profile")
def test_update_user_profile(authorized_user):
    user = authorized_user
    changed_username = fake.user_name()
    response = user.patch_user_profile(changed_username)
    assert response.status_code == 200
    json_response = response.json()
    assert "message" in json_response, "В ответе отсутствует ожидаемый ключ 'message'"
    assert json_response["message"] == 'Profile updated', 'Ожидаемое сообщение не получено'
    check_response = user.get_user_info()
    assert check_response.status_code == 200
    check_json = check_response.json()
    assert check_json["username"] == changed_username, f'Ожидалось, что имя будет изменено на {changed_username}, но получено имя {check_json["username"]}'