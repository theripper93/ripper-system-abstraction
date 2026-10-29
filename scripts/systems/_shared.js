/**
 * Run a system roll that posts its result to chat without returning it, and
 * resolve with the chat message it produced (created, or suppressed when the
 * check runs silently). Resolves null when no message appears in time.
 *
 * @param {Function} trigger                     Starts the system roll; returning false means nothing was rolled.
 * @param {Object} options                       The processCheck options.
 * @param {number} [timeout=3000]                Milliseconds to wait for the message.
 * @returns {Promise<ChatMessage|null>}
 */
export async function captureRollMessage(trigger, options = {}, timeout = 3000) {
  const suppressed = options.suppressedMessages;
  const start = suppressed?.length ?? 0;
  let posted = null;
  const hookId = Hooks.on("createChatMessage", (message) => {
    if (message.author?.id === game.user.id) posted ??= message;
  });
  try {
    if ((await trigger()) === false) return null;
    for (let waited = 0; waited < timeout && !posted && !(suppressed?.length > start); waited += 50) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  } finally {
    Hooks.off("createChatMessage", hookId);
  }
  return posted ?? suppressed?.[start] ?? null;
}
