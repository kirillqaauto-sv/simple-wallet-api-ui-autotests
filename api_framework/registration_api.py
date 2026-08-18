from api_framework.base_api import BaseApi
import allure

class RegistrationApi(BaseApi):
    REG_ENDPOINT = "/api/auth/register"

    @allure.step("Registration a new user")
    def registration_user(self, username, password):
        payload = {"username":username, "password":password}
        headers = {"content-type":"application/json"}
        response = self.post_request(self.REG_ENDPOINT, json=payload, headers=headers)
        return response

