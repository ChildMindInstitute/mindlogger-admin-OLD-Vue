# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

## [0.17.8] - 2022-06-24
- Fixed option image width

## [0.17.7] - 2022-06-22
- Fix individual scheduling with csv import
- Fix overlap issues in event modal
- Fix activity end time

## [0.17.6] - 2022-06-21
- Added acceptable files for CSV import

## [0.17.5] - 2022-06-19
- Fix issues on import template

## [0.17.4] - 2022-06-16
- Fix activity names in scheduling import
- 
## [0.17.3] - 2022-06-15
- Fixed import schedule modal

## [0.17.2] - 2022-06-07
- Built csv validation messages

## [0.17.1] - 2022-05-30
- Implement csv import for scheduling

## [0.17.0] - 2022-06-06
New Features:
- Welcome Applet: All accounts will now always have a Welcome applet shown on their device that contains almost all of the features MindLogger offers 
- Cognitive Tasks: Flanker, CST, and A/B Trails activities can be added to applets via the applet builder or to the applet library. CST Gyroscope for Android devices is still being created and should not be used for research purposes 
- Arbitrary Server: We now support GCP and Azure servers when connecting with our arbitrary server feature
- User Journey Export: The first version of our user journey timestamps export is available when exporting response data 
- CST Editor: Editors can configure a CST activity within their activity 

Improvements:
- Flanker:
The threshold to pass is updated to 75% 
- CST Updates:
The slope calculation was updated to decrement the slope 
Reset parameters at the end of the activity have been removed 
- Reporting Update:
"Your child's score" was removed from the report PDF and replaced with Score 

Bug Fixes:
- Transparent Images: Transparent images remain transparent when adding them to items in the applet builder
- Remove a user from an applet and data disappears: This has been fixed so that removing a user is only removing access and not data. The data missing previously from those accounts should be present now. 

## [0.16.1] - 2022-05-18
- Fix variable name in cumulative score title

## [0.16.0] - 2022-05-9
New Features:
- One Page Assessment: Editors now have the ability to create a web-based assessment that will show all items on one page versus one item at a time 
- Terms of Service: Terms of Service have been added to MindLogger on sign up 

Improvements:
- CST: Acceleration of the stimulus has been fixed 
- Share all Report Button: Now if the share all report button is present, the share report for the activity's report is hidden 
- Slider Tick Marks and Labels: Now the editor can configure tick marks and labels independently when creating an assessment 
- Epoch Time in data export: Epoch is now shown as time in seconds with millisecond precision 
- Flanker Initial Delay: The initial loading delay on Flanker has been removed 

Bug Fixes:
- Editing Applets Bug: Editing 15 or more items when updating an applet is fixed so the editor should be able to make as many updates as required and save still function as expected 
- Free Text Response: The editor can set a character limit and it saves correctly now 
- Drag and Drop Feature: Editors should be able to drag and scroll when reordering activities or items 

## [0.15.3] - 2022-04-20
- Update password validation

## [0.15.2] - 2022-04-11
- Fix ratio of splash image

## [0.15.1] - 2022-03-14
- Built password enhancement in registration

## [0.15.0] - 2022-03-10
New Features:
- All Reports at the end of linked activity set: Now editors have the option to show one report with all reports from each linked activity 
- Variable Item: Editors have the ability to set [[VariableName]] within the text editor, response options, or tooltips that will reflect a user's previous response 
- Reordering Activities and Items: Editors can click and drag the order of items and activities within the applet builder 

Improvements:
- Remembering the LSL connection: When live streaming using LSL, the user can not navigate throughout MindLogger while staying connected 

## [0.14.0] - 2022-02-12
New Features:
- TokenLogger: A new version of TokenLogger was released with a brand new look! Behaviors are now tracked in a prospective or retrospective way with the ability to add additional information about the time of the behavior and impairment or distress during the behavior. The data visualizations have also been updated and are more interactive than before.
- [Nickname]: Editors have the ability to set a user’s nickname and create markdown content using [Nickname] which will autofill the user’s nickname in the mobile app or web app
- [Time_Activity_Last_Completed]: Editors can set [time_activity_last_completed] 
- TokenLogger Report: Admins are able to export a report and add custom text to the document before creating a PDF
 
