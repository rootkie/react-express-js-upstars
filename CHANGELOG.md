# Change Log

## [0.7.0-beta](https://github.com/rootkie/react-express-js-upstars/tree/v0.7.0-beta) (June 10, 2019, 9.03pm)
- [Bump] Version to 0.7.0-beta
- [Added] Mongoose schema validation as add-on
- [Changed] Tests data and fixes such as proper nric
- [Fixed] Wrong routes link
- [Added] Better UX in volunteer registration
- [Fixed] Yup flagging undefined as a poor date
- [Removed] function which forces user email to be lowercase
- [Added] Better percentage figures in AttendanceSummary
- [Fixed] Wrong prop types in multiple files
- [Fixed] API cancellation bug resulted from changing tabs
- [Added] Memo and better performance to topbar and sidebar
- [Added] Better performance to login page
- [Added] useMemo and useCallback hooks to edit and add forms
- [Added] Code splitting in dashboard
- [Fixed] Missing state property causing memory leak
- [Moved] React-scripts from dev to main dependencies
- [Deleted] Experimental jest code
- [Changed] Main Index.html source
- [Added] Support for remote IP logging
- [Added] noCache in all API calls
- [Fixed] Ordered listing wrong in Tutor page
- [Fixed] New SEO links on Robots and Sitemap
- [Updated] Multiple npm packages
- [Added] NoScript warning
- [Changed] BodyParser removed to use express built in middleware
- [Removed] Deprecated package and install newer bcrypt
- [Removed] Support for all IE versions
- [Added] Compressed Image files for web support
- [Added] Mongoose connection pooling support
- [Fixed] Class cloning is fixed to add new classId to student and user
- [Fixed] JS Linting to standardise all files
- [Added] Better README troubleshooting steps
- [Fixed] Loading screen will not disappear when there are errors in Student Edit
- [Fixed] Fields validation in class adding when option is selected as 'Enrichment'
- [Changed] Better percentage in All Class Attendance Summary
- [Changed] Better UX for Student Registration

## [v0.6.1-beta](https://github.com/rootkie/react-express-js-upstars/tree/v0.6.1-beta) (May 12, 2019, 10.50am)
- [Bump] Versions of UPStars software
- [Changed] In-line code documentation
- [Changed] All Classes Functions to Hooks
- [Changed] Break classEdit to 3 files for easy maintenance
- [Added] Clone Function for classes
- [Fixed] Refresh token not working for Pending users
- [Fixed] Clone Class Name incorrect
- [Fixed] useEffect to work properly when changing URLs
- [Changed] Student related files to Hooks
- [Fixed] Student related bugs left in 0.6.0-beta
- [Changed] Student Models with adjustments from Number to String
- [Changed] Dump file data for testing
- [Fixed] Home page overflow UI issues
- [Added] Tooltips to show timing stats
- [Changed] Better handling of map functions in JSX
- [Added] Yup validation in multiple forms
- [Updated] Semantic-ui-react npm package
- [Added] Textarea support for admin notes
- [Added] Readonly to NRIC fields
- [Changed] VolunteerWrap and VolunteerChangePassword to Hook
- [Changed] VolunteerView to Hooks
- [Added] Split the User Edit file to multiple functional components
- [Fixed] Standardised formatting for all pages to have white margin at bottom of page
- [Fixed] CSS of user pages
- [Fixed] Wrong regex functions in Yup cause breaking edits
- [Added] Force npm start to run in port 3001 by default
- [Fixed] User schema breaking because of missing admin fields
- [Added] Gender is missed out in the edit form
- [Changed] AttendanceWrap to Hooks
- [Changed] AttendanceForm to Hooks 
- [Changed] Backend error text to be clearer
- [Changed] AttendanceSearch to Hooks
- [Changed] AttendanceView to Hooks
- [Added] Shared AddEdit form for both functions
- [Changed] AttendanceUser and AttendanceStudent to Hooks
- [Fixed] Issue with loading screen
- [Added] Combined Student and User attendance summary search page
- [Changed] AttendanceClass to Hooks
- [Added] Code commenting to standardise
- [Added] Security validation in AttendanceView
- [Changed] AttendanceSummary to Hooks
- [Added] Links to attendance in summary
- [Changed] Admin functions to Hooks
- [Added] New file and structure to manage roles and status
- [Added] Better error handling on front-end
- [Removed] Console.log dev messages in front-end
- [Added] .env usage in front-end
- [Fixed] Memory leak issue
- [Added] Auto API calls cancellation to prevent memory leak
- [Added] Better URI redirects if the ID is invalid

