"""
Test suite for MCP tools.

Run with: pytest test_mcp_tools.py -v
"""
import asyncio
import pytest
from datetime import datetime
from app.mcp_tools import add_task, list_tasks, toggle_task_completion, delete_task


class TestAddTask:
    """Test cases for add_task tool."""

    @pytest.mark.asyncio
    async def test_add_task_success(self):
        """Test successful task creation."""
        result = await add_task(
            user_id="test_user_1",
            title="Buy groceries",
            description="Milk, eggs, bread"
        )

        assert result["status"] == "success"
        assert result["message"] == "Task created successfully"
        assert result["data"]["title"] == "Buy groceries"
        assert result["data"]["description"] == "Milk, eggs, bread"
        assert result["data"]["completed"] is False
        assert "id" in result["data"]
        assert "created_at" in result["data"]

    @pytest.mark.asyncio
    async def test_add_task_empty_user_id(self):
        """Test task creation with empty user_id."""
        result = await add_task(
            user_id="",
            title="Test task"
        )

        assert result["status"] == "error"
        assert "user_id" in result["message"]
        assert result["data"] is None

    @pytest.mark.asyncio
    async def test_add_task_empty_title(self):
        """Test task creation with empty title."""
        result = await add_task(
            user_id="test_user_1",
            title=""
        )

        assert result["status"] == "error"
        assert "title" in result["message"]
        assert result["data"] is None

    @pytest.mark.asyncio
    async def test_add_task_title_too_long(self):
        """Test task creation with title exceeding 200 characters."""
        result = await add_task(
            user_id="test_user_1",
            title="A" * 201
        )

        assert result["status"] == "error"
        assert "200 characters" in result["message"]
        assert result["data"] is None

    @pytest.mark.asyncio
    async def test_add_task_description_too_long(self):
        """Test task creation with description exceeding 1000 characters."""
        result = await add_task(
            user_id="test_user_1",
            title="Test task",
            description="A" * 1001
        )

        assert result["status"] == "error"
        assert "1000 characters" in result["message"]
        assert result["data"] is None

    @pytest.mark.asyncio
    async def test_add_task_invalid_due_date(self):
        """Test task creation with invalid due_date format."""
        result = await add_task(
            user_id="test_user_1",
            title="Test task",
            due_date="2025/01/16"  # Wrong format
        )

        assert result["status"] == "error"
        assert "YYYY-MM-DD" in result["message"]
        assert result["data"] is None

    @pytest.mark.asyncio
    async def test_add_task_valid_due_date(self):
        """Test task creation with valid due_date."""
        result = await add_task(
            user_id="test_user_1",
            title="Test task",
            due_date="2025-12-31"
        )

        assert result["status"] == "success"


class TestListTasks:
    """Test cases for list_tasks tool."""

    @pytest.mark.asyncio
    async def test_list_tasks_all(self):
        """Test listing all tasks."""
        # Create some test tasks first
        await add_task(user_id="test_user_2", title="Task 1")
        await add_task(user_id="test_user_2", title="Task 2")

        result = await list_tasks(user_id="test_user_2", status="all")

        assert result["status"] == "success"
        assert "tasks" in result["data"]
        assert "total" in result["data"]
        assert "returned" in result["data"]
        assert isinstance(result["data"]["tasks"], list)

    @pytest.mark.asyncio
    async def test_list_tasks_pending(self):
        """Test listing pending tasks."""
        result = await list_tasks(user_id="test_user_2", status="pending")

        assert result["status"] == "success"
        assert "pending" in result["message"]

    @pytest.mark.asyncio
    async def test_list_tasks_completed(self):
        """Test listing completed tasks."""
        result = await list_tasks(user_id="test_user_2", status="completed")

        assert result["status"] == "success"
        assert "completed" in result["message"]

    @pytest.mark.asyncio
    async def test_list_tasks_empty_user_id(self):
        """Test listing tasks with empty user_id."""
        result = await list_tasks(user_id="")

        assert result["status"] == "error"
        assert "user_id" in result["message"]

    @pytest.mark.asyncio
    async def test_list_tasks_invalid_status(self):
        """Test listing tasks with invalid status."""
        result = await list_tasks(user_id="test_user_2", status="invalid")

        assert result["status"] == "error"
        assert "status must be" in result["message"]

    @pytest.mark.asyncio
    async def test_list_tasks_invalid_limit(self):
        """Test listing tasks with invalid limit."""
        result = await list_tasks(user_id="test_user_2", limit=0)

        assert result["status"] == "error"
        assert "limit" in result["message"]

    @pytest.mark.asyncio
    async def test_list_tasks_negative_offset(self):
        """Test listing tasks with negative offset."""
        result = await list_tasks(user_id="test_user_2", offset=-1)

        assert result["status"] == "error"
        assert "offset" in result["message"]

    @pytest.mark.asyncio
    async def test_list_tasks_pagination(self):
        """Test task pagination."""
        # Create multiple tasks
        for i in range(5):
            await add_task(user_id="test_user_3", title=f"Task {i}")

        result = await list_tasks(user_id="test_user_3", limit=3, offset=0)

        assert result["status"] == "success"
        assert result["data"]["returned"] <= 3