Improvements:
- Item Color Palettes: Additional sets of colors were added as options
- Updates to the Invitation email and its landing page: The copy and layout was updated on the email the user receives and the website where the user accepts the invitation 
- Draw Coordinates on tablets: There was a delay in collecting coordinates on tablets that was resolved in this release. 

Bug Fixes:
- Draw Coordinates: The Draw canvas was updated to flip the Y-axis. The canvas is always on a 100pt scale regardless of the size of the device screen and negative values are no longer shown in the export.

## [0.13.2] - 2022-02-02
- Fixed nickName column for managers

## [0.13.1] - 2022-01-19
- Flipped Y coordiantes in A/B trails and drawing

## [0.13.0] - 2022-01-18
Improvements:
- Flanker 
  * The name was changed to Flanker_360
  * User’s instructions were updated 
  * The data export was updated with better column headers and stimulus types 
- Stability Tracker 
  * The name of the Stability tracker activites were updated
  * Lambda scope was updated to 20
  * 15 second off target crash was removed 
- A/B Trails 
  * The names of the A/B Trails activities were updated: 
  * Instructions were updated with “You will take a pen” and instead of instructions playing like a video, the user clicks the next button between each sentence. 
  * The green around starting points is removed when the user starts 
  * When the user makes a mistake, the error is shown in less time 
  * Updates to the data export to align stimulus locations and user input were completed 
- Coordinate Updates: Coordinates that are collected for the draw and cognitive activities were updated 
- Export Column Names: The names were updated to use snake_case

## [0.12.3] - 2022-01-15
- Fix data export in A/B Trails

## [0.12.2] - 2021-12-14
Fixed weekly tick labels
Displayed UTC time notice

## [0.12.1] - 2021-12-10
Fixed styling issues on safari and ios

## [0.12.0] - 2021-12-22
Release to Production - Milestone 10

New Features:
- Cognitive tasks: Admins now have stability tracker, a/b trails and flanker to use as activities within an applet. 

Improvements:
- CMI Branding: Child Mind Insitute branding was updated through the different MindLogger platforms 
- Daisy Chain on Webapp: This feature  works on webapp now. Originally the feature was mobile-only 

Bug Fixes:
- Duplicating items: When items are copied in the applet builder, intermittently, those items would have text randomly change 
- Edit Button: Intermittently the edit button was not clickable
- Special Characters in item titles: Using special characters in item titles caused some bugs with special applets 

## [0.11.2] - 2021-12-01
Add a new modal for incorrect editing access

## [0.11.1] - 2021-11-26
Fix padding on PDF report

## [0.11.0] - 2021-11-25
Release to Production - Milestone 9

Improvements:
- Splash screen is included in PDF Report: If an editor uploads a splash screen to an activity with a cumulative score item, then the splash screen is shown as the first page on the PDF export 
- Applet Logo is shown on PDF Report: If an editor has uploaded an applet image, then that image is shown on the PDF report for a cumulative score 
- Cumulative Score Screen Updated: The design of the cumulative score screen was made more simplistic 

Bug Fixes:
- Duplicating an Applet: A new password is required when duplicating an applet 


## [0.10.8] - 2021-11-20
- Fix full splash images

## [0.10.7] - 2021-11-18
- Fix font-size on footer

## [0.10.6] - 2021-11-18
- Fix broken layout with multiple splash screens

## [0.10.5] - 2021-11-17
- Fix divider line issues

## [0.10.4] - 2021-11-12
- Swap applet logo for splash screen

## [0.10.3] - 2021-11-10
- Added applet image and splash screen for each activity

## [0.10.2] - 2021-11-2
- Fix splash screen on PDF export

## [0.10.1] - 2021-11-1
- Fix PDF export issues

## [0.10.0] - 2021-10-26
Release to Production - Milestone 8

New Features :
- Timer for Items :  Editors can now set timers that only allow the user to complete an item in X seconds before the user is navigated forward 
- Show/ Hide Activity, Items or Response Options : Editors can now show and hide items without having to delete and recreate. 	

