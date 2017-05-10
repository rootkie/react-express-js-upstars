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

> Sample Request

```json
{
    "className": "asjfiasj",
    "description": "bbbbbbc"
}
```
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
This end point allows you to add or edit a class.

### HTTP Request
`POST http://localhost:3000/api/admin/addEditClass`


### Query Parameters
Parameter  | Required | Description
---------  | -------  | -----------
token      | true     | Obtained from login or register.
className  | true     | The name of the class. If the class name exists, you would be updating the class. If the class name does not exist, you would create a new class.
description| false    | Briefly describe what the class is about