## [v0.6.0-beta](https://github.com/rootkie/react-express-js-upstars/tree/v0.6.0-beta) (March 9, 2019, 4.55pm)
- [Changed] DB Schemas for User and Student
- [Changed] Better readability in AuthController
- [Changed] Utils.js to match new schemas
- [Changed] AuthController code
- [Changed] UserController code
- [Changed] StudentController
- [Changed] ClassController
- [Changed] AttendanceController
- [Changed] AdminController
- [Changed] StatisticsController
- [Added] Pre 'save' and 'update' hooks to increment version
- [Removed] Filter of timestamps and versioning
- [Changed] Dump files to match new schemas
- [Changed] AuthController tests to fit new APIs
- [Removed] Strict option in few files
- [Fixed] Mongoose Deprecation warnings by changing updates
- [Changed] Class e2e tests
- [Fixed] Mongoose exclusion and inclusion errors
- [Changed] User API tests
- [Added] Jest-circus package
- [Fixed] BeforeAll() running in only mode by changing from Jasmine2 to jest-circus
- [Changed] Student API tests
- [Changed] Attendance API tests
- [Fixed] Attendance moment.js issues
- [Changed] Stats and Misc tests
- [Fixed] Class Cloning spread operator
- [Added] UserController and StudentController added lean() so that the response are quicker
- [Changed] Revert the code in UserController edit User func
- [Changed] Student and User registration to match new schema
- [Added] New link added to robots.txt
- [Fixed] Grammar issues in registration email
- [Added] Better code documentation
- [Changed] Student Front-end to match the new APIs
- [Fixed] Spelling error in Student Schema
- [Changed] User State to match new schemas
- [Fixed] Async await issue to update user list after deletion
- [Removed] Unnecessary state from StudentForm
- [Changed] ClassEdit for new schema
- [Fixed] ChangeStatus for adding Helper as role
- [Changed] Attendance to suit new schemas
- [Fixed] Redirect to wrong page after deletion of Attendance

## [v0.5.0-beta](https://github.com/rootkie/react-express-js-upstars/tree/v0.5.0-beta) (February 8, 2019, 5.20pm)
- [Trial] React Hooks in v.16.7.0-alpha2
- [Changed] Classes to React functional components in StudentRegister
- [Added] React Hooks for useReducer to mimick Redux without boilerplate
- [Removed] Individual error pages
- [Added] Single Error Page with props
- [Changed] Route function from component to render
- [Changed] Classes are changed to functions for Main related pages.
- [Changed] Moved VolunteerRegistration to hooks
- [Changed] UI for better sign up experience
- [Changed] File Structures to break up functions to smaller ones.
- [Changed] SideMenu
- [Changed] Login to React Hooks
- [Removed] Unnecessary filler page
- [Fixed] ReCaptcha validation issue on server for Student and User Registration purposes
- [Changed] Backend tests for the various APIs changed
- [Added] More env variables to suit new code changes
- [Reverted] ReCaptcha validation to clicking on terms , not accepting
- [Fixed] User directed wrong page when timeout in register
- [Changed] Hooks for EmailVerify.js
- [Changed] ForgetPass to Hooks
- [Changed] ResetPass to Hooks
- [Fixed] Mongoose Deprecation issues and warnings
- [Added] APIs for class cloning and overall stats
- [Added] Backend tests for these 2 APIs
- [Fixed] Basic Mongoose ID validation
- [Added] Home page
- [Hooks] #71 (Home Page)
- [Added] Privacy policies to T&C
- [Edited] Move function blocks out from main block
- [Fixed] React Recaptcha timeout after submit
- [Changed] Files organisation
- [Added] Send email verification link
- [Fixed] Fixed #74
- [Changed] MainCtrl.js to Hooks
- [Changed] All routes to be clearer
- [Added] ErrorPage link to every wrapper

