/**
 * Conversation state machine definitions and helpers. Each state
 * represents a step in the event planning dialog. The ordering here
 * determines the progression through the flow when collecting details
 * about an event. You can modify question templates to customize
 * prompts for each state.
 */

export enum ConversationState {
  INITIAL = "INITIAL",
  EVENT_TYPE = "EVENT_TYPE",
  SCOPE = "SCOPE",
  BUDGET = "BUDGET",
  LOCATION = "LOCATION",
  DATE = "DATE",
  STYLE = "STYLE",
  PLANNING = "PLANNING",
}

/**
 * Ordered array of states excluding the INITIAL state, used to determine
 * the next state in the flow. When the flow reaches the last state
 * (PLANNING), no further questions are asked.
 */
const orderedStates: ConversationState[] = [
  ConversationState.EVENT_TYPE,
  ConversationState.SCOPE,
  ConversationState.BUDGET,
  ConversationState.LOCATION,
  ConversationState.DATE,
  ConversationState.STYLE,
  ConversationState.PLANNING,
];

/**
 * Map of conversation states to default question templates. These
 * questions can be used by the chat agent to prompt the user for
 * information needed to plan the event. You may customize these
 * templates as the assistant evolves.
 */
export const questionTemplates: Record<ConversationState, string> = {
  [ConversationState.INITIAL]: "Hello! I'm Plannerly. What type of event are you planning?",
  [ConversationState.EVENT_TYPE]: "What kind of event is it (e.g. wedding, corporate retreat)?",
  [ConversationState.SCOPE]: "How many guests are you expecting and what is the overall scope?",
  [ConversationState.BUDGET]: "What is your approximate budget for this event?",
  [ConversationState.LOCATION]: "Where would you like the event to take place?",
  [ConversationState.DATE]: "Do you have a preferred date or timeframe?",
  [ConversationState.STYLE]: "Are there any particular themes or styles you have in mind?",
  [ConversationState.PLANNING]: "Great! I'll start planning and let you know when I have some options."
};

/**
 * Given the current state, return the next state in the conversation
 * flow. If the current state is the last one (PLANNING), the same state
 * will be returned, indicating that the flow is complete.
 */
export function getNextState(current: ConversationState): ConversationState {
  const idx = orderedStates.indexOf(current);
  if (idx < 0 || idx === orderedStates.length - 1) {
    return ConversationState.PLANNING;
  }
  return orderedStates[idx + 1];
}
