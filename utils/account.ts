/**
 * Utility functions for handling account-related operations
 */

/**
 * Retrieves the selected account ID from local storage
 * @returns The account ID string if found, null otherwise
 */
export function getSelectedAccountID(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accountID');
  }
  return null;
}

/**
 * Sets the selected account ID in local storage
 * @param accountID The account ID to store
 */
export function setAccountIDInStorage(
  accountID: string
): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accountID', accountID);
  }
}

/**
 * Removes the selected account ID from local storage
 */
export function clearSelectedAccountID(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accountID');
  }
}