Improvements:
- User’s actions : We are collecting the movement of the user through an activity and recording button taps
- Configure Back and Undo Button : On some items in the applet builder, the editor can remove the ability for the user to have the back and undo buttons 
- Draw Navigation Controls : The draw controls can be configured to move to the top of the screen 

Bug Fixes:
- Taps on the drawing canvas : The drawing canvas now shows taps from the user

## [0.9.2] - 2021-10-20
- Fix filtering secretIDs
- Fix checkbox widget in assessment tab

## [0.9.1] - 2021-09-29
- Fix building applet label

## [0.9.0] - 2021-09-23
Release to Production
- Cumulative Score in Data Visualization
- Reviewer Dashboard
- Cumulative Score PDF Export
- Draw Item updates
- Bug Fixes

## [0.8.1] - 2021-09-01
- Update configure applet label

## [0.7.6] - 2021-08-12
- Fix duplicated token chart after applet changes

## [0.7.5] - 2021-08-05
- Fix token chart issues

## [0.7.4] - 2021-08-03
- Fix X axis ticks

## [0.7.3] - 2021-07-19
- Fix invitation link in pending table

## [0.7.2] - 2021-07-19
- Add lazy loader for exporting response data

## [0.7.0] - 2021-07-15
- Prod Release

## [0.6.23] - 2021-06-26
- Fix response chart on admin dashboard 

## [0.6.22] - 2021-06-23
- Fix invite confirmation
- Fix transfering ownership for managers and editors

## [0.6.21] - 2021-06-17
- Added start and end times

## [0.6.20] - 2021-06-10
- Fixed week height on calendar

## [0.6.19] - 2021-06-06
- Fixed image width and height for items

## [0.6.18] - 2021-05-25
- Fixed idle time setup

## [0.6.17] - 2021-05-02
- Fixed env for applet library

## [0.6.16] - 2021-04-27

## [0.6.15] - 2021-04-27
- Fixed idle timer input
- Fixed Github url validation

## [0.6.13] - 2021-04-22
- Integrate applet library

## [0.6.12] - 2021-04-23
- Add applet url validation
- Modified clickable area in calendar settings

# [0.6.11] - 2021-04-23
- Modify folder delete
- Fix UI issues on calendar and data vis
- Modified frequency graph

## [0.6.10] - 2021-04-09
- Fix frequency tab

## [0.6.9] - 2021-04-06
- Add missed schema version

## [0.6.8] - 2021-04-04
- Update UI for new calendar settings

## [0.6.7] - 2021-03-31
- Added frequency tab

## [0.6.6] - 2021-03-28
- Fixed tick space for time picker items

## [0.6.6] - 2021-03-28
- Update scheduling/notification settings

## [0.6.5] - 2021-03-25
- Updated response graph
- Fixed time range and tick issues

## [0.6.4] - 2021-03-23
- Remove item name

## [0.6.3] - 2021-03-22
- Fix localization issue

## [0.6.2] - 2021-03-22
- Modified text entry table

## [0.6.1] - 2021-03-24
- Production Release!

## [0.5.40] - 2021-03-21
- Build graph for time responses

## [0.5.39] - 2021-03-18
- Fix localization issue

## [0.5.38] - 2021-03-16
- Fix response tab

## [0.5.37] - 2021-03-15
- Fix response tab

## [0.5.36] - 2021-03-14
- Build response data table for free text items

## [0.5.35] - 2021-03-11
- Add weekday repeat option

## [0.5.33] - 2021-03-04
- Add weekday repeat option

## [0.5.32] - 2021-02-04
- Updated getSchedule api endpoints

## [0.5.31] - 2021-02-04
- Updated api endpoints for app optimization

## [0.5.30] - 2021-02-17
- Fixed undefined events

## [0.5.29] - 2021-02-17
- Fixed header overflow

## [0.5.28] - 2021-02-17
- Fixed reminder settings

## [0.5.27] - 2021-02-16
- Resolved dashboard tabs
- Resolved input type for reminder day

