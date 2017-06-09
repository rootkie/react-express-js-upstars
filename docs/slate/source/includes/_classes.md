# Classes
Most of the end points here need a token.

Token can be stored in request body using json `{ "token":"jsadifjiasdjifjdsi" }`.

token can be stored in `x-access-token:jsadifjiasdjifjdsi` header as well.



## Get All Classes
This end point retrieves all classes
### HTTP Request
`GET http://localhost:3000/api/admin/getClasses`
### Query Parameters
Parameter | Required | Description
--------- | ------- | -----------
token     | true    | Obtained from login or register.



## Get Class by ID
This end point allows you get the information on a single class by id
### HTTP Request
`GET http://localhost:3000/api/admin/getClass/:id`
Example:
`GET http://localhost:3000/api/admin/getClass/5e0c1271185c3ea1cdd425b65`

### Query Parameters
Parameter | Required | Description
--------- | ------- | -----------
token     | true    | Obtained from login or register.
id        | true    | The id of the class you are querying



## Add or Edit Class
> Sample Response

```json
{
  "status": "success",
  "class": {
    "_id": "590f2bd0d561f5261220b882",
    "className": "asjfiasj",
    "updatedAt": "2017-05-10T15:11:26.849Z",
    "description": "bbbbbbc",
    "__v": 48,
    "createdAt": "2017-05-07T14:14:40.810Z",
    "students": []
  }
}
```
This end point allows you to add or edit a class description

### HTTP Request
`POST http://localhost:3000/api/admin/addEditClass`

### Query Parameters
Parameter  | Required | Description
---------  | -------  | -----------
token      | true     | Obtained from login or register.
className  | true     | The name of the class. If the class name exists, you would be updating the class. If the class name does not exist, you would create a new class.
description| false    | Briefly describe what the class is about



## Add Student To Class
> Sample Response

```json
{
  "class": {
    "_id": "59098787aa54171143d3f3ae",
    "updatedAt": "2017-05-08T16:16:05.692Z",
    "createdAt": "2017-05-03T07:32:23.406Z",
    "className": "ajsidjfais11231221",
    "description": "jdsiafjsidjfiasjdiidsa",
    "__v": 9,
    "students": [
      "591062e9edea5d1ce9fef38d",
      "591064c77780a11e23d72705"
    ]
  },
  "studentAdded": [
    {
      "_id": "591064c77780a11e23d72705",
      "updatedAt": "2017-05-08T16:16:05.685Z",
      "createdAt": "2017-05-08T12:29:59.793Z",
      "schoolName": "jsaidjfias school",
      "__v": 3,
      "classes": [
        "59098787aa54171143d3f3ae"
      ],
      "schoolType": "Primary",
      "profile": {
        "name": "gggggasasa",
        "icNumber": "s999299998g",
        "email": "email@email.com",
        "contactNumber": 99999999,
        "dateOfBirth": "19990101",
        "address": "assdaiasoi",
        "gender": "Male"
      }
    }
  ]
}
```
This end point allows you to add a single student to a single class.

### HTTP Request
`POST http://localhost:3000/api/admin/addStudentToClass`

### Query Parameters
Parameter  | Required | Description
---------  | -------  | -----------
token      | true     | Obtained from login or register.
classId    | true     | The id of the class.
studentId  | true     | The id of the student



## Delete Student From Class
>Sample Response

```json
{
  "status": "removed",
  "studentRemoved": {
    "_id": "591064c77780a11e23d72705",
    "updatedAt": "2017-05-10T15:37:19.363Z",
    "createdAt": "2017-05-08T12:29:59.793Z",
    "schoolName": "jsaidjfias school",
    "__v": 4,
    "classes": [],
    "schoolType": "Primary",
    "profile": {
      "name": "gggggasasa",
      "icNumber": "s999299998g",
      "email": "email@email.com",
      "contactNumber": 928747282,
      "dateOfBirth": "19990101",
      "address": "assdaiasoi",
      "gender": "Male"
    }
  }
}
```

This end point allows you to delete a student from a class

### HTTP Request
`POST http://localhost:3000/api/admin/deleteStudentFromClass`

### Query Parameters
Parameter  | Required | Description
---------  | -------  | -----------
token      | true     | Obtained from login or register.
classId    | true     | The id of the class.
studentId  | true     | The id of the student



## Add User/Tutor To Class
> Sample Response

```json
{
  "class": {
    "_id": "59098787aa54171143d3f3ae",
    "updatedAt": "2017-05-11T05:46:29.848Z",
    "createdAt": "2017-05-03T07:32:23.406Z",
    "className": "ajsidjfais11231221",
    "description": "jdsiafjsidjfiasjdiidsa",
    "__v": 11,
    "users": [
      "5908abfad4d25a79a80a9c53"
    ],
    "students": [
      "591062e9edea5d1ce9fef38d"
    ]
  },
  "user": {
    "_id": "5908abfad4d25a79a80a9c53",
    "updatedAt": "2017-05-11T05:46:29.887Z",
    "createdAt": "2017-05-02T15:55:38.974Z",
    "email": "test@email.com",
    "password": "$2a$05$LL4N.Iomc66RvuEQFBTmI.1tLxcQU4o4KDLAfn6f0bPetfwwzRQpy",
    "__v": 0,
    "classes": [
      "59098787aa54171143d3f3ae"
    ],
    "role": "Member",
    "profile": {
      "firstName": "Wong",
      "lastName": "Sarah"
    }
  }
}
```
This end point allows you to add a single student to a single class.

### HTTP Request
`POST http://localhost:3000/api/admin/addUserToClass`

### Query Parameters
Parameter  | Required | Description
---------  | -------  | -----------
token      | true     | Obtained from login or register.
classId    | true     | The _id of the class.
userId     | true     | The _ic of the user.



## Delete User/Tutor From Class
>Sample Response

```json
{
  "class": {
    "_id": "59098787aa54171143d3f3ae",
    "updatedAt": "2017-05-11T05:47:35.330Z",
    "createdAt": "2017-05-03T07:32:23.406Z",
    "className": "ajsidjfais11231221",
    "description": "jdsiafjsidjfiasjdiidsa",
    "__v": 11,
    "users": [],
    "students": [
      "591062e9edea5d1ce9fef38d"
    ]
  },
  "user": {
    "_id": "5908abfad4d25a79a80a9c53",
    "updatedAt": "2017-05-11T05:47:35.347Z",
    "createdAt": "2017-05-02T15:55:38.974Z",
    "email": "test@email.com",
    "password": "$2a$05$LL4N.Iomc66RvuEQFBTmI.1tLxcQU4o4KDLAfn6f0bPetfwwzRQpy",
    "__v": 0,
    "classes": [],
    "role": "Member",
    "profile": {
      "firstName": "Wong",
      "lastName": "Sarah"
    }
  }
}
```

This end point allows you to delete a student from a class

### HTTP Request
`POST http://localhost:3000/api/admin/deleteStudentFromClass`

### Query Parameters
Parameter  | Required | Description
---------  | -------  | -----------
token      | true     | Obtained from login or register.
classId    | true     | The _id of the class.
userId     | true     | The _ic of the user.