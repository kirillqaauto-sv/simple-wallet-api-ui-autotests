from api_framework.base_api import BaseApi
import allure

class LoginAPI(BaseApi):
    LOG_ENDPOINT = "/api/auth/login"

    @allure.step("Login registered user")
    def login_user(self, username:str, password:str):
        payload = {"username": username, "password": password}
        headers = {"content-type": "application/json"}
        response = self.post_request(self.LOG_ENDPOINT, json=payload, headers=headers)
        return response