import { AxiosError } from 'axios';
import { Alert } from 'react-native';

export function handleAPIError(error: unknown): void {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const message = error.response?.data?.error || error.message;

    switch (status) {
      case 400:
        Alert.alert('Invalid Request', message);
        break;
      case 401:
        Alert.alert('Authentication Error', 'Please log in again');
        break;
      case 404:
        Alert.alert('Not Found', message);
        break;
      case 500:
        Alert.alert('Server Error', 'Please try again later');
        break;
      default:
        Alert.alert('Error', message);
    }
  } else {
    Alert.alert('Error', 'An unexpected error occurred');
  }
}