## Guide on backend stuff
***
### Getting Started
 - Refer to the [documentation](https://github.com/rootkie/react-express-js-upstars/wiki) for sample input guides
 - Generate a token that lasts 100 hours by calling this API with this input with postman
 ```
 API: /api/generateAdminUser
 
 sample input: (Note email must be unique to any used previously)
 {	
    "email": "test@gmail.com",
    "password": "password",
    "profile": {
    	"name": "Admin",
    	"gender": "M",
    	"dob": 123,
    	"nationality": "SG",
    	"nric": "S1102s",
    	"address": "Blk Scrub",
    	"postalCode": 122222,
    	"homephone": 123,
    	"handphone": 123,
    }
}
 ```
 
 Sample Output:
 ```
 {
    "status": "success",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTc1YjgyYmJkZmE4NTBiYTk2NWI0N2UiLCJyb2xlcyI6WyJTdXBlckFkbWluIl0sInN0YXR1cyI6IlBlbmRpbmciLCJjbGFzc2VzIjpbXSwiaWF0IjoxNTAwODg3MDgzLCJleHAiOjE1MDEyNDcwODN9.s5I8kCneUd8K9OrSqH6EvQCNyZUNgwN_zl789cD_Yns",
    "_id": "5975b82bbdfa850ba965b47e",
    "roles": [
        "SuperAdmin"
    ]
}

**You can decode it but the email isn't the test@gmail because I created it before already**
 ```
 - Contains the token, userId and roles. (Only usual user log in will return user's name for frontend to display)
 - Use the token wisely to access any API in the system. You are the SuperAdmin.
