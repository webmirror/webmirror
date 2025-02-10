package tracker

import "github.com/hibiken/asynq"

func MustOpenQueue(databaseAddr, databasePass string) *asynq.Client {
	queue := asynq.NewClient(asynq.RedisClientOpt{
		Addr:     databaseAddr,
		Password: databasePass,
		DB:       QueueID,
	})
	err := queue.Ping()
	if err != nil {
		panic(err)
	}
	return queue
}
