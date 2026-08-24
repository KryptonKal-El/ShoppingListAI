/**
 * Supabase database service layer for cook sessions (the cook log).
 * A cook session records one cook of a recipe; its steps are a snapshot taken
 * at start time, so later recipe edits never alter progress or history.
 */
import { supabase } from './supabase.js';

const mapSession = (row) => ({
  id: row.id,
  recipeId: row.recipe_id,
  userId: row.user_id,
  startedAt: row.started_at,
  completedAt: row.completed_at,
  currentStep: row.current_step,
  notes: row.notes,
});

const mapSessionStep = (row) => ({
  id: row.id,
  sessionId: row.session_id,
  sortOrder: row.sort_order,
  instruction: row.instruction,
  completedAt: row.completed_at,
});

/**
 * Starts a cook: inserts the session and snapshots the recipe's current steps.
 * @param {string} recipeId - Recipe ID
 * @param {string} userId - Current user ID
 * @param {Array<{instruction: string, sortOrder: number}>} steps - The recipe's steps
 * @returns {Promise<{session: object, steps: Array<object>}>}
 */
export const startCookSession = async (recipeId, userId, steps) => {
  const { data: session, error: sessionError } = await supabase
    .from('cook_sessions')
    .insert({ recipe_id: recipeId, user_id: userId })
    .select()
    .single();

  if (sessionError) {
    throw new Error(`Failed to start cook session: ${sessionError.message}`, {
      cause: sessionError,
    });
  }

  const sortedSteps = [...steps].sort((a, b) => a.sortOrder - b.sortOrder);
  if (sortedSteps.length === 0) {
    return { session: mapSession(session), steps: [] };
  }

  const { data: inserted, error: stepsError } = await supabase
    .from('cook_session_steps')
    .insert(
      sortedSteps.map((step, index) => ({
        session_id: session.id,
        sort_order: index,
        instruction: step.instruction,
      }))
    )
    .select();

  if (stepsError) {
    throw new Error(`Failed to snapshot cook steps: ${stepsError.message}`, {
      cause: stepsError,
    });
  }

  return {
    session: mapSession(session),
    steps: inserted.map(mapSessionStep).sort((a, b) => a.sortOrder - b.sortOrder),
  };
};

/**
 * Fetches the user's in-progress session for a recipe with its steps, or null.
 * @param {string} recipeId - Recipe ID
 * @param {string} userId - Current user ID
 * @returns {Promise<{session: object, steps: Array<object>} | null>}
 */
export const fetchActiveCookSession = async (recipeId, userId) => {
  const { data: sessions, error } = await supabase
    .from('cook_sessions')
    .select('*')
    .eq('recipe_id', recipeId)
    .eq('user_id', userId)
    .is('completed_at', null);

  if (error) {
    throw new Error(`Failed to fetch active cook session: ${error.message}`, {
      cause: error,
    });
  }
  if (!sessions || sessions.length === 0) return null;

  const session = sessions[0];
  const { data: steps, error: stepsError } = await supabase
    .from('cook_session_steps')
    .select('*')
    .eq('session_id', session.id)
    .order('sort_order', { ascending: true });

  if (stepsError) {
    throw new Error(`Failed to fetch cook session steps: ${stepsError.message}`, {
      cause: stepsError,
    });
  }

  return { session: mapSession(session), steps: steps.map(mapSessionStep) };
};

/**
 * Fetches the completed cooks for a recipe, newest first.
 * @param {string} recipeId - Recipe ID
 * @returns {Promise<Array<object>>}
 */
export const fetchCookHistory = async (recipeId) => {
  const { data, error } = await supabase
    .from('cook_sessions')
    .select('*')
    .eq('recipe_id', recipeId)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch cook history: ${error.message}`, {
      cause: error,
    });
  }
  return data.map(mapSession);
};

/**
 * Marks a session step done (or not done) by setting/clearing completed_at.
 * @param {string} stepId - Cook session step ID
 * @param {boolean} completed - Whether the step is done
 */
export const setCookStepCompleted = async (stepId, completed) => {
  const { error } = await supabase
    .from('cook_session_steps')
    .update({ completed_at: completed ? new Date().toISOString() : null })
    .eq('id', stepId);

  if (error) {
    throw new Error(`Failed to update cook step: ${error.message}`, {
      cause: error,
    });
  }
};

/**
 * Persists the step index the cook is currently on, so resume lands there.
 * @param {string} sessionId - Cook session ID
 * @param {number} currentStep - Zero-based step index
 */
export const updateCookCurrentStep = async (sessionId, currentStep) => {
  const { error } = await supabase
    .from('cook_sessions')
    .update({ current_step: currentStep })
    .eq('id', sessionId);

  if (error) {
    throw new Error(`Failed to save current step: ${error.message}`, {
      cause: error,
    });
  }
};

/**
 * Finishes a cook. A DB trigger updates the recipe's cook_count/last_cooked_at.
 * @param {string} sessionId - Cook session ID
 */
export const completeCookSession = async (sessionId) => {
  const { error } = await supabase
    .from('cook_sessions')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', sessionId);

  if (error) {
    throw new Error(`Failed to finish cook session: ${error.message}`, {
      cause: error,
    });
  }
};

/**
 * Discards an in-progress cook entirely (step snapshots cascade).
 * @param {string} sessionId - Cook session ID
 */
export const cancelCookSession = async (sessionId) => {
  const { error } = await supabase
    .from('cook_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) {
    throw new Error(`Failed to discard cook session: ${error.message}`, {
      cause: error,
    });
  }
};
