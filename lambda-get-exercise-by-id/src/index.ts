import { APIGatewayEvent, Context } from "aws-lambda";
import { Client } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

export const handler = async (event: APIGatewayEvent, context?: Context) => {
  try {
    const client = new Client({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT || "5432"),
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
