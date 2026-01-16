"""
Example usage of MCP tools for Todo AI Chatbot.

This script demonstrates how to use all 4 MCP tools:
1. add_task - Create new tasks
2. list_tasks - List and filter tasks
3. toggle_task_completion - Mark tasks as complete/incomplete
4. delete_task - Delete tasks

Run with: python mcp_tools_example.py
"""
import asyncio
from app.mcp_tools import add_task, list_tasks, toggle_task_completion, delete_task


async def example_workflow():
    """Demonstrate a complete workflow using MCP tools."""

    print("=" * 60)
    print("MCP Tools Example Workflow")
    print("=" * 60)

    user_id = "demo_user_123"

    # Example 1: Create tasks
    print("\n1. Creating tasks...")
    print("-" * 60)

    task1 = await add_task(
        user_id=user_id,
        title="Buy groceries",
        description="Milk, eggs, bread, and cheese"
    )
    print(f"✓ Created: {task1['data']['title']}")
    print(f"  ID: {task1['data']['id']}")
    print(f"  Status: {'Completed' if task1['data']['completed'] else 'Pending'}")

    task2 = await add_task(
        user_id=user_id,
        title="Write project documentation",
        description="Complete API documentation and usage examples"
    )
    print(f"✓ Created: {task2['data']['title']}")

    task3 = await add_task(
        user_id=user_id,
        title="Review pull requests"
    )
    print(f"✓ Created: {task3['data']['title']}")

    # Example 2: List all tasks
    print("\n2. Listing all tasks...")
    print("-" * 60)

    all_tasks = await list_tasks(user_id=user_id, status="all")
    print(f"Total tasks: {all_tasks['data']['total']}")
    for task in all_tasks['data']['tasks']:
        status_icon = "✓" if task['completed'] else "○"
        print(f"  {status_icon} [{task['id']}] {task['title']}")

    # Example 3: Complete a task
    print("\n3. Marking task as completed...")
    print("-" * 60)

    task1_id = task1['data']['id']
    toggle_result = await toggle_task_completion(
        user_id=user_id,
        task_id=task1_id
    )
    print(f"✓ {toggle_result['message']}")
    print(f"  Task: {toggle_result['data']['title']}")
    print(f"  Completed: {toggle_result['data']['completed']}")

    # Example 4: List pending tasks only
    print("\n4. Listing pending tasks...")
    print("-" * 60)

    pending_tasks = await list_tasks(user_id=user_id, status="pending")
    print(f"Pending tasks: {pending_tasks['data']['total']}")
    for task in pending_tasks['data']['tasks']:
        print(f"  ○ [{task['id']}] {task['title']}")

    # Example 5: List completed tasks only
    print("\n5. Listing completed tasks...")
    print("-" * 60)

    completed_tasks = await list_tasks(user_id=user_id, status="completed")
    print(f"Completed tasks: {completed_tasks['data']['total']}")
    for task in completed_tasks['data']['tasks']:
        print(f"  ✓ [{task['id']}] {task['title']}")

    # Example 6: Toggle task back to pending
    print("\n6. Toggling task back to pending...")
    print("-" * 60)

    toggle_result2 = await toggle_task_completion(
        user_id=user_id,
        task_id=task1_id
    )
    print(f"✓ {toggle_result2['message']}")
    print(f"  Task: {toggle_result2['data']['title']}")
    print(f"  Completed: {toggle_result2['data']['completed']}")

    # Example 7: Delete a task
    print("\n7. Deleting a task...")
    print("-" * 60)

    task3_id = task3['data']['id']
    delete_result = await delete_task(
        user_id=user_id,
        task_id=task3_id
    )
    print(f"✓ {delete_result['message']}")
    print(f"  Deleted ID: {delete_result['data']['deleted_task_id']}")
    print(f"  Deleted Title: {delete_result['data']['deleted_title']}")

    # Example 8: Verify deletion
    print("\n8. Verifying task list after deletion...")
    print("-" * 60)

    final_tasks = await list_tasks(user_id=user_id, status="all")
    print(f"Remaining tasks: {final_tasks['data']['total']}")
    for task in final_tasks['data']['tasks']:
        status_icon = "✓" if task['completed'] else "○"
        print(f"  {status_icon} [{task['id']}] {task['title']}")

    # Example 9: Pagination
    print("\n9. Demonstrating pagination...")
    print("-" * 60)

    # Create more tasks for pagination demo
    for i in range(5):
        await add_task(
            user_id=user_id,
            title=f"Task {i+4}",
            description=f"Description for task {i+4}"
        )

    # Get first 3 tasks
    page1 = await list_tasks(user_id=user_id, limit=3, offset=0)
    print(f"Page 1 (first 3 of {page1['data']['total']}):")
    for task in page1['data']['tasks']:
        print(f"  - {task['title']}")

    # Get next 3 tasks
    page2 = await list_tasks(user_id=user_id, limit=3, offset=3)
    print(f"Page 2 (next 3 of {page2['data']['total']}):")
    for task in page2['data']['tasks']:
        print(f"  - {task['title']}")

    # Example 10: Error handling
    print("\n10. Demonstrating error handling...")
    print("-" * 60)

    # Try to create task with empty title
    error1 = await add_task(user_id=user_id, title="")
    print(f"Empty title error: {error1['message']}")

    # Try to create task with title too long
    error2 = await add_task(user_id=user_id, title="A" * 201)
    print(f"Title too long error: {error2['message']}")

    # Try to toggle non-existent task
    error3 = await toggle_task_completion(user_id=user_id, task_id=999999)
    print(f"Task not found error: {error3['message']}")

    # Try to delete with invalid task_id
    error4 = await delete_task(user_id=user_id, task_id=0)
    print(f"Invalid task_id error: {error4['message']}")

    print("\n" + "=" * 60)
    print("Example workflow completed!")
    print("=" * 60)


async def user_isolation_demo():
    """Demonstrate user isolation between different users."""

    print("\n" + "=" * 60)
    print("User Isolation Demo")
    print("=" * 60)

    # Create tasks for user A
    user_a = "user_a"
    await add_task(user_id=user_a, title="User A - Task 1")
    await add_task(user_id=user_a, title="User A - Task 2")

    # Create tasks for user B
    user_b = "user_b"
    await add_task(user_id=user_b, title="User B - Task 1")

    # List tasks for user A
    print(f"\nTasks for {user_a}:")
    tasks_a = await list_tasks(user_id=user_a)
    for task in tasks_a['data']['tasks']:
        print(f"  - {task['title']}")

    # List tasks for user B
    print(f"\nTasks for {user_b}:")
    tasks_b = await list_tasks(user_id=user_b)
    for task in tasks_b['data']['tasks']:
        print(f"  - {task['title']}")

    # Verify isolation
    user_a_titles = [t['title'] for t in tasks_a['data']['tasks']]
    user_b_titles = [t['title'] for t in tasks_b['data']['tasks']]

    print("\nVerification:")
    print(f"  ✓ User A can only see {len(tasks_a['data']['tasks'])} tasks (their own)")
    print(f"  ✓ User B can only see {len(tasks_b['data']['tasks'])} tasks (their own)")
    print(f"  ✓ 'User B - Task 1' is NOT in User A's list: {'User B - Task 1' not in user_a_titles}")
    print(f"  ✓ 'User A - Task 1' is NOT in User B's list: {'User A - Task 1' not in user_b_titles}")

    print("\n" + "=" * 60)


async def main():
    """Run all examples."""
    await example_workflow()
    await user_isolation_demo()


if __name__ == "__main__":
    # Run the examples
    asyncio.run(main())
