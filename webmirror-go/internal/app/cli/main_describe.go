package cli

import (
	"crypto/sha256"
	"crypto/sha512"
	"encoding/base32"
	"encoding/json"
	"fmt"
	"hash"
	"io"
	"io/fs"
	"os"
	"path"
	"path/filepath"
	"strings"
)

func MainDescribe(dirPath, chf string) {
	var fileHasher hash.Hash
	switch chf {
	case "sha256":
		fileHasher = sha256.New()
	case "sha384":
		fileHasher = sha512.New384()
	case "sha512":
		fileHasher = sha512.New()
	default:
		panic(fmt.Errorf("unknown cryptographic hash function: %s", chf))
	}

	contents := make(map[string]any)
	err := filepath.WalkDir(dirPath, func(path_ string, dirent fs.DirEntry, err error) error {
		if dirent.IsDir() {
			if dirent.Name() == ".webmirror" {
				return filepath.SkipDir
			}
			return nil
		}

		digest, size, err := hashFile(fileHasher, path_)
		if err != nil {
			return err
		}

		relPath, err := filepath.Rel(dirPath, path_)
		if err != nil {
			return err
		}

		contents[relPath] = map[string]any{
			"hash": map[string]any{
				"function": chf,
				"digest":   base32Encode(digest),
			},
			"size": size,
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
	fmt.Fprintf(
		digestF,
		""+
			"\n"+
			"The digest above is the SHA-256 digest of the `directory-description.json`.\n"+
			"\n"+
			"Directory Descriptions are always hashed using SHA-256, regardless of the hash\n"+
			"function chosen for files.\n",
	)

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

func hashFile(hasher hash.Hash, filePath string) ([]byte, int64, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, 0, err
	}
	defer file.Close()

	hasher.Reset()

	n, err := io.Copy(hasher, file)
	if err != nil {
		return nil, 0, err
	}

	return hasher.Sum(nil), n, nil
}
