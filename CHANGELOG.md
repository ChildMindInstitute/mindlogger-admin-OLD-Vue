# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.8] = 2020-1-23
### Changed
- activity-set-builder 0.1.5 -> 0.1.6

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
