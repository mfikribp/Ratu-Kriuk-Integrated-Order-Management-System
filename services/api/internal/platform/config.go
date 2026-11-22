package platform

type Config struct {
	DBHost     string
	DBPort     string
	DBName     string
	DBUser     string
	DBPassword string
	DBTimezone string
}

func FromEnv() (*Config, error) {
	cfg := &Config{
		DBHost:     "127.0.0.1",
		DBPort:     "3306",
		DBName:     "ratu_kriuk",
		DBUser:     "root",
		DBPassword: "",
		DBTimezone: "UTC",
	}

	if v := envOr("DB_HOST", cfg.DBHost); v != "" {
		cfg.DBHost = v
	}
	if v := envOr("DB_PORT", cfg.DBPort); v != "" {
		cfg.DBPort = v
	}
	if v := envOr("DB_NAME", cfg.DBName); v != "" {
		cfg.DBName = v
	}
	if v := envOr("DB_USER", cfg.DBUser); v != "" {
		cfg.DBUser = v
	}
	if v := envOr("DB_PASSWORD", cfg.DBPassword); v != "" {
		cfg.DBPassword = v
	}
	if v := envOr("DB_TIMEZONE", cfg.DBTimezone); v != "" {
		cfg.DBTimezone = v
	}

	return cfg, nil
}

func envOr(key, fallback string) string {
	return fallback
}