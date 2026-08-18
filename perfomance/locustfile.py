from locust import HttpUser, task, between, SequentialTaskSet, events
from faker import Faker
from helpers.db_helper import DbHelper

fake = Faker()


class UserBehavior(SequentialTaskSet):

    def on_start(self):

        self.username = fake.user_name()
        self.password = fake.password()

        reg_payload = {"username": self.username, "password": self.password}
        self.client.post("/api/auth/register", json=reg_payload,
                         name="/api/auth/register")

        login_payload = {"username": self.username, "password": self.password}
        response = self.client.post(
            "/api/auth/login", json=login_payload, name="/api/auth/login")
        if response.status_code == 200:
            token = response.json().get("token")
            self.client.headers.update({"Authorization": f"Bearer {token}"})

    @task(3)
    def get_profile(self):
        self.client.get("/api/user/me", name="/api/user/me")

    @task(1)
    def topup_balance(self):
        amount = {"amount": 100}
        self.client.post("/api/user/topup", json=amount,
                         name="/api/user/topup")


class LoadUser(HttpUser):
    tasks = [UserBehavior]
    wait_time = between(1, 3)


@events.test_stop.add_listener
def on_test_stop(environment, **krwargs):
    print("\nTest completed! Begin the cleaning of DB....")
    db = DbHelper()
    try:
        db.execute_query("TRUNCATE TABLE users CASCADE;")
        print("\nDB is clean now!")
    except Exception as e:
        print(f"[Error]: There's error while cleaning the DB {e}")
