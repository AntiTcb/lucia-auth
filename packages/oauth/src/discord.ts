import { post, get } from "./request.js";
import type { Auth, GlobalUserAttributes, User } from "lucia-auth";
import {
	generateState,
	GetAuthorizationUrlReturnType,
	OAuthConfig,
	OAuthProvider
} from "./index.js";

interface Configs extends OAuthConfig {
	redirectUri: string;
	prompt?: "consent" | "none";
}

class Discord<A extends Auth> implements OAuthProvider {
	constructor(auth: A, configs: Configs) {
		this.auth = auth;
		this.clientId = configs.clientId;
		this.clientSecret = configs.clientSecret;
		this.redirectUri = configs.redirectUri;
		this.scope = configs.scope || ["identify", "email"];
		this.prompt = configs.prompt || "consent";
	}
	private auth: A;
	private clientId: string;
	private clientSecret: string;
	private scope: string[];
	private redirectUri: string;
	private prompt: string;

	public getAuthorizationUrl = <State extends string | null | undefined = undefined>(
		state?: State
	): GetAuthorizationUrlReturnType<State> => {
		const s = state ?? (typeof state === "undefined" ? generateState() : undefined);
		const url = `https://discord.com/oauth2/authorize?${new URLSearchParams({
			client_id: this.clientId,
			redirect_uri: this.redirectUri,
			scope: this.scope.join(" "),
			prompt: this.prompt,
			response_type: "code",
			...(s && { state: s })
		}).toString()}`;
		if (state === null) return [url] as const as GetAuthorizationUrlReturnType<State>;
		return [url, s] as const as GetAuthorizationUrlReturnType<State>;
	};

	public validateCallback = async (code: string) => {
		const {
			access_token: accessToken,
			refresh_token: refreshToken,
			expires_in: expiresIn
		} = (await post(
			`https://discord.com/api/oauth2/token?${new URLSearchParams({
				client_id: this.clientId,
				client_secret: this.clientSecret,
				code,
				grant_type: "authorization_code",
				redirect_uri: this.redirectUri
			}).toString()}`
		)) as {
			access_token: string;
			refresh_token?: string;
			expires_in: number;
		};
		const discordUser = (await get("https://discord.com/api/users/@me", {
			bearerToken: accessToken
		})) as DiscordUser;
		const discordUserId = String(discordUser.id);
		let existingUser: User | null = null;
		try {
			existingUser = await this.auth.getUserByProviderId("discord", discordUserId);
		} catch {
			// existing user is null
		}
		return {
			createUser: async (userAttributes: GlobalUserAttributes = {}) => {
				return await this.auth.createUser("discord", discordUserId, {
					attributes: userAttributes
				});
			},
			existingUser,
			providerUser: discordUser,
			accessToken,
			refreshToken,
			expiresIn
		};
	};
}

const discord = <A extends Auth>(auth: A, configs: Configs) => {
	return new Discord(auth, configs);
};

export default discord;

interface DiscordUser {
	id: string;
	username: string;
	discriminator: string;
	avatar: string | null;
	bot?: boolean;
	system?: boolean;
	mfa_enabled?: boolean;
	banner?: string | null;
	accent_color?: number | null;
	locale?: string;
	verified?: boolean;
	email?: string | null;
	flags?: number;
	premium_type?: number;
	public_flags?: number;
}