## [0.5.26] - 2021-02-16
- Modified line thickness

## [0.5.25] - 2021-02-13
- Fixed edit roles dialog

## [0.5.24] - 2021-02-14
- Resolved tab switching
- Resolved removing events

## [0.5.23] - 2021-02-13
- Fixed pin button in applet list

## [0.5.22] - 2021-02-13
- Fixed table footer on applet tab

## [0.5.20] - 2021-02-11
- Fixed table footer on applet tab
- Fix user tabs in userList page

## [0.5.19] - 2021-02-08
- Fix hidden applet tab
- Added reminder in scheduling modal
- Fixed account name on invitation info

## [0.5.18] - 2021-02-02
- Fix hidden applet tab

## [0.5.17] - 2021-01-30
- Hide tabs that contain no data

## [0.5.16] - 2021-01-30
- Fix the position of versions

## [0.5.15] - 2021-01-29
- Fixed items with no response options

## [0.5.14] - 2021-01-28
- Displayed multi token values in a token chart

## [0.5.13] - 2021-01-28
- Fixed long applet name
- Fixed empty field in event card

## [0.5.12] - 2021-01-26
- Fixed total amount of token

## [0.5.11] - 2021-01-26
- Fixed duplicated versions

## [0.5.10] - 2021-01-23
- Lastest => Latest

## [0.5.9] - 2021-01-21
- Remove "Event Details" text and replace with "Activity Access Options"
- Calendar in header's tooltip should be "View General Calendar"
- The Titles of the calendar are not updated correctly to show general vs individual

## [0.5.8] - 2021-01-20
- Remove "Showing data from" text
- Show version number on each side of version bar (ex: 0.01 | 0.02) on graphs
- Remove "Show Version Changes" on/off checkbox and always show version bars
- Show "Version text in line with the drop-down
- Show summary line in line with the response option lines
- Update text when Token data is not available to " No token data available for this activity"
- Applets that have not collected any data yet from the user should read "No data available to show yet"
- If there is only one activity, remove the expand all option

## [0.5.7] - 2021-01-11
- Fix status of data availability

## [0.5.6] - 2021-01-12
- Fixed timeout option

## [0.5.5] - 2021-01-11
- Allowed timeout option on timed activity

## [0.5.4] - 2021-01-08
- Fixed state variables

## [0.5.3] - 2021-01-05
- Fixed state variables
- Fixed response data

## [0.5.2] - 2020-1-4
- Fixed styles on version bar

## [0.5.1] - 2020-1-4
- Admin Dashboard New Design

## [0.4.5] - 2020-12-30
- Align filtering dates
- Fix the position of version bar option

## [0.4.4] - 2020-12-23
- Data vis design updates [Redesign]
- Add timed activity [Redesign]
- Implement ellipsis for long text [Redesign]

## [0.4.3] = 2020-12-18
- Removed second on timed activity

## [0.4.2] = 2020-12-07
- Fixed token and version bar width

## [0.4.1] = 2020-11-24
- Added timed activity

## [0.3.51] = 2020-11-20
- Removed owner role in invitation form

## [0.3.50] = 2020-11-17
- Fix sessionStorage issue on Firefox

## [0.3.49] = 2020-11-07
- update forgot password functionality to send lang field to backend

## [0.3.48] = 2020-11-04
- Show a confirmation dialog when deleting an applet

## [0.3.47] = 2020-11-04
- update "Skip" option language

## [0.3.46] = 2020-11-04
- Minor fixes for saved templates

## [0.3.45] = 2020-11-02
- Add more translations

## [0.3.44] = 2020-11-02
- Fixed issues on navigation failing

## [0.3.43] = 2020-11-02
- fix scheduling for applets created by builder
- Fixed an issue with route params

## [0.3.42] = 2020-11-02
- updated strategy for showing view dashboard button

## [0.3.41] = 2020-11-01
- Fixed scheduling settings
- Fixed All day option
- Set version bar off

## [0.3.40] = 2020-10-30
- fix language being reset after the page is reloaded

## [0.3.39] = 2020-10-30
- update store after prepare applet for editing

## [0.3.38] = 2020-10-30
- fix user data export format

