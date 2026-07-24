/**
 * AI Chatbot Action Dispatcher & Form Auto-Fill Handler
 * Role-Guarded Client-Side Action Execution with Exact Route Mapping
 */

export const ACTION_TYPES = {
  DEPOSIT_FUNDS: 'DEPOSIT_FUNDS',
  WITHDRAW_FUNDS: 'WITHDRAW_FUNDS',
  UPDATE_BANK_INFO: 'UPDATE_BANK_INFO',
  PLACE_BET: 'PLACE_BET',
  ADD_HORSE: 'ADD_HORSE',
  REGISTER_HORSE_RACE: 'REGISTER_HORSE_RACE',
  SEARCH_JOCKEY: 'SEARCH_JOCKEY',
  REQUEST_UPGRADE: 'REQUEST_UPGRADE',
  VIEW_SCHEDULE: 'VIEW_SCHEDULE',
  UPDATE_RACE_RESULT: 'UPDATE_RACE_RESULT',
  RECORD_VIOLATION: 'RECORD_VIOLATION',
  APPROVE_UPGRADE: 'APPROVE_UPGRADE',
  CREATE_TOURNAMENT: 'CREATE_TOURNAMENT',
  ASSIGN_REFEREE: 'ASSIGN_REFEREE',
  MANAGE_TRANSACTIONS: 'MANAGE_TRANSACTIONS',
  MANAGE_BLACKLIST: 'MANAGE_BLACKLIST',
  NAVIGATE: 'NAVIGATE'
};

const ROLE_PERMISSIONS = {
  GUEST: ['NAVIGATE'],
  SPECTATOR: ['NAVIGATE', 'DEPOSIT_FUNDS', 'WITHDRAW_FUNDS', 'UPDATE_BANK_INFO', 'PLACE_BET', 'REQUEST_UPGRADE'],
  HORSE_OWNER: ['NAVIGATE', 'DEPOSIT_FUNDS', 'WITHDRAW_FUNDS', 'UPDATE_BANK_INFO', 'PLACE_BET', 'ADD_HORSE', 'REGISTER_HORSE_RACE', 'SEARCH_JOCKEY'],
  JOCKEY: ['NAVIGATE', 'DEPOSIT_FUNDS', 'WITHDRAW_FUNDS', 'UPDATE_BANK_INFO', 'PLACE_BET', 'VIEW_SCHEDULE'],
  RACE_REFEREE: ['NAVIGATE', 'DEPOSIT_FUNDS', 'WITHDRAW_FUNDS', 'UPDATE_BANK_INFO', 'PLACE_BET', 'VIEW_SCHEDULE', 'UPDATE_RACE_RESULT', 'RECORD_VIOLATION'],
  ADMIN: ['NAVIGATE', 'DEPOSIT_FUNDS', 'WITHDRAW_FUNDS', 'UPDATE_BANK_INFO', 'PLACE_BET', 'APPROVE_UPGRADE', 'CREATE_TOURNAMENT', 'ASSIGN_REFEREE', 'MANAGE_TRANSACTIONS', 'MANAGE_BLACKLIST']
};

export function isActionPermitted(actionType, userRole) {
  if (!actionType) return false;
  const roleKey = userRole || 'GUEST';
  const allowed = ROLE_PERMISSIONS[roleKey] || ROLE_PERMISSIONS.GUEST;
  return allowed.includes(actionType);
}

/**
 * Executes Actions with natural 800ms delay and dispatches auto-fill events
 */
