# Change Log

## [v0.1.0-beta](https://github.com/rootkie/react-express-js-upstars/tree/0.1.0-beta) (August 13, 2018, 9.32pm)
- [Fixed] Redirect issue when user tries to access /dashboard when not authenticated shows a blank screen instead of login page
- [Added] APIs for Student, Volunteer and Admin to allow for real time search to ease front-end load in production
- [Fixed] Attendance search filter not working as intended fixed
- [Fixed] Admin Change Status setState fixed to show correct data
- [Temp] Real-time API for Admin dashboard in review of performance issues and scalability

## [v0.1.1-alpha1](https://github.com/rootkie/react-express-js-upstars/tree/0.1.1-alpha1) (July 29, 2018, 5.00pm)
- [Fixed] Sitemap internal react route parsing changed to express routing so the sitemap file can render properly by Nginx
- [Removed] GUIDE.md is removed because it does not apply anymore as we move towards Beta testing
- [Added] Preparing for the first beta release soon
- [Fixed] README.md image centered and wording made prettier.. =)

## [v0.1.0-alpha1](https://github.com/rootkie/react-express-js-upstars/tree/0.1.0-alpha1) (July 25, 2018, 8.07pm)

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