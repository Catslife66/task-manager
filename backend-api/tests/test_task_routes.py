from fastapi import status
from src.users.csrf import create_csrf_token


def test_create_task(client, test_task_payload, auth_headers, csrf_token_header, test_tag, test_user):
    res = client.post(
        '/api/tasks',
        headers={**auth_headers, **csrf_token_header},
        json={ 
            **test_task_payload,
            "tag_id": test_tag.id,
        }
    )
    data = res.json()
    assert res.status_code == status.HTTP_200_OK
    assert data["title"] == test_task_payload["title"]
    assert data["tag_id"] == test_tag.id
    assert data["user_id"] == test_user.id

def test_create_task_unauthorized(client,csrf_token_header, test_task_payload, test_tag):
    res = client.post(
        '/api/tasks',
        headers={**csrf_token_header},
        json={
            **test_task_payload,
            "tag_id": test_tag.id,
        }
    )
    assert res.status_code == status.HTTP_401_UNAUTHORIZED

def test_create_task_without_csrf(client, auth_headers, test_task_payload, test_tag):
    res = client.post(
        '/api/tasks',
        headers=auth_headers,
        json={
            **test_task_payload,
            "tag_id": test_tag.id,
        }
    )
    assert res.status_code == status.HTTP_403_FORBIDDEN
    assert res.json()["detail"] == "CSRF token missing."

def test_create_task_with_invalid_csrf(client, auth_headers, csrf_token_header, test_task_payload, test_tag):
    csrf_token = csrf_token_header
    different_token = create_csrf_token()
    res = client.post(
        '/api/tasks',
        headers={
            **auth_headers,
            "x-csrf-token": different_token,
        },
        json={
            **test_task_payload,
            "tag_id": test_tag.id,
        }
    )
    assert res.status_code == status.HTTP_403_FORBIDDEN
    assert res.json()["detail"] == "CSRF token invalid."
