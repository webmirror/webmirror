package tracker

import (
	"context"

	"github.com/redis/go-redis/v9"
)

const MirrorID = 0
const LimitID = 1
const QueueID = 2

func MustOpenMirrorDB(addr, pass string) *redis.Client {
	return mustOpenDB(addr, pass, MirrorID)
}

func mustOpenDB(addr, pass string, db int) *redis.Client {
	rdb := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: pass,
		DB:       db,
	})
	if err := rdb.Ping(context.Background()).Err(); err != nil {
		panic(err)
	}
	return rdb
}
