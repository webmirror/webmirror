package cli

import (
	"crypto/sha256"
	"encoding/base32"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path"
	"path/filepath"
	"strings"
)

func MainDescribe(dirPath string) {
	contents := make(map[string]any)
	err := filepath.WalkDir(dirPath, func(path_ string, dirent fs.DirEntry, err error) error {
		if dirent.IsDir() {
			if dirent.Name() == ".webmirror" {
				return filepath.SkipDir
			}
			return nil
		}

		digest, size, err := hashFile(path_)
		if err != nil {
			return err
		}

		relPath, err := filepath.Rel(dirPath, path_)
		if err != nil {
			return err
		}

		contents[relPath] = map[string]any{
			"digest": base32Encode(digest),
			"size":   size,
		}

		return nil
	})
	if err != nil {
		panic(err)
	}

	webmirrorDir := path.Join(dirPath, ".webmirror")
	err = os.MkdirAll(webmirrorDir, 0755)
	if err != nil {
		panic(err)
	}

	desc, err := os.Create(path.Join(webmirrorDir, "directory-description.json"))
	if err != nil {
		panic(err)
	}
	defer desc.Close()

	hash := sha256.New()
	encoder := json.NewEncoder(io.MultiWriter(desc, hash))
	encoder.SetEscapeHTML(false)
	encoder.SetIndent("", "\t")
	err = encoder.Encode(contents)
	if err != nil {
		panic(err)
	}
	digest := base32Encode(hash.Sum(nil))

	digestF, err := os.Create(path.Join(webmirrorDir, "digest.txt"))
	if err != nil {
		panic(err)
	}
	defer digestF.Close()

	fmt.Fprintln(digestF, digest)

	wd, err := os.Getwd()
	if err != nil {
		panic(err)
	}
	relDirPath, err := filepath.Rel(wd, dirPath)
	if err != nil {
		panic(err)
	}

	fmt.Printf("%s  %s\n", digest, relDirPath)
}

func base32Encode(bs []byte) string {
	return strings.ToLower(base32.StdEncoding.WithPadding(base32.NoPadding).EncodeToString(bs))
}

func hashFile(filePath string) ([]byte, int64, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, 0, err
	}
	defer file.Close()

	hash := sha256.New()

	n, err := io.Copy(hash, file)
	if err != nil {
		return nil, 0, err
	}

	return hash.Sum(nil), n, nil
}
