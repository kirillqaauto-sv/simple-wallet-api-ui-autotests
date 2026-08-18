from api_framework.base_api import BaseApi
import allure

class TransactionsApi(BaseApi):
    TRANSACTIONS_HISTORY_ENDPOINT = "/api/transactions"
    TRANSFER_ENDPOINT = "/api/transactions/transfer"

    def __init__(self, base_url, token):
        super().__init__(base_url)
        self.session.headers.update({"Authorization":f"Bearer {token}"})

    @allure.step("Get history of transactions. Filters: search='{search}', category='{category}', type='{transaction_type}'")
    def get_transactions_history(self, search: str = None, category: str = None, transaction_type: str = None):
        params = {
            "search": search,
            "category": category,
            "type": transaction_type
        }

        cleaned_params = {k:v for k, v in params.items() if v is not None}

        response = self.get_request(self.TRANSACTIONS_HISTORY_ENDPOINT, params = cleaned_params)
        return response

    @allure.step("Transfer funds")
    def transfer_funds(self, receiverUsername: str, amount: float, description: str = None, category: str = None):
        payloads = {
            "receiverUsername":  receiverUsername,
            "amount": amount,
            "description": description,
            "category": category
        }

        cleaned_payloads = {k:v for k, v in payloads.items() if v is not None}
        response = self.post_request(self.TRANSFER_ENDPOINT, json=cleaned_payloads)
        return response

