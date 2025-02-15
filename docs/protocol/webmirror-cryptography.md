# WebMirror Cryptography

Some questions you may have about the set of cryptographic decisions taken in
WebMirror and their answers.

## Why SHA-2?

Because SHA-2 has been a safe choice [3, 6, 7] for the past 24 years and _still
is_ [1, 2], in addition to enjoying first-class support in the Web Cryptography
API \[4] and Subresource Integrity \[5].

### Sources

1. Latacora, "Cryptographic Right Answers: Post Quantum Edition", 2024.
   [Online]. Available:
   <https://www.latacora.com/blog/2024/07/29/crypto-right-answers-pq/>
2. National Institute of Standards and Technology, "NIST's Policy on Hash
   Functions", 2022. [Online]. Available:
   <https://csrc.nist.gov/projects/hash-functions/nist-policy-on-hash-functions>
3. Latacore, "Cryptographic Right Answers", 2018. [Online]. Available:
   <https://www.latacora.com/blog/2018/04/03/cryptographic-right-answers/>
4. World Wide Web Consortium, "Web Cryptography API", 2017. [Online]. Available:
   <https://www.w3.org/TR/WebCryptoAPI/>
5. World Wide Web Consortium, "Subresource Integrity", 2016. [Online].
   Available: <https://www.w3.org/TR/SRI/>
6. T. H. Ptacek, "Cryptographic Right Answers", 2015. [Online]. Available:
   <https://gist.github.com/tqbf/be58d2d39690c3b366ad/0045653bc8313a622a9fe429b193e6788c961fe0>
7. C. Percival, "Cryptographic Right Answers", 2009. [Online]. Available:
   <https://www.daemonology.net/blog/2009-06-11-cryptographic-right-answers.html>

## Why SHA-256?

Because SHA-256 is the only hash function in the SHA-2 family that is both
supported in the Web and whose Base32-encoded [2] output fits in a DNS label (≤
63 characters [3]).

Fitting in DNS label is crucial for subdomain-addressing (e.g.
https://myhash.webmirror.app/dir/file.ext), which enables strong isolation of
different mirrored-sites thanks to same-origin policy [1].

| Hash        | Web Support? | Output (bits) | Base32 (chars) | Fits in DNS label? |
| :---------- | :----------: | ------------: | -------------: | :----------------: |
| SHA-224     |      -       |           224 |             45 |         +          |
| SHA-256     |      +       |           256 |             52 |         +          |
| SHA-384     |      +       |           384 |             77 |         -          |
| SHA-512     |      +       |           512 |            103 |         -          |
| SHA-512/224 |      -       |           224 |             45 |         +          |
| SHA-512/256 |      -       |           256 |             52 |         +          |

### Sources

1. _The Web Origin Concept_, RFC 6454, December 2011. \[Online]. Available:
   <https://www.rfc-editor.org/info/rfc6454>
1. _The Base16, Base32, and Base64 Data Encodings_, RFC 4648, October 2006.
   \[Online]. Available: <https://www.rfc-editor.org/info/rfc4648>
1. _Clarifications to the DNS Specification_, RFC 2181, July 1997. \[Online].
   Available: <https://www.rfc-editor.org/info/rfc2181>

## Why non-canonical JSON?

Because canonical JSON is not well-defined nor widely supported to rely on.
There have been multiple attempts to define a canonicalization scheme for JSON
[1, 2, 3, 4] and even the standard one \[1] is too complex to implement. In
contrast, the benefits of canonical JSON is not as clear.

### The complexity

- As per _JSON Canonicalization Scheme_ (RFC 8785), property names of objects
  are to be encoded in UTF-16, sorted lexicographically, and output to be
  re-encoded in UTF-8.
- Shall clients reject non-canonical but otherwise valid JSON?
  - If yes, can clients check if a JSON is canonical without having to
    re-serialize it? In other words, would every client now also require a
    canonical JSON serializer in addition to a parser?
- Are there any established canonical JSON parsers/serializer libraries that we
  can use?
  - If not, we would have to test existing libraries and may even have to write
    one ourselves.
- What would be the performance cost of using canonical JSON?
  - Both because of a more expensive scheme that requires multiple re-encodings
    and using less-optimized libraries.

### Sources

1. _JSON Canonicalization Scheme (JCS)_, RFC 8785, June 2020. \[Online].
   Available: <https://www.rfc-editor.org/info/rfc8785>
2. _JSON Web Key (JWK) Thumbprint_, RFC 7638, September 2015. \[Online].
   Available: <https://www.rfc-editor.org/info/rfc7638>
3. _JSON Canonical Form_, draft-staykov-hu-json-canonical-form-00, 7
   November 2012. \[Online]. Available:
   <https://datatracker.ietf.org/doc/draft-staykov-hu-json-canonical-form/00/>
4. One Laptop per Child, "Canonical JSON". \[Online]. Available:
   <https://wiki.laptop.org/go/Canonical_JSON>
