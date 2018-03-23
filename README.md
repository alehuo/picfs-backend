# picfs-backend

Back-end for Full-stack software development project course

* Staging [URL]
* Production [URL]

## Installation instructions

1.  Clone the repo
2.  Install yarn if not yet installed
3.  Run `yarn` to install dependencies
4.  Create `.env` file and define environment variables. See `.env.example` file.
5.  `knex migrate:latest` to run migrations
6.  `knex seed:run` to seed the database
7.  `yarn start` to start the server

## API documentation

## /api/v1/users

#### GET /api/v1/users

_Returns:_ **A list of users registered in the service.**

_Response status code:_ **HTTP 200** (success), **HTTP 500** (server error)

_Response content-type:_ **application/json**

_Response body:_

```
[
  {
    "userId": 1,
    "username": "user1",
    "email": "user1@email.com",
    "firstName": "firstname",
    "lastName": "lastname",
    "unionId": 1
  },
  {
    "userId": 2,
    "username": "user2",
    "email": "user2@email.com",
    "firstName": "firstname",
    "lastName": "lastname",
    "unionId": 1
  },
  {
    "userId": 3,
    "username": "user3",
    "email": "user3@email.com",
    "firstName": "firstname",
    "lastName": "lastname",
    "unionId": 1
  }
]
```

#### GET /api/v1/users/:userId

_Returns:_ **Registered user if the request completes successfully**

_Request parameters:_ ```userId``` (URL parameter, integer)

_Response status code:_ **HTTP 200** (success), **HTTP 500** (server error)

_Response content-type:_ **application/json**

_Response body:_ **GET /api/v1/users/1**

```
  {
    "userId": 1,
    "username": "user1",
    "email": "user1@email.com",
    "firstName": "firstname",
    "lastName": "lastname",
    "unionId": 1
  }
```

#### POST /api/v1/users

_Returns:_ **Created user if the request succeeds**

_Request content-type:_ **application/json**

_Request body:_ 

Required: ```username```, ```email``` and ```password```

```
  {
    "username": "user1",
    "email": "user1@email.com",
    "password": "password1",
    "firstName": "firstname",
    "lastName": "lastname",
    "unionId": 1
  }
```

_Response status code:_ **HTTP 201** (success on user creation), **HTTP 4xx** (validation error or user already exists), **HTTP 500** (server error)

_Response content-type:_ **application/json**

_Response body:_ Created user

```
  {
    "userId": 1,
    "username": "user1",
    "email": "user1@email.com",
    "firstName": "firstname",
    "lastName": "lastname",
    "unionId": 1
  }
```
## /api/v1/users/:userId/permissions

_Returns:_ **Permissions of the user if the request completes successfully**

_Request parameters:_ ```userId``` (URL parameter, integer)

_Request headers:_ ```Authorization: Bearer {TOKEN}``` (Requires user to be authenticated)

_Response status code:_ **HTTP 200** (success), **HTTP 500** (server error)

_Response content-type:_ **application/json**

_Response body:_ **GET /api/v1/users/1/permissions**

```
{  
   "userId": 1,
   "permissions": {
      "banUser": false,
      "editUserRole": false,
      "makeUserAdmin": false,
      "allowUserLogin": true,
      "addKeyToUser": false,
      "removeKeyFromUser": false,
      "changeKeyTypeOfUser": false,
      "allowViewKeys": true,
      "addUserToUnion": false,
      "removeUserFromUnion": false,
      "addStudentUnion": false,
      "removeStudentUnion": false,
      "editStudentUnion": false,
      "allowViewStudentUnions": true,
      "addEvent": false,
      "editEvent": false,
      "removeEvent": false,
      "allowViewEvents": true,
      "editRules": false,
      "allowViewRules": true,
      "addOwnPost": false,
      "editOwnPost": false,
      "removeOwnPost": false,
      "allowViewNews": true,
      "editOthersPosts": false,
      "removeOthersPosts": false,
      "sendMails": false
   }
}
```