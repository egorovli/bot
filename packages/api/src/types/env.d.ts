declare module 'bun' {
	interface Env {
		VERSION?: string
		NODE_ENV?: string
		APP_NAME?: string
		APP_LOG_LEVEL?: string
	}
}
