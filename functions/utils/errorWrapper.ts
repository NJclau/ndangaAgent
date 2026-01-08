
import * as functions from 'firebase-functions';

export const wrapCloudFunction = (
  handler: (
    data: any,
    context: functions.https.CallableContext
  ) => any | Promise<any>
) => {
  return functions.https.onCall(async (data, context) => {
    const functionName = context.name;
    const userId = context.auth?.uid;

    try {
      return await handler(data, context);
    } catch (error: any) {
      console.error('Unhandled error in cloud function', {
        functionName,
        userId,
        inputParams: data,
        error: error.message,
        stack: error.stack,
      });

      // Log to Cloud Logging
      functions.logger.error('Unhandled error in cloud function', {
        functionName,
        userId,
        inputParams: data,
        error: error.message,
        stack: error.stack,
      });

      throw new functions.https.HttpsError(
        'internal',
        'An unexpected error occurred.',
        {
          functionName,
        }
      );
    }
  });
};
