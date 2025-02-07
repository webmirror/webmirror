# WebMirror Documentation

WebMirror is a web-native protocol for secure, decentralised access to files
distributed across mirrors.

WebMirror consists of three major components:

1. Mirror Servers \
   Those who host and serve files to others.
   * Mirror Servers are ordinary HTTP servers.
1. Clients \
   Those who access and download files from Mirror Servers.
   * Browser-based Clients are typically Service Workers which work by transparently intercepting requests made from a website.
   * We are not working on any standalone Clients as of yet.
1. Trackers \
   Those who help Clients to discover Mirror Servers for a given dataset.
   * [OpenAPI Spec for Tracker API](../specifications/tracker.openapi.yaml)
   * WebMirror project maintains a freely available Tracker for public use at <https://tracker.webmirrors.org/> running **webmirror-tracker** software. 
     * [webmirror-tracker Architecture](./webmirror-tracker%20Architecture.md)

