export const fetchMembers = async (accountID: string) => {
  try {
    const res = await fetch(
      `/api/accounts/${accountID}/members`,
      {
        method: 'GET',
      }
    );
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message);
    }
    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch members');
  }
};

export const inviteMember = async (
  accountID: string,
  email: string
) => {
  try {
    const res = await fetch(
      `/api/accounts/${accountID}/members`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }
    );
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message);
    }
    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to invite member');
  }
};

export const removeMember = async (
  accountID: string,
  userID: string
) => {
  try {
    const res = await fetch(
      `/api/accounts/${accountID}/members/${userID}`,
      {
        method: 'DELETE',
      }
    );
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message);
    }
    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to remove member');
  }
};

export const cancelInvitation = async (
  accountID: string,
  inviteId: string
) => {
  try {
    const res = await fetch(
      `/api/accounts/${accountID}/invitations/${inviteId}`,
      {
        method: 'DELETE',
      }
    );
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message);
    }
    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to cancel invitation');
  }
};

export const fetchInvitationByToken = async (
  token: string
) => {
  try {
    const res = await fetch(
      `/api/invitations/accept?token=${token}`,
      {
        method: 'GET',
      }
    );
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message);
    }
    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch invitation');
  }
};

export const respondToInvitation = async (
  token: string,
  action: 'accept' | 'decline'
) => {
  try {
    const res = await fetch('/api/invitations/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message);
    }
    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to respond to invitation');
  }
};
