from fastapi import status


def test_create_task(client, test_task_payload, auth_headers, test_tag, test_user):
    res = client.post(
        '/api/tasks',
        headers=auth_headers,
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


def test_create_task_unauthorized(client, test_task_payload, test_tag):
    res = client.post(
        '/api/tasks',
        json={
            **test_task_payload,
            "tag_id": test_tag.id,
        }
    )
    assert res.status_code == status.HTTP_401_UNAUTHORIZED