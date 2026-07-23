/**
 * AI Chatbot Action Dispatcher & Form Auto-Fill Handler
 */

export const ACTION_TYPES = {
  DEPOSIT_FUNDS: 'DEPOSIT_FUNDS',
  WITHDRAW_FUNDS: 'WITHDRAW_FUNDS',
  UPDATE_BANK_INFO: 'UPDATE_BANK_INFO',
  PLACE_BET: 'PLACE_BET',
  ADD_HORSE: 'ADD_HORSE',
  SEARCH_JOCKEY: 'SEARCH_JOCKEY',
  REQUEST_UPGRADE: 'REQUEST_UPGRADE',
  NAVIGATE: 'NAVIGATE'
};

/**
 * Executes Safe Actions automatically (Navigation, Form Prefilling)
 * @param {Object} action - The action object from AI response { type, payload }
 * @param {Function} navigate - React Router navigate function
 */
export function executeSafeAction(action, navigate) {
  if (!action || !action.type) return;

  const { type, payload } = action;

  switch (type) {
    case ACTION_TYPES.NAVIGATE:
      if (payload?.path) {
        navigate(payload.path);
      }
      break;

    case ACTION_TYPES.UPDATE_BANK_INFO:
      if (payload) {
        sessionStorage.setItem('ai_prefill_bank_info', JSON.stringify(payload));
        window.dispatchEvent(new CustomEvent('ai_prefill_bank_info', { detail: payload }));
        navigate('/spectators');
      }
      break;

    case ACTION_TYPES.ADD_HORSE:
      if (payload) {
        sessionStorage.setItem('ai_prefill_add_horse', JSON.stringify(payload));
        window.dispatchEvent(new CustomEvent('ai_prefill_add_horse', { detail: payload }));
        navigate('/owner');
      }
      break;

    case ACTION_TYPES.SEARCH_JOCKEY:
      if (payload?.query) {
        sessionStorage.setItem('ai_prefill_search_jockey', JSON.stringify(payload));
        window.dispatchEvent(new CustomEvent('ai_prefill_search_jockey', { detail: payload }));
        navigate('/owner');
      }
      break;

    case ACTION_TYPES.REQUEST_UPGRADE:
      if (payload) {
        sessionStorage.setItem('ai_prefill_upgrade', JSON.stringify(payload));
        window.dispatchEvent(new CustomEvent('ai_prefill_upgrade', { detail: payload }));
        navigate('/spectators');
      }
      break;

    default:
      break;
  }
}
