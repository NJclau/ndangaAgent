
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const API_BASE_URL = 'https://sandbox.momodeveloper.mtn.com';

// TODO: Store these securely in environment variables
const COLLECTION_PRIMARY_KEY = functions.config().mtn.collection_primary_key;
const COLLECTION_USER_ID = functions.config().mtn.collection_user_id;
const COLLECTION_API_SECRET = functions.config().mtn.collection_api_secret;


const getAccessToken = async () => {
  const credentials = Buffer.from(`${COLLECTION_USER_ID}:${COLLECTION_API_SECRET}`).toString('base64');
  const response = await axios.post(`${API_BASE_URL}/collection/token/`, null, {
    headers: {
      'Ocp-Apim-Subscription-Key': COLLECTION_PRIMARY_KEY,
      'Authorization': `Basic ${credentials}`,
    },
  });
  return response.data.access_token;
};

export const requestToPay = async (amount: number, currency: string, partyId: string, payerMessage: string) => {
  const accessToken = await getAccessToken();
  const referenceId = uuidv4();

  const response = await axios.post(`${API_BASE_URL}/collection/v1_0/requesttopay`, {
    amount,
    currency,
    externalId: referenceId,
    payer: {
      partyIdType: 'MSISDN',
      partyId,
    },
    payerMessage,
    payeeNote: 'Payment for Isoko services',
  }, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-Reference-Id': referenceId,
      'X-Target-Environment': 'sandbox',
      'Ocp-Apim-Subscription-Key': COLLECTION_PRIMARY_KEY,
    },
  });

  return { referenceId, status: response.status };
};
