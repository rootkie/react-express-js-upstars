# Attendance
Most of the end points here need a token.

Token can be stored in request body using json `{ "token":"jsadifjiasdjifjdsi" }`.

token can be stored in `x-access-token:jsadifjiasdjifjdsi` header as well.

## Add or Edit attendance
> Sample Request

```json
{
  "date":"20170102",
  "hours":"2",
  "classId":"59098787aa54171143d3f3ae",
  "tutors":["5908abfad4d25a79a80a9c53","5908ac4bd4d25a79a80a9c54"],
  "students":["591062e9edea5d1ce9fef38d","591064c77780a11e23d72705"]
}
```
>Sample Response

```json
{
  "status": "success",
  "attendance": {
    "_id": "5911b6cbd561f5261220dd17",
    "class": "59098787aa54171143d3f3ae",
    "updatedAt": "2017-05-10T15:53:59.937Z",
    "hours": 2,
    "__v": 0,
    "createdAt": "2017-05-09T12:32:11.073Z",
    "students": [
      "591062e9edea5d1ce9fef38d",
      "591064c77780a11e23d72705"
    ],
    "tutors": [
      "5908abfad4d25a79a80a9c53",
      "5908ac4bd4d25a79a80a9c54"
    ],
    "date": "2017-01-02T00:00:00.000Z"
  }
}
```
This end point allows you to add a new attendance or edit an existing one.

If there is a matching date and class record, it will update the record. Else it will create a new record

### HTTP Request
`POST http://localhost:3000/api/admin/addEditAttendance`

### Query Parameters
Parameter  | Required | Description
---------  | -------  | -----------
token      | true     | Obtained from login or register.
date       | true     | Date is a string in the format of "yyyymmdd"
hours      | true     | This is the duration of the class. Also used to tabulate the CIP hours of the tutor
classId    | true     | The _id of the class.
tutors     | true     | An array of the tutors' _id
students   | true     | An array of the students' _id



## Delete Attendance
> Sample Response:

```json
{
  "status": "success",
  "removed": {
    "n": 1,
    "ok": 1
  }
}
```

This end point allows you to delete the attendance of a class on a particular day

### HTTP Request
`POST http://localhost:3000/api/admin/deleteAttendance`

### Query Parameters
Parameter  | Required | Description
---------  | -------  | -----------
token      | true     | Obtained from login or register.
date       | true     | Date is a string in the format of "yyyymmdd"
classId    | true     | The _id of the class.



## Get Attendance Between 2 dates
> Sample Response 

```json
{
  "status": "success",
  "foundAttendance": [
    {
      "_id": "591339d4d561f5261221069f",
      "class": "59098787aa54171143d3f3ae",
      "updatedAt": "2017-05-10T16:03:32.595Z",
      "hours": 2,
      "__v": 0,
      "createdAt": "2017-05-10T16:03:32.595Z",
      "students": [
        "591062e9edea5d1ce9fef38d",
        "591064c77780a11e23d72705"
      ],
      "tutors": [
        "5908abfad4d25a79a80a9c53",
        "5908ac4bd4d25a79a80a9c54"
      ],
      "date": "2017-01-02T00:00:00.000Z"
    },
    {
      "_id": "591339f0d561f526122106a7",
      "class": "59098787aa54171143d3f3ae",
      "updatedAt": "2017-05-10T16:04:00.180Z",
      "hours": 2,
      "__v": 0,
      "createdAt": "2017-05-10T16:04:00.180Z",
      "students": [
        "591062e9edea5d1ce9fef38d",
        "591064c77780a11e23d72705"
      ],
      "tutors": [
        "5908abfad4d25a79a80a9c53",
        "5908ac4bd4d25a79a80a9c54"
      ],
      "date": "2017-01-03T00:00:00.000Z"
    }
  ]
}
```
This end point allows you to find all the attendance of a class between 2 dates.

### HTTP Request
`POST http://localhost:3000/api/admin/getAttendanceBetween`

### Query Parameters
Parameter  | Required | Description
---------  | -------  | -----------
token      | true     | Obtained from login or register.
dateStart  | true     | Date is a string in the format of "yyyymmdd"
dateEnd    | true     | Date is a string in the format of "yyyymmdd"
classId    | true     | The _id of the class.



## Get Attendance By Class
> Sample response

