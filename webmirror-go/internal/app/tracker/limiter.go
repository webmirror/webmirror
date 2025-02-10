package tracker

import (
	"time"

	"github.com/valkey-io/valkey-go"
	"github.com/valkey-io/valkey-go/valkeylimiter"
)

func MustOpenLimiter(
	databaseAddr, databasePass string, disableCache bool,
) valkeylimiter.RateLimiterClient {
	limiter, err := valkeylimiter.NewRateLimiter(
		valkeylimiter.RateLimiterOption{
			ClientOption: valkey.ClientOption{
				InitAddress:  []string{databaseAddr},
				Password:     databasePass,
				SelectDB:     LimitID,
				DisableCache: disableCache,
			},
			KeyPrefix: "mirror-registration-requests",
			Limit:     1,
			Window:    time.Second,
		},
	)
	if err != nil {
		panic(err)
	}
	return limiter
}
