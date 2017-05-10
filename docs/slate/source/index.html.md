---
title: Upstars API Reference

language_tabs:
  - json
toc_footers:
  - <a href='https://github.com/tripit/slate'>Documentation Powered by Slate</a>

includes:
  - students
  - classes
  - attendance
  - errors

search: true
---

# Introduction

Welcome to upstars volunteer management system API documentation. You won't need a developer key for now....

# Registration
> Sample response:

```json
{
  "token": "eyJhbGciO...(truncated)",
  "user": {
    "_id": "5913271185c3ea1cdd425b65",
    "firstName": "a",
    "lastName": "a",
    "role": "Member",
    "email": "a@a.com"
  },
  "status": "success"
}
```
### HTTP Request
`POST http://localhost:3000/api/register`

### Query Parameters

Parameter | Required | Description
--------- | ------- | -----------
email     | true    | Used to login to the system
password  | true    | Used to login to the system
firstName | true    | The displayed name
lastName  | true    | The displayed name



# Authentication
> Sample request:

```json
{ 
  "email": "a@a.com",
  "password": "a",
}
```
> Sample response:

```json
{
  "token": "eyJhbGciO...(truncated)",
  "user": {
    "_id": "5913271185c3ea1cdd425b65",
    "firstName": "a",
    "lastName": "a",
    "role": "Member",
    "email": "a@a.com"
  },
  "status": "success"
}
```
### HTTP Request
`POST http://localhost:3000/api/login`

### Query Parameters
Parameter | Required | Description
--------- | ------- | -----------
email     | true    | Used to login to the system
password  | true    | Used to login to the system