## [v0.4.0-beta](https://github.com/rootkie/react-express-js-upstars/tree/v0.4.0-beta) (December 15, 2018, 2.33pm)
- [Changed] Update process is changed so that mongoose validation works properly
- [Added] Stricter schema validation in Users and Students
- [Removed] Unnecessary responses from API calls
- [Changed] Backend tests
- [Removed] Success: true from most API responses
- [Bumped] Version to 0.4.0beta
- [Changed] Backend tests are edited to fit new API calls
- [Changed] Standardisation of UP Stars instead of UPStars
- [Added] Optimisation to multiple APIs involving queries
- [Added] Indexing to important fields used regularly
- [Removed] Unnecessary function in Users Model.
- [Fixed] Mailing issues

## [v0.3.1-beta](https://github.com/rootkie/react-express-js-upstars/tree/v0.3.1-beta) (November 11, 2018, 4.03pm)
- [Security] Standardised wrong email / password response
- [Feature] Utilised .env for security considerations, allowing different configurations on different machines
- [Added] Files for integration and unit testing
- [Trial] Cut down on CORS headers to reduce bandwidth
- [Added] AuthController.test.js
- [Added] More .env variables for security purposes
- [Changed] MongoDB dumps for new test data
- [Fixed] Debug mode now toggles properly
- [Security] Changed expiry of refresh tokens from 1000d to 90d
- [Added] Emails sent to user after initating a successful passwd change
- [Security] Prompt user to login despite having correct access token but wrong refresh tokens
- [Temp] Added Captcha bypass in debug mode under certain circumstances
- [Fixed] Clean up some unncessary code in AuthController
- [Added] Tests for check, register, login, verifyEmail and refresh
- [Added] More process.env variables
- [Changed] Debug to NODE_ENV
- [Fixed] Better coding practices
- [Tests] More testing features
- [Added] Routed emails to ethereal.mail for development
- [Removed] Multiple tests files for backend and combined
- [Reason] Integration testing requires serial tests only possible in a single file
- [Removed] BASE_URL in .env because front-end don't support env
- [Bump] Version no. to v0.3.1-beta
- [Clean] Jest config file to check wildcard tests
- [Removed] Only allow headers to hold x-access-token
- [Removed] External-personnel is officially deprecated
- [Changed] README.md for tests
- [Added] Class API e2e testing
- [Improved] Better comments for reference
- [Added] User based API e2e tests
- [Fixed] UserController getUser returns more params for front-end
- [Fixed] Security allowing only admin to edit admin fields
- [Added] e2e test for student related api
- [Fixed] Errors response if adding students to non existent class
- [Trial] Captcha bypass in development mode for student
- [Added] E2E tests on attendance APIs
- [Changed] Status code returns for creation
- [Fixed] Dates timing due to regional difference affects comparison
- [Changed] Better attendance code documentation
- [Remove] Unimportant functions like dateFormat
- [Added] Native command line function to reset DB back after the whole backend test

