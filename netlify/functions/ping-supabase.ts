import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL as string,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export const handler: Handler = async (event: any, context: any) => {
	try {
		// Send a simple query to Supabase to keep it active
		const { data, error } = await supabase.from("dashboard-rm-volume").select("*").limit(1);

		if (error) {
			return {
				statusCode: 500,
				body: JSON.stringify({
					message: "Supabase query failed",
					error: error.message,
				}),
			};
		}

		return {
			statusCode: 200,
			body: JSON.stringify({ message: "Supabase is active", data: data }),
		};
	} catch (err: any) {
		return {
			statusCode: 500,
			body: JSON.stringify({
				message: "Something went wrong",
				error: err.message,
			}),
		};
	}
};
