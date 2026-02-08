# Authentication Systems

This repository demonstrates the evolution of backend authentication mechanisms through practical implementations. It covers multiple real-world authentication strategies, starting from traditional session-based authentication to modern token-based systems used in production-grade applications. Each folder represents a distinct authentication approach with clear separation and use cases.

## Included Authentication Types

* **Auth-v1-Session-Based**
  Traditional session-based authentication using server-side sessions and cookies.

* **Auth-v2-Bearer-Token-Authentication**
  Token-based authentication where a bearer token is sent with each request.

* **Auth-v3-JWT-Authentication-Single-Token-Approach**
  Stateless authentication using a single JWT for user verification.

* **Auth-v4-JWT-Access-Token-Authentication**
  Improved JWT-based authentication using short-lived access tokens.

* **Auth-v5-Access-Refresh-Token-Authentication-System**
  Production-ready authentication system using access and refresh tokens for better security and scalability.

## Purpose

This repository is designed for learning, comparison, and reference. It helps understand when and why to use a specific authentication strategy in backend development, especially in Node.js-based applications.
