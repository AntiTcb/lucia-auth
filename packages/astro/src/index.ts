import type { Auth, Session, User } from "lucia-auth";
import type { AstroGlobal } from "astro";

export class AuthRequest<A extends Auth> {
	private auth: A;
	private request: Request;
	private cookies: AstroGlobal["cookies"];
	constructor(
		auth: A,
		context: {
			request: Request;
			cookies: AstroGlobal["cookies"];
		}
	) {
		this.auth = auth;
		this.request = context.request;
		this.cookies = context.cookies;
	}
	public getSession = async (): Promise<Session | null> => {
		try {
			const sessionId = this.auth.validateRequestHeaders(this.request);
			return await this.auth.validateSession(sessionId, this.setSession);
		} catch {
			return null;
		}
	};
	public getSessionUser = async (): Promise<
		{ session: Session; user: User } | { session: null; user: null }
	> => {
		try {
			const sessionId = this.auth.validateRequestHeaders(this.request);
			return await this.auth.validateSessionUser(sessionId, this.setSession);
		} catch {
			return {
				user: null,
				session: null
			};
		}
	};
	public setSession = (session: Session | null) => {
		const cookies = this.auth.createSessionCookies(session);
		cookies.forEach((cookie) => {
			this.cookies.set(cookie.name, cookie.value, cookie.options);
		});
	};
}

export const handleLogoutRequests = (auth: Auth) => {
	const post = async (context: { request: Request; cookies: AstroGlobal["cookies"] }) => {
		const authRequest = new AuthRequest(auth, context);
		const sessionid = auth.validateRequestHeaders(context.request);
		if (!sessionid) return new Response(null);
		try {
			await auth.invalidateSession(sessionid);
			authRequest.setSession(null);
			return new Response(null);
		} catch {
			return new Response(
				JSON.stringify({
					message: "error"
				}),
				{
					status: 500
				}
			);
		}
	};
	return post;
};
