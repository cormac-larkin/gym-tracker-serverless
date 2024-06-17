import { APIGatewayEvent, Context } from "aws-lambda";
import { Client } from "pg";
import { SSM } from "@aws-sdk/client-ssm";
import * as dotenv from "dotenv";

dotenv.config();

export const handler = async (event: APIGatewayEvent, context?: Context) => {
  try {
    const getParameter = async (parameterName: string, decrypt: boolean) => {
      const ssm = new SSM();

      const response = await ssm.getParameter({
        Name: parameterName,
        WithDecryption: decrypt,
      });
      return response.Parameter?.Value;
    };

    const userParam = process.env.DB_USER || "unknown";
    const hostParam = process.env.DB_HOST || "unknown";
    const databaseParam = process.env.DB_NAME || "unknown";
    const passwordParam = process.env.DB_PASSWORD || "unknown";
    const portParam = process.env.DB_PORT || "unknown";

    const user = await getParameter(userParam, false);
    const host = await getParameter(hostParam, false);
    const database = await getParameter(databaseParam, false);
    const password = await getParameter(passwordParam, false);
    const port = await getParameter(portParam, false);

    const client = new Client({
      user,
      host,
      database,
      password,
      port: parseInt(port || "5432"),
    });

    await client.connect();
    const exerciseId = event.pathParameters?.id;

    console.log(`ENTERED FUNCTION - EXERCISE ID: ${exerciseId}`);

    if (!exerciseId) {
      console.log(`NO EXERCISE ID RECEIVED`);
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Exercise ID is required" }),
      };
    }

    console.log(`BEFORE QUERY`);
    const result = await client.query({
      text: `SELECT exercise_name FROM exercise WHERE exercise_id = $1`,
      values: [exerciseId],
    });
    console.log(`AFTER QUERY`);

    if (result.rows.length === 0) {
      console.log(`0 ROWS RETRIEVED`);
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Exercise not found" }),
      };
    }

    const exerciseName = result.rows[0].exercise_name;
    console.log(`EXERCISE NAME: ${exerciseName}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ exerciseName }),
    };
  } catch (error) {
    console.error("Error querying the database:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
