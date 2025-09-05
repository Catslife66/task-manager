from fastapi import status


def test_create_task(client, test_task_payload, auth_headers, test_user):
    res = client.post(
        '/api/tasks',
        headers=auth_headers,
        json={ 
            **test_task_payload,
        }
    )
    data = res.json()
    assert res.status_code == status.HTTP_200_OK
    assert data["title"] == test_task_payload["title"]
    assert data["user_id"] == test_user.id

def test_create_task_unauthorized(client, test_task_payload):
    res = client.post(
        '/api/tasks',
        json={
            **test_task_payload,
        }
    )
    assert res.status_code == status.HTTP_401_UNAUTHORIZED