## [0.3.37] = 2020-10-30
- define data as normal function

## [0.3.36] = 2020-10-29
- allow the language to be defined in the URL

## [0.3.35] = 2020-10-29
- fix applet naming for duplicated applets

## [0.3.34] = 2020-10-29
- show reviewer dashboard as user's timezone

## [0.3.33] = 2020-10-23
- insert option to show/hide version bars

## [0.3.32] = 2020-10-20
### Changed
- Fix issues related to token value type and response timezone
- Implement template behaviors functionality

## [0.3.31] = 2020-10-19
- fix item parsing issue

## [0.3.30] = 2020-10-15
### Changed
- include response options in user data export format

## [0.3.29] = 2020-10-14
### Changed
- insert version controlling functionality in tokenlogger dashboard

## [0.3.28] = 2020-10-13
### Changed
- Fix TL dashboard to work with accumulative values
- Changed time range for TL chart
- Applet-schema-builder 0.3.1 -> 0.3.3
- Updated dialog styles

## [0.3.28] = 2020-10-12
### Changed
- insert version controlling functionality in tokenlogger dashboard

## [0.3.27] = 2020-10-11
### Changed
- Fix encryption code in Applet#replaceItemValues method 

## [0.3.26] = 2020-10-07
### Changed
- Make tokens cumulative

## [0.3.25] = 2020-10-06
### Changed
- Fix merge conflict

## [0.3.24] = 2020-10-05
### Changed
- Fix labels for the Y axis in the token chart.
- Improve the tooltip to include a detail of every behavior and cumulative value.

## [0.3.23] = 2020-10-03
### Changed
- show status dialog after clicking submit button in transfer ownership dialog
- show about applet builder page when applets are being prepared

## [0.3.22] = 2020-10-01
### Changed
- Add new controls for selecting the focused time range in the dashboard

## [0.3.21] = 2020-10-01
### Changed
- update encryption info for applets created by builder
- update dialog text after creating new applet

## [0.3.20] = 2020-10-01
### Changed
- fixed reviewer role issue

## [0.3.19] = 2020-09-30
### Changed
- Fixed duplicated definition of userData

## [0.3.18] = 2020-09-30
### Changed
- insert edit applet functionality
- fix issues in response encryption

## [0.3.17] = 2020-09-22
### Changed
- Remove duplicated labels in the y-axis of the token chart
- Remove negative values when all the tokens are posive
- Show the current day in the x-axis labels

## [0.3.16] = 2020-09-20
### Changed
- Implemented transferring ownership

## [0.3.15] = 2020-09-17
### Changed
- Embeded monthly eventType
- Added `Only scheduled day` option
- Map MRN to Profile ID in reviewer invites.

## [0.3.14] = 2020-09-16
### Changed
- Disallowed to save empty roles
- Disallowed coordinators to editor organizer roles
- Fixed user roles on ActiveUserTable
- Fixed Backend API url issue
- Removed unnecessary elements

## [0.3.13] = 2020-09-23

### Changed

- update user data export according to new encryption

## [0.3.12] = 2020-09-22

### Changed

- Fixed errors related with exceeded local storage quota
- Fixed 'duplicate' button show/hide by roles

## [0.3.11] = 2020-09-17

### Changed

- Fixed chart legend overflowing container

## [0.3.10] = 2020-09-16

### Changed

- Allow reviewers to access the users page

## [0.3.9] = 2020-09-10

### Changed

- Fixed dashboard chart showing decimal values in y-axis labels
- Fixed y-axis scale. It was changed to include the maximum token value.

## [0.3.8] = 2020-09-14

### Changed

- Fix timezone handling in dashboard

## [0.3.7] = 2020-09-14

- Add support for strings as token values in the dashboard

## [0.3.6] = 2020-09-140

### Changed

- Hide the "Remove User" option for users who are not managers

## [0.3.5] = 2020-09-14

## [0.3.6] = 2020-09-14
### Changed
- Updated the event data to be included `activity_id`

## [0.3.5] = 2020-09-14
### Changed

- Implemented duplicating existing applet
- Implemented exporting user's response data in CSV

