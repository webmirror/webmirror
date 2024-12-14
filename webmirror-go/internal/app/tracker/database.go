package tracker

import (
	"database/sql"

	_ "github.com/mattn/go-sqlite3"
	"github.com/pkg/errors"
)

type Database struct {
	sqlDB *sql.DB
}

func Open(path string) (*Database, error) {
	sqlDB, err := sql.Open("sqlite3", path)
	if err != nil {
		return nil, errors.WithStack(err)
	}

	var userVersion int
	err = sqlDB.QueryRow("PRAGMA user_version").Scan(&userVersion)
	if err != nil {
		return nil, errors.WithStack(err)
	}

	switch userVersion {
	case 0:
		err = upgradeToV1(sqlDB)
		if err != nil {
			return nil, errors.WithStack(err)
		}
	}

	return &Database{
		sqlDB: sqlDB,
	}, nil
}

func upgradeToV1(sqlDB *sql.DB) error {
	_, err := sqlDB.Exec(`
		BEGIN EXCLUSIVE TRANSACTION;
		CREATE TABLE user (
			  id          INTEGER PRIMARY KEY
			, email       TEXT NOT NULL
			, token       TEXT NOT NULL
			, default_ttl INTEGER CHECK (default_ttl > 60)
		);
		CREATE TABLE server (
			  id         INTEGER PRIMARY KEY
			, digest     TEXT NOT NULL CHECK (octet_length(digest) = 52)
			, host       TEXT NOT NULL CHECK (host LIKE 'http://%' OR host LIKE 'https://%')
			, path       TEXT NOT NULL CHECK (path LIKE '%/')
			, url        TEXT NOT NULL GENERATED ALWAYS AS (host || path) VIRTUAL
			, user       INTEGER REFERENCES user(id)
			, expires_at INTEGER NOT NULL
		);
		CREATE UNIQUE INDEX server__url ON server (
			  host
			, path
		);
		CREATE INDEX server__unexpired ON server (
			  digest
			, expires_at
		);
		PRAGMA user_version=1;
		COMMIT TRANSACTION;
	`)
	return errors.WithStack(err)
}
