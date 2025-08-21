
def test_create_user(client):
    res = client.post(
        "/api/users/register",
        json={
            "email": "testuser@test.com",
            "password": "testuser1234"
        }
    )
    assert res.status_code in [200, 201, 400]

def test_login_user(client, test_user):
    res = client.post(
        "/api/users/login",
        json={"email": test_user.email, "password": "test_1234"},
    )
    assert res.status_code == 200, res.text
    data = res.json()
    assert "access_token" in data
    assert data.get("token_type") in (None, "bearer", "Bearer")