export function executeSafeAction(action, navigate, userRole) {
  if (!action || !action.type) return;
  if (!isActionPermitted(action.type, userRole)) {
    console.warn(`[AI Guard] Blocked unauthorized action '${action.type}' for role '${userRole}'`);
    return;
  }

  const { type, payload } = action;

  // Natural 800ms delay to give user visual feedback that AI is performing the action
  setTimeout(() => {
    switch (type) {
      case ACTION_TYPES.NAVIGATE:
        if (payload?.path) {
          navigate(payload.path);
        }
        break;

      case ACTION_TYPES.DEPOSIT_FUNDS: {
        sessionStorage.setItem('ai_prefill_deposit', JSON.stringify(payload || {}));
        const walletPath = userRole === 'JOCKEY' ? '/jockey/financials'
          : (userRole === 'HORSE_OWNER' ? '/owner/financials'
          : (userRole === 'ADMIN' ? '/admin/my-wallet'
          : (userRole === 'RACE_REFEREE' ? '/referee/profile'
          : '/spectators/wallet')));
        navigate(walletPath);
        window.dispatchEvent(new CustomEvent('ai_prefill_deposit', { detail: payload || {} }));
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('ai_prefill_deposit', { detail: payload || {} }));
        }, 300);
        break;
      }

      case ACTION_TYPES.WITHDRAW_FUNDS: {
        sessionStorage.setItem('ai_prefill_withdraw', JSON.stringify(payload || {}));
        const walletPath = userRole === 'JOCKEY' ? '/jockey/financials'
          : (userRole === 'HORSE_OWNER' ? '/owner/financials'
          : (userRole === 'ADMIN' ? '/admin/my-wallet'
          : (userRole === 'RACE_REFEREE' ? '/referee/profile'
          : '/spectators/wallet')));
        navigate(walletPath);
        window.dispatchEvent(new CustomEvent('ai_prefill_withdraw', { detail: payload || {} }));
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('ai_prefill_withdraw', { detail: payload || {} }));
        }, 300);
        break;
      }

      case ACTION_TYPES.UPDATE_BANK_INFO: {
        sessionStorage.setItem('ai_prefill_bank_info', JSON.stringify(payload || {}));
        const bankPath = userRole === 'JOCKEY' ? '/jockey/profile'
          : (userRole === 'HORSE_OWNER' ? '/owner/financials'
          : (userRole === 'ADMIN' ? '/admin/my-wallet'
          : (userRole === 'RACE_REFEREE' ? '/referee/profile'
          : '/spectators/profile')));
        navigate(bankPath);
        window.dispatchEvent(new CustomEvent('ai_prefill_bank_info', { detail: payload || {} }));
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('ai_prefill_bank_info', { detail: payload || {} }));
        }, 300);
        break;
      }

      case ACTION_TYPES.ADD_HORSE:
        sessionStorage.setItem('ai_prefill_add_horse', JSON.stringify(payload || {}));
        navigate('/owner/stable');
        window.dispatchEvent(new CustomEvent('ai_prefill_add_horse', { detail: payload || {} }));
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('ai_prefill_add_horse', { detail: payload || {} }));
        }, 300);
        break;

      case ACTION_TYPES.SEARCH_JOCKEY:
        sessionStorage.setItem('ai_prefill_search_jockey', JSON.stringify(payload || {}));
        navigate('/owner/friends');
        window.dispatchEvent(new CustomEvent('ai_prefill_search_jockey', { detail: payload || {} }));
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('ai_prefill_search_jockey', { detail: payload || {} }));
        }, 300);
        break;

      case ACTION_TYPES.REQUEST_UPGRADE:
        sessionStorage.setItem('ai_prefill_upgrade', JSON.stringify(payload || {}));
        navigate('/spectators/upgrade');
        window.dispatchEvent(new CustomEvent('ai_prefill_upgrade', { detail: payload || {} }));
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('ai_prefill_upgrade', { detail: payload || {} }));
        }, 300);
        break;

      case ACTION_TYPES.PLACE_BET:
        sessionStorage.setItem('ai_prefill_place_bet', JSON.stringify(payload || {}));
        navigate('/tournaments');
        window.dispatchEvent(new CustomEvent('ai_prefill_place_bet', { detail: payload || {} }));
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('ai_prefill_place_bet', { detail: payload || {} }));
        }, 300);
        break;

      case ACTION_TYPES.VIEW_SCHEDULE:
        if (userRole === 'JOCKEY') navigate('/jockey/races');
        else if (userRole === 'RACE_REFEREE') navigate('/referee/assigned-tournaments');
        break;

      case ACTION_TYPES.UPDATE_RACE_RESULT:
        navigate('/referee/confirm-results');
        break;

      case ACTION_TYPES.RECORD_VIOLATION:
        navigate('/referee/violations');
        break;

      // ADMIN ACTIONS: NAVIGATE ONLY TO EXACT SUB-PAGES.
      case ACTION_TYPES.APPROVE_UPGRADE:
        navigate('/admin/upgradeuserrole');
        break;

      case ACTION_TYPES.CREATE_TOURNAMENT:
      case ACTION_TYPES.ASSIGN_REFEREE:
        navigate('/admin/tournamentmanagement');
        break;

      case ACTION_TYPES.MANAGE_TRANSACTIONS:
        navigate('/admin/transactions');
        break;

      case ACTION_TYPES.MANAGE_BLACKLIST:
        navigate('/admin/blacklist');
        break;

      default:
        break;
    }
  }, 800);
}
