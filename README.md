# PostgreSQL Manager

## Aim
I currently use PgAdmin for most postgresql management needs, but in spite of the major respect I have for the good folks behind that project I do want something a little different, so this is an attempt at coming up with a more agile tool focused on a very small set of features.

## Roadmap
The project is in its infant state and things will probably change or just die out, but so far at least this is the plan:

1. Minimal usability

	1. Have a [login](https://github.com/purefan/vogula/tree/feature/log-in) screen
	2. [Manage database servers](https://github.com/purefan/vogula/tree/feature/manage-db-servers): create, update and delete
	3. [Handle connections](https://github.com/purefan/vogula/tree/feature/handle-connections) - be able to connect/disconnect
	4. Be able to [work on a selected DB Server](https://github.com/purefan/vogula/tree/feature/dbserver-view): manage users, constraints, tables, schemas, databases, issue arbitrary sql queries...

2. Extended usability

	1. SQL linter
	2. Save/Load snippets
	3. Theming - Be able to load css 

## How to help
First, thank you for your interest in this project. In the current state develpoment is very needed, we are only building the basic functionality, this means we need to write code and tests, so the best way to get started is to fork the project and work towards one of the features listed above. Please be sure to issue your pull requests against the appropriate branch. We also have a [gitter channel](https://gitter.im/vogula/Lobby) where we discuss all things related to Vogula

If you would like more features please use the issues feature for this project