## [0.3.4] = 2020-09-06

### Changed

- Implemented managing roles for users
- Allow owners/managers/coordinators/ to remove user roles
- Allow owners/managers/coordinators/ to remove users and data

## [0.3.3] = 2020-09-04

### Changed

- Implemented managing roles for organizers
- Add/remove/update roles
- Add/remove/update userList to be reviewed by reviewer
- Revoke user access to the applet

## [0.3.2] = 2020-09-08

### Changed

- Fixed styles and format for the time range label in the dashboard

## [0.3.1] = 2020-08-26

### Changed

- Updated applet-schema-buider `0.2.5` to `0.2.6`
- Changed MRN to institutional ID

## [0.3.0] = 2020-08-25

### Changed

- Added extended Time for allowing past due activity

## [0.2.12] = 2020-08-31

### Changed

- Fixed the time selector position and size after resizing the dashboard
- Dashboard chart enforces a time window of one week

## [0.2.11] = 2020-08-20

### Changed

- Update applet-schema-buider `0.2.4` to `0.2.5`

## [0.2.10] = 2020-08-13

### Changed

- Handle users with multiple roles

## [0.2.9] = 2020-08-9

### Changed

- Fix editor role to be able to view applets

## [0.2.8] = 2020-08-06

### Changed

- Fix coordinator role in user invitation

## [0.2.7] = 2020-7-27

### Changed

- fix event caching issue

## [0.2.6] = 2020-07-27

### Changed

- make users access applet-builder after login

## [0.2.5] = 2020-07-27

### Changed

- api param for GET^applet/[:id]

## [0.2.4] = 2020-07-28

### Changed

- Fix duplicated event card
- `applet-schema-builder` 0.2.2 -> 0.2.4

## [0.2.3] = 2020-07-20

### Changed

- Update cache of applets
- Fix reflected full time events.

## [0.2.2] = 2020-07-20

### Added

- Errors now log to sentry

## [0.2.1] = 2020-07-16

### Changed

- Fixed scheduled event issue on calendar

## [0.2.0] = 2020-07-13

### Changed

- Implemented user role permission

## [0.1.71] = 2020-07-09

### Changed

- notifyIfIncomplete parameter was removed

## [0.1.70] = 2020-07-09

### Changed

- Fixed individual issue on daily view

## [0.1.69] = 2020-07-08

### Changed

- Updated email validation in invitation form

## [0.1.68] = 2020-07-06

### Changed

- Resolved reflected individual schedules

## [0.1.67] = 2020-07-05

### Changed

- Fixed sync issues on Vuex store

## [0.1.66] = 2020-07-01

### Changed

- Fixed MRN field name `mrn` to `MRN`

## [0.1.65] = 2020-06-29

### Changed

- Fixed menu-bar to be refreshed once an account is selected

## [0.1.64] = 2020-06-27

### Changed

- Fixed the cache issue for selected users

## [0.1.63] = 2020-06-23

### Changed

- Implemented account owner role
- Rebuilt tests for account owner role

## [0.1.62] = 2020-06-20

### Changed

- Updated calendar to be opened on the day it is

## [0.1.61] = 2020-06-15

### Changed

- Fixed One-time completion and UI issues

## [0.1.60] = 2020-06-03

### Changed

- Updated UI elements and theme on event-dialog

## [0.1.59] = 2020-06-02

### Changed

- `applet-schema-builer 0.2.0` to `applet-schema-builer 0.2.1`
- Updated creating invitation form
- Resolved backend server URL and Fixed #192
- Implemented updates to reproschema

## [0.1.58] = 2020-05-27

### Changed

- protocol-builder 0.1 -> applet-schema-builer 0.2
- Updated pending invitations table with changed columns
- Rebuilt applet JSON data structure to load and cach raw JSON reproschema

## [0.1.57] = 2020-05-27

### Changed

- Implement One-time completion on event card

## [0.1.56] = 2020-05-27

- set server window removed
- introduce new deployment to s3 bucket and travisCI

## [0.1.55] = 2020-05-26

- idle_time field added to event

