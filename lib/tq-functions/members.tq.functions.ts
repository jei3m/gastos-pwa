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
