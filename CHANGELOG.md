# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
## [0.1.42] = 2020-4-21
### Changed
- Updated 'LocalStoarge' to 'Persisted State'
- Fixed notificationId issue to be sent correctly

## [0.1.41] = 2020-4-18
### Changed
- Change UI of components in ```src/Components/Authentication/``` to better follow Material Design principles

## [0.1.40] = 2020-4-12
### Changed
- add ```vuex-persistedstate``` to store state on refresh
- spread 'steps' across routes with ```vue-router```
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
- Added code coverage reporting in ```jest.config.js```
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
- add ```vue-test-utils``` as dependency
- update ```babel-core``` to 7.0.0-0
- create unit test for ```setBackend``` vuex mutation
- add npm command ```test:unit``` to trigger unit tests

## [0.1.30] = 2020-3-24
### Changed
- Updated scheduling request
- Added an option for timeout
- Added validation for timeout

## [0.1.29] = 2020-3-22
### Changed
- protocol-builder 0.1.14 -> 0.1.18
- render protocol-builder version # on ```v-toolbar```

## [0.1.28] = 2020-3-21
### Changed
- Updated scheduling on calendar

## [0.1.27] = 2020-3-17
### Changed
- Changed ag-grid theme to ```ag-theme-balham```
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
- Restored Travis' ```node_modules``` caching

## [0.1.22] = 2020-3-5
### Changed
- Updated all node dependencies
- Removed caching from Travis to fix Vuetify build

## [0.1.21] = 2020-2-19
### Changed
- Updated calendar width and border style

## [0.1.20] = 2020-2-18
### Changed
- Changed ```v-app``` background color
- Added border style to ```ds-calendar```

## [0.1.19] = 2020-2-18
### Changed
- Add and update CalendarEvent component
- Fix calendar entries stack
- Sort calendar entries in order of priority
- Leave a space between entries

## [0.1.18] = 2020-2-17
### Changed
- Add ```babel-plugin-transform-remove-console``` as a ```devDependency```
- Remove console statements when ```process.env.NODE_ENV === 'production'```

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
- Fix word breaks on ```v-card-title```
- Fix JSON rendering on ```AppletCard``` caused by inconsistent schema

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
- :sparkles: Overhauled ```SetUsers``` step to reflect new user model

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

[Unreleased]: https://github.com/ChildMindInstitute/mindlogger-admin/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/ChildMindInstitute/mindlogger-admin/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/ChildMindInstitute/mindlogger-admin/releases/tag/v0.1.0