## [0.1.54] = 2020-05-19

### Changed

- Disabled email validation just for now

## [0.1.53] = 2020-05-14

### Changed

- Rebuilt user signin and signup
- Implemented forgotPassword
- Rebuilt invitationFrom
- Added updated API endpoints
- Modified addNewApplet
- Updated pending table to show the entire invitation link
- Added Mindlogger testing server `https://testing.mindlogger.org/api/v1`
- Implemented validation for login, sign up and forgetPassword

## [0.1.52] = 2020-05-06

### Changed

- Add timeout form validation functions

## [0.1.51] = 2020-05-06

### Changed

- Build `CalenderEventPlaceholder` component
- Fixed events stack issue on calendar

## [0.1.50] = 2020-5-4

### Changed

- Change confirmation text on applet upload
- Allow unauthenticated users to view builder

## [0.1.49] = 2020-4-30

### Changed

- `get_all_events` to `getAllEvents`

## [0.1.48] = 2020-4-29

### Changed

- Fixed issues on filtering `ScheduleS`

## [0.1.47] = 2020-4-28

### Changed

- Implemented updated API endpoint `getSchedule`

## [0.1.46] = 2020-4-27

### Changed

- Updated confirm dialog
- Fixed checkbox issue to be work correctly

## [0.1.45] = 2020-4-27

### Changed

- Add tooltips with short descriptions to some buttons

## [0.1.44] = 2020-4-23

### Changed

- Switch from local storage to session storage
- Add nonzero timeout validation to event

## [0.1.43] = 2020-4-22

### Changed

- Modify `setAllApplets` mutation to prevent saving items

## [0.1.42] = 2020-4-21

### Changed

- Updated 'LocalStoarge' to 'Persisted State'
- Fixed notificationId issue to be sent correctly

## [0.1.41] = 2020-4-18

### Changed

- Change UI of components in `src/Components/Authentication/` to better follow Material Design principles

## [0.1.40] = 2020-4-12

### Changed

- add `vuex-persistedstate` to store state on refresh
- spread 'steps' across routes with `vue-router`
  - add authentication rules for each route
- add app bar to entire app, minor other UI changes

## [0.1.39] = 2020-4-9

### Changed

- protocol-builder 0.1.18 -> 0.1.20

## [0.1.38] = 2020-4-7

### Changed

- Added 6 more unit tests for vuex mutations

## [0.1.37] = 2020-4-6

### Changed

- Added code coverage reporting in `jest.config.js`
- Modified Travis build for unit test reporting

## [0.1.35] = 2020-3-31

### Changed

- Added notification id on scheduling data

## [0.1.34] = 2020-3-29

### Changed

- Changed request for refreshing applets

## [0.1.33] = 2020-3-28

### Changed

- Showed endtime on event card

## [0.1.32] = 2020-3-28

### Changed

- Added notification_id on scheduling data

## [0.1.31] = 2020-3-22

### Changed

- add `vue-test-utils` as dependency
- update `babel-core` to 7.0.0-0
- create unit test for `setBackend` vuex mutation
- add npm command `test:unit` to trigger unit tests

## [0.1.30] = 2020-3-24

### Changed

- Updated scheduling request
- Added an option for timeout
- Added validation for timeout

## [0.1.29] = 2020-3-22

### Changed

- protocol-builder 0.1.14 -> 0.1.18
- render protocol-builder version # on `v-toolbar`

## [0.1.28] = 2020-3-21

### Changed

- Updated scheduling on calendar

## [0.1.27] = 2020-3-17

### Changed

- Changed ag-grid theme to `ag-theme-balham`
- Removed padding from grid container style

## [0.1.26] = 2020-3-13

### Changed

- Finished individual schedules.
- Allow activity timeout with the access before scheduled time.

## [0.1.25] = 2020-3-10

### Changed

- Finished general scheduling.
- Updated active users list to be selectable.

## [0.1.24] = 2020-3-12

### Changed

- protocol-builder 0.1.13 -> 0.1.14

## [0.1.23] = 2020-3-9

### Changed

- protocol-builder 0.1.12 -> 0.1.13
- Restored Travis' `node_modules` caching

