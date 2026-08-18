from api_framework.base_api import BaseApi
import allure


class AdminApi(BaseApi):
    GET_ALL_USERS_ENDPOINT = '/api/users'

    def __init__(self, base_url, token):
        super().__init__(base_url)
        self.session.headers.update({"Authorization":f"Bearer {token}"})

    @allure.step("Get All users")
    def get_list_of_users(self):
        return self.get_request(self.GET_ALL_USERS_ENDPOINT)

    @allure.step("Delete user")
    def delete_user(self, user_id: int):
        delete_endpoint = f'/api/users/{user_id}'
        response = self.delete_request(delete_endpoint)
        return response