## [v0.3.0-beta](https://github.com/rootkie/react-express-js-upstars/tree/v0.3.0-beta) (September 15, 2018, 3.15pm)
- [Fixed] Image stretching that only occur in chrome (logo)
- [Added] New dependencies for production
- [Changed] Files structure of test folders
- [Fixed] Wrong routing path after student adding
- [Fixed] Did not send in CaptchaCode
- [Trial] An alternative to componentWillReceiveProps
- [Warning] Deprecated function (componentWillReceiveProps) fixed under trial
- [Fixed] Main page JS warnings
- [Changed] Better UX for EmailVerify page
- [Fixed] Re-render of student status after editing
- [Fixed] Did not include name of FSC to DB (studentEdit)
- [Fixed] Mongoose data processing
- [Added] UX to allow users know what error is thrown
- [Fixed] Bugs on button actions
- [Feature] New dropdown for easy selection of dates
- [Fixed] Axios returns proper details
- [Fixed] Showing proper status after adding classes
- [Fixed] Notify users about status of class, student or user
- [Added] MongoDB dump for testing purpose

## [v0.2.1-beta](https://github.com/rootkie/react-express-js-upstars/tree/v0.2.1-beta) (August 16, 2018, 7.50pm)
-[Fixed] Urgent Hot-Fix for wrong backend API URI

## [v0.2.0-beta](https://github.com/rootkie/react-express-js-upstars/tree/v0.2.0-beta) (August 16, 2018, 7.38pm)
- [Added] Empty Responses Handling from back-end using custom front-end handling for all of the services
- [Changed] Removed Real-time API from Admin Change Status due to performance considerations and practicality
- [Changed] Version numbers

## [v0.1.0-beta](https://github.com/rootkie/react-express-js-upstars/tree/v0.1.0-beta) (August 13, 2018, 9.32pm)
- [Fixed] Redirect issue when user tries to access /dashboard when not authenticated shows a blank screen instead of login page
- [Added] APIs for Student, Volunteer and Admin to allow for real time search to ease front-end load in production
- [Fixed] Attendance search filter not working as intended fixed
- [Fixed] Admin Change Status setState fixed to show correct data
- [Temp] Real-time API for Admin dashboard in review of performance issues and scalability

## [v0.1.1-alpha1](https://github.com/rootkie/react-express-js-upstars/tree/v0.1.1-alpha1) (July 29, 2018, 5.00pm)
- [Fixed] Sitemap internal react route parsing changed to express routing so the sitemap file can render properly by Nginx
- [Removed] GUIDE.md is removed because it does not apply anymore as we move towards Beta testing
- [Added] Preparing for the first beta release soon
- [Fixed] README.md image centered and wording made prettier.. =)

## [v0.1.0-alpha1](https://github.com/rootkie/react-express-js-upstars/tree/v0.1.0-alpha1) (July 25, 2018, 8.07pm)

- [Changed] Routes are fixed especially with the issue with the main page routing history etc
- [Changed] Front landing page to fit the overall simplistic theme instead of the older design
- [Added] Robots and Sitemap files for future SEO
- [Changed] Both registration pages so that it is less confusing during sign up
- [Fixed] Mobile support throughout the web-application (including the Dashboard)
- [Fixed, temp] Datepicker issues due to firefox CSS parsing errors that prevent the (x) ClearAll button to work, thus removed
- [Fixed] Comply with React requirements to have key values in arrays and resolved all errors shown in Console

## [v0.0.1-alpha3](https://github.com/rootkie/react-express-js-upstars/tree/v0.0.1-alpha3) (June 12, 2018, 8.43pm) 

- [Fixed] Security flaw in which users are provided login token before their emails are verified

## [v0.0.1-alpha2](https://github.com/rootkie/react-express-js-upstars/tree/v0.0.1-alpha.2) (June 11, 2018, 8.44pm)

- [Added] Backend santising of response data to the front end to protect data and security
- [Fixed] Issues that excessive backend santising led to issues with front end dependence on the response data.

## [v0.0.1-alpha1](https://github.com/rootkie/react-express-js-upstars/tree/v0.0.1-alpha.1) (June 11, 2018, 7:46pm)

- [Official Launch] Initial MVP release of the UPStars project.