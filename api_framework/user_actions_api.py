from api_framework.base_api import BaseApi
import allure


class UserActionsApi(BaseApi):
    GET_INFO_ENDPOINT = "/api/user/me"
    PATCH_PROFILE_ENDPOINT = "/api/user/profile"
    TOP_BALANCE_ENDPOINT = "/api/user/topup"

    def __init__(self, base_url, token):
        super().__init__(base_url)
        self.session.headers.update({"Authorization": f"Bearer {token}"})

    @allure.step("Get user info")
    def get_user_info(self):
        return self.get_request(self.GET_INFO_ENDPOINT)

    @allure.step("PATCH user profile")
    def patch_user_profile(self, username: str):
        payload = {"username": username}
        return self.patch_request(self.PATCH_PROFILE_ENDPOINT, json=payload)

    @allure.step("Topup the balance")
    def topup_the_balance(self, amount: int):
        payload = {"amount": amount}
        return self.post_request(self.TOP_BALANCE_ENDPOINT, json=payload)
