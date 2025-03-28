export const handleApiError = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'An unknown error occurred'
    }));
    throw new Error(error.message || 'API request failed');
  }
  return response;
};