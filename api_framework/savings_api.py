from api_framework.base_api import BaseApi
import allure

class SavingsApi(BaseApi):
    GET_SAVINGS_LIST_ENDPOINT = "/api/savings"
    CREATE_SAVING_ENDPOINT = "/api/savings"

    def __init__(self, base_url, token):
        super().__init__(base_url)
        self.session.headers.update({"Authorization":f"Bearer {token}"})

    @allure.step("Get the list of savings")
    def get_savings_list(self):
        response = self.get_request(self.GET_SAVINGS_LIST_ENDPOINT)
        return response

    @allure.step("Creating of a new saving")
    def create_new_saving(self, name: str, target: float = None):
        payload = {
            "name": name,
            "target": target
        }
        cleaned_payload = {k:v for k, v in payload.items() if v is not None}
        response = self.post_request(self.CREATE_SAVING_ENDPOINT, json = cleaned_payload)
        return response


    @allure.step("Refill the saving from the main bill. Amount: {amount}")
    def refill_the_saving(self, saving_id: int, amount: float):
        refill_endpoint = f"/api/savings/{saving_id}/deposit"
        response = self.post_request(refill_endpoint, json = {"amount": amount})
        return response