class TestToggleTaskCompletion:
    """Test cases for toggle_task_completion tool."""

    @pytest.mark.asyncio
    async def test_toggle_completion_success(self):
        """Test successful completion toggle."""
        # Create a task first
        create_result = await add_task(
            user_id="test_user_4",
            title="Task to toggle"
        )
        task_id = create_result["data"]["id"]

        # Toggle to completed
        result = await toggle_task_completion(
            user_id="test_user_4",
            task_id=task_id
        )

        assert result["status"] == "success"
        assert "completed" in result["message"]
        assert result["data"]["completed"] is True

        # Toggle back to pending
        result2 = await toggle_task_completion(
            user_id="test_user_4",
            task_id=task_id
        )

        assert result2["status"] == "success"
        assert "pending" in result2["message"]
        assert result2["data"]["completed"] is False

    @pytest.mark.asyncio
    async def test_toggle_completion_empty_user_id(self):
        """Test toggle with empty user_id."""
        result = await toggle_task_completion(user_id="", task_id=1)

        assert result["status"] == "error"
        assert "user_id" in result["message"]

    @pytest.mark.asyncio
    async def test_toggle_completion_invalid_task_id(self):
        """Test toggle with invalid task_id."""
        result = await toggle_task_completion(user_id="test_user_4", task_id=0)

        assert result["status"] == "error"
        assert "positive integer" in result["message"]

    @pytest.mark.asyncio
    async def test_toggle_completion_nonexistent_task(self):
        """Test toggle with non-existent task."""
        result = await toggle_task_completion(user_id="test_user_4", task_id=999999)

        assert result["status"] == "error"
        assert "not found" in result["message"]

    @pytest.mark.asyncio
    async def test_toggle_completion_wrong_user(self):
        """Test toggle with task belonging to different user."""
        # Create task for user_5
        create_result = await add_task(user_id="test_user_5", title="User 5 task")
        task_id = create_result["data"]["id"]

        # Try to toggle as user_6
        result = await toggle_task_completion(user_id="test_user_6", task_id=task_id)

        assert result["status"] == "error"
        assert "not found" in result["message"]


class TestDeleteTask:
    """Test cases for delete_task tool."""

    @pytest.mark.asyncio
    async def test_delete_task_success(self):
        """Test successful task deletion."""
        # Create a task first
        create_result = await add_task(
            user_id="test_user_7",
            title="Task to delete"
        )
        task_id = create_result["data"]["id"]

        # Delete the task
        result = await delete_task(user_id="test_user_7", task_id=task_id)

        assert result["status"] == "success"
        assert "deleted" in result["message"]
        assert result["data"]["deleted_task_id"] == task_id
        assert result["data"]["deleted_title"] == "Task to delete"

        # Verify task is gone
        list_result = await list_tasks(user_id="test_user_7")
        task_ids = [task["id"] for task in list_result["data"]["tasks"]]
        assert task_id not in task_ids

    @pytest.mark.asyncio
    async def test_delete_task_empty_user_id(self):
        """Test delete with empty user_id."""
        result = await delete_task(user_id="", task_id=1)

        assert result["status"] == "error"
        assert "user_id" in result["message"]

    @pytest.mark.asyncio
    async def test_delete_task_invalid_task_id(self):
        """Test delete with invalid task_id."""
        result = await delete_task(user_id="test_user_7", task_id=0)

        assert result["status"] == "error"
        assert "positive integer" in result["message"]

    @pytest.mark.asyncio
    async def test_delete_task_nonexistent(self):
        """Test delete with non-existent task."""
        result = await delete_task(user_id="test_user_7", task_id=999999)

        assert result["status"] == "error"
        assert "not found" in result["message"]

    @pytest.mark.asyncio
    async def test_delete_task_wrong_user(self):
        """Test delete with task belonging to different user."""
        # Create task for user_8
        create_result = await add_task(user_id="test_user_8", title="User 8 task")
        task_id = create_result["data"]["id"]

        # Try to delete as user_9
        result = await delete_task(user_id="test_user_9", task_id=task_id)

        assert result["status"] == "error"
        assert "not found" in result["message"]


class TestUserIsolation:
    """Test cases for user isolation across all tools."""

    @pytest.mark.asyncio
    async def test_user_isolation(self):
        """Test that users can only see their own tasks."""
        # Create tasks for user_10
        await add_task(user_id="test_user_10", title="User 10 Task 1")
        await add_task(user_id="test_user_10", title="User 10 Task 2")

        # Create tasks for user_11
        await add_task(user_id="test_user_11", title="User 11 Task 1")

        # List tasks for user_10
        result_10 = await list_tasks(user_id="test_user_10")

        # List tasks for user_11
        result_11 = await list_tasks(user_id="test_user_11")

        # Verify isolation
        user_10_titles = [task["title"] for task in result_10["data"]["tasks"]]
        user_11_titles = [task["title"] for task in result_11["data"]["tasks"]]

        assert "User 10 Task 1" in user_10_titles
        assert "User 10 Task 2" in user_10_titles
        assert "User 11 Task 1" not in user_10_titles

        assert "User 11 Task 1" in user_11_titles
        assert "User 10 Task 1" not in user_11_titles


if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"])
