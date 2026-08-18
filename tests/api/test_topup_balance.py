import pytest
import allure

@pytest.mark.smoke
@pytest.mark.api
@allure.feature("Topup the balance")
def test_topup_the_balance(authorized_user):
    response = authorized_user.topup_the_balance(100)
    assert response.status_code == 200, f"Ожидали статус-код '200', но получили {response.status_code}"
    json_response = response.json()
    assert 'message' in json_response, 'В ответе отсутствует ожидаемый ключ "message"'
    assert json_response['message'] == "Balance updated", "Ожидаемое сообщение об успешном пополнении баланса не получено"


INCORRECT_DATA_FOR_BALANCE = [
    ("", 400, "Invalid amount"),
    (-200, 400, "Invalid amount"),
    (None,400, "Invalid amount")
]

@pytest.mark.smoke
@pytest.mark.api
@allure.feature("Try to topup the balance with incorrect data")
@pytest.mark.parametrize("amount, status_code, error", INCORRECT_DATA_FOR_BALANCE)
def test_failed_topup_the_balance(authorized_user, amount, status_code, error):
    response = authorized_user.topup_the_balance(amount)
    assert response.status_code == status_code
    json_response = response.json()
    assert json_response['error'] == error