```json
{
  "status": "success",
  "foundAttendances": [
    {
      "_id": "591339d4d561f5261221069f",
      "class": "59098787aa54171143d3f3ae",
      "updatedAt": "2017-05-10T16:03:32.595Z",
      "hours": 2,
      "__v": 0,
      "createdAt": "2017-05-10T16:03:32.595Z",
      "students": [
        "591062e9edea5d1ce9fef38d",
        "591064c77780a11e23d72705"
      ],
      "tutors": [
        "5908abfad4d25a79a80a9c53",
        "5908ac4bd4d25a79a80a9c54"
      ],
      "date": "2017-01-02T00:00:00.000Z"
    },
    {
      "_id": "591339f0d561f526122106a7",
      "class": "59098787aa54171143d3f3ae",
      "updatedAt": "2017-05-10T16:04:00.180Z",
      "hours": 2,
      "__v": 0,
      "createdAt": "2017-05-10T16:04:00.180Z",
      "students": [
        "591062e9edea5d1ce9fef38d",
        "591064c77780a11e23d72705"
      ],
      "tutors": [
        "5908abfad4d25a79a80a9c53",
        "5908ac4bd4d25a79a80a9c54"
      ],
      "date": "2017-01-03T00:00:00.000Z"
    }
  ]
}
```
This end point allows you to find all the attendance of a class

### HTTP Request
`GET http://localhost:3000/api/admin/getAttendanceByClass/:classId`
Example:
`GET http://localhost:3000/api/admin/getAttendanceByClass/59098787aa54171143d3f3ae`

### Query Parameters
Parameter  | Required | Description
---------  | -------  | -----------
token      | true     | Obtained from login or register.
classId    | true     | The _id of the class.



## Get Attendance By User
> Sample response

```json
{
  "status": "success",
  "foundAttendances": [
    {
      "_id": "591339d4d561f5261221069f",
      "class": "59098787aa54171143d3f3ae",
      "updatedAt": "2017-05-10T16:03:32.595Z",
      "hours": 2,
      "__v": 0,
      "createdAt": "2017-05-10T16:03:32.595Z",
      "students": [
        "591062e9edea5d1ce9fef38d",
        "591064c77780a11e23d72705"
      ],
      "tutors": [
        "5908abfad4d25a79a80a9c53",
        "5908ac4bd4d25a79a80a9c54"
      ],
      "date": "2017-01-02T00:00:00.000Z"
    },
    {
      "_id": "591339f0d561f526122106a7",
      "class": "59098787aa54171143d3f3ae",
      "updatedAt": "2017-05-10T16:04:00.180Z",
      "hours": 2,
      "__v": 0,
      "createdAt": "2017-05-10T16:04:00.180Z",
      "students": [
        "591062e9edea5d1ce9fef38d",
        "591064c77780a11e23d72705"
      ],
      "tutors": [
        "5908abfad4d25a79a80a9c53",
        "5908ac4bd4d25a79a80a9c54"
      ],
      "date": "2017-01-03T00:00:00.000Z"
    }
  ]
}
```
This end point allows you to find all the attendance of a class

### HTTP Request
`GET http://localhost:3000/api/admin/getAttendanceByUser/:userId`
Example:
`GET http://localhost:3000/api/admin/getAttendanceByUser/5908abfad4d25a79a80a9c53`

### Query Parameters
Parameter  | Required | Description
---------  | -------  | -----------
token      | true     | Obtained from login or register.
userId     | true     | The _id of the user (Tutor).



## Get Attendance By Student
> Sample response

```json
{
  "status": "success",
  "foundAttendances": [
    {
      "_id": "591339d4d561f5261221069f",
      "class": "59098787aa54171143d3f3ae",
      "updatedAt": "2017-05-10T16:03:32.595Z",
      "hours": 2,
      "__v": 0,
      "createdAt": "2017-05-10T16:03:32.595Z",
      "students": [
        "591062e9edea5d1ce9fef38d",
        "591064c77780a11e23d72705"
      ],
      "tutors": [
        "5908abfad4d25a79a80a9c53",
        "5908ac4bd4d25a79a80a9c54"
      ],
      "date": "2017-01-02T00:00:00.000Z"
    },
    {
      "_id": "591339f0d561f526122106a7",
      "class": "59098787aa54171143d3f3ae",
      "updatedAt": "2017-05-10T16:04:00.180Z",
      "hours": 2,
      "__v": 0,
      "createdAt": "2017-05-10T16:04:00.180Z",
      "students": [
        "591062e9edea5d1ce9fef38d",
        "591064c77780a11e23d72705"
      ],
      "tutors": [
        "5908abfad4d25a79a80a9c53",
        "5908ac4bd4d25a79a80a9c54"
      ],
      "date": "2017-01-03T00:00:00.000Z"
    }
  ]
}
```
This end point allows you to find all the attendance of a class

### HTTP Request
`GET http://localhost:3000/api/admin/getAttendanceByStudent/:studentId`
Example:
`GET http://localhost:3000/api/admin/getAttendanceByStudent/591062e9edea5d1ce9fef38d`

### Query Parameters
Parameter  | Required | Description
---------  | -------  | -----------
token      | true     | Obtained from login or register.
studentId  | true     | The _id of the student.
