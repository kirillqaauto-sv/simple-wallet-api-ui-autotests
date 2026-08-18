import pytest
import allure
from api_framework.transactions_api import TransactionsApi

@pytest.mark.api
@pytest.mark.E2E
@allure.feature("Get the history of transactions")
def test_transactions_transfer_and_history(base_url, login_client, user_factory):
    sender = user_factory()
    recipient = user_factory()

    response = login_client.login_user(sender['username'], sender['password'])
    assert response.status_code == 200, f'Не удалось войти в систему под пользователем {sender["username"]}'
    token = response.json()['token']
    transaction_client = TransactionsApi(base_url, token)
    send_response = transaction_client.transfer_funds(recipient['username'], 200, 'Present')
    assert send_response.status_code == 200, f'Не удалось перевести деньги получателю {recipient["username"]}'
    check_transaction_response = transaction_client.get_transactions_history()
    assert check_transaction_response.status_code == 200, "Ожидаемый статус-код не получен"
    json_check_transaction_response = check_transaction_response.json()
    assert len(json_check_transaction_response) == 1, f'В истории транзакций ожидалась только одна запись, а получено {len(json_check_transaction_response)}'
    transaction = json_check_transaction_response[0]
    assert transaction['receiverId'] == recipient['id'], "ID получателя не совпадает с целевым"
    assert float(transaction["amount"]) == 200, "Отправляемая сумма не совпадает с целевой"
    assert transaction['description'] == "Present", "Описание транзакции не совпадает с целевой"


