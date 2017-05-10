# Students

Most of the end points here need a token.

Token can be stored in request body using json `{ "token":"jsadifjiasdjifjdsi" }`.

token can be stored in `x-access-token:jsadifjiasdjifjdsi` header as well.



## Get All Students
This end point retrieves all classes
### HTTP Request
`GET http://localhost:3000/api/admin/getStudents`
### Query Parameters
Parameter | Required | Description
--------- | ------- | -----------
token     | true    | Obtained from login or register.



## Get Student by ID
This end point allows you get the information on a single class by id
### HTTP Request
`GET http://localhost:3000/api/admin/getStudent/:id`
Example:
`GET http://localhost:3000/api/admin/getStudent/591062e9edea5d1ce9fef38d`

### Query Parameters
Parameter | Required | Description
--------- | ------- | -----------
token     | true    | Obtained from login or register.
id        | true    | The id of the student you are querying



## Add or Edit Student
> Sample Response

```json
{
  "status": "success",
  "student": {
    "_id": "591340a3feb50d20135ee32a",
    "updatedAt": "2017-05-10T16:32:35.158Z",
    "schoolName": "jsaidjfias school",
    "__v": 0,
    "createdAt": "2017-05-10T16:32:35.158Z",
    "classes": [],
    "schoolType": "Primary",
    "profile": {
      "name": "gggggasasa",
      "icNumber": "s999293398g",
      "email": "email@email.com",
      "contactNumber": 928747282,
      "dateOfBirth": "19990101",
      "address": "assdaiasoi",
      "gender": "Male"
    }
  }
}
```
This end point allows you to add or edit a class description

### HTTP Request
`POST http://localhost:3000/api/admin/addEditStudent`

### Query Parameters
Parameter  | Required | Description
---------  | -------  | -----------
token      | true     | Obtained from login or register.
icNumber   | true     | The ic number of the student. If the student exists, you would be updating the student. If the student does not exist, you would create a new student.
name       | false    | Name of the student
email      | false    | Email of the student, might be used to send email to the student about attendance
contactNumber | false | The contact number of the student
dateOfBirth| false    | Date of birth should follow the date format of "yyyymmdd"
address    | false    | Full address of the student
gender     | false    | Gender of the student. "Male" or "Female".