## [0.1.22] = 2020-3-5

### Changed

- Updated all node dependencies
- Removed caching from Travis to fix Vuetify build

## [0.1.21] = 2020-2-19

### Changed

- Updated calendar width and border style

## [0.1.20] = 2020-2-18

### Changed

- Changed `v-app` background color
- Added border style to `ds-calendar`

## [0.1.19] = 2020-2-18

### Changed

- Add and update CalendarEvent component
- Fix calendar entries stack
- Sort calendar entries in order of priority
- Leave a space between entries

## [0.1.18] = 2020-2-17

### Changed

- Add `babel-plugin-transform-remove-console` as a `devDependency`
- Remove console statements when `process.env.NODE_ENV === 'production'`

## [0.1.17] = 2020-2-15

### Changed

- Added and updated ScheduleSpan component
- Set up properties to refresh calendar when event's changed.

## [0.1.16] = 2020-2-13

### Changed

- Added DayRow Component
- Rebuilt Day component to fix event-drag issues

## [0.1.15] = 2020-2-12

### Changed

- protocol-builder 0.1.11 -> 0.1.12

## [0.1.14] = 2020-2-11

### Changed

- Fixed Calendar entries stack.

## [0.1.13] = 2020-2-9

### Changed

- Fixed Calendar entries to stay on Calendar.
- Implemented localStorage on Calendar.

## [0.1.12] = 2020-2-7

### Changed

- protocol-builder 0.1.9 -> 0.1.11

## [0.1.11] = 2020-2-3

### Changed

- Switched from activity-set-builder 0.1.7 to protocol-builder 0.1.9

## [0.1.10] = 2020-1-31

### Changed

- Fixed blue-card to disappear automatically when users click off

## [0.1.10] = 2020-1-31

### Changed

- Rebuilt calendar and scheduling components
  - Added necessary components
  - Removed unnecessary parts
  - Fixed calenar errors

## [0.1.9] = 2020-1-29

### Changed

- activity-set-builder 0.1.6 -> 0.1.7

## [0.1.8] = 2020-1-23

### Changed

- activity-set-builder 0.1.5 -> 0.1.6

## [0.1.7] - 2020-01-24

## Changed

- :bug: Fixed bug regarding not showing correct activities in schedule page

## [0.1.7] = 2020-1-17

### Changed

- Fix word breaks on `v-card-title`
- Fix JSON rendering on `AppletCard` caused by inconsistent schema

## [0.1.7] - 2020-01-16

## Changed

- :tractor: `PUT /applet/{:id}/constraints` → `PUT /applet/{:id}/schedule`

## [0.1.6] - 2020-01-13

## Changed

- :lock: Authorize coordinators to coordinate applets

## [0.1.5] - 2019-12-23

### Changed

- Updated core dependencies
  - Vue 2.6.10
  - Vuetify 2.1.0
- New calendar, courtesy of dayspan-vuetify-2

## [0.1.4] - 2019-11-26

### Changed

- :sparkles: Overhauled `SetUsers` step to reflect new user model

## [0.1.3] - 2019-11-08

### Changed

- :arrow_up: :ambulance: Fix broken links for "quick add" protocols

## [0.1.2] - 2019.11-08

### Added

- :sparkles: Protocol builder

### Changed

- :arrow_up: Changed `GET /user/{id}/applets` to `GET /user/applets`

## [0.1.1] - 2019-11-06

### Added

- :newspaper: CHANGELOG

### Changed

- :ambulance: :arrow_up: :tractor: :hammer: :art: Renamed `activitySet` to `protocol` to accommodate [upstream changes in **reproschema**](https://github.com/ReproNim/reproschema/pull/277)
- :tractor: Renamed package from "dayspan-vuetify-example" to "mindlogger-admin"

## [0.1.0] - 2019-05-22 ‒ 10-31

- :construction: Draft

[unreleased]: https://github.com/ChildMindInstitute/mindlogger-admin/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/ChildMindInstitute/mindlogger-admin/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/ChildMindInstitute/mindlogger-admin/releases/tag/v0.1.0
