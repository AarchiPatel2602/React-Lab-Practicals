const taskEvents = require("./events");

let listenersRegistered = false;

function registerTaskListeners() {
    if (listenersRegistered) {
        return;
    }
    listenersRegistered = true;

    // 1. Task Created Listener (with 2-second simulated async processing)
    taskEvents.on("task-created", (arg1, arg2) => {
        const handlerStartTime = new Date().toISOString();
        let task, user;

        if (arg1 && arg1.task) {
            task = arg1.task;
            user = arg1.user || arg2;
        } else {
            task = arg1;
            user = arg2;
        }

        const taskTitle = task ? (task.title || "Untitled Task") : "Untitled Task";
        const assignedUser = user ? (user.name ? `${user.name} (${user.email || ""})` : (user.email || user.toString())) : "Unassigned";

        console.log(`[Event: task-created] Handler started at ${handlerStartTime}`);
        console.log(`[Event: task-created] Task Title: "${taskTitle}"`);
        console.log(`[Event: task-created] Assigned User: ${assignedUser}`);
        console.log(`[Event: task-created] Timestamp: ${handlerStartTime}`);
        console.log(`[Event: task-created] Simulating async notification / background job (2s delay)...`);

        setTimeout(() => {
            const handlerEndTime = new Date().toISOString();
            console.log(`[Event: task-created] Notification completed at ${handlerEndTime}`);
        }, 2000);
    });

    // 2. Task Deleted Listener
    taskEvents.on("task-deleted", (arg1, arg2) => {
        const deleteTimestamp = new Date().toISOString();
        let id, title, user;

        if (arg1 && typeof arg1 === "object" && (arg1.id || arg1._id)) {
            id = arg1.id || arg1._id;
            title = arg1.title || "Task";
            user = arg1.user || arg2;
        } else if (typeof arg1 === "string") {
            id = arg1;
            user = arg2;
        }

        const deletedBy = user ? (user.name ? `${user.name} (${user.email || ""})` : (user.email || user.toString())) : "Unknown User";
        console.log(`[Event: task-deleted] Distinct Deletion Notification: Task "${title}" (ID: ${id}) deleted by ${deletedBy} at ${deleteTimestamp}`);
    });

    // 3. Error Event Listener (safely logs errors without crashing the server)
    taskEvents.on("error", (error) => {
        console.error(`[Event: error] Handled TaskEvents error safely:`, error ? (error.message || error) : "Unknown error");
    });

    console.log("[TaskEvents] Event listeners registered successfully (task-created, task-deleted, error)");
}

// Automatically register once when required during server startup
registerTaskListeners();

module.exports = registerTaskListeners;
