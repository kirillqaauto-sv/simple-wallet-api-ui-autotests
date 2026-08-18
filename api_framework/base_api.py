import requests


class BaseApi():
    def __init__(self, base_url):
        self.base_url = base_url
        self.session = requests.session()

    def _send_request(self, method, endpoint, **kwargs):
        url = f"{self.base_url}{endpoint}"
        try:
            response = self.session.request(method, url, **kwargs)
            return response
        except requests.exceptions.HTTPError as e:
            print(f"HTTP error: {e.response.status_code} - {e.response.text}")
            raise

    def get_request(self, endpoint, **kwargs):
        return self._send_request("GET", endpoint, **kwargs)

    def post_request(self, endpoint, **kwargs):
        return self._send_request("POST", endpoint, **kwargs)

    def patch_request(self, endpoint, **kwargs):
        return self._send_request("PATCH", endpoint, **kwargs)

    def delete_request(self, endpoint, **kwargs):
        return self._send_request("DELETE", endpoint, **kwargs)
